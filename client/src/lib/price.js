// Kosovo uses the Euro. Formats as "450 €" (the common convention in
// Albanian-language contexts), with no decimal places for whole-euro
// prices — furniture prices here are never priced to the cent.
export function formatPrice(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  const hasCents = Math.round(n * 100) % 100 !== 0;
  return `${n.toLocaleString('sq-AL', { minimumFractionDigits: hasCents ? 2 : 0, maximumFractionDigits: 2 })} €`;
}

// A product only counts as "on sale" when sale_price is a real discount off
// price — a sale_price left over at or above the regular price (e.g. after
// a price increase) should never present as a deal.
export function isOnSale(product) {
  const price = Number(product?.price);
  const salePrice = Number(product?.sale_price);
  return Number.isFinite(price) && Number.isFinite(salePrice) && salePrice > 0 && salePrice < price;
}

export function discountPercent(product) {
  if (!isOnSale(product)) return null;
  const price = Number(product.price);
  const salePrice = Number(product.sale_price);
  return Math.round(((price - salePrice) / price) * 100);
}
