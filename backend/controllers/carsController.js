// controllers/carsController.js - CRUD operations for cars with image upload
const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ── Multer Storage Config ─────────────────────────────────
// Saves uploaded images to backend/uploads/cars/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/cars');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // e.g. toyota-camry-1714000000000.jpg
    const safeName = file.originalname.replace(/\s+/g, '-').toLowerCase();
    cb(null, Date.now() + '-' + safeName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) cb(null, true);
  else cb(new Error('Only image files are allowed (jpg, png, webp).'));
};

// Export multer middleware so the route can use it
const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB max

// ── Get All Cars ──────────────────────────────────────────
const getAllCars = async (req, res) => {
  try {
    const { category, status, search } = req.query;
    let query = 'SELECT * FROM cars WHERE 1=1';
    const params = [];

    if (category) { query += ' AND category = ?'; params.push(category); }
    if (status) { query += ' AND status = ?'; params.push(status); }
    if (search) { query += ' AND (make LIKE ? OR model LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

    query += ' ORDER BY created_at DESC';
    const [cars] = await db.query(query, params);
    res.json({ success: true, data: cars });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── Get Single Car ────────────────────────────────────────
const getCarById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM cars WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Car not found.' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── Create Car (Admin) ────────────────────────────────────
const createCar = async (req, res) => {
  try {
    const { make, model, year, category, color, plate_number, daily_rate, seats, transmission, fuel_type, description } = req.body;

    if (!make || !model || !year || !plate_number || !daily_rate) {
      return res.status(400).json({ success: false, message: 'Required: make, model, year, plate_number, daily_rate.' });
    }

    // Build image URL if a file was uploaded
    let image_url = null;
    if (req.file) {
      image_url = `${req.protocol}://${req.get('host')}/uploads/cars/${req.file.filename}`;
    }

    const [result] = await db.query(
      `INSERT INTO cars (make, model, year, category, color, plate_number, daily_rate, seats, transmission, fuel_type, description, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [make, model, year, category || 'Sedan', color, plate_number, daily_rate,
        seats || 5, transmission || 'Automatic', fuel_type || 'Gasoline', description, image_url]
    );

    res.status(201).json({ success: true, message: 'Car added successfully!', id: result.insertId, image_url });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Plate number already exists.' });
    }
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── Update Car (Admin) ────────────────────────────────────
const updateCar = async (req, res) => {
  try {
    const { make, model, year, category, color, plate_number, daily_rate, seats, transmission, fuel_type, status, description } = req.body;
    const carId = req.params.id;

    // Fetch existing car to get old image
    const [existing] = await db.query('SELECT image_url FROM cars WHERE id = ?', [carId]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Car not found.' });

    let image_url = existing[0].image_url; // Keep old image by default

    // If a new file was uploaded, use it and delete the old one
    if (req.file) {
      image_url = `${req.protocol}://${req.get('host')}/uploads/cars/${req.file.filename}`;

      // Delete old file from disk if it exists
      if (existing[0].image_url) {
        const oldFilename = existing[0].image_url.split('/uploads/cars/')[1];
        if (oldFilename) {
          const oldPath = path.join(__dirname, '../uploads/cars', oldFilename);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
      }
    }

    await db.query(
      `UPDATE cars SET make=?, model=?, year=?, category=?, color=?, plate_number=?,
       daily_rate=?, seats=?, transmission=?, fuel_type=?, status=?, description=?, image_url=?
       WHERE id=?`,
      [make, model, year, category, color, plate_number, daily_rate,
        seats, transmission, fuel_type, status, description, image_url, carId]
    );

    res.json({ success: true, message: 'Car updated successfully!', image_url });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── Delete Car (Admin) ────────────────────────────────────
const deleteCar = async (req, res) => {
  try {
    // Delete image file from disk too
    const [rows] = await db.query('SELECT image_url FROM cars WHERE id = ?', [req.params.id]);
    if (rows.length > 0 && rows[0].image_url) {
      const filename = rows[0].image_url.split('/uploads/cars/')[1];
      if (filename) {
        const filePath = path.join(__dirname, '../uploads/cars', filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    }

    await db.query('DELETE FROM cars WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Car deleted successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getAllCars, getCarById, createCar, updateCar, deleteCar, upload };