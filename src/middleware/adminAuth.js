const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided, authorization denied",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user is admin
    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    // Check if admin exists and is active
    const admin = await Admin.findById(decoded.adminId).select("-password");
    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: "Token is not valid or admin account is inactive",
      });
    }

    req.admin = decoded;
    req.admin.permissions = admin.permissions; // Attach permissions to request
    next();
  } catch (error) {
    console.error("Admin auth middleware error:", error);
    res.status(401).json({
      success: false,
      message: "Token is not valid",
    });
  }
};

// Permission middleware
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin.permissions[permission]) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required permission: ${permission}`,
      });
    }
    next();
  };
};

module.exports = { adminAuth, requirePermission };
