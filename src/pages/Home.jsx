import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import Footer from '../components/Footer';
import Equalizer from '../components/Equalizer';
import ImagePlaceholder from '../components/ImagePlaceholder';
import Reveal, { staggerContainer, staggerItem } from '../components/Reveal';
import { SERVICES, HERO_STATS, STUDIO_FEATURES, EQUIPMENT } from '../general/constants';
import { formatPrice } from '../general/utils';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function Home() {
  useDocumentTitle();

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
              Студия звукозаписи · Варшава
            </motion.span>
            <motion.h1 variants={staggerItem}>
              Звук, который <span className="accent">слышно из космоса</span>
            </motion.h1>
            <motion.p className="lead" variants={staggerItem}>
              Запись вокала, сведение и мастеринг в студии с акустически
              подготовленными комнатами и парком из 120+ плагинов.
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
            <p className="eq-caption">Live с пульта · комната A</p>
          </motion.div>
        </section>

        {/* Услуги */}
        <section className="section">
          <div className="container">
            <Reveal className="section-head">
              <span className="eyebrow">Услуги</span>
              <h2>Что мы делаем</h2>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum
                gravida sapien at sound design, sed commodo nisl pulvinar a.
              </p>
            </Reveal>
            <motion.div
              className="grid-3"
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-80px' }}
            >
              {SERVICES.map((s) => (
                <motion.article className="glass card" key={s.id} variants={staggerItem}>
                  <div className="card-icon">{s.icon}</div>
                  <h3>{s.name}</h3>
                  <p>{s.desc}</p>
                  <span className="price">
                    {s.price == null
                      ? 'по запросу'
                      : `от ${formatPrice(s.price)} / ${s.hourly ? 'час' : 'трек'}`}
                  </span>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </section>

        {/* О студии */}
        <section className="section">
          <div className="container about">
            <Reveal>
              <ImagePlaceholder label="Фото студии" variant="tall" />
            </Reveal>
            <Reveal delay={0.1}>
              <span className="eyebrow">О студии</span>
              <h2>Две комнаты, один уровень качества</h2>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat.
              </p>
              <p>
                Duis aute irure dolor in reprehenderit in voluptate velit esse
                cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                cupidatat non proident, sunt in culpa qui officia.
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
            <motion.div
              className="grid-4"
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-80px' }}
            >
              {EQUIPMENT.map((item) => (
                <motion.article className="glass card equip-card" key={item.model} variants={staggerItem}>
                  <div className="card-icon">{item.icon}</div>
                  <span className="equip-type">{item.type}</span>
                  <h3>{item.model}</h3>
                </motion.article>
              ))}
            </motion.div>
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
                Выбери удобный день и время — подтверждение придёт на почту,
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
