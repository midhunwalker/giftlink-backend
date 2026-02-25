const express = require('express');
const { getDb } = require('../models/db');

const router = express.Router();

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.get('/', asyncHandler(async (req, res) => {
  const db = getDb();

  const filter = {};

  if (req.query.category) {
    filter.category = req.query.category;
  }

  const results = await db.collection('gifts')
    .find(filter)
    .toArray();

  res.json(results);
}));

module.exports = router;
