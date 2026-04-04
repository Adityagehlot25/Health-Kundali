function validateProfile(body) {
  const errors = [];
  const requiredFields = [
    "fullName",
    "age",
    "gender",
    "weight",
    "height",
    "goal",
  ];

  requiredFields.forEach((field) => {
    if (!body[field] || String(body[field]).trim().length === 0) {
      errors.push({
        field,
        message: `${field} is required.`,
      });
    }
  });

  if (body.age && Number.isNaN(Number(body.age))) {
    errors.push({ field: "age", message: "Age must be a number." });
  }

  if (body.weight && Number.isNaN(Number(body.weight))) {
    errors.push({ field: "weight", message: "Weight must be a number." });
  }

  if (body.height && Number.isNaN(Number(body.height))) {
    errors.push({ field: "height", message: "Height must be a number." });
  }

  return errors;
}

module.exports = {
  validateProfile,
};
