const jwt = require("jsonwebtoken");
const User = require("./../models/userModel");
const errorHandler = require("./../utils/errorHandler");

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
