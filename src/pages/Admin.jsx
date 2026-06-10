import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import Footer from '../components/Footer';
import api, { apiError } from '../api/client';
import { displayStatus } from '../general/constants';
import { bookingDateParts, formatPrice, formatTimes } from '../general/utils';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const TABS = [
  { id: 'bookings', label: 'Заявки на запись' },
  { id: 'plugins', label: 'Запросы плагинов' },
];

export default function Admin() {
  useDocumentTitle('Админ-панель');

  const [tab, setTab] = useState('bookings');
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, bookingsRes, requestsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/bookings'),
        api.get('/admin/plugin-requests'),
      ]);
      setStats(statsRes.data);
      setBookings(bookingsRes.data.data ?? []);
      setRequests(requestsRes.data.data ?? []);
    } catch (e) {
      setError(apiError(e).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const setBookingStatus = async (id, status) => {
    try {
      const { data } = await api.patch(`/admin/bookings/${id}/status`, { status });
      setBookings((prev) => prev.map((b) => (b.id === id ? data.booking : b)));
      setStats((s) => s && { ...s, pending_bookings: Math.max(0, s.pending_bookings - 1) });
    } catch (e) {
      setError(apiError(e).message);
    }
  };

  const approvePlugin = async (id) => {
    try {
      await api.patch(`/admin/plugins/${id}/approve`);
      setRequests((prev) => prev.filter((p) => p.id !== id));
      setStats((s) => s && { ...s, pending_plugins: Math.max(0, s.pending_plugins - 1) });
    } catch (e) {
      setError(apiError(e).message);
    }
  };

  const declinePlugin = async (id) => {
    try {
      await api.delete(`/admin/plugins/${id}`);
      setRequests((prev) => prev.filter((p) => p.id !== id));
      setStats((s) => s && { ...s, pending_plugins: Math.max(0, s.pending_plugins - 1) });
    } catch (e) {
      setError(apiError(e).message);
    }
  };

  return (
    <PageTransition>
      <main className="container">
        <div className="page-head">
          <span className="eyebrow">Служебная зона</span>
          <h1>
            Админ-<span className="accent">панель</span>
          </h1>
          <p>
            Подтверждай записи и обрабатывай запросы артистов на плагины.
          </p>
        </div>

        {error && (
          <div className="glass empty-note" style={{ marginBottom: 24 }}>
            <p className="form-error" style={{ marginTop: 0 }}>{error}</p>
          </div>
        )}

        {/* Счётчики */}
        <div className="admin-stats">
          <div className="glass admin-stat">
            <strong>{stats ? stats.pending_bookings : '—'}</strong>
            <span>записей ждут подтверждения</span>
          </div>
          <div className="glass admin-stat">
            <strong>{stats ? stats.pending_plugins : '—'}</strong>
            <span>запросов на плагины</span>
          </div>
          <div className="glass admin-stat">
            <strong>{stats ? stats.users : '—'}</strong>
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

        {loading && (
          <div className="glass empty-note">
            <p className="loading-dots">Загружаем заявки</p>
          </div>
        )}

        {!loading && (
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
                {bookings.map((b) => {
                  const date = bookingDateParts(b.date);
                  const status = displayStatus(b);

                  return (
                    <article key={b.id} className="glass booking-item admin-item">
                      <div className="booking-date">
                        <strong>{date.day}</strong>
                        <span>{date.caption}</span>
                      </div>
                      <div className="booking-info">
                        <h3>{b.service?.name ?? 'Сессия'}</h3>
                        <p>
                          {formatTimes(b.times)} · {formatPrice(b.total)} ·{' '}
                          {b.user?.name ?? 'Пользователь'} · {b.telegram ?? '—'}
                        </p>
                        {b.comment && <p className="admin-comment">«{b.comment}»</p>}
                      </div>
                      <span className={`status ${status.className}`}>{status.label}</span>
                      {!b.is_past && b.status === 'pending' && (
                        <div className="admin-actions">
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => setBookingStatus(b.id, 'confirmed')}
                          >
                            Подтвердить
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => setBookingStatus(b.id, 'declined')}
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
                {requests.map((p) => (
                  <article key={p.id} className="glass booking-item admin-item plugin-row">
                    <div className="booking-info">
                      <h3>{p.name}</h3>
                      <p>
                        {p.created_at
                          ? new Date(p.created_at).toLocaleDateString('ru-RU')
                          : ''}{' '}
                        · ожидает решения
                      </p>
                    </div>
                    <span className="status wait">В очереди</span>
                    <div className="admin-actions">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => approvePlugin(p.id)}
                      >
                        Добавлен
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => declinePlugin(p.id)}
                      >
                        Отклонить
                      </button>
                    </div>
                  </article>
                ))}

                {requests.length === 0 && (
                  <div className="glass empty-note">
                    <p>Запросов на плагины пока нет.</p>
                  </div>
                )}
              </motion.section>
            )}
          </AnimatePresence>
        )}
      </main>

      <Footer />
    </PageTransition>
  );
}
