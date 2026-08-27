import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/summary')
      .then((res) => setData(res.data))
      .catch(() => setError('Could not load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!data) return null;

  const summaryCards = [
    { label: 'Income', value: data.income, accent: 'var(--accent-green)' },
    { label: 'Expenses', value: data.expenses, accent: 'var(--accent-terracotta)' },
    { label: 'Net Savings', value: data.netSavings, accent: 'var(--accent-green)' },
    { label: 'Remaining Budget', value: data.remainingBudget, accent: 'var(--accent-terracotta)' },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '0.25rem' }}>Dashboard</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Here's your financial snapshot for this month.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem',
      }}>
        {summaryCards.map((card) => (
          <div key={card.label} className="card">
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              {card.label}
            </p>
            <p style={{ fontSize: '1.75rem', fontWeight: 600, color: card.accent }}>
              ₹{card.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
        <div className="card">
          <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Spending by Category</h3>
          {data.categoryBreakdown.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No expenses yet this month.</p>
          ) : (
            data.categoryBreakdown.map((cat) => {
              const percent = data.expenses > 0 ? (cat.amount / data.expenses) * 100 : 0;
              return (
                <div key={cat.name} style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span>{cat.name}</span>
                    <span>₹{cat.amount.toLocaleString()}</span>
                  </div>
                  <div style={{ background: 'var(--accent-green-light)', borderRadius: '8px', height: '8px' }}>
                    <div style={{
                      width: `${percent}%`,
                      background: 'var(--accent-green)',
                      height: '100%',
                      borderRadius: '8px',
                    }} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Recent Expenses</h3>
          {data.recentExpenses.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No recent expenses.</p>
          ) : (
            data.recentExpenses.map((exp) => (
              <div key={exp.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.6rem 0',
                borderBottom: '1px solid var(--border-color)',
              }}>
                <div>
                  <p style={{ margin: 0 }}>{exp.description || exp.category.name}</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {exp.category.name}
                  </p>
                </div>
                <p style={{ margin: 0, fontWeight: 600 }}>₹{exp.amount.toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}