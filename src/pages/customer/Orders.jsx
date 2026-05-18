import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Loading from '../../components/Loading';
import { groceryAPI } from '../../services/api';
import { groceryStatusClass } from '../../utils/statusBadge';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => groceryAPI.getMyOrders().then((r) => setOrders(r.data.data || [])).finally(() => setLoading(false));

  useEffect(() => {
    load();
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  if (loading) return <DashboardLayout><Loading /></DashboardLayout>;

  return (
    <DashboardLayout>
      <header className="page-header">
        <h1>My Orders</h1>
        <p>Grocery order history — status updates when admin delivers</p>
      </header>
      {orders.length === 0 ? (
        <div className="glass-card empty-state">No orders yet</div>
      ) : (
        <>
          <section className="glass-card table-wrap desktop-table">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id}>
                    <td>{o.products?.map((p) => `${p.name} x${p.quantity}`).join(', ')}</td>
                    <td>₹{o.totalAmount}</td>
                    <td>
                      <span className={`badge badge-${groceryStatusClass(o.deliveryStatus)}`}>{o.deliveryStatus}</span>
                    </td>
                    <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="mobile-card-list">
            {orders.map((o) => (
              <article key={o._id} className="mobile-data-card">
                <p className="card-title">₹{o.totalAmount}</p>
                <div className="card-row">
                  <span className="card-label">Status</span>
                  <span className={`badge badge-${groceryStatusClass(o.deliveryStatus)}`}>{o.deliveryStatus}</span>
                </div>
                <div className="card-row">
                  <span className="card-label">Date</span>
                  <span className="card-value">{new Date(o.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="card-row">
                  <span className="card-label">Items</span>
                  <span className="card-value">{o.products?.map((p) => `${p.name} x${p.quantity}`).join(', ')}</span>
                </div>
              </article>
            ))}
          </section>
        </>
      )}
    </DashboardLayout>
  );
}
