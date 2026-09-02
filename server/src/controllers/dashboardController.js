const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getSummary = async (req, res) => {
  try {
    const userId = req.userId;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const monthlyExpenses = await prisma.expense.findMany({
      where: {
        userId,
        date: { gte: startOfMonth, lte: endOfMonth }
      },
      include: { category: true }
    });

    const income = monthlyExpenses
      .filter((e) => e.type === 'INCOME')
      .reduce((sum, e) => sum + e.amount, 0);

    const expenses = monthlyExpenses
      .filter((e) => e.type === 'EXPENSE')
      .reduce((sum, e) => sum + e.amount, 0);

    const categoryBreakdown = {};
    monthlyExpenses
      .filter((e) => e.type === 'EXPENSE')
      .forEach((e) => {
        const catName = e.category.name;
        categoryBreakdown[catName] = (categoryBreakdown[catName] || 0) + e.amount;
      });

    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        month: now.getMonth() + 1,
        year: now.getFullYear()
      },
      include: { category: true }
    });

    const totalBudget = budgets.reduce((sum, b) => sum + b.limitAmount, 0);

    res.json({
      income,
      expenses,
      netSavings: income - expenses,
      totalBudget,
      remainingBudget: totalBudget - expenses,
      categoryBreakdown: Object.entries(categoryBreakdown).map(([name, amount]) => ({ name, amount })),
      recentExpenses: monthlyExpenses
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch dashboard summary' });
  }
};
exports.getTrend = async (req, res) => {
  try {
    const userId = req.userId;
    const now = new Date();
    const months = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const monthExpenses = await prisma.expense.findMany({
        where: { userId, date: { gte: start, lte: end } }
      });

      const income = monthExpenses.filter(e => e.type === 'INCOME').reduce((s, e) => s + e.amount, 0);
      const expenses = monthExpenses.filter(e => e.type === 'EXPENSE').reduce((s, e) => s + e.amount, 0);

      months.push({
        month: d.toLocaleString('default', { month: 'short' }),
        income,
        expenses
      });
    }

    res.json(months);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch trend data' });
  }
};