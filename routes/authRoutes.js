const express = require('express');
const jwt = require('jsonwebtoken');
const { getDb } = require('../models/db');

const router = express.Router();

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.post('/register', asyncHandler(async (req, res) => {
  const { email, password, firstName } = req.body;
  
  // Input validation
  if (!email || !password || !firstName) {
    return res.status(400).json({ error: 'Email, password, and firstName are required' });
  }
  
  const db = getDb();
  const users = db.collection('users');

  const existingUser = await users.findOne({ email });

  if (existingUser) {
    return res.status(409).json({ error: 'Email already in use' });
  }

  const result = await users.insertOne(req.body);

  return res.status(201).json({ id: result.insertedId });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  // Input validation
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  const db = getDb();
  const users = db.collection('users');

  const user = await users.findOne({ email });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  const token = jwt.sign(
    { id: user._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  return res.status(200).json({
    authToken: token,
    userName: user.firstName,
    userEmail: user.email
  });
}));

module.exports = router;
