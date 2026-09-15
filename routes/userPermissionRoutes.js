const express = require("express");
const { body } = require("express-validator");

const pool = require("../config/db");
const verifyToken = require("../middleware/authMiddleware");
const authorizeRole = require("../middleware/roleMiddleware");
const validate = require("../middleware/validationMiddleware");

const router = express.Router();

// ADMIN ASSIGN PERMISSION TO USER
router.post(
    "/",
    verifyToken,
    authorizeRole("Admin"),
    [
        body("user_id")
            .isInt({ min: 1 })
            .withMessage("Valid user_id is required"),

        body("permission_id")
            .isInt({ min: 1 })
            .withMessage("Valid permission_id is required")
    ],
    validate,
    async (req, res) => {
        try {
            const { user_id, permission_id } = req.body;

            const result = await pool.query(
                `INSERT INTO user_permissions (user_id, permission_id)
                 VALUES ($1, $2)
                 RETURNING *`,
                [user_id, permission_id]
            );

            res.status(201).json({
                message: "Permission assigned successfully",
                user_permission: result.rows[0]
            });

        } catch (error) {
            if (error.code === "23505") {
                return res.status(400).json({
                    message: "This permission is already assigned to this user"
                });
            }

            res.status(500).json({
                message: "Server error",
                error: error.message
            });
        }
    }
);
// ADMIN VIEW USER PERMISSIONS
router.get(
    "/:user_id",
    verifyToken,
    authorizeRole("Admin"),
    async (req, res) => {
        try {
            const { user_id } = req.params;

            const result = await pool.query(
                `SELECT 
                    up.user_permission_id,
                    u.user_id,
                    u.full_name,
                    u.role,
                    p.permission_id,
                    p.permission_name,
                    p.description
                 FROM user_permissions up
                 JOIN users u
                 ON up.user_id = u.user_id
                 JOIN permissions p
                 ON up.permission_id = p.permission_id
                 WHERE up.user_id = $1
                 ORDER BY p.permission_id`,
                [user_id]
            );

            res.json(result.rows);

        } catch (error) {
            res.status(500).json({
                message: "Server error",
                error: error.message
            });
        }
    }
);
 // ADMIN REVOKE PERMISSION FROM USER
router.delete(
    "/:id",
    verifyToken,
    authorizeRole("Admin"),
    async (req, res) => {
        try {
            const { id } = req.params;

            const result = await pool.query(
                `DELETE FROM user_permissions
                 WHERE user_permission_id = $1
                 RETURNING *`,
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    message: "User permission not found"
                });
            }

            res.json({
                message: "Permission removed successfully",
                user_permission: result.rows[0]
            });

        } catch (error) {
            res.status(500).json({
                message: "Server error",
                error: error.message
            });
        }
    }
);
module.exports = router;