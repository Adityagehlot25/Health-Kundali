// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
// INCREASE THE LIMITS FOR THE KUNDLI PAYLOAD
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 1. Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// 2. Define the Database Schema
const healthSchema = new mongoose.Schema({
  userId: { type: String, required: true, default: "hackathon_user_1" },
  steps: Number,
  sleepHours: Number,
  heartRate: Number,
  currentPlan: String,
  lastUpdated: { type: Date, default: Date.now }
});
const HealthData = mongoose.model('HealthData', healthSchema);

// 3. Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 4. The Main API Endpoint
// 4. The Main API Endpoint (The "Health Kundli" Brain)
app.post('/api/generate-plan', async (req, res) => {
  try {
    // We catch the massive payload from the frontend
    const { manualInputs, hardwareData } = req.body;

    // A. Ask the AI for a plan using the ENTIRE context
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `
      You are an elite, highly empathetic AI Health Coach. 
      You are receiving the user's "Biological Kundli" (a complete snapshot of their daily health data, including native phone sensors and their manual journal logs).

      Here is the raw JSON data for today:
      Hardware Sensors: ${JSON.stringify(hardwareData)}
      Manual Journal: ${JSON.stringify(manualInputs)}

      Analyze this data deeply. Look at their steps, their macro-nutrients, their gym splits, and any injuries.
      
      Generate a personalized, highly actionable health plan for TOMORROW. 
      Format your response beautifully using Markdown (use ## headings, **bold text**, bullet points, and emojis).
      
      Structure your response exactly like this:
      ## 🧬 Daily Kundli Analysis
      (1 brief paragraph analyzing what they did well today and what was missing based on the exact data provided)
      
      ## 🎯 Tomorrow's Action Plan
      * **Morning:** (Specific action)
      * **Afternoon:** (Specific action)
      * **Evening:** (Specific action)
      
      Keep the tone encouraging, scientific, and direct. Do not invent data that isn't in the JSON.
    `;

    const result = await model.generateContent(prompt);
    const aiPlan = result.response.text();

    // B. Save to MongoDB (We'll update this schema later, just saving the plan for now)
    const newRecord = new HealthData({
      currentPlan: aiPlan
    });
    await newRecord.save();

    // C. Send the plan back to the Expo app
    res.json({ success: true, plan: aiPlan });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to generate plan" });
  }
});

// 🧠 PIPELINE 2: UNIVERSAL SMART LOGGER
app.post('/api/parse-log', async (req, res) => {
  try {
    const { logText } = req.body;

    // 1. Initialize the model WITH strict JSON mode enabled
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" } // Force valid JSON output
    });

    // Inside your /api/parse-log route...
    const prompt = `
  You are an expert health data extractor. The user is logging a SINGLE event during their day.
  
  Tasks:
  1. Analyze the text and approximate nutrition (calories, protein, carbs, fiber) based on portion sizes.
  2. If a category is NOT mentioned, return 0 or empty values.

  Expected Strict JSON Format:
  {
    "nutrition": { 
      "waterLiters": 0, 
      "calories": 0, 
      "proteinGrams": 0,
      "carbsGrams": 0,
      "fiberGrams": 0,
      "foodItems": [] 
    },
    "gym": { 
      "completedWorkout": false, 
      "split": "None", 
      "workoutLogs": [] 
    },
    "cycle": { "isMenstruating": false, "symptoms": "None" },
    "injuries": { "active": false, "location": "None", "notes": "None" }
  }

  User Log: "${logText}"
`;

    // 3. Call Gemini
    const result = await model.generateContent(prompt);
    const rawText = result.response.text();

    // Because we used responseMimeType, we can safely parse immediately
    const parsedData = JSON.parse(rawText);

    res.json({ success: true, data: parsedData });

  } catch (error) {
    console.error("Smart Parse Error:", error);
    res.status(500).json({ success: false, error: "Failed to parse log." });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));