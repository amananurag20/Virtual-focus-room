const express = require('express');
const router = express.Router();
const { getStats, recordSession, getDashboardData } = require('../controllers/statsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getStats);
router.get('/dashboard', protect, getDashboardData);
router.post('/session', protect, recordSession);

module.exports = router;
