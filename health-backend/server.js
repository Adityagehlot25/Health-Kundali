// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json()); // Allows us to accept JSON data from Expo

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
app.post('/api/generate-plan', async (req, res) => {
  try {
    const { steps, sleepHours, heartRate } = req.body;

    // A. Ask the AI for a plan
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `The user walked ${steps} steps today, slept ${sleepHours} hours, and has an average resting heart rate of ${heartRate} bpm. Provide a short, encouraging 3-point action plan for tomorrow to improve their health. Keep it under 3 sentences.`;
    
    const result = await model.generateContent(prompt);
    const aiPlan = result.response.text();

    // B. Save the data and the plan to MongoDB
    const newRecord = new HealthData({
      steps,
      sleepHours,
      heartRate,
      currentPlan: aiPlan
    });
    await newRecord.save();

    // C. Send the plan back to the Expo app
    res.json({ success: true, plan: aiPlan, data: newRecord });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to generate plan" });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));