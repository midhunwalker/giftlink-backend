const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectToDatabase } = require('./models/db');
const giftRoutes = require('./routes/giftRoutes');
const authRoutes = require('./routes/authRoutes');
const searchRoutes = require('./routes/searchRoutes');

const app = express();

/**
 * CORS Configuration
 * Allow only your deployed frontend
 */
app.use(cors({
  origin: "https://giftlink-frontend-eta.vercel.app",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());

/**
 * Routes
 */
app.use('/api/gifts', giftRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/search', searchRoutes);

/**
 * Health Check Route (Optional but useful)
 */
app.get('/', (req, res) => {
  res.status(200).json({ message: 'GiftLink API running' });
});

/**
 * Global Error Handler (Production Safe)
 */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

/**
 * Start Server
 */
const PORT = process.env.PORT || 8080;

connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database connection failed:', error);
    process.exit(1);
  });