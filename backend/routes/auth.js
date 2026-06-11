// routes/auth.js
const express = require('express');
const router = express.Router();
const { register, login, logout, getMe, refreshToken } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.post('/refresh', authenticate, refreshToken);

module.exports = router;
