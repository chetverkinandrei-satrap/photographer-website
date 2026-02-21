const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'photographer.db');

let db;

async function initDb() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run('PRAGMA foreign_keys = ON');

  db.run(`
    CREATE TABLE IF NOT EXISTS series (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      photo_urls TEXT DEFAULT '[]',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      series_id INTEGER,
      text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      approved INTEGER DEFAULT 0,
      FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_name TEXT NOT NULL,
      client_phone TEXT DEFAULT '',
      series_type TEXT DEFAULT '',
      date TEXT NOT NULL,
      status TEXT DEFAULT 'new',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed demo data if empty
  const count = db.exec('SELECT COUNT(*) as c FROM series');
  const rowCount = count[0]?.values[0]?.[0] || 0;

  if (rowCount === 0) {
    db.run(
      'INSERT INTO series (title, description, photo_urls) VALUES (?, ?, ?)',
      ['Свадебная съёмка', 'Нежные моменты вашего особенного дня. Естественный свет, живые эмоции, тёплая атмосфера.', '[]']
    );
    db.run(
      'INSERT INTO series (title, description, photo_urls) VALUES (?, ?, ?)',
      ['Семейная фотосессия', 'Семейные портреты, наполненные теплом и радостью. На природе или в студии.', '[]']
    );
    db.run(
      'INSERT INTO series (title, description, photo_urls) VALUES (?, ?, ?)',
      ['Портретная съёмка', 'Индивидуальные портреты, раскрывающие вашу уникальность. Стильно, атмосферно, с характером.', '[]']
    );

    db.run('INSERT INTO reviews (series_id, text, approved) VALUES (?, ?, 1)', [1, 'Невероятные фотографии! Каждый кадр — как маленькая история. Спасибо за такие эмоции!']);
    db.run('INSERT INTO reviews (series_id, text, approved) VALUES (?, ?, 1)', [2, 'Фотограф нашёл подход к детям, все были расслаблены. Результат превзошёл ожидания!']);
    db.run('INSERT INTO reviews (series_id, text, approved) VALUES (?, ?, 1)', [3, 'Очень стильные портреты, друзья в восторге. Обязательно приду ещё!']);
  }

  saveDb();
  return db;
}

function saveDb() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

function getDb() {
  return db;
}

// Helper to run queries and return results as array of objects
function all(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

function get(sql, params = []) {
  const rows = all(sql, params);
  return rows[0] || null;
}

function run(sql, params = []) {
  db.run(sql, params);
  saveDb();
  return { lastInsertRowid: db.exec('SELECT last_insert_rowid()')[0]?.values[0]?.[0] };
}

module.exports = { initDb, getDb, all, get, run, saveDb };
