import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import api, { apiError } from '../../api/client';
import { BOOKING_STATUS, PIPELINE_ACTIONS } from '../../general/constants';
import { bookingDateParts, formatPrice, formatTimes } from '../../general/utils';

const TABS = [
  { id: 'bookings', label: 'Записи' },
  { id: 'plugins', label: 'Запросы плагинов' },
];

export default function Requests() {
  const [tab, setTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [bookingsRes, requestsRes] = await Promise.all([
        api.get('/admin/bookings'),
        api.get('/admin/plugin-requests'),
      ]);
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
    } catch (e) {
      setError(apiError(e).message);
    }
  };

  const approvePlugin = async (id) => {
    try {
      await api.patch(`/admin/plugins/${id}/approve`);
      setRequests((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      setError(apiError(e).message);
    }
  };

  const declinePlugin = async (id) => {
    try {
      await api.delete(`/admin/plugins/${id}`);
      setRequests((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      setError(apiError(e).message);
    }
  };

  return (
    <>
      {error && (
        <div className="glass empty-note" style={{ marginBottom: 24 }}>
          <p className="form-error" style={{ marginTop: 0 }}>{error}</p>
        </div>
      )}

      <div className="chips sub-tabs">
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
              {bookings.map((b) => (
                <BookingRow key={b.id} booking={b} onAction={setBookingStatus} />
              ))}

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
                    <button type="button" className="btn btn-primary" onClick={() => approvePlugin(p.id)}>
                      Добавлен
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={() => declinePlugin(p.id)}>
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
    </>
  );
}

/** Строка записи с действиями воронки — используется и в карточке клиента */
export function BookingRow({ booking: b, onAction, showClient = true }) {
  const date = bookingDateParts(b.date);
  const status = BOOKING_STATUS[b.status] ?? BOOKING_STATUS.pending;
  const actions = PIPELINE_ACTIONS[b.status] ?? [];

  return (
    <article className="glass booking-item admin-item">
      <div className="booking-date">
        <strong>{date.day}</strong>
        <span>{date.caption}</span>
      </div>
      <div className="booking-info">
        <h3>{b.service?.name ?? 'Сессия'}</h3>
        <p>
          {formatTimes(b.times)} · {formatPrice(b.total)}
          {showClient && <> · {b.user?.name ?? 'Пользователь'} · {b.telegram ?? '—'}</>}
        </p>
        {b.comment && <p className="admin-comment">«{b.comment}»</p>}
      </div>
      <span className={`status ${status.className}`}>{status.label}</span>
      {actions.length > 0 && (
        <div className="admin-actions">
          {actions.map((a) => (
            <button
              key={a.to}
              type="button"
              className={`btn ${a.primary ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => onAction(b.id, a.to)}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </article>
  );
}
