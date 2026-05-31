export const PORTAL_DATE_FORMAT = "MM/DD/YYYY";

export function parsePortalDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  const oldPortalDate = trimmed.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
  const portalDate = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (oldPortalDate) {
    return new Date(`${oldPortalDate[1]}-${oldPortalDate[3]}-${oldPortalDate[2]}T00:00:00.000Z`);
  }

  if (portalDate) {
    return new Date(`${portalDate[3]}-${portalDate[1]}-${portalDate[2]}T00:00:00.000Z`);
  }

  return new Date(trimmed);
}

export function formatPortalDate(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = parsePortalDate(value);

  if (!date || Number.isNaN(date.getTime())) {
    return value;
  }

  const year = date.getUTCFullYear();
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");

  return `${month}/${day}/${year}`;
}

export function formatPortalDateOrFallback(value?: string | null, fallback = "Not set") {
  return formatPortalDate(value) || fallback;
}
