const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { body } = require("express-validator");
const validate = require("../middleware/validationMiddleware");


// GET all users
router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM users ORDER BY user_id");
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET user by ID
router.get("/:id", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM users WHERE user_id = $1",
            [req.params.id]
        );

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST - create user
router.post(
    "/",
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
    try {
        const { full_name, email, password, role } = req.body;

        const result = await pool.query(
            `INSERT INTO users (full_name, email, password, role)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [full_name, email, password, role]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT - update user
router.put(
    "/:id",
    [
        body("full_name")
            .notEmpty()
            .withMessage("Full name is required"),

        body("email")
            .isEmail()
            .withMessage("Valid email is required"),

        body("role")
            .notEmpty()
            .withMessage("Role is required")
    ],
    validate,
    async (req, res) => {
    try {
        const { full_name, email, password, role } = req.body;

        const result = await pool.query(
            `UPDATE users
             SET full_name = $1,
                 email = $2,
                 password = $3,
                 role = $4
             WHERE user_id = $5
             RETURNING *`,
            [full_name, email, password, role, req.params.id]
        );

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE user
router.delete("/:id", async (req, res) => {
    try {
        await pool.query(
            "DELETE FROM users WHERE user_id = $1",
            [req.params.id]
        );

        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;