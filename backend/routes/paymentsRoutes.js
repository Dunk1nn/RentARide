// routes/paymentsRoutes.js
const express = require('express');
const router = express.Router();
const { createPayment, getMyPayments, getUnpaidRentals, getAllPayments } = require('../controllers/paymentsController');
const { authMiddleware, adminOnly } = require('../middleware/auth');

router.post('/', authMiddleware, createPayment);      // POST   /api/payments
router.get('/my', authMiddleware, getMyPayments);      // GET    /api/payments/my
router.get('/unpaid', authMiddleware, getUnpaidRentals);   // GET    /api/payments/unpaid  ← NEW
router.get('/', authMiddleware, adminOnly, getAllPayments); // GET /api/payments (admin)

module.exports = router;