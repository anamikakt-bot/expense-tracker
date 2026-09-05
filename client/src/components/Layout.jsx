import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useState } from 'react';
import { HomeIcon, WalletIcon, TargetIcon, SunIcon, MoonIcon, PowerIcon, Logo, SettingsIcon, ShieldIcon, MenuIcon } from './ThemeIcons';


export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);


  const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: <HomeIcon /> },
  { path: '/expenses', label: 'Expenses', icon: <WalletIcon /> },
  { path: '/budgets', label: 'Budgets', icon: <TargetIcon /> },
  { path: '/settings', label: 'Settings', icon: <SettingsIcon /> },
 
];

const adminItems = [
  { path: '/admin', label: 'Admin', icon: <ShieldIcon /> },
];

  return (
    <div className="app-layout" style={{ display: 'flex', minHeight: '100vh' }}>
      <header className="mobile-header">
  <button onClick={() => setDrawerOpen(true)} className="icon-btn" style={{ border: 'none', background: 'transparent', color: '#F7F5F0', display: 'flex' }}>
    <MenuIcon />
  </button>
  <span style={{ fontWeight: 600, fontSize: '0.95rem', letterSpacing: '0.05em' }}>
    {navItems.find((i) => i.path === location.pathname)?.label?.toUpperCase() || 'MENU'}
  </span>
  <button onClick={toggleTheme} className="icon-btn" style={{ border: 'none', background: 'transparent', color: '#F7F5F0', display: 'flex' }}>
    {theme === 'light' ? <MoonIcon size={18} /> : <SunIcon size={18} />}
  </button>
</header>
{drawerOpen && (
  <div
    onClick={() => setDrawerOpen(false)}
    className="drawer-overlay"
  />
)}
  <nav className={`app-sidebar ${drawerOpen ? 'drawer-open' : ''}`} style={{
    background: 'var(--bg-sidebar)',
    padding: '1.25rem 0.75rem',
    display: 'flex',
    flexDirection: 'column',
  }}>
    <button
  onClick={() => setDrawerOpen(false)}
  className="drawer-close"
  style={{ border: 'none', background: 'transparent', color: '#F7F5F0', alignSelf: 'flex-end', marginBottom: '1rem', display: 'none' }}
>
  ✕
</button>
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
      <span className="nav-label">{item.label}</span>
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
          <span className="nav-label">{item.label}</span>
        </Link>
      ))}
    </>
  )}
</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button
  onClick={toggleTheme}
  className="tooltip-btn desktop-only-toggle"
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
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}