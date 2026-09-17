const express = require('express');
const TranslatorRequest = require('../models/TranslatorRequest');
const requireAdmin = require('../middleware/adminAuth');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { nickname, message } = req.body;
    if (!message) return res.status(400).json({ error: 'Xabar shart' });
    const doc = await TranslatorRequest.create({ nickname, message });
    res.status(201).json(doc);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/', requireAdmin, async (req, res) => {
  try {
    const list = await TranslatorRequest.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
