import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/ThemeIcons';

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [mode, setMode] = useState(location.pathname === '/register' ? 'register' : 'login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMode(location.pathname === '/register' ? 'register' : 'login');
  }, [location.pathname]);

  const switchMode = (target) => {
    setError('');
    setForm({ name: '', email: '', password: '' });
    navigate(`/${target}`, { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'register') {
        await register(form.name, form.email, form.password);
      } else {
        await login(form.email, form.password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const isRegister = mode === 'register';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(0deg, #131613 0%, #2C3B2E 100%)',
    }}>
      <div className="auth-wrapper">
        <div className="auth-form-panel" style={{ transform: isRegister ? 'translateX(100%)' : 'translateX(0)' }}>
          <div className="sidebar-logo" style={{ margin: '0 0 2rem 0', width: '70px', height: '70px', flexShrink: 0, alignSelf: 'flex-start' }}>
            <Logo size={30} />
          </div>
          <h2 style={{ marginBottom: '0.25rem' }}>{isRegister ? 'Sign up' : 'Login'}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.75rem' }}>
            {isRegister ? 'Create an account to start tracking.' : 'Welcome back, glad to see you.'}
          </p>

          <form onSubmit={handleSubmit}>
            {isRegister && (
              <div className="auth-field">
                <label>Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
            )}
            <div className="auth-field">
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="auth-field">
              <label>Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
              />
            </div>

            {error && <p style={{ color: '#D9534F', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary auth-submit-btn">
              {loading ? '...' : isRegister ? 'Sign up' : 'Login'}
            </button>
          </form>
        </div>

        <div className="auth-image-panel" style={{ transform: isRegister ? 'translateX(-100%)' : 'translateX(0)' }}>
          <div className="auth-image-overlay" />
          <button
            className="auth-toggle-btn"
            onClick={() => switchMode(isRegister ? 'login' : 'register')}
          >
            {isRegister ? 'Sign in' : 'Sign up'}
          </button>
          <div className="auth-image-text">
            <h3>{isRegister ? 'Already tracking?' : 'New here?'}</h3>
            <p>{isRegister ? 'Sign in to pick up where you left off.' : 'Create an account and take control of your spending.'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}