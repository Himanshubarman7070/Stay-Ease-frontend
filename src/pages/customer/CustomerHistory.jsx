import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import Loading from "../../components/Loading";
import { mealAPI, groceryAPI } from "../../services/api";
import { groceryStatusClass } from "../../utils/statusBadge";

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

export default function CustomerHistory() {
  const [cancellations, setCancellations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("tiffin");
  const [tiffinMonth, setTiffinMonth] = useState("");
  const [groceryMonth, setGroceryMonth] = useState("");

  useEffect(() => {
    Promise.all([
      mealAPI.getMyCancellations(),
      groceryAPI.getMyOrders(),
      mealAPI.getSummary(),
    ])
      .then(([cRes, oRes, sRes]) => {
        setCancellations(cRes.data.data || []);
        setOrders(oRes.data.data || []);
        setSummary(sRes.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <DashboardLayout>
        <Loading />
      </DashboardLayout>
    );

  const groceryDue = orders
    .filter((o) => o.deliveryStatus === "Delivered" && !o.isPaid)
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalGrocerySpent = orders
    .filter((o) => o.deliveryStatus === "Delivered" && o.isPaid)
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const tiffinDue = summary?.totalDue ?? 0;
  const grandTotal = tiffinDue + groceryDue;

  const filteredCancellations = filterByMonth(
    cancellations,
    tiffinMonth,
    "date",
  );
  const filteredOrders = filterByMonth(orders, groceryMonth, "createdAt");
  const tiffinMonths = getMonthOptions(cancellations, "date");
  const groceryMonths = getMonthOptions(orders, "createdAt");

  return (
    <DashboardLayout>
      <header className="page-header">
        <h1>My History</h1>
        <p>Your tiffin cancellations and grocery orders</p>
      </header>

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: "1.5rem" }}>
        <div className="glass-card stat-card">
          <div className="stat-value">₹{tiffinDue}</div>
          <div className="stat-label">Tiffin Due</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-value">₹{groceryDue}</div>
          <div className="stat-label">Grocery Due</div>
        </div>
        <div
          className="glass-card stat-card"
          style={{
            background: grandTotal > 0 ? "rgba(248,113,113,0.06)" : undefined,
          }}
        >
          <div className="stat-value">₹{grandTotal}</div>
          <div className="stat-label">Total Due</div>
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
          🍱 Tiffin Cancellations ({cancellations.length})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${tab === "grocery" ? "btn-primary" : "btn-outline"}`}
          onClick={() => setTab("grocery")}
        >
          🛒 Grocery Orders ({orders.length})
        </button>
      </div>

      {/* Tiffin Tab */}
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
            <h3 style={{ margin: 0 }}>Tiffin Cancellation History</h3>
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

      {/* Grocery Tab */}
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
            <h3 style={{ margin: 0 }}>Grocery Order History</h3>
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
                            maxWidth: "260px",
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
                          <span
                            className={`badge ${o.isPaid ? "badge-accepted" : o.deliveryStatus === "Delivered" ? "badge-pending" : "badge-open"}`}
                          >
                            {o.isPaid
                              ? `Paid${o.paidAt ? " · " + new Date(o.paidAt).toLocaleDateString() : ""}`
                              : o.deliveryStatus === "Delivered"
                                ? "Due"
                                : "Awaiting Delivery"}
                          </span>
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
                      <span
                        className={`badge ${o.isPaid ? "badge-accepted" : o.deliveryStatus === "Delivered" ? "badge-pending" : "badge-open"}`}
                      >
                        {o.isPaid
                          ? `Paid${o.paidAt ? " · " + new Date(o.paidAt).toLocaleDateString() : ""}`
                          : o.deliveryStatus === "Delivered"
                            ? "Due"
                            : "Awaiting Delivery"}
                      </span>
                    </div>
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
