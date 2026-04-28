const { z } = require("zod");
const Result = require("../models/Result");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/apiResponse");
const getPagination = require("../utils/pagination");
const analyticsService = require("../services/analyticsService");

const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80).optional(),
    avatar: z.string().url().nullable().optional()
  })
});

const getProfile = asyncHandler(async (req, res) => {
  return success(res, { user: req.user }, "Profile fetched");
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.updateProfile(req.user.id, req.body);
  return success(res, { user }, "Profile updated");
});

const getResults = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const results = await Result.listByUser(req.user.id, pagination);
  return success(res, { results }, "Results fetched", 200, pagination);
});

const getAnalytics = asyncHandler(async (req, res) => {
  const analytics = await analyticsService.getUserAnalytics(req.user.id);
  return success(res, { analytics }, "Analytics fetched");
});

module.exports = {
  getProfile,
  updateProfile,
  getResults,
  getAnalytics,
  updateProfileSchema
};
