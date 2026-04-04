const path = require("path");
const dotenv = require("dotenv");

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

const env = {
  clientOrigin: process.env.CLIENT_ORIGIN || "*",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-me",
  port: Number(process.env.PORT) || 4000,
};

module.exports = env;
