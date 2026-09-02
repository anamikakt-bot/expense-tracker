import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Logo } from '../components/ThemeIcons';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.put(`/auth/reset-password/${token}`, { newPassword: password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(0deg, #6B8E6E 0%, #F7F5F0 100%)',
    }}>
      <div className="card" style={{ width: '380px' }}>
        <div className="sidebar-logo" style={{ margin: '0 0 1.5rem 0', width: '60px', height: '60px', flexShrink: 0 }}>
          <Logo size={30} />
        </div>
        <h2 style={{ marginBottom: '1.5rem' }}>Reset password</h2>

        {success ? (
          <p style={{ color: 'var(--accent-green)' }}>Password reset successfully. Redirecting to login...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label>New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="auth-field">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            {error && <p style={{ color: '#D9534F', fontSize: '0.85rem' }}>{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary auth-submit-btn">
              {loading ? 'Resetting...' : 'Reset password'}
            </button>
          </form>
        )}

        <p style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
          <Link to="/login">Back to login</Link>
        </p>
      </div>
    </div>
  );
}