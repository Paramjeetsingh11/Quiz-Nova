const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/apiResponse");
const leaderboardService = require("../services/leaderboardService");

const getGlobalLeaderboard = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit || 50), 100);
  const users = await leaderboardService.globalLeaderboard(limit);
  return success(res, { users }, "Global leaderboard fetched");
});

const getWeeklyLeaderboard = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit || 50), 100);
  const users = await leaderboardService.weeklyLeaderboard(limit);
  return success(res, { users }, "Weekly leaderboard fetched");
});

module.exports = {
  getGlobalLeaderboard,
  getWeeklyLeaderboard
};
