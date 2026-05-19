import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Signing in...');
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      showToast('Welcome back!');
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    } catch (err) {
      if (!err.response) {
        // Network error — Render server is likely waking up; retry once after delay
        showToast('Server is starting up, retrying…', 'error');
        setLoadingMsg('Server waking up…');
        await new Promise((res) => setTimeout(res, 8000));
        try {
          const user = await login(email, password);
          showToast('Welcome back!');
          navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
          return;
        } catch (retryErr) {
          showToast(
            retryErr.response?.data?.message ||
              'Server is still starting. Please wait 30 seconds and try again.',
            'error'
          );
        }
      } else {
        showToast(err.response?.data?.message || 'Login failed', 'error');
      }
    } finally {
      setLoading(false);
      setLoadingMsg('Signing in...');
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
            {loading ? loadingMsg : 'Login'}
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
