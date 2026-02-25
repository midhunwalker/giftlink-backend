const express = require('express');
const { ObjectId } = require('mongodb');
const { getDb } = require('../models/db');

const router = express.Router();

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.get('/', asyncHandler(async (req, res) => {
  const db = getDb();
  const gifts = await db.collection('gifts').find().toArray();
  res.json(gifts);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const db = getDb();
  
  // Validate ObjectId format
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid gift ID format' });
  }

  const gift = await db.collection('gifts').findOne({
    _id: new ObjectId(req.params.id)
  });

  if (!gift) {
    return res.status(404).json({ error: 'Gift not found' });
  }

  res.json(gift);
}));

module.exports = router;
