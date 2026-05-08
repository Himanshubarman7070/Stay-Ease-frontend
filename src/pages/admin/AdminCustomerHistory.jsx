import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import Loading from "../../components/Loading";
import { adminAPI, groceryAPI } from "../../services/api";
import { groceryStatusClass } from "../../utils/statusBadge";
import { useToast } from "../../context/ToastContext";

const MEAL_ICONS = {
  breakfast: "🌅",
  morning: "🌅",
  lunch: "☀️",
  dinner: "🌙",
  night: "🌙",
};
const MEAL_LABELS = {
  breakfast: "Breakfast",
  morning: "Morning",
  lunch: "Lunch",
  dinner: "Dinner",
  night: "Night",
};

const getMonthOptions = (items, dateField = "createdAt") => {
  const months = new Set();
  items.forEach((item) => {
    if (!item[dateField]) return;
    const d = new Date(item[dateField]);
    months.add(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
    );
  });
  return [...months].sort().reverse();
};

const formatMonthLabel = (ym) => {
  const [y, m] = ym.split("-");
  return new Date(Number(y), Number(m) - 1).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
};

const filterByMonth = (items, month, dateField = "createdAt") => {
  if (!month) return items;
  return items.filter((item) => {
    if (!item[dateField]) return false;
    const d = new Date(item[dateField]);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return ym === month;
  });
};

export default function AdminCustomerHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("tiffin");
  const [tiffinMonth, setTiffinMonth] = useState("");
  const [groceryMonth, setGroceryMonth] = useState("");
  const [planLoading, setPlanLoading] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(null);

  const load = () => {
    setLoading(true);
    adminAPI
      .getCustomerHistory(id)
      .then((r) => setData(r.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleDeactivate = async () => {
    if (!window.confirm("Deactivate this customer's tiffin plan?")) return;
    setPlanLoading(true);
    try {
      await adminAPI.deactivateCustomerPlan(id);
      showToast("Plan deactivated");
      load();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed", "error");
    } finally {
      setPlanLoading(false);
    }
  };

  const handleActivate = async () => {
    if (!window.confirm("Activate this customer's tiffin plan?")) return;
    setPlanLoading(true);
    try {
      await adminAPI.activateCustomerPlan(id);
      showToast("Plan activated");
      load();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed", "error");
    } finally {
      setPlanLoading(false);
    }
  };

  const handleMarkPaid = async (orderId) => {
    setMarkingPaid(orderId);
    try {
      await groceryAPI.markOrderPaid(orderId);
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
  if (!data)
    return (
      <DashboardLayout>
        <div className="glass-card empty-state">Customer not found</div>
      </DashboardLayout>
    );

  const {
    customer,
    plan,
    mealCancellations,
    groceryOrders,
    totalTiffinDue,
    groceryDue,
  } = data;

  const filteredCancellations = filterByMonth(
    mealCancellations,
    tiffinMonth,
    "date",
  );
  const filteredOrders = filterByMonth(
    groceryOrders,
    groceryMonth,
    "createdAt",
  );
  const tiffinMonths = getMonthOptions(mealCancellations, "date");
  const groceryMonths = getMonthOptions(groceryOrders, "createdAt");
  const grandTotal = totalTiffinDue + (groceryDue || 0);

  return (
    <DashboardLayout>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "1rem",
          flexWrap: "wrap",
          marginBottom: "1.5rem",
        }}
      >
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => navigate("/admin/customers")}
        >
          ← Back
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>
            {customer.name}
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            {customer.email} · {customer.phone}
          </p>
        </div>
        {/* Plan status pill + deactivate/activate */}
        {plan && (
          <div
            className="glass-card"
            style={{
              padding: "0.75rem 1rem",
            }}
          >
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Tiffin Plan
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginTop: "0.2rem",
                flexWrap: "wrap",
              }}
            >
              <strong>
                {plan.planType} · {plan.duration}
              </strong>
              <span
                className={`badge ${plan.isActive ? "badge-accepted" : "badge-pending"}`}
              >
                {plan.isActive ? "Active" : "Inactive"}
              </span>
              {plan.isActive ? (
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={handleDeactivate}
                  disabled={planLoading}
                >
                  {planLoading ? "..." : "Deactivate Plan"}
                </button>
              ) : plan.status === "Accepted" ? (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleActivate}
                  disabled={planLoading}
                >
                  {planLoading ? "..." : "Activate Plan"}
                </button>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: "1.5rem" }}>
        <div className="glass-card stat-card">
          <div className="stat-value">₹{totalTiffinDue}</div>
          <div className="stat-label">Tiffin Due (Unpaid)</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-value">₹{groceryDue || 0}</div>
          <div className="stat-label">Grocery Due</div>
        </div>
        <div
          className="glass-card stat-card"
          style={{
            background: grandTotal > 0 ? "rgba(248,113,113,0.06)" : undefined,
          }}
        >
          <div className="stat-value">₹{grandTotal}</div>
          <div className="stat-label">Grand Total Due</div>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          className={`btn btn-sm ${tab === "tiffin" ? "btn-primary" : "btn-outline"}`}
          onClick={() => setTab("tiffin")}
        >
          🍱 Tiffin History ({mealCancellations.length})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${tab === "grocery" ? "btn-primary" : "btn-outline"}`}
          onClick={() => setTab("grocery")}
        >
          🛒 Grocery History ({groceryOrders.length})
        </button>
      </div>

      {/* ── Tiffin History ── */}
      {tab === "tiffin" && (
        <section className="glass-card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
              flexWrap: "wrap",
              gap: "0.75rem",
            }}
          >
            <h3 style={{ margin: 0 }}>Meal Cancellations</h3>
            <select
              className="form-control"
              style={{ width: "auto", minWidth: "160px" }}
              value={tiffinMonth}
              onChange={(e) => setTiffinMonth(e.target.value)}
            >
              <option value="">All Months</option>
              {tiffinMonths.map((m) => (
                <option key={m} value={m}>
                  {formatMonthLabel(m)}
                </option>
              ))}
            </select>
          </div>
          {filteredCancellations.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>
              No cancellations{tiffinMonth ? " for this month" : ""}
            </p>
          ) : (
            <>
              <div className="desktop-table table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Meal Date</th>
                      <th>Meal Type</th>
                      <th>Cancelled At</th>
                      <th>Charge</th>
                      <th>Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCancellations.map((c) => (
                      <tr key={c._id}>
                        <td>{new Date(c.date).toLocaleDateString()}</td>
                        <td>
                          {MEAL_ICONS[c.mealType]}{" "}
                          {MEAL_LABELS[c.mealType] || c.mealType}
                        </td>
                        <td
                          style={{
                            fontSize: "0.85rem",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {new Date(c.createdAt).toLocaleString()}
                        </td>
                        <td>₹{c.chargeAmount}</td>
                        <td>
                          <span
                            className={`badge ${c.isPaid ? "badge-accepted" : "badge-pending"}`}
                          >
                            {c.isPaid ? "Paid" : "Due"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mobile-card-list">
                {filteredCancellations.map((c) => (
                  <article key={c._id} className="mobile-data-card">
                    <p className="card-title">
                      {MEAL_ICONS[c.mealType]}{" "}
                      {MEAL_LABELS[c.mealType] || c.mealType} —{" "}
                      {new Date(c.date).toLocaleDateString()}
                    </p>
                    <div className="card-row">
                      <span className="card-label">Cancelled At</span>
                      <span className="card-value">
                        {new Date(c.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="card-row">
                      <span className="card-label">Charge</span>
                      <span className="card-value">₹{c.chargeAmount}</span>
                    </div>
                    <div className="card-row">
                      <span className="card-label">Payment</span>
                      <span
                        className={`badge ${c.isPaid ? "badge-accepted" : "badge-pending"}`}
                      >
                        {c.isPaid ? "Paid" : "Due"}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* ── Grocery History ── */}
      {tab === "grocery" && (
        <section className="glass-card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
              flexWrap: "wrap",
              gap: "0.75rem",
            }}
          >
            <h3 style={{ margin: 0 }}>Grocery Orders</h3>
            <select
              className="form-control"
              style={{ width: "auto", minWidth: "160px" }}
              value={groceryMonth}
              onChange={(e) => setGroceryMonth(e.target.value)}
            >
              <option value="">All Months</option>
              {groceryMonths.map((m) => (
                <option key={m} value={m}>
                  {formatMonthLabel(m)}
                </option>
              ))}
            </select>
          </div>
          {filteredOrders.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>
              No orders{groceryMonth ? " for this month" : ""}
            </p>
          ) : (
            <>
              <div className="desktop-table table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order Date & Time</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Delivery</th>
                      <th>Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((o) => (
                      <tr key={o._id}>
                        <td style={{ fontSize: "0.85rem" }}>
                          {new Date(o.createdAt).toLocaleString()}
                        </td>
                        <td
                          style={{
                            maxWidth: "220px",
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
                              className="btn btn-primary btn-sm"
                              onClick={() => handleMarkPaid(o._id)}
                              disabled={markingPaid === o._id}
                            >
                              {markingPaid === o._id ? "..." : "Mark Paid"}
                            </button>
                          ) : (
                            <span className="badge badge-pending">Pending</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mobile-card-list">
                {filteredOrders.map((o) => (
                  <article key={o._id} className="mobile-data-card">
                    <p className="card-title">
                      ₹{o.totalAmount} —{" "}
                      {new Date(o.createdAt).toLocaleDateString()}
                    </p>
                    <div className="card-row">
                      <span className="card-label">Time</span>
                      <span className="card-value">
                        {new Date(o.createdAt).toLocaleTimeString()}
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
                    {!o.isPaid && o.deliveryStatus === "Delivered" && (
                      <div className="card-actions">
                        <button
                          type="button"
                          className="btn btn-primary btn-sm btn-block"
                          onClick={() => handleMarkPaid(o._id)}
                          disabled={markingPaid === o._id}
                        >
                          {markingPaid === o._id
                            ? "Processing..."
                            : "Mark as Paid"}
                        </button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      )}
    </DashboardLayout>
  );
}
