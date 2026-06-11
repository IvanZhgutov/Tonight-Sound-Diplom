// Вспомогательные функции

const DOW_SHORT = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const DOW_FULL = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
const MONTHS_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const MONTHS_NOM = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

export const CAL_DOW = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

/** Локальная дата → "YYYY-MM-DD" (без UTC-сдвига, как у toISOString) */
export function toIso(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Первый доступный для записи день — завтра */
export function minBookableIso() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return toIso(d);
}

/** Ближайшие 7 дней начиная с завтрашнего — для недельного вида */
export function getWeekDays() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + 1 + i);
    return { iso: toIso(d), date: d.getDate(), dow: DOW_SHORT[d.getDay()] };
  });
}

/** 7 дней начиная с указанной даты — когда выбранный в календаре день
    выходит за пределы ближайшей недели */
export function getWeekFrom(startIso) {
  const start = new Date(startIso + 'T00:00:00');
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return { iso: toIso(d), date: d.getDate(), dow: DOW_SHORT[d.getDay()] };
  });
}

/** Месяц для календаря: offset от текущего. Возвращает заголовок и ячейки (null = пустая) */
export function getMonth(offset = 0) {
  const now = new Date();
  const base = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const year = base.getFullYear();
  const month = base.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadBlanks = (base.getDay() + 6) % 7; // неделя с понедельника

  const cells = Array.from({ length: leadBlanks }, () => null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ iso: toIso(new Date(year, month, day)), date: day });
  }
  return { title: `${MONTHS_NOM[month]} ${year}`, cells };
}

/** "2026-06-17" → "Среда, 17 июня" */
export function dayLabel(iso) {
  const d = new Date(iso + 'T00:00:00');
  return `${DOW_FULL[d.getDay()]}, ${d.getDate()} ${MONTHS_GEN[d.getMonth()]}`;
}

export function formatPrice(value) {
  if (value == null) return 'по запросу';
  return `${value.toLocaleString('ru-RU')} ₽`;
}

/**
 * Список часов → читаемая строка.
 * Непрерывные ["10:00","11:00","12:00"] → "10:00 – 13:00"
 * С разрывами → "10:00, 14:00, 18:00"
 */
export function formatTimes(times = []) {
  if (!times.length) return 'не выбрано';
  const hours = [...times].map((t) => parseInt(t, 10)).sort((a, b) => a - b);
  const contiguous = hours.every((h, i) => i === 0 || h === hours[i - 1] + 1);
  if (contiguous && hours.length > 1) {
    const end = (hours[hours.length - 1] + 1) % 24;
    return `${String(hours[0]).padStart(2, '0')}:00 – ${String(end).padStart(2, '0')}:00`;
  }
  return hours.map((h) => `${String(h).padStart(2, '0')}:00`).join(', ');
}

export function hoursWord(n) {
  if (n % 10 === 1 && n % 100 !== 11) return 'час';
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return 'часа';
  return 'часов';
}

/** Дата записи для карточки: { day: 17, caption: "июня, ср" } */
export function bookingDateParts(iso) {
  const d = new Date(iso + 'T00:00:00');
  return {
    day: d.getDate(),
    caption: `${MONTHS_GEN[d.getMonth()]}, ${DOW_SHORT[d.getDay()].toLowerCase()}`,
  };
}

export function isPastDate(iso) {
  return iso < toIso(new Date());
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || '∗';
}

/** Маска телефона: цифры → "+7 (XXX)-XXX-XX-XX" */
export function formatPhoneRu(raw) {
  let d = raw.replace(/\D/g, '');
  if (d.startsWith('7') || d.startsWith('8')) d = d.slice(1);
  d = d.slice(0, 10);
  if (!d) return '';

  let out = '+7 (' + d.slice(0, 3);
  if (d.length >= 3) out += ')';
  if (d.length > 3) out += '-' + d.slice(3, 6);
  if (d.length > 6) out += '-' + d.slice(6, 8);
  if (d.length > 8) out += '-' + d.slice(8, 10);
  return out;
}

/** Только цифры из строки (для валидации: полный номер = 11 цифр с семёркой) */
export const phoneDigits = (value) => value.replace(/\D/g, '');
