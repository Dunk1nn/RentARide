// routes/carsRoutes.js
const express = require('express');
const router = express.Router();
const { getAllCars, getCarById, createCar, updateCar, deleteCar, upload } = require('../controllers/carsController');
const { authMiddleware, adminOnly } = require('../middleware/auth');

router.get('/', getAllCars);                                                        // Public
router.get('/:id', getCarById);                                                       // Public
router.post('/', authMiddleware, adminOnly, upload.single('image'), createCar);     // Admin + image upload
router.put('/:id', authMiddleware, adminOnly, upload.single('image'), updateCar);    // Admin + image upload
router.delete('/:id', authMiddleware, adminOnly, deleteCar);                           // Admin

module.exports = router;