export function formatPortalDate(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const year = date.getFullYear();
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}/${day}/${month}`;
}

export function formatPortalDateOrFallback(value?: string | null, fallback = "Not set") {
  return formatPortalDate(value) || fallback;
}
