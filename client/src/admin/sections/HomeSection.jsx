import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import ImageUploadField from '../ImageUploadField.jsx';

export default function HomeSection() {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    api.get('/content/home').then(setForm);
  }, []);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const saved = await api.put('/content/home', form);
      setForm(saved);
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  }

  if (!form) return <p>Po ngarkohet...</p>;

  return (
    <form className="admin-panel" onSubmit={handleSave}>
      <h2 className="admin-panel__heading">Ballina – Seksioni Kryesor</h2>
      <div className="admin-field">
        <label className="admin-field__label">Teksti sipër titullit</label>
        <input value={form.hero_eyebrow || ''} onChange={(e) => set('hero_eyebrow', e.target.value)} />
      </div>
      <div className="admin-field">
        <label className="admin-field__label">Titulli Kryesor (përdorni një rresht të ri për një rresht të dytë)</label>
        <textarea rows={2} value={form.hero_headline || ''} onChange={(e) => set('hero_headline', e.target.value)} />
      </div>
      <div className="admin-field">
        <label className="admin-field__label">Teksti i Butonit</label>
        <input value={form.hero_cta || ''} onChange={(e) => set('hero_cta', e.target.value)} />
      </div>
      <ImageUploadField label="Imazhi Kryesor" value={form.hero_image_url} onChange={(url) => set('hero_image_url', url)} />

      <h2 className="admin-panel__heading">Citati i Markës</h2>
      <div className="admin-field">
        <label className="admin-field__label">Teksti i Citatit</label>
        <textarea rows={2} value={form.quote_text || ''} onChange={(e) => set('quote_text', e.target.value)} />
      </div>
      <div className="admin-field">
        <label className="admin-field__label">Nënshkrimi</label>
        <input value={form.quote_label || ''} onChange={(e) => set('quote_label', e.target.value)} />
      </div>

      <h2 className="admin-panel__heading">Seksioni i Kontaktit</h2>
      <div className="admin-field">
        <label className="admin-field__label">Titulli</label>
        <input value={form.contact_heading || ''} onChange={(e) => set('contact_heading', e.target.value)} />
      </div>
      <div className="admin-field">
        <label className="admin-field__label">Teksti Përshkrues</label>
        <textarea rows={2} value={form.contact_intro || ''} onChange={(e) => set('contact_intro', e.target.value)} />
      </div>

      <div className="admin-panel__actions">
        <button type="submit" disabled={saving}>{saving ? 'Po ruhen ndryshimet...' : 'Ruaj Ndryshimet'}</button>
        {savedAt && <span className="admin-panel__saved">U ruajt me sukses</span>}
      </div>
    </form>
  );
}
