import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import Footer from '../components/Footer';
import Equalizer from '../components/Equalizer';
import EquipmentSlider from '../components/EquipmentSlider';
import StudioPhotoSlider from '../components/StudioPhotoSlider';
import Reveal, { staggerContainer, staggerItem } from '../components/Reveal';
import { useEffect } from 'react';
import { HERO_STATS, STUDIO_FEATURES, EQUIPMENT } from '../general/constants';
import { useCatalogStore } from '../store/catalogStore';
import { formatPrice } from '../general/utils';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function Home() {
  useDocumentTitle();

  const services = useCatalogStore((s) => s.services);
  const servicesFetched = useCatalogStore((s) => s.servicesFetched);
  const fetchServices = useCatalogStore((s) => s.fetchServices);

  useEffect(() => {
    if (!servicesFetched) fetchServices();
  }, [servicesFetched, fetchServices]);

  return (
    <PageTransition>
      <main>
        {/* Hero */}
        <section className="container hero">
          <motion.div
            initial="hidden"
            animate="show"
            variants={staggerContainer}
          >
            <motion.span className="eyebrow" variants={staggerItem}>
              Студия звукозаписи · Сергиев Посад
            </motion.span>
            <motion.h1 variants={staggerItem}>
              Звук, который <span className="accent">слышно из космоса</span>
            </motion.h1>
            <motion.p className="lead" variants={staggerItem}>
              Запись вокала, аранжировки и подкасты в акустически
              подготовленной комнате с парком из 120+ плагинов.
              Запишись онлайн — выбери день и время за минуту.
            </motion.p>
            <motion.div className="hero-actions" variants={staggerItem}>
              <Link to="/booking" className="btn btn-primary">Выбрать время</Link>
              <Link to="/plugins" className="btn btn-ghost">Смотреть плагины</Link>
            </motion.div>
            <motion.div className="hero-meta" variants={staggerItem}>
              {HERO_STATS.map(({ value, label }) => (
                <div key={label}>
                  <strong>{value}</strong>
                  <span>{label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            className="hero-visual glass"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <Equalizer />
            <p className="eq-caption">Live с пульта студии</p>
          </motion.div>
        </section>

        {/* Услуги */}
        <section className="section">
          <div className="container">
            <Reveal className="section-head">
              <span className="eyebrow">Услуги</span>
              <h2>Что мы делаем</h2>
              <p>
                От первой демки до мастера, готового к загрузке на площадки.
                Бери отдельную услугу или закрывай весь продакшн в одном месте.
              </p>
            </Reveal>
            <motion.div
              className="grid-3"
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-80px' }}
            >
              {services.map((s) => (
                <motion.article className="glass card" key={s.slug} variants={staggerItem}>
                  <div className="card-icon">{s.icon}</div>
                  <h3>{s.name}</h3>
                  <p>{s.description}</p>
                  <span className="price">
                    {s.price == null
                      ? 'по запросу'
                      : `от ${formatPrice(s.price)} / ${s.hourly ? 'час' : 'трек'}`}
                  </span>
                </motion.article>
              ))}
              {!services.length && (
                <p className="loading-dots" style={{ gridColumn: '1 / -1' }}>
                  Загружаем услуги
                </p>
              )}
            </motion.div>
          </div>
        </section>

        {/* О студии */}
        <section className="section">
          <div className="container about">
            <Reveal>
              <StudioPhotoSlider />
            </Reveal>
            <Reveal delay={0.1}>
              <span className="eyebrow">О студии</span>
              <h2>Пространство, где рождается звук</h2>
              <p>
                Tonight Sound — компактная студия в центре Варшавы. Одна
                акустически подготовленная комната, проверенная цепочка записи
                и инженер, который слышит, что нужно именно твоему треку.
              </p>
              <p>
                Мы не гонимся за потоком сессий: работаем вдумчиво, помогаем
                артисту раскрыться у микрофона и доводим каждую запись до
                результата, который не стыдно поставить друзьям и лейблам.
              </p>
              <ul className="about-list">
                {STUDIO_FEATURES.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        {/* Оборудование */}
        <section className="section">
          <div className="container">
            <Reveal className="section-head">
              <span className="eyebrow">Оборудование</span>
              <h2>На чём пишем звук</h2>
            </Reveal>
            <Reveal>
              <EquipmentSlider items={EQUIPMENT} />
            </Reveal>
          </div>
        </section>

        {/* CTA */}
        <section className="section">
          <div className="container">
            <Reveal className="glass cta">
              <h2>
                Готов записать <span className="accent">свой трек</span>?
              </h2>
              <p>
                Выбери удобный день и время — мы свяжемся с тобой в Telegram,
                а запись появится в твоём личном кабинете.
              </p>
              <Link to="/booking" className="btn btn-primary">Записаться на сессию</Link>
            </Reveal>
          </div>
        </section>
      </main>

      <Footer />
    </PageTransition>
  );
}
