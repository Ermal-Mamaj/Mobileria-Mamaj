import { NavLink } from 'react-router-dom';
import { useAdminAuth } from './AdminAuth.jsx';

const TABS = [
  { to: '/admin', label: 'Ballina', end: true },
  { to: '/admin/categories', label: 'Koleksionet' },
  { to: '/admin/gallery', label: 'Galeria' },
  { to: '/admin/about', label: 'Rreth Nesh' },
  { to: '/admin/settings', label: 'Cilësimet' },
];

export default function AdminLayout({ children }) {
  const { username, logout } = useAdminAuth();

  return (
    <div className="admin-layout">
      <header className="admin-layout__header">
        <div>
          <h1 className="admin-layout__title">Administrimi i MAMAJ</h1>
          <p className="admin-layout__username">I identifikuar si {username}</p>
        </div>
        <button type="button" className="admin-btn-secondary" onClick={logout}>Dil</button>
      </header>

      <nav className="admin-layout__tabs">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) => `admin-layout__tab ${isActive ? 'is-active' : ''}`}
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <main className="admin-layout__content">{children}</main>
    </div>
  );
}
