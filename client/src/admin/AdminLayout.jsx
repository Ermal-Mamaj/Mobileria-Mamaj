import { NavLink } from 'react-router-dom';
import { useAdminAuth } from './AdminAuth.jsx';

const TABS = [
  { to: '/admin', label: 'Home Page', end: true },
  { to: '/admin/categories', label: 'Categories & Products' },
  { to: '/admin/gallery', label: 'Gallery' },
  { to: '/admin/about', label: 'About Us' },
  { to: '/admin/settings', label: 'Site Settings' },
];

export default function AdminLayout({ children }) {
  const { username, logout } = useAdminAuth();

  return (
    <div className="admin-layout">
      <header className="admin-layout__header">
        <div>
          <h1 className="admin-layout__title">MAMAJ Admin</h1>
          <p className="admin-layout__username">Signed in as {username}</p>
        </div>
        <button type="button" className="admin-btn-secondary" onClick={logout}>Log out</button>
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
