import express from 'express';
// Make sure to add analyzeTemperature to your import!
import { analyzeSteps, analyzeNutrition, analyzeSleep, analyzeActivity, analyzeFatigue, analyzeIntensity, analyzeBloodPressure, analyzeSpo2, analyzeTemperature } from '../controllers/fitnessController.js';

const router = express.Router();

// 9 distinct fitness ecosystem endpoints
router.post('/steps/dashboard', analyzeSteps);
router.post('/nutrition/dashboard', analyzeNutrition);
router.post('/sleep/dashboard', analyzeSleep);
router.post('/activity/dashboard', analyzeActivity);
router.post('/fatigue/dashboard', analyzeFatigue);
router.post('/intensity/dashboard', analyzeIntensity);
router.post('/blood-pressure/dashboard', analyzeBloodPressure);
router.post('/spo2/dashboard', analyzeSpo2);
router.post('/temperature/dashboard', analyzeTemperature); // 🌡️ NEW: Temperature endpoint

export default router;