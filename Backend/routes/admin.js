const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Video = require('../models/Video');
const Visitor = require('../models/Visitor');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes require authentication + admin role
router.use(protect, adminOnly);

// GET /api/admin/users - Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
    res.json({ users, count: users.length });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users.', error: error.message });
  }
});

// GET /api/admin/stats - Dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalVideos = await Video.countDocuments();
    const totalViews = await Video.aggregate([
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]);
    const totalLikes = await Video.aggregate([
      { $group: { _id: null, total: { $sum: '$likes' } } }
    ]);
    const totalVisitors = await Visitor.countDocuments();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayVisitors = await Visitor.countDocuments({ visitedAt: { $gte: todayStart } });

    res.json({
      totalUsers,
      totalVideos,
      totalViews: totalViews[0]?.total || 0,
      totalLikes: totalLikes[0]?.total || 0,
      totalVisitors,
      todayVisitors
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats.', error: error.message });
  }
});

// GET /api/admin/visitors - Recent visitor log
router.get('/visitors', async (req, res) => {
  try {
    const total = await Visitor.countDocuments();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const today = await Visitor.countDocuments({ visitedAt: { $gte: todayStart } });
    const recent = await Visitor.find().sort({ visitedAt: -1 }).limit(50);
    res.json({ total, today, recent });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch visitors.', error: error.message });
  }
});

// POST /api/admin/videos - Create new video
router.post('/videos', async (req, res) => {
  try {
    const { title, description, videoUrl, thumbnailUrl, tags } = req.body;
    if (!title || !description || !videoUrl) {
      return res.status(400).json({ message: 'Title, description, and video URL are required.' });
    }
    const video = await Video.create({
      title,
      description,
      videoUrl,
      thumbnailUrl: thumbnailUrl || '',
      tags: tags || []
    });
    res.status(201).json({ message: 'Video added successfully! 🎬', video });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create video.', error: error.message });
  }
});

// PUT /api/admin/videos/:id - Update video
router.put('/videos/:id', async (req, res) => {
  try {
    const { title, description, videoUrl, thumbnailUrl, tags } = req.body;
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { title, description, videoUrl, thumbnailUrl, tags },
      { new: true, runValidators: true }
    );
    if (!video) return res.status(404).json({ message: 'Video not found.' });
    res.json({ message: 'Video updated successfully! ✨', video });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update video.', error: error.message });
  }
});

// DELETE /api/admin/videos/:id - Delete video
router.delete('/videos/:id', async (req, res) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found.' });
    res.json({ message: 'Video deleted successfully.', videoId: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete video.', error: error.message });
  }
});

module.exports = router;