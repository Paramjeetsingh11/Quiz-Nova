const router = require("express").Router();
const userController = require("../controllers/userController");
const { authenticate } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

router.use(authenticate);

router.get("/me", userController.getProfile);
router.patch("/me", validate(userController.updateProfileSchema), userController.updateProfile);
router.get("/me/results", userController.getResults);
router.get("/me/analytics", userController.getAnalytics);

module.exports = router;
