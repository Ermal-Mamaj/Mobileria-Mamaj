import { Router } from 'express';
import { sql } from '../db/index.js';
import { requireAdmin } from '../auth.js';

const router = Router();

router.get('/', async (req, res) => {
  const rows = await sql`SELECT * FROM gallery_images ORDER BY sort_order ASC, id ASC`;
  res.json(rows);
});

router.post('/', requireAdmin, async (req, res) => {
  const { image_url = null, caption = '', sort_order } = req.body || {};
  let order = sort_order;
  if (order === undefined || order === null) {
    const [{ m }] = await sql`SELECT COALESCE(MAX(sort_order), -1) AS m FROM gallery_images`;
    order = m + 1;
  }
  const [row] = await sql`
    INSERT INTO gallery_images (image_url, caption, sort_order)
    VALUES (${image_url}, ${caption}, ${order})
    RETURNING *
  `;
  res.status(201).json(row);
});

router.put('/:id', requireAdmin, async (req, res) => {
  const [existing] = await sql`SELECT * FROM gallery_images WHERE id = ${req.params.id}`;
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const next = { ...existing, ...req.body };
  const [row] = await sql`
    UPDATE gallery_images SET image_url = ${next.image_url}, caption = ${next.caption}, sort_order = ${next.sort_order}
    WHERE id = ${req.params.id}
    RETURNING *
  `;
  res.json(row);
});

router.delete('/:id', requireAdmin, async (req, res) => {
  await sql`DELETE FROM gallery_images WHERE id = ${req.params.id}`;
  res.json({ ok: true });
});

export default router;
