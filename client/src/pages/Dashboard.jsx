import { useEffect, useState } from 'react';
import api from '../services/api';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [trend, setTrend] = useState([]);

  
useEffect(() => {
  Promise.all([
    api.get('/dashboard/summary'),
    api.get('/dashboard/trend')
  ])
    .then(([summaryRes, trendRes]) => {
      setData(summaryRes.data);
      setTrend(trendRes.data);
    })
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
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
        <div className="card">
          <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Income vs Expenses (6 months)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={trend}>
              <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize={12} />
              <YAxis stroke="var(--text-secondary)" fontSize={12} />
              <Tooltip
              contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
              />
              <Legend />
              <Bar dataKey="income" fill="var(--accent-green)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="var(--accent-terracotta)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Category Breakdown</h3>
          {data.categoryBreakdown.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No expenses yet this month.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                data={data.categoryBreakdown}
                dataKey="amount"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ name }) => name}
                >
                {data.categoryBreakdown.map((entry, index) => (
                  <Cell key={entry.name} fill={['#2C3B2E', '#6B8E6E', '#E8B4A0', '#C9A88A', '#A8C0A5'][index % 5]} />
                ))}
                </Pie>
                <Tooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}