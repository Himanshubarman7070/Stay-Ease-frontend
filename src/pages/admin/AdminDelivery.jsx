import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useToast } from '../../context/ToastContext';
import { mealAPI } from '../../services/api';

export default function AdminDelivery() {
  const { showToast } = useToast();
  const [form, setForm] = useState({ breakfast: '08:00', lunch: '13:00', dinner: '20:00' });

  useEffect(() => {
    mealAPI.getSchedule().then((r) => {
      const s = r.data.data;
      setForm({ breakfast: s.breakfast, lunch: s.lunch, dinner: s.dinner });
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await mealAPI.updateSchedule(form);
      showToast('Delivery times updated');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed', 'error');
    }
  };

  return (
    <DashboardLayout>
      <header className="page-header">
        <h1>Delivery Schedule</h1>
        <p>Customers must cancel meals 3 hours before these times</p>
      </header>
      <form className="glass-card" style={{ maxWidth: 480 }} onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Breakfast Delivery</label>
          <input type="time" className="form-control calendar-input" value={form.breakfast} onChange={(e) => setForm({ ...form, breakfast: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Lunch Delivery</label>
          <input type="time" className="form-control calendar-input" value={form.lunch} onChange={(e) => setForm({ ...form, lunch: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Dinner Delivery</label>
          <input type="time" className="form-control calendar-input" value={form.dinner} onChange={(e) => setForm({ ...form, dinner: e.target.value })} required />
        </div>
        <button type="submit" className="btn btn-primary">Save Schedule</button>
      </form>
    </DashboardLayout>
  );
}
