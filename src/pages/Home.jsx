import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function Home() {
  const { user } = useAuth();

  return (
    <>
      <Navbar showSidebar={false} />
      <div className="main-content full-width" style={{ paddingTop: 'var(--navbar-height)' }}>
        <section className="hero">
          <h1>
            Welcome to <span>StayEase</span>
          </h1>
          <p>Smart Tiffin & Grocery Management — fresh meals delivered, groceries at your doorstep.</p>
          <div className="hero-buttons">
            {user ? (
              <Link to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} className="btn btn-primary">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/signup" className="btn btn-primary">Get Started</Link>
                <Link to="/login" className="btn btn-outline">Login</Link>
              </>
            )}
          </div>
        </section>
        <div className="page-container">
          <div className="grid-3" style={{ marginBottom: '3rem' }}>
            <div className="glass-card stat-card">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🍱</div>
              <h3>Tiffin Plans</h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Morning, Night, or Both — Weekly & Monthly</p>
            </div>
            <div className="glass-card stat-card">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🛒</div>
              <h3>Grocery Store</h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Fresh products with easy cart checkout</p>
            </div>
            <div className="glass-card stat-card">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📋</div>
              <h3>Daily Menu</h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>See today&apos;s breakfast, lunch & dinner</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
