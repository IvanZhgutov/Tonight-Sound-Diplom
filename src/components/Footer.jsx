import { Link } from 'react-router-dom';
import Logo from './Logo';
import { NAV_LINKS, CONTACTS } from '../general/constants';

export default function Footer({ compact = false }) {
  return (
    <footer className="footer">
      <div className="container">
        {!compact && (
          <div className="footer-grid">
            <div>
              <Logo />
              <p>Студия звукозаписи полного цикла: от первой демки до релиза на площадках.</p>
            </div>
            <div>
              <h4>Навигация</h4>
              <ul>
                {NAV_LINKS.map(({ to, label }) => (
                  <li key={to}>
                    <Link to={to}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Контакты</h4>
              <ul>
                <li><a href={`mailto:${CONTACTS.email}`}>{CONTACTS.email}</a></li>
                <li><a href={`tel:${CONTACTS.phone.replace(/\s/g, '')}`}>{CONTACTS.phone}</a></li>
                <li><a href="#">{CONTACTS.address}</a></li>
              </ul>
            </div>
          </div>
        )}
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Tonight Sound. Все права защищены.</span>
          <span>Сделано среди звёзд ✦</span>
        </div>
      </div>
    </footer>
  );
}
