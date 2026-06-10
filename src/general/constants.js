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

// img: null → показывается заглушка. Когда появятся фотографии,
// положи их в src/assets и импортируй сюда (img: dt770Photo)
export const EQUIPMENT = [
  { type: 'Наушники',        model: 'Beyerdynamic DT 770 Pro', img: null },
  { type: 'Звуковая карта',  model: 'Arturia MiniFuse 1',      img: null },
  { type: 'Микрофон',        model: 'Neumann TLM 102',         img: null },
  { type: 'MIDI-клавиатура', model: 'Arturia MiniLab 3',       img: null },
];

export const PLUGIN_CATEGORIES = [
  'Все', 'EQ', 'Компрессор', 'Реверб', 'Синтезатор', 'Вокал', 'Мастеринг', 'Эффект',
];

export const BOOKING_STATUS = {
  pending:   { label: 'Ожидает подтверждения', className: 'wait' },
  confirmed: { label: 'Подтверждена',          className: 'ok' },
  declined:  { label: 'Отклонена',             className: 'declined' },
  done:      { label: 'Завершена',             className: 'done' },
};

/** Статус для отображения: прошедшие даты считаем завершёнными */
export const displayStatus = (booking) =>
  booking.is_past ? BOOKING_STATUS.done : (BOOKING_STATUS[booking.status] ?? BOOKING_STATUS.pending);

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
  address: 'Варшава, ул. Космическая, 7',
};
