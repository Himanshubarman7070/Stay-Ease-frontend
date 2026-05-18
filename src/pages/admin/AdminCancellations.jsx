import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useToast } from '../../context/ToastContext';
import { cancellationAPI } from '../../services/api';

export default function AdminCancellations() {
  const [list, setList] = useState([]);
  const { showToast } = useToast();

  const load = () => cancellationAPI.getAll().then((r) => setList(r.data.data || []));
  useEffect(() => { load(); }, []);

  const update = async (id, status) => {
    try {
      await cancellationAPI.update(id, { status });
      showToast(`Cancellation ${status}`);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed', 'error');
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Cancellation Requests</h1>
      </div>
      <div className="glass-card table-wrap">
        <table className="data-table">
          <thead><tr><th>Customer</th><th>Dates</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {list.map((c) => (
              <tr key={c._id}>
                <td>{c.userId?.name}</td>
                <td>{c.dates?.map((d) => new Date(d).toLocaleDateString()).join(', ')}</td>
                <td>{c.reason}</td>
                <td><span className={`badge badge-${c.status === 'Approved' ? 'accepted' : c.status === 'Rejected' ? 'rejected' : 'pending'}`}>{c.status}</span></td>
                <td>
                  {c.status === 'Pending' && (
                    <>
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => update(c._id, 'Approved')}>Approve</button>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => update(c._id, 'Rejected')}>Reject</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
