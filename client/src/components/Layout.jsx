import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { HomeIcon, WalletIcon, TargetIcon, SunIcon, MoonIcon, PowerIcon, Logo, SettingsIcon} from './ThemeIcons';

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();


  const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: <HomeIcon /> },
  { path: '/expenses', label: 'Expenses', icon: <WalletIcon /> },
  { path: '/budgets', label: 'Budgets', icon: <TargetIcon /> },
  { path: '/settings', label: 'Settings', icon: <SettingsIcon /> },
];

const adminItems = [
  { path: '/admin', label: 'Admin', icon: <SettingsIcon /> },
];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <nav style={{
        width: '160px',
        background: 'var(--bg-sidebar)',
        padding: '1.25rem 0.75rem',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div className="sidebar-logo">
          <Logo size={30} />
        </div>

        <div className="nav-stack">
  {navItems.map((item) => (
    <Link
      key={item.path}
      to={item.path}
      className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
    >
      {item.icon}
      {item.label}
    </Link>
  ))}

  {user?.role === 'ADMIN' && (
    <>
      <p style={{
        fontSize: '0.65rem',
        letterSpacing: '0.08em',
        color: 'rgba(247, 245, 240, 0.4)',
        margin: '1rem 0 0.25rem 0.5rem',
        textTransform: 'uppercase',
      }}>
        Admin
      </p>
      {adminItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
        >
          {item.icon}
          {item.label}
        </Link>
      ))}
    </>
  )}
</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button
            onClick={toggleTheme}
            className="tooltip-btn"
            data-tooltip={theme === 'light' ? 'Dark mode' : 'Light mode'}
          >
            {theme === 'light' ? <MoonIcon size={18} /> : <SunIcon size={18} />}
          </button>
          {user && (
            <button
              onClick={logout}
              className="tooltip-btn"
              data-tooltip="Logout"
            >
              <PowerIcon />
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