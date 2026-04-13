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

// 2. Define the Database Schema (The Master Kundli Schema)
const healthSchema = new mongoose.Schema({
  userId: { type: String, required: true, default: "hackathon_user_1" },
  date: { type: Date, required: true }, // Crucial for historical tracking
  hardwareData: { type: mongoose.Schema.Types.Mixed, default: {} }, // Catches all 9 planets (steps, SpO2, temp, etc.)
  manualInputs: { type: mongoose.Schema.Types.Mixed, default: {} }, // Catches Smart Journal (macros, gym splits)
  currentPlan: String, // The generated Markdown plan
  lastUpdated: { type: Date, default: Date.now }
});

// Compound index to ensure we only have ONE master record per user, per day
healthSchema.index({ userId: 1, date: 1 }, { unique: true });


const HealthData = mongoose.model('HealthData', healthSchema);

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// --- USER SCHEMA FOR AUTHENTICATION ---
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// 🔐 AUTH ROUTE: REGISTER
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: "Email already in use." });
    }

    // Hash the password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save to database
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    // Issue a JWT token
    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: '30d' });

    res.json({ 
      success: true, 
      token, 
      user: { id: newUser._id, name: newUser.name, email: newUser.email } 
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ success: false, error: "Server error during registration." });
  }
});

// 🔐 AUTH ROUTE: LOGIN
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, error: "Invalid email or password." });
    }

    // Compare the hashed passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: "Invalid email or password." });
    }

    // Issue a JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '30d' });

    res.json({ 
      success: true, 
      token, 
      user: { id: user._id, name: user.name, email: user.email } 
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, error: "Server error during login." });
  }
});

// 3. Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 4. The Main API Endpoint
// 4. The Main API Endpoint (The "Health Kundli" Brain)
// app.post('/api/generate-plan', async (req, res) => {
//   try {
//     // We catch the massive payload from the frontend
//     const { manualInputs, hardwareData } = req.body;

//     // A. Ask the AI for a plan using the ENTIRE context
//     const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

//     const prompt = `
//       You are an elite, highly empathetic AI Health Coach. 
//       You are receiving the user's "Biological Kundli" (a complete snapshot of their daily health data, including native phone sensors and their manual journal logs).

//       Here is the raw JSON data for today:
//       Hardware Sensors: ${JSON.stringify(hardwareData)}
//       Manual Journal: ${JSON.stringify(manualInputs)}

//       Analyze this data deeply. Look at their steps, their macro-nutrients, their gym splits, and any injuries.

//       Generate a personalized, highly actionable health plan for TOMORROW. 
//       Format your response beautifully using Markdown (use ## headings, **bold text**, bullet points, and emojis).

//       Structure your response exactly like this:
//       ## 🧬 Daily Kundli Analysis
//       (1 brief paragraph analyzing what they did well today and what was missing based on the exact data provided)

//       ## 🎯 Tomorrow's Action Plan
//       * **Morning:** (Specific action)
//       * **Afternoon:** (Specific action)
//       * **Evening:** (Specific action)

//       Keep the tone encouraging, scientific, and direct. Do not invent data that isn't in the JSON.
//     `;

//     const result = await model.generateContent(prompt);
//     const aiPlan = result.response.text();

//     // B. Save to MongoDB (We'll update this schema later, just saving the plan for now)
//     const newRecord = new HealthData({
//       currentPlan: aiPlan
//     });
//     await newRecord.save();

//     // C. Send the plan back to the Expo app
//     res.json({ success: true, plan: aiPlan });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, error: "Failed to generate plan" });
//   }
// });

// 4. The Main API Endpoint (The "Health Kundli" Brain)
app.post('/api/generate-plan', async (req, res) => {
  try {
    const { userId = "hackathon_user_1", manualInputs, hardwareData } = req.body;

    // --- A. DATABASE WIRING: Find or Create Today's Record ---
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to midnight

    // Save today's data instantly (upsert = create if it doesn't exist)
    await HealthData.findOneAndUpdate(
      { userId: userId, date: today },
      {
        hardwareData: hardwareData,
        manualInputs: manualInputs,
        lastUpdated: Date.now()
      },
      { upsert: true, returnDocument: 'after' }
    );

    // --- B. TIME TRAVEL: Fetch the last 7 days of history ---
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const historicalData = await HealthData.find({
      userId: userId,
      date: { $gte: sevenDaysAgo, $lt: today }
    }).sort({ date: 1 }); // Oldest to newest

    // --- C. THE GOD PROMPT: Feed History + Today to Gemini ---
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are an elite, highly empathetic AI Health Coach. 
      You are receiving the user's "Biological Kundli" (a complete holistic snapshot).

      HISTORY (Past 7 Days):
      ${JSON.stringify(historicalData.map(d => ({ date: d.date, hardware: d.hardwareData, manual: d.manualInputs })))}

      TODAY'S EXACT DATA:
      Hardware Sensors (Steps, SpO2, Temp, etc): ${JSON.stringify(hardwareData)}
      Manual Journal (Macros, Gym, Injuries): ${JSON.stringify(manualInputs)}

      Analyze this deeply. Look for trends (e.g., "You ran hard yesterday, and your SpO2 dipped last night").
      
      Generate a personalized, highly actionable health plan for TOMORROW. 
      Format your response beautifully using Markdown (use ## headings, **bold text**, bullet points, and emojis).
      
      Structure your response exactly like this:
      ## 🧬 Biological Kundli Analysis
      (1 brief, deep paragraph analyzing today's data against their historical trend. Be specific about numbers.)
      
      ## 🎯 Tomorrow's Action Plan
      * **Morning:** (Specific action)
      * **Afternoon:** (Specific action)
      * **Evening:** (Specific action)
    `;

    const result = await model.generateContent(prompt);
    const aiPlan = result.response.text();

    // --- D. SAVE THE PLAN TO MONGODB ---
    await HealthData.findOneAndUpdate(
      { userId: userId, date: today },
      { currentPlan: aiPlan }
    );

    // --- E. SEND TO FRONTEND ---
    res.json({ success: true, plan: aiPlan });

  } catch (error) {
    console.error("Kundli Generation Error:", error);
    res.status(500).json({ success: false, error: "Failed to generate master plan" });
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