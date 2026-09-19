const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Frontend sends the Google ID token it received from the Sign-In button.
// We verify it directly with Google (no client secret needed for this flow).
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'credential shart' });

    const ticket = await client.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();

    let user = await User.findOne({ googleId: payload.sub });
    if (!user) {
      user = await User.create({ googleId: payload.sub, email: payload.email, name: payload.name, picture: payload.picture });
    } else {
      user.name = payload.name;
      user.picture = payload.picture;
      user.email = payload.email;
      await user.save();
    }

    const token = jwt.sign({ userId: user._id, googleId: user.googleId, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user._id, googleId: user.googleId, name: user.name, email: user.email, picture: user.picture, isAdmin: user.isAdmin } });
  } catch (e) {
    res.status(401).json({ error: "Google orqali tekshirish muvaffaqiyatsiz bo'ldi" });
  }
});

module.exports = router;
