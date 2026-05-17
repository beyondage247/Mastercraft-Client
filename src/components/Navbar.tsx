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

function BrandLogo({ href = "/" }: { href?: string }) {
  return (
    <a className="brand-logo" href={href} aria-label="Mastercraft Products home">
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
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentPortalUser);
  const displayName = user?.name || "User";
  const isAdmin = user?.role === "admin";
  const navItems: NavItem[] = secondaryNavItems;
  const isMoreActive = secondaryNavItems.some(
    (item) => item.route && item.to === location.pathname,
  );
  const profileMenu: MenuProps = {
    items: [
      { key: "reset-password", label: "Reset password" },
      { key: "sign-out", danger: true, label: "Sign out" },
    ],
    onClick: ({ key }) => {
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
        <BrandLogo href={isAdmin ? "/admin/clients" : "/"} />
        {!isAdmin ? (
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
                {navItems.map((item) => {
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
        ) : (
          <div className="admin-nav-spacer" aria-hidden="true" />
        )}
        <div className="user-chip" aria-label={`Signed in as ${displayName}`}>
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
