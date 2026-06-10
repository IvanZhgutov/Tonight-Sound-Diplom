import { useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import Footer from '../components/Footer';
import { BOOKING_STATUS } from '../general/constants';
import {
  bookingDateParts,
  formatPrice,
  formatTimes,
  hoursWord,
  initials,
  isPastDate,
  normalizeBookingTimes,
} from '../general/utils';
import { useAuthStore } from '../store/authStore';
import { useBookingStore } from '../store/bookingStore';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function Profile() {
  useDocumentTitle('Профиль');

  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const allBookings = useBookingStore((s) => s.bookings);
  const cancelBooking = useBookingStore((s) => s.cancelBooking);

  const bookings = useMemo(
    () =>
      allBookings
        .filter((b) => b.userId === user.id)
        // прошедшие — в конец, остальные по ближайшей дате
        .sort((a, b) => {
          const aPast = isPastDate(a.dateIso);
          const bPast = isPastDate(b.dateIso);
          if (aPast !== bPast) return aPast ? 1 : -1;
          return aPast ? b.dateIso.localeCompare(a.dateIso) : a.dateIso.localeCompare(b.dateIso);
        }),
    [allBookings, user.id]
  );

  const handleLogout = () => {
    logout();
    navigate('/');
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
          <AnimatePresence mode="popLayout">
            {bookings.map((b) => {
              const date = bookingDateParts(b.dateIso);
              const times = normalizeBookingTimes(b);
              const past = isPastDate(b.dateIso);
              const status = past ? BOOKING_STATUS.done : BOOKING_STATUS[b.status];

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
                    <h3>{b.serviceName}</h3>
                    <p>
                      {formatTimes(times)}
                      {b.hourly !== false &&
                        ` · ${times.length} ${hoursWord(times.length)}`}{' '}
                      · {formatPrice(b.total)}
                    </p>
                  </div>
                  <span className={`status ${status.className}`}>{status.label}</span>
                  {past ? (
                    <Link to="/booking" className="btn btn-ghost">Повторить</Link>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => cancelBooking(b.id)}
                    >
                      Отменить
                    </button>
                  )}
                </motion.article>
              );
            })}
          </AnimatePresence>

          {/* Пустое состояние */}
          {bookings.length === 0 && (
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
