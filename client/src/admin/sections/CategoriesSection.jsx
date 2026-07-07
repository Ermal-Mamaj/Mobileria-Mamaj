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
    if (!confirm(`Jeni të sigurt që dëshironi të fshini "${category.name}" dhe të gjitha produktet e tij? Ky veprim nuk mund të zhbëhet.`)) return;
    await api.del(`/categories/${category.id}`);
    onDeleted(category.id);
  }

  return (
    <div className="admin-subcard">
      <ImageUploadField label="Imazhi Kryesor" value={form.hero_image_url} onChange={(url) => setForm((f) => ({ ...f, hero_image_url: url }))} />
      <div className="admin-field">
        <label className="admin-field__label">Emri</label>
        <input value={form.name || ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
      </div>
      <div className="admin-field">
        <label className="admin-field__label">Përshkrim i shkurtër</label>
        <input value={form.tagline || ''} onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))} />
      </div>
      <p className="admin-field__hint">Faqja: /rooms/{form.slug}</p>

      <div className="admin-subcard__actions">
        <button type="button" onClick={handleSave} disabled={saving}>{saving ? 'Po ruhen ndryshimet...' : 'Ruaj'}</button>
        <button type="button" className="admin-btn-secondary" onClick={() => setExpanded((v) => !v)}>
          {expanded ? 'Fshih Produktet' : 'Menaxho Produktet'}
        </button>
        <button type="button" className="admin-btn-danger" onClick={handleDelete}>Fshi Koleksionin</button>
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

  if (!categories) return <p>Po ngarkohet...</p>;

  return (
    <div className="admin-panel">
      <h2 className="admin-panel__heading">Koleksionet</h2>
      <p className="admin-panel__description">
        Çdo koleksion krijon faqen e vet me produktet përkatëse. Shtoni një koleksion të ri për ta
        publikuar në faqe.
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
        <h3 className="admin-panel__heading" style={{ marginTop: 0 }}>Shto Koleksion të Ri</h3>
        <div className="admin-field">
          <label className="admin-field__label">Emri</label>
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="p.sh. Dhoma e Fëmijëve" />
        </div>
        <div className="admin-field">
          <label className="admin-field__label">Përshkrim i shkurtër</label>
          <input value={newTagline} onChange={(e) => setNewTagline(e.target.value)} placeholder="p.sh. Mobilie funksionale për familje moderne" />
        </div>
        <button type="submit">+ Shto Koleksion</button>
      </form>
    </div>
  );
}
