import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import { useAuthStore } from '../store/authStore';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const MIN_PASSWORD_LENGTH = 8;

export default function Register() {
  useDocumentTitle('Регистрация');

  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from ?? '/profile';

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password2: '',
    agree: false,
  });
  const [error, setError] = useState('');

  const update = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim()) return setError('Укажи имя');
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return setError('Похоже, в email опечатка');
    if (!form.phone.trim()) return setError('Укажи телефон');
    if (form.password.length < MIN_PASSWORD_LENGTH)
      return setError(`Пароль должен быть не короче ${MIN_PASSWORD_LENGTH} символов`);
    if (form.password !== form.password2) return setError('Пароли не совпадают');
    if (!form.agree) return setError('Нужно согласиться с условиями обработки данных');

    const result = register({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password,
    });
    if (!result.ok) return setError(result.error);
    navigate(from, { replace: true });
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
          <h1>Создать аккаунт</h1>
          <p>Регистрируйся, чтобы записи сохранялись в личном кабинете</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="name">Имя</label>
              <input
                id="name"
                type="text"
                placeholder="Как к тебе обращаться"
                value={form.name}
                onChange={update('name')}
              />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={update('email')}
              />
            </div>
            <div className="field">
              <label htmlFor="phone">Телефон</label>
              <input
                id="phone"
                type="tel"
                placeholder="+7 (XXX)-XXX-XX-XX"
                value={form.phone}
                onChange={update('phone')}
              />
            </div>
            <div className="field">
              <label htmlFor="password">Пароль</label>
              <input
                id="password"
                type="password"
                placeholder={`Минимум ${MIN_PASSWORD_LENGTH} символов`}
                value={form.password}
                onChange={update('password')}
              />
            </div>
            <div className="field">
              <label htmlFor="password2">Повторите пароль</label>
              <input
                id="password2"
                type="password"
                placeholder="••••••••"
                value={form.password2}
                onChange={update('password2')}
              />
            </div>

            <label className="checkbox" style={{ fontSize: '.85rem' }}>
              <input type="checkbox" checked={form.agree} onChange={update('agree')} />
              Соглашаюсь с условиями обработки данных
            </label>

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

            <button type="submit" className="btn btn-primary">Зарегистрироваться</button>
          </form>

          <p className="auth-switch">
            Уже есть аккаунт?{' '}
            <Link to="/login" state={location.state}>Войти</Link>
          </p>
        </motion.section>
      </main>
    </PageTransition>
  );
}
