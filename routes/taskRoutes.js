

const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const verifyToken = require("../middleware/authMiddleware");
const { body } = require("express-validator");
const validate = require("../middleware/validationMiddleware");

// GET all tasks
router.get("/", verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM tasks ORDER BY task_id"
        );

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET task by ID
router.get("/:id", verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM tasks WHERE task_id = $1",
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST - create task
router.post(
    "/",
    verifyToken,
    [
        body("title")
            .notEmpty()
            .withMessage("Title is required"),

        body("description")
            .notEmpty()
            .withMessage("Description is required"),

        body("status")
            .notEmpty()
            .withMessage("Status is required"),

        body("assigned_to")
            .isInt({ min: 1 })
            .withMessage("assigned_to must be a valid user ID"),

        body("created_by")
            .isInt({ min: 1 })
            .withMessage("created_by must be a valid user ID"),

        body("deadline")
            .isISO8601()
            .withMessage("Deadline must be a valid date"),

        body("progress")
            .isInt({ min: 0, max: 100 })
            .withMessage("Progress must be between 0 and 100"),

        body("priority")
            .notEmpty()
            .withMessage("Priority is required"),

        body("deliverable")
            .notEmpty()
            .withMessage("Deliverable is required")
    ],
    validate,
    async (req, res) => {
    try {
        const {
            title,
            description,
            status,
            assigned_to,
            created_by,
            deadline,
            progress,
            priority,
            deliverable
        } = req.body;

        const result = await pool.query(
            `INSERT INTO tasks
            (title, description, status, assigned_to, created_by,
             deadline, progress, priority, deliverable)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *`,
            [
                title,
                description,
                status,
                assigned_to,
                created_by,
                deadline,
                progress,
                priority,
                deliverable
            ]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT - update task
router.put(
    "/:id",
    verifyToken,
    [
        body("title")
            .notEmpty()
            .withMessage("Title is required"),

        body("description")
            .notEmpty()
            .withMessage("Description is required"),

        body("status")
            .notEmpty()
            .withMessage("Status is required"),

        body("assigned_to")
            .isInt({ min: 1 })
            .withMessage("assigned_to must be a valid user ID"),

        body("created_by")
            .isInt({ min: 1 })
            .withMessage("created_by must be a valid user ID"),

        body("deadline")
            .isISO8601()
            .withMessage("Deadline must be a valid date"),

        body("progress")
            .isInt({ min: 0, max: 100 })
            .withMessage("Progress must be between 0 and 100"),

        body("priority")
            .notEmpty()
            .withMessage("Priority is required"),

        body("deliverable")
            .notEmpty()
            .withMessage("Deliverable is required")
    ],
    validate,
    async (req, res) => {
    try {
        const {
            title,
            description,
            status,
            assigned_to,
            created_by,
            deadline,
            progress,
            priority,
            deliverable
        } = req.body;

        const result = await pool.query(
            `UPDATE tasks
             SET title = $1,
                 description = $2,
                 status = $3,
                 assigned_to = $4,
                 created_by = $5,
                 deadline = $6,
                 progress = $7,
                 priority = $8,
                 deliverable = $9
             WHERE task_id = $10
             RETURNING *`,
            [
                title,
                description,
                status,
                assigned_to,
                created_by,
                deadline,
                progress,
                priority,
                deliverable,
                req.params.id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE task
router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            "DELETE FROM tasks WHERE task_id = $1 RETURNING *",
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json({
            message: "Task deleted successfully"
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;






















