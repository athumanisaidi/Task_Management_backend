const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const bcrypt = require("bcryptjs");

const { body } = require("express-validator");
const validate = require("../middleware/validationMiddleware");
const verifyToken = require("../middleware/authMiddleware");
const authorizeRole = require("../middleware/roleMiddleware");


// GET all users
router.get(
    "/",
    verifyToken,
    authorizeRole("Admin"),
    async (req, res) => {
        try {
            const result = await pool.query(
                "SELECT user_id, full_name, email, role, created_at FROM users ORDER BY user_id"
            );

            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);


// GET user by ID
router.get(
    "/:id",
    verifyToken,
    authorizeRole("Admin"),
    async (req, res) => {
        try {
            const result = await pool.query(
                "SELECT user_id, full_name, email, role, created_at FROM users WHERE user_id = $1",
                [req.params.id]
            );

            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);


// POST - Admin creates user
router.post(
    "/",
    verifyToken,
    authorizeRole("Admin"),
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
            .isIn([
                "Staff",
                "Assistant Manager",
                "Manager",
                "Human Resources",
                "Director General"
            ])
            .withMessage("Invalid role")
    ],
    validate,
    async (req, res) => {
        try {
            const { full_name, email, password, role } = req.body;

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            const result = await pool.query(
                `INSERT INTO users
                (full_name, email, password, role)
                VALUES ($1, $2, $3, $4)
                RETURNING user_id, full_name, email, role, created_at`,
                [full_name, email, hashedPassword, role]
            );

            res.status(201).json({
                message: "User created successfully",
                user: result.rows[0]
            });

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);


// PUT - Admin updates user
router.put(
    "/:id",
    verifyToken,
    authorizeRole("Admin"),
    [
        body("full_name")
            .notEmpty()
            .withMessage("Full name is required"),

        body("email")
            .isEmail()
            .withMessage("Valid email is required"),

        body("role")
            .isIn([
                "Staff",
                "Assistant Manager",
                "Manager",
                "Human Resources",
                "Director General"
            ])
            .withMessage("Invalid role")
    ],
    validate,
    async (req, res) => {
        try {
            const { full_name, email, role } = req.body;

            const result = await pool.query(
                `UPDATE users
                 SET full_name = $1,
                     email = $2,
                     role = $3
                 WHERE user_id = $4
                 RETURNING user_id, full_name, email, role, created_at`,
                [full_name, email, role, req.params.id]
            );

            res.json({
                message: "User updated successfully",
                user: result.rows[0]
            });

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);


// DELETE - Admin deletes user
router.delete(
    "/:id",
    verifyToken,
    authorizeRole("Admin"),
    async (req, res) => {
        try { 
    const userId = parseInt(req.params.id);

    // Prevent Admin from deleting himself
    if (userId === req.user.user_id) {
        return res.status(400).json({
            message: "Admin cannot delete himself"
        });
    }

    const result = await pool.query(
        "DELETE FROM users WHERE user_id = $1 RETURNING *",
        [userId]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    res.json({
        message: "User deleted successfully"
    });

} catch (error) {
    res.status(500).json({
        error: error.message
    });
}
    }
);
            module.exports = router;