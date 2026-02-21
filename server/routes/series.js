const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// GET /api/series — all series
router.get('/', (req, res) => {
  const rows = db.all('SELECT * FROM series ORDER BY created_at DESC');
  const series = rows.map((r) => ({
    ...r,
    photo_urls: JSON.parse(r.photo_urls || '[]'),
  }));
  res.json(series);
});

// GET /api/series/:id — single series + reviews
router.get('/:id', (req, res) => {
  const row = db.get('SELECT * FROM series WHERE id = ?', [Number(req.params.id)]);
  if (!row) return res.status(404).json({ error: 'Not found' });

  const reviews = db.all(
    'SELECT * FROM reviews WHERE series_id = ? AND approved = 1 ORDER BY created_at DESC',
    [Number(req.params.id)]
  );

  res.json({
    ...row,
    photo_urls: JSON.parse(row.photo_urls || '[]'),
    reviews,
  });
});

// POST /api/series — create (admin)
router.post('/', auth, (req, res) => {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const result = db.run(
    'INSERT INTO series (title, description, photo_urls) VALUES (?, ?, ?)',
    [title, description || '', '[]']
  );

  res.json({ id: result.lastInsertRowid, title, description });
});

// PUT /api/series/:id — update (admin)
router.put('/:id', auth, (req, res) => {
  const { title, description, photo_urls } = req.body;
  const existing = db.get('SELECT * FROM series WHERE id = ?', [Number(req.params.id)]);
  if (!existing) return res.status(404).json({ error: 'Not found' });

  db.run(
    'UPDATE series SET title = ?, description = ?, photo_urls = ? WHERE id = ?',
    [
      title || existing.title,
      description !== undefined ? description : existing.description,
      photo_urls ? JSON.stringify(photo_urls) : existing.photo_urls,
      Number(req.params.id),
    ]
  );

  res.json({ success: true });
});

// DELETE /api/series/:id — delete (admin)
router.delete('/:id', auth, (req, res) => {
  db.run('DELETE FROM series WHERE id = ?', [Number(req.params.id)]);
  res.json({ success: true });
});

module.exports = router;
