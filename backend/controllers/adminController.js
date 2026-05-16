// controllers/adminController.js - Admin-specific operations
const db = require('../config/db');
const bcrypt = require('bcryptjs');

// ── Dashboard Analytics ───────────────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    const [[{ totalUsers }]]    = await db.query('SELECT COUNT(*) AS totalUsers FROM users');
    const [[{ totalCars }]]     = await db.query('SELECT COUNT(*) AS totalCars FROM cars');
    const [[{ activeRentals }]] = await db.query('SELECT COUNT(*) AS activeRentals FROM rentals WHERE status IN ("approved","ongoing")');
    const [[{ pendingBookings }]] = await db.query('SELECT COUNT(*) AS pendingBookings FROM rentals WHERE status = "pending"');
    const [[{ totalRevenue }]]  = await db.query('SELECT COALESCE(SUM(amount),0) AS totalRevenue FROM payments WHERE status = "paid"');
    const [[{ availableCars }]] = await db.query('SELECT COUNT(*) AS availableCars FROM cars WHERE status = "available"');

    // Recent rentals
    const [recentRentals] = await db.query(
      `SELECT r.id, u.name AS customer, c.make, c.model, r.total_amount, r.status, r.created_at
       FROM rentals r
       JOIN users u ON r.user_id = u.id
       JOIN cars c ON r.car_id = c.id
       ORDER BY r.created_at DESC LIMIT 5`
    );

    res.json({
      success: true,
      stats: { totalUsers, totalCars, activeRentals, pendingBookings, totalRevenue, availableCars },
      recentRentals,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── Get All Users (Admin) ─────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, name, email, phone, loyalty_points, status, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── Update User Status (suspend/activate) ────────────────
const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await db.query('UPDATE users SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true, message: `User ${status} successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── Delete User ───────────────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── Create Admin Account ──────────────────────────────────
const createAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, password required.' });
    }
    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO admins (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashed, role || 'admin']
    );
    res.status(201).json({ success: true, message: 'Admin account created.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Email already exists.' });
    }
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── Get All Admins ────────────────────────────────────────
const getAllAdmins = async (req, res) => {
  try {
    const [admins] = await db.query('SELECT id, name, email, role, created_at FROM admins ORDER BY created_at DESC');
    res.json({ success: true, data: admins });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── Support Tickets (Admin) ───────────────────────────────
const getAllTickets = async (req, res) => {
  try {
    const [tickets] = await db.query(
      `SELECT t.*, u.name AS customer_name, u.email AS customer_email
       FROM support_tickets t
       JOIN users u ON t.user_id = u.id
       ORDER BY t.created_at DESC`
    );
    res.json({ success: true, data: tickets });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const replyTicket = async (req, res) => {
  try {
    const { admin_reply, status } = req.body;
    await db.query(
      'UPDATE support_tickets SET admin_reply = ?, status = ? WHERE id = ?',
      [admin_reply, status || 'resolved', req.params.id]
    );
    res.json({ success: true, message: 'Reply sent.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getDashboardStats, getAllUsers, updateUserStatus, deleteUser, createAdmin, getAllAdmins, getAllTickets, replyTicket };
