import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { formatPrice, isOnSale, discountPercent } from '../../lib/price.js';
import ImageUploadField from '../ImageUploadField.jsx';

const BADGES = ['', 'E RE', 'ME POROSI'];

function ProductCard({ product: p, onUpdate, onDelete, onAddPhoto, onRemovePhoto }) {
  const [local, setLocal] = useState(p);

  // Sync from parent when API saves come back
  useEffect(() => setLocal(p), [p]);

  function setField(field, value) {
    setLocal((prev) => ({ ...prev, [field]: value }));
  }

  function blur(field) {
    const value = local[field];
    // For numeric fields, send null instead of empty string
    if (['price', 'sale_price'].includes(field)) {
      onUpdate(p.id, { [field]: value === '' || value === null ? null : value });
    } else {
      onUpdate(p.id, { [field]: value });
    }
  }

  const sale = isOnSale(p);
  const pct = discountPercent(p);
  const stockClass = p.stock_count <= 0
    ? 'prod-stock--zero'
    : p.stock_count <= 3
      ? 'prod-stock--low'
      : 'prod-stock--ok';

  return (
    <div className="prod-card">
      <div className="prod-card__header">
        <div className="prod-card__thumb">
          {p.image_url
            ? <img src={p.image_url} alt="" />
            : <span className="prod-card__thumb-empty">📷</span>
          }
        </div>
        <div className="prod-card__summary">
          <h3 className="prod-card__name">{p.name || 'Produkt i Ri'}</h3>
          <div className="prod-card__meta">
            {formatPrice(p.price) && (
              <span className="prod-card__price">
                {sale ? (
                  <>
                    <s>{formatPrice(p.price)}</s>{' '}
                    <strong>{formatPrice(p.sale_price)}</strong>{' '}
                    <span className="prod-card__discount">-{pct}%</span>
                  </>
                ) : formatPrice(p.price)}
              </span>
            )}
            <span className={`prod-stock-badge ${stockClass}`}>
              {p.stock_count <= 0 ? 'Pa stok' : `${p.stock_count} copë`}
            </span>
          </div>
        </div>
      </div>

      <details className="prod-card__details">
        <summary className="prod-card__toggle">Ndrysho detajet ▾</summary>

        <div className="prod-card__fields">
          <ImageUploadField
            label="Foto Kryesore"
            value={p.image_url}
            onChange={(url) => onUpdate(p.id, { image_url: url })}
          />

          <div className="admin-photos">
            <label className="admin-field__label">Foto Shtesë</label>
            {(p.images || []).length > 0 && (
              <div className="admin-photo-strip">
                {p.images.map((img) => (
                  <div className="admin-photo-strip__item" key={img.id}>
                    <img src={img.image_url} alt="" />
                    <button
                      type="button"
                      className="admin-photo-strip__remove"
                      aria-label="Hiq foton"
                      onClick={() => onRemovePhoto(p.id, img.id)}
                    >×</button>
                  </div>
                ))}
              </div>
            )}
            <ImageUploadField value="" onChange={(url) => onAddPhoto(p.id, url)} />
          </div>

          <div className="admin-field">
            <label className="admin-field__label">Emri</label>
            <input value={local.name || ''} onChange={(e) => setField('name', e.target.value)} onBlur={() => blur('name')} />
          </div>

          <div className="admin-field">
            <label className="admin-field__label">Materiali</label>
            <input value={local.material || ''} onChange={(e) => setField('material', e.target.value)} onBlur={() => blur('material')} />
          </div>

          <div className="admin-field-row">
            <div className="admin-field">
              <label className="admin-field__label">Çmimi (€)</label>
              <input type="number" min="0" step="0.01" value={local.price ?? ''} placeholder="p.sh. 450"
                onChange={(e) => setField('price', e.target.value)} onBlur={() => blur('price')} />
            </div>
            <div className="admin-field">
              <label className="admin-field__label">Zbritja (€)</label>
              <input type="number" min="0" step="0.01" value={local.sale_price ?? ''} placeholder="bosh = pa zbritje"
                onChange={(e) => setField('sale_price', e.target.value)} onBlur={() => blur('sale_price')} />
            </div>
            <div className="admin-field">
              <label className="admin-field__label">Stoku (copë)</label>
              <input type="number" min="0" step="1" value={local.stock_count ?? 0}
                onChange={(e) => setField('stock_count', e.target.value)}
                onBlur={() => onUpdate(p.id, { stock_count: Number(local.stock_count) || 0 })} />
            </div>
          </div>

          <div className="admin-field-row">
            <div className="admin-field">
              <label className="admin-field__label">Etiketa</label>
              <select value={p.badge || ''} onChange={(e) => onUpdate(p.id, { badge: e.target.value || null })}>
                {BADGES.map((b) => <option key={b} value={b}>{b || 'Pa Etiketë'}</option>)}
              </select>
            </div>
            <div className="admin-field" style={{ justifyContent: 'flex-end' }}>
              <label className="admin-checkbox">
                <input type="checkbox" checked={!!p.featured_home}
                  onChange={(e) => onUpdate(p.id, { featured_home: e.target.checked ? 1 : 0 })} />
                Shfaq në Ballinë
              </label>
            </div>
          </div>

          <div className="prod-card__actions">
            <button type="button" className="admin-btn-danger" onClick={() => onDelete(p.id)}>Fshi Produktin</button>
          </div>
        </div>
      </details>
    </div>
  );
}

export default function ProductsPanel({ category }) {
  const [products, setProducts] = useState(null);

  function reload() {
    api.get(`/products?category=${category.slug}`).then(setProducts);
  }

  useEffect(reload, [category.slug]);

  async function addProduct() {
    await api.post('/products', { category_id: category.id, name: 'Produkt i Ri', material: '' });
    reload();
  }

  async function updateProduct(id, patch) {
    const updated = await api.put(`/products/${id}`, patch);
    setProducts((ps) => ps.map((p) => (p.id === id ? updated : p)));
  }

  async function removeProduct(id) {
    if (!confirm('Jeni të sigurt? Ky veprim nuk mund të zhbëhet.')) return;
    await api.del(`/products/${id}`);
    setProducts((ps) => ps.filter((p) => p.id !== id));
  }

  async function addPhoto(productId, url) {
    if (!url) return;
    const image = await api.post(`/products/${productId}/images`, { image_url: url });
    setProducts((ps) => ps.map((p) => (p.id === productId ? { ...p, images: [...(p.images || []), image] } : p)));
  }

  async function removePhoto(productId, imageId) {
    await api.del(`/products/${productId}/images/${imageId}`);
    setProducts((ps) =>
      ps.map((p) => (p.id === productId ? { ...p, images: (p.images || []).filter((i) => i.id !== imageId) } : p))
    );
  }

  if (!products) return <p>Po ngarkohen produktet...</p>;

  return (
    <div className="admin-products-panel">
      <div className="prod-summary">
        {products.length} produkte · {products.filter((p) => p.stock_count > 0).length} në stok · {products.filter((p) => isOnSale(p)).length} në zbritje
      </div>
      {products.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          onUpdate={updateProduct}
          onDelete={removeProduct}
          onAddPhoto={addPhoto}
          onRemovePhoto={removePhoto}
        />
      ))}
      <button type="button" className="prod-add-btn" onClick={addProduct}>+ Shto Produkt të Ri</button>
    </div>
  );
}
