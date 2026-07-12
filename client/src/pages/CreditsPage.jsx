import NavHeader from '../components/NavHeader.jsx';
import Footer from '../components/Footer.jsx';
import { IMAGE_CREDITS } from '../data/imageCredits.js';
import './CreditsPage.css';

export default function CreditsPage() {
  return (
    <div className="credits-page app-shell">
      <NavHeader />

      <section className="credits-page__section">
        <div className="eyebrow">
          <span className="eyebrow__rule" />
          <span>MAMAJ</span>
        </div>
        <h1 className="section-heading" style={{ marginBottom: 6 }}>Kreditë e Fotove</h1>
        <p className="section-intro">
          Disa foto ilustruese në këtë faqe janë me licencë Creative Commons dhe
          kërkojnë kreditim. Ato do të zëvendësohen me foto reale të mobilieve MAMAJ.
        </p>

        <ul className="credits-list">
          {IMAGE_CREDITS.map((c) => (
            <li className="credits-list__item" key={c.source}>
              <a href={c.source} target="_blank" rel="noopener noreferrer">{c.title}</a>
              <span className="credits-list__meta">
                {' '}nga {c.creator} · licencë{' '}
                <a href={c.licenseUrl} target="_blank" rel="noopener noreferrer">{c.license}</a>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <Footer />
    </div>
  );
}
