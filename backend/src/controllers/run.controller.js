const asyncHandler = require("../utils/async-handler");
const runService = require("../services/run.service");

const listMyRuns = asyncHandler(async (req, res) => {
  const result = await runService.listRuns(req.auth.sub);

  res.status(200).json(result);
});

const createMyRun = asyncHandler(async (req, res) => {
  const run = await runService.createRun(req.auth.sub, req.body);

  res.status(201).json({
    message: "Run saved successfully.",
    run,
  });
});

module.exports = {
  createMyRun,
  listMyRuns,
};
