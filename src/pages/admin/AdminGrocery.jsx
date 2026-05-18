import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useToast } from '../../context/ToastContext';
import { groceryAPI } from '../../services/api';

const empty = { name: '', price: '', stock: '', category: 'General', image: '' };

export default function AdminGrocery() {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);

  const load = () => groceryAPI.getAllProducts().then((r) => setProducts(r.data.data || []));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };
    try {
      if (editId) {
        await groceryAPI.updateProduct(editId, payload);
        showToast('Product updated');
      } else {
        await groceryAPI.createProduct(payload);
        showToast('Product added');
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
        <h1>Grocery Management</h1>
      </div>
      <div className="grid-2">
        <form className="glass-card" onSubmit={handleSubmit}>
          <div className="form-group"><label>Name</label><input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="form-group"><label>Price</label><input type="number" className="form-control" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required /></div>
          <div className="form-group"><label>Stock</label><input type="number" className="form-control" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required /></div>
          <div className="form-group"><label>Category</label><input className="form-control" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
          <div className="form-group"><label>Image URL</label><input className="form-control" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} /></div>
          <button type="submit" className="btn btn-primary">{editId ? 'Update' : 'Add'} Product</button>
        </form>
        <div className="glass-card table-wrap">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td>₹{p.price}</td>
                  <td>{p.stock}</td>
                  <td className="action-buttons">
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => { setEditId(p._id); setForm({ name: p.name, price: p.price, stock: p.stock, category: p.category, image: p.image }); }}>Edit</button>
                    <button type="button" className="btn btn-danger btn-sm" onClick={async () => { await groceryAPI.deleteProduct(p._id); load(); }}>Del</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
