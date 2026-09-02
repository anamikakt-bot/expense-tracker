import { useEffect, useState } from 'react';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LabelList, Cell } from 'recharts';

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

  const getBudgetColor = (value) => {
    if (value < 0) return '#D9534F';
    if (value === 0) return 'var(--text-secondary)';
    return 'var(--accent-green)';
  };

  const summaryCards = [
    { label: 'Income', value: data.income, accent: 'var(--accent-green)' },
    { label: 'Expenses', value: data.expenses, accent: 'var(--accent-terracotta)' },
    { label: 'Net Savings', value: data.netSavings, accent: data.netSavings < 0 ? '#D9534F' : 'var(--accent-green)' },
    { label: 'Remaining Budget', value: data.remainingBudget, accent: getBudgetColor(data.remainingBudget) },
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
              {card.value < 0 ? '−₹' : '₹'}{Math.abs(card.value).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginTop: 0 }}>Recent Expenses</h3>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
        <div className="card">
          <h3 style={{ marginTop: 0, marginBottom: '0.25rem' }}>Income vs Expenses (6 months)</h3>
          {trend.length >= 2 && (() => {
            const current = trend[trend.length - 1];
            const previous = trend[trend.length - 2];
            const currentSavings = current.income - current.expenses;
            const previousSavings = previous.income - previous.expenses;
            const pctChange = previousSavings !== 0
              ? (((currentSavings - previousSavings) / Math.abs(previousSavings)) * 100).toFixed(0)
              : null;

            return (
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 0.5rem' }}>{current.month}</p>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.9rem' }}>
                  <span>Income <strong>₹{current.income.toLocaleString()}</strong></span>
                  <span>Expenses <strong>₹{current.expenses.toLocaleString()}</strong></span>
                  <span>
                    Savings <strong style={{ color: currentSavings < 0 ? '#D9534F' : 'var(--accent-green)' }}>
                      {currentSavings < 0 ? '−₹' : '₹'}{Math.abs(currentSavings).toLocaleString()}
                    </strong>
                  </span>
                  {pctChange !== null && (
                    <span style={{ color: pctChange >= 0 ? 'var(--accent-green)' : '#D9534F' }}>
                      {pctChange >= 0 ? '+' : ''}{pctChange}% vs previous month
                    </span>
                  )}
                </div>
              </div>
            );
          })()}
          <ResponsiveContainer width="100%" height={220}>
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
          ) : (() => {
            const sorted = [...data.categoryBreakdown].sort((a, b) => b.amount - a.amount);
            const withPercent = sorted.map((c) => ({
              ...c,
              percent: data.expenses > 0 ? Math.round((c.amount / data.expenses) * 100) : 0,
            }));
            const colors = ['#2C3B2E', '#6B8E6E', '#E8B4A0', '#C9A88A', '#A8C0A5'];

            return (
              <ResponsiveContainer width="100%" height={Math.max(180, withPercent.length * 50)}>
                <BarChart data={withPercent} layout="vertical" margin={{ left: 10, right: 40 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={80} stroke="var(--text-secondary)" fontSize={12} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                    formatter={(value, name, props) => [`₹${value.toLocaleString()} (${props.payload.percent}%)`, 'Amount']}
                  />
                  <Bar dataKey="amount" radius={[0, 6, 6, 0]} barSize={22}>
                    {withPercent.map((entry, index) => (
                      <Cell key={entry.name} fill={colors[index % colors.length]} />
                    ))}
                    <LabelList
                      dataKey="amount"
                      position="right"
                      formatter={(value) => `₹${value.toLocaleString()}`}
                      style={{ fill: 'var(--text-primary)', fontSize: '12px' }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            );
          })()}
        </div>
      </div>
    </div>
  );
}