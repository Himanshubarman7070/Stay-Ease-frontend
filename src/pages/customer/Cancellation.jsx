import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useToast } from '../../context/ToastContext';
import { mealAPI } from '../../services/api';

const MEAL_LABELS = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  morning: 'Morning',
  night: 'Night',
};

export default function Cancellation() {
  const { showToast } = useToast();
  const [summary, setSummary] = useState(null);
  const [cancellations, setCancellations] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [bulkStartDate, setBulkStartDate] = useState('');
  const [mealType, setMealType] = useState('');
  const [bulkMeals, setBulkMeals] = useState([]);
  const [period, setPeriod] = useState('week1');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const [sumRes, canRes] = await Promise.all([mealAPI.getSummary(), mealAPI.getMyCancellations()]);
    setSummary(sumRes.data.data);
    setCancellations(canRes.data.data || []);
    if (!mealType && sumRes.data.data?.allowedMeals?.length) {
      setMealType(sumRes.data.data.allowedMeals[0]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleBulkMeal = (m) => {
    setBulkMeals((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  };

  const handleSingleCancel = async (e) => {
    e.preventDefault();
    if (!selectedDate || !mealType) {
      showToast('Select date and meal type', 'error');
      return;
    }
    setLoading(true);
    try {
      const { data } = await mealAPI.cancelMeal({ date: selectedDate, mealType, reason });
      showToast(data.message || 'Meal cancelled');
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCancel = async (e) => {
    e.preventDefault();
    if (!bulkStartDate || !bulkMeals.length) {
      showToast('Select start date and at least one meal', 'error');
      return;
    }
    setLoading(true);
    try {
      const { data } = await mealAPI.cancelBulk({
        startDate: bulkStartDate,
        period,
        mealTypes: bulkMeals,
        reason,
      });
      showToast(data.message || 'Bulk cancellation done');
      if (data.data?.errors?.length) {
        showToast(`${data.data.errors.length} skipped (deadline passed or duplicate)`, 'error');
      }
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const schedule = summary?.deliverySchedule;
  const allowed = summary?.allowedMeals || [];

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Cancel Meals</h1>
        <p>Cancel before 3 hours of delivery — ₹60 charge per tiffin</p>
      </div>

      {!summary?.planType ? (
        <div className="glass-card empty-state">Activate a tiffin plan to cancel meals</div>
      ) : (
        <>
          <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
            <div className="glass-card stat-card">
              <div className="stat-value">₹{summary?.totalDue || 0}</div>
              <div className="stat-label">Total Due</div>
            </div>
            <div className="glass-card stat-card">
              <div className="stat-value">{summary?.breakdown?.total || 0}</div>
              <div className="stat-label">Total Cancelled Tiffins</div>
            </div>
            <div className="glass-card stat-card">
              <div className="stat-value">₹{summary?.chargePerTiffin || 60}</div>
              <div className="stat-label">Per Tiffin Charge</div>
            </div>
          </div>

          <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Delivery Times (Today)</h3>
            <div className="delivery-times">
              <span>🌅 Breakfast: <strong>{schedule?.breakfast || '08:00'}</strong></span>
              <span>☀️ Lunch: <strong>{schedule?.lunch || '13:00'}</strong></span>
              <span>🌙 Dinner: <strong>{schedule?.dinner || '20:00'}</strong></span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.75rem' }}>
              Morning uses breakfast time · Night uses dinner time · Plan: {summary.planType}
            </p>
          </div>

          <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Your Tiffin Counts</h3>
            <div className="tiffin-count-grid">
              {['breakfast', 'lunch', 'dinner', 'morning', 'night'].map((m) => (
                <div key={m} className="tiffin-count-item">
                  <span>{MEAL_LABELS[m]}</span>
                  <strong>{summary?.breakdown?.[m] || 0}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="grid-2">
            <form className="glass-card" onSubmit={handleSingleCancel}>
              <h3 style={{ marginBottom: '1rem' }}>Cancel Single Meal (Today / Pick Date)</h3>
              <div className="form-group">
                <label>Select Date</label>
                <input
                  type="date"
                  className="form-control calendar-input"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Meal Type</label>
                <select className="form-control" value={mealType} onChange={(e) => setMealType(e.target.value)}>
                  {allowed.map((m) => (
                    <option key={m} value={m}>{MEAL_LABELS[m]}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Reason (optional)</label>
                <textarea className="form-control" value={reason} onChange={(e) => setReason(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                Cancel This Meal (₹60)
              </button>
            </form>

            <form className="glass-card" onSubmit={handleBulkCancel}>
              <h3 style={{ marginBottom: '1rem' }}>Cancel 1 or 2 Weeks</h3>
              <div className="form-group">
                <label>Start Date (Calendar)</label>
                <input
                  type="date"
                  className="form-control calendar-input"
                  value={bulkStartDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setBulkStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Duration</label>
                <select className="form-control" value={period} onChange={(e) => setPeriod(e.target.value)}>
                  <option value="week1">1 Week (7 days)</option>
                  <option value="week2">2 Weeks (14 days)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Meals to Cancel</label>
                <div className="meal-checkboxes">
                  {allowed.map((m) => (
                    <label key={m} className="meal-check">
                      <input
                        type="checkbox"
                        checked={bulkMeals.includes(m)}
                        onChange={() => toggleBulkMeal(m)}
                      />
                      {MEAL_LABELS[m]}
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                Cancel Bulk Meals
              </button>
            </form>
          </div>

          <div className="glass-card" style={{ marginTop: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Cancellation History</h3>
            {cancellations.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No cancellations yet</p>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Meal</th>
                      <th>Charge</th>
                      <th>Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cancellations.map((c) => (
                      <tr key={c._id}>
                        <td>{new Date(c.date).toLocaleDateString()}</td>
                        <td>{MEAL_LABELS[c.mealType]}</td>
                        <td>₹{c.chargeAmount}</td>
                        <td>{c.isPaid ? <span className="badge badge-accepted">Paid</span> : <span className="badge badge-pending">Due</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
