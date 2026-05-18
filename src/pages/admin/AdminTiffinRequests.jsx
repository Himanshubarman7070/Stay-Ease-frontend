import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Loading from '../../components/Loading';
import { useToast } from '../../context/ToastContext';
import { tiffinAPI } from '../../services/api';

export default function AdminTiffinRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const load = () => tiffinAPI.getAll().then((r) => setRequests(r.data.data || [])).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await tiffinAPI.updateStatus(id, { status });
      showToast(`Request ${status}`);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed', 'error');
    }
  };

  const activate = async (id) => {
    try {
      await tiffinAPI.activate(id);
      showToast('Plan activated');
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed', 'error');
    }
  };

  const statusBadge = (s) => (s === 'Accepted' ? 'accepted' : s === 'Rejected' ? 'rejected' : 'pending');

  if (loading) return <DashboardLayout><Loading /></DashboardLayout>;

  return (
    <DashboardLayout>
      <header className="page-header">
        <h1>Tiffin Requests</h1>
        <p>Review and approve customer requests</p>
      </header>

      {requests.length === 0 ? (
        <div className="glass-card empty-state">No requests</div>
      ) : (
        <>
          <section className="glass-card table-wrap desktop-table">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Plan</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r._id}>
                    <td>{r.userId?.name}<br /><small>{r.phone}</small></td>
                    <td>{r.planType}</td>
                    <td>{r.duration}</td>
                    <td><span className={`badge badge-${statusBadge(r.status)}`}>{r.status}</span></td>
                    <td>
                      <div className="action-buttons">
                        {r.status === 'Pending' && (
                          <>
                            <button type="button" className="btn btn-primary btn-sm" onClick={() => updateStatus(r._id, 'Accepted')}>Accept</button>
                            <button type="button" className="btn btn-danger btn-sm" onClick={() => updateStatus(r._id, 'Rejected')}>Reject</button>
                          </>
                        )}
                        {r.status === 'Accepted' && !r.isActive && (
                          <button type="button" className="btn btn-outline btn-sm" onClick={() => activate(r._id)}>Activate</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="mobile-card-list">
            {requests.map((r) => (
              <article key={r._id} className="mobile-data-card">
                <p className="card-title">{r.userId?.name}</p>
                <div className="card-row">
                  <span className="card-label">Phone</span>
                  <span className="card-value">{r.phone}</span>
                </div>
                <div className="card-row">
                  <span className="card-label">Plan</span>
                  <span className="card-value">{r.planType} · {r.duration}</span>
                </div>
                <div className="card-row">
                  <span className="card-label">Status</span>
                  <span className={`badge badge-${statusBadge(r.status)}`}>{r.status}</span>
                </div>
                <div className="card-actions">
                  {r.status === 'Pending' && (
                    <>
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => updateStatus(r._id, 'Accepted')}>Accept</button>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => updateStatus(r._id, 'Rejected')}>Reject</button>
                    </>
                  )}
                  {r.status === 'Accepted' && !r.isActive && (
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => activate(r._id)}>Activate Plan</button>
                  )}
                </div>
              </article>
            ))}
          </section>
        </>
      )}
    </DashboardLayout>
  );
}
