const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided, authorization denied",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role === "user") {
      // Check if user exists and is active
      const user = await User.findById(decoded.userId).select("-password");
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: "Token is not valid or user is inactive",
        });
      }
      req.user = decoded;
    } else if (decoded.role === "admin") {
      // Check if admin exists and is active
      const admin = await Admin.findById(decoded.adminId).select("-password");
      if (!admin || !admin.isActive) {
        return res.status(401).json({
          success: false,
          message: "Token is not valid or admin account is inactive",
        });
      }
      req.admin = decoded;
    } else {
      return res.status(401).json({
        success: false,
        message: "Invalid token role",
      });
    }

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({
      success: false,
      message: "Token is not valid",
    });
  }
};

module.exports = auth;
