import { useRef, useState } from 'react';
import { uploadImage } from '../lib/blobUpload.js';

// Select several photos at once instead of one at a time — each upload
// still goes through the same compression pipeline as a single upload,
// they just queue up. Uploads run one at a time (not in parallel) so a
// slow connection doesn't choke on five simultaneous uploads at once.
export default function BulkImageUploadField({ onUploaded, label = '+ Shto Foto (mund të zgjidhni disa njëherësh)' }) {
  const inputRef = useRef(null);
  const [progress, setProgress] = useState(null); // { done, total } | null
  const [error, setError] = useState('');

  async function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setError('');
    setProgress({ done: 0, total: files.length });

    for (let i = 0; i < files.length; i++) {
      try {
        const url = await uploadImage(files[i]);
        await onUploaded(url);
      } catch (err) {
        setError(`"${files[i].name}": ${err.message}`);
        // Keep going with the rest rather than abandoning the whole batch
        // over one bad file.
      }
      setProgress({ done: i + 1, total: files.length });
    }

    setProgress(null);
    e.target.value = '';
  }

  return (
    <div className="bulk-upload">
      <button
        type="button"
        className="bulk-upload__btn"
        onClick={() => inputRef.current?.click()}
        disabled={!!progress}
      >
        {progress ? `Po ngarkohen (${progress.done}/${progress.total})...` : label}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        hidden
        onChange={handleFiles}
      />
      {error && <p className="admin-field__error">{error}</p>}
    </div>
  );
}
