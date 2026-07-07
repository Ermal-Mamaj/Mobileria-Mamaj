import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import ImageUploadField from '../ImageUploadField.jsx';

const FIELDS = [
  ['phone', 'Telefoni'],
  ['whatsapp', 'WhatsApp'],
  ['email', 'Email'],
  ['address', 'Adresa'],
  ['facebook', 'Facebook'],
  ['instagram', 'Instagram'],
  ['business_hours', 'Orari i Punës'],
];

export default function SiteSettingsSection() {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    api.get('/site-settings').then(setForm);
  }, []);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const saved = await api.put('/site-settings', form);
      setForm(saved);
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  }

  if (!form) return <p>Po ngarkohet...</p>;

  return (
    <form className="admin-panel" onSubmit={handleSave}>
      <h2 className="admin-panel__heading">Cilësimet e Faqes</h2>
      <ImageUploadField label="Logoja" value={form.logo_url} onChange={(url) => set('logo_url', url)} />
      {FIELDS.map(([key, label]) => (
        <div className="admin-field" key={key}>
          <label className="admin-field__label">{label}</label>
          <input value={form[key] || ''} onChange={(e) => set(key, e.target.value)} />
        </div>
      ))}
      <div className="admin-panel__actions">
        <button type="submit" disabled={saving}>{saving ? 'Po ruhen ndryshimet...' : 'Ruaj Ndryshimet'}</button>
        {savedAt && <span className="admin-panel__saved">U ruajt me sukses</span>}
      </div>
    </form>
  );
}
