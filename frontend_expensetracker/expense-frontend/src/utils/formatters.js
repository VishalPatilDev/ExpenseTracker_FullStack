/**
 * Format a number as Indian Rupee (en-IN locale).
 * Handles null / undefined gracefully.
 */
export function formatINR(amount) {
  const value = Number(amount ?? 0);
  return value.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

/**
 * Format a datetime string for display.
 */
export function formatDateTime(date) {
  if (!date) return "-";
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format a date string (no time).
 */
export function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Return today's date as YYYY-MM-DD.
 */
export function todayISO() {
  return new Date().toISOString().split("T")[0];
}

/**
 * Return current datetime as YYYY-MM-DDTHH:mm:ss for backend.
 */
export function nowLocalDateTime() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

/**
 * Given a date string (YYYY-MM-DD), return datetime string with current time.
 */
export function dateToLocalDateTime(dateStr) {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${dateStr}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

/**
 * Calculate total = amount + gst% - tds%
 */
export function calcTotal(amount, gstPct, tdsPct) {
  const base = Number(amount) || 0;
  const gst = (base * (Number(gstPct) || 0)) / 100;
  const tds = (base * (Number(tdsPct) || 0)) / 100;
  return base + gst - tds;
}

/**
 * Unwrap the backend ApiResponse wrapper if present.
 */
export function unwrap(res) {
  return res?.data?.data ?? res?.data ?? [];
}