import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import ProductsPanel from './ProductsPanel.jsx';

// This tab used to manage a standalone "inspiration photos" gallery,
// unrelated to any product. That's gone now — every photo on the site
// belongs to a specific product in a specific room, so this is where that
// actually happens: pick the room, then add/edit its products and photos.
export default function GallerySection() {
  const [categories, setCategories] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    api.get('/categories').then((cats) => {
      setCategories(cats);
      if (cats.length > 0) setSelectedId(cats[0].id);
    });
  }, []);

  if (!categories) return <p>Po ngarkohet...</p>;

  if (categories.length === 0) {
    return (
      <div className="admin-panel">
        <h2 className="admin-panel__heading">Galeria</h2>
        <p className="admin-panel__description">
          Nuk ka ende asnjë koleksion. Krijoni një koleksion te skeda "Koleksionet" fillimisht — pastaj
          këtu do të mund të shtoni produktet dhe fotot e tij.
        </p>
      </div>
    );
  }

  const selected = categories.find((c) => c.id === selectedId) || categories[0];

  return (
    <div className="admin-panel">
      <h2 className="admin-panel__heading">Galeria</h2>
      <p className="admin-panel__description">
        Zgjidhni një koleksion për të shtuar ose ndryshuar produktet dhe fotot e tij. Çdo produkt mund
        të ketë disa foto.
      </p>

      <div className="admin-room-tabs">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`admin-room-tab ${cat.id === selected.id ? 'is-active' : ''}`}
            onClick={() => setSelectedId(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* key forces a clean remount per room, so switching tabs can't show a
          flash of the previous room's products while the new list loads. */}
      <ProductsPanel key={selected.id} category={selected} />
    </div>
  );
}
