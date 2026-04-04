const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuid } = require("uuid");

const env = require("../config/env");
const { readData, writeData } = require("../data/store");
const ApiError = require("../utils/api-error");

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function sanitizeUser(user, profileCompleted = false) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    profileCompleted,
  };
}

function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn },
  );
}

async function signup(input) {
  const data = await readData();
  const email = normalizeEmail(input.email);
  const existingUser = data.users.find((user) => user.email === email);

  if (existingUser) {
    throw new ApiError(409, "An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = {
    id: uuid(),
    email,
    name: String(input.name).trim(),
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  data.users.push(user);
  await writeData(data);

  return {
    token: signToken(user),
    user: sanitizeUser(user, false),
  };
}

async function login(input) {
  const data = await readData();
  const email = normalizeEmail(input.email);
  const user = data.users.find((entry) => entry.email === email);

  if (!user) {
    throw new ApiError(401, "User does not exist. Please sign up.");
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

  if (!passwordMatches) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const profileCompleted = data.profiles.some(
    (profile) => profile.userId === user.id,
  );

  return {
    token: signToken(user),
    user: sanitizeUser(user, profileCompleted),
  };
}

async function getCurrentUser(userId) {
  const data = await readData();
  const user = data.users.find((entry) => entry.id === userId);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const profileCompleted = data.profiles.some(
    (profile) => profile.userId === user.id,
  );

  return sanitizeUser(user, profileCompleted);
}

module.exports = {
  getCurrentUser,
  login,
  signup,
};
