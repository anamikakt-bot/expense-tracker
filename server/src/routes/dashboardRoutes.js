const express = require('express');
const router = express.Router();
const { getSummary, getTrend } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.get('/summary', protect, getSummary);
router.get('/trend', protect, getTrend);

module.exports = router;