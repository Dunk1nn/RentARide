// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, loginAdmin, getProfile } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

router.post('/register', registerUser);          // POST /api/auth/register
router.post('/login', loginUser);                // POST /api/auth/login
router.post('/admin/login', loginAdmin);         // POST /api/auth/admin/login
router.get('/profile', authMiddleware, getProfile); // GET /api/auth/profile

module.exports = router;
