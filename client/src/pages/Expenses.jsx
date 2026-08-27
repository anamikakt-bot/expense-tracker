import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newCategory, setNewCategory] = useState('');

  const [form, setForm] = useState({ amount: '', description: '', categoryId: '', type: 'EXPENSE', date: '' });
  const [editingId, setEditingId] = useState(null);

  const [filters, setFilters] = useState({ categoryId: '', from: '', to: '' });

  const fetchCategories = async () => {
    const res = await api.get('/categories');
    setCategories(res.data);
  };

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.categoryId) params.categoryId = filters.categoryId;
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;

      const res = await api.get('/expenses', { params });
      setExpenses(res.data);
      setError('');
    } catch (err) {
      setError('Could not load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [filters]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/expenses/${editingId}`, form);
      } else {
        await api.post('/expenses', form);
      }
      setForm({ amount: '', description: '', categoryId: '', type: 'EXPENSE', date: '' });
      setEditingId(null);
      fetchExpenses();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save expense');
    }
  };
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    try {
      await api.post('/categories', { name: newCategory.trim() });
      setNewCategory('');
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not add category');
    }
  };

  const handleEdit = (expense) => {
    setEditingId(expense.id);
    setForm({
      amount: expense.amount,
      description: expense.description || '',
      categoryId: expense.categoryId,
      type: expense.type,
      date: expense.date.split('T')[0],
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    await api.delete(`/expenses/${id}`);
    fetchExpenses();
  };

  const inputStyle = { padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' };

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>Expenses</h1>
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginTop: 0 }}>Categories</h3>
        <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <input 
          type="text"
          placeholder="New category name"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          style={{ ...inputStyle, flex: 1 }}
          />
          <button type="submit" style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: 'var(--accent-green)', color: '#fff' }}>
            Add Category
          </button>
        </form>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {categories.map((c) => (
            <span key={c.id} style={{
              padding: '0.3rem 0.75rem',
              borderRadius: '20px',
              background: 'var(--accent-green-light)',
              fontSize: '0.85rem',
            }}>
              {c.name}
            </span>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginTop: 0 }}>{editingId ? 'Edit Expense' : 'Add Expense'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="number"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
            style={{ ...inputStyle, width: '120px' }}
          />
          <input
            type="text"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            style={{ ...inputStyle, flex: 1, minWidth: '150px' }}
          />
          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            required
            style={inputStyle}
          >
            <option value="">Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            style={inputStyle}
          >
            <option value="EXPENSE">Expense</option>
            <option value="INCOME">Income</option>
          </select>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            style={inputStyle}
          />
          <button type="submit" style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: 'var(--accent-green)', color: '#fff' }}>
            {editingId ? 'Update' : 'Add'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => { setEditingId(null); setForm({ amount: '', description: '', categoryId: '', type: 'EXPENSE', date: '' }); }}
              style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)' }}
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <select
          value={filters.categoryId}
          onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
          style={inputStyle}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input
          type="date"
          value={filters.from}
          onChange={(e) => setFilters({ ...filters, from: e.target.value })}
          style={inputStyle}
        />
        <input
          type="date"
          value={filters.to}
          onChange={(e) => setFilters({ ...filters, to: e.target.value })}
          style={inputStyle}
        />
      </div>

      <div className="card">
        {loading ? (
          <p>Loading expenses...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : expenses.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No expenses found. Add your first one above.</p>
        ) : (
          expenses.map((exp) => (
            <div key={exp.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem 0',
              borderBottom: '1px solid var(--border-color)',
            }}>
              <div>
                <p style={{ margin: 0 }}>{exp.description || exp.category.name}</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {exp.category.name} • {new Date(exp.date).toLocaleDateString()} • {exp.type}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <p style={{ margin: 0, fontWeight: 600, color: exp.type === 'INCOME' ? 'var(--accent-green)' : 'var(--accent-terracotta)' }}>
                  {exp.type === 'INCOME' ? '+' : '-'}₹{exp.amount.toLocaleString()}
                </p>
                <button onClick={() => handleEdit(exp)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>✏️</button>
                <button onClick={() => handleDelete(exp.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>🗑️</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}