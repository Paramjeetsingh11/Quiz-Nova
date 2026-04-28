const router = require("express").Router();
const aiController = require("../controllers/aiController");
const { authenticate } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

router.use(authenticate);

router.post("/generate-quiz", validate(aiController.generateSchema), aiController.generateQuiz);

module.exports = router;
