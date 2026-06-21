import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import api, { apiError } from '../../api/client';
import { MONTH_SHORT } from '../../general/constants';
import { formatPrice } from '../../general/utils';

const DOW_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

// Локальная дата в формате YYYY-MM-DD (без сдвига часового пояса)
const toISO = (d) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};

const today = () => new Date();
const daysAgo = (n) => {
  const d = today();
  d.setDate(d.getDate() - n);
  return d;
};
const daysAhead = (n) => {
  const d = today();
  d.setDate(d.getDate() + n);
  return d;
};
const startOfYear = () => new Date(today().getFullYear(), 0, 1);
const endOfYear = () => new Date(today().getFullYear(), 11, 31);

// Быстрые пресеты периода. Окна охватывают и прошлое, и будущее
// относительно сегодня — чтобы в статистику попадали и уже проведённые,
// и запланированные на будущее записи.
const PRESETS = [
  // { id: '7', label: '7 дней', from: () => daysAgo(5), to: () => new Date(today().setDate(today().getDate() + 1)) },
  { id: '7', label: '7 дней', from: () => daysAgo(5), to: today },
  { id: '30', label: '± 30 дней', from: () => daysAgo(30), to: () => daysAhead(30) },
  { id: '90', label: '± 90 дней', from: () => daysAgo(90), to: () => daysAhead(90) },
  { id: 'year', label: 'Этот год', from: startOfYear, to: endOfYear },
];

export default function Analytics() {
  const [from, setFrom] = useState(() => toISO(daysAgo(30)));
  const [to, setTo] = useState(() => toISO(daysAhead(30)));
  const [activePreset, setActivePreset] = useState('30');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (f, t) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/admin/analytics', { params: { from: f, to: t } });
      setData(data);
    } catch (e) {
      setError(apiError(e).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(from, to);
  }, []); // первичная загрузка

  const applyPreset = (preset) => {
    const f = toISO(preset.from());
    const t = toISO(preset.to());
    setFrom(f);
    setTo(t);
    setActivePreset(preset.id);
    load(f, t);
  };

  const applyManual = () => {
    if (from > to) {
      setError('Дата начала не может быть позже даты конца.');
      return;
    }
    setActivePreset(null);
    load(from, to);
  };

  // Человекочитаемое описание периода
  const periodLabel = useMemo(() => {
    const fmt = (iso) => {
      const [y, m, d] = iso.split('-');
      return `${d}.${m}.${y}`;
    };
    return `${fmt(from)} — ${fmt(to)}`;
  }, [from, to]);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      {/* Панель выбора периода */}
      <section className="glass crm-panel period-panel">
        <div className="period-presets">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`chip${activePreset === p.id ? ' active' : ''}`}
              onClick={() => applyPreset(p)}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="period-range">
          <div className="period-field">
            <label htmlFor="from">с</label>
            <input
              id="from"
              type="date"
              value={from}
              onChange={(e) => { setFrom(e.target.value); setActivePreset(null); }}
            />
          </div>
          <div className="period-field">
            <label htmlFor="to">по</label>
            <input
              id="to"
              type="date"
              value={to}
              min={from}
              onChange={(e) => { setTo(e.target.value); setActivePreset(null); }}
            />
          </div>
          {/* <button type="button" className="btn btn-primary" onClick={applyManual}>
            Показать
          </button> */}
        </div>
      </section>

      {error && (
        <div className="glass empty-note" style={{ marginTop: 16 }}>
          <p className="form-error" style={{ marginTop: 0 }}>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="glass empty-note" style={{ marginTop: 16 }}>
          <p className="loading-dots">Считаем показатели</p>
        </div>
      ) : data ? (
        <Report data={data} periodLabel={periodLabel} from={from} to={to} />
      ) : null}
    </motion.div>
  );
}

function Report({ data, periodLabel, from, to }) {
  const { tiles, monthly, daily, services, weekdays } = data;

  // Длина периода в днях (включительно)
  const periodDays = Math.round(
    (new Date(to) - new Date(from)) / 86400000
  ) + 1;
  // Короткий период (≤ 7 дней) → показываем выручку по дням недели
  const isWeekView = periodDays <= 7;

  const DOW_FULL = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const monthLabel = (ym) => {
    const [y, m] = ym.split('-');
    return `${MONTH_SHORT[parseInt(m, 10) - 1]} ${String(y).slice(2)}`;
  };
  // Подпись дня: «Пн 16.06»
  const dayLabel = (iso) => {
    const d = new Date(iso + 'T00:00:00');
    const [, m, dd] = iso.split('-');
    return `${DOW_FULL[d.getDay()]} ${dd}.${m}`;
  };

  // Данные графика выручки: дни или месяцы
  let revenueData;
  if (isWeekView) {
    // Полный ряд дней периода (включая дни без выручки)
    const map = Object.fromEntries((daily ?? []).map((d) => [d.day, d.revenue]));
    revenueData = [];
    const cur = new Date(from + 'T00:00:00');
    const end = new Date(to + 'T00:00:00');
    while (cur <= end) {
      // const iso = cur.toISOString().slice(0, 10);
      const iso = toISO(cur);
      revenueData.push({ day: iso, revenue: map[iso] ?? 0 });
      cur.setDate(cur.getDate() + 1);
    }
  } else {
    revenueData = monthly;
  }
  const revenueTitle = isWeekView ? 'Выручка за неделю' : 'Выручка по месяцам';
  const maxRevenue = Math.max(...revenueData.map((r) => r.revenue), 1);

  const maxService = Math.max(...services.map((s) => s.count), 1);
  const weekdayMap = Object.fromEntries(weekdays.map((w) => [w.dow, w.count]));
  const maxWeekday = Math.max(...weekdays.map((w) => w.count), 1);

  return (
    <motion.div
      key={periodLabel}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <p className="period-caption">Период: <strong>{periodLabel}</strong></p>

      {/* Тайлы за период */}
      <div className="admin-stats stats-3">
        <div className="glass admin-stat">
          <strong>{formatPrice(tiles.revenue)}</strong>
          <span>выручка за период</span>
        </div>
        <div className="glass admin-stat">
          <strong>{tiles.bookings}</strong>
          <span>записей за период</span>
        </div>
        <div className="glass admin-stat">
          <strong>{formatPrice(tiles.avg_check)}</strong>
          <span>средний чек</span>
        </div>
      </div>

      <div className="charts-grid">
        {/* Выручка: по дням (короткий период) или по месяцам */}
        <section className="glass crm-panel">
          <h3>{revenueTitle}</h3>
          {revenueData.length === 0 || revenueData.every((r) => r.revenue === 0) ? (
            <p className="notes-empty">За выбранный период нет завершённых записей.</p>
          ) : (
            <div className="bar-chart">
              {revenueData.map((r, i) => (
                <div key={isWeekView ? r.day : r.month} className="bar-col">
                  <span className="bar-value">{formatPrice(r.revenue)}</span>
                  <motion.div
                    className="bar"
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max((r.revenue / maxRevenue) * 100, 4)}%` }}
                    transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <span className="bar-label">
                    {isWeekView ? dayLabel(r.day) : monthLabel(r.month)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Загрузка по дням недели */}
        <section className="glass crm-panel">
          <h3>Загрузка по дням недели</h3>
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
        <h3>Услуги</h3>
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
