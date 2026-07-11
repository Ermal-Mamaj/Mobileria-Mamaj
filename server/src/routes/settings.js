import { Router } from 'express';
import { sql } from '../db/index.js';
import { requireAdmin } from '../auth.js';

const router = Router();

const FIELDS = ['phone', 'whatsapp', 'email', 'address', 'facebook', 'instagram', 'business_hours', 'logo_url'];

router.get('/', async (req, res) => {
  const [row] = await sql`SELECT * FROM site_settings WHERE id = 1`;
  res.json(row || {});
});

router.put('/', requireAdmin, async (req, res) => {
  const [existing] = await sql`SELECT * FROM site_settings WHERE id = 1`;
  const next = { ...existing, ...req.body };
  const values = FIELDS.map((f) => next[f] ?? null);

  // FIELDS is a hardcoded constant, not user input, so building the column
  // list into the query text is safe — only the values themselves (bound as
  // $1, $2, ...) come from the request body.
  const columnList = FIELDS.join(', ');
  const placeholders = FIELDS.map((_, i) => `$${i + 1}`).join(', ');
  const updateList = FIELDS.map((f, i) => `${f} = $${i + 1}`).join(', ');
  const [row] = await sql.query(
    `INSERT INTO site_settings (id, ${columnList}) VALUES (1, ${placeholders})
     ON CONFLICT (id) DO UPDATE SET ${updateList}
     RETURNING *`,
    values
  );
  res.json(row);
});

export default router;
