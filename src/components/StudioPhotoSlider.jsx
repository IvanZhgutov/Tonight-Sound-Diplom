import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const STUDIO_PHOTOS = [
  '/images/studio_photos/1.webp',
  '/images/studio_photos/2.webp',
  '/images/studio_photos/3.webp',
  '/images/studio_photos/4.webp',
  '/images/studio_photos/5.webp',
];

const INTERVAL = 5000; // 5 секунд

export default function StudioPhotoSlider() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  // Авто-смена каждые 5 секунд
  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setIndex((prev) => (prev + 1) % STUDIO_PHOTOS.length);
    }, INTERVAL);
    return () => clearInterval(timer);
  }, []);

  const variants = {
    enter: (dir) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
    center: { opacity: 1, x: 0 },
    exit: (dir) => ({ opacity: 0, x: dir > 0 ? -60 : 60 }),
  };

  return (
    <div className="studio-photo-slider">
      <AnimatePresence mode="crossfade" custom={direction} initial={false}>
        <motion.img
          key={index}
          src={STUDIO_PHOTOS[index]}
          alt={`Студия Tonight Sound — фото ${index + 1}`}
          className="studio-photo"
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          draggable="false"
        />
      </AnimatePresence>

      {/* Прогресс-бар */}
      <div className="studio-photo-bar">
        {STUDIO_PHOTOS.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`studio-photo-dot${i === index ? ' active' : ''}`}
            onClick={() => {
              setDirection(i > index ? 1 : -1);
              setIndex(i);
            }}
            aria-label={`Фото ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
