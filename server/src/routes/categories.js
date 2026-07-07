import { Router } from 'express';
import db from '../db/index.js';
import { requireAdmin } from '../auth.js';

const router = Router();

function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM categories ORDER BY sort_order ASC, id ASC').all();
  res.json(rows);
});

router.get('/:slug', (req, res) => {
  const row = db.prepare('SELECT * FROM categories WHERE slug = ?').get(req.params.slug);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

router.post('/', requireAdmin, (req, res) => {
  const { name, tagline = '', hero_image_url = null } = req.body || {};
  if (!name) return res.status(400).json({ error: 'Name required' });
  const slug = req.body.slug ? slugify(req.body.slug) : slugify(name);
  const maxOrder = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM categories').get().m;
  const info = db.prepare(`
    INSERT INTO categories (slug, name, tagline, hero_image_url, sort_order) VALUES (?, ?, ?, ?, ?)
  `).run(slug, name, tagline, hero_image_url, maxOrder + 1);
  res.status(201).json(db.prepare('SELECT * FROM categories WHERE id = ?').get(info.lastInsertRowid));
});

router.put('/:id', requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const next = { ...existing, ...req.body };
  if (req.body.slug) next.slug = slugify(req.body.slug);
  db.prepare(`
    UPDATE categories SET slug = ?, name = ?, tagline = ?, hero_image_url = ?, sort_order = ? WHERE id = ?
  `).run(next.slug, next.name, next.tagline, next.hero_image_url, next.sort_order, req.params.id);
  res.json(db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id));
});

router.delete('/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

export default router;
