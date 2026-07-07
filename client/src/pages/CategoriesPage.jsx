import { Link } from 'react-router-dom';
import NavHeader from '../components/NavHeader.jsx';
import Footer from '../components/Footer.jsx';
import ImageSlot from '../components/ImageSlot.jsx';
import { useApiGet } from '../lib/hooks.js';

export default function CategoriesPage() {
  const { data: categories } = useApiGet('/categories', []);

  return (
    <div className="app-shell">
      <NavHeader />
      <div className="page-body">
        <div className="eyebrow eyebrow--muted">
          <span className="eyebrow__rule" />
          <span>KOLEKSIONET</span>
        </div>
        <h1 className="section-heading" style={{ marginBottom: 6 }}>Ambientet</h1>
        <p className="section-intro">Shfletoni mobiliet sipas ambientit.</p>

        <div className="category-grid">
          {categories.map((cat) => (
            <Link key={cat.id} to={`/rooms/${cat.slug}`} className="category-card">
              <div className="category-card__image">
                <ImageSlot src={cat.hero_image_url} placeholder="Foto" />
              </div>
              <div className="category-card__body">
                <h3 className="category-card__name">{cat.name}</h3>
                <p className="category-card__tagline">{cat.tagline}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
