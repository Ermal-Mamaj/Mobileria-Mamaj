import { useState } from 'react';
import HomeSection from './HomeSection.jsx';
import AboutSection from './AboutSection.jsx';

const PAGES = [
  { key: 'home', label: 'Ballina' },
  { key: 'about', label: 'Rreth Nesh' },
];

export default function PagesSection() {
  const [active, setActive] = useState('home');

  return (
    <div className="admin-panel">
      <h2 className="admin-panel__heading">Përmbajtja e Faqeve</h2>
      <p className="admin-panel__description">
        Ndryshoni tekstin, imazhet dhe seksionet e faqeve publike të webfaqes.
      </p>

      <div className="admin-room-tabs">
        {PAGES.map((p) => (
          <button
            key={p.key}
            type="button"
            className={`admin-room-tab ${active === p.key ? 'is-active' : ''}`}
            onClick={() => setActive(p.key)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {active === 'home' && <HomeSection />}
      {active === 'about' && <AboutSection />}
    </div>
  );
}
