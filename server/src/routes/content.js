import { Router } from 'express';
import db from '../db/index.js';
import { requireAdmin } from '../auth.js';

const router = Router();

const HOME_FIELDS = ['hero_eyebrow', 'hero_headline', 'hero_cta', 'hero_image_url', 'quote_text', 'quote_label', 'contact_heading', 'contact_intro'];
const ABOUT_FIELDS = ['hero_image_url', 'paragraph_1', 'paragraph_2', 'values_json', 'quote_text', 'quote_author'];

router.get('/home', (req, res) => {
  const row = db.prepare('SELECT * FROM home_content WHERE id = 1').get();
  res.json(row || {});
});

router.put('/home', requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT * FROM home_content WHERE id = 1').get();
  const next = { ...existing, ...req.body };
  const values = HOME_FIELDS.map((f) => next[f] ?? null);
  db.prepare(`
    INSERT INTO home_content (id, ${HOME_FIELDS.join(', ')}) VALUES (1, ${HOME_FIELDS.map(() => '?').join(', ')})
    ON CONFLICT(id) DO UPDATE SET ${HOME_FIELDS.map((f) => `${f} = excluded.${f}`).join(', ')}
  `).run(...values);
  res.json(db.prepare('SELECT * FROM home_content WHERE id = 1').get());
});

router.get('/about', (req, res) => {
  const row = db.prepare('SELECT * FROM about_content WHERE id = 1').get();
  if (row) row.values_json = JSON.parse(row.values_json || '[]');
  res.json(row || {});
});

router.put('/about', requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT * FROM about_content WHERE id = 1').get();
  const body = { ...req.body };
  if (Array.isArray(body.values_json)) body.values_json = JSON.stringify(body.values_json);
  const next = { ...existing, ...body };
  const values = ABOUT_FIELDS.map((f) => next[f] ?? null);
  db.prepare(`
    INSERT INTO about_content (id, ${ABOUT_FIELDS.join(', ')}) VALUES (1, ${ABOUT_FIELDS.map(() => '?').join(', ')})
    ON CONFLICT(id) DO UPDATE SET ${ABOUT_FIELDS.map((f) => `${f} = excluded.${f}`).join(', ')}
  `).run(...values);
  const row = db.prepare('SELECT * FROM about_content WHERE id = 1').get();
  row.values_json = JSON.parse(row.values_json || '[]');
  res.json(row);
});

export default router;
