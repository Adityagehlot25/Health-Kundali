import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateRealTimeAlert, generateNutritionAlert, generateSleepAlert } from '../services/alertService.js';
import { generateRealTimeAlert, generateNutritionAlert, generateSleepAlert, generateActivityAlert } from '../services/alertService.js';
import { generateRealTimeAlert, generateNutritionAlert, generateSleepAlert, generateActivityAlert, generateFatigueAlert } from '../services/alertService.js';
import { generateRealTimeAlert, generateNutritionAlert, generateSleepAlert, generateActivityAlert, generateFatigueAlert, generateIntensityAlert } from '../services/alertService.js';
import { generateRealTimeAlert, generateNutritionAlert, generateSleepAlert, generateActivityAlert, generateFatigueAlert, generateIntensityAlert, generateBloodPressureAlert } from '../services/alertService.js';
import { generateRealTimeAlert, generateNutritionAlert, generateSleepAlert, generateActivityAlert, generateFatigueAlert, generateIntensityAlert, generateBloodPressureAlert, generateSpo2Alert } from '../services/alertService.js';
import { generateRealTimeAlert, generateNutritionAlert, generateSleepAlert, generateActivityAlert, generateFatigueAlert, generateIntensityAlert, generateBloodPressureAlert, generateSpo2Alert, generateTemperatureAlert } from '../services/alertService.js';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Shared Gemini Config
const geminiConfig = { 
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: 0.9
  }
};

// ==========================================
// 🏃‍♂️ PLANET 1: STEPS & ACTIVITY
// ==========================================
export const analyzeSteps = async (req, res) => {
  try {
    const { daily, weekly } = req.body;

    if (!daily || !weekly) {
      return res.status(400).json({ error: "Missing daily or weekly step data." });
    }

    const alert = generateRealTimeAlert(daily.steps, daily.goal_steps);
    const model = genAI.getGenerativeModel(geminiConfig);

    const prompt = `
      You are an AI fitness assistant focused on movement. 
      Daily Steps: ${JSON.stringify(daily)}
      Weekly Steps: ${JSON.stringify(weekly)}

      Return ONLY valid JSON:
      {
        "insight": "1-2 line analysis of their step progress",
        "recommendations": ["Actionable tip 1", "Actionable tip 2"],
        "warnings": ["Warning if falling behind, or empty array"],
        "motivation": "Short motivational sentence"
      }
    `;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text().trim();
    
    // Extract JSON from markdown code blocks - handle various formats
    if (responseText.includes('```')) {
      const match = responseText.match(/```[\w]*\n?([\s\S]*?)\n?```/);
      if (match) {
        responseText = match[1].trim();
      }
    }
    
    const aiResponse = JSON.parse(responseText);

    res.json({ alert, aiData: aiResponse });

  } catch (err) {
    console.error("Step analysis error:", err);
    res.status(500).json({ error: "Failed to generate step insights." });
  }
};

// ==========================================
// 🍎 PLANET 2: NUTRITION & CALORIES
// ==========================================
export const analyzeNutrition = async (req, res) => {
  try {
    const { nutrition } = req.body;

    if (!nutrition || !nutrition.today) {
      return res.status(400).json({ error: "Missing nutrition data." });
    }

    // 🧮 1. Dynamic Calorie Math
    // Formula: ~0.04 calories burned per step
    const calculatedBurn = Math.round((nutrition.today.steps || 0) * 0.04);
    
    // Balance = Burned - Intake (Negative = Surplus/Gaining, Positive = Deficit/Losing)
    const calculatedBalance = calculatedBurn - nutrition.today.calories_intake;

    // Build the complete 'today' object to pass to the alert and AI
    const enrichedToday = {
      ...nutrition.today,
      calories_burned: calculatedBurn,
      balance: calculatedBalance
    };

    // 🚨 2. Check Alerts using the newly calculated data
    const alert = generateNutritionAlert(enrichedToday, nutrition.goal);
    const model = genAI.getGenerativeModel(geminiConfig);

    // 🤖 3. Feed the dynamic data to Gemini
    const prompt = `
      You are an AI fitness assistant focused on diet and calories.
      Goal: ${JSON.stringify(nutrition.goal)}
      Today's Computed Data: ${JSON.stringify(enrichedToday)} 
      Recent Trend: ${JSON.stringify(nutrition.recent_days)}

      Note: The user took ${enrichedToday.steps} steps today, burning ${enrichedToday.calories_burned} calories. 
      Their net calorie balance is ${enrichedToday.balance}.

      Return ONLY valid JSON:
      {
        "insight": "1-2 line analysis of their calorie balance (burned vs intake)",
        "recommendations": ["Diet or calorie tip 1", "Diet or calorie tip 2"],
        "warnings": ["Warning if in high surplus, or empty array"],
        "motivation": "Short motivational sentence regarding their diet"
      }
    `;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text().trim();
    
    // Extract JSON from markdown code blocks - handle various formats
    if (responseText.includes('```')) {
      const match = responseText.match(/```[\w]*\n?([\s\S]*?)\n?```/);
      if (match) {
        responseText = match[1].trim();
      }
    }
    
    const aiResponse = JSON.parse(responseText);

    // Send back computed stats for frontend charts
    res.json({ 
      computedStats: enrichedToday, 
      alert, 
      aiData: aiResponse 
    });

  } catch (err) {
    console.error("Nutrition analysis error:", err);
    res.status(500).json({ error: "Failed to generate nutrition insights." });
  }
};

// ==========================================
// 🌙 PLANET 3: SLEEP & RECOVERY
// ==========================================
export const analyzeSleep = async (req, res) => {
  try {
    const { sleep } = req.body;

    if (!sleep || !sleep.today || !sleep.goal) {
      return res.status(400).json({ error: "Missing sleep data." });
    }

    // 🧮 1. Dynamic Sleep Math
    const target = sleep.goal.target_sleep_hours;
    const slept = sleep.today.sleep_hours;
    const daily_debt = target - slept;

    // Calculate cumulative debt by summing past recent days + today's debt
    let past_debt = 0;
    if (sleep.recent_days && Array.isArray(sleep.recent_days)) {
      past_debt = sleep.recent_days.reduce((sum, day) => sum + (day.debt || 0), 0);
    }
    const cumulative_debt = past_debt + daily_debt;

    // Build the enriched object to send back to UI and AI
    const enrichedToday = {
      ...sleep.today,
      daily_debt: Number(daily_debt.toFixed(1)),
      cumulative_debt: Number(cumulative_debt.toFixed(1))
    };

    // 🚨 2. Check Alerts
    const alert = generateSleepAlert(enrichedToday, cumulative_debt, sleep.goal);
    const model = genAI.getGenerativeModel(geminiConfig);

    // 🤖 3. Feed the dynamic data to Gemini
    const prompt = `
      You are an AI sleep and recovery coach.
      Goal: ${JSON.stringify(sleep.goal)}
      Today's Computed Data: ${JSON.stringify(enrichedToday)}
      Recent Trend: ${JSON.stringify(sleep.recent_days)}
      Cumulative Sleep Debt: ${cumulative_debt} hours.

      Return ONLY valid JSON:
      {
        "insight": "1-2 line analysis of their sleep debt and recovery patterns",
        "recommendations": ["Sleep hygiene tip 1", "Sleep hygiene tip 2"],
        "warnings": ["Warning if high sleep debt, or empty array"],
        "motivation": "Short motivational sentence about rest and recovery"
      }
    `;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text().trim();
    
    if (responseText.includes('```')) {
      const match = responseText.match(/```[\w]*\n?([\s\S]*?)\n?```/);
      if (match) {
        responseText = match[1].trim();
      }
    }
    
    const aiResponse = JSON.parse(responseText);

    res.json({ 
      computedStats: enrichedToday, 
      alert, 
      aiData: aiResponse 
    });

  } catch (err) {
    console.error("Sleep analysis error:", err);
    res.status(500).json({ error: "Failed to generate sleep insights." });
  }
};

// ==========================================
// 🏃‍♀️ PLANET 4: RUNNING & ACTIVITY
// ==========================================
export const analyzeActivity = async (req, res) => {
  try {
    const { activity } = req.body;

    if (!activity || !activity.latest_activity) {
      return res.status(400).json({ error: "Missing activity data." });
    }

    // 🚨 1. Check Alerts (Fatigue, Goal reached, etc.)
    const alert = generateActivityAlert(activity.latest_activity, activity.goal);
    const model = genAI.getGenerativeModel(geminiConfig);

    // 🤖 2. Feed the data to Gemini
    const prompt = `
      You are an AI running coach and performance analyst.
      Goal: ${JSON.stringify(activity.goal || {})}
      Latest Run: ${JSON.stringify(activity.latest_activity)}
      Recent History: ${JSON.stringify(activity.recent_activities || [])}

      Note: Pace is in minutes per kilometer. Lower is faster.

      Return ONLY valid JSON:
      {
        "insight": "1-2 line analysis of their pace, distance, and split consistency",
        "recommendations": ["Running tip 1 (e.g., pacing strategy, form)", "Running tip 2 (e.g., recovery, intervals)"],
        "warnings": ["Warning if showing severe fatigue or inconsistent splits, or empty array"],
        "motivation": "Short, hype motivational sentence for a runner"
      }
    `;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text().trim();
    
    // Extract JSON from markdown code blocks
    if (responseText.includes('```')) {
      const match = responseText.match(/```[\w]*\n?([\s\S]*?)\n?```/);
      if (match) {
        responseText = match[1].trim();
      }
    }
    
    const aiResponse = JSON.parse(responseText);

    res.json({ 
      computedStats: activity.latest_activity, 
      alert, 
      aiData: aiResponse 
    });

  } catch (err) {
    console.error("Activity analysis error:", err);
    res.status(500).json({ error: "Failed to generate activity insights." });
  }
};

// ==========================================
// 🔋 PLANET 5: FATIGUE & RECOVERY SCORE
// ==========================================
export const analyzeFatigue = async (req, res) => {
  try {
    const { fatigueData } = req.body;

    if (!fatigueData || !fatigueData.today) {
      return res.status(400).json({ error: "Missing fatigue data payload." });
    }

    // 🧮 1. Dynamic Fatigue Math (WHOOP-style Logic)
    const steps = fatigueData.today.steps || 0;
    const sleepHours = fatigueData.today.sleep_hours || 0;
    const targetSleep = fatigueData.goal?.target_sleep || 8;

    // Calculate Debt
    const sleepDebt = Math.max(0, targetSleep - sleepHours);

    // Normalize Activity Load (Assume 15,000 steps = 100% max daily load)
    const activityLoadScore = Math.min((steps / 15000) * 100, 100);

    // Normalize Sleep Deficit (Assume 4 hours debt = 100% max deficit)
    const sleepDeficitScore = Math.min((sleepDebt / 4) * 100, 100);

    // Calculate Final Score: 60% Activity + 40% Sleep Debt
    const fatigueScore = Math.round((activityLoadScore * 0.6) + (sleepDeficitScore * 0.4));

    // Determine Level
    let level = "low";
    if (fatigueScore >= 70) level = "high";
    else if (fatigueScore >= 40) level = "moderate";

    // Build the enriched object for the UI and AI
    const enrichedToday = {
      ...fatigueData.today,
      sleep_debt: sleepDebt,
      fatigue_score: fatigueScore,
      level: level
    };

    // 🚨 2. Check Alerts
    const alert = generateFatigueAlert(fatigueScore);
    const model = genAI.getGenerativeModel(geminiConfig);

    // 🤖 3. Feed the data to Gemini
    const prompt = `
      You are an elite AI sports scientist (like a WHOOP coach).
      Goal: ${JSON.stringify(fatigueData.goal || {})}
      Today's Computed Data: ${JSON.stringify(enrichedToday)}
      Recent Trend: ${JSON.stringify(fatigueData.recent_days || [])}

      Note: The user has a fatigue score of ${fatigueScore}/100 (${level} fatigue). This is driven by ${steps} steps and ${sleepDebt} hours of sleep debt.

      Return ONLY valid JSON:
      {
        "insight": "1-2 line analysis of their body battery and recovery state",
        "recommendations": ["Recovery tip 1 (e.g., rest, hydration)", "Recovery tip 2 (e.g., active recovery, sleep)"],
        "warnings": ["Warning if fatigue is critically high, or empty array"],
        "motivation": "Short motivational sentence focused on listening to their body"
      }
    `;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text().trim();
    
    if (responseText.includes('```')) {
      const match = responseText.match(/```[\w]*\n?([\s\S]*?)\n?```/);
      if (match) {
        responseText = match[1].trim();
      }
    }
    
    const aiResponse = JSON.parse(responseText);

    // Send back the calculated score so the frontend can render the charts!
    res.json({ 
      computedStats: enrichedToday, 
      alert, 
      aiData: aiResponse 
    });

  } catch (err) {
    console.error("Fatigue analysis error:", err);
    res.status(500).json({ error: "Failed to generate fatigue insights." });
  }
};

// ==========================================
// ❤️‍🔥 PLANET 6: HEART RATE & INTENSITY ZONES
// ==========================================
export const analyzeIntensity = async (req, res) => {
  try {
    const { intensityData } = req.body;

    if (!intensityData || !intensityData.latest_workout) {
      return res.status(400).json({ error: "Missing intensity data payload." });
    }

    // 🧮 1. Dynamic HR Math (Fallback if Max HR isn't provided)
    let maxHr = intensityData.user_profile?.max_hr;
    if (!maxHr && intensityData.user_profile?.age) {
      maxHr = 220 - intensityData.user_profile.age;
    }

    const enrichedWorkout = {
      ...intensityData.latest_workout,
      calculated_max_hr: maxHr || "Unknown (Age missing)"
    };

    // 🚨 2. Check Alerts (Are they overtraining in Zone 5?)
    const alert = generateIntensityAlert(enrichedWorkout);
    const model = genAI.getGenerativeModel(geminiConfig);

    // 🤖 3. Feed the data to Gemini
    const prompt = `
      You are an elite endurance and conditioning coach.
      User Profile: ${JSON.stringify(intensityData.user_profile || {})}
      Calculated Max HR: ${maxHr} bpm
      Latest Workout Zones (minutes): ${JSON.stringify(enrichedWorkout.zones)}
      Average HR: ${enrichedWorkout.avg_hr} bpm over ${enrichedWorkout.duration} minutes.
      Weekly Zone Distribution (%): ${JSON.stringify(intensityData.weekly_summary?.zone_distribution || {})}

      Return ONLY valid JSON:
      {
        "insight": "1-2 line analysis of their workout intensity and zone distribution",
        "recommendations": ["Training tip 1 (e.g., add more Zone 2, polarized training)", "Training tip 2"],
        "warnings": ["Warning if spending too much time in Zone 4/5 without recovery, or empty array"],
        "motivation": "Short motivational sentence focused on heart health or endurance"
      }
    `;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text().trim();
    
    if (responseText.includes('```')) {
      const match = responseText.match(/```[\w]*\n?([\s\S]*?)\n?```/);
      if (match) {
        responseText = match[1].trim();
      }
    }
    
    const aiResponse = JSON.parse(responseText);

    res.json({ 
      computedStats: enrichedWorkout, 
      alert, 
      aiData: aiResponse 
    });

  } catch (err) {
    console.error("Intensity analysis error:", err);
    res.status(500).json({ error: "Failed to generate intensity insights." });
  }
};

// ==========================================
// ❤️ PLANET 7: BLOOD PRESSURE & CARDIO
// ==========================================
export const analyzeBloodPressure = async (req, res) => {
  try {
    const { bpData } = req.body;

    if (!bpData || !bpData.today) {
      return res.status(400).json({ error: "Missing blood pressure data payload." });
    }

    const sys = bpData.today.systolic;
    const dia = bpData.today.diastolic;

    // 🧮 1. Dynamic Category Math (Standard AHA Guidelines)
    let category = "Normal";
    if (sys >= 140 || dia >= 90) {
      category = "Hypertension Stage 2";
    } else if (sys >= 130 || dia >= 80) {
      category = "Hypertension Stage 1";
    } else if (sys >= 120 && dia < 80) {
      category = "Elevated";
    }

    // Build the enriched object to send back to UI and AI
    const enrichedToday = {
      ...bpData.today,
      category: category
    };

    // 🚨 2. Check Alerts
    const alert = generateBloodPressureAlert(sys, dia);
    const model = genAI.getGenerativeModel(geminiConfig);

    // 🤖 3. Feed the data to Gemini
    const prompt = `
      You are an AI cardiovascular health assistant.
      User Profile: ${JSON.stringify(bpData.user_profile || {})}
      Today's BP: ${sys}/${dia} mmHg (Category: ${category})
      Context: ${JSON.stringify(bpData.context || {})}
      Recent Trend: ${JSON.stringify(bpData.recent_days || [])}

      Return ONLY valid JSON:
      {
        "insight": "1-2 line analysis of their blood pressure trend and category",
        "recommendations": ["Lifestyle tip 1 (e.g., sodium, stress, sleep)", "Lifestyle tip 2"],
        "warnings": ["Warning if BP is in Hypertension stages, or empty array"],
        "motivation": "Short, calming motivational sentence focused on heart health"
      }
    `;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text().trim();
    
    if (responseText.includes('```')) {
      const match = responseText.match(/```[\w]*\n?([\s\S]*?)\n?```/);
      if (match) {
        responseText = match[1].trim();
      }
    }
    
    const aiResponse = JSON.parse(responseText);

    res.json({ 
      computedStats: enrichedToday, 
      alert, 
      aiData: aiResponse 
    });

  } catch (err) {
    console.error("Blood pressure analysis error:", err);
    res.status(500).json({ error: "Failed to generate blood pressure insights." });
  }
};

// ==========================================
// 🫁 PLANET 8: SpO2 & BLOOD OXYGEN
// ==========================================
export const analyzeSpo2 = async (req, res) => {
  try {
    const { spo2Data } = req.body;

    if (!spo2Data || !spo2Data.today) {
      return res.status(400).json({ error: "Missing SpO2 data payload." });
    }

    const avg = spo2Data.today.avg_spo2;
    const min = spo2Data.today.min_spo2;
    const drops = spo2Data.today.drops_count || 0;

    // 🧮 1. Dynamic Stability Math
    // Estimate variance if not provided
    const variance = spo2Data.today.variance || parseFloat((avg - min).toFixed(1));
    
    // Stability Score Logic (Base 100, penalized by variance and drops)
    let stabilityScore = Math.round(100 - (variance * 3) - (drops * 2));
    if (min < 92) stabilityScore -= 10; // Low oxygen penalty
    stabilityScore = Math.max(0, Math.min(100, stabilityScore)); // Clamp between 0-100

    // Determine Status Level
    let status = "low";
    if (stabilityScore >= 85) status = "optimal";
    else if (stabilityScore >= 70) status = "moderate";

    // Build the enriched object to send back to UI and AI
    const enrichedToday = {
      ...spo2Data.today,
      variance: variance,
      stability_score: stabilityScore,
      status: status
    };

    // 🚨 2. Check Alerts
    const alert = generateSpo2Alert(min, drops);
    const model = genAI.getGenerativeModel(geminiConfig);

    // 🤖 3. Feed the data to Gemini
    const prompt = `
      You are an AI respiratory and sleep recovery specialist.
      Today's Computed Data: ${JSON.stringify(enrichedToday)}
      Sleep Context: ${JSON.stringify(spo2Data.sleep_context || {})}
      Recent Trend: ${JSON.stringify(spo2Data.recent_days || [])}

      Note: The user has a SpO2 stability score of ${stabilityScore}/100 (${status} stability).
      
      Return ONLY valid JSON:
      {
        "insight": "1-2 line analysis of their overnight blood oxygen stability and recovery",
        "recommendations": ["Breathing/Sleep tip 1 (e.g., sleeping position, room ventilation)", "Recovery tip 2"],
        "warnings": ["Warning if SpO2 dips below 94% frequently, or empty array"],
        "motivation": "Short, calming motivational sentence about respiratory health"
      }
    `;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text().trim();
    
    if (responseText.includes('```')) {
      const match = responseText.match(/```[\w]*\n?([\s\S]*?)\n?```/);
      if (match) {
        responseText = match[1].trim();
      }
    }
    
    const aiResponse = JSON.parse(responseText);

    res.json({ 
      computedStats: enrichedToday, 
      alert, 
      aiData: aiResponse 
    });

  } catch (err) {
    console.error("SpO2 analysis error:", err);
    res.status(500).json({ error: "Failed to generate SpO2 insights." });
  }
};

// ==========================================
// 🌡️ PLANET 9: BODY TEMPERATURE
// ==========================================
export const analyzeTemperature = async (req, res) => {
  try {
    const { tempData } = req.body;

    if (!tempData || !tempData.today || !tempData.baseline_temp) {
      return res.status(400).json({ error: "Missing temperature data or baseline payload." });
    }

    const avgTemp = tempData.today.avg_temp;
    const baseline = tempData.baseline_temp;

    // 🧮 1. Dynamic Deviation Math
    const deviation = parseFloat((avgTemp - baseline).toFixed(2));

    // Determine Status Level
    let status = "normal";
    if (deviation >= 0.7) status = "high (possible fever)";
    else if (deviation >= 0.3) status = "elevated";

    // Build the enriched object to send back to UI and AI
    const enrichedToday = {
      ...tempData.today,
      deviation: deviation,
      status: status
    };

    // 🚨 2. Check Alerts
    const alert = generateTemperatureAlert(deviation);
    const model = genAI.getGenerativeModel(geminiConfig);

    // 🤖 3. Feed the data to Gemini
    const prompt = `
      You are an AI health, recovery, and illness-prevention analyst.
      Baseline Temp: ${baseline}°C
      Today's Temp: ${avgTemp}°C
      Deviation: ${deviation > 0 ? '+' : ''}${deviation}°C (Status: ${status})
      Recent Trend: ${JSON.stringify(tempData.recent_days || [])}
      Context (Sleep/Fatigue): ${JSON.stringify(tempData.context || {})}

      Return ONLY valid JSON:
      {
        "insight": "1-2 line analysis connecting their temperature deviation to potential fatigue or illness",
        "recommendations": ["Health tip 1 (e.g., hydration, rest, monitoring)", "Health tip 2"],
        "warnings": ["Warning if fever risk is high, or empty array"],
        "motivation": "Short, caring motivational sentence about listening to their body"
      }
    `;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text().trim();
    
    if (responseText.includes('```')) {
      const match = responseText.match(/```[\w]*\n?([\s\S]*?)\n?```/);
      if (match) {
        responseText = match[1].trim();
      }
    }
    
    const aiResponse = JSON.parse(responseText);

    res.json({ 
      computedStats: enrichedToday, 
      alert, 
      aiData: aiResponse 
    });

  } catch (err) {
    console.error("Temperature analysis error:", err);
    res.status(500).json({ error: "Failed to generate temperature insights." });
  }
};