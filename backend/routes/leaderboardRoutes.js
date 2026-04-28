const router = require("express").Router();
const leaderboardController = require("../controllers/leaderboardController");
const { authenticate } = require("../middleware/authMiddleware");

router.use(authenticate);

router.get("/global", leaderboardController.getGlobalLeaderboard);
router.get("/weekly", leaderboardController.getWeeklyLeaderboard);

module.exports = router;
