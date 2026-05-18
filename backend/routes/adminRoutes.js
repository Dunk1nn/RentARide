// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllUsers, updateUserStatus, deleteUser, createAdmin, deleteAdmin, getAllAdmins, getAllTickets, replyTicket } = require('../controllers/adminController');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// All admin routes are protected
router.use(authMiddleware, adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/admins', getAllAdmins);
router.post('/admins', createAdmin);
router.delete('/admins/:id', deleteAdmin);
router.get('/tickets', getAllTickets);
router.put('/tickets/:id/reply', replyTicket);

module.exports = router;
