const bcrypt = require("bcryptjs");
const { z } = require("zod");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { signToken } = require("../utils/token");
const { success } = require("../utils/apiResponse");

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80),
    email: z.string().email().max(160),
    password: z.string().min(8).max(128),
    avatar: z.string().url().optional()
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1)
  })
});

const register = asyncHandler(async (req, res) => {
  const existing = await User.findByEmail(req.body.email);

  if (existing) {
    throw new AppError("Email is already registered", 409);
  }

  const passwordHash = await bcrypt.hash(req.body.password, 12);
  const user = await User.create({
    name: req.body.name,
    email: req.body.email.toLowerCase(),
    passwordHash,
    avatar: req.body.avatar
  });

  return success(
    res,
    {
      user,
      token: signToken(user)
    },
    "Registration successful",
    201
  );
});

const login = asyncHandler(async (req, res) => {
  const user = await User.findByEmail(req.body.email.toLowerCase(), true);

  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    throw new AppError("Invalid email or password", 401);
  }

  delete user.password;

  return success(res, { user, token: signToken(user) }, "Login successful");
});

module.exports = {
  register,
  login,
  registerSchema,
  loginSchema
};
