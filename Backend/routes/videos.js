const express = require('express');
const router = express.Router();
const Video = require('../models/Video');
const { protect } = require('../middleware/auth');

// GET /api/videos - Get all videos (public)
router.get('/', async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.json({ videos, count: videos.length });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch videos.', error: error.message });
  }
});

// GET /api/videos/:id - Get single video
router.get('/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found.' });
    }
    // Increment views
    video.views += 1;
    await video.save();
    res.json({ video });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch video.', error: error.message });
  }
});

// POST /api/videos/:id/like - Like a video (requires login)
router.post('/:id/like', protect, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found.' });
    }
    video.likes += 1;
    await video.save();
    res.json({ message: 'Liked! 💖', likes: video.likes });
  } catch (error) {
    res.status(500).json({ message: 'Failed to like video.', error: error.message });
  }
});

module.exports = router;