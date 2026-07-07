import { Router } from 'express';
import db from '../db/index.js';
import { requireAdmin } from '../auth.js';

const router = Router();

const FIELDS = ['phone', 'whatsapp', 'email', 'address', 'facebook', 'instagram', 'business_hours', 'logo_url'];

router.get('/', (req, res) => {
  const row = db.prepare('SELECT * FROM site_settings WHERE id = 1').get();
  res.json(row || {});
});

router.put('/', requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT * FROM site_settings WHERE id = 1').get();
  const next = { ...existing, ...req.body };
  const values = FIELDS.map((f) => next[f] ?? null);
  db.prepare(`
    INSERT INTO site_settings (id, ${FIELDS.join(', ')}) VALUES (1, ${FIELDS.map(() => '?').join(', ')})
    ON CONFLICT(id) DO UPDATE SET ${FIELDS.map((f) => `${f} = excluded.${f}`).join(', ')}
  `).run(...values);
  res.json(db.prepare('SELECT * FROM site_settings WHERE id = 1').get());
});

export default router;
