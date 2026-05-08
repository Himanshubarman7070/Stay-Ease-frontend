import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import Loading from "../../components/Loading";
import { useToast } from "../../context/ToastContext";
import { groceryAPI } from "../../services/api";
import { groceryStatusClass } from "../../utils/statusBadge";

const statuses = [
  "Pending",
  "Processing",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingPaid, setMarkingPaid] = useState(null);
  const { showToast } = useToast();

  const load = () =>
    groceryAPI
      .getAllOrders()
      .then((r) => setOrders(r.data.data || []))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, deliveryStatus) => {
    try {
      await groceryAPI.updateOrderStatus(id, { deliveryStatus });
      showToast("Status updated — customer will see it");
      load();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed", "error");
    }
  };

  const handleMarkPaid = async (id) => {
    setMarkingPaid(id);
    try {
      await groceryAPI.markOrderPaid(id);
      showToast("Order marked as paid");
      load();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed", "error");
    } finally {
      setMarkingPaid(null);
    }
  };

  if (loading)
    return (
      <DashboardLayout>
        <Loading />
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <header className="page-header">
        <h1>Order Management</h1>
        <p>Update grocery delivery status and mark payments</p>
      </header>

      {orders.length === 0 ? (
        <div className="glass-card empty-state">No orders</div>
      ) : (
        <>
          <section className="glass-card table-wrap desktop-table">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Delivery</th>
                  <th>Payment</th>
                  <th>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id}>
                    <td style={{ fontWeight: 500 }}>{o.userId?.name}</td>
                    <td
                      style={{
                        fontSize: "0.82rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {new Date(o.createdAt).toLocaleString()}
                    </td>
                    <td
                      style={{
                        fontSize: "0.82rem",
                        color: "var(--text-secondary)",
                        maxWidth: "180px",
                      }}
                    >
                      {o.products
                        ?.map((p) => `${p.name} x${p.quantity}`)
                        .join(", ")}
                    </td>
                    <td>₹{o.totalAmount}</td>
                    <td>
                      <span
                        className={`badge badge-${groceryStatusClass(o.deliveryStatus)}`}
                      >
                        {o.deliveryStatus}
                      </span>
                    </td>
                    <td>
                      {o.isPaid ? (
                        <span className="badge badge-accepted">
                          Paid{" "}
                          {o.paidAt
                            ? `· ${new Date(o.paidAt).toLocaleDateString()}`
                            : ""}
                        </span>
                      ) : o.deliveryStatus === "Delivered" ? (
                        <button
                          type="button"
                          className={`btn btn-sm ${o.paymentPending ? "btn-primary" : "btn-outline"}`}
                          onClick={() => handleMarkPaid(o._id)}
                          disabled={markingPaid === o._id}
                        >
                          {markingPaid === o._id
                            ? "..."
                            : o.paymentPending
                            ? "✅ Confirm Payment"
                            : "Mark Paid"}
                        </button>
                      ) : (
                        <span className="badge badge-pending">Due</span>
                      )}
                    </td>
                    <td>
                      <select
                        className="form-control"
                        style={{ minWidth: "140px", padding: "0.4rem" }}
                        value={o.deliveryStatus}
                        onChange={(e) => updateStatus(o._id, e.target.value)}
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="mobile-card-list">
            {orders.map((o) => (
              <article key={o._id} className="mobile-data-card">
                <p className="card-title">{o.userId?.name}</p>
                <div className="card-row">
                  <span className="card-label">Date</span>
                  <span className="card-value">
                    {new Date(o.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="card-row">
                  <span className="card-label">Items</span>
                  <span className="card-value">
                    {o.products
                      ?.map((p) => `${p.name} x${p.quantity}`)
                      .join(", ")}
                  </span>
                </div>
                <div className="card-row">
                  <span className="card-label">Total</span>
                  <span className="card-value">₹{o.totalAmount}</span>
                </div>
                <div className="card-row">
                  <span className="card-label">Delivery</span>
                  <span
                    className={`badge badge-${groceryStatusClass(o.deliveryStatus)}`}
                  >
                    {o.deliveryStatus}
                  </span>
                </div>
                <div className="card-row">
                  <span className="card-label">Payment</span>
                  {o.isPaid ? (
                    <span className="badge badge-accepted">
                      Paid{" "}
                      {o.paidAt
                        ? `· ${new Date(o.paidAt).toLocaleDateString()}`
                        : ""}
                    </span>
                  ) : (
                    <span className="badge badge-pending">Due</span>
                  )}
                </div>
                <div className="form-group" style={{ marginTop: "0.75rem" }}>
                  <label>Update Delivery Status</label>
                  <select
                    className="form-control"
                    value={o.deliveryStatus}
                    onChange={(e) => updateStatus(o._id, e.target.value)}
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                {!o.isPaid && o.deliveryStatus === "Delivered" && (
                  <div className="card-actions">
                    <button
                      type="button"
                      className={`btn btn-sm btn-block ${o.paymentPending ? "btn-primary" : "btn-outline"}`}
                      onClick={() => handleMarkPaid(o._id)}
                      disabled={markingPaid === o._id}
                    >
                      {markingPaid === o._id
                        ? "Processing..."
                        : o.paymentPending
                        ? "✅ Confirm Payment"
                        : "💳 Mark as Paid"}
                    </button>
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
