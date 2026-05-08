import { NavLink, useLocation } from "react-router-dom";
import { PortalIcon } from "./PortalIcon";

const primaryNavItems = [
  { label: "Home", to: "/", icon: "home", route: true },
  { label: "Projects", to: "/projects", icon: "projects", route: true },
  { label: "Quotes", to: "/quotes", icon: "quotes", route: true },
] as const;

const secondaryNavItems = [
  { label: "Documents", to: "/documents", icon: "documents", route: true },
  // { label: 'Messages', to: '#messages', icon: 'messages', route: false },
  { label: "Invoices", to: "/invoices", icon: "invoices", route: true },
  { label: "Payments", to: "/payments", icon: "payments", route: true },
] as const;

function BrandLogo() {
  return (
    <a className="brand-logo" href="/" aria-label="Mastercraft Products home">
      <span className="brand-logo__name">MASTERCRAFT</span>
      <span className="brand-logo__mark" aria-hidden="true">
        M
      </span>
      <span className="brand-logo__rule" aria-hidden="true" />
      <span className="brand-logo__product">PRODUCTS</span>
    </a>
  );
}

function Navbar() {
  const location = useLocation();
  const isMoreActive = secondaryNavItems.some(
    (item) => item.route && item.to === location.pathname,
  );

  return (
    <header className="site-header">
      <div className="content-container site-header__inner">
        <BrandLogo />
        <nav className="app-nav" aria-label="Primary">
          {primaryNavItems.map((item) => {
            const content = (
              <>
                <PortalIcon name={item.icon} />
                <span>{item.label}</span>
              </>
            );

            return item.route ? (
              <NavLink
                end={item.to === "/"}
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `app-nav__link${isActive ? " is-active" : ""}`
                }
              >
                {content}
              </NavLink>
            ) : (
              <a className="app-nav__link" href={item.to} key={item.label}>
                {content}
              </a>
            );
          })}
          <div className="more-menu">
            <button
              className={`app-nav__link more-menu__trigger${isMoreActive ? " is-active" : ""}`}
              type="button"
            >
              <PortalIcon name="down" />
              <span>More</span>
            </button>
            <div className="more-menu__panel">
              {secondaryNavItems.map((item) => {
                const content = (
                  <>
                    <PortalIcon name={item.icon} />
                    <span>{item.label}</span>
                  </>
                );

                return item.route ? (
                  <NavLink
                    className={({ isActive }) =>
                      `more-menu__item${isActive ? " is-active" : ""}`
                    }
                    key={item.label}
                    to={item.to}
                  >
                    {content}
                  </NavLink>
                ) : (
                  <a
                    className="more-menu__item"
                    href={item.to}
                    key={item.label}
                  >
                    {content}
                  </a>
                );
              })}
            </div>
          </div>
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
