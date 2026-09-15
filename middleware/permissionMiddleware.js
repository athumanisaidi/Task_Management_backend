const pool = require("../config/db");

const authorizePermission = (permissionName) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    message: "Unauthorized"
                });
            }

            const result = await pool.query(
                `SELECT up.user_permission_id
                 FROM user_permissions up
                 JOIN permissions p
                 ON up.permission_id = p.permission_id
                 WHERE up.user_id = $1
                 AND p.permission_name = $2`,
                [req.user.user_id, permissionName]
            );

            console.log("USER:", req.user.user_id);
            console.log("PERMISSION:", permissionName);
            console.log("RESULT:", result.rows);

            if (result.rows.length === 0) {
                return res.status(403).json({
                    message: "Access denied. You do not have this permission."
                });
            }

            next();

        } catch (error) {
            console.error(error);

            return res.status(500).json({
                message: "Server error",
                error: error.message
            });
        }
    };
};

module.exports = authorizePermission;