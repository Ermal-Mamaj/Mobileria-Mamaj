import { useRef, useState } from 'react';
import { uploadImage } from '../lib/api.js';

export default function ImageUploadField({ label, value, onChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <div className="admin-field">
      {label && <label className="admin-field__label">{label}</label>}
      <div className="admin-image-field">
        <div className="admin-image-field__preview">
          {value ? <img src={value} alt="" /> : <span>Nuk ka foto</span>}
        </div>
        <div className="admin-image-field__actions">
          <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}>
            {uploading ? 'Po ngarkohet...' : value ? 'Zëvendëso' : 'Ngarko'}
          </button>
          {value && (
            <button type="button" className="admin-btn-secondary" onClick={() => onChange(null)}>
              Hiq
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          hidden
          onChange={handleFile}
        />
      </div>
      {error && <p className="admin-field__error">{error}</p>}
    </div>
  );
}
