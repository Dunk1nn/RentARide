const mysql = require('mysql2/promise');

async function testPasswords() {
  const passwords = ['', 'root', 'password', 'admin', '123456', '12345678', 'mysql'];

  for (const pwd of passwords) {
    try {
      const conn = await mysql.createConnection({
        host: 'localhost',
        port: 3307,
        user: 'root',
        password: pwd,
      });
      console.log(`✅ Success with password: "${pwd}"`);
      await conn.end();
      return;
    } catch (err) {
      // console.log(`Failed with "${pwd}": ${err.message}`);
    }
  }
  console.log('❌ All common passwords failed.');
}

testPasswords();
