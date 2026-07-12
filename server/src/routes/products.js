import { Router } from 'express';
import { sql } from '../db/index.js';
import { requireAdmin } from '../auth.js';

const router = Router();

// Products come back with their extra photos already attached, so opening a
// product doesn't cost a second round trip just to see the other angles. The
// cover shot stays in products.image_url; `images` is everything beyond it.
const SELECT_PRODUCTS = `
  SELECT p.*, c.slug AS category_slug, c.name AS category_name,
    COALESCE(
      json_agg(
        json_build_object('id', pi.id, 'image_url', pi.image_url, 'sort_order', pi.sort_order)
        ORDER BY pi.sort_order ASC, pi.id ASC
      ) FILTER (WHERE pi.id IS NOT NULL),
      '[]'
    ) AS images
  FROM products p
  JOIN categories c ON c.id = p.category_id
  LEFT JOIN product_images pi ON pi.product_id = p.id
`;

router.get('/', async (req, res) => {
  const { category, featured } = req.query;

  // Filters are composed as bound parameters — never concatenated into the SQL.
  const clauses = [];
  const params = [];
  if (category) {
    params.push(category);
    clauses.push(`c.slug = $${params.length}`);
  }
  if (featured) clauses.push('p.featured_home = 1');

  const rows = await sql.query(
    `${SELECT_PRODUCTS}
     ${clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''}
     GROUP BY p.id, c.slug, c.name
     ORDER BY p.sort_order ASC, p.id ASC`,
    params
  );
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
  res.status(201).json({ ...row, images: [] });
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
  const images = await sql`
    SELECT id, image_url, sort_order FROM product_images
    WHERE product_id = ${req.params.id} ORDER BY sort_order ASC, id ASC
  `;
  res.json({ ...row, images });
});

router.delete('/:id', requireAdmin, async (req, res) => {
  await sql`DELETE FROM products WHERE id = ${req.params.id}`;
  res.json({ ok: true });
});

// --- extra photos for a product ---

router.post('/:id/images', requireAdmin, async (req, res) => {
  const { image_url } = req.body || {};
  if (!image_url) return res.status(400).json({ error: 'image_url required' });

  const [product] = await sql`SELECT id FROM products WHERE id = ${req.params.id}`;
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const [{ m }] = await sql`
    SELECT COALESCE(MAX(sort_order), -1) AS m FROM product_images WHERE product_id = ${req.params.id}
  `;
  const [row] = await sql`
    INSERT INTO product_images (product_id, image_url, sort_order)
    VALUES (${req.params.id}, ${image_url}, ${m + 1})
    RETURNING id, image_url, sort_order
  `;
  res.status(201).json(row);
});

router.delete('/:id/images/:imageId', requireAdmin, async (req, res) => {
  await sql`DELETE FROM product_images WHERE id = ${req.params.imageId} AND product_id = ${req.params.id}`;
  res.json({ ok: true });
});

export default router;
