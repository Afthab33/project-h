import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from "./routes/authRoutes.js";
import questionnaireRoutes from "./routes/questionnaireRoutes.js";
import workoutRoutes from "./routes/workoutRoutes.js";
import dietRoutes from "./routes/dietRoutes.js";
import coachRoutes from './routes/coachRoutes.js';

// Initialize dotenv
dotenv.config();

const app = express();

// Add validation for required environment variables
const requiredEnvVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL',
  'OPENAI_API_KEY'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

// CORS configuration that supports both development and production
const isDevelopment = process.env.NODE_ENV !== 'production';

let corsOptions;
if (isDevelopment) {
  corsOptions = {
    origin: true, // Allow all origins in development
    credentials: true
  };
} else {
  // In production, use these settings
  corsOptions = {
    origin: ['https://www.projhealth.com', 'https://projhealth.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  };
}

app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use Routes
app.use("/auth", authRoutes);  //signup,user
app.use("/onboarding", questionnaireRoutes);
app.use("/workout", workoutRoutes);
app.use("/diet", dietRoutes);
app.use('/coach', coachRoutes);

// Enhanced health check route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot find ${req.originalUrl} on this server`
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});