import { Logo } from './ThemeIcons';

export default function LoadingSpinner({ fullPage = false, label = 'Loading...' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      padding: fullPage ? '0' : '3rem 0',
      minHeight: fullPage ? '100vh' : 'auto',
    }}>
      <div className="loading-badge">
        <Logo size={22} />
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>{label}</p>
    </div>
  );
}