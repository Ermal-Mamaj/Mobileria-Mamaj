import { Router } from 'express';
import { sql } from '../db/index.js';
import { requireAdmin } from '../auth.js';

const router = Router();

const HOME_FIELDS = ['hero_eyebrow', 'hero_headline', 'hero_cta', 'hero_image_url', 'quote_text', 'quote_label', 'contact_heading', 'contact_intro'];
const ABOUT_FIELDS = ['hero_image_url', 'paragraph_1', 'paragraph_2', 'values_json', 'quote_text', 'quote_author'];

async function upsertSingleton(table, fields, id, next) {
  const values = fields.map((f) => next[f] ?? null);
  const columnList = fields.join(', ');
  const placeholders = fields.map((_, i) => `$${i + 2}`).join(', ');
  const updateList = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
  const [row] = await sql.query(
    `INSERT INTO ${table} (id, ${columnList}) VALUES ($1, ${placeholders})
     ON CONFLICT (id) DO UPDATE SET ${updateList}
     RETURNING *`,
    [id, ...values]
  );
  return row;
}

router.get('/home', async (req, res) => {
  const [row] = await sql`SELECT * FROM home_content WHERE id = 1`;
  res.json(row || {});
});

router.put('/home', requireAdmin, async (req, res) => {
  const [existing] = await sql`SELECT * FROM home_content WHERE id = 1`;
  const next = { ...existing, ...req.body };
  const row = await upsertSingleton('home_content', HOME_FIELDS, 1, next);
  res.json(row);
});

router.get('/about', async (req, res) => {
  const [row] = await sql`SELECT * FROM about_content WHERE id = 1`;
  // values_json is a JSONB column — Neon returns it already parsed as an array.
  res.json(row || {});
});

router.put('/about', requireAdmin, async (req, res) => {
  const [existing] = await sql`SELECT * FROM about_content WHERE id = 1`;
  const body = { ...req.body };
  if (Array.isArray(body.values_json)) body.values_json = JSON.stringify(body.values_json);
  const next = { ...existing, ...body };
  if (Array.isArray(next.values_json)) next.values_json = JSON.stringify(next.values_json);
  const row = await upsertSingleton('about_content', ABOUT_FIELDS, 1, next);
  res.json(row);
});

export default router;
