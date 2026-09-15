const express = require("express");
const router = express.Router();

const pool = require("../config/db");
const verifyToken = require("../middleware/authMiddleware");
const authorizeRole = require("../middleware/roleMiddleware");


// GET ALL CONFIGURATIONS
router.get(
    "/",
    verifyToken,
    authorizeRole("Admin"),
    async (req, res) => {
        try {
            const result = await pool.query(
                `SELECT *
                 FROM system_configurations
                 ORDER BY configuration_id`
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


// CREATE CONFIGURATION
router.post(
    "/",
    verifyToken,
    authorizeRole("Admin"),
    async (req, res) => {
        try {
            const {
                configuration_name,
                configuration_value,
                description
            } = req.body;

            if (!configuration_name || !configuration_value) {
                return res.status(400).json({
                    message: "Configuration name and value are required"
                });
            }

            const result = await pool.query(
                `INSERT INTO system_configurations
                (configuration_name, configuration_value, description, updated_by)
                VALUES ($1, $2, $3, $4)
                RETURNING *`,
                [
                    configuration_name,
                    configuration_value,
                    description,
                    req.user.user_id
                ]
            );

            res.status(201).json({
                message: "Configuration created successfully",
                configuration: result.rows[0]
            });

        } catch (error) {
            if (error.code === "23505") {
                return res.status(400).json({
                    message: "Configuration name already exists"
                });
            }

            res.status(500).json({
                message: "Server error",
                error: error.message
            });
        }
    }
);


// UPDATE CONFIGURATION
router.put(
    "/:id",
    verifyToken,
    authorizeRole("Admin"),
    async (req, res) => {
        try {
            const {
                configuration_value,
                description
            } = req.body;

            const result = await pool.query(
                `UPDATE system_configurations
                 SET configuration_value = $1,
                     description = $2,
                     updated_by = $3,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE configuration_id = $4
                 RETURNING *`,
                [
                    configuration_value,
                    description,
                    req.user.user_id,
                    req.params.id
                ]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    message: "Configuration not found"
                });
            }

            res.json({
                message: "Configuration updated successfully",
                configuration: result.rows[0]
            });

        } catch (error) {
            res.status(500).json({
                message: "Server error",
                error: error.message
            });
        }
    }
);


// DELETE CONFIGURATION
router.delete(
    "/:id",
    verifyToken,
    authorizeRole("Admin"),
    async (req, res) => {
        try {
            const result = await pool.query(
                `DELETE FROM system_configurations
                 WHERE configuration_id = $1
                 RETURNING *`,
                [req.params.id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    message: "Configuration not found"
                });
            }

            res.json({
                message: "Configuration deleted successfully"
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