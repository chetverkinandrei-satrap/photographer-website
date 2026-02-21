import { useState } from 'react';
import Calendar from './Calendar';
import { createBooking } from '../api';

export default function BookingForm() {
  const [form, setForm] = useState({ client_name: '', client_phone: '', series_type: '' });
  const [selectedDate, setSelectedDate] = useState('');
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.client_name || !selectedDate) {
      setStatus('Пожалуйста, укажите имя и выберите дату');
      return;
    }
    setSending(true);
    setStatus('');
    try {
      const res = await createBooking({ ...form, date: selectedDate });
      setStatus(res.message || 'Заявка отправлена!');
      setForm({ client_name: '', client_phone: '', series_type: '' });
      setSelectedDate('');
    } catch {
      setStatus('Ошибка при отправке. Попробуйте позже.');
    } finally {
      setSending(false);
    }
  }

  return (
    <section id="booking" className="booking">
      <div className="container">
        <h2 className="section-title">Забронировать съёмку</h2>
        <div className="booking__layout">
          <form className="booking__form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Ваше имя *"
              value={form.client_name}
              onChange={(e) => setForm({ ...form, client_name: e.target.value })}
            />
            <input
              type="tel"
              placeholder="Телефон"
              value={form.client_phone}
              onChange={(e) => setForm({ ...form, client_phone: e.target.value })}
            />
            <select
              value={form.series_type}
              onChange={(e) => setForm({ ...form, series_type: e.target.value })}
            >
              <option value="">Тип съёмки</option>
              <option value="portrait">Портретная</option>
              <option value="family">Семейная</option>
              <option value="wedding">Свадебная</option>
              <option value="other">Другое</option>
            </select>
            {selectedDate && (
              <p className="booking__date">Выбранная дата: <strong>{selectedDate}</strong></p>
            )}
            <button type="submit" className="btn btn--primary" disabled={sending}>
              {sending ? 'Отправка...' : 'Отправить заявку'}
            </button>
            {status && <p className="booking__status">{status}</p>}
          </form>
          <Calendar selected={selectedDate} onSelect={setSelectedDate} />
        </div>
      </div>
    </section>
  );
}
