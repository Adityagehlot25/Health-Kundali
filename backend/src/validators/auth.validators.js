function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function validateSignup(body) {
  const errors = [];

  if (!body.name || String(body.name).trim().length < 2) {
    errors.push({ field: "name", message: "Name must be at least 2 characters." });
  }

  if (!isEmail(body.email)) {
    errors.push({ field: "email", message: "Enter a valid email address." });
  }

  if (!body.password || String(body.password).length < 6) {
    errors.push({
      field: "password",
      message: "Password must be at least 6 characters long.",
    });
  }

  return errors;
}

function validateLogin(body) {
  const errors = [];

  if (!isEmail(body.email)) {
    errors.push({ field: "email", message: "Enter a valid email address." });
  }

  if (!body.password || String(body.password).length < 6) {
    errors.push({
      field: "password",
      message: "Password must be at least 6 characters long.",
    });
  }

  return errors;
}

module.exports = {
  validateLogin,
  validateSignup,
};
