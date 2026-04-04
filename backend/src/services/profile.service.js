const { readData, writeData } = require("../data/store");

async function getProfile(userId) {
  const data = await readData();
  return data.profiles.find((profile) => profile.userId === userId) || null;
}

async function upsertProfile(userId, input) {
  const data = await readData();
  const existingProfileIndex = data.profiles.findIndex(
    (profile) => profile.userId === userId,
  );

  const profile = {
    userId,
    fullName: String(input.fullName).trim(),
    age: String(input.age).trim(),
    gender: String(input.gender).trim(),
    weight: String(input.weight).trim(),
    height: String(input.height).trim(),
    goal: String(input.goal).trim(),
    updatedAt: new Date().toISOString(),
  };

  if (existingProfileIndex >= 0) {
    data.profiles[existingProfileIndex] = {
      ...data.profiles[existingProfileIndex],
      ...profile,
    };
  } else {
    data.profiles.push({
      ...profile,
      createdAt: new Date().toISOString(),
    });
  }

  await writeData(data);
  return data.profiles.find((entry) => entry.userId === userId);
}

module.exports = {
  getProfile,
  upsertProfile,
};
