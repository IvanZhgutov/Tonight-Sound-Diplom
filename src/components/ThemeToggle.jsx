import { useThemeStore } from '../store/themeStore';

// Плавающая кнопка смены темы (справа сверху).
// На мобильных скрыта — там переключатель живёт в бургер-меню.
export default function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const toggle = useThemeStore((s) => s.toggle);

  const dark = theme === 'dark';

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={dark ? 'Включить светлую тему' : 'Включить тёмную тему'}
      title={dark ? 'Светлая тема' : 'Тёмная тема'}
    >
      {dark ? '☀️' : '🌙'}
    </button>
  );
}
