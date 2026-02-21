const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

async function sendTelegramNotification(booking) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId || token === 'your_bot_token_here') return;

  const text = `📸 Новая заявка!\n\nИмя: ${booking.client_name}\nТелефон: ${booking.client_phone || '—'}\nТип съёмки: ${booking.series_type || '—'}\nДата: ${booking.date}`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
    if (!res.ok) {
      console.error('Telegram error:', await res.text());
    }
  } catch (err) {
    console.error('Telegram send failed:', err.message);
  }
}

// GET /api/bookings?date=YYYY-MM-DD — check availability
router.get('/', (req, res) => {
  const { date } = req.query;
  if (date) {
    const bookings = db.all(
      "SELECT * FROM bookings WHERE date = ? AND status != 'cancelled'",
      [date]
    );
    return res.json({ date, booked: bookings.length > 0, count: bookings.length });
  }
  // Admin: all bookings
  const all = db.all('SELECT * FROM bookings ORDER BY created_at DESC');
  res.json(all);
});

// GET /api/bookings/calendar — all booked dates
router.get('/calendar', (req, res) => {
  const rows = db.all("SELECT DISTINCT date FROM bookings WHERE status != 'cancelled'");
  res.json(rows.map((r) => r.date));
});

// POST /api/bookings — create booking (public)
router.post('/', async (req, res) => {
  const { client_name, client_phone, series_type, date } = req.body;
  if (!client_name || !date) {
    return res.status(400).json({ error: 'Name and date are required' });
  }

  const result = db.run(
    'INSERT INTO bookings (client_name, client_phone, series_type, date) VALUES (?, ?, ?, ?)',
    [client_name, client_phone || '', series_type || '', date]
  );

  const booking = { id: result.lastInsertRowid, client_name, client_phone, series_type, date };
  sendTelegramNotification(booking);

  res.json({ ...booking, message: 'Заявка принята! Мы свяжемся с вами.' });
});

// POST /api/bookings/status — update status (admin)
router.post('/status', auth, (req, res) => {
  const { id, status } = req.body;
  if (!id || !status) return res.status(400).json({ error: 'id and status required' });

  db.run('UPDATE bookings SET status = ? WHERE id = ?', [status, Number(id)]);
  res.json({ success: true });
});

module.exports = router;
