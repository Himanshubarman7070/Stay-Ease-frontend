import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useToast } from '../../context/ToastContext';
import { complaintAPI } from '../../services/api';

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [replies, setReplies] = useState({});
  const { showToast } = useToast();

  const load = () => complaintAPI.getAll().then((r) => setComplaints(r.data.data || []));
  useEffect(() => { load(); }, []);

  const handleReply = async (id) => {
    try {
      await complaintAPI.update(id, { adminReply: replies[id], status: 'Resolved' });
      showToast('Reply sent');
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed', 'error');
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Complaint Management</h1>
      </div>
      <div className="grid-2">
        {complaints.map((c) => (
          <article key={c._id} className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>{c.userId?.name}</strong>
              <span className={`badge badge-${c.status === 'Resolved' ? 'resolved' : 'open'}`}>{c.status}</span>
            </div>
            <p style={{ margin: '0.75rem 0', color: 'var(--text-secondary)' }}>{c.message}</p>
            <input className="form-control" placeholder="Admin reply..." value={replies[c._id] || ''} onChange={(e) => setReplies({ ...replies, [c._id]: e.target.value })} />
            <button type="button" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }} onClick={() => handleReply(c._id)}>Reply & Resolve</button>
          </article>
        ))}
      </div>
    </DashboardLayout>
  );
}
