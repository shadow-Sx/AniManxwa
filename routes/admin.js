const express = require('express');
const jwt = require('jsonwebtoken');

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

module.exports = router;
