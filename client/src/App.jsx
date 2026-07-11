import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import CategoriesPage from './pages/CategoriesPage.jsx';
import RoomPage from './pages/RoomPage.jsx';
import GalleryPage from './pages/GalleryPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import AdminLogin from './admin/AdminLogin.jsx';
import AdminDashboard from './admin/AdminDashboard.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/rooms/:slug" element={<RoomPage />} />
      <Route path="/gallery" element={<GalleryPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/mamaj-cms/login" element={<AdminLogin />} />
      <Route path="/mamaj-cms/*" element={<AdminDashboard />} />
    </Routes>
  );
}

export default App;
