const asyncHandler = require("../utils/async-handler");
const authService = require("../services/auth.service");

const signup = asyncHandler(async (req, res) => {
  const result = await authService.signup(req.body);

  res.status(201).json({
    message: "Account created successfully.",
    ...result,
  });
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);

  res.status(200).json({
    message: "Login successful.",
    ...result,
  });
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.auth.sub);

  res.status(200).json({
    user,
  });
});

module.exports = {
  login,
  me,
  signup,
};
