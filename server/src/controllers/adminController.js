const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { logAction } = require('../utils/auditLog');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: { expenses: true, budgets: true, categories: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch users' });
  }
};

exports.getSystemStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalExpenses = await prisma.expense.count();
    const totalBudgets = await prisma.budget.count();
    const allExpenses = await prisma.expense.findMany({ select: { amount: true, type: true } });

    const totalTracked = allExpenses
      .filter(e => e.type === 'EXPENSE')
      .reduce((sum, e) => sum + e.amount, 0);

    res.json({ totalUsers, totalExpenses, totalBudgets, totalTracked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch system stats' });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true }
    });
     await logAction({
  userId: req.userId,
  userName: (await prisma.user.findUnique({ where: { id: req.userId } }))?.name,
  action: `Changed user role`,
  entityType: 'User',
  entityId: user.id,
  details: `${user.name} → ${role}`,
});

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update role' });
  }
 
};
exports.getActivityLog = async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch activity log' });
  }
};
exports.getSystemCategories = async (req, res) => {
  try {
    const categories = await prisma.systemCategory.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch categories' });
  }
};

exports.createSystemCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const category = await prisma.systemCategory.create({
      data: { name }
    });

    await logAction({
      userId: req.userId,
      userName: (await prisma.user.findUnique({ where: { id: req.userId } }))?.name,
      action: 'Added system category',
      entityType: 'SystemCategory',
      entityId: category.id,
      details: category.name,
    });

    res.status(201).json(category);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Category already exists' });
    }
    console.error(err);
    res.status(500).json({ error: 'Could not create category' });
  }
};

exports.toggleSystemCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.systemCategory.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Category not found' });

    const category = await prisma.systemCategory.update({
      where: { id },
      data: { active: !existing.active }
    });

    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update category' });
  }
};