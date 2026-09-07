const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const verifyToken = require("../middleware/authMiddleware");
const { body } = require("express-validator");
const validate = require("../middleware/validationMiddleware");

// GET all progress
router.get("/", verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM task_progress ORDER BY progress_id"
        );

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET progress by ID
router.get("/:id", verifyToken,async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM task_progress WHERE progress_id = $1",
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Progress not found"
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST progress
router.post(
    "/",
    verifyToken,
    [
        body("task_id")
            .isInt({ min: 1 })
            .withMessage("task_id must be a valid ID"),

        body("staff_id")
            .isInt({ min: 1 })
            .withMessage("staff_id must be a valid user ID"),

        body("progress_percentage")
            .isInt({ min: 0, max: 100 })
            .withMessage("Progress must be between 0 and 100"),

        body("notes")
            .notEmpty()
            .withMessage("Notes are required")
    ],
    validate,
    async (req, res) => {
    try {
        const {
            task_id,
            staff_id,
            progress_percentage,
            notes
        } = req.body;

        const result = await pool.query(
            `INSERT INTO task_progress
            (task_id, staff_id, progress_percentage, notes)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [task_id, staff_id, progress_percentage, notes]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT progress
router.put(
    "/:id",
    verifyToken,
    [
        body("task_id")
            .isInt({ min: 1 })
            .withMessage("task_id must be a valid ID"),

        body("staff_id")
            .isInt({ min: 1 })
            .withMessage("staff_id must be a valid user ID"),

        body("progress_percentage")
            .isInt({ min: 0, max: 100 })
            .withMessage("Progress must be between 0 and 100"),

        body("notes")
            .notEmpty()
            .withMessage("Notes are required")
    ],
    validate,
    async (req, res) => {
    try {
        const {
            task_id,
            staff_id,
            progress_percentage,
            notes
        } = req.body;

        const result = await pool.query(
            `UPDATE task_progress
             SET task_id = $1,
                 staff_id = $2,
                 progress_percentage = $3,
                 notes = $4,
                 updated_at = CURRENT_TIMESTAMP
             WHERE progress_id = $5
             RETURNING *`,
            [
                task_id,
                staff_id,
                progress_percentage,
                notes,
                req.params.id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Progress not found"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE progress
router.delete("/:id", verifyToken,async (req, res) => {
    try {
        const result = await pool.query(
            `DELETE FROM task_progress
             WHERE progress_id = $1
             RETURNING *`,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Progress not found"
            });
        }

        res.json({
            message: "Progress deleted successfully"
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;