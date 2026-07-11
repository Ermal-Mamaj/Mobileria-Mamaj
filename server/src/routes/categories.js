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

router.put('/:id', requireAdmin, async (req, res) => {
  const [existing] = await sql`SELECT * FROM categories WHERE id = ${req.params.id}`;
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const next = { ...existing, ...req.body };
  if (req.body.slug) next.slug = slugify(req.body.slug);
  const [row] = await sql`
    UPDATE categories SET slug = ${next.slug}, name = ${next.name}, tagline = ${next.tagline},
      hero_image_url = ${next.hero_image_url}, sort_order = ${next.sort_order}
    WHERE id = ${req.params.id}
    RETURNING *
  `;
  res.json(row);
});

router.delete('/:id', requireAdmin, async (req, res) => {
  await sql`DELETE FROM categories WHERE id = ${req.params.id}`;
  res.json({ ok: true });
});

export default router;
