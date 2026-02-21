const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../db');
const auth = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only images allowed'));
  },
});

// POST /api/photos — upload photo to a series (admin)
router.post('/', auth, upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const seriesId = req.body.series_id;
  const photoUrl = `/uploads/${req.file.filename}`;

  if (seriesId) {
    const row = db.get('SELECT photo_urls FROM series WHERE id = ?', [Number(seriesId)]);
    if (row) {
      const urls = JSON.parse(row.photo_urls || '[]');
      urls.push(photoUrl);
      db.run('UPDATE series SET photo_urls = ? WHERE id = ?', [JSON.stringify(urls), Number(seriesId)]);
    }
  }

  res.json({ url: photoUrl });
});

module.exports = router;
