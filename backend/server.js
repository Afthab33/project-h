import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from "./routes/authRoutes.js";
import questionnaireRoutes from "./routes/questionnaireRoutes.js";
import workoutRoutes from "./routes/workoutRoutes.js";
import dietRoutes from "./routes/dietRoutes.js";
import coachRoutes from './routes/coachRoutes.js';

dotenv.config();

const app = express();

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

const isDevelopment = process.env.NODE_ENV !== 'production';

let corsOptions;
if (isDevelopment) {
  corsOptions = {
    origin: true,
    credentials: true
  };
} else {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['https://www.projhealth.com', 'https://projhealth.com'];
  
  corsOptions = {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, etc)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    optionsSuccessStatus: 200,
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
app.use("/auth", authRoutes);
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