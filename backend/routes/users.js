const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, followUser, searchUsers } = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

router.get('/search', authenticate, searchUsers);
router.get('/:username', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/:id/follow', authenticate, followUser);

module.exports = router;
