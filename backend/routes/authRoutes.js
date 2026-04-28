const router = require("express").Router();
const authController = require("../controllers/authController");
const validate = require("../middleware/validate");

router.post("/register", validate(authController.registerSchema), authController.register);
router.post("/login", validate(authController.loginSchema), authController.login);

module.exports = router;
