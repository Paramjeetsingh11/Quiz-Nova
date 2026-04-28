const Quiz = require("../models/Quiz");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { success } = require("../utils/apiResponse");
const getPagination = require("../utils/pagination");

const getUsers = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const users = await User.list(pagination);
  return success(res, { users }, "Users fetched", 200, pagination);
});

const deleteUser = asyncHandler(async (req, res) => {
  if (Number(req.params.id) === Number(req.user.id)) {
    throw new AppError("Admins cannot delete their own account", 400);
  }

  const deleted = await User.remove(req.params.id);

  if (!deleted) {
    throw new AppError("User not found", 404);
  }

  return success(res, null, "User deleted");
});

const viewQuizzes = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const quizzes = await Quiz.list(pagination);
  return success(res, { quizzes }, "Quizzes fetched", 200, pagination);
});

module.exports = {
  getUsers,
  deleteUser,
  viewQuizzes
};
