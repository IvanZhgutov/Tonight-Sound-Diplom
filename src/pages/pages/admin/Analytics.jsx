import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api, { apiError } from '../../api/client';
import { MONTH_SHORT } from '../../general/constants';
import { formatPrice } from '../../general/utils';

const DOW_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/admin/analytics')
      .then(({ data }) => setData(data))
      .catch((e) => setError(apiError(e).message));
  }, []);

  if (error) {
    return (
      <div className="glass empty-note">
        <p className="form-error" style={{ marginTop: 0 }}>{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="glass empty-note">
        <p className="loading-dots">Считаем показатели</p>
      </div>
    );
  }

  const { tiles, monthly, services, weekdays } = data;

  const monthLabel = (ym) => MONTH_SHORT[parseInt(ym.split('-')[1], 10) - 1];
  const maxMonthly = Math.max(...monthly.map((m) => m.revenue), 1);
  const maxService = Math.max(...services.map((s) => s.count), 1);
  const weekdayMap = Object.fromEntries(weekdays.map((w) => [w.dow, w.count]));
  const maxWeekday = Math.max(...weekdays.map((w) => w.count), 1);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      {/* Тайлы за 30 дней */}
      <div className="admin-stats stats-4">
        <div className="glass admin-stat">
          <strong>{formatPrice(tiles.revenue)}</strong>
          <span>выручка за 30 дней</span>
        </div>
        <div className="glass admin-stat">
          <strong>{tiles.bookings}</strong>
          <span>записей за 30 дней</span>
        </div>
        <div className="glass admin-stat">
          <strong>{formatPrice(tiles.avg_check)}</strong>
          <span>средний чек</span>
        </div>
        <div className="glass admin-stat">
          <strong className={tiles.debt > 0 ? 'stat-debt' : ''}>
            {formatPrice(tiles.debt)}
          </strong>
          <span>ожидает оплаты</span>
        </div>
      </div>

      <div className="charts-grid">
        {/* Выручка по месяцам */}
        <section className="glass crm-panel">
          <h3>Выручка по месяцам</h3>
          {monthly.length === 0 ? (
            <p className="notes-empty">Пока нет оплаченных записей.</p>
          ) : (
            <div className="bar-chart">
              {monthly.map((m, i) => (
                <div key={m.month} className="bar-col">
                  <span className="bar-value">{formatPrice(m.revenue)}</span>
                  <motion.div
                    className="bar"
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max((m.revenue / maxMonthly) * 100, 4)}%` }}
                    transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <span className="bar-label">{monthLabel(m.month)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Загрузка по дням недели */}
        <section className="glass crm-panel">
          <h3>Загрузка по дням недели <span className="panel-sub">за 90 дней</span></h3>
          <div className="bar-chart">
            {DOW_LABELS.map((label, i) => {
              const count = weekdayMap[i + 1] ?? 0;
              return (
                <div key={label} className="bar-col">
                  <span className="bar-value">{count || ''}</span>
                  <motion.div
                    className="bar bar-alt"
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max((count / maxWeekday) * 100, count ? 6 : 2)}%` }}
                    transition={{ duration: 0.6, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <span className="bar-label">{label}</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Популярность услуг */}
      <section className="glass crm-panel" style={{ marginTop: 20 }}>
        <h3>Услуги <span className="panel-sub">за 90 дней</span></h3>
        {services.length === 0 ? (
          <p className="notes-empty">Записей за период не было.</p>
        ) : (
          <div className="hbar-list">
            {services.map((s, i) => (
              <div key={s.name} className="hbar-row">
                <span className="hbar-name">{s.name}</span>
                <div className="hbar-track">
                  <motion.div
                    className="hbar-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${(s.count / maxService) * 100}%` }}
                    transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
                <span className="hbar-meta">
                  {s.count} · {formatPrice(s.revenue)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
}
