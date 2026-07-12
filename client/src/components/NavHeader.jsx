import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './NavHeader.css';

const LINKS = [
  { key: 'home', label: 'Ballina', to: '/' },
  { key: 'categories', label: 'Ambientet', to: '/categories' },
  { key: 'gallery', label: 'Galeria', to: '/gallery' },
  { key: 'about', label: 'Rreth Nesh', to: '/about' },
  { key: 'contact', label: 'Na Kontaktoni', to: '/contact' },
];

function activeKeyFor(pathname) {
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/rooms')) return 'categories';
  const match = LINKS.find((l) => l.to !== '/' && pathname.startsWith(l.to));
  return match ? match.key : '';
}

export default function NavHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const active = activeKeyFor(pathname);

  return (
    <div className="nav-header">
      <div className="nav-header__bar">
        <Link to="/" className="nav-header__brand" onClick={() => setMenuOpen(false)}>
          <img src="/logo-mark.png" alt="" className="nav-header__mark" />
          <div className="nav-header__wordmark">
            <span className="nav-header__eyebrow">FABRIKA E MOBILEVE</span>
            <span className="nav-header__name">MAMAJ</span>
          </div>
        </Link>
        <button
          type="button"
          className="nav-header__toggle"
          aria-label="Menyja"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <div className={`nav-header__menu ${menuOpen ? 'is-open' : ''}`}>
          <nav>
            {LINKS.map((link) => (
              <Link
                key={link.key}
                to={link.to}
                className={`nav-header__link ${active === link.key ? 'is-active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
