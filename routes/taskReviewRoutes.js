const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const verifyToken = require("../middleware/authMiddleware");
const { body } = require("express-validator");
const validate = require("../middleware/validationMiddleware");
const authorizeRole = require("../middleware/roleMiddleware");

// GET all reviews
router.get("/", verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM task_reviews ORDER BY review_id"
        );

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET review by ID
router.get("/:id", verifyToken,async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM task_reviews WHERE review_id = $1",
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Review not found"
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST review
router.post(
    "/",
    verifyToken, authorizeRole("Manager"),
    [
        body("task_id")
            .isInt({ min: 1 })
            .withMessage("task_id must be a valid ID"),

        body("manager_id")
            .isInt({ min: 1 })
            .withMessage("manager_id must be a valid user ID"),

        body("decision")
            .notEmpty()
            .withMessage("Decision is required"),

        body("comments")
            .notEmpty()
            .withMessage("Comments are required")
    ],
    validate,
    async (req, res) => {
    try {
        const {
            task_id,
            manager_id,
            decision,
            comments
        } = req.body;

        const result = await pool.query(
            `INSERT INTO task_reviews
            (task_id, manager_id, decision, comments)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [task_id, manager_id, decision, comments]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT review
router.put(
    "/:id",
    verifyToken,
    [
        body("task_id")
            .isInt({ min: 1 })
            .withMessage("task_id must be a valid ID"),

        body("manager_id")
            .isInt({ min: 1 })
            .withMessage("manager_id must be a valid user ID"),

        body("decision")
            .notEmpty()
            .withMessage("Decision is required"),

        body("comments")
            .notEmpty()
            .withMessage("Comments are required")
    ],
    validate,
    async (req, res) => {
    try {
        const {
            task_id,
            manager_id,
            decision,
            comments
        } = req.body;

        const result = await pool.query(
            `UPDATE task_reviews
             SET task_id = $1,
                 manager_id = $2,
                 decision = $3,
                 comments = $4,
                 reviewed_at = CURRENT_TIMESTAMP
             WHERE review_id = $5
             RETURNING *`,
            [
                task_id,
                manager_id,
                decision,
                comments,
                req.params.id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Review not found"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE review
router.delete("/:id", verifyToken,async (req, res) => {
    try {
        const result = await pool.query(
            `DELETE FROM task_reviews
             WHERE review_id = $1
             RETURNING *`,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Review not found"
            });
        }

        res.json({
            message: "Review deleted successfully"
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;