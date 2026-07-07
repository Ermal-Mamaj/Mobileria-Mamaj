import NavHeader from '../components/NavHeader.jsx';
import Footer from '../components/Footer.jsx';
import ImageSlot from '../components/ImageSlot.jsx';
import { useApiGet } from '../lib/hooks.js';
import './GalleryPage.css';

const HEIGHTS = [200, 260, 260, 200, 220, 180];

export default function GalleryPage() {
  const { data: images } = useApiGet('/gallery', []);

  return (
    <div className="app-shell">
      <NavHeader />
      <div className="page-body">
        <div className="eyebrow eyebrow--muted">
          <span className="eyebrow__rule" />
          <span>MAMAJ</span>
        </div>
        <h1 className="section-heading" style={{ marginBottom: 6 }}>Galeria</h1>
        <p className="section-intro">Ambiente reale të mobiluara me mobilie MAMAJ.</p>

        <div className="gallery-grid">
          {images.map((img, i) => (
            <div key={img.id} className="gallery-item" style={{ height: HEIGHTS[i % HEIGHTS.length] }}>
              <ImageSlot src={img.image_url} placeholder={img.caption || `Foto ${i + 1}`} />
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
