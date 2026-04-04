const jwt = require("jsonwebtoken");

const env = require("../config/env");
const ApiError = require("../utils/api-error");

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiError(401, "Authentication token is required."));
  }

  const token = authHeader.replace("Bearer ", "").trim();

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.auth = payload;
    return next();
  } catch {
    return next(new ApiError(401, "Invalid or expired authentication token."));
  }
}

module.exports = {
  requireAuth,
};
