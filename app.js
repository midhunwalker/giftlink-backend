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
 * Start Server - Production-Ready Startup Sequence
 * 1. Connect to MongoDB FIRST
 * 2. Only start server AFTER successful DB connection
 * 3. If DB fails, crash immediately (no broken state)
 */
const PORT = process.env.PORT || 8080;

async function startServer() {
  try {
    // Step 1: Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await connectToDatabase(process.env.MONGO_URI, process.env.DB_NAME);
    console.log('✓ MongoDB connected successfully');
    
    // Step 2: Start server only after DB is ready
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`✓ Server listening on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('✓ Application ready to accept requests');
    });
    
    // Setup graceful shutdown handlers
    setupGracefulShutdown(server);
    
  } catch (error) {
    console.error('✗ FATAL: Failed to start application');
    console.error('✗ Error:', error.message);
    console.error('✗ Server cannot run without database connection');
    console.error('Stack:', error.stack);
    
    // Exit with error code - let the process manager restart
    process.exit(1);
  }
}

// Start the application
startServer();

/**
 * Graceful Shutdown Handler
 */
function setupGracefulShutdown(server) {
  const { closeDatabase } = require('./models/db');
  
  const shutdown = async (signal) => {
    console.log(`${signal} received, shutting down gracefully...`);
    
    // Close server first (stop accepting new requests)
    server.close(async () => {
      console.log('✓ Server closed');
      
      // Close database connection
      try {
        await closeDatabase();
        console.log('✓ Database connection closed');
        process.exit(0);
      } catch (error) {
        console.error('✗ Error closing database:', error.message);
        process.exit(1);
      }
    });
    
    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.error('✗ Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };
  
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

/**
 * Handle uncaught errors - Production-Ready
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('✗ FATAL: Unhandled Promise Rejection');
  console.error('✗ Reason:', reason);
  console.error('✗ Promise:', promise);
  
  // In production, crash on unhandled rejections
  // Process manager (like Render) will restart the app
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('✗ FATAL: Uncaught Exception');
  console.error('✗ Error:', error.message);
  console.error('✗ Stack:', error.stack);
  
  // Always exit on uncaught exceptions
  process.exit(1);
});