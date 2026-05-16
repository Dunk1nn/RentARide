// controllers/authController.js - Handles login and registration
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

/**
 * Generate a signed JWT token.
 * @param {object} payload - { id, email, role }
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// ── Customer Register ─────────────────────────────────────
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
    }

    // Check if email already exists
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    // Hash the password (salt rounds = 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, phone || null]
    );

    const token = generateToken({ id: result.insertId, email, role: 'user' });

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: { id: result.insertId, name, email, role: 'user' },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ── Customer Login ────────────────────────────────────────
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // Find user
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = rows[0];

    // Check if account is active
    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Your account has been suspended.' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken({ id: user.id, email: user.email, role: 'user' });

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: 'user', loyalty_points: user.loyalty_points },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ── Admin Login ───────────────────────────────────────────
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const [rows] = await db.query('SELECT * FROM admins WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const admin = rows[0];
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken({ id: admin.id, email: admin.email, role: 'admin' });

    res.json({
      success: true,
      message: 'Admin login successful!',
      token,
      user: { id: admin.id, name: admin.name, email: admin.email, role: 'admin' },
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ── Get Current User Profile ──────────────────────────────
const getProfile = async (req, res) => {
  try {
    const { id, role } = req.user;
    const table = role === 'admin' ? 'admins' : 'users';
    const [rows] = await db.query(`SELECT id, name, email, phone, created_at FROM ${table} WHERE id = ?`, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, user: { ...rows[0], role } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { registerUser, loginUser, loginAdmin, getProfile };
