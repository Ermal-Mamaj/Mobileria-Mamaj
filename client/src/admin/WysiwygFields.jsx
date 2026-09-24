import { useEffect, useRef, useState } from 'react';
import { uploadImage } from '../lib/blobUpload.js';

// Inline-editable text that visually matches whatever heading/paragraph
// style it sits inside — no border or background until you interact with
// it, so the page reads exactly like the real site until you go looking
// for what's editable. Saves on blur, same pattern as the rest of the CMS.
export function EditableText({ value, onSave, placeholder, className = '', as = 'input', rows }) {
  const [local, setLocal] = useState(value || '');
  const inputRef = useRef(null);

  // Re-sync if the saved value changes from outside (e.g. after the parent
  // reloads), but never while this field is actively focused — that would
  // wipe out what's being typed.
  useEffect(() => {
    if (document.activeElement !== inputRef.current) setLocal(value || '');
  }, [value]);

  function handleBlur() {
    if (local !== (value || '')) onSave(local);
  }

  const Tag = as === 'textarea' ? 'textarea' : 'input';

  return (
    <Tag
      ref={inputRef}
      className={`wysiwyg-field ${className}`}
      value={local}
      placeholder={placeholder}
      rows={as === 'textarea' ? rows || 2 : undefined}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={handleBlur}
    />
  );
}

// Click-to-replace image, shown exactly as it'll appear on the site (same
// object-fit/sizing via the passed className) with a hover overlay
// prompting the edit, instead of a separate boxy uploader UI off to the side.
export function EditableImage({ value, onSave, className = '', dark = false, placeholder = 'Kliko për të ngarkuar foto' }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onSave(url);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <div className={`wysiwyg-image ${className} ${dark ? 'wysiwyg-image--dark' : ''}`} onClick={() => inputRef.current?.click()}>
      {value
        ? <img src={value} alt="" className="wysiwyg-image__img" />
        : <div className="wysiwyg-image__empty">{placeholder}</div>
      }
      <div className="wysiwyg-image__overlay">
        {uploading ? 'Po ngarkohet...' : '📷 Ndrysho Foton'}
      </div>
      {!uploading && <div className="wysiwyg-image__badge">✏️ Editabël</div>}
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={handleFile} />
    </div>
  );
}
