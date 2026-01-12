import {
  format,
  formatDistanceToNow,
  formatRelative,
  isValid,
  parse,
  parseISO,
} from "date-fns";
import { id } from "date-fns/locale";

type DateInput = Date | string | number | null | undefined;

/**
 * Internal helper to safely convert inputs to Date.
 * Handles nulls and invalid strings robustly.
 */
function toDate(date: DateInput): Date | null {
  if (!date) return null;

  if (date instanceof Date) return date;

  if (typeof date === "string") {
    const d = parseISO(date);
    return isValid(d) ? d : null;
  }

  const d = new Date(date);
  return isValid(d) ? d : null;
}

/**
 * Formats a date to a string. Returns fallback if invalid.
 * Default: Indonesian format.
 * * @example
 * formatDate("2026-01-12") // "12 Jan 2026"
 * formatDate(null) // "-"
 */
export function formatDate(
  date: DateInput,
  formatStr = "dd MMM yyyy",
  fallback = "-",
): string {
  const d = toDate(date);
  if (!d) return fallback;

  try {
    return format(d, formatStr, { locale: id });
  } catch (e) {
    return fallback;
  }
}

/**
 * Formats date with time.
 * Default: "12 Jan 2026, 14:30 WIB" (Added WIB context manually if needed, or rely on locale)
 */
export function formatDateTime(
  date: DateInput,
  formatStr = "dd MMM yyyy, HH:mm",
  fallback = "-",
): string {
  return formatDate(date, formatStr, fallback);
}

/**
 * Relative time (e.g., "2 jam yang lalu").
 * WARN: Using this in Server Components causes Hydration Errors due to server/client time diff.
 * Use only in Client Components or inside useEffect.
 */
export function formatRelativeTime(date: DateInput, fallback = "-"): string {
  const d = toDate(date);
  if (!d) return fallback;

  return formatDistanceToNow(d, {
    addSuffix: true,
    locale: id,
  });
}

/**
 * Smart relative formatting with day context.
 * "Hari ini pukul 14:30", "Kemarin pukul 14:30", else "12 Jan 2026".
 */
export function formatSmartRelative(date: DateInput, fallback = "-"): string {
  const d = toDate(date);
  if (!d) return fallback;

  const now = new Date();
  const diffInDays = Math.abs(
    (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffInDays < 7) {
    return formatRelative(d, now, { locale: id });
  }

  return format(d, "dd MMM yyyy, HH:mm", { locale: id });
}

/**
 * Parse standard Indo date string (e.g., input field "31/12/2025")
 */
export function parseIndoDate(
  dateStr: string,
  formatStr = "dd/MM/yyyy",
): Date | null {
  if (!dateStr) return null;

  const parsed = parse(dateStr, formatStr, new Date(), { locale: id });
  return isValid(parsed) ? parsed : null;
}

/**
 * Check validity for UI logic
 */
export function isValidDate(date: DateInput): boolean {
  return !!toDate(date);
}
