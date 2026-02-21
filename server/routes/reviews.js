const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// GET /api/reviews?series_id=ID
router.get('/', (req, res) => {
  const { series_id } = req.query;
  let rows;
  if (series_id) {
    rows = db.all(
      'SELECT * FROM reviews WHERE series_id = ? AND approved = 1 ORDER BY created_at DESC',
      [Number(series_id)]
    );
  } else {
    rows = db.all('SELECT * FROM reviews ORDER BY created_at DESC');
  }
  res.json(rows);
});

// POST /api/reviews — create review (public)
router.post('/', (req, res) => {
  const { series_id, text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required' });

  const result = db.run(
    'INSERT INTO reviews (series_id, text, approved) VALUES (?, ?, 0)',
    [series_id ? Number(series_id) : null, text]
  );

  res.json({ id: result.lastInsertRowid, message: 'Отзыв отправлен на модерацию' });
});

// PUT /api/reviews/:id — moderate (admin)
router.put('/:id', auth, (req, res) => {
  const { approved } = req.body;
  db.run('UPDATE reviews SET approved = ? WHERE id = ?', [approved ? 1 : 0, Number(req.params.id)]);
  res.json({ success: true });
});

// DELETE /api/reviews/:id — delete (admin)
router.delete('/:id', auth, (req, res) => {
  db.run('DELETE FROM reviews WHERE id = ?', [Number(req.params.id)]);
  res.json({ success: true });
});

module.exports = router;
