const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getExpenses = async (req, res) => {
  try {
    const { categoryId, from, to, type } = req.query;

    const where = { userId: req.userId };
    if (categoryId) where.categoryId = categoryId;
    if (type) where.type = type;
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: { category: true },
      orderBy: { date: 'desc' }
    });
    res.json(expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch expenses' });
  }
};

exports.createExpense = async (req, res) => {
  try {
    const { amount, description, date, type, categoryId } = req.body;

    if (!amount || !categoryId) {
      return res.status(400).json({ error: 'Amount and category are required' });
    }

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category || category.userId !== req.userId) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const expense = await prisma.expense.create({
      data: {
        amount: parseFloat(amount),
        description,
        date: date ? new Date(date) : undefined,
        type: type || 'EXPENSE',
        userId: req.userId,
        categoryId
      },
      include: { category: true }
    });
    res.status(201).json(expense);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create expense' });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description, date, type, categoryId } = req.body;

    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.userId) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(description !== undefined && { description }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(type !== undefined && { type }),
        ...(categoryId !== undefined && { categoryId })
      },
      include: { category: true }
    });
    res.json(expense);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update expense' });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.userId) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    await prisma.expense.delete({ where: { id } });
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not delete expense' });
  }
};