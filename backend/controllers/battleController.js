const Battle = require("../models/Battle");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { success } = require("../utils/apiResponse");

const getBattle = asyncHandler(async (req, res) => {
  const battle = await Battle.findByRoom(req.params.roomId);

  if (!battle) {
    throw new AppError("Battle not found", 404);
  }

  return success(res, { battle }, "Battle fetched");
});

module.exports = {
  getBattle
};
