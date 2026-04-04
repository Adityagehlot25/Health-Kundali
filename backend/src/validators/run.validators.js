function validateRun(body) {
  const errors = [];

  if (body.distanceKm === undefined || Number.isNaN(Number(body.distanceKm))) {
    errors.push({
      field: "distanceKm",
      message: "distanceKm must be a valid number.",
    });
  }

  if (
    body.durationSeconds === undefined ||
    Number.isNaN(Number(body.durationSeconds))
  ) {
    errors.push({
      field: "durationSeconds",
      message: "durationSeconds must be a valid number.",
    });
  }

  if (!body.startedAt || Number.isNaN(Date.parse(body.startedAt))) {
    errors.push({
      field: "startedAt",
      message: "startedAt must be a valid ISO date string.",
    });
  }

  if (!body.endedAt || Number.isNaN(Date.parse(body.endedAt))) {
    errors.push({
      field: "endedAt",
      message: "endedAt must be a valid ISO date string.",
    });
  }

  return errors;
}

module.exports = {
  validateRun,
};
