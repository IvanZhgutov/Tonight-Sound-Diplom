// Все константы приложения Tonight Sound

export const NAV_LINKS = [
  { to: '/', label: 'Главная' },
  { to: '/booking', label: 'Запись' },
  { to: '/plugins', label: 'Плагины' },
  { to: '/profile', label: 'Профиль' },
];

// Слоты каждый час: 00:00 … 23:00
export const TIME_SLOTS = Array.from(
  { length: 24 },
  (_, h) => `${String(h).padStart(2, '0')}:00`
);

// Фото лежат в public/images/equipment/ — Vite отдаёт их напрямую
export const EQUIPMENT = [
  { type: 'Наушники',        model: 'Beyerdynamic DT 770 Pro', img: '/images/equipment/dt770pro.webp' },
  { type: 'Звуковая карта',  model: 'Arturia MiniFuse 1',      img: '/images/equipment/arturia-minifuse-1.webp' },
  { type: 'Микрофон',        model: 'Neumann TLM 102',         img: '/images/equipment/neuman-tlm-102.webp' },
  { type: 'MIDI-клавиатура', model: 'Arturia MiniLab 3',       img: '/images/equipment/arturia-minilab-3.webp' },
];

export const PLUGIN_CATEGORIES = [
  'Все', 'EQ', 'Компрессор', 'Реверб', 'Синтезатор', 'Вокал', 'Мастеринг', 'Эффект',
];

export const BOOKING_STATUS = {
  pending:   { label: 'Ожидает подтверждения', className: 'wait' },
  confirmed: { label: 'Подтверждена',          className: 'ok' },
  completed: { label: 'Завершена',             className: 'completed' },
  paid:      { label: 'Оплачена',              className: 'paid' },
  declined:  { label: 'Отклонена',             className: 'declined' },
  no_show:   { label: 'Не пришёл',             className: 'noshow' },
  done:      { label: 'Завершена',             className: 'done' },
};

/** Статус для клиента: прошедшие неотработанные записи показываем «Завершена» */
export const displayStatus = (booking) => {
  if (booking.is_past && ['pending', 'confirmed'].includes(booking.status)) {
    return BOOKING_STATUS.done;
  }
  return BOOKING_STATUS[booking.status] ?? BOOKING_STATUS.pending;
};

/** Воронка CRM: действия админа для каждого статуса записи */
export const PIPELINE_ACTIONS = {
  pending: [
    { to: 'confirmed', label: 'Подтвердить', primary: true },
    { to: 'declined', label: 'Отклонить' },
  ],
  confirmed: [
    { to: 'completed', label: 'Завершена', primary: true },
    { to: 'no_show', label: 'Не пришёл' },
    { to: 'declined', label: 'Отклонить' },
  ],
  completed: [
    { to: 'paid', label: 'Оплачено', primary: true },
  ],
};

export const MONTH_SHORT = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

export const HERO_STATS = [
  { value: '6 лет', label: 'работы студии' },
  { value: '120+',  label: 'плагинов в парке' },
  { value: '1800+', label: 'записанных треков' },
];

export const STUDIO_FEATURES = [
  'Акустически подготовленная комната',
  'Микрофон Neumann TLM 102',
  'Наушники Beyerdynamic DT 770 Pro',
  '120+ лицензионных плагинов',
];

export const CONTACTS = {
  email: 'hello@tonightsound.studio',
  phone: '+48 000 000 000',
  address: 'Сергиев Посад, пр. красной армии, 180',
};
