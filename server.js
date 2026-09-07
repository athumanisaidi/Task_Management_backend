
const express = require("express");
const db = require("./config/db");

const app = express();
const PORT = 3000;
app.use(express.json());

app.get("/", (req, res) => {
    res.send("node.js is running");
});
     const userRoutes = require("./routes/users");
    app.use("/api/users", userRoutes);

    const taskRoutes = require("./routes/taskRoutes");
    app.use("/api/tasks", taskRoutes);

    const taskAssignmentRoutes = require("./routes/taskAssignmentRoutes");
app.use("/api/task-assignments", taskAssignmentRoutes);

const taskProgressRoutes = require("./routes/taskProgressRoutes");
app.use("/api/task-progress", taskProgressRoutes);

const taskReviewRoutes = require("./routes/taskReviewRoutes");
app.use("/api/task-reviews",taskReviewRoutes);

const taskSubmissionRoutes = require("./routes/taskSubmissionRoutes");
app.use("/api/task-submissions", taskSubmissionRoutes);

const performanceReportRoutes = require("./routes/performanceReportRoutes");
app.use("/api/performance-reports", performanceReportRoutes);

const authRoutes = require("./routes/auth");
app.use("/api/auth",authRoutes);



app.get("/",(req, res) => {
    res.send("API is running...");
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});






