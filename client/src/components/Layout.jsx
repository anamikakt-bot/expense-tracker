import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/expenses', label: 'Expenses' },
    { path: '/budgets', label: 'Budgets' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <nav style={{
        width: '220px',
        background: 'var(--bg-sidebar)',
        color: '#F7F5F0',
        padding: '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", marginBottom: '2.5rem' }}>
          Expense Tracker
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                color: '#F7F5F0',
                textDecoration: 'none',
                background: location.pathname === item.path ? 'rgba(255,255,255,0.1)' : 'transparent',
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            onClick={toggleTheme}
            style={{
              background: 'rgba(255,255,255,0.1)',
              color: '#F7F5F0',
              border: 'none',
              borderRadius: '10px',
              padding: '0.6rem',
            }}
          >
            {theme === 'light' ? '🌙 Dark mode' : '☀️ Light mode'}
          </button>
          {user && (
            <button
              onClick={logout}
              style={{
                background: 'transparent',
                color: '#F7F5F0',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '10px',
                padding: '0.6rem',
              }}
            >
              Logout
            </button>
          )}
        </div>
      </nav>
      <main style={{ flex: 1, padding: '2.5rem', background: 'var(--bg-primary)' }}>
        <Outlet />
      </main>
    </div>
  );
}