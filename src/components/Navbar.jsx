import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar({ onMenuToggle, showSidebar = true }) {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();

  return (
    <header className={`navbar ${!showSidebar ? 'full-width' : ''}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {showSidebar && (
          <button type="button" className="menu-toggle" onClick={onMenuToggle} aria-label="Menu">
            ☰
          </button>
        )}
        <span className="navbar-brand">StayEase</span>
      </div>
      <div className="navbar-actions">
        {user?.role === 'customer' && (
          <Link to="/cart" className="cart-badge btn btn-outline btn-sm">
            🛒 Cart
            {cartCount > 0 && <span>{cartCount}</span>}
          </Link>
        )}
        {user && (
          <>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{user.name}</span>
            <button type="button" className="btn btn-outline btn-sm" onClick={logout}>
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}
