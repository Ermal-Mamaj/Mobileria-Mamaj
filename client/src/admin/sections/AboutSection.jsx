import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import ImageUploadField from '../ImageUploadField.jsx';

export default function AboutSection() {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    api.get('/content/about').then(setForm);
  }, []);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function setValue(index, field, value) {
    setForm((f) => {
      const values = [...(f.values_json || [])];
      values[index] = { ...values[index], [field]: value };
      return { ...f, values_json: values };
    });
  }

  function addValue() {
    setForm((f) => ({ ...f, values_json: [...(f.values_json || []), { title: '', description: '' }] }));
  }

  function removeValue(index) {
    setForm((f) => ({ ...f, values_json: (f.values_json || []).filter((_, i) => i !== index) }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const saved = await api.put('/content/about', form);
      setForm(saved);
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  }

  if (!form) return <p>Loading…</p>;

  return (
    <form className="admin-panel" onSubmit={handleSave}>
      <h2 className="admin-panel__heading">About Us — Story</h2>
      <ImageUploadField label="Hero image" value={form.hero_image_url} onChange={(url) => set('hero_image_url', url)} />
      <div className="admin-field">
        <label className="admin-field__label">Paragraph 1</label>
        <textarea rows={3} value={form.paragraph_1 || ''} onChange={(e) => set('paragraph_1', e.target.value)} />
      </div>
      <div className="admin-field">
        <label className="admin-field__label">Paragraph 2</label>
        <textarea rows={3} value={form.paragraph_2 || ''} onChange={(e) => set('paragraph_2', e.target.value)} />
      </div>

      <h2 className="admin-panel__heading">What We Value</h2>
      {(form.values_json || []).map((v, i) => (
        <div className="admin-subcard" key={i}>
          <div className="admin-field">
            <label className="admin-field__label">Title</label>
            <input value={v.title || ''} onChange={(e) => setValue(i, 'title', e.target.value)} />
          </div>
          <div className="admin-field">
            <label className="admin-field__label">Description</label>
            <input value={v.description || ''} onChange={(e) => setValue(i, 'description', e.target.value)} />
          </div>
          <button type="button" className="admin-btn-secondary" onClick={() => removeValue(i)}>Remove</button>
        </div>
      ))}
      <button type="button" className="admin-btn-secondary" onClick={addValue}>+ Add Value</button>

      <h2 className="admin-panel__heading">Closing Quote</h2>
      <div className="admin-field">
        <label className="admin-field__label">Quote text</label>
        <textarea rows={2} value={form.quote_text || ''} onChange={(e) => set('quote_text', e.target.value)} />
      </div>
      <div className="admin-field">
        <label className="admin-field__label">Attribution</label>
        <input value={form.quote_author || ''} onChange={(e) => set('quote_author', e.target.value)} />
      </div>

      <div className="admin-panel__actions">
        <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
        {savedAt && <span className="admin-panel__saved">Saved</span>}
      </div>
    </form>
  );
}
