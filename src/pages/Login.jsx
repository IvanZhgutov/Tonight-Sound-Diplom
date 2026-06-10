import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import { useAuthStore } from '../store/authStore';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function Login() {
  useDocumentTitle('Вход');

  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const location = useLocation();

  // куда вернуть после входа (например, обратно на /booking)
  const from = location.state?.from ?? '/profile';
  const cameFromBooking = location.state?.reason === 'booking';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      return setError('Заполни email и пароль');
    }
    const result = login(email.trim(), password);
    if (!result.ok) return setError(result.error);
    navigate(result.isAdmin ? '/admin' : from, { replace: true });
  };

  return (
    <PageTransition>
      <main className="auth-wrap">
        <motion.section
          className="glass auth-card"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1>С возвращением</h1>
          <p>
            {cameFromBooking
              ? 'Войди, чтобы сохранить запись в личном кабинете'
              : 'Войди, чтобы управлять своими записями'}
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
              />
            </div>
            <div className="field">
              <label htmlFor="password">Пароль</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
              />
            </div>

            <div className="auth-extra">
              <label className="checkbox">
                <input type="checkbox" name="remember" defaultChecked />
                Запомнить меня
              </label>
              <a href="#" onClick={(e) => e.preventDefault()}>Забыли пароль?</a>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  className="form-error"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button type="submit" className="btn btn-primary">Войти</button>
          </form>

          <p className="auth-switch">
            Нет аккаунта?{' '}
            <Link to="/register" state={location.state}>Зарегистрироваться</Link>
          </p>
        </motion.section>
      </main>
    </PageTransition>
  );
}
