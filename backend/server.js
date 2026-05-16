// server.js - Main entry point for the Rent A Ride API
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ── Middleware ────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
app.use('/uploads', express.static('uploads'));

// ── API Routes ────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/cars', require('./routes/carsRoutes'));
app.use('/api/rentals', require('./routes/rentalsRoutes'));
app.use('/api/payments', require('./routes/paymentsRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// ── Health Check ──────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Rent A Ride API is running 🚗' });
});

// ── Root Route ────────────────────────────────────────────
app.get('/', (req, res) => {
  res.send('🚗 Welcome to Rent A Ride API. Try /api/health');
});

// ── 404 Handler ───────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ── Start Server ──────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
