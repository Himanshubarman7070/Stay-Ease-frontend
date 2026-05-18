import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Loading from '../../components/Loading';
import { tiffinAPI } from '../../services/api';

const statusClass = (s) => {
  if (s === 'Accepted') return 'badge-accepted';
  if (s === 'Rejected') return 'badge-rejected';
  return 'badge-pending';
};

export default function RequestStatus() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tiffinAPI.getMy().then((r) => setRequests(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><Loading /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Request Status</h1>
        <p>Track your tiffin requests</p>
      </div>
      {requests.length === 0 ? (
        <div className="glass-card empty-state">No requests yet</div>
      ) : (
        <div className="glass-card table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Plan</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Active</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r._id}>
                  <td>{r.planType}</td>
                  <td>{r.duration}</td>
                  <td><span className={`badge ${statusClass(r.status)}`}>{r.status}</span></td>
                  <td>{r.isActive ? 'Yes' : 'No'}</td>
                  <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
