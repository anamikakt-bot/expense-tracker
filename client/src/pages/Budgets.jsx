import { useEffect, useState } from 'react';
import api from '../services/api';
import { EditIcon, TrashIcon } from '../components/ThemeIcons';

const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const now = new Date();
  const [form, setForm] = useState({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    limitAmount: '',
    categoryId: '',
  });
  const [editingId, setEditingId] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [budgetRes, catRes, expRes] = await Promise.all([
        api.get('/budgets'),
        api.get('/categories'),
        api.get('/expenses'),
      ]);
      setBudgets(budgetRes.data);
      setCategories(catRes.data);
      setExpenses(expRes.data);
      setError('');
    } catch (err) {
      setError('Could not load budgets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const getSpentForBudget = (budget) => {
    return expenses
      .filter((e) => {
        const d = new Date(e.date);
        const matchesMonth = d.getMonth() + 1 === budget.month && d.getFullYear() === budget.year;
        const matchesCategory = budget.categoryId ? e.categoryId === budget.categoryId : true;
        return matchesMonth && matchesCategory && e.type === 'EXPENSE';
      })
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, categoryId: form.categoryId || null };
      if (editingId) {
        await api.put(`/budgets/${editingId}`, payload);
      } else {
        await api.post('/budgets', payload);
      }
      setForm({ month: now.getMonth() + 1, year: now.getFullYear(), limitAmount: '', categoryId: '' });
      setEditingId(null);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save budget');
    }
  };

  const handleEdit = (budget) => {
    setEditingId(budget.id);
    setForm({
      month: budget.month,
      year: budget.year,
      limitAmount: budget.limitAmount,
      categoryId: budget.categoryId || '',
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget?')) return;
    await api.delete(`/budgets/${id}`);
    fetchAll();
  };

  const inputStyle = { padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' };

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>Budgets</h1>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginTop: 0 }}>{editingId ? 'Edit Budget' : 'Set a Budget'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={form.month}
            onChange={(e) => setForm({ ...form, month: parseInt(e.target.value) })}
            style={inputStyle}
          >
            {monthNames.map((name, i) => (
              <option key={i} value={i + 1}>{name}</option>
            ))}
          </select>
          <input
            type="number"
            value={form.year}
            onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })}
            style={{ ...inputStyle, width: '90px' }}
          />
          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            style={inputStyle}
          >
            <option value="">Overall (no category)</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Limit amount"
            value={form.limitAmount}
            onChange={(e) => setForm({ ...form, limitAmount: e.target.value })}
            required
            style={{ ...inputStyle, width: '140px' }}
          />
          <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: 'var(--accent-green)', color: '#fff' }}>
            {editingId ? 'Update' : 'Add'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => { setEditingId(null); setForm({ month: now.getMonth() + 1, year: now.getFullYear(), limitAmount: '', categoryId: '' }); }}
              className="icon-btn"
              style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)',  color: 'var(--text-primary)' }}
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {loading ? (
          <p>Loading budgets...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : budgets.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No budgets set yet. Add one above.</p>
        ) : (
          budgets.map((b) => {
            const spent = getSpentForBudget(b);
            const percent = Math.min((spent / b.limitAmount) * 100, 100);
            const overBudget = spent > b.limitAmount;

            return (
              <div key={b.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600 }}>{b.category ? b.category.name : 'Overall'}</p>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {monthNames[b.month - 1]} {b.year}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleEdit(b)} className="icon-btn" style={{ border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}>
                      <EditIcon />
                    </button>
                    <button onClick={() => handleDelete(b.id)} className="icon-btn" style={{ border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}>
                      <TrashIcon />
                    </button>
                  </div>
                </div>
                <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>
                  ₹{spent.toLocaleString()} of ₹{b.limitAmount.toLocaleString()}
                </p>
                <div style={{ background: 'var(--accent-green-light)', borderRadius: '8px', height: '8px', marginBottom: '0.5rem' }}>
                  <div style={{
                    width: `${percent}%`,
                    background: overBudget ? '#D9534F' : 'var(--accent-green)',
                    height: '100%',
                    borderRadius: '8px',
                    transition: 'width 0.3s ease',
                  }} />
                </div>
                {overBudget && (
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#D9534F' }}>Over budget!</p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}