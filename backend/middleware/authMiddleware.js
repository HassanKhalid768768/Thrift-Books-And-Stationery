const jwt = require("jsonwebtoken");
const User = require("./../models/userModel");
const errorHandler = require("./../utils/errorHandler");
require("dotenv").config();

// Validate SECRET_KEY is set
if (!process.env.SECRET_KEY) {
  console.error("ERROR: SECRET_KEY is not set in environment variables!");
  console.error("Please add SECRET_KEY to your .env file in the backend directory.");
}

const authMiddleware = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      return next(errorHandler(401, "Unauthorized Access."));
    }
    
    const token = authorization.split(" ")[1];
    if (!token) {
      return next(errorHandler(401, "No token provided."));
    }
    
    if (!process.env.SECRET_KEY) {
      return next(errorHandler(500, "Server configuration error: SECRET_KEY is not set. Please contact administrator."));
    }
    
    const { id } = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findOne({ _id: id }).select("_id");
    
    if (!user) {
      return next(errorHandler(401, "User not found."));
    }
    
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(errorHandler(401, "Invalid or expired token."));
    }
    return next(errorHandler(401, "Please Login."));
  }
};

module.exports = authMiddleware;
