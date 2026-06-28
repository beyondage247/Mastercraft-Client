import { Dropdown, type MenuProps } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { clearPortalSession, getCurrentPortalUser, updatePortalUser } from "../auth/session";
import { PortalIcon } from "./PortalIcon";
import type { PortalIconName } from "./PortalIcon";
import { getCurrentUserProfile } from "../services/portalApi";

type NavItem = {
  icon: PortalIconName;
  label: string;
  route: boolean;
  to: string;
};

const primaryNavItems: NavItem[] = [
  { label: "Home", to: "/", icon: "home", route: true },
  { label: "Projects", to: "/projects", icon: "projects", route: true },
  { label: "Quotes", to: "/quotes", icon: "quotes", route: true },
] as const;

const secondaryNavItems: NavItem[] = [
  { label: "Documents", to: "/documents", icon: "documents", route: true },
  // { label: 'Messages', to: '#messages', icon: 'messages', route: false },
  { label: "Invoices", to: "/invoices", icon: "invoices", route: true },
  { label: "Payments", to: "/payments", icon: "payments", route: true },
] as const;

const backOfficeNavItems: NavItem[] = [
  { label: "Clients", to: "/admin/clients", icon: "home", route: true },
  { label: "Projects", to: "/admin/projects", icon: "projects", route: true },
  { label: "Inventory", to: "/admin/inventory", icon: "tool", route: true },
  { label: "Products", to: "/admin/products-services", icon: "tool", route: true },
  { label: "Quotes", to: "/admin/quotes", icon: "quotes", route: true },
  { label: "Invoices", to: "/admin/invoices", icon: "invoices", route: true },
  { label: "Commission", to: "/admin/commission", icon: "dollar", route: true },
  { label: "Payments", to: "/admin/payments", icon: "payments", route: true },
  { label: "Documents", to: "/admin/documents", icon: "documents", route: true },
  { label: "Reports", to: "/admin/reports", icon: "review", route: true },
  { label: "Staff", to: "/admin/staff", icon: "projects", route: true },
] as const;

function BrandLogo({ href = "/" }: { href?: string }) {
  return (
    <a className="brand-logo" href={href} aria-label="Mastercraft Products home">
      <img className="brand-logo__image" src="/logo2.png" alt="Mastercraft Products" />
    </a>
  );
}

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentPortalUser);
  const displayName = user?.name || "User";
  const isAdmin = user?.role === "admin";
  const isBackOffice = user?.role === "admin" || user?.role === "staff";
  const navItems: NavItem[] = secondaryNavItems;
  const backOfficeVisibleItems = backOfficeNavItems.filter((item) => item.to !== "/admin/staff" || isAdmin);
  const backOfficePrimaryItems = backOfficeVisibleItems.slice(0, 4);
  const backOfficeMoreItems = backOfficeVisibleItems.slice(4);
  const [isMoreActive, setIsMoreActive] = useState(
    secondaryNavItems.some((item) => item.route && item.to === location.pathname),
  );
  const [isBackOfficeMoreActive, setIsBackOfficeMoreActive] = useState(
    backOfficeMoreItems.some((item) => item.to === location.pathname),
  );
  const profileMenu: MenuProps = {
    items: [
      { key: "change-password", label: "Change password" },
      { key: "reset-password", label: "Reset password" },
      { key: "sign-out", danger: true, label: "Sign out" },
    ],
    onClick: ({ key }) => {
      if (key === "change-password") {
        navigate("/change-password");
        return;
      }

      if (key === "reset-password") {
        navigate("/reset-password");
        return;
      }

      clearPortalSession();
      navigate("/login", { replace: true });
    },
  };

  useEffect(() => {
    let isMounted = true;

    getCurrentUserProfile()
      .then((profile) => {
        if (isMounted) {
          updatePortalUser(profile);
          setUser(profile);
        }
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <header className="site-header">
      <div className="content-container site-header__inner">
        <BrandLogo href={isBackOffice ? "/admin/clients" : "/"} />
        {!isBackOffice ? (
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
                onClick={() => setIsMoreActive(!isMoreActive)}
              >
                <PortalIcon name="down" />
                <span>More</span>
              </button>
              <div className="more-menu__panel">
                {navItems.map((item) => {
                  const content = item.route ? (
                    <NavLink
                      end={item.to === "/"}
                      key={item.label}
                      to={item.to}
                      className={({ isActive }) =>
                        `app-nav__link${isActive ? " is-active" : ""}`
                      }
                      onClick={() => setIsMoreActive(false)}
                    >
                      <>
                        <PortalIcon name={item.icon} />
                        <span>{item.label}</span>
                      </>
                    </NavLink>
                  ) : (
                    <a
                      className="app-nav__link"
                      href={item.to}
                      key={item.label}
                      onClick={() => setIsMoreActive(false)}
                    >
                      <>
                        <PortalIcon name={item.icon} />
                        <span>{item.label}</span>
                      </>
                    </a>
                  );
                  return content;
                })}
              </div>
            </div>
          </nav>
        ) : (
          <nav className="app-nav" aria-label="Primary">
            {backOfficePrimaryItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) => `app-nav__link${isActive ? " is-active" : ""}`}
              >
                <PortalIcon name={item.icon} />
                <span>{item.label}</span>
              </NavLink>
            ))}
            <div className="more-menu">
              <button
                className={`app-nav__link more-menu__trigger${isBackOfficeMoreActive ? " is-active" : ""}`}
                type="button"
                onClick={() => setIsBackOfficeMoreActive(!isBackOfficeMoreActive)}
              >
                <PortalIcon name="down" />
                <span>More</span>
              </button>
              <div className="more-menu__panel">
                {backOfficeMoreItems.map((item) => (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    className={({ isActive }) => `app-nav__link${isActive ? " is-active" : ""}`}
                    onClick={() => setIsBackOfficeMoreActive(false)}
                  >
                    <PortalIcon name={item.icon} />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          </nav>
        )}
        <div className="user-chip">
          <span className="user-chip__avatar">{displayName.slice(0, 1).toUpperCase()}</span>
          <span>{displayName}</span>
          <Dropdown menu={profileMenu} placement="bottomRight" trigger={["click"]}>
            <button className="user-chip__menu" aria-label="Profile actions" type="button">
              <MoreOutlined />
            </button>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
