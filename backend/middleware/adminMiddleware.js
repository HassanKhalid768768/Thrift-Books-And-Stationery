const User = require("./../models/userModel");
const errorHandler = require("./../utils/errorHandler");

const adminMiddleware = async (req, res, next) => {
  try {
    // Check if user is authenticated first
    if (!req.user || !req.user._id) {
      return next(errorHandler(401, "Authentication required."));
    }
    
    // Get the complete user data (including the role field)
    const user = await User.findById(req.user._id);
    
    // Check if user exists and has admin role
    if (!user) {
      return next(errorHandler(404, "User not found."));
    }
    
    if (user.role !== "admin") {
      return next(errorHandler(403, "Access denied. Admin privileges required."));
    }
    
    // User is an admin, proceed to the next middleware
    next();
  } catch (err) {
    console.error("Admin middleware error:", err);
    return next(errorHandler(500, "Server error while verifying admin access."));
  }
};

module.exports = adminMiddleware;

