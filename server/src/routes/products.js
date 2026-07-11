import { Router } from 'express';
import { sql } from '../db/index.js';
import { requireAdmin } from '../auth.js';

const router = Router();

router.get('/', async (req, res) => {
  const { category, featured } = req.query;

  // Build the WHERE clause conditionally, but keep every value bound as a
  // parameter (never string-concatenated into the query itself).
  let rows;
  if (category && featured) {
    rows = await sql`
      SELECT products.*, categories.slug AS category_slug, categories.name AS category_name
      FROM products JOIN categories ON categories.id = products.category_id
      WHERE categories.slug = ${category} AND products.featured_home = 1
      ORDER BY products.sort_order ASC, products.id ASC
    `;
  } else if (category) {
    rows = await sql`
      SELECT products.*, categories.slug AS category_slug, categories.name AS category_name
      FROM products JOIN categories ON categories.id = products.category_id
      WHERE categories.slug = ${category}
      ORDER BY products.sort_order ASC, products.id ASC
    `;
  } else if (featured) {
    rows = await sql`
      SELECT products.*, categories.slug AS category_slug, categories.name AS category_name
      FROM products JOIN categories ON categories.id = products.category_id
      WHERE products.featured_home = 1
      ORDER BY products.sort_order ASC, products.id ASC
    `;
  } else {
    rows = await sql`
      SELECT products.*, categories.slug AS category_slug, categories.name AS category_name
      FROM products JOIN categories ON categories.id = products.category_id
      ORDER BY products.sort_order ASC, products.id ASC
    `;
  }
  res.json(rows);
});

router.post('/', requireAdmin, async (req, res) => {
  const { category_id, name, material = '', image_url = null, badge = null, featured_home = 0, sort_order = 0 } = req.body || {};
  if (!category_id || !name) return res.status(400).json({ error: 'category_id and name required' });
  const [row] = await sql`
    INSERT INTO products (category_id, name, material, image_url, badge, featured_home, sort_order)
    VALUES (${category_id}, ${name}, ${material}, ${image_url}, ${badge}, ${featured_home ? 1 : 0}, ${sort_order})
    RETURNING *
  `;
  res.status(201).json(row);
});

router.put('/:id', requireAdmin, async (req, res) => {
  const [existing] = await sql`SELECT * FROM products WHERE id = ${req.params.id}`;
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const next = { ...existing, ...req.body };
  const [row] = await sql`
    UPDATE products SET category_id = ${next.category_id}, name = ${next.name}, material = ${next.material},
      image_url = ${next.image_url}, badge = ${next.badge}, featured_home = ${next.featured_home ? 1 : 0},
      sort_order = ${next.sort_order}
    WHERE id = ${req.params.id}
    RETURNING *
  `;
  res.json(row);
});

router.delete('/:id', requireAdmin, async (req, res) => {
  await sql`DELETE FROM products WHERE id = ${req.params.id}`;
  res.json({ ok: true });
});

export default router;
