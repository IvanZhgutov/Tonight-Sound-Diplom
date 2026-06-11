import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import ThemeToggle from './components/ThemeToggle';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Booking from './pages/Booking';
import Plugins from './pages/Plugins';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminLayout from './pages/admin/AdminLayout';
import Requests from './pages/admin/Requests';
import Clients from './pages/admin/Clients';
import ClientCard from './pages/admin/ClientCard';
import Analytics from './pages/admin/Analytics';
import Catalog from './pages/admin/Catalog';

export default function App() {
  const location = useLocation();
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const isAdmin = useAuthStore((s) => Boolean(s.user?.is_admin));
  const theme = useThemeStore((s) => s.theme);

  // Тема через data-атрибут на <html> — CSS-переменные переключаются сами
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Проверяем сессию по токену при старте приложения
  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return (
    <>
      <div className="cosmos" aria-hidden="true" />
      <ThemeToggle />
      <ScrollToTop />
      <Header />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Режим администратора: обычный сайт недоступен,
              любой адрес ведёт в CRM */}
          {isAdmin ? (
            <>
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<Requests />} />
                <Route path="clients" element={<Clients />} />
                <Route path="clients/:id" element={<ClientCard />} />
                <Route path="catalog" element={<Catalog />} />
                <Route path="analytics" element={<Analytics />} />
              </Route>
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Home />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/plugins" element={<Plugins />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Home />} />
            </>
          )}
        </Routes>
      </AnimatePresence>
    </>
  );
}
