import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import ImageUploadField from '../ImageUploadField.jsx';

const BADGES = ['', 'E RE', 'ME POROSI'];

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
      {products.map((p) => (
        <div className="admin-subcard" key={p.id}>
          <ImageUploadField
            label="Foto Kryesore"
            value={p.image_url}
            onChange={(url) => updateProduct(p.id, { image_url: url })}
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
                      onClick={() => removePhoto(p.id, img.id)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            {/* Held at "" so it always shows an empty Ngarko slot — that lets
                several photos be added one after another without resetting it. */}
            <ImageUploadField value="" onChange={(url) => addPhoto(p.id, url)} />
          </div>

          <div className="admin-field">
            <label className="admin-field__label">Emri</label>
            <input
              value={p.name || ''}
              onChange={(e) => setProducts((ps) => ps.map((x) => (x.id === p.id ? { ...x, name: e.target.value } : x)))}
              onBlur={(e) => updateProduct(p.id, { name: e.target.value })}
            />
          </div>
          <div className="admin-field">
            <label className="admin-field__label">Materiali</label>
            <input
              value={p.material || ''}
              onChange={(e) => setProducts((ps) => ps.map((x) => (x.id === p.id ? { ...x, material: e.target.value } : x)))}
              onBlur={(e) => updateProduct(p.id, { material: e.target.value })}
            />
          </div>
          <div className="admin-field">
            <label className="admin-field__label">Etiketa</label>
            <select value={p.badge || ''} onChange={(e) => updateProduct(p.id, { badge: e.target.value || null })}>
              {BADGES.map((b) => (
                <option key={b} value={b}>{b || 'Pa Etiketë'}</option>
              ))}
            </select>
          </div>
          <label className="admin-checkbox">
            <input
              type="checkbox"
              checked={!!p.featured_home}
              onChange={(e) => updateProduct(p.id, { featured_home: e.target.checked ? 1 : 0 })}
            />
            Shfaq te "Dizajne të Reja" në Ballinë
          </label>
          <button type="button" className="admin-btn-secondary" onClick={() => removeProduct(p.id)}>Hiq Produktin</button>
        </div>
      ))}
      <button type="button" className="admin-btn-secondary" onClick={addProduct}>+ Shto Produkt</button>
    </div>
  );
}
