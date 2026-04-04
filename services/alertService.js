export const generateRealTimeAlert = (currentSteps, dailyGoal) => {
  const currentHour = new Date().getHours();
  
  // Assuming a 16-hour active day (e.g., 8 AM to 12 AM)
  const activeHours = 16; 
  const hoursPassed = Math.max(0, currentHour - 8); 
  
  if (hoursPassed <= 0) return null;

  const expectedSteps = Math.floor((dailyGoal / activeHours) * hoursPassed);
  
  if (currentSteps >= dailyGoal) {
    return { type: 'success', message: "🔥 Step Goal Crushed! You're amazing today!" };
  } else if (currentSteps < expectedSteps - 1500) {
    return { type: 'warning', message: `⚠️ You are ${expectedSteps - currentSteps} steps behind schedule!` };
  } else if (currentSteps > expectedSteps) {
    return { type: 'positive', message: "🚀 You are ahead of your step schedule! Keep it up!" };
  }
  
  return null; 
};

export const generateNutritionAlert = (todayCalories, goal) => {
  if (!todayCalories || !goal) return null;
  
  // Calorie balance = burned - intake
  // Negative balance means surplus (eating more than burning)
  
  if (todayCalories.calories_intake > goal.target_intake) {
    return { type: 'warning', message: `⚠️ Calorie intake exceeded by ${todayCalories.calories_intake - goal.target_intake} kcal today!` };
  } else if (todayCalories.balance < -1500) { 
    return { type: 'warning', message: "⚠️ High calorie surplus detected. Time for a quick walk?" };
  } else if (todayCalories.calories_burned >= goal.target_burn) {
    return { type: 'success', message: "🔥 Daily calorie burn goal reached!" };
  }
  
  return null; 
};

// ==========================================
// 🌙 NEW: SLEEP ALERTS
// ==========================================
export const generateSleepAlert = (todaySleep, cumulativeDebt, goal) => {
  if (!todaySleep || !goal) return null;

  if (cumulativeDebt > 8) {
    return { type: 'warning', message: `⚠️ Critical sleep debt (${cumulativeDebt} hrs). Your body needs recovery ASAP!` };
  } else if (cumulativeDebt > 3) {
    return { type: 'warning', message: `⚠️ Sleep debt is building up (${cumulativeDebt} hrs). Try going to bed a bit earlier tonight.` };
  } else if (todaySleep.sleep_hours >= goal.target_sleep_hours) {
    return { type: 'success', message: "🌙 Great sleep last night! You hit your recovery target." };
  }
  
  return null; 
};

// ==========================================
// 🏃‍♀️ NEW: ACTIVITY & PACE ALERTS
// ==========================================
export const generateActivityAlert = (latestActivity, goal) => {
  if (!latestActivity) return null;

  // 1. Check if distance goal was crushed
  if (goal && latestActivity.distance >= goal.target_distance_km) {
    return { type: 'success', message: `🏆 Incredible! You crushed your target distance of ${goal.target_distance_km}km!` };
  }

  // 2. Fatigue Detection: Check if last split is way slower than the first
  if (latestActivity.splits && latestActivity.splits.length >= 3) {
    const firstSplit = latestActivity.splits[0];
    const lastSplit = latestActivity.splits[latestActivity.splits.length - 1];
    
    // Note: In pace, a higher number means slower (e.g., 6.50 is slower than 6.00)
    if (lastSplit - firstSplit > 0.5) {
      return { type: 'warning', message: "⚠️ Pace drop detected towards the end. Remember to start slow and pace yourself!" };
    }
  }

  // 3. Check if they beat their target pace
  if (goal && latestActivity.avg_pace <= goal.target_pace) {
    return { type: 'positive', message: `🚀 Flying! You beat your target pace of ${goal.target_pace} min/km.` };
  }

  return null; 
};

// ==========================================
// 🔋 NEW: FATIGUE & RECOVERY ALERTS
// ==========================================
export const generateFatigueAlert = (fatigueScore) => {
  if (fatigueScore == null) return null;

  if (fatigueScore >= 75) {
    return { type: 'warning', message: "🔴 High Fatigue Detected! Your body is screaming for a rest day or active recovery." };
  } else if (fatigueScore >= 40) {
    return { type: 'positive', message: "🟡 Moderate Fatigue. You're pushing it, but still in a safe zone. Prioritize sleep tonight." };
  } else {
    return { type: 'success', message: "🟢 Prime Condition! Fatigue is low. You are fully recovered and ready to crush it." };
  }
};
// ==========================================
// ❤️‍🔥 NEW: HEART RATE & INTENSITY ALERTS
// ==========================================
export const generateIntensityAlert = (latestWorkout) => {
  if (!latestWorkout || !latestWorkout.zones) return null;

  const { z2, z4, z5 } = latestWorkout.zones;
  const highIntensityTime = (z4 || 0) + (z5 || 0);
  const duration = latestWorkout.duration || 1; // Prevent division by zero

  if ((z5 || 0) > 15) {
    return { type: 'warning', message: "⚠️ Extreme time spent in Zone 5 (Max HR). Ensure you properly recover after this!" };
  } else if (highIntensityTime > duration * 0.6) {
    return { type: 'warning', message: "🟡 High-intensity heavy workout! Watch out for overtraining if you do this daily." };
  } else if ((z2 || 0) >= duration * 0.6) {
    return { type: 'success', message: "🟢 Textbook Zone 2 session! Perfect for building your aerobic base and burning fat." };
  }

  return null; 
};

// ==========================================
// ❤️ NEW: BLOOD PRESSURE ALERTS
// ==========================================
export const generateBloodPressureAlert = (systolic, diastolic) => {
  if (!systolic || !diastolic) return null;

  if (systolic >= 140 || diastolic >= 90) {
    return { type: 'warning', message: "🔴 Hypertension Stage 2. Your blood pressure is quite high today. Please monitor it closely." };
  } else if (systolic >= 130 || diastolic >= 80) {
    return { type: 'warning', message: "🟠 Hypertension Stage 1. Keep an eye on your stress, hydration, and sodium intake today." };
  } else if (systolic >= 120 && diastolic < 80) {
    return { type: 'positive', message: "🟡 Elevated reading. A great time for some deep breathing, meditation, or a light walk." };
  } else {
    return { type: 'success', message: "🟢 Normal reading! Your cardiovascular system is in great shape." };
  }
};

// ==========================================
// 🫁 NEW: SpO2 & BLOOD OXYGEN ALERTS
// ==========================================
export const generateSpo2Alert = (minSpo2, dropsCount) => {
  if (!minSpo2) return null;

  if (minSpo2 < 90 || dropsCount >= 5) {
    return { type: 'warning', message: "🔴 Critical oxygen dips detected during sleep. Multiple drops below healthy thresholds." };
  } else if (minSpo2 < 94 || dropsCount >= 2) {
    return { type: 'warning', message: "🟡 Moderate SpO2 fluctuations. Keep an eye on your sleep environment and breathing." };
  } else {
    return { type: 'success', message: "🟢 Optimal blood oxygen stability! Incredible respiratory recovery overnight." };
  }
};
// ==========================================
// 🌡️ NEW: BODY TEMPERATURE ALERTS
// ==========================================
export const generateTemperatureAlert = (deviation) => {
  if (deviation == null) return null;

  if (deviation >= 0.7) {
    return { type: 'warning', message: "🔴 High temperature deviation. Possible illness onset or fever detected. Prioritize rest!" };
  } else if (deviation >= 0.3) {
    return { type: 'warning', message: "🟡 Elevated body temperature. Your body might be fighting something or recovering from heavy strain." };
  } else if (deviation <= -0.5) {
    return { type: 'warning', message: "❄️ Unusually low temperature reading. Ensure your wearable is fitted properly." };
  } else {
    return { type: 'success', message: "🟢 Temperature is stable and within your normal baseline." };
  }
};