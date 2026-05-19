import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const RETRY_SECONDS = 50; // Render cold start can take up to ~60s

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef(null);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    return () => clearInterval(countdownRef.current);
  }, []);

  const startCountdown = () => {
    setCountdown(RETRY_SECONDS);
    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(countdownRef.current); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      showToast('Welcome back!');
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    } catch (err) {
      if (!err.response) {
        // Network error — Render free tier is cold-starting; wait and retry
        startCountdown();
        await new Promise((res) => setTimeout(res, RETRY_SECONDS * 1000));
        try {
          const user = await login(email, password);
          showToast('Welcome back!');
          navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
          return;
        } catch (retryErr) {
          showToast(
            retryErr.response?.data?.message || 'Login failed. Please try again.',
            'error'
          );
        }
      } else {
        showToast(err.response?.data?.message || 'Login failed', 'error');
      }
    } finally {
      setLoading(false);
      setCountdown(0);
      clearInterval(countdownRef.current);
    }
  };

  return (
    <div className="auth-page">
      <div className="glass-card auth-card">
        <h2>Welcome Back</h2>
        <p className="subtitle">Login to StayEase</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {countdown > 0
              ? `Server waking up… retrying in ${countdown}s`
              : loading
              ? 'Signing in...'
              : 'Login'}
          </button>
        </form>
        <p className="auth-footer">
          Don&apos;t have an account? <Link to="/signup">Sign up</Link>
        </p>
        <p className="auth-footer" style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Admin: admin@stayease.com / admin123
          <br />
          If invalid, run in backend folder: <code style={{ color: 'var(--accent-cyan)' }}>npm run create-admin</code>
        </p>
      </div>
    </div>
  );
}
