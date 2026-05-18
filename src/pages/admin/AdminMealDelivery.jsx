import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Loading from '../../components/Loading';
import { useToast } from '../../context/ToastContext';
import { mealAPI } from '../../services/api';
import { mealStatusClass } from '../../utils/statusBadge';

const LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' };

export default function AdminMealDelivery() {
  const { showToast } = useToast();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => mealAPI.getTodayDeliveries().then((r) => setList(r.data.data || [])).finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const markDelivered = async (userId, mealType) => {
    try {
      await mealAPI.updateDeliveryStatus({ userId, mealType, status: 'Delivered' });
      showToast(`${LABELS[mealType]} marked delivered`);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed', 'error');
    }
  };

  if (loading) return <DashboardLayout><Loading /></DashboardLayout>;

  return (
    <DashboardLayout>
      <header className="page-header">
        <h1>Today&apos;s Meal Delivery</h1>
        <p>Mark breakfast, lunch, dinner as delivered for each customer</p>
      </header>

      {list.length === 0 ? (
        <div className="glass-card empty-state">No active tiffin customers today</div>
      ) : (
        <div className="mobile-card-list" style={{ display: 'flex' }}>
          {list.map((item) => (
            <article key={item.userId} className="mobile-data-card glass-card">
              <p className="card-title">{item.customer?.name}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                {item.planType} plan · {item.customer?.phone}
              </p>
              {item.meals?.map((m) => (
                <div key={m.mealType} className="card-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>
                      <strong>{LABELS[m.mealType]}</strong>
                      <small style={{ display: 'block', color: 'var(--text-muted)' }}>{m.deliveryTime}</small>
                    </span>
                    <span className={`badge badge-${mealStatusClass(m.status)}`}>{m.status}</span>
                  </div>
                  {m.status !== 'Cancelled' && m.status !== 'Delivered' && (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm btn-block"
                      onClick={() => markDelivered(item.userId, m.mealType)}
                    >
                      Mark {LABELS[m.mealType]} Delivered
                    </button>
                  )}
                </div>
              ))}
            </article>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
