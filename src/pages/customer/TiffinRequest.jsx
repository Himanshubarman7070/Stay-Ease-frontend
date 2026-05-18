import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { tiffinAPI } from '../../services/api';

export default function TiffinRequest() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    planType: 'Morning',
    duration: 'Weekly',
    address: user?.address || '',
    phone: user?.phone || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await tiffinAPI.create(form);
      showToast('Tiffin request submitted! Awaiting admin approval.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Request failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Tiffin Request</h1>
        <p>Submit a request — your plan activates only after admin approval</p>
      </div>
      <div className="glass-card" style={{ maxWidth: 560, margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Plan Type</label>
            <select className="form-control" value={form.planType} onChange={(e) => setForm({ ...form, planType: e.target.value })}>
              <option>Morning</option>
              <option>Night</option>
              <option>Both</option>
            </select>
          </div>
          <div className="form-group">
            <label>Duration</label>
            <select className="form-control" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })}>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>
          <div className="form-group">
            <label>Mobile Number</label>
            <input className="form-control" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Delivery Address</label>
            <textarea className="form-control" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Submitting...' : 'Send Request'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
