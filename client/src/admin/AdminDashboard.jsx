import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './AdminAuth.jsx';
import AdminLayout from './AdminLayout.jsx';
import HomeSection from './sections/HomeSection.jsx';
import CategoriesSection from './sections/CategoriesSection.jsx';
import GallerySection from './sections/GallerySection.jsx';
import AboutSection from './sections/AboutSection.jsx';
import SiteSettingsSection from './sections/SiteSettingsSection.jsx';
import './admin.css';

function Protected() {
  const { checked, loggedIn } = useAdminAuth();

  if (!checked) return null;
  if (!loggedIn) return <Navigate to="/mamaj-cms/login" replace />;

  return (
    <AdminLayout>
      <Routes>
        <Route index element={<HomeSection />} />
        <Route path="categories" element={<CategoriesSection />} />
        <Route path="gallery" element={<GallerySection />} />
        <Route path="about" element={<AboutSection />} />
        <Route path="settings" element={<SiteSettingsSection />} />
      </Routes>
    </AdminLayout>
  );
}

export default function AdminDashboard() {
  return (
    <AdminAuthProvider>
      <Protected />
    </AdminAuthProvider>
  );
}
