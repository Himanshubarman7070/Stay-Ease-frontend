import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import Loading from "../../components/Loading";
import { useAuth } from "../../context/AuthContext";
import {
  tiffinAPI,
  foodAPI,
  groceryAPI,
  complaintAPI,
  mealAPI,
} from "../../services/api";

const MEAL_ICONS = { breakfast: "🌅", lunch: "☀️", dinner: "🌙" };
const MEAL_BG = {
  breakfast: "rgba(251,191,36,0.10)",
  lunch: "rgba(34,211,238,0.10)",
  dinner: "rgba(167,139,250,0.10)",
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return { text: "Good morning", icon: "🌅" };
  if (h < 17) return { text: "Good afternoon", icon: "☀️" };
  return { text: "Good evening", icon: "🌙" };
};

const QUICK_ACTIONS = [
  { to: "/tiffin-request", icon: "🍱", label: "Tiffin Request" },
  { to: "/today-food", icon: "🍽️", label: "Today's Food" },
  { to: "/grocery", icon: "🛒", label: "Grocery" },
  { to: "/cancellation", icon: "❌", label: "Cancel Meal" },
  { to: "/payments", icon: "💳", label: "Payments" },
  { to: "/my-history", icon: "🕐", label: "My History" },
  { to: "/complaints", icon: "💬", label: "Complaints" },
  { to: "/profile", icon: "👤", label: "Profile" },
];

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activePlan, setActivePlan] = useState(null);
  const [todayFood, setTodayFood] = useState([]);
  const [products, setProducts] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [mealSummary, setMealSummary] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [planRes, foodRes, prodRes, compRes, ordRes, mealRes] =
          await Promise.all([
            tiffinAPI.getActive(),
            foodAPI.getToday(),
            groceryAPI.getProducts(),
            complaintAPI.getMy(),
            groceryAPI.getMyOrders(),
            mealAPI.getSummary().catch(() => ({ data: { data: null } })),
          ]);
        setActivePlan(planRes.data.data);
        setTodayFood(foodRes.data.data || []);
        setProducts((prodRes.data.data || []).slice(0, 4));
        setComplaints(compRes.data.data || []);
        setAllOrders(ordRes.data.data || []);
        setOrders((ordRes.data.data || []).slice(0, 3));
        setMealSummary(mealRes.data.data);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading)
    return (
      <DashboardLayout>
        <Loading />
      </DashboardLayout>
    );

  const openComplaints = complaints.filter(
    (c) => c.status !== "Resolved",
  ).length;
  const tiffinDue = mealSummary?.totalDue || 0;
  const groceryDue = allOrders
    .filter((o) => o.deliveryStatus === "Delivered" && !o.isPaid)
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const totalDue = tiffinDue + groceryDue;

  const { text: greetText, icon: greetIcon } = getGreeting();
  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  let planProgress = 0;
  if (activePlan?.startDate && activePlan?.endDate) {
    const start = new Date(activePlan.startDate).getTime();
    const end = new Date(activePlan.endDate).getTime();
    const now = Date.now();
    planProgress = Math.min(
      100,
      Math.max(0, Math.round(((now - start) / (end - start)) * 100)),
    );
  }

  return (
    <DashboardLayout>
      {/* ── Greeting Banner ── */}
      <div
        className="dash-greeting glass-card"
        style={{ marginBottom: "1.75rem" }}
      >
        <div className="dash-greeting-inner">
          <div>
            <h1 className="dash-greeting-title">
              {greetIcon} {greetText}, {user?.name?.split(" ")[0]}!
            </h1>
            <p className="dash-greeting-sub">{todayStr}</p>
          </div>
          <span
            className={`badge ${activePlan ? "badge-accepted" : "badge-pending"}`}
            style={{ fontSize: "0.9rem", padding: "0.4rem 1rem" }}
          >
            {activePlan
              ? `🍱 ${activePlan.planType} Plan`
              : "❌ No Active Plan"}
          </span>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="dash-stats-2x2" style={{ marginBottom: "1.75rem" }}>
        <div
          className={`glass-card stat-card dash-stat ${activePlan ? "stat-good" : "stat-warn"}`}
        >
          <div className="dash-stat-icon">{activePlan ? "✅" : "⏳"}</div>
          <div className="stat-value">
            {activePlan ? activePlan.planType : "None"}
          </div>
          <div className="stat-label">Tiffin Plan</div>
        </div>

        <div className="glass-card stat-card dash-stat">
          <div className="dash-stat-icon">🍽️</div>
          <div className="stat-value">{todayFood.length}</div>
          <div className="stat-label">Today's Menu</div>
        </div>

        <div
          className={`glass-card stat-card dash-stat ${totalDue > 0 ? "stat-alert" : "stat-good"}`}
        >
          <div className="dash-stat-icon">{totalDue > 0 ? "⚠️" : "✅"}</div>
          <div className="stat-value">₹{totalDue}</div>
          <div className="stat-label">Total Due</div>
        </div>

        <div
          className={`glass-card stat-card dash-stat ${openComplaints > 0 ? "stat-alert" : "stat-good"}`}
        >
          <div className="dash-stat-icon">
            {openComplaints > 0 ? "💬" : "✅"}
          </div>
          <div className="stat-value">{openComplaints}</div>
          <div className="stat-label">Open Complaints</div>
        </div>
      </div>

      {/* ── Plan + Menu ── */}
      <div className="grid-2" style={{ marginBottom: "1.75rem" }}>
        {/* Active Plan Card */}
        <div className="glass-card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h3>🍱 Tiffin Plan</h3>
            {activePlan && <span className="badge badge-accepted">Active</span>}
          </div>

          {activePlan ? (
            <>
              <div
                style={{
                  display: "flex",
                  gap: "0.6rem",
                  marginBottom: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <span className="plan-pill">{activePlan.planType}</span>
                <span className="plan-pill">{activePlan.duration}</span>
              </div>

              <div style={{ marginBottom: "0.85rem" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.82rem",
                    color: "var(--text-muted)",
                    marginBottom: "0.4rem",
                  }}
                >
                  <span>Plan usage</span>
                  <span>{planProgress}%</span>
                </div>
                <div className="plan-progress-bar">
                  <div
                    className="plan-progress-fill"
                    style={{ width: `${planProgress}%` }}
                  />
                </div>
              </div>

              <p
                style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}
              >
                📅 Ends:{" "}
                <strong>
                  {activePlan.endDate
                    ? new Date(activePlan.endDate).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </strong>
              </p>

              <Link
                to="/request-status"
                className="btn btn-outline btn-sm"
                style={{
                  marginTop: "1rem",
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                View Plan Details
              </Link>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "1rem 0" }}>
              <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>
                🍱
              </div>
              <p
                style={{
                  color: "var(--text-secondary)",
                  marginBottom: "1.25rem",
                  fontSize: "0.9rem",
                }}
              >
                No active tiffin plan. Submit a request to get started.
              </p>
              <Link
                to="/tiffin-request"
                className="btn btn-primary btn-sm"
                style={{ width: "100%", justifyContent: "center" }}
              >
                + Request Tiffin
              </Link>
            </div>
          )}
        </div>

        {/* Today's Menu Card */}
        <div className="glass-card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h3>🍽️ Today's Menu</h3>
            <Link
              to="/today-food"
              style={{
                fontSize: "0.82rem",
                color: "var(--accent-purple)",
                fontWeight: 600,
              }}
            >
              View all →
            </Link>
          </div>

          {todayFood.length ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.55rem",
              }}
            >
              {todayFood.map((f) => (
                <div
                  key={f._id}
                  className="menu-item-chip"
                  style={{
                    background: MEAL_BG[f.category] || "rgba(255,255,255,0.03)",
                  }}
                >
                  <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>
                    {MEAL_ICONS[f.category]}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {f.category}
                    </div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {f.title}
                    </div>
                  </div>
                  <span
                    style={{
                      color: "var(--accent-cyan)",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      flexShrink: 0,
                    }}
                  >
                    ₹{f.price}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "2rem 0" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
                🍽️
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                Menu not updated yet
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="glass-card" style={{ marginBottom: "1.75rem" }}>
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

      {/* ── Grocery + Recent Orders ── */}
      <div className="grid-2">
        {/* Grocery Highlights */}
        <div className="glass-card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h3>🛒 Grocery</h3>
            <Link
              to="/grocery"
              style={{
                fontSize: "0.82rem",
                color: "var(--accent-purple)",
                fontWeight: 600,
              }}
            >
              Shop all →
            </Link>
          </div>

          {products.length ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.65rem",
              }}
            >
              {products.map((p) => (
                <div key={p._id} className="dash-product-card">
                  <img
                    src={p.image || "https://via.placeholder.com/60"}
                    alt={p.name}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "0.82rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {p.name}
                    </div>
                    <div
                      style={{
                        color: "var(--accent-cyan)",
                        fontWeight: 700,
                        fontSize: "0.88rem",
                      }}
                    >
                      ₹{p.price}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              No products available
            </p>
          )}
        </div>

        {/* Recent Orders */}
        <div className="glass-card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h3>📦 Recent Orders</h3>
            <Link
              to="/orders"
              style={{
                fontSize: "0.82rem",
                color: "var(--accent-purple)",
                fontWeight: 600,
              }}
            >
              All orders →
            </Link>
          </div>

          {orders.length ? (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {orders.map((o) => (
                <div key={o._id} className="dash-order-row">
                  <div>
                    <div style={{ fontWeight: 600 }}>₹{o.totalAmount}</div>
                    <div
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {new Date(o.createdAt).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                      })}
                    </div>
                  </div>
                  <span
                    className={`badge badge-${o.deliveryStatus === "Delivered" ? "accepted" : o.deliveryStatus === "Cancelled" ? "rejected" : "pending"}`}
                    style={{ fontSize: "0.75rem" }}
                  >
                    {o.deliveryStatus}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "2rem 0" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
                📦
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                No orders yet
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
