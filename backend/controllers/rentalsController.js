// controllers/rentalsController.js
const db = require('../config/db');

// ── Create Booking ────────────────────────────────────────
const createRental = async (req, res) => {
  try {
    const { car_id, pickup_date, return_date, pickup_location, notes } = req.body;
    const user_id = req.user.id;

    if (!car_id || !pickup_date || !return_date) {
      return res.status(400).json({ success: false, message: 'car_id, pickup_date, return_date are required.' });
    }

    const [cars] = await db.query('SELECT * FROM cars WHERE id = ? AND status = "available"', [car_id]);
    if (cars.length === 0) {
      return res.status(400).json({ success: false, message: 'Car is not available.' });
    }

    const car = cars[0];
    const pickup = new Date(pickup_date);
    const returnD = new Date(return_date);
    const totalDays = Math.ceil((returnD - pickup) / (1000 * 60 * 60 * 24));

    if (totalDays < 1) {
      return res.status(400).json({ success: false, message: 'Return date must be after pickup date.' });
    }

    const subtotal = +(totalDays * car.daily_rate).toFixed(2);
    const totalAmount = subtotal;

    const [result] = await db.query(
      `INSERT INTO rentals (user_id, car_id, pickup_date, return_date, pickup_location,
        total_days, daily_rate, subtotal, total_amount, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, car_id, pickup_date, return_date,
        pickup_location || 'Main Office', totalDays, car.daily_rate, subtotal, totalAmount, notes]
    );

    res.status(201).json({
      success: true,
      message: 'Booking submitted! Waiting for admin approval.',
      rental_id: result.insertId,
      total_amount: totalAmount,
      total_days: totalDays,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── Get My Rentals (Customer) ─────────────────────────────
const getMyRentals = async (req, res) => {
  try {
    const [rentals] = await db.query(
      `SELECT r.*, c.make, c.model, c.category, c.image_url, c.plate_number,
              -- Check if already paid
              (SELECT COUNT(*) FROM payments p
               WHERE p.rental_id = r.id AND p.status = 'paid') AS is_paid
       FROM rentals r
       JOIN cars c ON r.car_id = c.id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: rentals });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── Get Single Rental for Customer (for payment form) ─────
const getMyRentalById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.*, c.make, c.model, c.category, c.image_url, c.plate_number, c.daily_rate AS car_daily_rate
       FROM rentals r
       JOIN cars c ON r.car_id = c.id
       WHERE r.id = ? AND r.user_id = ?`,
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Rental not found.' });
    }

    // Also fetch existing payment if any
    const [payments] = await db.query(
      'SELECT * FROM payments WHERE rental_id = ? AND status = "paid" LIMIT 1',
      [req.params.id]
    );

    res.json({
      success: true,
      data: rows[0],
      existing_payment: payments[0] || null,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── Get All Rentals (Admin) ───────────────────────────────
const getAllRentals = async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT r.*, u.name AS customer_name, u.email AS customer_email,
             c.make, c.model, c.plate_number,
             (SELECT COUNT(*) FROM payments p WHERE p.rental_id = r.id AND p.status = 'paid') AS is_paid
      FROM rentals r
      JOIN users u ON r.user_id = u.id
      JOIN cars c ON r.car_id = c.id
    `;
    const params = [];
    if (status) { query += ' WHERE r.status = ?'; params.push(status); }
    query += ' ORDER BY r.created_at DESC';

    const [rentals] = await db.query(query, params);
    res.json({ success: true, data: rentals });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── Update Rental Status (Admin) ──────────────────────────
// NOTE: Auto-payment removed. Customer pays via payment form.
const updateRentalStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const rentalId = req.params.id;

    const [rows] = await db.query('SELECT * FROM rentals WHERE id = ?', [rentalId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Rental not found.' });
    }
    const rental = rows[0];

    await db.query('UPDATE rentals SET status = ? WHERE id = ?', [status, rentalId]);

    // Sync car availability
    if (['approved', 'ongoing'].includes(status)) {
      await db.query('UPDATE cars SET status = "rented" WHERE id = ?', [rental.car_id]);
    } else if (['completed', 'rejected', 'cancelled'].includes(status)) {
      await db.query('UPDATE cars SET status = "available" WHERE id = ?', [rental.car_id]);
    }

    res.json({ success: true, message: `Rental ${status} successfully!` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── Cancel Rental (Customer) ──────────────────────────────
const cancelRental = async (req, res) => {
  try {
    const [rental] = await db.query(
      'SELECT * FROM rentals WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (rental.length === 0) {
      return res.status(404).json({ success: false, message: 'Rental not found.' });
    }
    if (!['pending', 'approved'].includes(rental[0].status)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel this rental.' });
    }

    await db.query('UPDATE rentals SET status = "cancelled" WHERE id = ?', [req.params.id]);
    await db.query('UPDATE cars SET status = "available" WHERE id = ?', [rental[0].car_id]);

    res.json({ success: true, message: 'Rental cancelled successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { createRental, getMyRentals, getMyRentalById, getAllRentals, updateRentalStatus, cancelRental };