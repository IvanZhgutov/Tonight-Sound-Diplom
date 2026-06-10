# Tonight Sound — студия звукозаписи

Космически-синий dark mode, глассморфизм, React.

## Стек
- **React 18** + Vite
- **react-router-dom** — страницы: /, /booking, /plugins, /login, /register, /profile, /admin
- **Framer Motion** — переходы страниц, stagger-карточки, анимации календаря и форм
- **Zustand (persist)** — авторизация, записи, черновик формы и запросы плагинов в localStorage

## Запуск
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # продакшен-сборка в dist/
```

## Админ-панель
Вход на странице /login с мок-учёткой (см. general/constants.js):
- email: `admin@tonightsound.studio`
- пароль: `admin123`

В админке: подтверждение/отклонение заявок на запись и обработка
запросов плагинов («Добавлен» → плагин получает тег «Новинка» в общем списке).

## Структура
```
src/
  assets/         # fonts, icons (пока пусто — шрифты через Google Fonts)
  components/     # Header (с бургер-меню), Footer, Equalizer, PageTransition,
                  # ProtectedRoute, AdminRoute...
  pages/          # Home, Booking, Plugins, Login, Register, Profile, Admin
  hooks/          # useDocumentTitle
  store/          # authStore, bookingStore, pluginStore (Zustand)
  general/        # constants.js, utils.js
  styles/         # index.css
```

## Что работает
- Запись: день выбирается в недельном виде или в календаре (после выбора
  календарь сворачивается; если день дальше недели — неделя начинается с него);
  время — мультивыбор часов 00:00–23:00 (3 ряда, дальше скролл); Telegram ID.
- Черновик формы хранится в bookingStore — выбор не теряется после
  ухода на /login или перезагрузки страницы.
- Без авторизации кнопка «Подтвердить запись» disabled с подсказкой войти.
- Профиль (/profile): записи пользователя, отмена, статусы, кнопка «Выйти».
- Плагины: категории-аккордеоны + живой поиск (раскрывает совпадения),
  запрошенный плагин появляется с тегом «Скоро», после одобрения админом — «Новинка».
- Мобильный адаптив: бургер-меню, перестроенные сетки и панели.

## Примечание
Авторизация и админ-доступ — мок на localStorage (пароли в открытом виде).
При подключении бэкенда заменяется store/authStore.js и константа
ADMIN_CREDENTIALS.

## Фото оборудования
Карточки на главной готовы под фотографии: положи файлы в src/assets
и укажи их в поле img в EQUIPMENT (general/constants.js) — заглушка
заменится автоматически.
