import { Router } from 'express';
import db from '../db/index.js';
import { requireAdmin } from '../auth.js';

const router = Router();

router.get('/', (req, res) => {
  const { category, featured } = req.query;
  let sql = `
    SELECT products.*, categories.slug AS category_slug, categories.name AS category_name
    FROM products JOIN categories ON categories.id = products.category_id
  `;
  const clauses = [];
  const params = [];
  if (category) {
    clauses.push('categories.slug = ?');
    params.push(category);
  }
  if (featured) {
    clauses.push('products.featured_home = 1');
  }
  if (clauses.length) sql += ' WHERE ' + clauses.join(' AND ');
  sql += ' ORDER BY products.sort_order ASC, products.id ASC';
  res.json(db.prepare(sql).all(...params));
});

router.post('/', requireAdmin, (req, res) => {
  const { category_id, name, material = '', image_url = null, badge = null, featured_home = 0, sort_order = 0 } = req.body || {};
  if (!category_id || !name) return res.status(400).json({ error: 'category_id and name required' });
  const info = db.prepare(`
    INSERT INTO products (category_id, name, material, image_url, badge, featured_home, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(category_id, name, material, image_url, badge, featured_home ? 1 : 0, sort_order);
  res.status(201).json(db.prepare('SELECT * FROM products WHERE id = ?').get(info.lastInsertRowid));
});

router.put('/:id', requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const next = { ...existing, ...req.body };
  db.prepare(`
    UPDATE products SET category_id = ?, name = ?, material = ?, image_url = ?, badge = ?, featured_home = ?, sort_order = ?
    WHERE id = ?
  `).run(next.category_id, next.name, next.material, next.image_url, next.badge, next.featured_home ? 1 : 0, next.sort_order, req.params.id);
  res.json(db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id));
});

router.delete('/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

export default router;
