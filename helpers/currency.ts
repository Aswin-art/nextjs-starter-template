const formatterCache = new Map<string, Intl.NumberFormat>();

function getFormatter(
  locale: string,
  options: Intl.NumberFormatOptions,
): Intl.NumberFormat {
  const key = `${locale}:${JSON.stringify(options)}`;
  if (!formatterCache.has(key)) {
    formatterCache.set(key, new Intl.NumberFormat(locale, options));
  }
  return formatterCache.get(key)!;
}

interface FormatCurrencyOptions {
  locale?: string;
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  fallback?: string;
}

const DEFAULT_LOCALE = "id-ID";
const DEFAULT_CURRENCY = "IDR";

/**
 * Formats a number to IDR currency by default.
 * Safe for undefined/null/NaN.
 *
 * @example
 * formatCurrency(1500000) // "Rp 1.500.000"
 * formatCurrency(1500.50) // "Rp 1.500,5"
 */
export function formatCurrency(
  amount: number | null | undefined,
  options: FormatCurrencyOptions = {},
): string {
  const {
    locale = DEFAULT_LOCALE,
    currency = DEFAULT_CURRENCY,
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
    fallback = "Rp 0",
  } = options;

  if (typeof amount !== "number" || isNaN(amount)) {
    return fallback;
  }

  try {
    return getFormatter(locale, {
      style: "currency",
      currency,
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(amount);
  } catch (error) {
    console.error("Format currency error:", error);
    return fallback;
  }
}

export function formatCompactCurrency(
  amount: number | null | undefined,
  options: FormatCurrencyOptions = {},
): string {
  const {
    locale = DEFAULT_LOCALE,
    currency = DEFAULT_CURRENCY,
    fallback = "-",
  } = options;

  if (typeof amount !== "number" || isNaN(amount)) {
    return fallback;
  }

  return getFormatter(locale, {
    style: "currency",
    currency,
    notation: "compact",
    compactDisplay: "short",
  }).format(amount);
}

/**
 * Parses Indonesian currency strings into numbers safely.
 * Handles "Rp.", "Rp", dots for thousands, and commas for decimals.
 *
 * @example
 * parseCurrency("Rp 1.500.000")    // 1500000
 * parseCurrency("1.500.000,50")    // 1500000.5
 * parseCurrency("Rp. 10.000")      // 10000 (Handles explicit dot after Rp)
 */
export function parseCurrency(
  value: string,
  locale: string = DEFAULT_LOCALE,
): number {
  if (!value) return 0;

  const parts = getFormatter(locale, { style: "decimal" }).formatToParts(1.1);
  const decimalPart = parts.find((p) => p.type === "decimal");
  const decimalSeparator = decimalPart?.value || ",";

  const escapedSeparator = decimalSeparator.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );

  const cleanRegex = new RegExp(`[^0-9-${escapedSeparator}]`, "g");

  let cleaned = value.replace(cleanRegex, "");

  if (decimalSeparator === ",") {
    cleaned = cleaned.replace(",", ".");
  }

  const result = Number.parseFloat(cleaned);

  return isNaN(result) ? 0 : result;
}

/**
 * Formats standard number (e.g. "1.500") without currency symbol.
 */
export function formatNumber(value: number, locale = DEFAULT_LOCALE): string {
  if (typeof value !== "number" || isNaN(value)) return "0";
  return getFormatter(locale, { style: "decimal" }).format(value);
}
