const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const verifyToken = require("../middleware/authMiddleware");
const { body } = require("express-validator");
const validate = require("../middleware/validationMiddleware");



// GET all submissions
router.get("/", verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM task_submissions ORDER BY submission_id"
        );

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET submission by ID
router.get("/:id", verifyToken,async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM task_submissions WHERE submission_id = $1",
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Submission not found"
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST submission
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

        body("submission")
            .notEmpty()
            .withMessage("Submission is required")
    ],
    validate,
    async (req, res) => {
    try {
        const {
            task_id,
            staff_id,
            submission
        } = req.body;

        const result = await pool.query(
            `INSERT INTO task_submissions
            (task_id, staff_id, submission)
            VALUES ($1, $2, $3)
            RETURNING *`,
            [task_id, staff_id, submission]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT submission
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

        body("submission")
            .notEmpty()
            .withMessage("Submission is required")
    ],
    validate,
    async (req, res) => {
    try {
        const {
            task_id,
            staff_id,
            submission
        } = req.body;

        const result = await pool.query(
            `UPDATE task_submissions
             SET task_id = $1,
                 staff_id = $2,
                 submission = $3
             WHERE submission_id = $4
             RETURNING *`,
            [task_id, staff_id, submission, req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Submission not found"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE submission
router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            `DELETE FROM task_submissions
             WHERE submission_id = $1
             RETURNING *`,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Submission not found"
            });
        }

        res.json({
            message: "Submission deleted successfully"
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;