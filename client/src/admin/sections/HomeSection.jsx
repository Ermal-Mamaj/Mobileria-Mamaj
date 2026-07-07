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

  if (!form) return <p>Loading…</p>;

  return (
    <form className="admin-panel" onSubmit={handleSave}>
      <h2 className="admin-panel__heading">Home Page — Hero</h2>
      <div className="admin-field">
        <label className="admin-field__label">Eyebrow</label>
        <input value={form.hero_eyebrow || ''} onChange={(e) => set('hero_eyebrow', e.target.value)} />
      </div>
      <div className="admin-field">
        <label className="admin-field__label">Headline (use a line break for a second line)</label>
        <textarea rows={2} value={form.hero_headline || ''} onChange={(e) => set('hero_headline', e.target.value)} />
      </div>
      <div className="admin-field">
        <label className="admin-field__label">CTA button text</label>
        <input value={form.hero_cta || ''} onChange={(e) => set('hero_cta', e.target.value)} />
      </div>
      <ImageUploadField label="Hero image" value={form.hero_image_url} onChange={(url) => set('hero_image_url', url)} />

      <h2 className="admin-panel__heading">Brand Quote Band</h2>
      <div className="admin-field">
        <label className="admin-field__label">Quote text</label>
        <textarea rows={2} value={form.quote_text || ''} onChange={(e) => set('quote_text', e.target.value)} />
      </div>
      <div className="admin-field">
        <label className="admin-field__label">Quote label</label>
        <input value={form.quote_label || ''} onChange={(e) => set('quote_label', e.target.value)} />
      </div>

      <h2 className="admin-panel__heading">Contact Section</h2>
      <div className="admin-field">
        <label className="admin-field__label">Heading</label>
        <input value={form.contact_heading || ''} onChange={(e) => set('contact_heading', e.target.value)} />
      </div>
      <div className="admin-field">
        <label className="admin-field__label">Intro text</label>
        <textarea rows={2} value={form.contact_intro || ''} onChange={(e) => set('contact_intro', e.target.value)} />
      </div>

      <div className="admin-panel__actions">
        <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
        {savedAt && <span className="admin-panel__saved">Saved</span>}
      </div>
    </form>
  );
}
