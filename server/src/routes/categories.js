import { Router } from 'express';
import { sql } from '../db/index.js';
import { requireAdmin } from '../auth.js';
import { asyncHandler } from '../lib/asyncHandler.js';

const router = Router();

function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

router.get('/', asyncHandler(async (req, res) => {
  const rows = await sql`
    SELECT c.*, COUNT(p.id)::int AS product_count
    FROM categories c
    LEFT JOIN products p ON p.category_id = c.id
    GROUP BY c.id
    ORDER BY c.sort_order ASC, c.id ASC
  `;
  res.json(rows);
}));

router.get('/:slug', asyncHandler(async (req, res) => {
  const [row] = await sql`SELECT * FROM categories WHERE slug = ${req.params.slug}`;
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
}));

router.post('/', requireAdmin, asyncHandler(async (req, res) => {
  const { name, tagline = '', hero_image_url = null } = req.body || {};
  if (!name) return res.status(400).json({ error: 'Name required' });
  const slug = req.body.slug ? slugify(req.body.slug) : slugify(name);
  const [{ m: maxOrder }] = await sql`SELECT COALESCE(MAX(sort_order), -1) AS m FROM categories`;
  const [row] = await sql`
    INSERT INTO categories (slug, name, tagline, hero_image_url, sort_order)
    VALUES (${slug}, ${name}, ${tagline}, ${hero_image_url}, ${maxOrder + 1})
    RETURNING *
  `;
  res.status(201).json(row);
}));

const CATEGORY_FIELDS = ['slug', 'name', 'tagline', 'hero_image_url', 'sort_order'];

router.put('/:id', requireAdmin, asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if (body.slug) body.slug = slugify(body.slug);

  // Only touch columns the client actually sent — avoids a pre-fetch SELECT
  // just to preserve untouched fields. The admin form always sends every
  // field anyway, but this stays correct even for a future partial update.
  const presentFields = CATEGORY_FIELDS.filter((f) => f in body);
  if (presentFields.length === 0) {
    const [row] = await sql`SELECT * FROM categories WHERE id = ${req.params.id}`;
    if (!row) return res.status(404).json({ error: 'Not found' });
    return res.json(row);
  }

  const setList = presentFields.map((f, i) => `${f} = $${i + 1}`).join(', ');
  const values = presentFields.map((f) => body[f]);
  const [row] = await sql.query(
    `UPDATE categories SET ${setList} WHERE id = $${presentFields.length + 1} RETURNING *`,
    [...values, req.params.id]
  );
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
}));

router.delete('/:id', requireAdmin, asyncHandler(async (req, res) => {
  await sql`DELETE FROM categories WHERE id = ${req.params.id}`;
  res.json({ ok: true });
}));

// Same full-renumber approach as the products reorder endpoint, and for the
// same reason: swapping two sort_order values silently fails whenever they
// happen to be equal (common, since nothing enforces distinct values).
router.post('/reorder', requireAdmin, asyncHandler(async (req, res) => {
  const { order } = req.body || {};
  if (!Array.isArray(order) || order.length === 0) {
    return res.status(400).json({ error: 'order must be a non-empty array of category IDs' });
  }
  const values = order.map((id, i) => [id, i]);
  const valuesSql = values.map((_, i) => `($${i * 2 + 1}::int, $${i * 2 + 2}::int)`).join(', ');
  const params = values.flat();
  await sql.query(
    `UPDATE categories AS c SET sort_order = v.new_order
     FROM (VALUES ${valuesSql}) AS v(id, new_order)
     WHERE c.id = v.id`,
    params
  );
  res.json({ ok: true });
}));

export default router;
