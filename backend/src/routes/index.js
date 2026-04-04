const express = require("express");

const authRoutes = require("./auth.routes");
const profileRoutes = require("./profile.routes");
const runRoutes = require("./run.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/runs", runRoutes);

module.exports = router;
