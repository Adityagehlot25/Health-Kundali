const express = require("express");

const profileController = require("../controllers/profile.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const { validateProfile } = require("../validators/profile.validators");

const router = express.Router();

router.get("/me", requireAuth, profileController.getMyProfile);
router.put(
  "/me",
  requireAuth,
  validate(validateProfile),
  profileController.updateMyProfile,
);

module.exports = router;
