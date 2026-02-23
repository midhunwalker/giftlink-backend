const express = require('express');
const { ObjectId } = require('mongodb');
const { getDb } = require('../models/db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const gifts = await db.collection('gifts').find().toArray();
    res.json(gifts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch gifts' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const db = getDb();

    const gift = await db.collection('gifts').findOne({
      _id: new ObjectId(req.params.id)
    });

    if (!gift) {
      return res.status(404).json({ error: 'Gift not found' });
    }

    res.json(gift);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch gift' });
  }
});

module.exports = router;
