import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import Footer from '../components/Footer';
import api from '../api/client';
import { TIME_SLOTS } from '../general/constants';
import {
  CAL_DOW,
  dayLabel,
  formatPrice,
  formatTimes,
  getMonth,
  getWeekDays,
  getWeekFrom,
  hoursWord,
  minBookableIso,
} from '../general/utils';
import { useAuthStore } from '../store/authStore';
import { useBookingStore } from '../store/bookingStore';
import { useCatalogStore } from '../store/catalogStore';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function Booking() {
  useDocumentTitle('Запись на сессию');

  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const createBooking = useBookingStore((s) => s.createBooking);
  const draft = useBookingStore((s) => s.draft);
  const setDraft = useBookingStore((s) => s.setDraft);
  const clearDraft = useBookingStore((s) => s.clearDraft);

  const services = useCatalogStore((s) => s.services);
  const servicesFetched = useCatalogStore((s) => s.servicesFetched);
  const fetchServices = useCatalogStore((s) => s.fetchServices);

  const bookable = useMemo(() => services.filter((s) => s.bookable), [services]);

  const defaultWeek = useMemo(getWeekDays, []);
  const minIso = useMemo(minBookableIso, []);

  // Черновик восстанавливает выбор после ухода на /login или перезагрузки
  const validDraft = draft && draft.dayIso >= minIso ? draft : null;

  const [dayIso, setDayIso] = useState(validDraft?.dayIso ?? defaultWeek[0].iso);
  const [times, setTimes] = useState(validDraft?.times ?? []);
  const [serviceSlug, setServiceSlug] = useState(validDraft?.serviceSlug ?? '');
  const [telegram, setTelegram] = useState(validDraft?.telegram ?? '');
  const [comment, setComment] = useState(validDraft?.comment ?? '');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Занятые часы с бэкенда
  const [busy, setBusy] = useState([]);
  const [busyLoading, setBusyLoading] = useState(false);

  // Вид выбора дня: неделя или календарь месяца
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [monthOffset, setMonthOffset] = useState(0);
  const month = useMemo(() => getMonth(monthOffset), [monthOffset]);

  // Если выбранный в календаре день выходит за пределы ближайших 7 дней —
  // недельная полоса начинается с него
  const week = useMemo(
    () =>
      defaultWeek.some((d) => d.iso === dayIso)
        ? defaultWeek
        : getWeekFrom(dayIso),
    [defaultWeek, dayIso]
  );

  useEffect(() => {
    if (!servicesFetched) fetchServices();
  }, [servicesFetched, fetchServices]);

  // Услуга по умолчанию — первая доступная
  useEffect(() => {
    if (!serviceSlug && bookable.length) {
      setServiceSlug(bookable[0].slug);
    }
  }, [bookable, serviceSlug]);

  // Реальная занятость слотов на выбранную дату
  useEffect(() => {
    let ignore = false;
    setBusyLoading(true);
    api
      .get('/availability', { params: { date: dayIso } })
      .then(({ data }) => {
        if (!ignore) setBusy(data.busy ?? []);
      })
      .catch(() => {
        if (!ignore) setBusy([]);
      })
      .finally(() => {
        if (!ignore) setBusyLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [dayIso]);

  // Любое изменение формы — в черновик
  useEffect(() => {
    setDraft({ dayIso, times, serviceSlug, telegram, comment });
  }, [dayIso, times, serviceSlug, telegram, comment, setDraft]);

  const service = bookable.find((s) => s.slug === serviceSlug) ?? bookable[0];
  const total = !service || service.price == null
    ? null
    : service.hourly
      ? times.length
        ? service.price * times.length
        : service.price
      : service.price;

  const pickDay = (iso) => {
    setDayIso(iso);
    setTimes([]); // занятость зависит от дня
    setError('');
  };

  const toggleTime = (t) => {
    setTimes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || submitting) return;

    if (!times.length) return setError('Выбери хотя бы один час');
    if (!telegram.trim()) return setError('Укажи Telegram ID для связи');

    setSubmitting(true);
    const result = await createBooking({
      date: dayIso,
      times: [...times].sort(),
      service: service.slug,
      telegram: telegram.trim(),
      comment: comment.trim() || undefined,
    });
    setSubmitting(false);

    if (!result.ok) {
      setError(result.message);
      // часы могли занять, пока пользователь думал — обновляем занятость
      if (result.errors?.times) {
        const { data } = await api.get('/availability', { params: { date: dayIso } });
        setBusy(data.busy ?? []);
        setTimes([]);
      }
      return;
    }

    clearDraft();
    navigate('/profile', { state: { justBooked: true } });
  };

  return (
    <PageTransition>
      <main className="container">
        <div className="page-head">
          <span className="eyebrow">Бронирование</span>
          <h1>
            Запись на <span className="accent">сессию</span>
          </h1>
          <p>
            Выбери день, время и услугу. После подтверждения запись появится
            в твоём профиле.
          </p>
        </div>

        <form className="booking-layout" onSubmit={handleSubmit}>
          <div>
            {/* Шаг 1: день */}
            <section className="glass booking-panel">
              <div className="panel-head">
                <h3><span className="step-num">1</span> Выбери день</h3>
                <button
                  type="button"
                  className={`icon-btn${calendarOpen ? ' active' : ''}`}
                  onClick={() => setCalendarOpen((v) => !v)}
                  aria-label={calendarOpen ? 'Свернуть в неделю' : 'Открыть календарь'}
                  title={calendarOpen ? 'Свернуть в неделю' : 'Открыть календарь'}
                >
                  <CalendarIcon />
                </button>
              </div>

              <AnimatePresence mode="wait" initial={false}>
                {calendarOpen ? (
                  <motion.div
                    key="month"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="calendar-head">
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => setMonthOffset((m) => m - 1)}
                        disabled={monthOffset === 0}
                        aria-label="Предыдущий месяц"
                      >
                        ←
                      </button>
                      <span className="calendar-title">{month.title}</span>
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => setMonthOffset((m) => m + 1)}
                        aria-label="Следующий месяц"
                      >
                        →
                      </button>
                    </div>
                    <div className="calendar-grid">
                      {CAL_DOW.map((d) => (
                        <span key={d} className="cal-dow">{d}</span>
                      ))}
                      {month.cells.map((cell, i) =>
                        cell === null ? (
                          <span key={`blank-${i}`} />
                        ) : (
                          <button
                            key={cell.iso}
                            type="button"
                            className={`cal-cell${cell.iso === dayIso ? ' selected' : ''}`}
                            disabled={cell.iso < minIso}
                            onClick={() => {
                              pickDay(cell.iso);
                              setCalendarOpen(false); // авто-сворачивание после выбора
                            }}
                          >
                            {cell.date}
                          </button>
                        )
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="week"
                    className="days"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {week.map((d) => (
                      <label key={d.iso} className={`day${d.iso === dayIso ? ' selected' : ''}`}>
                        <input
                          type="radio"
                          name="day"
                          checked={d.iso === dayIso}
                          onChange={() => pickDay(d.iso)}
                        />
                        <span className="dow">{d.dow}</span>
                        <span className="date">{d.date}</span>
                      </label>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* Шаг 2: время (мультивыбор, занятость с бэкенда) */}
            <section className="glass booking-panel">
              <div className="panel-head">
                <h3><span className="step-num">2</span> Выбери время</h3>
                <span className="panel-hint">
                  {busyLoading ? 'проверяем занятость…' : 'можно несколько часов'}
                </span>
              </div>
              <div className={`slots slots-scroll${busyLoading ? ' slots-loading' : ''}`}>
                {TIME_SLOTS.map((t) => {
                  if (busy.includes(t)) {
                    return (
                      <span key={t} className="slot disabled" aria-disabled="true">
                        {t}
                      </span>
                    );
                  }
                  return (
                    <label key={t} className={`slot${times.includes(t) ? ' selected' : ''}`}>
                      <input
                        type="checkbox"
                        checked={times.includes(t)}
                        disabled={busyLoading}
                        onChange={() => toggleTime(t)}
                      />
                      {t}
                    </label>
                  );
                })}
              </div>
            </section>

            {/* Шаг 3: детали */}
            <section className="glass booking-panel">
              <h3><span className="step-num">3</span> Детали записи</h3>
              <div className="booking-form">
                <div className="field">
                  <label htmlFor="service">Услуга</label>
                  <select
                    id="service"
                    value={serviceSlug}
                    onChange={(e) => setServiceSlug(e.target.value)}
                    disabled={!bookable.length}
                  >
                    {!bookable.length && <option>Загружаем услуги…</option>}
                    {bookable.map((s) => (
                      <option key={s.slug} value={s.slug}>
                        {s.name} — {formatPrice(s.price)} / {s.hourly ? 'час' : 'трек'}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="telegram">Ваш ID в Telegram (для связи)</label>
                  <input
                    id="telegram"
                    type="text"
                    placeholder="@username"
                    value={telegram}
                    onChange={(e) => { setTelegram(e.target.value); setError(''); }}
                  />
                </div>
                <div className="field">
                  <label htmlFor="comment">Комментарий</label>
                  <textarea
                    id="comment"
                    rows="3"
                    placeholder="Референсы, состав команды, особые пожелания"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <span className="hint">
                    Необязательно — но поможет нам подготовить комнату заранее.
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* Сводка */}
          <aside className="glass booking-summary">
            <h3>Твоя запись</h3>
            <SummaryRow label="День" value={dayLabel(dayIso)} />
            <SummaryRow label="Время" value={formatTimes(times)} />
            {service?.hourly && times.length > 0 && (
              <SummaryRow label="Часов" value={`${times.length} ${hoursWord(times.length)}`} />
            )}
            <SummaryRow label="Услуга" value={service?.name ?? '…'} />
            <div className="summary-row total">
              <span>Итого</span>
              <AnimatedValue value={formatPrice(total)} />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={!user || submitting || !service}
            >
              {submitting ? 'Отправляем…' : 'Подтвердить запись'}
            </button>

            <AnimatePresence>
              {error && (
                <motion.p
                  className="form-error"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {!user && (
              <p className="note">
                Чтобы подтвердить запись — сначала{' '}
                <Link
                  to="/login"
                  state={{ from: '/booking', reason: 'booking' }}
                  className="note-link"
                >
                  войдите
                </Link>{' '}
                в аккаунт
              </p>
            )}
          </aside>
        </form>
      </main>

      <Footer />
    </PageTransition>
  );
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="summary-row">
      <span>{label}</span>
      <AnimatedValue value={value} />
    </div>
  );
}

// Значение в сводке мягко перелистывается при изменении
function AnimatedValue({ value }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={value}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25 }}
      >
        {value}
      </motion.span>
    </AnimatePresence>
  );
}
