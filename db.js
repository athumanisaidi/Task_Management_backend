const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Tax_management',
  password: '12345',
  port: 5432,
});

pool.connect((err) => {
  if (err) {
    console.log("Database connection failed:", err);
  } else {
    console.log("Database connected successfully! ✅");
  }
});

module.exports = pool; // HII NI MUHIMU SANA