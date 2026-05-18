import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useToast } from '../../context/ToastContext';
import { menuAPI } from '../../services/api';

const empty = { name: '', description: '', category: 'lunch', price: '', image: '' };

export default function AdminMenu() {
  const { showToast } = useToast();
  const [menus, setMenus] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);

  const load = () => menuAPI.getAll().then((r) => setMenus(r.data.data || []));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, price: Number(form.price) };
    try {
      if (editId) {
        await menuAPI.update(editId, payload);
        showToast('Menu updated');
      } else {
        await menuAPI.create(payload);
        showToast('Menu added');
      }
      setForm(empty);
      setEditId(null);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed', 'error');
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Menu Management</h1>
        <p>Add, update, delete menu items</p>
      </div>
      <div className="grid-2">
        <form className="glass-card" onSubmit={handleSubmit}>
          <div className="form-group"><label>Name</label><input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="form-group"><label>Description</label><textarea className="form-control" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="form-group"><label>Price</label><input type="number" className="form-control" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required /></div>
          <div className="form-group"><label>Image URL</label><input className="form-control" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} /></div>
          <button type="submit" className="btn btn-primary">{editId ? 'Update' : 'Add'} Menu</button>
        </form>
        <div className="glass-card">
          {menus.map((m) => (
            <div key={m._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--glass-border)' }}>
              <span>{m.name} — ₹{m.price}</span>
              <span>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => { setEditId(m._id); setForm({ name: m.name, description: m.description, category: m.category, price: m.price, image: m.image }); }}>Edit</button>
                <button type="button" className="btn btn-danger btn-sm" style={{ marginLeft: '0.5rem' }} onClick={async () => { await menuAPI.delete(m._id); load(); }}>Delete</button>
              </span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
