require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

const seriesRoutes = require('./routes/series');
const chapterRoutes = require('./routes/chapters');
const adminRoutes = require('./routes/admin');
const translatorRoutes = require('./routes/translatorRequests');
const reportRoutes = require('./routes/reports');
const adRoutes = require('./routes/ads');
const authRoutes = require('./routes/auth');

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => res.json({ status: 'AniManxwa API ishlayapti' }));
app.use('/api/series', seriesRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/translator-requests', translatorRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/auth', authRoutes);

connectDB().then(() => {
  const PORT = process.env.PORT || 10000;
  app.listen(PORT, () => console.log(`Server ${PORT}-portda ishga tushdi`));
});
