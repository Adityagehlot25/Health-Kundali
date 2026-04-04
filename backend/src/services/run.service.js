const { v4: uuid } = require("uuid");

const { readData, writeData } = require("../data/store");

async function createRun(userId, input) {
  const data = await readData();
  const distanceKm = Number(input.distanceKm);
  const durationSeconds = Number(input.durationSeconds);
  const averagePaceSecondsPerKm =
    distanceKm > 0 ? Math.round(durationSeconds / distanceKm) : null;

  const run = {
    id: uuid(),
    userId,
    distanceKm,
    durationSeconds,
    startedAt: input.startedAt,
    endedAt: input.endedAt,
    averagePaceSecondsPerKm,
    notes: input.notes ? String(input.notes).trim() : "",
    createdAt: new Date().toISOString(),
  };

  data.runs.push(run);
  await writeData(data);

  return run;
}

async function listRuns(userId) {
  const data = await readData();
  const runs = data.runs
    .filter((run) => run.userId === userId)
    .sort((left, right) => new Date(right.startedAt) - new Date(left.startedAt));

  const totalDistanceKm = runs.reduce((sum, run) => sum + run.distanceKm, 0);
  const totalDurationSeconds = runs.reduce(
    (sum, run) => sum + run.durationSeconds,
    0,
  );

  return {
    runs,
    summary: {
      totalRuns: runs.length,
      totalDistanceKm: Number(totalDistanceKm.toFixed(3)),
      totalDurationSeconds,
    },
  };
}

module.exports = {
  createRun,
  listRuns,
};
