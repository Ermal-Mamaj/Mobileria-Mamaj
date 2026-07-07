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

  if (!form) return <p>Po ngarkohet...</p>;

  return (
    <form className="admin-panel" onSubmit={handleSave}>
      <h2 className="admin-panel__heading">Rreth Nesh – Historia Jonë</h2>
      <ImageUploadField label="Imazhi Kryesor" value={form.hero_image_url} onChange={(url) => set('hero_image_url', url)} />
      <div className="admin-field">
        <label className="admin-field__label">Paragrafi i Parë</label>
        <textarea rows={3} value={form.paragraph_1 || ''} onChange={(e) => set('paragraph_1', e.target.value)} />
      </div>
      <div className="admin-field">
        <label className="admin-field__label">Paragrafi i Dytë</label>
        <textarea rows={3} value={form.paragraph_2 || ''} onChange={(e) => set('paragraph_2', e.target.value)} />
      </div>

      <h2 className="admin-panel__heading">Vlerat Tona</h2>
      {(form.values_json || []).map((v, i) => (
        <div className="admin-subcard" key={i}>
          <div className="admin-field">
            <label className="admin-field__label">Titulli</label>
            <input value={v.title || ''} onChange={(e) => setValue(i, 'title', e.target.value)} />
          </div>
          <div className="admin-field">
            <label className="admin-field__label">Përshkrimi</label>
            <input value={v.description || ''} onChange={(e) => setValue(i, 'description', e.target.value)} />
          </div>
          <button type="button" className="admin-btn-secondary" onClick={() => removeValue(i)}>Hiq</button>
        </div>
      ))}
      <button type="button" className="admin-btn-secondary" onClick={addValue}>+ Shto Vlerë</button>

      <h2 className="admin-panel__heading">Mesazhi Përmbyllës</h2>
      <div className="admin-field">
        <label className="admin-field__label">Teksti i Citatit</label>
        <textarea rows={2} value={form.quote_text || ''} onChange={(e) => set('quote_text', e.target.value)} />
      </div>
      <div className="admin-field">
        <label className="admin-field__label">Nënshkrimi</label>
        <input value={form.quote_author || ''} onChange={(e) => set('quote_author', e.target.value)} />
      </div>

      <div className="admin-panel__actions">
        <button type="submit" disabled={saving}>{saving ? 'Po ruhen ndryshimet...' : 'Ruaj Ndryshimet'}</button>
        {savedAt && <span className="admin-panel__saved">U ruajt me sukses</span>}
      </div>
    </form>
  );
}
