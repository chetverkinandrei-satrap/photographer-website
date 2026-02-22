const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../db');
const auth = require('../middleware/auth');
const { cloudinary, isConfigured } = require('../cloudinary');

// Multer stores to memory buffer when using Cloudinary, disk otherwise
const storage = isConfigured()
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: path.join(__dirname, '..', 'uploads'),
      filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, unique + ext);
      },
    });

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only images allowed'));
  },
});

// Upload to Cloudinary from buffer
function uploadToCloudinary(fileBuffer, seriesId) {
  return new Promise((resolve, reject) => {
    const folder = seriesId ? `photographer/series_${seriesId}` : 'photographer/unsorted';
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
}

// POST /api/photos — upload photo to a series (admin)
router.post('/', auth, upload.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const seriesId = req.body.series_id;
  let photoUrl;

  if (isConfigured()) {
    // Upload to Cloudinary
    try {
      const result = await uploadToCloudinary(req.file.buffer, seriesId);
      photoUrl = result.secure_url;
    } catch (err) {
      console.error('Cloudinary upload error:', err.message);
      return res.status(500).json({ error: 'Failed to upload to cloud storage' });
    }
  } else {
    // Fallback: local storage
    photoUrl = `/uploads/${req.file.filename}`;
  }

  if (seriesId) {
    const row = db.get('SELECT photo_urls FROM series WHERE id = ?', [Number(seriesId)]);
    if (row) {
      const urls = JSON.parse(row.photo_urls || '[]');
      urls.push(photoUrl);
      db.run('UPDATE series SET photo_urls = ? WHERE id = ?', [JSON.stringify(urls), Number(seriesId)]);
    }
  }

  res.json({ url: photoUrl, cloud: isConfigured() });
});

// DELETE /api/photos — remove photo from series (admin)
router.delete('/', auth, (req, res) => {
  const { series_id, photo_url } = req.body;
  if (!series_id || !photo_url) {
    return res.status(400).json({ error: 'series_id and photo_url are required' });
  }

  const row = db.get('SELECT photo_urls FROM series WHERE id = ?', [Number(series_id)]);
  if (!row) return res.status(404).json({ error: 'Series not found' });

  const urls = JSON.parse(row.photo_urls || '[]');
  const filtered = urls.filter((u) => u !== photo_url);
  db.run('UPDATE series SET photo_urls = ? WHERE id = ?', [JSON.stringify(filtered), Number(series_id)]);

  // If Cloudinary URL, delete from cloud too
  if (isConfigured() && photo_url.includes('cloudinary.com')) {
    const parts = photo_url.split('/upload/');
    if (parts[1]) {
      // Extract public_id from URL (remove version and extension)
      const afterUpload = parts[1].replace(/^v\d+\//, '');
      const publicId = afterUpload.replace(/\.[^.]+$/, '');
      cloudinary.uploader.destroy(publicId).catch((err) => {
        console.error('Cloudinary delete error:', err.message);
      });
    }
  }

  res.json({ success: true });
});

module.exports = router;
