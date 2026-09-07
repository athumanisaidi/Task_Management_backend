const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const verifyToken = require("../middleware/authMiddleware");
const { body } = require("express-validator");
const validate = require("../middleware/validationMiddleware");


// GET all assignments
router.get("/", verifyToken,async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM task_assignments ORDER BY assignment_id"
        );

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET assignment by ID
router.get("/:id", verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM task_assignments WHERE assignment_id = $1",
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Assignment not found"
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST - create assignment
router.post(
    "/",
    verifyToken,
    [
        body("task_id")
            .isInt({ min: 1 })
            .withMessage("task_id must be a valid ID"),

        body("staff_id")
            .isInt({ min: 1 })
            .withMessage("staff_id must be a valid user ID")
    ],
    validate,
    async (req, res) => {
    try {
        const { task_id, staff_id } = req.body;

        const result = await pool.query(
            `INSERT INTO task_assignments
            (task_id, staff_id)
            VALUES ($1, $2)
            RETURNING *`,
            [task_id, staff_id]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT - update assignment
router.put(
    "/:id",
    verifyToken,
    [
        body("task_id")
            .isInt({ min: 1 })
            .withMessage("task_id must be a valid ID"),

        body("staff_id")
            .isInt({ min: 1 })
            .withMessage("staff_id must be a valid user ID")
    ],
    validate,
    async (req, res) => {
    try {
        const { task_id, staff_id } = req.body;

        const result = await pool.query(
            `UPDATE task_assignments
             SET task_id = $1,
                 staff_id = $2
             WHERE assignment_id = $3
             RETURNING *`,
            [task_id, staff_id, req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Assignment not found"
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE assignment
router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            `DELETE FROM task_assignments
             WHERE assignment_id = $1
             RETURNING *`,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Assignment not found"
            });
        }

        res.json({
            message: "Assignment deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;