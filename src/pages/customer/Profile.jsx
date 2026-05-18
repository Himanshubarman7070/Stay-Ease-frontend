import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authAPI } from '../../services/api';

export default function Profile() {
  const { user, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '', email: user?.email || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.updateProfile(profile);
      await refreshProfile();
      showToast('Profile updated');
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    try {
      await authAPI.changePassword(passwords);
      showToast('Password changed');
      setPasswords({ currentPassword: '', newPassword: '' });
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed', 'error');
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Profile</h1>
        <p>Manage your account</p>
      </div>
      <div className="grid-2">
        <form className="glass-card" onSubmit={saveProfile}>
          <h3 style={{ marginBottom: '1rem' }}>Update Profile</h3>
          {['name', 'email', 'phone', 'address'].map((field) => (
            <div key={field} className="form-group">
              <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
              <input className="form-control" value={profile[field]} onChange={(e) => setProfile({ ...profile, [field]: e.target.value })} />
            </div>
          ))}
          <button type="submit" className="btn btn-primary" disabled={loading}>Save</button>
        </form>
        <form className="glass-card" onSubmit={changePassword}>
          <h3 style={{ marginBottom: '1rem' }}>Change Password</h3>
          <div className="form-group">
            <label>Current Password</label>
            <input type="password" className="form-control" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input type="password" className="form-control" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} required minLength={6} />
          </div>
          <button type="submit" className="btn btn-primary">Update Password</button>
        </form>
      </div>
    </DashboardLayout>
  );
}
