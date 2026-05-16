-- ============================================================
-- Rent A Ride - MySQL Database Schema
-- Import this file via phpMyAdmin or MySQL CLI:
--   mysql -u root -p < schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS rent_a_ride;
USE rent_a_ride;

-- --------------------------------------------------------
-- Table: admins
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,        -- bcrypt hashed
  role ENUM('superadmin','admin') DEFAULT 'admin',
  avatar VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Table: users (customers)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,        -- bcrypt hashed
  phone VARCHAR(20) DEFAULT NULL,
  address TEXT DEFAULT NULL,
  license_number VARCHAR(50) DEFAULT NULL,
  avatar VARCHAR(255) DEFAULT NULL,
  loyalty_points INT DEFAULT 0,
  status ENUM('active','suspended') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Table: cars
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS cars (
  id INT AUTO_INCREMENT PRIMARY KEY,
  make VARCHAR(50) NOT NULL,             -- e.g. Toyota
  model VARCHAR(50) NOT NULL,            -- e.g. Camry
  year YEAR NOT NULL,
  category ENUM('Sedan','SUV','Truck','Van','Luxury','Electric') DEFAULT 'Sedan',
  color VARCHAR(30) DEFAULT NULL,
  plate_number VARCHAR(20) NOT NULL UNIQUE,
  daily_rate DECIMAL(10,2) NOT NULL,
  seats INT DEFAULT 5,
  transmission ENUM('Automatic','Manual') DEFAULT 'Automatic',
  fuel_type ENUM('Gasoline','Diesel','Electric','Hybrid') DEFAULT 'Gasoline',
  mileage INT DEFAULT 0,
  image_url VARCHAR(255) DEFAULT NULL,
  status ENUM('available','rented','maintenance','retired') DEFAULT 'available',
  description TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Table: rentals / bookings
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS rentals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  car_id INT NOT NULL,
  pickup_date DATETIME NOT NULL,
  return_date DATETIME NOT NULL,
  actual_return_date DATETIME DEFAULT NULL,
  pickup_location VARCHAR(255) DEFAULT 'Main Office',
  total_days INT NOT NULL,
  daily_rate DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0.00,
  total_amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending','approved','ongoing','completed','cancelled','rejected') DEFAULT 'pending',
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
);

-- --------------------------------------------------------
-- Table: payments
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rental_id INT NOT NULL,
  user_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  method ENUM('cash','credit_card','debit_card','gcash','maya') DEFAULT 'cash',
  status ENUM('pending','paid','failed','refunded') DEFAULT 'pending',
  transaction_ref VARCHAR(100) DEFAULT NULL,
  paid_at TIMESTAMP DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rental_id) REFERENCES rentals(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- --------------------------------------------------------
-- Table: support_tickets
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS support_tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('open','in_progress','resolved','closed') DEFAULT 'open',
  admin_reply TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- --------------------------------------------------------
-- Seed: Default Admin Account
-- Password: admin123 (bcrypt hashed)
-- --------------------------------------------------------
INSERT INTO admins (name, email, password, role) VALUES
('Super Admin', 'admin@rentaride.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'superadmin');

-- --------------------------------------------------------
-- Seed: Sample Cars
-- --------------------------------------------------------
INSERT INTO cars (make, model, year, category, color, plate_number, daily_rate, seats, transmission, fuel_type, image_url) VALUES
('Toyota', 'Camry', 2023, 'Sedan', 'White', 'ABC-1234', 80.00, 5, 'Automatic', 'Gasoline', NULL),
('Honda', 'CR-V', 2023, 'SUV', 'Silver', 'DEF-5678', 90.00, 5, 'Automatic', 'Gasoline', NULL),
('BMW', 'X3', 2022, 'SUV', 'Black', 'GHI-9012', 136.00, 5, 'Automatic', 'Gasoline', NULL),
('Honda', 'Civic', 2023, 'Sedan', 'Blue', 'JKL-3456', 70.00, 5, 'Automatic', 'Gasoline', NULL),
('Toyota', 'Fortuner', 2022, 'SUV', 'Gray', 'MNO-7890', 120.00, 7, 'Automatic', 'Diesel', NULL),
('Ford', 'Mustang', 2023, 'Luxury', 'Red', 'PQR-1234', 150.00, 4, 'Automatic', 'Gasoline', NULL);
