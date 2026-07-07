import { useState } from 'react';
import { useParams } from 'react-router-dom';
import NavHeader from '../components/NavHeader.jsx';
import Footer from '../components/Footer.jsx';
import ImageSlot from '../components/ImageSlot.jsx';
import { useApiGet } from '../lib/hooks.js';
import './RoomPage.css';

export default function RoomPage() {
  const { slug } = useParams();
  const { data: category } = useApiGet(`/categories/${slug}`, null);
  const { data: products } = useApiGet(`/products?category=${slug}`, []);
  const [selected, setSelected] = useState(null);

  return (
    <div className="app-shell">
      <NavHeader />

      <div className="page-hero">
        <ImageSlot src={category?.hero_image_url} placeholder="Photo" dark className="page-hero__image" />
        <div className="page-hero__gradient" />
        <div className="page-hero__copy">
          <div className="eyebrow eyebrow--gold" style={{ marginBottom: 8, fontSize: '9.5px', letterSpacing: '2px' }}>
            <span className="eyebrow__rule" style={{ width: 20 }} />
            <span>COLLECTION</span>
          </div>
          <h1 className="page-hero__title">{category?.name}</h1>
          <p className="page-hero__tagline">{category?.tagline}</p>
        </div>
      </div>

      <div className="room-product-grid">
        {products.map((p) => (
          <div key={p.id} className="room-product-card" onClick={() => setSelected(p)}>
            <div className="room-product-card__image">
              <ImageSlot src={p.image_url} placeholder="Photo" />
            </div>
            <div className="room-product-card__body">
              <h3 className="room-product-card__name">{p.name}</h3>
              <p className="room-product-card__material">{p.material}</p>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="room-modal-overlay" onClick={() => setSelected(null)}>
          <div className="room-modal" onClick={(e) => e.stopPropagation()}>
            <div className="room-modal__image">
              <ImageSlot src={selected.image_url} placeholder="Photo" dark />
              <button type="button" className="room-modal__close" onClick={() => setSelected(null)}>×</button>
            </div>
            <div className="room-modal__body">
              <div className="eyebrow eyebrow--muted" style={{ fontSize: '9.5px', letterSpacing: '2px' }}>
                <span className="eyebrow__rule" style={{ width: 18 }} />
                <span>MAMAJ</span>
              </div>
              <h2 className="room-modal__name">{selected.name}</h2>
              <p className="room-modal__description">
                Handcrafted from {selected.material}. Available made-to-order in a range of finishes — visit our showroom to see it in person.
              </p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
