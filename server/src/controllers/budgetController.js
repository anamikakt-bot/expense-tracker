const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { logAction } = require('../utils/auditLog');

exports.getBudgets = async (req, res) => {
  try {
    const { month, year } = req.query;
    const where = { userId: req.userId };
    if (month) where.month = parseInt(month);
    if (year) where.year = parseInt(year);

    const budgets = await prisma.budget.findMany({
      where,
      include: { category: true },
      orderBy: [{ year: 'desc' }, { month: 'desc' }]
    });
    res.json(budgets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch budgets' });
  }
};

exports.createBudget = async (req, res) => {
  try {
    const { month, year, limitAmount, categoryId } = req.body;

    if (!month || !year || !limitAmount) {
      return res.status(400).json({ error: 'Month, year, and limit amount are required' });
    }

    if (categoryId) {
      const category = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!category || category.userId !== req.userId) {
        return res.status(400).json({ error: 'Invalid category' });
      }
    }

    const budget = await prisma.budget.create({
      data: {
        month: parseInt(month),
        year: parseInt(year),
        limitAmount: parseFloat(limitAmount),
        userId: req.userId,
        categoryId: categoryId || null
      },
      include: { category: true }
    });
    await logAction({
  userId: req.userId,
  userName: (await prisma.user.findUnique({ where: { id: req.userId } }))?.name,
  action: 'Created budget',
  entityType: 'Budget',
  entityId: budget.id,
  details: `₹${budget.limitAmount} · ${budget.category ? budget.category.name : 'Overall'}`,
});
    res.status(201).json(budget);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create budget' });
  }
  
};

exports.updateBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const { limitAmount, categoryId } = req.body;

    const existing = await prisma.budget.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.userId) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    const budget = await prisma.budget.update({
      where: { id },
      data: {
        ...(limitAmount !== undefined && { limitAmount: parseFloat(limitAmount) }),
        ...(categoryId !== undefined && { categoryId })
      },
      include: { category: true }
    });
    res.json(budget);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update budget' });
  }
};

exports.deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.budget.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.userId) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    await prisma.budget.delete({ where: { id } });
    res.json({ message: 'Budget deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not delete budget' });
  }
};