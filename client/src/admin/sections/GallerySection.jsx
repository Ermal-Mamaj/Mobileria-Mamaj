import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import ImageUploadField from '../ImageUploadField.jsx';

export default function GallerySection() {
  const [images, setImages] = useState(null);

  function reload() {
    api.get('/gallery').then(setImages);
  }

  useEffect(reload, []);

  async function addImage() {
    await api.post('/gallery', { caption: '' });
    reload();
  }

  async function updateImage(id, patch) {
    const updated = await api.put(`/gallery/${id}`, patch);
    setImages((imgs) => imgs.map((img) => (img.id === id ? updated : img)));
  }

  async function removeImage(id) {
    await api.del(`/gallery/${id}`);
    setImages((imgs) => imgs.filter((img) => img.id !== id));
  }

  if (!images) return <p>Po ngarkohet...</p>;

  return (
    <div className="admin-panel">
      <h2 className="admin-panel__heading">Galeria</h2>
      {images.map((img) => (
        <div className="admin-subcard" key={img.id}>
          <ImageUploadField value={img.image_url} onChange={(url) => updateImage(img.id, { image_url: url })} />
          <div className="admin-field">
            <label className="admin-field__label">Përshkrimi i Fotos</label>
            <input
              value={img.caption || ''}
              onChange={(e) => setImages((imgs) => imgs.map((i) => (i.id === img.id ? { ...i, caption: e.target.value } : i)))}
              onBlur={(e) => updateImage(img.id, { caption: e.target.value })}
            />
          </div>
          <button type="button" className="admin-btn-secondary" onClick={() => removeImage(img.id)}>Hiq</button>
        </div>
      ))}
      <button type="button" className="admin-btn-secondary" onClick={addImage}>+ Shto Foto</button>
    </div>
  );
}
