export type PortalRole = "admin" | "staff" | "client";

export type PortalUser = {
  clientItemId?: string;
  email: string;
  name: string;
  role: PortalRole;
};

const tokenKey = "mastercraft_portal_token";
const userKey = "mastercraft_portal_user";

export function getPortalToken() {
  return window.localStorage.getItem(tokenKey);
}

export function getCurrentPortalUser(): PortalUser | null {
  const token = getPortalToken();
  const storedUser = window.localStorage.getItem(userKey);

  if (!token || !storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as PortalUser;
  } catch {
    return null;
  }
}

export function savePortalSession(token: string, user: PortalUser) {
  window.localStorage.setItem(tokenKey, token);
  window.localStorage.setItem(userKey, JSON.stringify(user));
}

export function updatePortalUser(user: PortalUser) {
  window.localStorage.setItem(userKey, JSON.stringify(user));
}

export function clearPortalSession() {
  window.localStorage.removeItem(tokenKey);
  window.localStorage.removeItem(userKey);
}
