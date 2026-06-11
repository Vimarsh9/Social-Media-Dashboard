const express = require('express');
const router = express.Router();
const { getUserAnalytics } = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');

router.get('/me', authenticate, getUserAnalytics);

module.exports = router;
