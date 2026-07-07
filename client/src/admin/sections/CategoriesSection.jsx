import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import ImageUploadField from '../ImageUploadField.jsx';
import ProductsPanel from './ProductsPanel.jsx';

function CategoryRow({ category, onChanged, onDeleted }) {
  const [form, setForm] = useState(category);
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await api.put(`/categories/${category.id}`, form);
      setForm(updated);
      onChanged(updated);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${category.name}" and all of its products? This can't be undone.`)) return;
    await api.del(`/categories/${category.id}`);
    onDeleted(category.id);
  }

  return (
    <div className="admin-subcard">
      <ImageUploadField label="Hero image" value={form.hero_image_url} onChange={(url) => setForm((f) => ({ ...f, hero_image_url: url }))} />
      <div className="admin-field">
        <label className="admin-field__label">Name</label>
        <input value={form.name || ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
      </div>
      <div className="admin-field">
        <label className="admin-field__label">Tagline</label>
        <input value={form.tagline || ''} onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))} />
      </div>
      <p className="admin-field__hint">Page: /rooms/{form.slug}</p>

      <div className="admin-subcard__actions">
        <button type="button" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        <button type="button" className="admin-btn-secondary" onClick={() => setExpanded((v) => !v)}>
          {expanded ? 'Hide Products' : 'Manage Products'}
        </button>
        <button type="button" className="admin-btn-danger" onClick={handleDelete}>Delete Category</button>
      </div>

      {expanded && <ProductsPanel category={form} />}
    </div>
  );
}

export default function CategoriesSection() {
  const [categories, setCategories] = useState(null);
  const [newName, setNewName] = useState('');
  const [newTagline, setNewTagline] = useState('');

  function reload() {
    api.get('/categories').then(setCategories);
  }

  useEffect(reload, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    await api.post('/categories', { name: newName, tagline: newTagline });
    setNewName('');
    setNewTagline('');
    reload();
  }

  if (!categories) return <p>Loading…</p>;

  return (
    <div className="admin-panel">
      <h2 className="admin-panel__heading">Categories &amp; Products</h2>
      <p className="admin-panel__description">
        Each category becomes its own page (e.g. /rooms/living-room) with a product grid. Add a new
        category here to publish a new room page.
      </p>

      {categories.map((cat) => (
        <CategoryRow
          key={cat.id}
          category={cat}
          onChanged={(updated) => setCategories((cs) => cs.map((c) => (c.id === updated.id ? updated : c)))}
          onDeleted={(id) => setCategories((cs) => cs.filter((c) => c.id !== id))}
        />
      ))}

      <form className="admin-subcard" onSubmit={handleAdd}>
        <h3 className="admin-panel__heading" style={{ marginTop: 0 }}>Add New Category</h3>
        <div className="admin-field">
          <label className="admin-field__label">Name</label>
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Kids Room" />
        </div>
        <div className="admin-field">
          <label className="admin-field__label">Tagline</label>
          <input value={newTagline} onChange={(e) => setNewTagline(e.target.value)} placeholder="e.g. Playful pieces for growing families" />
        </div>
        <button type="submit">+ Add Category</button>
      </form>
    </div>
  );
}
