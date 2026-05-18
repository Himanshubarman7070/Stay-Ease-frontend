import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import Loading from "../../components/Loading";
import { adminAPI, paymentAPI } from "../../services/api";

const QUICK_ACTIONS = [
  { to: "/admin/tiffin-requests", icon: "🍱", label: "Tiffin Requests" },
  { to: "/admin/today-food", icon: "🍽️", label: "Today's Food" },
  { to: "/admin/meal-delivery", icon: "🚚", label: "Meal Delivery" },
  { to: "/admin/orders", icon: "📦", label: "Grocery Orders" },
  { to: "/admin/customers", icon: "👥", label: "Customers" },
  { to: "/admin/payments", icon: "💳", label: "Payments" },
  { to: "/admin/meal-cancellations", icon: "❌", label: "Meal Cancels" },
  { to: "/admin/complaints", icon: "💬", label: "Complaints" },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminAPI.getDashboard(), paymentAPI.getStats()])
      .then(([dashRes, payRes]) =>
        setStats({ ...dashRes.data.data, ...payRes.data.data }),
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <DashboardLayout>
        <Loading />
      </DashboardLayout>
    );

  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const s = stats || {};

  return (
    <DashboardLayout>
      {/* ── Header Banner ── */}
      <div
        className="dash-greeting glass-card"
        style={{ marginBottom: "1.75rem" }}
      >
        <div className="dash-greeting-inner">
          <div>
            <h1 className="dash-greeting-title">📊 Admin Dashboard</h1>
            <p className="dash-greeting-sub">
              StayEase Control Centre · {todayStr}
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
            {(s.pendingRequests ?? 0) > 0 && (
              <span
                className="badge badge-pending"
                style={{ fontSize: "0.85rem" }}
              >
                ⏳ {s.pendingRequests} Pending Request
                {s.pendingRequests !== 1 ? "s" : ""}
              </span>
            )}
            {(s.openComplaints ?? 0) > 0 && (
              <span
                className="badge badge-rejected"
                style={{ fontSize: "0.85rem" }}
              >
                💬 {s.openComplaints} Open Complaint
                {s.openComplaints !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Section: Customers & Plans ── */}
      <p className="dash-section-label">👥 Customers &amp; Plans</p>
      <div className="dash-admin-grid" style={{ marginBottom: "1.75rem" }}>
        <div className="glass-card stat-card dash-stat">
          <div className="dash-stat-icon">👥</div>
          <div className="stat-value">{s.totalCustomers ?? 0}</div>
          <div className="stat-label">Total Customers</div>
          <Link to="/admin/customers" className="dash-stat-link">
            Manage →
          </Link>
        </div>
        <div
          className={`glass-card stat-card dash-stat ${(s.activePlans ?? 0) > 0 ? "stat-good" : ""}`}
        >
          <div className="dash-stat-icon">✅</div>
          <div className="stat-value">{s.activePlans ?? 0}</div>
          <div className="stat-label">Active Plans</div>
          <Link to="/admin/tiffin-requests" className="dash-stat-link">
            View →
          </Link>
        </div>
        <div
          className={`glass-card stat-card dash-stat ${(s.pendingRequests ?? 0) > 0 ? "stat-warn" : "stat-good"}`}
        >
          <div className="dash-stat-icon">
            {(s.pendingRequests ?? 0) > 0 ? "⏳" : "✅"}
          </div>
          <div className="stat-value">{s.pendingRequests ?? 0}</div>
          <div className="stat-label">Pending Requests</div>
          <Link to="/admin/tiffin-requests" className="dash-stat-link">
            Review →
          </Link>
        </div>
      </div>

      {/* ── Section: Operations ── */}
      <p className="dash-section-label">📦 Operations</p>
      <div className="dash-admin-grid" style={{ marginBottom: "1.75rem" }}>
        <div className="glass-card stat-card dash-stat">
          <div className="dash-stat-icon">🛒</div>
          <div className="stat-value">{s.groceryOrders ?? 0}</div>
          <div className="stat-label">Total Grocery Orders</div>
          <Link to="/admin/orders" className="dash-stat-link">
            Manage →
          </Link>
        </div>
        <div
          className={`glass-card stat-card dash-stat ${(s.openComplaints ?? 0) > 0 ? "stat-alert" : "stat-good"}`}
        >
          <div className="dash-stat-icon">
            {(s.openComplaints ?? 0) > 0 ? "🔴" : "✅"}
          </div>
          <div className="stat-value">{s.openComplaints ?? 0}</div>
          <div className="stat-label">Open Complaints</div>
          <Link to="/admin/complaints" className="dash-stat-link">
            Resolve →
          </Link>
        </div>
        <div
          className={`glass-card stat-card dash-stat ${(s.pendingCancellations ?? 0) > 0 ? "stat-warn" : "stat-good"}`}
        >
          <div className="dash-stat-icon">📅</div>
          <div className="stat-value">{s.pendingCancellations ?? 0}</div>
          <div className="stat-label">Pending Cancellations</div>
          <Link to="/admin/cancellations" className="dash-stat-link">
            View →
          </Link>
        </div>
      </div>

      {/* ── Section: Finance ── */}
      <p className="dash-section-label">💰 Finance</p>
      <div className="dash-admin-grid" style={{ marginBottom: "1.75rem" }}>
        <div className="glass-card stat-card dash-stat stat-good">
          <div className="dash-stat-icon">💰</div>
          <div className="stat-value">₹{s.revenue ?? 0}</div>
          <div className="stat-label">Grocery Revenue</div>
        </div>
        <div
          className={`glass-card stat-card dash-stat ${(s.totalDueAllCustomers ?? 0) > 0 ? "stat-alert" : "stat-good"}`}
        >
          <div className="dash-stat-icon">
            {(s.totalDueAllCustomers ?? 0) > 0 ? "⚠️" : "✅"}
          </div>
          <div className="stat-value">₹{s.totalDueAllCustomers ?? 0}</div>
          <div className="stat-label">Total Due (All Customers)</div>
          <Link to="/admin/payments" className="dash-stat-link">
            View →
          </Link>
        </div>
        <div
          className={`glass-card stat-card dash-stat ${(s.pendingPayments ?? 0) > 0 ? "stat-warn" : "stat-good"}`}
        >
          <div className="dash-stat-icon">
            {(s.pendingPayments ?? 0) > 0 ? "⏳" : "✅"}
          </div>
          <div className="stat-value">{s.pendingPayments ?? 0}</div>
          <div className="stat-label">Pending Payments</div>
          <Link to="/admin/payments" className="dash-stat-link">
            Confirm →
          </Link>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="glass-card">
        <h3 style={{ marginBottom: "1rem" }}>⚡ Quick Actions</h3>
        <div className="quick-actions-grid">
          {QUICK_ACTIONS.map((a) => (
            <Link key={a.to} to={a.to} className="quick-action-btn">
              <span className="quick-action-icon">{a.icon}</span>
              <span className="quick-action-label">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
