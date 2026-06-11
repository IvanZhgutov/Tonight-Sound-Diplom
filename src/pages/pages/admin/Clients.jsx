import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api, { apiError } from '../../api/client';
import { formatPrice, initials } from '../../general/utils';

const SORTS = [
  { id: 'spent', label: 'По выручке' },
  { id: 'recent', label: 'Недавние' },
  { id: 'debt', label: 'С долгом' },
];

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('spent');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Поиск с лёгким дебаунсом, чтобы не дёргать API на каждый символ
  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/admin/clients', {
          params: { search: search.trim() || undefined, sort },
        });
        setClients(data.data ?? []);
      } catch (e) {
        setError(apiError(e).message);
      } finally {
        setLoading(false);
      }
    }, search ? 350 : 0);
    return () => clearTimeout(timer);
  }, [search, sort]);

  return (
    <>
      <div className="plugins-toolbar">
        <div className="search">
          <input
            type="search"
            placeholder="Имя или email клиента"
            aria-label="Поиск клиента"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="chips">
          {SORTS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`chip${sort === s.id ? ' active' : ''}`}
              onClick={() => setSort(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="glass empty-note" style={{ marginTop: 24 }}>
          <p className="form-error" style={{ marginTop: 0 }}>{error}</p>
        </div>
      )}

      {loading && clients.length === 0 && (
        <div className="glass empty-note" style={{ marginTop: 24 }}>
          <p className="loading-dots">Загружаем клиентов</p>
        </div>
      )}

      <section className="bookings-list" style={{ marginTop: 24 }}>
        {clients.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
          >
            <Link to={`/admin/clients/${c.id}`} className="glass booking-item client-row">
              <div className="client-id">
                <div className="avatar avatar-sm">{initials(c.name)}</div>
                <div>
                  <h3>{c.name}</h3>
                  <p>{c.email}</p>
                </div>
              </div>

              <div className="client-tags">
                {(c.tags ?? []).slice(0, 3).map((t) => (
                  <span key={t} className="tag">{t}</span>
                ))}
              </div>

              <div className="client-stats">
                <span><strong>{c.bookings_count}</strong> визитов</span>
                <span><strong>{formatPrice(c.total_spent)}</strong> оплачено</span>
                <span className={c.debt > 0 ? 'debt' : ''}>
                  <strong>{formatPrice(c.debt)}</strong> долг
                </span>
              </div>

              <span className="client-arrow" aria-hidden="true">→</span>
            </Link>
          </motion.div>
        ))}

        {!loading && !error && clients.length === 0 && (
          <div className="glass empty-note">
            <p>{search ? `По запросу «${search}» никого не нашлось.` : 'Клиентов пока нет.'}</p>
          </div>
        )}
      </section>
    </>
  );
}
