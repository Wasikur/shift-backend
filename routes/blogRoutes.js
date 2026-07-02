const express = require('express');
const router = express.Router();
const { getBlogs, getBlogById, createBlog, deleteBlog } = require('../controllers/blogController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', getBlogs);
router.get('/:id', getBlogById);
router.post('/', protect, admin, upload.single('image'), createBlog);
router.delete('/:id', protect, admin, deleteBlog);

module.exports = router;
