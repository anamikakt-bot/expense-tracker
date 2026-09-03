const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const { getAllUsers, getSystemStats, updateUserRole, getActivityLog, getSystemCategories, createSystemCategory, toggleSystemCategory } = require('../controllers/adminController');

router.use(protect, requireRole('ADMIN'));
router.get('/users', getAllUsers);
router.get('/stats', getSystemStats);
router.put('/users/:id/role', updateUserRole);
router.get('/activity', getActivityLog);
router.get('/categories', getSystemCategories);
router.post('/categories', createSystemCategory);
router.put('/categories/:id/toggle', toggleSystemCategory);

module.exports = router;