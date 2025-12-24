const express = require('express');
const router = express.Router();
const { getStats, recordSession } = require('../controllers/statsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getStats);
router.post('/session', protect, recordSession);

module.exports = router;
