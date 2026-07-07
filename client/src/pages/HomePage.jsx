import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import NavHeader from '../components/NavHeader.jsx';
import Footer from '../components/Footer.jsx';
import ImageSlot from '../components/ImageSlot.jsx';
import { useApiGet } from '../lib/hooks.js';
import './HomePage.css';

export default function HomePage() {
  const { data: home } = useApiGet('/content/home', {});
  const { data: categories } = useApiGet('/categories', []);
  const { data: featured } = useApiGet('/products?featured=1', []);
  const collectionsRef = useRef(null);
  const [sent, setSent] = useState(false);

  const headlineLines = (home.hero_headline || '').split('\n');

  function handleSubmit(e) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="home-page app-shell">
      <NavHeader />

      <div className="home-page__hero">
        <ImageSlot src={home.hero_image_url} placeholder="Photo" dark className="home-page__hero-image" />
        <div className="home-page__hero-gradient" />
        <div className="home-page__hero-copy">
          <div className="eyebrow eyebrow--gold">
            <span className="eyebrow__rule" />
            <span>{home.hero_eyebrow || 'HANDCRAFTED FURNITURE'}</span>
          </div>
          <h1 className="home-page__hero-headline">
            {headlineLines.map((line, i) => (
              <span key={i}>
                {line}
                {i < headlineLines.length - 1 && <br />}
              </span>
            ))}
          </h1>
          <button
            type="button"
            className="btn-gold"
            onClick={() => collectionsRef.current?.scrollIntoView({ behavior: 'smooth' })}
          >
            {home.hero_cta || 'Explore Collections'}
          </button>
        </div>
      </div>

      <section className="home-page__section" ref={collectionsRef}>
        <div className="eyebrow eyebrow--muted">
          <span className="eyebrow__rule" />
          <span>COLLECTIONS</span>
        </div>
        <div className="section-heading-row">
          <h2 className="section-heading">Shop by Room</h2>
          <Link to="/categories" className="see-all-link">View all →</Link>
        </div>

        <div className="category-grid">
          {categories.slice(0, 4).map((cat) => (
            <Link key={cat.id} to={`/rooms/${cat.slug}`} className="category-card">
              <div className="category-card__image">
                <ImageSlot src={cat.hero_image_url} placeholder="Photo" />
              </div>
              <div className="category-card__body">
                <h3 className="category-card__name">{cat.name}</h3>
                <p className="category-card__tagline">{cat.tagline}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="brand-band">
        <div className="brand-band__quote-mark">&ldquo;</div>
        <div className="brand-band__content">
          <p className="brand-band__text">{home.quote_text}</p>
          <div className="eyebrow eyebrow--gold">
            <span className="eyebrow__rule" />
            <span>{home.quote_label}</span>
          </div>
        </div>
      </div>

      <section className="home-page__section home-page__section--tight">
        <div className="eyebrow eyebrow--muted">
          <span className="eyebrow__rule" />
          <span>JUST ARRIVED</span>
        </div>
        <div className="section-heading-row">
          <h2 className="section-heading">New Designs</h2>
          <Link to="/categories" className="see-all-link">View all →</Link>
        </div>
      </section>

      <div className="product-carousel">
        {featured.map((p) => (
          <Link key={p.id} to={`/rooms/${p.category_slug}`} className="product-card">
            <div className="product-card__image">
              <ImageSlot src={p.image_url} placeholder="Photo" />
              {p.badge && <span className="product-card__badge">{p.badge}</span>}
            </div>
            <div className="product-card__body">
              <h3 className="product-card__name">{p.name}</h3>
              <p className="product-card__material">{p.material}</p>
              <span className="btn-outline">VIEW</span>
            </div>
          </Link>
        ))}
      </div>

      <section id="contactForm" className="home-page__section">
        <div className="eyebrow eyebrow--muted">
          <span className="eyebrow__rule" />
          <span>GET IN TOUCH</span>
        </div>
        <h2 className="section-heading">{home.contact_heading || 'Have a project in mind?'}</h2>
        <p className="section-intro">{home.contact_intro}</p>

        {sent ? (
          <p className="contact-form__success">Thanks — we'll be in touch soon.</p>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit}>
            <input type="text" placeholder="Your Name" required />
            <input type="tel" placeholder="Phone Number" required />
            <textarea placeholder="Your Message" required />
            <button type="submit" className="btn-navy">SEND MESSAGE</button>
          </form>
        )}
      </section>

      <Footer />
    </div>
  );
}
