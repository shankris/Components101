export function getBrowserLocale() {
  if (typeof navigator !== "undefined") {
    return navigator.language || "en-US";
  }

  return "en-US";
}

export function formatDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(getBrowserLocale(), {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
