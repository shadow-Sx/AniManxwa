const mongoose = require('mongoose');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB ulandi');
  } catch (err) {
    console.error('MongoDB ulanish xatosi:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
