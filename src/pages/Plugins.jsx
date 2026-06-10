import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import Footer from '../components/Footer';
import { PLUGINS, PLUGIN_CATEGORIES } from '../general/constants';
import { usePluginStore } from '../store/pluginStore';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function Plugins() {
  useDocumentTitle('Плагины');

  const requested = usePluginStore((s) => s.requested);
  const requestPlugin = usePluginStore((s) => s.requestPlugin);

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Все');
  const [requestName, setRequestName] = useState('');
  const [feedback, setFeedback] = useState(null); // { type: 'ok' | 'error', text }

  const allPlugins = useMemo(() => [...PLUGINS, ...requested], [requested]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allPlugins.filter((p) => {
      const matchesQuery =
        !q || p.name.toLowerCase().includes(q) || p.vendor.toLowerCase().includes(q);
      const matchesCategory = category === 'Все' || p.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [allPlugins, query, category]);

  const handleRequest = (e) => {
    e.preventDefault();
    const result = requestPlugin(requestName);
    if (result.ok) {
      setFeedback({ type: 'ok', text: `«${requestName.trim()}» добавлен в список — скоро он появится в студии!` });
      setRequestName('');
    } else {
      setFeedback({ type: 'error', text: result.error });
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
            Ищи по названию или фильтруй по категории.
          </p>
        </div>

        {/* Поиск и фильтры */}
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
          <div className="chips">
            {PLUGIN_CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                className={`chip${c === category ? ' active' : ''}`}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Сетка плагинов */}
        <motion.div className="plugins-grid" layout>
          <AnimatePresence mode="popLayout">
            {visible.map((p) => (
              <motion.article
                key={p.id}
                className="glass plugin-card"
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25 }}
              >
                <div className="plugin-meta">
                  <h3>{p.name}</h3>
                  <span className={`tag${p.pending ? ' tag-soon' : ''}${p.category === 'Новинка' ? ' tag-new' : ''}`}>{p.category}</span>
                </div>
                <span className="vendor">
                  {p.vendor} · {p.version}
                </span>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>

        {visible.length === 0 && (
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
            <button type="submit" className="btn btn-primary">Добавить</button>
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

      <Footer compact />
    </PageTransition>
  );
}
