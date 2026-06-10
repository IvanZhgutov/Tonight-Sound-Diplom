import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import Footer from '../components/Footer';
import { BOOKING_STATUS } from '../general/constants';
import {
  bookingDateParts,
  formatPrice,
  formatTimes,
  isPastDate,
  normalizeBookingTimes,
} from '../general/utils';
import { useAuthStore } from '../store/authStore';
import { useBookingStore } from '../store/bookingStore';
import { usePluginStore } from '../store/pluginStore';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const TABS = [
  { id: 'bookings', label: 'Заявки на запись' },
  { id: 'plugins', label: 'Запросы плагинов' },
];

export default function Admin() {
  useDocumentTitle('Админ-панель');

  const [tab, setTab] = useState('bookings');

  const users = useAuthStore((s) => s.users);
  const bookings = useBookingStore((s) => s.bookings);
  const setStatus = useBookingStore((s) => s.setStatus);
  const requested = usePluginStore((s) => s.requested);
  const approveRequest = usePluginStore((s) => s.approveRequest);
  const removeRequest = usePluginStore((s) => s.removeRequest);

  const pendingBookings = bookings.filter((b) => b.status === 'wait').length;
  const pendingPlugins = requested.filter((p) => p.pending).length;

  const sortedBookings = useMemo(
    () =>
      [...bookings].sort((a, b) => {
        const order = { wait: 0, confirmed: 1, declined: 2 };
        const ao = isPastDate(a.dateIso) ? 3 : order[a.status] ?? 1;
        const bo = isPastDate(b.dateIso) ? 3 : order[b.status] ?? 1;
        if (ao !== bo) return ao - bo;
        return a.dateIso.localeCompare(b.dateIso);
      }),
    [bookings]
  );

  const userName = (id) => users.find((u) => u.id === id)?.name ?? 'Пользователь';

  return (
    <PageTransition>
      <main className="container">
        <div className="page-head">
          <span className="eyebrow">Служебная зона</span>
          <h1>
            Админ-<span className="accent">панель</span>
          </h1>
          <p>
            Заявки хранятся локально (без бэкенда). Подтверждай записи и
            обрабатывай запросы на плагины.
          </p>
        </div>

        {/* Счётчики */}
        <div className="admin-stats">
          <div className="glass admin-stat">
            <strong>{pendingBookings}</strong>
            <span>записей ждут подтверждения</span>
          </div>
          <div className="glass admin-stat">
            <strong>{pendingPlugins}</strong>
            <span>запросов на плагины</span>
          </div>
          <div className="glass admin-stat">
            <strong>{users.length}</strong>
            <span>зарегистрировано артистов</span>
          </div>
        </div>

        {/* Табы */}
        <div className="chips admin-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`chip${tab === t.id ? ' active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'bookings' ? (
            <motion.section
              key="bookings"
              className="bookings-list"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
            >
              {sortedBookings.map((b) => {
                const date = bookingDateParts(b.dateIso);
                const times = normalizeBookingTimes(b);
                const past = isPastDate(b.dateIso);
                const status = past ? BOOKING_STATUS.done : BOOKING_STATUS[b.status];

                return (
                  <article key={b.id} className="glass booking-item admin-item">
                    <div className="booking-date">
                      <strong>{date.day}</strong>
                      <span>{date.caption}</span>
                    </div>
                    <div className="booking-info">
                      <h3>{b.serviceName} · Комната {b.room}</h3>
                      <p>
                        {formatTimes(times)} · {formatPrice(b.total)} ·{' '}
                        {userName(b.userId)} · {b.telegram ?? '—'}
                      </p>
                      {b.comment && <p className="admin-comment">«{b.comment}»</p>}
                    </div>
                    <span className={`status ${status.className}`}>{status.label}</span>
                    {!past && b.status === 'wait' && (
                      <div className="admin-actions">
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => setStatus(b.id, 'confirmed')}
                        >
                          Подтвердить
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost"
                          onClick={() => setStatus(b.id, 'declined')}
                        >
                          Отклонить
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}

              {bookings.length === 0 && (
                <div className="glass empty-note">
                  <p>Заявок на запись пока нет.</p>
                </div>
              )}
            </motion.section>
          ) : (
            <motion.section
              key="plugins"
              className="bookings-list"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
            >
              {requested.map((p) => (
                <article key={p.id} className="glass booking-item admin-item plugin-row">
                  <div className="booking-info">
                    <h3>{p.name}</h3>
                    <p>
                      {new Date(p.createdAt).toLocaleDateString('ru-RU')} ·{' '}
                      {p.pending ? 'ожидает решения' : 'добавлен в студию'}
                    </p>
                  </div>
                  <span className={`status ${p.pending ? 'wait' : 'ok'}`}>
                    {p.pending ? 'В очереди' : 'Добавлен'}
                  </span>
                  {p.pending && (
                    <div className="admin-actions">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => approveRequest(p.id)}
                      >
                        Добавлен
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => removeRequest(p.id)}
                      >
                        Отклонить
                      </button>
                    </div>
                  )}
                </article>
              ))}

              {requested.length === 0 && (
                <div className="glass empty-note">
                  <p>Запросов на плагины пока нет.</p>
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <Footer compact />
    </PageTransition>
  );
}
