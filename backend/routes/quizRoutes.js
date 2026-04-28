const router = require("express").Router();
const quizController = require("../controllers/quizController");
const { authenticate } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

router.use(authenticate);

router.get("/", validate(quizController.topicSchema), quizController.getByTopic);
router.post("/submit", validate(quizController.submitSchema), quizController.submitQuiz);

module.exports = router;
