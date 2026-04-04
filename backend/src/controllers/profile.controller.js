const asyncHandler = require("../utils/async-handler");
const profileService = require("../services/profile.service");

const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.getProfile(req.auth.sub);

  res.status(200).json({
    profile,
  });
});

const updateMyProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.upsertProfile(req.auth.sub, req.body);

  res.status(200).json({
    message: "Profile saved successfully.",
    profile,
  });
});

module.exports = {
  getMyProfile,
  updateMyProfile,
};
