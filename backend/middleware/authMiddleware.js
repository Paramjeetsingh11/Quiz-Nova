const AppError = require("../utils/AppError");
const { verifyToken } = require("../utils/token");
const User = require("../models/User");

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;
    const token = header && header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      throw new AppError("Authentication token is required", 401);
    }

    const payload = verifyToken(token);
    const user = await User.findById(payload.id);

    if (!user) {
      throw new AppError("User no longer exists", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error.isOperational ? error : new AppError("Invalid or expired token", 401));
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return next(new AppError("Admin privileges required", 403));
  }

  next();
}

module.exports = {
  authenticate,
  requireAdmin
};
