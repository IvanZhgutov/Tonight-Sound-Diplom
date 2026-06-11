import { NavLink, Outlet } from 'react-router-dom';
import PageTransition from '../../components/PageTransition';
import Footer from '../../components/Footer';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

const SECTIONS = [
  { to: '/admin', label: 'Заявки', end: true },
  { to: '/admin/clients', label: 'Клиенты' },
  { to: '/admin/catalog', label: 'Каталог' },
  { to: '/admin/analytics', label: 'Аналитика' },
];

export default function AdminLayout() {
  useDocumentTitle('CRM');

  return (
    <PageTransition>
      <main className="container">
        <div className="page-head">
          <span className="eyebrow">Служебная зона</span>
          <h1>
            CRM <span className="accent">Tonight Sound</span>
          </h1>
        </div>

        <nav className="chips admin-tabs">
          {SECTIONS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `chip${isActive ? ' active' : ''}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <Outlet />
      </main>

      <Footer />
    </PageTransition>
  );
}
