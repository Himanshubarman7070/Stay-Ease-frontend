import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import Loading from "../../components/Loading";
import { Link } from "react-router-dom";
import { foodAPI, mealAPI } from "../../services/api";
import { mealStatusClass } from "../../utils/statusBadge";

const toAmPm = (time) => {
  if (!time) return time;
  const [h, m] = time.split(":").map(Number);
  const period = h < 12 ? "AM" : "PM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
};

export default function TodayFood() {
  const [foods, setFoods] = useState([]);
  const [schedule, setSchedule] = useState(null);
  const [mealStatus, setMealStatus] = useState([]);
  const [planType, setPlanType] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () =>
    Promise.all([
      foodAPI.getToday(),
      mealAPI.getSchedule(),
      mealAPI.getTodayStatus(),
    ])
      .then(([foodRes, schedRes, statusRes]) => {
        setFoods(foodRes.data.data || []);
        setSchedule(schedRes.data.data);
        setMealStatus(statusRes.data.data?.meals || []);
        setPlanType(statusRes.data.data?.planType ?? null);
      })
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const hasPlan = planType !== null;
  const getStatus = (category) =>
    mealStatus.find((m) => m.mealType === category)?.status || "Pending";

  if (loading)
    return (
      <DashboardLayout>
        <Loading />
      </DashboardLayout>
    );

  const categories = ["breakfast", "lunch", "dinner"];

  return (
    <DashboardLayout>
      <header className="page-header">
        <h1>Today&apos;s Food</h1>
        <p>
          {hasPlan
            ? "Delivery status: Pending · Delivered · Cancelled"
            : "Today's menu for all residents"}
        </p>
      </header>
      {schedule && (
        <section
          className="glass-card delivery-banner"
          style={{ marginBottom: "1.5rem" }}
        >
          <h3 style={{ marginBottom: "0.75rem" }}>Delivery Times</h3>
          <div className="delivery-times">
            <span>
              🌅 Breakfast: <strong>{toAmPm(schedule.breakfast)}</strong>
            </span>
            <span>
              ☀️ Lunch: <strong>{toAmPm(schedule.lunch)}</strong>
            </span>
            <span>
              🌙 Dinner: <strong>{toAmPm(schedule.dinner)}</strong>
            </span>
          </div>
          {hasPlan && (
            <Link
              to="/cancellation"
              className="btn btn-outline btn-sm"
              style={{ marginTop: "1rem" }}
            >
              Cancel a meal
            </Link>
          )}
        </section>
      )}
      {foods.length === 0 && !hasPlan ? (
        <div className="glass-card empty-state">
          Today&apos;s menu not published yet
        </div>
      ) : (
        <div className="grid-3">
          {categories.map((cat) => {
            const item = foods.find((f) => f.category === cat);
            const status = getStatus(cat);
            // Show card if there's a food item, OR if the customer has a plan with a status entry for this category
            if (
              !item &&
              (!hasPlan || !mealStatus.some((m) => m.mealType === cat))
            )
              return null;
            return (
              <article
                key={cat}
                className="glass-card food-card"
                style={{ padding: 0, overflow: "hidden" }}
              >
                {item && (
                  <img
                    src={item.image || "https://via.placeholder.com/400x200"}
                    alt={item.title}
                  />
                )}
                <div style={{ padding: "1.25rem" }}>
                  <span className="category-tag">{cat}</span>
                  {/* Only show delivery status badge for active tiffin plan holders */}
                  {hasPlan && (
                    <div className="meal-status-row">
                      <span
                        style={{
                          fontSize: "0.85rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Delivery Status
                      </span>
                      <span
                        className={`badge badge-${mealStatusClass(status)}`}
                      >
                        {status}
                      </span>
                    </div>
                  )}
                  {item ? (
                    <>
                      <h3>{item.title}</h3>
                      <p
                        style={{
                          color: "var(--text-secondary)",
                          margin: "0.5rem 0",
                        }}
                      >
                        {item.description}
                      </p>
                      <p className="price">₹{item.price}</p>
                    </>
                  ) : (
                    <p
                      style={{
                        color: "var(--text-muted)",
                        marginTop: "0.5rem",
                      }}
                    >
                      Menu not listed
                    </p>
                  )}
                  {hasPlan && (
                    <p
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--accent-cyan)",
                        marginTop: "0.5rem",
                      }}
                    >
                      Delivery: {toAmPm(schedule?.[cat]) || "—"}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
