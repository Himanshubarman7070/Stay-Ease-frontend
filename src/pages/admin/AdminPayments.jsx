import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Loading from '../../components/Loading';
import { useToast } from '../../context/ToastContext';
import { paymentAPI } from '../../services/api';

export default function AdminPayments() {
  const { showToast } = useToast();
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [payRes, statRes] = await Promise.all([paymentAPI.getAll(), paymentAPI.getStats()]);
      setPayments(payRes.data.data || []);
      setStats(statRes.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await paymentAPI.updateStatus(id, { status });
      showToast(`Payment marked ${status}`);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed', 'error');
    }
  };

  if (loading) return <DashboardLayout><Loading /></DashboardLayout>;

  return (
    <DashboardLayout>
      <header className="page-header">
        <h1>Payment Management</h1>
        <p>Update payment status when customer pays ₹60 per tiffin</p>
      </header>

      <section className="grid-3" style={{ marginBottom: '1.5rem' }}>
        <article className="glass-card stat-card">
          <p className="stat-value">₹{stats?.totalDueAllCustomers ?? 0}</p>
          <p className="stat-label">Total Due (All)</p>
        </article>
        <article className="glass-card stat-card">
          <p className="stat-value">{stats?.pendingPayments ?? 0}</p>
          <p className="stat-label">Pending Approvals</p>
        </article>
        <article className="glass-card stat-card">
          <p className="stat-value">₹{stats?.collectedRevenue ?? 0}</p>
          <p className="stat-label">Collected</p>
        </article>
      </section>

      {payments.length === 0 ? (
        <div className="glass-card empty-state">No payment records yet</div>
      ) : (
        <>
          <section className="glass-card table-wrap desktop-table">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Tiffins</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id}>
                    <td>{p.userId?.name}</td>
                    <td>{new Date(p.paymentDate).toLocaleDateString()}</td>
                    <td>₹{p.amount}</td>
                    <td>{p.tiffinCount}</td>
                    <td>
                      <span className={`badge badge-${p.status === 'Completed' ? 'accepted' : p.status === 'Rejected' ? 'rejected' : 'pending'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      {p.status === 'Pending' && (
                        <div className="action-buttons">
                          <button type="button" className="btn btn-primary btn-sm" onClick={() => updateStatus(p._id, 'Completed')}>Complete</button>
                          <button type="button" className="btn btn-danger btn-sm" onClick={() => updateStatus(p._id, 'Rejected')}>Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="mobile-card-list">
            {payments.map((p) => (
              <article key={p._id} className="mobile-data-card">
                <p className="card-title">{p.userId?.name}</p>
                <div className="card-row">
                  <span className="card-label">Date</span>
                  <span className="card-value">{new Date(p.paymentDate).toLocaleDateString()}</span>
                </div>
                <div className="card-row">
                  <span className="card-label">Amount</span>
                  <span className="card-value">₹{p.amount}</span>
                </div>
                <div className="card-row">
                  <span className="card-label">Tiffins</span>
                  <span className="card-value">{p.tiffinCount}</span>
                </div>
                <div className="card-row">
                  <span className="card-label">Status</span>
                  <span className={`badge badge-${p.status === 'Completed' ? 'accepted' : p.status === 'Rejected' ? 'rejected' : 'pending'}`}>{p.status}</span>
                </div>
                {p.status === 'Pending' && (
                  <div className="card-actions">
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => updateStatus(p._id, 'Completed')}>Complete</button>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => updateStatus(p._id, 'Rejected')}>Reject</button>
                  </div>
                )}
              </article>
            ))}
          </section>
        </>
      )}
    </DashboardLayout>
  );
}
