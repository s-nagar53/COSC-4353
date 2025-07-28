const express = require('express');
const router = express.Router();
const { db } = require('../firebase');
const { statesHelper } = require('../data/statesData');

const statesCollection = db.collection('states');

// Get all states
router.get('/all', async (req, res) => {
  try {
    const snapshot = await statesCollection.orderBy('name').get();
    const states = [];
    snapshot.forEach(doc => {
      states.push({ id: doc.id, ...doc.data() });
    });
    res.json({ states });
  } catch (error) {
    // Fallback to memory data
    res.json({ states: statesHelper.getAll() });
  }
});

// Get states by region
router.get('/region/:region', async (req, res) => {
  try {
    const region = req.params.region;
    const snapshot = await statesCollection
      .where('region', '==', region)
      .orderBy('name')
      .get();
    const states = [];
    snapshot.forEach(doc => {
      states.push({ id: doc.id, ...doc.data() });
    });
    res.json({ states });
  } catch (error) {
    res.json({ states: statesHelper.getByRegion(region) });
  }
});

// Get state by code
router.get('/:code', async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const doc = await statesCollection.doc(code).get();
    if (doc.exists) {
      res.json({ id: doc.id, ...doc.data() });
    } else {
      res.status(404).json({ message: 'State not found' });
    }
  } catch (error) {
    const state = statesHelper.getByCode(req.params.code);
    if (state) {
      res.json(state);
    } else {
      res.status(404).json({ message: 'State not found' });
    }
  }
});

module.exports = router;