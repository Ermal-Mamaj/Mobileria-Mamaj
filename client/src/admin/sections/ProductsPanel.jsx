import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import ImageUploadField from '../ImageUploadField.jsx';

const BADGES = ['', 'NEW', 'CUSTOM'];

export default function ProductsPanel({ category }) {
  const [products, setProducts] = useState(null);

  function reload() {
    api.get(`/products?category=${category.slug}`).then(setProducts);
  }

  useEffect(reload, [category.slug]);

  async function addProduct() {
    await api.post('/products', { category_id: category.id, name: 'New Product', material: '' });
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

  if (!products) return <p>Loading products…</p>;

  return (
    <div className="admin-products-panel">
      {products.map((p) => (
        <div className="admin-subcard" key={p.id}>
          <ImageUploadField value={p.image_url} onChange={(url) => updateProduct(p.id, { image_url: url })} />
          <div className="admin-field">
            <label className="admin-field__label">Name</label>
            <input
              value={p.name || ''}
              onChange={(e) => setProducts((ps) => ps.map((x) => (x.id === p.id ? { ...x, name: e.target.value } : x)))}
              onBlur={(e) => updateProduct(p.id, { name: e.target.value })}
            />
          </div>
          <div className="admin-field">
            <label className="admin-field__label">Material</label>
            <input
              value={p.material || ''}
              onChange={(e) => setProducts((ps) => ps.map((x) => (x.id === p.id ? { ...x, material: e.target.value } : x)))}
              onBlur={(e) => updateProduct(p.id, { material: e.target.value })}
            />
          </div>
          <div className="admin-field">
            <label className="admin-field__label">Badge</label>
            <select value={p.badge || ''} onChange={(e) => updateProduct(p.id, { badge: e.target.value || null })}>
              {BADGES.map((b) => (
                <option key={b} value={b}>{b || 'None'}</option>
              ))}
            </select>
          </div>
          <label className="admin-checkbox">
            <input
              type="checkbox"
              checked={!!p.featured_home}
              onChange={(e) => updateProduct(p.id, { featured_home: e.target.checked ? 1 : 0 })}
            />
            Feature on Home page ("New Designs")
          </label>
          <button type="button" className="admin-btn-secondary" onClick={() => removeProduct(p.id)}>Remove Product</button>
        </div>
      ))}
      <button type="button" className="admin-btn-secondary" onClick={addProduct}>+ Add Product</button>
    </div>
  );
}
