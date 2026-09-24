import { NavLink } from 'react-router-dom';
import { useAdminAuth } from './AdminAuth.jsx';

const TABS = [
  { to: '/mamaj-cms', label: 'Paneli', icon: '📊', end: true },
  { to: '/mamaj-cms/products', label: 'Produkte', icon: '📦' },
  { to: '/mamaj-cms/pages', label: 'Faqet', icon: '📄' },
  { to: '/mamaj-cms/messages', label: 'Mesazhet', icon: '📬' },
  { to: '/mamaj-cms/settings', label: 'Cilësimet', icon: '⚙️' },
];

export default function AdminLayout({ children }) {
  const { username, logout } = useAdminAuth();

  return (
    <div className="admin-layout">
      {/* Sidebar — visible on desktop, collapses to a top bar on mobile */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <h1 className="admin-sidebar__title">MAMAJ</h1>
          <span className="admin-sidebar__subtitle">CMS</span>
        </div>

        <nav className="admin-sidebar__nav">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) => `admin-nav-item ${isActive ? 'is-active' : ''}`}
            >
              <span className="admin-nav-item__icon">{tab.icon}</span>
              <span className="admin-nav-item__label">{tab.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__user">
            <span className="admin-sidebar__avatar">{(username || 'A')[0].toUpperCase()}</span>
            <span className="admin-sidebar__username">{username}</span>
          </div>
          <button type="button" className="admin-sidebar__logout" onClick={logout}>Dil</button>
        </div>
      </aside>

      {/* Mobile top bar — hidden on desktop where sidebar takes over */}
      <header className="admin-topbar">
        <h1 className="admin-topbar__title">MAMAJ CMS</h1>
        <div className="admin-topbar__right">
          <span className="admin-topbar__user">{username}</span>
          <button type="button" className="admin-btn-secondary admin-btn--sm" onClick={logout}>Dil</button>
        </div>
      </header>

      {/* Mobile horizontal tabs */}
      <nav className="admin-mobile-tabs">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) => `admin-layout__tab ${isActive ? 'is-active' : ''}`}
          >
            <span className="admin-tab-icon">{tab.icon}</span>
            <span className="admin-tab-label">{tab.label}</span>
          </NavLink>
        ))}
      </nav>

      <main className="admin-main">{children}</main>
    </div>
  );
}
