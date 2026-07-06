// MAMAJ site server — serves the static pages and handles contact form
// submissions into a SQLite inbox readable at /admin.
//
//   npm start          → http://localhost:3000
//   PORT=8080 npm start to change the port.

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const { DatabaseSync } = require('node:sqlite');

const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(__dirname, 'data');
const PORT = process.env.PORT || 3000;

fs.mkdirSync(DATA_DIR, { recursive: true });

// ── Database ──────────────────────────────────────────────────────────────
const db = new DatabaseSync(path.join(DATA_DIR, 'inbox.db'));
db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    phone      TEXT NOT NULL DEFAULT '',
    message    TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    read       INTEGER NOT NULL DEFAULT 0
  )
`);

// ── Admin key ─────────────────────────────────────────────────────────────
// ADMIN_KEY env wins; otherwise a key is generated once and kept in
// server/data/admin-key.txt so restarts don't invalidate the admin link.
const KEY_FILE = path.join(DATA_DIR, 'admin-key.txt');
let adminKey = process.env.ADMIN_KEY || '';
if (!adminKey) {
  try {
    adminKey = fs.readFileSync(KEY_FILE, 'utf8').trim();
  } catch {}
  if (!adminKey) {
    adminKey = crypto.randomBytes(16).toString('hex');
    fs.writeFileSync(KEY_FILE, adminKey + '\n');
  }
}

function keyOk(candidate) {
  const a = Buffer.from(String(candidate || ''));
  const b = Buffer.from(adminKey);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function requireAdmin(req, res, next) {
  if (keyOk(req.get('x-admin-key') || req.query.key)) return next();
  res.status(401).json({ error: 'invalid admin key' });
}

// ── App ───────────────────────────────────────────────────────────────────
const app = express();
app.use(express.json({ limit: '32kb' }));

// The static root is the project folder itself — never serve the server
// internals (admin key, database) or node_modules from it.
app.use((req, res, next) => {
  const p = decodeURIComponent(req.path).toLowerCase();
  if (p.startsWith('/server/') || p === '/server' || p.startsWith('/node_modules/')) {
    return res.status(404).end();
  }
  next();
});

// Simple per-IP rate limit for the public endpoint: 5 submissions/minute.
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const windowStart = now - 60_000;
  const list = (hits.get(ip) || []).filter((t) => t > windowStart);
  if (list.length >= 5) return true;
  list.push(now);
  hits.set(ip, list);
  return false;
}

app.post('/api/contact', (req, res) => {
  if (rateLimited(req.ip)) {
    return res.status(429).json({ error: 'Po dërgoni shumë mesazhe. Prisni një minutë dhe provoni përsëri.' });
  }
  const body = req.body || {};
  const name = String(body.name || '').trim().slice(0, 120);
  const phone = String(body.phone || '').trim().slice(0, 60);
  const message = String(body.message || '').trim().slice(0, 4000);

  if (!name) return res.status(400).json({ error: 'Ju lutemi shkruani emrin tuaj.' });
  if (!phone && !message) {
    return res.status(400).json({ error: 'Ju lutemi shkruani një numër telefoni ose një mesazh.' });
  }

  db.prepare(
    'INSERT INTO messages (name, phone, message, created_at) VALUES (?, ?, ?, ?)'
  ).run(name, phone, message, new Date().toISOString());

  res.json({ ok: true });
});

// ── Site images ───────────────────────────────────────────────────────────
// The <image-slot> elements on the pages read this sidecar on load. Admin
// writes go through /api/admin/write-state below; visitors only ever GET it.
const STATE_FILE = '.image-slots.state.json';
const STATE_PATH = path.join(ROOT, STATE_FILE);

app.get('/' + STATE_FILE, (_req, res) => {
  res.type('application/json');
  // Read directly — sendFile/static both refuse dot-files by default.
  try {
    res.send(fs.readFileSync(STATE_PATH));
  } catch {
    res.send('{}');
  }
});

// Validate a slot entry: either a bare data:image/ URL (legacy shape) or
// { u?: data-URL, s/x/y?: numbers } (image + crop framing).
function validSlotValue(v) {
  const isDataImage = (u) => typeof u === 'string' && /^data:image\//i.test(u) && u.length < 3_000_000;
  if (typeof v === 'string') return isDataImage(v);
  if (!v || typeof v !== 'object' || Array.isArray(v)) return false;
  for (const k of Object.keys(v)) {
    if (k === 'u') { if (!isDataImage(v.u)) return false; }
    else if (k === 's' || k === 'x' || k === 'y') { if (!Number.isFinite(v[k])) return false; }
    else return false;
  }
  return true;
}

app.post(
  '/api/admin/write-state',
  requireAdmin,
  express.json({ limit: '30mb' }),
  (req, res) => {
    const { name, content } = req.body || {};
    if (name !== STATE_FILE) {
      return res.status(400).json({ error: 'only ' + STATE_FILE + ' can be written' });
    }
    let slots;
    try {
      slots = JSON.parse(String(content));
    } catch {
      return res.status(400).json({ error: 'content is not valid JSON' });
    }
    if (!slots || typeof slots !== 'object' || Array.isArray(slots)) {
      return res.status(400).json({ error: 'content must be a JSON object' });
    }
    for (const [id, v] of Object.entries(slots)) {
      if (id.length > 200 || !validSlotValue(v)) {
        return res.status(400).json({ error: 'invalid slot entry: ' + id.slice(0, 60) });
      }
    }
    // Write atomically so a crash mid-write can't leave a torn file.
    const tmp = STATE_PATH + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(slots));
    fs.renameSync(tmp, STATE_PATH);
    res.json({ ok: true });
  }
);

app.post('/api/admin/verify', requireAdmin, (_req, res) => res.json({ ok: true }));

// ── Admin API ─────────────────────────────────────────────────────────────
app.get('/api/admin/messages', requireAdmin, (_req, res) => {
  const rows = db.prepare('SELECT * FROM messages ORDER BY id DESC').all();
  res.json({ messages: rows });
});

app.post('/api/admin/messages/:id/read', requireAdmin, (req, res) => {
  db.prepare('UPDATE messages SET read = 1 WHERE id = ?').run(Number(req.params.id));
  res.json({ ok: true });
});

app.delete('/api/admin/messages/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM messages WHERE id = ?').run(Number(req.params.id));
  res.json({ ok: true });
});

app.get('/admin', (_req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/edit-mode.js', (_req, res) => {
  res.sendFile(path.join(__dirname, 'edit-mode.js'));
});

// Serve the pages with the edit-mode script injected, so a logged-in admin
// can drag photos straight onto the image slots. Plain visitors get the
// same HTML — the script does nothing without an admin key.
app.get(['/', /\.dc\.html$/], (req, res, next) => {
  const rel = req.path === '/' ? 'Home.dc.html' : decodeURIComponent(req.path.slice(1));
  const file = path.join(ROOT, rel);
  // path.join normalizes any ../ away from ROOT — reject anything that escapes.
  if (!file.startsWith(ROOT + path.sep) || !fs.existsSync(file)) return next();
  const html = fs.readFileSync(file, 'utf8')
    .replace('</head>', '<script src="/edit-mode.js"></script>\n</head>');
  res.type('html').send(html);
});

// Static site (support.js, image-slot.js, screenshots, …).
app.use(express.static(ROOT, { index: 'Home.dc.html' }));

app.listen(PORT, () => {
  console.log(`MAMAJ site running at http://localhost:${PORT}`);
  console.log(`Admin inbox:          http://localhost:${PORT}/admin`);
  console.log(`Admin key:            ${adminKey}`);
});
