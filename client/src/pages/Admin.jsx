import { useEffect, useState } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export default function Admin() {
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [activity, setActivity] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [usersRes, statsRes, catRes, activityRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/stats'),
        api.get('/admin/categories'),
        api.get('/admin/activity'),
      ]);
      setUsers(usersRes.data);
      setStats(statsRes.data);
      setCategories(catRes.data);
      setActivity(activityRes.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleRoleToggle = async (user) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      await api.put(`/admin/users/${user.id}/role`, { role: newRole });
      showToast(`${user.name} is now ${newRole}`);
      fetchAll();
    } catch (err) {
      showToast('Could not update role', 'error');
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    try {
      await api.post('/admin/categories', { name: newCategory.trim() });
      setNewCategory('');
      showToast('Category added');
      fetchAll();
    } catch (err) {
      showToast(err.response?.data?.error || 'Could not add category', 'error');
    }
  };

  const handleToggleCategory = async (cat) => {
    try {
      await api.put(`/admin/categories/${cat.id}/toggle`);
      fetchAll();
    } catch (err) {
      showToast('Could not update category', 'error');
    }
  };

  const inputStyle = { padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' };

  if (loading) return <p>Loading admin panel...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  const tabs = [
    { id: 'users', label: 'Users' },
    { id: 'categories', label: 'Categories' },
    { id: 'activity', label: 'Activity Log' },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '0.25rem' }}>Admin Dashboard</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        System overview and management.
      </p>

      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}>
          {[
            { label: 'Users', value: stats.totalUsers },
            { label: 'Expenses Logged', value: stats.totalExpenses },
            { label: 'Budgets Set', value: stats.totalBudgets },
            { label: 'Total Tracked', value: `₹${stats.totalTracked.toLocaleString()}` },
          ].map((card) => (
            <div key={card.label} className="card">
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                {card.label}
              </p>
              <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{card.value}</p>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '0.6rem 1rem',
              border: 'none',
              background: 'transparent',
              color: tab === t.id ? 'var(--accent-green)' : 'var(--text-secondary)',
              borderBottom: tab === t.id ? '2px solid var(--accent-green)' : '2px solid transparent',
              fontWeight: tab === t.id ? 600 : 400,
              cursor: 'pointer',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'users' && (
        <div className="card">
          <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>All Users</h3>
          {users.map((u) => (
            <div key={u.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem 0',
              borderBottom: '1px solid var(--border-color)',
            }}>
              <div>
                <p style={{ margin: 0, fontWeight: 600 }}>{u.name}</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {u.email} • Joined {new Date(u.createdAt).toLocaleDateString()} • {u._count.expenses} expenses • {u._count.budgets} budgets
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '12px',
                  background: u.role === 'ADMIN' ? 'var(--accent-terracotta-light)' : 'var(--accent-green-light)',
                }}>
                  {u.role}
                </span>
                <button onClick={() => handleRoleToggle(u)} className="icon-btn" style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.35rem 0.75rem', background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  Make {u.role === 'ADMIN' ? 'User' : 'Admin'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'categories' && (
        <div className="card">
          <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>System Categories</h3>
          <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="New category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              style={{ ...inputStyle, flex: 1 }}
            />
            <button type="submit" className="btn-primary">Add</button>
          </form>
          {categories.map((cat) => (
            <div key={cat.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.6rem 0',
              borderBottom: '1px solid var(--border-color)',
            }}>
              <span>{cat.name}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{
                  fontSize: '0.75rem',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '12px',
                  background: cat.active ? 'var(--accent-green-light)' : 'var(--accent-terracotta-light)',
                }}>
                  {cat.active ? 'Active' : 'Inactive'}
                </span>
                <button onClick={() => handleToggleCategory(cat)} className="icon-btn" style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.3rem 0.7rem', background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  {cat.active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'activity' && (
        <div className="card">
          <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Activity Log</h3>
          {activity.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No activity yet.</p>
          ) : (
            activity.map((log) => (
              <div key={log.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <p style={{ margin: 0, fontWeight: 600 }}>{log.action}</p>
                {log.details && <p style={{ margin: '0.2rem 0', fontSize: '0.85rem' }}>{log.details}</p>}
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {log.userName || 'System'} • {new Date(log.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}