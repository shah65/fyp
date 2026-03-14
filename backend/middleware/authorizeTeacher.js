// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from '../models/User.js';
import Teacher from '../models/TeacherModel.js';

const authMiddleware = async (req, res, next) => {
  try {
    // Try to get token from cookie first, then from Authorization header
    let token = req.cookies.token;

    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //console.log("Decoded token:", decoded);

    // Variable to store found user
    let user = null;
    let userType = null;

    // Try to find user in different collections based on role from token
    if (decoded.role === 'teacher') {
      user = await Teacher.findById(decoded.id).select('-password');
      userType = 'teacher';
    } else {
      // Default to student/user
      user = await User.findById(decoded.id).select('-password');
      userType = 'student';
    }

    // If no user found
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ CRITICAL: Set ALL role properties on req
    req.user = user;
    req.userType = userType;
    req.userId = decoded.id;
    req.userRole = userType;  // This is what authorizeTeacher uses

    // Also add role to the user object itself
    req.user.role = userType;

    // console.log('Auth middleware - User authenticated:', {
    //   id: req.userId,
    //   role: req.userRole,
    //   type: req.userType,
    //   userRole: req.user.role
    // });

    next();

  } catch (error) {
    console.error("AUTH ERROR:", error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again."
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please login again."
      });
    }

    res.status(401).json({
      success: false,
      message: "Authentication failed"
    });
  }
};

export default authMiddleware;