import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useToast } from '../../context/ToastContext';
import { foodAPI } from '../../services/api';

const empty = { title: '', category: 'breakfast', description: '', image: '', price: '', date: new Date().toISOString().split('T')[0] };

export default function AdminTodayFood() {
  const { showToast } = useToast();
  const [foods, setFoods] = useState([]);
  const [form, setForm] = useState(empty);

  const load = () => foodAPI.getAll().then((r) => setFoods(r.data.data || []));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await foodAPI.create({ ...form, price: Number(form.price), date: new Date(form.date) });
      showToast('Food added');
      setForm(empty);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    await foodAPI.delete(id);
    showToast('Deleted');
    load();
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Today&apos;s Food</h1>
        <p>Add and manage daily menu</p>
      </div>
      <div className="grid-2">
        <form className="glass-card" onSubmit={handleSubmit}>
          <div className="form-group"><label>Title</label><input className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
          <div className="form-group">
            <label>Category</label>
            <select className="form-control" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
            </select>
          </div>
          <div className="form-group"><label>Description</label><textarea className="form-control" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="form-group"><label>Image URL</label><input className="form-control" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} /></div>
          <div className="form-group"><label>Price</label><input type="number" className="form-control" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required /></div>
          <div className="form-group"><label>Date</label><input type="date" className="form-control" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          <button type="submit" className="btn btn-primary">Add Food</button>
        </form>
        <div className="glass-card">
          <h3>Recent Items</h3>
          {foods.map((f) => (
            <div key={f._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--glass-border)' }}>
              <span>{f.title} ({f.category}) — ₹{f.price}</span>
              <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(f._id)}>Delete</button>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
