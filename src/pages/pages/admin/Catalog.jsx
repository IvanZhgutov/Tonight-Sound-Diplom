import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import api, { apiError } from '../../api/client';
import { PLUGIN_CATEGORIES } from '../../general/constants';
import { formatPrice } from '../../general/utils';

const PLUGIN_FORM_CATEGORIES = PLUGIN_CATEGORIES.filter((c) => c !== 'Все');

export default function Catalog() {
  const [services, setServices] = useState([]);
  const [plugins, setPlugins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [flash, setFlash] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [servicesRes, pluginsRes] = await Promise.all([
        api.get('/services'),
        api.get('/plugins'),
      ]);
      setServices(servicesRes.data.data ?? []);
      setPlugins(pluginsRes.data.data ?? []);
    } catch (e) {
      setError(apiError(e).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const showFlash = (text) => {
    setFlash(text);
    setTimeout(() => setFlash(''), 3000);
  };

  if (loading) {
    return (
      <div className="glass empty-note">
        <p className="loading-dots">Загружаем каталог</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <AnimatePresence>
        {flash && (
          <motion.div
            className="glass success-banner"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {flash}
          </motion.div>
        )}
        {error && (
          <motion.div
            className="glass empty-note"
            style={{ marginBottom: 20 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="form-error" style={{ marginTop: 0 }}>{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- Цены услуг ---------- */}
      <section className="glass crm-panel">
        <h3>Цены услуг</h3>
        <div className="services-list">
          {services.map((s) => (
            <ServicePriceRow
              key={s.id}
              service={s}
              onSaved={(updated) => {
                setServices((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
                showFlash(`Цена «${updated.name}» сохранена.`);
              }}
              onError={setError}
            />
          ))}
        </div>
        <p className="hint" style={{ marginTop: 14 }}>
          Пустая цена = «по запросу». Уже созданные записи сохраняют свою
          стоимость — новая цена действует только на будущие брони.
        </p>
      </section>

      {/* ---------- Плагины ---------- */}
      <section className="crm-section">
        <h2>Плагины каталога</h2>

        <AddPluginForm
          onAdded={(plugin, message) => {
            setPlugins((prev) => [...prev, plugin]);
            showFlash(message);
          }}
          onError={setError}
        />

        <PluginManageList
          plugins={plugins}
          onDeleted={(id) => {
            setPlugins((prev) => prev.filter((p) => p.id !== id));
            showFlash('Плагин удалён из каталога.');
          }}
          onError={setError}
        />
      </section>
    </motion.div>
  );
}

/* ------------------------------------------------------------------
   Строка услуги с инлайн-редактированием цены
------------------------------------------------------------------ */
function ServicePriceRow({ service, onSaved, onError }) {
  const [value, setValue] = useState(service.price ?? '');
  const [saving, setSaving] = useState(false);

  const dirty = String(value) !== String(service.price ?? '');

  const save = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const { data } = await api.patch(`/admin/services/${service.id}`, {
        price: value === '' ? null : Number(value),
      });
      onSaved(data.service);
    } catch (e) {
      onError(apiError(e).message);
      setValue(service.price ?? '');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="service-row">
      <div className="service-row-info">
        <span className="service-row-icon">{service.icon}</span>
        <div>
          <h4>{service.name}</h4>
          <p>
            {service.hourly ? 'за час' : 'за трек'}
            {!service.bookable && ' · без онлайн-записи'}
          </p>
        </div>
      </div>

      <div className="service-row-price">
        <div className="price-input">
          <input
            type="number"
            min="0"
            step="100"
            placeholder="по запросу"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && dirty && save()}
            aria-label={`Цена услуги ${service.name}`}
          />
          <span>₽</span>
        </div>
        <AnimatePresence>
          {dirty && (
            <motion.button
              type="button"
              className="btn btn-primary btn-save"
              onClick={save}
              disabled={saving}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              {saving ? '…' : 'Сохранить'}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   Форма добавления плагина админом
------------------------------------------------------------------ */
function AddPluginForm({ onAdded, onError }) {
  const [form, setForm] = useState({ name: '', vendor: '', version: '', category: PLUGIN_FORM_CATEGORIES[0] });
  const [saving, setSaving] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (saving || !form.name.trim()) return;
    setSaving(true);
    try {
      const { data } = await api.post('/admin/plugins', {
        name: form.name.trim(),
        vendor: form.vendor.trim() || undefined,
        version: form.version.trim() || undefined,
        category: form.category,
      });
      onAdded(data.plugin, data.message);
      setForm((f) => ({ ...f, name: '', vendor: '', version: '' }));
    } catch (e2) {
      onError(apiError(e2).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="glass crm-panel add-plugin-form" onSubmit={submit}>
      <div className="field">
        <label htmlFor="p-name">Название</label>
        <input id="p-name" type="text" placeholder="Soothe 2" value={form.name} onChange={update('name')} />
      </div>
      <div className="field">
        <label htmlFor="p-vendor">Производитель</label>
        <input id="p-vendor" type="text" placeholder="oeksound" value={form.vendor} onChange={update('vendor')} />
      </div>
      <div className="field">
        <label htmlFor="p-version">Версия</label>
        <input id="p-version" type="text" placeholder="v2.4" value={form.version} onChange={update('version')} />
      </div>
      <div className="field">
        <label htmlFor="p-category">Категория</label>
        <select id="p-category" value={form.category} onChange={update('category')}>
          {PLUGIN_FORM_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn btn-primary" disabled={saving || !form.name.trim()}>
        {saving ? 'Добавляем…' : '+ Добавить плагин'}
      </button>
    </form>
  );
}

/* ------------------------------------------------------------------
   Список плагинов с фильтром и удалением
------------------------------------------------------------------ */
function PluginManageList({ plugins, onDeleted, onError }) {
  const [filter, setFilter] = useState('');

  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return plugins;
    return plugins.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.vendor ?? '').toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [plugins, filter]);

  const remove = async (id) => {
    try {
      await api.delete(`/admin/plugins/${id}`);
      onDeleted(id);
    } catch (e) {
      onError(apiError(e).message);
    }
  };

  return (
    <div className="glass crm-panel" style={{ marginTop: 16 }}>
      <div className="panel-head">
        <h3>В каталоге: {plugins.length}</h3>
        <input
          type="search"
          className="plugin-filter"
          placeholder="Фильтр…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          aria-label="Фильтр плагинов"
        />
      </div>

      <div className="plugin-manage-list">
        <AnimatePresence mode="popLayout">
          {visible.map((p) => (
            <motion.div
              key={p.id}
              className="plugin-manage-row"
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
            >
              <div className="plugin-manage-name">
                <h4>{p.name}</h4>
                <p>
                  {p.vendor ?? '—'}
                  {p.version ? ` · ${p.version}` : ''}
                </p>
              </div>
              <span className="tag">{p.category}</span>
              <button
                type="button"
                className="note-delete"
                onClick={() => remove(p.id)}
                aria-label={`Удалить ${p.name}`}
              >
                Удалить
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {visible.length === 0 && (
          <p className="notes-empty">
            {filter ? `Ничего не нашлось по «${filter}».` : 'Каталог пуст.'}
          </p>
        )}
      </div>
    </div>
  );
}
