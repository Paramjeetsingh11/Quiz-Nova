const router = require("express").Router();
const adminController = require("../controllers/adminController");
const { authenticate, requireAdmin } = require("../middleware/authMiddleware");

router.use(authenticate, requireAdmin);

router.get("/users", adminController.getUsers);
router.delete("/users/:id", adminController.deleteUser);
router.get("/quizzes", adminController.viewQuizzes);

module.exports = router;
