const mongoose = require('mongoose');

const bannedUserSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    nickname: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('BannedUser', bannedUserSchema);
