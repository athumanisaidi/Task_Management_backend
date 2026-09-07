const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const { body } = require("express-validator");
const validate = require("../middleware/validationMiddleware");

const router = express.Router();

// REGISTER
router.post(
    "/register",
    [
        body("full_name")
            .notEmpty()
            .withMessage("Full name is required"),

        body("email")
            .isEmail()
            .withMessage("Valid email is required"),

        body("password")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters"),

        body("role")
            .notEmpty()
            .withMessage("Role is required")
    ],
    validate,
    async (req, res) => {
    const { full_name, email, password, role } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users (full_name, email, password, role)
             VALUES ($1, $2, $3, $4)
             RETURNING user_id, full_name, email, role, created_at`,
            [full_name, email, hashedPassword, role]
        );

        res.status(201).json({
            message: "User registered successfully",
            user: result.rows[0]
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});



// LOGIN
router.post(
    "/login",
    [
        body("email")
            .isEmail()
            .withMessage("Valid email is required"),

        body("password")
            .notEmpty()
            .withMessage("Password is required")
    ],
    validate,
    async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];
    
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) { // <-- fixed here
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { user_id: user.user_id,
        email: user.email,
        role: user.role
       },
      process.env.JWT_SECRET,// don't forget your secret
    
    );

    return res.json({ token: token, user: { id: user.user_id, email: user.email } });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;