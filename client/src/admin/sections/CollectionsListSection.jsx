import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api.js';

export default function CollectionsListSection() {
  const [categories, setCategories] = useState(null);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const navigate = useNavigate();

  function reload() {
    api.get('/categories').then(setCategories);
  }

  useEffect(reload, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const created = await api.post('/categories', { name: newName });
      setNewName('');
      reload();
      // Jump straight into the new room so you can start adding products
      navigate(`/mamaj-cms/collections/${created.id}`);
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(e, cat) {
    e.stopPropagation();
    if (!confirm(`Fshij "${cat.name}" dhe të gjitha ${cat.product_count} produktet brenda? Ky veprim nuk mund të zhbëhet.`)) return;
    await api.del(`/categories/${cat.id}`);
    reload();
  }

  if (!categories) return <p>Po ngarkohet...</p>;

  return (
    <div className="admin-panel">
      <h2 className="admin-panel__heading">Koleksionet</h2>
      <p className="admin-panel__description">
        Krijoni ose fshini koleksionet (dhomat) e faqes. Klikoni një rresht për t'i parë detajet dhe produktet e tij.
      </p>

      <form className="col-add-form" onSubmit={handleAdd}>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Emri i koleksionit të ri (p.sh. Dhoma e Fëmijëve)"
          className="col-add-form__input"
        />
        <button type="submit" className="col-add-form__btn" disabled={adding || !newName.trim()}>
          {adding ? 'Duke shtuar...' : '+ Shto Koleksion'}
        </button>
      </form>

      {categories.length === 0 ? (
        <p className="prod-empty-state">Nuk ka ende asnjë koleksion. Shtoni njërin më sipër.</p>
      ) : (
        <div className="col-list">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="col-row"
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/mamaj-cms/collections/${cat.id}`)}
              onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/mamaj-cms/collections/${cat.id}`); }}
            >
              <div className="col-row__thumb">
                {cat.hero_image_url
                  ? <img src={cat.hero_image_url} alt="" />
                  : <span className="col-row__thumb-empty">🏠</span>
                }
              </div>
              <div className="col-row__info">
                <span className="col-row__name">{cat.name}</span>
                <span className="col-row__meta">{cat.product_count} produkte</span>
              </div>
              <span className="col-row__chevron">›</span>
              <button
                type="button"
                className="col-row__delete"
                onClick={(e) => handleDelete(e, cat)}
                title="Fshi koleksionin"
                aria-label={`Fshi ${cat.name}`}
              >
                🗑
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
