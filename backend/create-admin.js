// backend/create-admin.js
// ─────────────────────────────────────────────────────────
// Run this ONCE to create the default admin account.
// Usage:  node create-admin.js
// ─────────────────────────────────────────────────────────

const bcrypt = require('bcryptjs');
const mysql  = require('mysql2/promise');
require('dotenv').config();

async function createAdmin() {
  const connection = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    port:     process.env.DB_PORT     || 3306,
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'rent_a_ride',
  });

  // ── Change these values if you want ──────────────────
  const name     = 'Super Admin';
  const email    = 'admin@rentaride.com';
  const password = 'admin123';          // ← plain text, will be hashed
  const role     = 'superadmin';
  // ─────────────────────────────────────────────────────

  console.log('🔐 Hashing password...');
  const hashed = await bcrypt.hash(password, 10);

  // Remove existing admin with same email first (clean re-run)
  await connection.execute('DELETE FROM admins WHERE email = ?', [email]);

  await connection.execute(
    'INSERT INTO admins (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, hashed, role]
  );

  console.log('✅ Admin account created!');
  console.log('   Email   :', email);
  console.log('   Password:', password);
  console.log('   Role    :', role);

  await connection.end();
}

createAdmin().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
