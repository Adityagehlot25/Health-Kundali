const ApiError = require("../utils/api-error");

function validate(validator) {
  return (req, res, next) => {
    const errors = validator(req.body || {});

    if (errors.length > 0) {
      return next(new ApiError(400, "Validation failed.", errors));
    }

    return next();
  };
}

module.exports = validate;
