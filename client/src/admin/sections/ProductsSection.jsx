import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.js';
import ProductsPanel from './ProductsPanel.jsx';

export default function ProductsSection() {
  const [categories, setCategories] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  function reload() {
    api.get('/categories').then((cats) => {
      setCategories(cats);
      if (selectedId === null && cats.length > 0) setSelectedId(cats[0].id);
      if (selectedId !== null && !cats.find((c) => c.id === selectedId)) {
        setSelectedId(cats.length > 0 ? cats[0].id : null);
      }
    });
  }

  useEffect(reload, []);

  if (!categories) return <p>Po ngarkohet...</p>;

  const selected = categories.find((c) => c.id === selectedId) || categories[0];

  return (
    <div className="admin-panel">
      <h2 className="admin-panel__heading">Produkte</h2>
      <p className="admin-panel__description">
        Zgjidhni një koleksion për të parë dhe ndryshuar produktet e tij. Për të shtuar ose fshirë vetë
        koleksionet (dhomat), shkoni te <Link to="/mamaj-cms/collections" className="admin-inline-link">faqja Koleksionet</Link>.
      </p>

      {categories.length === 0 ? (
        <p className="prod-empty-state">
          Nuk ka ende asnjë koleksion. Krijoni njërin te{' '}
          <Link to="/mamaj-cms/collections" className="admin-inline-link">Koleksionet</Link> fillimisht.
        </p>
      ) : (
        <>
          <div className="admin-room-tabs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`admin-room-tab ${cat.id === selected?.id ? 'is-active' : ''}`}
                onClick={() => setSelectedId(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {selected && <ProductsPanel key={selected.id} category={selected} />}
        </>
      )}
    </div>
  );
}
