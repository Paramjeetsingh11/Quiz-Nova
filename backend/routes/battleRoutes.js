const router = require("express").Router();
const battleController = require("../controllers/battleController");
const { authenticate } = require("../middleware/authMiddleware");

router.use(authenticate);

router.get("/:roomId", battleController.getBattle);

module.exports = router;
