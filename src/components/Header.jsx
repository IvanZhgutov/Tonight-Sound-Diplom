import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Logo from './Logo';
import { NAV_LINKS } from '../general/constants';
import { useAuthStore } from '../store/authStore';

export default function Header() {
  const user = useAuthStore((s) => s.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  // Закрываем мобильное меню при переходе на другую страницу
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const links = user?.isAdmin
    ? [...NAV_LINKS, { to: '/admin', label: 'Админка' }]
    : NAV_LINKS;

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
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
