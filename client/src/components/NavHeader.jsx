import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './NavHeader.css';

const LINKS = [
  { key: 'home', label: 'Home', to: '/' },
  { key: 'categories', label: 'Categories', to: '/categories' },
  { key: 'gallery', label: 'Gallery', to: '/gallery' },
  { key: 'about', label: 'About', to: '/about' },
  { key: 'contact', label: 'Contact', to: '/contact' },
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
          <svg width="34" height="31" viewBox="0 0 40 36" fill="none" stroke="#EBC84C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="12.5" y="3.5" width="15" height="15" rx="2.5" />
            <path d="M16.5 14.5 v-6 l3.5 3.5 3.5-3.5 v6" />
            <path d="M12.5 9 h-4 a3 3 0 0 0-3 3 v8" />
            <path d="M27.5 9 h4 a3 3 0 0 1 3 3 v8" />
            <rect x="5.5" y="18.5" width="29" height="6" rx="2" />
            <path d="M8.5 24.5 v6 M31.5 24.5 v6 M13.5 24.5 v3.5 M26.5 24.5 v3.5" />
          </svg>
          <div className="nav-header__wordmark">
            <span className="nav-header__eyebrow">FABRIKA E MOBILEVE</span>
            <span className="nav-header__name">MAMAJ</span>
          </div>
        </Link>
        <button
          type="button"
          className="nav-header__toggle"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        {menuOpen && (
          <div className="nav-header__menu">
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
        )}
      </div>
    </div>
  );
}
