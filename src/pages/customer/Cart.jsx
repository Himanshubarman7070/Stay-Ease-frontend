import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { groceryAPI } from '../../services/api';
import { useState } from 'react';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState(user?.address || '');

  const placeOrder = async () => {
    if (!cart.length) return;
    setLoading(true);
    try {
      await groceryAPI.placeOrder({
        products: cart.map((i) => ({ productId: i.productId, name: i.name, quantity: i.quantity })),
        deliveryAddress: address,
      });
      clearCart();
      showToast('Order placed successfully!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Order failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Shopping Cart</h1>
        <p>{cart.length} item(s)</p>
      </div>
      <div className="grid-2">
        <div className="glass-card">
          {cart.length === 0 ? (
            <p className="empty-state">Your cart is empty. <Link to="/grocery">Shop now</Link></p>
          ) : (
            cart.map((item) => (
              <div key={item.productId} className="cart-item">
                <img src={item.image || 'https://via.placeholder.com/64'} alt={item.name} />
                <div style={{ flex: 1 }}>
                  <strong>{item.name}</strong>
                  <p>₹{item.price}</p>
                  <div className="qty-control">
                    <button type="button" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
                    <button type="button" className="btn btn-danger btn-sm" style={{ marginLeft: 'auto' }} onClick={() => removeFromCart(item.productId)}>Remove</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="glass-card">
          <h3>Order Summary</h3>
          <p style={{ fontSize: '1.5rem', margin: '1rem 0', color: 'var(--accent-cyan)' }}>Total: ₹{cartTotal}</p>
          <div className="form-group">
            <label>Delivery Address</label>
            <textarea className="form-control" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <button type="button" className="btn btn-primary btn-block" disabled={!cart.length || loading} onClick={placeOrder}>
            {loading ? 'Placing...' : 'Place Order'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
