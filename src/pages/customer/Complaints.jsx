import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useToast } from '../../context/ToastContext';
import { complaintAPI } from '../../services/api';

export default function Complaints() {
  const { showToast } = useToast();
  const [form, setForm] = useState({ type: 'complaint', subject: '', message: '' });
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = () => complaintAPI.getMy().then((r) => setList(r.data.data || []));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await complaintAPI.create(form);
      showToast('Submitted successfully');
      setForm({ type: 'complaint', subject: '', message: '' });
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Complaints & Feedback</h1>
        <p>We value your voice</p>
      </div>
      <div className="grid-2">
        <form className="glass-card" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Type</label>
            <select className="form-control" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="complaint">Complaint</option>
              <option value="feedback">Feedback</option>
            </select>
          </div>
          <div className="form-group">
            <label>Subject</label>
            <input className="form-control" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Message</label>
            <textarea className="form-control" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>Submit</button>
        </form>
        <div className="glass-card">
          <h3>Track Status</h3>
          {list.map((c) => (
            <article key={c._id} style={{ padding: '1rem 0', borderBottom: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{c.subject || c.type}</strong>
                <span className={`badge badge-${c.status === 'Resolved' ? 'resolved' : 'open'}`}>{c.status}</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{c.message}</p>
              {c.adminReply && <p style={{ marginTop: '0.5rem', color: 'var(--accent-cyan)' }}>Reply: {c.adminReply}</p>}
            </article>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
