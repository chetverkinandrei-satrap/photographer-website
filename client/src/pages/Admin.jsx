import { useState, useEffect } from 'react';
import {
  login, logout, isLoggedIn,
  fetchSeries, createSeries, updateSeries, deleteSeries,
  uploadPhoto, deletePhoto,
  fetchReviews, moderateReview, deleteReview,
  fetchBookings, updateBookingStatus,
} from '../api';
import { formatDatePretty } from '../utils/formatDate';

function LoginForm({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await login(password);
      onLogin();
    } catch {
      setError('Неверный пароль');
    }
  }

  return (
    <div className="admin-login">
      <h2>Вход в админку</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="btn btn--primary">Войти</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}

function SeriesManager() {
  const [series, setSeries] = useState([]);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { loadSeries(); }, []);

  async function loadSeries() {
    const data = await fetchSeries();
    setSeries(data);
  }

  async function handleSave() {
    if (!title) return;
    if (editingId) {
      await updateSeries(editingId, { title, description: desc });
      setEditingId(null);
    } else {
      await createSeries({ title, description: desc });
    }
    setTitle('');
    setDesc('');
    loadSeries();
  }

  async function handleDelete(id) {
    if (!confirm('Удалить серию?')) return;
    await deleteSeries(id);
    loadSeries();
  }

  function startEdit(s) {
    setEditingId(s.id);
    setTitle(s.title);
    setDesc(s.description);
  }

  const [uploading, setUploading] = useState(false);

  async function handlePhotoUpload(e, seriesId) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    for (const file of files) {
      await uploadPhoto(file, seriesId);
    }
    setUploading(false);
    e.target.value = '';
    loadSeries();
  }

  async function handleDeletePhoto(seriesId, photoUrl) {
    if (!confirm('Удалить это фото?')) return;
    await deletePhoto(seriesId, photoUrl);
    loadSeries();
  }

  return (
    <div className="admin-section">
      <h3>Серии</h3>
      <div className="admin-form">
        <input placeholder="Название" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea placeholder="Описание" value={desc} onChange={(e) => setDesc(e.target.value)} />
        <button className="btn btn--primary" onClick={handleSave}>
          {editingId ? 'Сохранить' : 'Добавить серию'}
        </button>
        {editingId && (
          <button className="btn btn--outline" onClick={() => { setEditingId(null); setTitle(''); setDesc(''); }}>
            Отмена
          </button>
        )}
      </div>
      <div className="admin-list">
        {series.map((s) => (
          <div key={s.id} className="admin-card">
            <div className="admin-card__header">
              <strong>{s.title}</strong>
              <span>{(s.photo_urls || []).length} фото</span>
            </div>
            <p>{s.description}</p>
            {s.photo_urls && s.photo_urls.length > 0 && (
              <div className="admin-card__photos">
                {s.photo_urls.map((url, i) => (
                  <div key={i} className="admin-thumb-wrap">
                    <img src={url} alt="" className="admin-thumb" />
                    <button
                      className="admin-thumb__delete"
                      onClick={() => handleDeletePhoto(s.id, url)}
                      title="Удалить фото"
                    >&times;</button>
                  </div>
                ))}
              </div>
            )}
            <div className="admin-card__actions">
              <button className="btn btn--small" onClick={() => startEdit(s)}>Редактировать</button>
              <button className="btn btn--small btn--danger" onClick={() => handleDelete(s.id)}>Удалить</button>
              <label className={`btn btn--small btn--upload ${uploading ? 'uploading' : ''}`}>
                {uploading ? 'Загрузка...' : 'Загрузить фото'}
                <input type="file" accept="image/*" multiple hidden onChange={(e) => handlePhotoUpload(e, s.id)} disabled={uploading} />
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewsManager() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => { loadReviews(); }, []);

  async function loadReviews() {
    const data = await fetchReviews();
    setReviews(data);
  }

  async function handleApprove(id) {
    await moderateReview(id, true);
    loadReviews();
  }

  async function handleReject(id) {
    await moderateReview(id, false);
    loadReviews();
  }

  async function handleDelete(id) {
    await deleteReview(id);
    loadReviews();
  }

  return (
    <div className="admin-section">
      <h3>Отзывы</h3>
      <div className="admin-list">
        {reviews.length === 0 && <p>Нет отзывов</p>}
        {reviews.map((r) => (
          <div key={r.id} className={`admin-card ${r.approved ? '' : 'admin-card--pending'}`}>
            <p>{r.text}</p>
            <small>Серия ID: {r.series_id || '—'} | {r.approved ? 'Одобрен' : 'На модерации'}</small>
            <div className="admin-card__actions">
              {!r.approved && (
                <button className="btn btn--small btn--success" onClick={() => handleApprove(r.id)}>Одобрить</button>
              )}
              {r.approved && (
                <button className="btn btn--small" onClick={() => handleReject(r.id)}>Скрыть</button>
              )}
              <button className="btn btn--small btn--danger" onClick={() => handleDelete(r.id)}>Удалить</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BookingsManager() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => { loadBookings(); }, []);

  async function loadBookings() {
    const data = await fetchBookings();
    setBookings(Array.isArray(data) ? data : []);
  }

  async function handleConfirm(id) {
    await updateBookingStatus(id, 'confirmed');
    loadBookings();
  }

  async function handleCancel(id) {
    await updateBookingStatus(id, 'cancelled');
    loadBookings();
  }

  const statusLabels = { new: 'Новая', confirmed: 'Подтверждена', cancelled: 'Отменена' };

  return (
    <div className="admin-section">
      <h3>Бронирования</h3>
      <div className="admin-list">
        {bookings.length === 0 && <p>Нет заявок</p>}
        {bookings.map((b) => (
          <div key={b.id} className={`admin-card admin-card--${b.status}`}>
            <div className="admin-card__header">
              <strong>{b.client_name}</strong>
              <span className={`status-badge status-badge--${b.status}`}>
                {statusLabels[b.status] || b.status}
              </span>
            </div>
            <p>Дата: {formatDatePretty(b.date)} | Тип: {b.series_type || '—'} | Тел: {b.client_phone || '—'}</p>
            <div className="admin-card__actions">
              {b.status === 'new' && (
                <button className="btn btn--small btn--success" onClick={() => handleConfirm(b.id)}>
                  Подтвердить
                </button>
              )}
              {b.status !== 'cancelled' && (
                <button className="btn btn--small btn--danger" onClick={() => handleCancel(b.id)}>
                  Отменить
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Admin() {
  const [authed, setAuthed] = useState(isLoggedIn());
  const [tab, setTab] = useState('series');

  function handleLogout() {
    logout();
    setAuthed(false);
  }

  if (!authed) return <div className="admin container"><LoginForm onLogin={() => setAuthed(true)} /></div>;

  return (
    <div className="admin container">
      <div className="admin__header">
        <h2>Админ-панель</h2>
        <button className="btn btn--outline" onClick={handleLogout}>Выйти</button>
      </div>
      <div className="admin__tabs">
        <button className={tab === 'series' ? 'active' : ''} onClick={() => setTab('series')}>Серии</button>
        <button className={tab === 'reviews' ? 'active' : ''} onClick={() => setTab('reviews')}>Отзывы</button>
        <button className={tab === 'bookings' ? 'active' : ''} onClick={() => setTab('bookings')}>Бронирования</button>
      </div>
      {tab === 'series' && <SeriesManager />}
      {tab === 'reviews' && <ReviewsManager />}
      {tab === 'bookings' && <BookingsManager />}
    </div>
  );
}
