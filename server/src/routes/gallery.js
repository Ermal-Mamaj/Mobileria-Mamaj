import { Router } from 'express';
import db from '../db/index.js';
import { requireAdmin } from '../auth.js';

const router = Router();

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM gallery_images ORDER BY sort_order ASC, id ASC').all());
});

router.post('/', requireAdmin, (req, res) => {
  const { image_url = null, caption = '', sort_order } = req.body || {};
  const order = sort_order ?? (db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM gallery_images').get().m + 1);
  const info = db.prepare('INSERT INTO gallery_images (image_url, caption, sort_order) VALUES (?, ?, ?)').run(image_url, caption, order);
  res.status(201).json(db.prepare('SELECT * FROM gallery_images WHERE id = ?').get(info.lastInsertRowid));
});

router.put('/:id', requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT * FROM gallery_images WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const next = { ...existing, ...req.body };
  db.prepare('UPDATE gallery_images SET image_url = ?, caption = ?, sort_order = ? WHERE id = ?')
    .run(next.image_url, next.caption, next.sort_order, req.params.id);
  res.json(db.prepare('SELECT * FROM gallery_images WHERE id = ?').get(req.params.id));
});

router.delete('/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM gallery_images WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

export default router;
