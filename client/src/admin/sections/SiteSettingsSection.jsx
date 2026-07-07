import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import ImageUploadField from '../ImageUploadField.jsx';

const FIELDS = [
  ['phone', 'Phone'],
  ['whatsapp', 'WhatsApp'],
  ['email', 'Email'],
  ['address', 'Address'],
  ['facebook', 'Facebook'],
  ['instagram', 'Instagram'],
  ['business_hours', 'Business Hours'],
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

  if (!form) return <p>Loading…</p>;

  return (
    <form className="admin-panel" onSubmit={handleSave}>
      <h2 className="admin-panel__heading">Site Settings</h2>
      <ImageUploadField label="Logo" value={form.logo_url} onChange={(url) => set('logo_url', url)} />
      {FIELDS.map(([key, label]) => (
        <div className="admin-field" key={key}>
          <label className="admin-field__label">{label}</label>
          <input value={form[key] || ''} onChange={(e) => set(key, e.target.value)} />
        </div>
      ))}
      <div className="admin-panel__actions">
        <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
        {savedAt && <span className="admin-panel__saved">Saved</span>}
      </div>
    </form>
  );
}
