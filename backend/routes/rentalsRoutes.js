// routes/rentalsRoutes.js
const express = require('express');
const router = express.Router();
const {
    createRental, getMyRentals, getMyRentalById,
    getAllRentals, updateRentalStatus, cancelRental
} = require('../controllers/rentalsController');
const { authMiddleware, adminOnly } = require('../middleware/auth');

router.post('/', authMiddleware, createRental);                   // Book car
router.get('/my', authMiddleware, getMyRentals);                   // My rentals list
router.get('/my/:id', authMiddleware, getMyRentalById);                // Single rental (payment form)
router.get('/', authMiddleware, adminOnly, getAllRentals);        // Admin: all rentals
router.put('/:id/status', authMiddleware, adminOnly, updateRentalStatus);  // Admin: approve/reject
router.put('/:id/cancel', authMiddleware, cancelRental);                   // Customer: cancel

module.exports = router;