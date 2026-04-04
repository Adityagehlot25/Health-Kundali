const fs = require("fs/promises");
const path = require("path");

const dataFilePath = path.join(__dirname, "db.json");

let writeQueue = Promise.resolve();

async function ensureDataFile() {
  try {
    await fs.access(dataFilePath);
  } catch {
    const initialState = {
      users: [],
      profiles: [],
      runs: [],
    };

    await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
    await fs.writeFile(dataFilePath, JSON.stringify(initialState, null, 2));
  }
}

async function readData() {
  await ensureDataFile();
  const raw = await fs.readFile(dataFilePath, "utf-8");
  return JSON.parse(raw);
}

async function writeData(nextState) {
  await ensureDataFile();

  writeQueue = writeQueue.then(() =>
    fs.writeFile(dataFilePath, JSON.stringify(nextState, null, 2)),
  );

  return writeQueue;
}

async function updateData(updater) {
  const current = await readData();
  const next = await updater(current);
  await writeData(next);
  return next;
}

module.exports = {
  readData,
  updateData,
  writeData,
};
