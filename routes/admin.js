const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const requireAdmin = require('../middleware/adminAuth');

const router = express.Router();

router.post('/verify', (req, res) => {
  const { code } = req.body;
  const valid = code === process.env.ADMIN_CODE_1 || code === process.env.ADMIN_CODE_2;
  if (!valid) return res.status(401).json({ error: "Kod noto'g'ri" });

  const token = jwt.sign({ isAdmin: true }, process.env.JWT_SECRET, { expiresIn: '4h' });
  res.cookie('adminToken', token, {
    httpOnly: true,
    sameSite: 'none',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 4 * 60 * 60 * 1000,
  });
  res.json({ token, expiresIn: '4h' });
});

// Admin: list Google-logged-in users (so subscription status can be granted
// manually until a real payment processor is connected)
router.get('/users', requireAdmin, async (req, res) => {
  try {
    res.json(await User.find().sort({ createdAt: -1 }));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.patch('/users/:id/subscription', requireAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isSubscribed: !!req.body.isSubscribed }, { new: true });
    if (!user) return res.status(404).json({ error: 'Topilmadi' });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
