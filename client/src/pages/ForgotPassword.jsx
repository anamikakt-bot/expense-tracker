import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Logo } from '../components/ThemeIcons';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
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
        <h2 style={{ marginBottom: '0.25rem' }}>Forgot password</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Enter your email and we'll send you a reset link.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {error && <p style={{ color: '#D9534F', fontSize: '0.85rem' }}>{error}</p>}
          {message && <p style={{ color: 'var(--accent-green)', fontSize: '0.85rem' }}>{message}</p>}
          <button type="submit" disabled={loading} className="btn-primary auth-submit-btn">
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        <p style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
          <Link to="/login">Back to login</Link>
        </p>
      </div>
    </div>
  );
}