import { Router } from 'express';
import { sql } from '../db/index.js';
import { requireAdmin } from '../auth.js';

const router = Router();

function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

router.get('/', async (req, res) => {
  const rows = await sql`SELECT * FROM categories ORDER BY sort_order ASC, id ASC`;
  res.json(rows);
});

router.get('/:slug', async (req, res) => {
  const [row] = await sql`SELECT * FROM categories WHERE slug = ${req.params.slug}`;
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

router.post('/', requireAdmin, async (req, res) => {
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
});

const CATEGORY_FIELDS = ['slug', 'name', 'tagline', 'hero_image_url', 'sort_order'];

router.put('/:id', requireAdmin, async (req, res) => {
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
});

router.delete('/:id', requireAdmin, async (req, res) => {
  await sql`DELETE FROM categories WHERE id = ${req.params.id}`;
  res.json({ ok: true });
});

export default router;
