import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Logo from './Logo';
import { NAV_LINKS } from '../general/constants';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

export default function Header() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggle);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // «Профиль» показываем только авторизованным
  const links = user ? NAV_LINKS : NAV_LINKS.filter((l) => l.to !== '/profile');
  const { pathname } = useLocation();

  // Закрываем мобильное меню при переходе на другую страницу
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  /* ------------------------------------------------------------
     Режим администратора: только «Админ-панель» и «Выход»,
     логотип некликабелен, обычная навигация скрыта
  ------------------------------------------------------------ */
  if (user?.is_admin) {
    return (
      <motion.header
        className="header"
        initial={{ y: -32, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <nav className="nav glass">
          <Logo interactive={false} />
          <div className="nav-auth">
            <NavLink to="/admin" className="nav-login nav-admin">
              Админ-панель
            </NavLink>
            <button type="button" className="btn btn-primary" onClick={handleLogout}>
              Выход
            </button>
          </div>
        </nav>
      </motion.header>
    );
  }

  /* ------------------------------------------------------------
     Обычный режим
  ------------------------------------------------------------ */
  return (
    <motion.header
      className="header"
      initial={{ y: -32, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <nav className="nav glass">
        <Logo />

        <ul className="nav-links">
          {links.map(({ to, label }) => (
            <li key={to}>
              <NavLink to={to} className={({ isActive }) => (isActive ? 'active' : undefined)}>
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="nav-auth">
          {!user && (
            <Link to="/login" className="nav-login">
              Вход
            </Link>
          )}
          <Link to="/booking" className="btn btn-primary">
            Записаться
          </Link>
          <button
            type="button"
            className="burger"
            aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className={menuOpen ? 'open' : ''} />
          </button>
        </div>
      </nav>

      {/* Мобильное меню */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-menu glass"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <ul>
              {links.map(({ to, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={({ isActive }) => (isActive ? 'active' : undefined)}
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
              {!user && (
                <li>
                  <NavLink to="/login">Вход</NavLink>
                </li>
              )}
              <li className="mobile-theme">
                <button type="button" onClick={toggleTheme}>
                  {theme === 'dark' ? '☀️ Светлая тема' : '🌙 Тёмная тема'}
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
