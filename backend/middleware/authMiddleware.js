// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from '../models/User.js';
import Teacher from '../models/TeacherModel.js'
 
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Verify token
    const decoded = jwt.verify(token,process.env.JWT_SECRET);
    console.log("Decoded token:", decoded); // Debug log

    // Variable to store found user
    let user = null;
    let userType = null;

    // Try to find user in different collections based on role
    if (decoded.role === 'teacher') {
      user = await Teacher.findById(decoded.id).select('-password');
      userType = decoded.role; // Use role from token for teacher/admin
    }
    else {
      // Default to student/user
      user = await User.findById(decoded.id).select('-password');
      userType = 'student';
    }

    // If no user found in any collection
    if (!user) {
      return res.status(401).json({
        message: "User not found!",
       });
    }

    // Attach user info and type to request
    req.user = user;
    req.userType = userType;
    req.userId = decoded.id;
    req.userRole =  userType;

    next();

  } catch (error) {
    console.error("AUTH ERROR:", error.message);

    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: "Session expired. Please login again.",
        redirect: '/login'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: "Invalid token. Please login again.",
        redirect: '/login'
      });
    }

    res.status(401).json({
      message: "Authentication failed",
      redirect: '/login'
    });
  }
};

export default authMiddleware;