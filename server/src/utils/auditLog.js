const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.logAction = async ({ userId, userName, action, entityType, entityId, details }) => {
  try {
    await prisma.auditLog.create({
      data: { userId, userName, action, entityType, entityId, details }
    });
  } catch (err) {
    console.error('Audit log failed:', err);
  }
};