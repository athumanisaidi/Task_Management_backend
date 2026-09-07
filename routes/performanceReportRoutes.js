const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const verifyToken = require("../middleware/authMiddleware");
const { body } = require("express-validator");
const validate = require("../middleware/validationMiddleware");


// GET all performance reports
router.get("/", verifyToken,async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM performance_reports ORDER BY report_id"
        );

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET report by ID
router.get("/:id", verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM performance_reports WHERE report_id = $1",
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Performance report not found"
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST performance report
router.post(
    "/",
    verifyToken,
    [
        body("staff_id")
            .isInt({ min: 1 })
            .withMessage("staff_id must be a valid user ID"),

        body("total_tasks")
            .isInt({ min: 0 })
            .withMessage("total_tasks must be 0 or greater"),

        body("completed_tasks")
            .isInt({ min: 0 })
            .withMessage("completed_tasks must be 0 or greater"),

        body("completion_rate")
            .isFloat({ min: 0, max: 100 })
            .withMessage("completion_rate must be between 0 and 100"),

        body("performance_score")
            .isFloat({ min: 0, max: 100 })
            .withMessage("performance_score must be between 0 and 100")
    ],
    validate,
    async (req, res) => {
    try {
        const {
            staff_id,
            total_tasks,
            completed_tasks,
            completion_rate,
            performance_score
        } = req.body;

        const result = await pool.query(
            `INSERT INTO performance_reports
            (staff_id, total_tasks, completed_tasks, completion_rate, performance_score)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [
                staff_id,
                total_tasks,
                completed_tasks,
                completion_rate,
                performance_score
            ]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT performance report
router.put(
    "/:id",
    verifyToken,
    [
        body("staff_id")
            .isInt({ min: 1 })
            .withMessage("staff_id must be a valid user ID"),

        body("total_tasks")
            .isInt({ min: 0 })
            .withMessage("total_tasks must be 0 or greater"),

        body("completed_tasks")
            .isInt({ min: 0 })
            .withMessage("completed_tasks must be 0 or greater"),

        body("completion_rate")
            .isFloat({ min: 0, max: 100 })
            .withMessage("completion_rate must be between 0 and 100"),

        body("performance_score")
            .isFloat({ min: 0, max: 100 })
            .withMessage("performance_score must be between 0 and 100")
    ],
    validate,
    async (req, res) => {
    try {
        const {
            staff_id,
            total_tasks,
            completed_tasks,
            completion_rate,
            performance_score
        } = req.body;

        const result = await pool.query(
            `UPDATE performance_reports
             SET staff_id = $1,
                 total_tasks = $2,
                 completed_tasks = $3,
                 completion_rate = $4,
                 performance_score = $5
             WHERE report_id = $6
             RETURNING *`,
            [
                staff_id,
                total_tasks,
                completed_tasks,
                completion_rate,
                performance_score,
                req.params.id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Performance report not found"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE performance report
router.delete("/:id", verifyToken,async (req, res) => {
    try {
        const result = await pool.query(
            `DELETE FROM performance_reports
             WHERE report_id = $1
             RETURNING *`,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Performance report not found"
            });
        }

        res.json({
            message: "Performance report deleted successfully"
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;