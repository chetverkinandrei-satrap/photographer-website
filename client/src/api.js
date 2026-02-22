const BASE = '';

function getHeaders(auth = false) {
  const h = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = localStorage.getItem('admin_token');
    if (token) h['Authorization'] = `Bearer ${token}`;
  }
  return h;
}

export async function fetchSeries() {
  const res = await fetch(`${BASE}/api/series`);
  return res.json();
}

export async function fetchSeriesById(id) {
  const res = await fetch(`${BASE}/api/series/${id}`);
  return res.json();
}

export async function createSeries(data) {
  const res = await fetch(`${BASE}/api/series`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateSeries(id, data) {
  const res = await fetch(`${BASE}/api/series/${id}`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteSeries(id) {
  const res = await fetch(`${BASE}/api/series/${id}`, {
    method: 'DELETE',
    headers: getHeaders(true),
  });
  return res.json();
}

export async function fetchReviews(seriesId) {
  const url = seriesId ? `${BASE}/api/reviews?series_id=${seriesId}` : `${BASE}/api/reviews`;
  const res = await fetch(url);
  return res.json();
}

export async function createReview(data) {
  const res = await fetch(`${BASE}/api/reviews`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function moderateReview(id, approved) {
  const res = await fetch(`${BASE}/api/reviews/${id}`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify({ approved }),
  });
  return res.json();
}

export async function deleteReview(id) {
  const res = await fetch(`${BASE}/api/reviews/${id}`, {
    method: 'DELETE',
    headers: getHeaders(true),
  });
  return res.json();
}

export async function createBooking(data) {
  const res = await fetch(`${BASE}/api/bookings`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function fetchBookings() {
  const res = await fetch(`${BASE}/api/bookings`, { headers: getHeaders(true) });
  return res.json();
}

export async function updateBookingStatus(id, status) {
  const res = await fetch(`${BASE}/api/bookings/status`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({ id, status }),
  });
  return res.json();
}

export async function fetchBookedDates() {
  const res = await fetch(`${BASE}/api/bookings/calendar`);
  return res.json();
}

export async function uploadPhoto(file, seriesId) {
  const form = new FormData();
  form.append('photo', file);
  if (seriesId) form.append('series_id', seriesId);
  const token = localStorage.getItem('admin_token');
  const res = await fetch(`${BASE}/api/photos`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  return res.json();
}

export async function deletePhoto(seriesId, photoUrl) {
  const res = await fetch(`${BASE}/api/photos`, {
    method: 'DELETE',
    headers: getHeaders(true),
    body: JSON.stringify({ series_id: seriesId, photo_url: photoUrl }),
  });
  return res.json();
}

export async function login(password) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) throw new Error('Wrong password');
  const data = await res.json();
  localStorage.setItem('admin_token', data.token);
  return data;
}

export function logout() {
  localStorage.removeItem('admin_token');
}

export function isLoggedIn() {
  return !!localStorage.getItem('admin_token');
}
