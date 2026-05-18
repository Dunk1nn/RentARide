// controllers/paymentsController.js - Payment management with loyalty points
const db = require('../config/db');

// ── Loyalty Points Config ─────────────────────────────────
const POINTS_EARN_RATE = 50;       // 50 points earned per 1000 pesos paid
const POINTS_EARN_UNIT = 1000;     // Earn points for every 1000 pesos
const POINTS_REDEEM_RATE = 1;      // 1 point = 1 peso discount
const MIN_PAYMENT_AMOUNT = 1000.00;  // Customer must pay at least 1000 pesos

// ── Create Payment (with loyalty points support) ──────────
const createPayment = async (req, res) => {
  try {
    const { rental_id, method, points_used = 0 } = req.body;
    const user_id = req.user.id;

    if (!rental_id) {
      return res.status(400).json({ success: false, message: 'rental_id is required.' });
    }

    // 1. Verify rental belongs to this user
    const [rental] = await db.query(
      'SELECT * FROM rentals WHERE id = ? AND user_id = ?',
      [rental_id, user_id]
    );
    if (rental.length === 0) {
      return res.status(404).json({ success: false, message: 'Rental not found.' });
    }

    // 2. Rental must be approved before payment
    if (rental[0].status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: `Rental status is "${rental[0].status}". Only approved bookings can be paid.`,
      });
    }

    // 3. Duplicate payment check
    const [existing] = await db.query(
      'SELECT id FROM payments WHERE rental_id = ? AND status = "paid"',
      [rental_id]
    );
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'This booking has already been paid.',
        already_paid: true,
      });
    }

    // 4. Validate and apply loyalty points
    const [userRows] = await db.query('SELECT loyalty_points FROM users WHERE id = ?', [user_id]);
    const availablePoints = userRows[0].loyalty_points;
    const pointsToUse = Math.max(0, Math.min(parseInt(points_used) || 0, availablePoints));

    const discount = +(pointsToUse * POINTS_REDEEM_RATE).toFixed(2);
    const baseAmount = +rental[0].total_amount;
    let finalAmount = +(baseAmount - discount).toFixed(2);

    if (finalAmount < MIN_PAYMENT_AMOUNT) {
      finalAmount = MIN_PAYMENT_AMOUNT; // Always charge at least $1
    }

    // 5. Insert payment
    const transactionRef = 'TXN-' + Date.now();
    await db.query(
      `INSERT INTO payments (rental_id, user_id, amount, method, status, transaction_ref, paid_at)
       VALUES (?, ?, ?, ?, 'paid', ?, NOW())`,
      [rental_id, user_id, finalAmount, method || 'cash', transactionRef]
    );

    // 6. Move rental to 'ongoing'
    await db.query('UPDATE rentals SET status = "ongoing" WHERE id = ?', [rental_id]);

    // 7. Deduct used points, add earned points (based on final amount paid)
    const pointsEarned = Math.floor(finalAmount / POINTS_EARN_UNIT) * POINTS_EARN_RATE;
    const netPoints = pointsEarned - pointsToUse;
    await db.query(
      'UPDATE users SET loyalty_points = loyalty_points + ? WHERE id = ?',
      [netPoints, user_id]
    );

    // Fetch updated points balance
    const [updatedUser] = await db.query('SELECT loyalty_points FROM users WHERE id = ?', [user_id]);

    res.status(201).json({
      success: true,
      message: 'Payment successful!',
      transaction_ref: transactionRef,
      original_amount: baseAmount,
      discount_applied: discount,
      amount_paid: finalAmount,
      points_used: pointsToUse,
      points_earned: pointsEarned,
      loyalty_points_balance: updatedUser[0].loyalty_points,
    });
  } catch (err) {
    console.error('Payment error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── Get My Payments ───────────────────────────────────────
const getMyPayments = async (req, res) => {
  try {
    const [payments] = await db.query(
      `SELECT p.*, c.make, c.model, r.status AS rental_status,
              r.pickup_date, r.return_date, r.total_days
       FROM payments p
       JOIN rentals r ON p.rental_id = r.id
       JOIN cars c ON r.car_id = c.id
       WHERE p.user_id = ?
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: payments });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── Get Unpaid Approved Rentals ───────────────────────────
// Approved rentals with no paid payment = customer needs to pay
const getUnpaidRentals = async (req, res) => {
  try {
    const [unpaid] = await db.query(
      `SELECT r.*, c.make, c.model, c.category, c.image_url, c.plate_number
       FROM rentals r
       JOIN cars c ON r.car_id = c.id
       WHERE r.user_id = ?
         AND r.status = 'approved'
         AND NOT EXISTS (
           SELECT 1 FROM payments p
           WHERE p.rental_id = r.id AND p.status = 'paid'
         )
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: unpaid });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── Get All Payments (Admin) ──────────────────────────────
const getAllPayments = async (req, res) => {
  try {
    const [payments] = await db.query(
      `SELECT p.*, u.name AS customer_name, c.make, c.model,
              r.pickup_date, r.return_date, r.total_days
       FROM payments p
       JOIN users u ON p.user_id = u.id
       JOIN rentals r ON p.rental_id = r.id
       JOIN cars c ON r.car_id = c.id
       ORDER BY p.created_at DESC`
    );

    // Calculate pending amount from approved rentals that have no paid payment record
    const [[{ pending_total }]] = await db.query(
      `SELECT COALESCE(SUM(r.total_amount), 0) AS pending_total
       FROM rentals r
       WHERE r.status = 'approved'
         AND NOT EXISTS (
           SELECT 1 FROM payments p 
           WHERE p.rental_id = r.id AND p.status = 'paid'
         )`
    );

    res.json({ success: true, data: payments, pending_total });
  } catch (err) {
    console.error('GetAllPayments error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { createPayment, getMyPayments, getUnpaidRentals, getAllPayments };