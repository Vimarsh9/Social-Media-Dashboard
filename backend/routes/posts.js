const express = require('express');
const router = express.Router();
const { createPost, getFeed, likePost, addComment, deletePost } = require('../controllers/postController');
const { authenticate } = require('../middleware/auth');

router.get('/feed', authenticate, getFeed);
router.post('/', authenticate, createPost);
router.post('/:id/like', authenticate, likePost);
router.post('/:id/comment', authenticate, addComment);
router.delete('/:id', authenticate, deletePost);

module.exports = router;
