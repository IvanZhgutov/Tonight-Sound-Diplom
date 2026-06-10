// Все константы приложения Tonight Sound

export const NAV_LINKS = [
  { to: '/', label: 'Главная' },
  { to: '/booking', label: 'Запись' },
  { to: '/plugins', label: 'Плагины' },
  { to: '/profile', label: 'Профиль' },
];

// bookable — услуга доступна для онлайн-записи на странице «Запись»
export const SERVICES = [
  { id: 'vocal',     name: 'Запись вокала',      price: 1500, hourly: true,  icon: '🎙️', bookable: true,  desc: 'Пишем вокал на Neumann TLM 102 в тихой подготовленной комнате. Поможем с дублями, подскажем по подаче и соберём черновой микс сразу после сессии.' },
  { id: 'mixing',    name: 'Сведение',           price: 4000, hourly: false, icon: '🎚️', bookable: false, desc: 'Балансы, частоты, динамика и пространство — доведём трек до уверенного звучания на любых системах, от наушников до клубного саба.' },
  { id: 'mastering', name: 'Мастеринг',          price: 2500, hourly: false, icon: '💿', bookable: false, desc: 'Финальная полировка: громкость под стриминговые платформы, ширина и плотность без потери динамики. Отдаём версии под все площадки.' },
  { id: 'arrange',   name: 'Аранжировка',        price: 8000, hourly: false, icon: '🎛️', bookable: true,  desc: 'Соберём аранжировку под ваш референс или с нуля: бит, гармония, структура и продакшн до состояния «можно записывать вокал».' },
  { id: 'podcast',   name: 'Подкасты и озвучка', price: 1200, hourly: true,  icon: '🎧', bookable: true,  desc: 'Запись подкастов, озвучки и аудиокниг с чисткой дорожек от шумов, щелчков и лишних пауз. Готовые файлы — под монтаж или сразу в эфир.' },
  { id: 'produce',   name: 'Продюсирование',     price: null, hourly: false, icon: '🚀', bookable: false, desc: 'Полный цикл: от идеи и демки до релиза. Поможем с концепцией, звуком, сведением и подготовкой трека к дистрибуции.' },
];

export const BOOKABLE_SERVICES = SERVICES.filter((s) => s.bookable);

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

export const PLUGINS = [
  { id: 1,  name: 'FabFilter Pro-Q 3',    vendor: 'FabFilter',          version: 'v3.24',  category: 'EQ' },
  { id: 2,  name: 'FabFilter Pro-C 2',    vendor: 'FabFilter',          version: 'v2.18',  category: 'Компрессор' },
  { id: 3,  name: 'FabFilter Pro-L 2',    vendor: 'FabFilter',          version: 'v2.12',  category: 'Мастеринг' },
  { id: 4,  name: 'FabFilter Saturn 2',   vendor: 'FabFilter',          version: 'v2.08',  category: 'Эффект' },
  { id: 5,  name: 'Valhalla VintageVerb', vendor: 'Valhalla DSP',       version: 'v4.0',   category: 'Реверб' },
  { id: 6,  name: 'Valhalla Room',        vendor: 'Valhalla DSP',       version: 'v2.1',   category: 'Реверб' },
  { id: 7,  name: 'Raum',                 vendor: 'Native Instruments', version: 'v1.4',   category: 'Реверб' },
  { id: 8,  name: 'Serum',                vendor: 'Xfer Records',       version: 'v1.36',  category: 'Синтезатор' },
  { id: 9,  name: 'Massive X',            vendor: 'Native Instruments', version: 'v1.5',   category: 'Синтезатор' },
  { id: 10, name: 'Pigments 5',           vendor: 'Arturia',            version: 'v5.1',   category: 'Синтезатор' },
  { id: 11, name: 'Omnisphere 2',         vendor: 'Spectrasonics',      version: 'v2.8',   category: 'Синтезатор' },
  { id: 12, name: 'Kontakt 7',            vendor: 'Native Instruments', version: 'v7.10',  category: 'Синтезатор' },
  { id: 13, name: 'Auto-Tune Pro X',      vendor: 'Antares',            version: 'v10.3',  category: 'Вокал' },
  { id: 14, name: 'Melodyne 5 Studio',    vendor: 'Celemony',           version: 'v5.4',   category: 'Вокал' },
  { id: 15, name: 'Nectar 4',             vendor: 'iZotope',            version: 'v4.0',   category: 'Вокал' },
  { id: 16, name: 'CLA-2A',               vendor: 'Waves',              version: 'v15',    category: 'Компрессор' },
  { id: 17, name: 'CLA-76',               vendor: 'Waves',              version: 'v15',    category: 'Компрессор' },
  { id: 18, name: 'SSL G-Master Buss',    vendor: 'Waves',              version: 'v15',    category: 'Компрессор' },
  { id: 19, name: 'Ozone 11 Advanced',    vendor: 'iZotope',            version: 'v11.1',  category: 'Мастеринг' },
  { id: 20, name: 'API 550',              vendor: 'Waves',              version: 'v15',    category: 'EQ' },
  { id: 21, name: 'Fresh Air',            vendor: 'Slate Digital',      version: 'v1.0',   category: 'EQ' },
  { id: 22, name: 'Soothe 2',             vendor: 'oeksound',           version: 'v2.4',   category: 'Эффект' },
  { id: 23, name: 'Decapitator',          vendor: 'Soundtoys',          version: 'v5.3',   category: 'Эффект' },
  { id: 24, name: 'EchoBoy',              vendor: 'Soundtoys',          version: 'v5.3',   category: 'Эффект' },
  { id: 25, name: 'H-Delay',              vendor: 'Waves',              version: 'v15',    category: 'Эффект' },
  { id: 26, name: 'RC-20 Retro Color',    vendor: 'XLN Audio',          version: 'v1.2',   category: 'Эффект' },
];

export const BOOKING_STATUS = {
  wait:      { label: 'Ожидает подтверждения', className: 'wait' },
  confirmed: { label: 'Подтверждена',          className: 'ok' },
  declined:  { label: 'Отклонена',             className: 'declined' },
  done:      { label: 'Завершена',             className: 'done' },
};

// Мок-доступ в админку (без бэкенда). При подключении бэкенда — убрать.
export const ADMIN_CREDENTIALS = {
  email: 'admin@tonightsound.studio',
  password: 'admin123',
};

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
