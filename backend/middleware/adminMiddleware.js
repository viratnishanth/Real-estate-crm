const adminMiddleware = (req, res, next) => {
  // authMiddleware should have already set req.user
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied: Admin privileges required' });
  }
};

module.exports = adminMiddleware;
