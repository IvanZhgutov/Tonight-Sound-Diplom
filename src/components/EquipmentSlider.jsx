import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const GAP = 20;

/**
 * EquipmentSlider — бесконечный слайдер-лента.
 * Карточки лежат в одной непрерывной дорожке (массив утроен),
 * дорожка плавно сдвигается по X. Когда позиция уходит за пределы
 * средней копии — мгновенный бесшовный сброс назад (визуально незаметен,
 * потому что копии идентичны).
 */
export default function EquipmentSlider({ items }) {
  const N = items.length;
  const extended = [...items, ...items, ...items]; // три копии для бесконечности

  const [pos, setPos] = useState(N);       // стартуем в средней копии
  const [instant, setInstant] = useState(false); // мгновенный сброс без анимации
  const [metrics, setMetrics] = useState({ slideW: 0, visible: 3 });

  const viewportRef = useRef(null);
  const dragStart = useRef(0);

  // Измеряем ширину карточки под текущий размер экрана
  useEffect(() => {
    const measure = () => {
      const el = viewportRef.current;
      if (!el) return;
      const visible = window.innerWidth <= 960 ? 1 : 3;
      const slideW = (el.offsetWidth - GAP * (visible - 1)) / visible;
      setMetrics({ slideW, visible });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const go = (dir) => {
    setInstant(false);
    setPos((p) => p + dir);
  };

  // После завершения анимации: если уехали из средней копии —
  // бесшовно перепрыгиваем обратно на идентичную карточку
  const handleComplete = () => {
    setPos((p) => {
      if (p >= 2 * N) { setInstant(true); return p - N; }
      if (p < N)      { setInstant(true); return p + N; }
      return p;
    });
  };

  // После мгновенного сброса возвращаем плавность
  useEffect(() => {
    if (!instant) return;
    const id = requestAnimationFrame(() => setInstant(false));
    return () => cancelAnimationFrame(id);
  }, [instant]);

  // Свайп
  const onDragStart = (e) => {
    dragStart.current = e.touches ? e.touches[0].clientX : e.clientX;
  };
  const onDragEnd = (e) => {
    const end = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const delta = dragStart.current - end;
    if (Math.abs(delta) > 40) go(delta > 0 ? 1 : -1);
  };

  const x = -(pos * (metrics.slideW + GAP));
  const activeIndex = pos + (metrics.visible === 3 ? 1 : 0); // центральная карточка
  const current = ((pos % N) + N) % N; // для точек

  return (
    <div className="equip-slider">
      <button
        type="button"
        className="slider-btn"
        onClick={() => go(-1)}
        aria-label="Предыдущий"
      >
        ‹
      </button>

      <div
        className="equip-slider-viewport"
        ref={viewportRef}
        onMouseDown={onDragStart}
        onMouseUp={onDragEnd}
        onTouchStart={onDragStart}
        onTouchEnd={onDragEnd}
      >
        <motion.div
          className="equip-slider-row"
          animate={{ x }}
          transition={
            instant
              ? { duration: 0 }
              : { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
          }
          onAnimationComplete={handleComplete}
        >
          {extended.map((item, i) => {
            const isActive = i === activeIndex;
            return (
              <motion.article
                key={i}
                className={`glass equip-slide${isActive ? ' equip-slide-active' : ''}`}
                style={{ width: metrics.slideW || '100%' }}
                animate={{
                  scale: isActive ? 1 : 0.93,
                  opacity: isActive ? 1 : 0.55,
                }}
                transition={
                  instant
                    ? { duration: 0 }
                    : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
                }
              >
                {item.img ? (
                  <img
                    src={item.img}
                    alt={item.model}
                    className="equip-slide-img"
                    draggable="false"
                  />
                ) : (
                  <div className="equip-slide-placeholder">{item.type}</div>
                )}
                <div className="equip-slide-info">
                  <span className="equip-type">{item.type}</span>
                  <h3>{item.model}</h3>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>

      <button
        type="button"
        className="slider-btn"
        onClick={() => go(1)}
        aria-label="Следующий"
      >
        ›
      </button>

      <div className="slider-dots">
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`slider-dot${i === current ? ' active' : ''}`}
            onClick={() => {
              // кратчайший путь к нужному слайду внутри средней копии
              setInstant(false);
              setPos(N + i + Math.round((pos - N - i) / N) * N);
            }}
            aria-label={`Слайд ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
