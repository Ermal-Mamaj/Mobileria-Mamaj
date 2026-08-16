import { Router } from 'express';
import { sql } from '../db/index.js';
import { requireAdmin } from '../auth.js';
import { asyncHandler } from '../lib/asyncHandler.js';

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

router.get('/', asyncHandler(async (req, res) => {
  const { category, featured, sale } = req.query;

  // Filters are composed as bound parameters — never concatenated into the SQL.
  const clauses = [];
  const params = [];
  if (category) {
    params.push(category);
    clauses.push(`c.slug = $${params.length}`);
  }
  if (featured) clauses.push('p.featured_home = 1');
  // "On sale" means an actual discount is set, not just any sale_price
  // present — guards against a stale sale_price left over at or above the
  // regular price still showing up as a deal.
  if (sale) clauses.push('p.sale_price IS NOT NULL AND p.sale_price < p.price');

  const rows = await sql.query(
    `${SELECT_PRODUCTS}
     ${clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''}
     GROUP BY p.id, c.slug, c.name
     ORDER BY p.sort_order ASC, p.id ASC`,
    params
  );
  res.json(rows);
}));

router.post('/', requireAdmin, asyncHandler(async (req, res) => {
  const { category_id, name, material = '', image_url = null, badge = null, price = null, sale_price = null, featured_home = 0, sort_order = 0 } = req.body || {};
  if (!category_id || !name) return res.status(400).json({ error: 'category_id and name required' });
  const [row] = await sql`
    INSERT INTO products (category_id, name, material, image_url, badge, price, sale_price, featured_home, sort_order)
    VALUES (${category_id}, ${name}, ${material}, ${image_url}, ${badge}, ${price}, ${sale_price}, ${featured_home ? 1 : 0}, ${sort_order})
    RETURNING *
  `;
  res.status(201).json({ ...row, images: [] });
}));

const PRODUCT_FIELDS = ['category_id', 'name', 'material', 'image_url', 'badge', 'price', 'sale_price', 'featured_home', 'sort_order'];

// Scalar subquery pulls the product's extra photos into the same query as
// the UPDATE itself, so a save doesn't need a separate round trip afterward
// just to hand the images back to the client.
const IMAGES_SUBQUERY = `(
  SELECT COALESCE(
    json_agg(json_build_object('id', pi.id, 'image_url', pi.image_url, 'sort_order', pi.sort_order) ORDER BY pi.sort_order ASC, pi.id ASC),
    '[]'
  )
  FROM product_images pi WHERE pi.product_id = products.id
) AS images`;

router.put('/:id', requireAdmin, asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if ('featured_home' in body) body.featured_home = body.featured_home ? 1 : 0;

  // Only touch columns the client actually sent. The admin UI genuinely
  // relies on this being a real partial update (each field auto-saves on
  // its own as you type/blur) rather than always resending the whole
  // product, so this can't be simplified to "just send everything."
  const presentFields = PRODUCT_FIELDS.filter((f) => f in body);
  if (presentFields.length === 0) {
    const [row] = await sql.query(`SELECT products.*, ${IMAGES_SUBQUERY} FROM products WHERE id = $1`, [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Not found' });
    return res.json(row);
  }

  const setList = presentFields.map((f, i) => `${f} = $${i + 1}`).join(', ');
  const values = presentFields.map((f) => body[f]);
  const [row] = await sql.query(
    `UPDATE products SET ${setList} WHERE id = $${presentFields.length + 1} RETURNING products.*, ${IMAGES_SUBQUERY}`,
    [...values, req.params.id]
  );
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
}));

router.delete('/:id', requireAdmin, asyncHandler(async (req, res) => {
  await sql`DELETE FROM products WHERE id = ${req.params.id}`;
  res.json({ ok: true });
}));

// --- extra photos for a product ---

router.post('/:id/images', requireAdmin, asyncHandler(async (req, res) => {
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
}));

router.delete('/:id/images/:imageId', requireAdmin, asyncHandler(async (req, res) => {
  await sql`DELETE FROM product_images WHERE id = ${req.params.imageId} AND product_id = ${req.params.id}`;
  res.json({ ok: true });
}));

export default router;
