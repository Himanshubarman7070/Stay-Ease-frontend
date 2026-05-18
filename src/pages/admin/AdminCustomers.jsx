import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import Loading from "../../components/Loading";
import { useToast } from "../../context/ToastContext";
import { adminAPI } from "../../services/api";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const load = () =>
    adminAPI
      .getCustomers()
      .then((r) => setCustomers(r.data.data || []))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const toggleBlock = async (id) => {
    try {
      await adminAPI.toggleBlock(id);
      showToast("User status updated");
      load();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed", "error");
    }
  };

  const viewHistory = (id) => navigate(`/admin/customers/${id}/history`);

  const filtered = customers.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search),
  );

  if (loading)
    return (
      <DashboardLayout>
        <Loading />
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Customer Management</h1>
        <p>
          {customers.length} registered customer
          {customers.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Search bar */}
      <div
        className="glass-card"
        style={{ padding: "0.85rem 1rem", marginBottom: "1.25rem" }}
      >
        <input
          className="form-control"
          placeholder="🔍  Search by name, email or phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            background: "transparent",
            border: "none",
            padding: 0,
            fontSize: "0.95rem",
          }}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card empty-state">No customers found</div>
      ) : (
        <>
          {/* ── Desktop table ── */}
          <section className="glass-card table-wrap desktop-table">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c._id}>
                    <td style={{ fontWeight: 500 }}>{c.name}</td>
                    <td style={{ color: "var(--text-secondary)" }}>
                      {c.email}
                    </td>
                    <td>{c.phone}</td>
                    <td>
                      {c.isBlocked ? (
                        <span className="badge badge-rejected">Blocked</span>
                      ) : (
                        <span className="badge badge-accepted">Active</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => viewHistory(c._id)}
                        >
                          📋 History
                        </button>
                        <button
                          type="button"
                          className={`btn btn-sm ${c.isBlocked ? "btn-primary" : "btn-danger"}`}
                          onClick={() => toggleBlock(c._id)}
                        >
                          {c.isBlocked ? "Unblock" : "Block"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* ── Mobile cards ── */}
          <section className="mobile-card-list">
            {filtered.map((c) => (
              <article key={c._id} className="mobile-data-card glass-card">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "0.75rem",
                    paddingBottom: "0.5rem",
                    borderBottom: "1px solid var(--glass-border)",
                  }}
                >
                  <div>
                    <p style={{ fontWeight: 600, fontSize: "1rem" }}>
                      {c.name}
                    </p>
                    <p
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                        marginTop: "0.1rem",
                      }}
                    >
                      {c.email}
                    </p>
                  </div>
                  {c.isBlocked ? (
                    <span className="badge badge-rejected">Blocked</span>
                  ) : (
                    <span className="badge badge-accepted">Active</span>
                  )}
                </div>

                <div className="card-row">
                  <span className="card-label">Phone</span>
                  <span className="card-value">{c.phone}</span>
                </div>
                <div className="card-row">
                  <span className="card-label">Joined</span>
                  <span className="card-value">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="card-actions">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => viewHistory(c._id)}
                  >
                    📋 View History
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${c.isBlocked ? "btn-primary" : "btn-danger"}`}
                    style={{ flex: 1 }}
                    onClick={() => toggleBlock(c._id)}
                  >
                    {c.isBlocked ? "Unblock" : "Block"}
                  </button>
                </div>
              </article>
            ))}
          </section>
        </>
      )}
    </DashboardLayout>
  );
}
