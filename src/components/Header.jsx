import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Logo from './Logo';
import { NAV_LINKS } from '../general/constants';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

/* ---------- Иконки ---------- */
function SunIcon() {
  return (
    <svg width={24} height={24} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width={24} height={24} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
    </svg>
  );
}

/* ---------- Переключатель темы (пункт меню) ---------- */
function ThemeMenuItem({ theme, toggleTheme }) {
  const dark = theme === 'dark';
  return (
    <li className="mobile-theme">
      <button type="button" onClick={toggleTheme}>
        {dark ? <SunIcon /> : <MoonIcon />}
        <p>{dark ? 'Светлая тема' : 'Тёмная тема'}</p>
      </button>
    </li>
  );
}

export default function Header() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggle);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  // «Профиль» показываем только авторизованным
  const links = user ? NAV_LINKS : NAV_LINKS.filter((l) => l.to !== '/profile');

  // Закрываем мобильное меню при переходе на другую страницу
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    navigate('/', { replace: true });
    await logout();
  };

  /* ------------------------------------------------------------
     Режим администратора
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

          {/* Десктоп: кнопки напрямую */}
          <div className="nav-auth">
            <NavLink to="/admin" className="nav-login nav-admin">
              Админ-панель
            </NavLink>
            <button type="button" className="btn btn-primary admin-logout-desktop" onClick={handleLogout}>
              Выход
            </button>

            {/* Бургер — только на мобиле */}
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

        {/* Мобильное меню администратора */}
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
                <li>
                  <NavLink to="/admin" className={({ isActive }) => isActive ? 'active' : undefined}>
                    Админ-панель
                  </NavLink>
                </li>
                <li className="mobile-theme mobile-logout">
                  <button type="button" onClick={handleLogout}>
                    <LogoutIcon />
                    <p>Выйти</p>
                  </button>
                </li>
                <ThemeMenuItem theme={theme} toggleTheme={toggleTheme} />
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
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
              <ThemeMenuItem theme={theme} toggleTheme={toggleTheme} />
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function LogoutIcon() {
  return (
    <svg width={24} height={24} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
    </svg>
  );
}
