import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { SunIcon, MoonIcon } from './ThemeIcons';

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
          className="sidebar-btn"
          >
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            lineHeight: 1,
          }}>
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            <span style={{ lineHeight: '18px' }}>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>
          </span>
        </button>
        {user && (
          <button 
          onClick={logout}
          className="sidebar-btn sidebar-btn-outline"
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