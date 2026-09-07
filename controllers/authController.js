
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db'); // tutaunda hii baadae

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Angalia kama user tayari yupo
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Email tayari ipo' });
    }

    // 2. Encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Hifadhi kwenye DB
    const newUser = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, role || 'staff']
    );

    res.status(201).json({
      message: 'Usajili umefanikiwa',
      user: newUser.rows[0]
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { register };