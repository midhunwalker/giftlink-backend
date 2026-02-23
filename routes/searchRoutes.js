const express = require('express');
const { getDb } = require('../models/db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const db = getDb();

    const filter = {};

    if (req.query.category) {
      filter.category = req.query.category;
    }

    const results = await db.collection('gifts')
      .find(filter)
      .toArray();

    res.json(results);

  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

module.exports = router;
