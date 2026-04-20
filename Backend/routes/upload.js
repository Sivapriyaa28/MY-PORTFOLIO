require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes   = require('./routes/auth');
const videoRoutes  = require('./routes/videos');
const adminRoutes  = require('./routes/admin');
const uploadRoutes = require('./routes/upload');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth',   authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/admin',  adminRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: '🌸 Anime Love Story API is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});