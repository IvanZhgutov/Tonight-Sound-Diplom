import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import Footer from '../components/Footer';
import { PLUGIN_CATEGORIES } from '../general/constants';
import { useCatalogStore } from '../store/catalogStore';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

// Порядок секций: базовые категории + динамические от запросов артистов
const BASE_ORDER = PLUGIN_CATEGORIES.filter((c) => c !== 'Все');
const EXTRA_ORDER = ['Новинка', 'Скоро'];

export default function Plugins() {
  useDocumentTitle('Плагины');

  const plugins = useCatalogStore((s) => s.plugins);
  const pluginsLoading = useCatalogStore((s) => s.pluginsLoading);
  const pluginsFetched = useCatalogStore((s) => s.pluginsFetched);
  const fetchPlugins = useCatalogStore((s) => s.fetchPlugins);
  const requestPlugin = useCatalogStore((s) => s.requestPlugin);

  const [query, setQuery] = useState('');
  const [openCats, setOpenCats] = useState(() => new Set([BASE_ORDER[0]]));
  const [requestName, setRequestName] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'ok' | 'error', text }

  useEffect(() => {
    if (!pluginsFetched) fetchPlugins();
  }, [pluginsFetched, fetchPlugins]);

  const searching = query.trim().length > 0;

  // Группируем по категориям; при активном поиске оставляем только совпадения
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = plugins.filter(
      (p) =>
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.vendor ?? '').toLowerCase().includes(q)
    );
    const order = [...BASE_ORDER, ...EXTRA_ORDER];
    return order
      .map((category) => ({
        category,
        items: filtered.filter((p) => p.category === category),
      }))
      .filter((g) => g.items.length > 0);
  }, [plugins, query]);

  const totalFound = groups.reduce((sum, g) => sum + g.items.length, 0);

  const toggleCat = (category) => {
    setOpenCats((prev) => {
      const next = new Set(prev);
      next.has(category) ? next.delete(category) : next.add(category);
      return next;
    });
  };

  const handleRequest = async (e) => {
    e.preventDefault();
    if (requesting) return;
    setRequesting(true);
    const result = await requestPlugin(requestName.trim());
    setRequesting(false);
    if (result.ok) {
      setFeedback({ type: 'ok', text: result.message });
      setRequestName('');
    } else {
      setFeedback({ type: 'error', text: result.message });
    }
  };

  return (
    <PageTransition>
      <main className="container">
        <div className="page-head">
          <span className="eyebrow">Парк плагинов</span>
          <h1>
            Плагины <span className="accent">студии</span>
          </h1>
          <p>
            Всё, что установлено на наших машинах и доступно на любой сессии.
            Открывай категорию или ищи по названию.
          </p>
        </div>

        {/* Поиск */}
        <div className="plugins-toolbar">
          <div className="search">
            <input
              type="search"
              placeholder="Найти плагин, например «Pro-Q 3»"
              aria-label="Поиск плагина"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          {searching && (
            <span className="search-count">
              найдено: {totalFound}
            </span>
          )}
        </div>

        {pluginsLoading && plugins.length === 0 && (
          <div className="glass empty-note" style={{ marginTop: 28 }}>
            <p className="loading-dots">Загружаем каталог плагинов</p>
          </div>
        )}

        {/* Категории-аккордеоны */}
        <div className="acc-list">
          {groups.map(({ category, items }) => {
            // при поиске все совпавшие категории раскрыты принудительно
            const open = searching || openCats.has(category);
            return (
              <section key={category} className="glass acc-group">
                <button
                  type="button"
                  className="acc-head"
                  onClick={() => toggleCat(category)}
                  aria-expanded={open}
                >
                  <span className="acc-title">{category}</span>
                  <span className="acc-count">{items.length}</span>
                  <motion.span
                    className="acc-chevron"
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    ▾
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      className="acc-body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="plugins-grid">
                        {items.map((p) => (
                          <article key={p.id} className="glass plugin-card">
                            <div className="plugin-meta">
                              <h3>{p.name}</h3>
                              {(p.status === 'requested' || p.status === 'new') && (
                                <span className={`tag ${p.status === 'requested' ? 'tag-soon' : 'tag-new'}`}>
                                  {p.status === 'requested' ? 'Скоро' : 'Новинка'}
                                </span>
                              )}
                            </div>
                            <span className="vendor">
                              {p.vendor}{p.version ? ` · ${p.version}` : ''}
                            </span>
                          </article>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            );
          })}
        </div>

        {!pluginsLoading && groups.length === 0 && plugins.length > 0 && (
          <motion.div
            className="glass empty-note"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p>
              По запросу «{query}» ничего не нашлось. Возможно, этого плагина у нас
              пока нет — закажи его в форме ниже!
            </p>
          </motion.div>
        )}

        {/* Запрос плагина */}
        <section className="glass plugin-request">
          <span className="eyebrow">Чего-то не хватает?</span>
          <h2>Не нашли плагин?</h2>
          <p>
            Напишите его нам и мы скоро его добавим! Мы регулярно пополняем
            парк по запросам артистов.
          </p>
          <form className="request-form" onSubmit={handleRequest}>
            <input
              type="text"
              placeholder="Название плагина, например «Soothe 2»"
              aria-label="Название плагина"
              value={requestName}
              onChange={(e) => {
                setRequestName(e.target.value);
                setFeedback(null);
              }}
            />
            <button type="submit" className="btn btn-primary" disabled={requesting}>
              {requesting ? 'Отправляем…' : 'Добавить'}
            </button>
          </form>
          <AnimatePresence>
            {feedback && (
              <motion.p
                className={feedback.type === 'ok' ? 'form-success' : 'form-error'}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                {feedback.text}
              </motion.p>
            )}
          </AnimatePresence>
        </section>

        <div style={{ paddingBottom: 96 }} />
      </main>

      <Footer />
    </PageTransition>
  );
}
