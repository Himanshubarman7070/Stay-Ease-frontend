import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { useToast } from "../../context/ToastContext";
import { mealAPI, paymentAPI, groceryAPI } from "../../services/api";
import { groceryStatusClass } from "../../utils/statusBadge";

export default function Payments() {
  const { showToast } = useToast();
  const [summary, setSummary] = useState(null);
  const [payments, setPayments] = useState([]);
  const [groceryOrders, setGroceryOrders] = useState([]);
  const [meta, setMeta] = useState(null);
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const [sumRes, payRes, ordersRes] = await Promise.all([
      mealAPI.getSummary(),
      paymentAPI.getMy(),
      groceryAPI.getMyOrders(),
    ]);
    setSummary(sumRes.data.data);
    setPayments(payRes.data.data || []);
    setMeta(payRes.data.meta || null);
    setGroceryOrders(ordersRes.data.data || []);
  };

  useEffect(() => {
    load();
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!grandTotal) {
      showToast("No amount due", "error");
      return;
    }
    setLoading(true);
    try {
      await paymentAPI.submit({ paymentDate, notes });
      showToast("Payment submitted — admin will confirm");
      setNotes("");
      load();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const tiffinDue = summary?.totalDue ?? meta?.totalDue ?? 0;
  const groceryDue = groceryOrders
    .filter((o) => o.deliveryStatus === "Delivered" && !o.isPaid)
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const grandTotal = tiffinDue + groceryDue;

  const dueGroceryOrders = groceryOrders.filter(
    (o) => o.deliveryStatus === "Delivered" && !o.isPaid,
  );

  return (
    <DashboardLayout>
      <header className="page-header">
        <h1>Payments</h1>
        <p>Tiffin dues · Grocery dues · ₹60 per cancelled tiffin</p>
      </header>

      {/* Grand Summary */}
      <section className="grid-3" style={{ marginBottom: "1.5rem" }}>
        <article className="glass-card stat-card">
          <p className="stat-value">₹{tiffinDue}</p>
          <p className="stat-label">Tiffin Due</p>
        </article>
        <article className="glass-card stat-card">
          <p className="stat-value">₹{groceryDue}</p>
          <p className="stat-label">Grocery Due</p>
        </article>
        <article
          className="glass-card stat-card"
          style={{
            background: grandTotal > 0 ? "rgba(248,113,113,0.06)" : undefined,
          }}
        >
          <p className="stat-value">₹{grandTotal}</p>
          <p className="stat-label">Grand Total Due</p>
        </article>
      </section>

      <section className="grid-2" style={{ marginBottom: "1.5rem" }}>
        {/* Payment Form */}
        <form className="glass-card" onSubmit={handleSubmit}>
          <h3 style={{ marginBottom: "0.75rem" }}>💳 Submit Payment</h3>

          {/* Grand total due — prominent */}
          <div
            style={{
              background:
                grandTotal > 0
                  ? "rgba(248,113,113,0.08)"
                  : "rgba(52,211,153,0.06)",
              border: `1px solid ${grandTotal > 0 ? "rgba(248,113,113,0.25)" : "rgba(52,211,153,0.25)"}`,
              borderRadius: "var(--radius-sm)",
              padding: "0.85rem 1rem",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}
              >
                Total Amount Due
              </span>
              <strong
                style={{
                  fontSize: "1.4rem",
                  color: grandTotal > 0 ? "var(--danger)" : "var(--success)",
                }}
              >
                ₹{grandTotal}
              </strong>
            </div>
            {/* Breakdown */}
            <div
              style={{
                marginTop: "0.5rem",
                display: "flex",
                gap: "1rem",
                flexWrap: "wrap",
                fontSize: "0.82rem",
                color: "var(--text-muted)",
              }}
            >
              <span>
                🍱 Tiffin:{" "}
                <strong style={{ color: "var(--text-secondary)" }}>
                  ₹{tiffinDue}
                </strong>
              </span>
              <span>
                🛒 Grocery:{" "}
                <strong style={{ color: "var(--text-secondary)" }}>
                  ₹{groceryDue}
                </strong>
              </span>
            </div>
          </div>

          {(summary?.pendingPayments > 0 || meta?.pendingPaymentCount > 0) && (
            <p
              style={{
                color: "var(--warning)",
                fontSize: "0.9rem",
                marginBottom: "1rem",
              }}
            >
              ⚠️ You have a tiffin payment awaiting admin approval (₹
              {summary?.pendingPaymentAmount ?? meta?.pendingPaymentAmount})
            </p>
          )}
          <div className="form-group">
            <label>Payment Date</label>
            <input
              type="date"
              className="form-control calendar-input"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Notes (UPI ref, transaction id…)</label>
            <textarea
              className="form-control"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional — mention UPI ID, transaction number, or reference"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading || !grandTotal}
          >
            {loading ? "Submitting…" : `Submit Payment — ₹${grandTotal} Total`}
          </button>
          {groceryDue > 0 && (
            <p
              style={{
                fontSize: "0.78rem",
                color: "var(--text-muted)",
                marginTop: "0.6rem",
                textAlign: "center",
              }}
            >
              Grocery payment of ₹{groceryDue} will be confirmed by admin when
              received
            </p>
          )}
        </form>

        {/* Tiffin Breakdown */}
        <article className="glass-card">
          <h3 style={{ marginBottom: "1rem" }}>Tiffin Breakdown (Due)</h3>
          <ul style={{ listStyle: "none" }}>
            {["breakfast", "lunch", "dinner", "morning", "night"].map((m) => (
              <li
                key={m}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0.5rem 0",
                  borderBottom: "1px solid var(--glass-border)",
                }}
              >
                <span style={{ textTransform: "capitalize" }}>{m}</span>
                <span>{summary?.unpaidBreakdown?.[m] || 0} unpaid</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      {/* Grocery Due Section */}
      {dueGroceryOrders.length > 0 && (
        <section className="glass-card" style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ marginBottom: "0.5rem" }}>🛒 Grocery Bills Due</h3>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.9rem",
              marginBottom: "1rem",
            }}
          >
            These orders have been delivered. Please pay the admin:{" "}
            <strong style={{ color: "var(--accent-cyan)" }}>
              ₹{groceryDue}
            </strong>
          </p>
          <div className="desktop-table table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order Date</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {dueGroceryOrders.map((o) => (
                  <tr key={o._id}>
                    <td style={{ fontSize: "0.85rem" }}>
                      {new Date(o.createdAt).toLocaleString()}
                    </td>
                    <td
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--text-secondary)",
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mobile-card-list">
            {dueGroceryOrders.map((o) => (
              <article key={o._id} className="mobile-data-card">
                <p className="card-title">₹{o.totalAmount}</p>
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
                  <span className="card-label">Status</span>
                  <span
                    className={`badge badge-${groceryStatusClass(o.deliveryStatus)}`}
                  >
                    {o.deliveryStatus}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Tiffin Payment History */}
      <section className="glass-card">
        <h3 style={{ marginBottom: "1rem" }}>Tiffin Payment History</h3>
        {payments.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>No payments yet</p>
        ) : (
          <>
            <div className="desktop-table table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Tiffins</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p._id}>
                      <td>{new Date(p.paymentDate).toLocaleDateString()}</td>
                      <td>₹{p.amount}</td>
                      <td>{p.tiffinCount}</td>
                      <td>
                        <span
                          className={`badge badge-${p.status === "Completed" ? "accepted" : p.status === "Rejected" ? "rejected" : "pending"}`}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mobile-card-list">
              {payments.map((p) => (
                <article key={p._id} className="mobile-data-card">
                  <p className="card-title">₹{p.amount}</p>
                  <div className="card-row">
                    <span className="card-label">Date</span>
                    <span className="card-value">
                      {new Date(p.paymentDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="card-row">
                    <span className="card-label">Status</span>
                    <span
                      className={`badge badge-${p.status === "Completed" ? "accepted" : p.status === "Rejected" ? "rejected" : "pending"}`}
                    >
                      {p.status}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </DashboardLayout>
  );
}
