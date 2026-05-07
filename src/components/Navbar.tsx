import { NavLink } from 'react-router-dom';
import { PortalIcon } from './PortalIcon';

const navItems = [
  { label: 'Home', to: '/', icon: 'home', route: true },
  { label: 'Projects', to: '/projects', icon: 'projects', route: true },
  { label: 'Quotes', to: '/quotes', icon: 'quotes', route: true },
  { label: 'Documents', to: '#documents', icon: 'documents', route: false },
  { label: 'Messages', to: '#messages', icon: 'messages', route: false },
  { label: 'Invoices', to: '#invoices', icon: 'invoices', route: false },
  { label: 'Payments', to: '#payments', icon: 'payments', route: false },
] as const;

function BrandLogo() {
  return (
    <a className="brand-logo" href="/" aria-label="Mastercraft Products home">
      <span className="brand-logo__name">MASTERCRAFT</span>
      <span className="brand-logo__mark" aria-hidden="true">M</span>
      <span className="brand-logo__rule" aria-hidden="true" />
      <span className="brand-logo__product">PRODUCTS</span>
    </a>
  );
}

function Navbar() {
  return (
    <header className="site-header">
      <div className="content-container site-header__inner">
        <BrandLogo />
        <nav className="app-nav" aria-label="Primary">
          {navItems.map((item) => {
            const content = (
              <>
                <PortalIcon name={item.icon} />
                <span>{item.label}</span>
              </>
            );

            return item.route ? (
              <NavLink
                end={item.to === '/'}
                key={item.label}
                to={item.to}
                className={({ isActive }) => `app-nav__link${isActive ? ' is-active' : ''}`}
              >
                {content}
              </NavLink>
            ) : (
              <a className="app-nav__link" href={item.to} key={item.label}>
                {content}
              </a>
            );
          })}
        </nav>
        <div className="user-chip" aria-label="Signed in as Casmir">
          <span className="user-chip__avatar">C</span>
          <span>Casmir</span>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
