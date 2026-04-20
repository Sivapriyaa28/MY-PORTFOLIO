const Visitor = require('../models/Visitor');

module.exports = async (req, res, next) => {
  try {
    // Only track frontend page visits, not API calls
    if (!req.originalUrl.startsWith('/api')) {
      const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'] || '';
      await Visitor.create({ ip, userAgent, page: req.originalUrl });
    }
  } catch (e) { /* silent fail */ }
  next();
};