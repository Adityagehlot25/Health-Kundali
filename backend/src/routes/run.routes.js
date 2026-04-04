const express = require("express");

const runController = require("../controllers/run.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const { validateRun } = require("../validators/run.validators");

const router = express.Router();

router.get("/", requireAuth, runController.listMyRuns);
router.post("/", requireAuth, validate(validateRun), runController.createMyRun);

module.exports = router;
