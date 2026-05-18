import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Loading from '../../components/Loading';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { groceryAPI } from '../../services/api';

export default function Grocery() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    groceryAPI.getProducts().then((r) => setProducts(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  const handleAdd = (p) => {
    addToCart(p);
    showToast(`${p.name} added to cart`);
  };

  if (loading) return <DashboardLayout><Loading /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Grocery Store</h1>
        <p>Fresh products delivered to your door</p>
      </div>
      <div className="grid-3">
        {products.map((p) => (
          <article key={p._id} className="glass-card product-card">
            <img src={p.image || 'https://via.placeholder.com/400'} alt={p.name} />
            <div className="product-body">
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.category}</span>
              <h3>{p.name}</h3>
              <p className="price">₹{p.price}</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Stock: {p.stock}</p>
              <button type="button" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem', width: '100%' }} onClick={() => handleAdd(p)}>
                Add to Cart
              </button>
            </div>
          </article>
        ))}
      </div>
    </DashboardLayout>
  );
}
