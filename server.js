import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fitnessRoutes from './routes/fitnessRoutes.js';

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/fitness', fitnessRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Fitness Backend running on port ${PORT}`);
});