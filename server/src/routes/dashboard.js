import { Router } from 'express';
import { sql } from '../db/index.js';
import { requireAdmin } from '../auth.js';
import { asyncHandler } from '../lib/asyncHandler.js';

const router = Router();

// Single query that pulls every stat the dashboard needs in one round
// trip — no sequential calls, no N+1 patterns. Each stat is a scalar
// subquery so Postgres resolves them all in parallel.
router.get('/', requireAdmin, asyncHandler(async (req, res) => {
  const [stats] = await sql`
    SELECT
      (SELECT COUNT(*)::int FROM products) AS total_products,
      (SELECT COUNT(*)::int FROM categories) AS total_categories,
      (SELECT COUNT(*)::int FROM products WHERE sale_price IS NOT NULL AND sale_price < price) AS on_sale,
      (SELECT COUNT(*)::int FROM products WHERE stock_count <= 0) AS out_of_stock,
      (SELECT COUNT(*)::int FROM products WHERE stock_count > 0 AND stock_count <= 3) AS low_stock,
      (SELECT COUNT(*)::int FROM contact_messages WHERE is_read = FALSE) AS unread_messages,
      (SELECT COALESCE(SUM(stock_count), 0)::int FROM products) AS total_stock_units
  `;
  res.json(stats);
}));

// Low-stock product list for the dashboard alert panel
router.get('/low-stock', requireAdmin, asyncHandler(async (req, res) => {
  const rows = await sql`
    SELECT p.id, p.name, p.stock_count, p.image_url, c.name AS category_name
    FROM products p
    JOIN categories c ON c.id = p.category_id
    WHERE p.stock_count <= 3
    ORDER BY p.stock_count ASC, p.name ASC
    LIMIT 20
  `;
  res.json(rows);
}));

export default router;
