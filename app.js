const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectToDatabase } = require('./models/db');
const giftRoutes = require('./routes/giftRoutes');
const authRoutes = require('./routes/authRoutes');
const searchRoutes = require('./routes/searchRoutes');

const app = express();

/**
 * CORS Configuration - Production Safe
 * Handles preflight OPTIONS requests properly
 */
const allowedOrigins = [
  'https://giftlink-frontend-eta.vercel.app',
  'http://localhost:3000', // For local development
  'http://localhost:5173'  // Vite dev server
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200 // Legacy browsers support
}));

// Handle preflight requests explicitly
app.options('*', cors());

app.use(express.json());

/**
 * Health Check Route - MUST be before DB connection check
 * Render uses this to verify app is alive
 */
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/', (req, res) => {
  res.status(200).json({ message: 'GiftLink API running' });
});

/**
 * Routes
 */
app.use('/api/gifts', giftRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/search', searchRoutes);

/**
 * 404 Handler - Must be after all routes
 */
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

/**
 * Global Error Handler - Must be last
 */
app.use((err, req, res, next) => {
  console.error('ERROR:', err.message);
  console.error(err.stack);
  
  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal Server Error' 
    : err.message;
  
  res.status(err.status || 500).json({ error: message });
});

/**
 * Start Server - CRITICAL FIX
 * Bind to PORT immediately, connect to DB in background
 */
const PORT = process.env.PORT || 8080;

// Start server FIRST (Render needs this for health checks)
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Server listening on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Connect to MongoDB AFTER server is listening
  connectToDatabase(process.env.MONGO_URI, process.env.DB_NAME)
    .then(() => {
      console.log('✓ MongoDB connected successfully');
    })
    .catch((error) => {
      console.error('✗ MongoDB connection failed:', error.message);
      console.error('✗ App will continue but database operations will fail');
      // Don't exit - let app stay alive for debugging
    });
});

/**
 * Graceful Shutdown
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

/**
 * Handle uncaught errors
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit in production - log and continue
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // In production, we should exit after logging
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});