import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import Footer from '../components/Footer';
import { displayStatus } from '../general/constants';
import { bookingDateParts, formatPrice, formatTimes, hoursWord, initials } from '../general/utils';
import { useAuthStore } from '../store/authStore';
import { useBookingStore } from '../store/bookingStore';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function Profile() {
  useDocumentTitle('Профиль');

  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const bookings = useBookingStore((s) => s.bookings);
  const loading = useBookingStore((s) => s.loading);
  const error = useBookingStore((s) => s.error);
  const fetchBookings = useBookingStore((s) => s.fetchBookings);
  const cancelBooking = useBookingStore((s) => s.cancelBooking);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleLogout = async () => {
    // Сначала уходим с защищённого роута, потом чистим сессию —
    // иначе ProtectedRoute успевает перебросить на /login
    navigate('/', { replace: true });
    await logout();
  };

  return (
    <PageTransition>
      <main className="container">
        {/* Шапка профиля */}
        <section className="glass profile-head">
          <div className="profile-user">
            <div className="avatar">{initials(user.name)}</div>
            <div>
              <h1>{user.name}</h1>
              <p>{user.email}</p>
            </div>
          </div>
          <div className="profile-actions">
            <Link to="/booking" className="btn btn-ghost">+ Новая запись</Link>
            <button type="button" className="btn btn-ghost btn-logout" onClick={handleLogout}>
              Выйти
            </button>
          </div>
        </section>

        <AnimatePresence>
          {location.state?.justBooked && (
            <motion.div
              className="glass success-banner"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              Запись создана! Мы свяжемся с тобой в Telegram для подтверждения.
            </motion.div>
          )}
        </AnimatePresence>

        {/* Список записей */}
        <section className="bookings-list">
          {loading && bookings.length === 0 && (
            <div className="glass empty-note">
              <p className="loading-dots">Загружаем твои записи</p>
            </div>
          )}

          {error && (
            <div className="glass empty-note">
              <p className="form-error" style={{ marginTop: 0 }}>{error}</p>
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {bookings.map((b) => {
              const date = bookingDateParts(b.date);
              const status = displayStatus(b);

              return (
                <motion.article
                  key={b.id}
                  className="glass booking-item"
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="booking-date">
                    <strong>{date.day}</strong>
                    <span>{date.caption}</span>
                  </div>
                  <div className="booking-info">
                    <h3>{b.service?.name ?? 'Сессия'}</h3>
                    <p>
                      {formatTimes(b.times)}
                      {b.service?.hourly &&
                        ` · ${b.times.length} ${hoursWord(b.times.length)}`}{' '}
                      · {formatPrice(b.total)}
                    </p>
                  </div>
                  <span className={`status ${status.className}`}>{status.label}</span>
                  {b.is_past ? (
                    <Link to="/booking" className="btn btn-ghost">Повторить</Link>
                  ) : ['pending', 'confirmed'].includes(b.status) ? (
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => cancelBooking(b.id)}
                    >
                      Отменить
                    </button>
                  ) : (
                    // Завершённую/оплаченную запись отменить нельзя — только статус
                    <span />
                  )}
                </motion.article>
              );
            })}
          </AnimatePresence>

          {/* Пустое состояние */}
          {!loading && !error && bookings.length === 0 && (
            <motion.div
              className="glass empty-note"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p>
                Пока записей нет. Свободные слоты на ближайшую неделю уже открыты —
                выбери удобное время!
              </p>
              <Link to="/booking" className="btn btn-primary">Выбрать время</Link>
            </motion.div>
          )}
        </section>
      </main>

      <Footer />
    </PageTransition>
  );
}
