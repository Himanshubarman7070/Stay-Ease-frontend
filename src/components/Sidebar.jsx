import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const customerLinks = [
  { to: "/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/tiffin-request", label: "Tiffin Request", icon: "🍱" },
  { to: "/request-status", label: "Request Status", icon: "📋" },
  { to: "/today-food", label: "Today's Food", icon: "🍽️" },
  { to: "/grocery", label: "Grocery", icon: "🛒" },
  { to: "/orders", label: "Orders", icon: "📦" },
  { to: "/cancellation", label: "Cancel Meals", icon: "❌" },
  { to: "/payments", label: "Payments", icon: "💳" },
  { to: "/complaints", label: "Complaints", icon: "💬" },
  { to: "/my-history", label: "My History", icon: "🕐" },
  { to: "/profile", label: "Profile", icon: "👤" },
];

const adminLinks = [
  { to: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/admin/tiffin-requests", label: "Tiffin Requests", icon: "🍱" },
  { to: "/admin/today-food", label: "Today's Food", icon: "🍽️" },
  { to: "/admin/meal-delivery", label: "Meal Delivery", icon: "🚚" },
  { to: "/admin/menu", label: "Menu", icon: "📜" },
  { to: "/admin/grocery", label: "Grocery", icon: "🛒" },
  { to: "/admin/orders", label: "Orders", icon: "📦" },
  { to: "/admin/customers", label: "Customers", icon: "👥" },
  { to: "/admin/delivery", label: "Delivery Times", icon: "🕐" },
  { to: "/admin/meal-cancellations", label: "Meal Cancels", icon: "❌" },
  { to: "/admin/payments", label: "Payments", icon: "💳" },
  { to: "/admin/cancellations", label: "Date Cancels", icon: "📅" },
  { to: "/admin/complaints", label: "Complaints", icon: "💬" },
];

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const links = user?.role === "admin" ? adminLinks : customerLinks;

  return (
    <>
      <div
        className={`sidebar-overlay ${open ? "open" : ""}`}
        onClick={onClose}
        role="presentation"
      />
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-logo">
          <h1>StayEase</h1>
          <span>Smart Tiffin & Grocery</span>
        </div>
        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
              onClick={onClose}
            >
              <span>{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            {user?.role === "admin" ? "Admin Panel" : "Customer Portal"}
          </span>
        </div>
      </aside>
    </>
  );
}
