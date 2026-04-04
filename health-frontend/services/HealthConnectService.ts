import { initialize, requestPermission, readRecords } from 'react-native-health-connect';

// 🛡️ THE SAFETY WRAPPER: If a sensor is blocked, return empty data instead of crashing
const safeRead = async (recordType: any, filter: any) => {
  try {
    return await readRecords(recordType, filter);
  } catch (error) {
    console.warn(`⚠️ Skipped ${recordType} - Phone blocked it or lacks hardware.`);
    return { records: [] }; // Return an empty array so the app survives
  }
};

export const fetchMasterBiologicalData = async () => {
  const isInitialized = await initialize();
  if (!isInitialized) throw new Error("Health Connect not available");

  // Requesting the vault (If the OS hides one, the safeRead will catch it)
  await requestPermission([
    { accessType: 'read', recordType: 'Steps' },
    { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
    { accessType: 'read', recordType: 'Distance' },
    { accessType: 'read', recordType: 'SleepSession' },
    { accessType: 'read', recordType: 'HeartRate' },
    { accessType: 'read', recordType: 'BloodPressure' },
    { accessType: 'read', recordType: 'OxygenSaturation' },
    { accessType: 'read', recordType: 'BodyTemperature' },
  ]);
  // 2. Rolling 48-hour window
  const today = new Date();
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const filter = {
    timeRangeFilter: {
      operator: 'between' as const,
      startTime: twoDaysAgo.toISOString(),
      endTime: today.toISOString(),
    },
  };

  // 🚀 THE BULLETPROOF FETCH: We fetch them sequentially safely
  const steps = await safeRead('Steps', filter);
  const calories = await safeRead('ActiveCaloriesBurned', filter);
  const distance = await safeRead('Distance', filter);
  const sleep = await safeRead('SleepSession', filter);
  const heartRate = await safeRead('HeartRate', filter);
  const bp = await safeRead('BloodPressure', filter);
  const oxygen = await safeRead('OxygenSaturation', filter);
  const temp = await safeRead('BodyTemperature', filter);

  return {
    syncTimestamp: today.toISOString(),
    timeWindow: "48h",
    biometrics: {
      activity: {
        steps,
        activeCalories: calories,
        distance,
      },
      sleep,
      vitals: { heartRate, bloodPressure: bp, oxygenSaturation: oxygen, bodyTemperature: temp }
    }
  };
};