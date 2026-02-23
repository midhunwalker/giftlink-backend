const express = require('express');
const jwt = require('jsonwebtoken');
const { getDb } = require('../models/db');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const db = getDb();
    const users = db.collection('users');

    const existingUser = await users.findOne({ email: req.body.email });

    if (existingUser) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const result = await users.insertOne(req.body);

    return res.status(201).json({ id: result.insertedId });
  } catch (error) {
    return res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const db = getDb();
    const users = db.collection('users');

    const user = await users.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.password !== req.body.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id.toString() },
      process.env.JWT_SECRET
    );

    return res.status(200).json({
      authToken: token,
      userName: user.firstName,
      userEmail: user.email
    });

  } catch (error) {
    return res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
