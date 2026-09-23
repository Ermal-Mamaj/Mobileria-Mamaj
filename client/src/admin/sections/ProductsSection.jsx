import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import ImageUploadField from '../ImageUploadField.jsx';
import ProductsPanel from './ProductsPanel.jsx';

function CategoryManager({ categories, onReload }) {
  const [newName, setNewName] = useState('');
  const [editing, setEditing] = useState(null);

  async function handleAdd(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    await api.post('/categories', { name: newName });
    setNewName('');
    onReload();
  }

  async function handleSave(cat, form) {
    await api.put(`/categories/${cat.id}`, form);
    setEditing(null);
    onReload();
  }

  async function handleDelete(cat) {
    if (!confirm(`Fshij "${cat.name}" dhe të gjitha produktet brenda? Ky veprim nuk mund të zhbëhet.`)) return;
    await api.del(`/categories/${cat.id}`);
    onReload();
  }

  return (
    <div className="cat-manager">
      <h3 className="cat-manager__title">Koleksionet (Dhomat)</h3>
      <div className="cat-chips">
        {categories.map((cat) => (
          <div className="cat-chip" key={cat.id}>
            {editing === cat.id ? (
              <CategoryEditInline cat={cat} onSave={(form) => handleSave(cat, form)} onCancel={() => setEditing(null)} />
            ) : (
              <>
                <span className="cat-chip__name">{cat.name}</span>
                <button type="button" className="cat-chip__edit" onClick={() => setEditing(cat.id)} title="Ndrysho">✏️</button>
                <button type="button" className="cat-chip__del" onClick={() => handleDelete(cat)} title="Fshi">×</button>
              </>
            )}
          </div>
        ))}
        <form className="cat-chip cat-chip--add" onSubmit={handleAdd}>
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Koleksion i ri..." className="cat-chip__input" />
          <button type="submit" className="cat-chip__add-btn">+</button>
        </form>
      </div>
    </div>
  );
}

function CategoryEditInline({ cat, onSave, onCancel }) {
  const [form, setForm] = useState({ name: cat.name, tagline: cat.tagline || '' });
  return (
    <div className="cat-edit-inline">
      <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} autoFocus />
      <input value={form.tagline} onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))} placeholder="Përshkrim i shkurtër" />
      <ImageUploadField label="Imazhi" value={cat.hero_image_url} onChange={(url) => onSave({ ...form, hero_image_url: url })} />
      <div className="cat-edit-inline__actions">
        <button type="button" onClick={() => onSave(form)}>Ruaj</button>
        <button type="button" className="admin-btn-secondary" onClick={onCancel}>Anulo</button>
      </div>
    </div>
  );
}

export default function ProductsSection() {
  const [categories, setCategories] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  function reload() {
    api.get('/categories').then((cats) => {
      setCategories(cats);
      if (selectedId === null && cats.length > 0) setSelectedId(cats[0].id);
      // If the selected category was deleted, fall back to the first one
      if (selectedId !== null && !cats.find((c) => c.id === selectedId)) {
        setSelectedId(cats.length > 0 ? cats[0].id : null);
      }
    });
  }

  useEffect(reload, []);

  if (!categories) return <p>Po ngarkohet...</p>;

  const selected = categories.find((c) => c.id === selectedId) || categories[0];

  return (
    <div className="admin-panel">
      <h2 className="admin-panel__heading">Produkte</h2>
      <p className="admin-panel__description">
        Menaxhoni koleksionet (dhomat) dhe produktet brenda tyre. Zgjidhni një koleksion për të parë dhe
        ndryshuar produktet e tij, duke përfshirë çmimet, fotot dhe sasinë në stok.
      </p>

      <CategoryManager categories={categories} onReload={reload} />

      {categories.length > 0 && (
        <>
          <div className="admin-room-tabs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`admin-room-tab ${cat.id === selected?.id ? 'is-active' : ''}`}
                onClick={() => setSelectedId(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {selected && <ProductsPanel key={selected.id} category={selected} />}
        </>
      )}
    </div>
  );
}
