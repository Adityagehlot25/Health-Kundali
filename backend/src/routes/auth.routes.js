const express = require("express");

const authController = require("../controllers/auth.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const {
  validateLogin,
  validateSignup,
} = require("../validators/auth.validators");

const router = express.Router();

router.post("/signup", validate(validateSignup), authController.signup);
router.post("/login", validate(validateLogin), authController.login);
router.get("/me", requireAuth, authController.me);

module.exports = router;
