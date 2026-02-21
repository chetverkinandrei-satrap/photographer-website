require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDb } = require('./db');
const { startBot } = require('./bot');

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err.message);
});

async function start() {
  await initDb();

  const app = express();
  const PORT = process.env.PORT || 3001;

  app.use(cors());
  app.use(express.json());
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // Routes
  app.use('/api/series', require('./routes/series'));
  app.use('/api/reviews', require('./routes/reviews'));
  app.use('/api/bookings', require('./routes/bookings'));
  app.use('/api/photos', require('./routes/photos'));

  // Auth endpoint
  app.post('/api/auth/login', (req, res) => {
    const { password } = req.body;
    if (password === (process.env.ADMIN_PASSWORD || 'admin123')) {
      return res.json({ token: password });
    }
    res.status(401).json({ error: 'Wrong password' });
  });

  // Production: serve client build
  if (process.env.NODE_ENV === 'production') {
    const clientDist = path.resolve(__dirname, '..', 'client', 'dist');
    app.use(express.static(clientDist));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(clientDist, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    startBot();
  });
}

start().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
