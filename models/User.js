const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, required: true, unique: true },
    email: String,
    name: String,
    picture: String,
    isAdmin: { type: Boolean, default: false },
    isSubscribed: { type: Boolean, default: false },
    downloadBonusRemaining: { type: Number, default: 10 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
