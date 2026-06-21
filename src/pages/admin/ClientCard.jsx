import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import api, { apiError } from '../../api/client';
import { formatPrice, initials } from '../../general/utils';
import { BookingRow } from './Requests';

export default function ClientCard() {
  const { id } = useParams();

  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [tagInput, setTagInput] = useState('');
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/admin/clients/${id}`);
      setClient(data.data);
    } catch (e) {
      setError(apiError(e).message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  /* ---------- Теги ---------- */
  const saveTags = async (tags) => {
    const previous = client.tags;
    setClient((c) => ({ ...c, tags })); // оптимистично
    try {
      await api.patch(`/admin/clients/${id}`, { tags });
    } catch (e) {
      setClient((c) => ({ ...c, tags: previous }));
      setError(apiError(e).message);
    }
  };

  const addTag = (e) => {
    e.preventDefault();
    const tag = tagInput.trim();
    if (!tag || client.tags.includes(tag)) return setTagInput('');
    saveTags([...client.tags, tag]);
    setTagInput('');
  };

  const removeTag = (tag) => saveTags(client.tags.filter((t) => t !== tag));

  /* ---------- Воронка записи ---------- */
  const setBookingStatus = async (bookingId, status) => {
    try {
      const { data } = await api.patch(`/admin/bookings/${bookingId}/status`, { status });
      // обновляем запись и перезапрашиваем агрегаты (оплата меняет цифры)
      setClient((c) => ({
        ...c,
        bookings: c.bookings.map((b) => (b.id === bookingId ? data.booking : b)),
      }));
      const { data: fresh } = await api.get(`/admin/clients/${id}`);
      setClient(fresh.data);
    } catch (e) {
      setError(apiError(e).message);
    }
  };

  /* ---------- Заметки ---------- */
  const addNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim() || savingNote) return;
    setSavingNote(true);
    try {
      const { data } = await api.post(`/admin/clients/${id}/notes`, { text: noteText.trim() });
      setClient((c) => ({ ...c, notes: [data.note, ...c.notes] }));
      setNoteText('');
    } catch (e2) {
      setError(apiError(e2).message);
    } finally {
      setSavingNote(false);
    }
  };

  const deleteNote = async (noteId) => {
    const previous = client.notes;
    setClient((c) => ({ ...c, notes: c.notes.filter((n) => n.id !== noteId) }));
    try {
      await api.delete(`/admin/notes/${noteId}`);
    } catch (e) {
      setClient((c) => ({ ...c, notes: previous }));
      setError(apiError(e).message);
    }
  };

  /* ---------- Рендер ---------- */
  if (loading && !client) {
    return (
      <div className="glass empty-note">
        <p className="loading-dots">Открываем карточку клиента</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="glass empty-note">
        <p className="form-error" style={{ marginTop: 0 }}>{error || 'Клиент не найден.'}</p>
        <Link to="/admin/clients" className="btn btn-ghost" style={{ marginTop: 16 }}>
          ← К списку клиентов
        </Link>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <Link to="/admin/clients" className="back-link">← Все клиенты</Link>

      {error && (
        <div className="glass empty-note" style={{ margin: '16px 0' }}>
          <p className="form-error" style={{ marginTop: 0 }}>{error}</p>
        </div>
      )}

      {/* Профиль */}
      <section className="glass profile-head" style={{ margin: '16px 0 20px' }}>
        <div className="profile-user">
          <div className="avatar">{initials(client.name)}</div>
          <div>
            <h1>{client.name}</h1>
            <p>
              {client.email}
              {client.phone && ` · ${client.phone}`}
            </p>
          </div>
        </div>
      </section>

      {/* Теги */}
      <section className="glass crm-panel">
        <h3>Теги</h3>
        <div className="tags-editor">
          {client.tags.map((t) => (
            <button
              key={t}
              type="button"
              className="tag tag-removable"
              onClick={() => removeTag(t)}
              title="Убрать тег"
            >
              {t} ×
            </button>
          ))}
          <form onSubmit={addTag} className="tag-form">
            <input
              type="text"
              placeholder="+ новый тег"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              maxLength={24}
            />
          </form>
        </div>
      </section>

      {/* Метрики */}
      <div className="admin-stats stats-2" style={{ marginTop: 20 }}>
        <div className="glass admin-stat">
          <strong>{client.bookings_count}</strong>
          <span>визитов всего</span>
        </div>
        <div className="glass admin-stat">
          <strong>{formatPrice(client.total_spent)}</strong>
          <span>оплачено студии</span>
        </div>
      </div>

      {/* История записей */}
      <section className="crm-section">
        <h2>История записей</h2>
        <div className="bookings-list">
          {client.bookings.map((b) => (
            <BookingRow key={b.id} booking={b} onAction={setBookingStatus} showClient={false} />
          ))}
          {client.bookings.length === 0 && (
            <div className="glass empty-note">
              <p>У клиента ещё не было записей.</p>
            </div>
          )}
        </div>
      </section>

      {/* Заметки */}
      <section className="crm-section">
        <h2>Заметки инженера</h2>
        <form onSubmit={addNote} className="glass crm-panel note-form">
          <textarea
            rows="2"
            placeholder="Например: предпочитает плотную компрессию на вокале, приходит с гитаристом…"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" disabled={savingNote || !noteText.trim()}>
            {savingNote ? 'Сохраняем…' : 'Добавить'}
          </button>
        </form>

        <div className="notes-list">
          <AnimatePresence mode="popLayout">
            {client.notes.map((n) => (
              <motion.article
                key={n.id}
                className="glass note-item"
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -30 }}
              >
                <p>{n.text}</p>
                <div className="note-meta">
                  <span>
                    {n.author} · {new Date(n.created_at).toLocaleDateString('ru-RU')}
                  </span>
                  <button type="button" className="note-delete" onClick={() => deleteNote(n.id)}>
                    Удалить
                  </button>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
          {client.notes.length === 0 && (
            <p className="notes-empty">Заметок пока нет — добавь первую, чтобы помнить детали о клиенте.</p>
          )}
        </div>
      </section>
    </motion.div>
  );
}
