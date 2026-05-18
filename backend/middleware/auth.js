// middleware/auth.js - Verify JWT + check live user status from DB
const jwt = require('jsonwebtoken');
const db = require('../config/db');

/**
 * Verifies JWT token AND checks if user/admin is still active in DB.
 * This means suspending a user takes effect immediately,
 * even if they already have a valid token.
 */
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  try {
    // 1. Verify token signature
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role }

    // 2. Check live status from DB (catches suspended accounts immediately)
    if (decoded.role === 'user') {
      const [rows] = await db.query('SELECT status FROM users WHERE id = ?', [decoded.id]);
      if (rows.length === 0) {
        return res.status(401).json({ success: false, message: 'Account not found.' });
      }
      if (rows[0].status === 'suspended') {
        return res.status(403).json({ success: false, message: 'Your account has been suspended. Please contact support.' });
      }
    }

    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
  }
};

/**
 * Restricts access to admin role only.
 * Must be used AFTER authMiddleware.
 */
const adminOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
  }
};

module.exports = { authMiddleware, adminOnly };