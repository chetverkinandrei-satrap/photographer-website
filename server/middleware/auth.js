function auth(req, res, next) {
  const token = req.headers['authorization'];
  const password = process.env.ADMIN_PASSWORD || 'admin123';

  if (token === `Bearer ${password}`) {
    return next();
  }

  return res.status(401).json({ error: 'Unauthorized' });
}

module.exports = auth;
