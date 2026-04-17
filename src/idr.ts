export interface FormatIDROptions {
  /** Include the "Rp" prefix. Default: true. */
  symbol?: boolean;
  /** Space between "Rp" and the number. Default: true. */
  spaceAfterSymbol?: boolean;
  /** Minimum decimal places (sen). Default: 0. */
  minDecimals?: number;
  /** Maximum decimal places. Default: 0. */
  maxDecimals?: number;
}

/**
 * Format a number as Indonesian Rupiah.
 *
 * Uses "." as thousand separator and "," as decimal separator per Indonesian locale.
 *
 * @example
 * formatIDR(1234567)           // "Rp 1.234.567"
 * formatIDR(1234567.5, { minDecimals: 2, maxDecimals: 2 }) // "Rp 1.234.567,50"
 * formatIDR(-1000)             // "-Rp 1.000"
 * formatIDR(1000, { symbol: false }) // "1.000"
 */
export function formatIDR(value: number, options: FormatIDROptions = {}): string {
  const {
    symbol = true,
    spaceAfterSymbol = true,
    minDecimals = 0,
    maxDecimals = 0,
  } = options;

  if (!Number.isFinite(value)) {
    throw new TypeError(`formatIDR expected a finite number, got ${value}`);
  }

  const negative = value < 0;
  const abs = Math.abs(value);

  const formatted = new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  }).format(abs);

  const prefix = symbol ? (spaceAfterSymbol ? "Rp " : "Rp") : "";
  return `${negative ? "-" : ""}${prefix}${formatted}`;
}

/**
 * Parse a formatted Indonesian Rupiah string into a number.
 *
 * Accepts strings with or without "Rp" prefix, with or without spaces,
 * with Indonesian ("1.234.567,50") or English-ish ("1,234,567.50") separators.
 *
 * Returns null if the string cannot be parsed.
 *
 * @example
 * parseIDR("Rp 1.234.567")    // 1234567
 * parseIDR("Rp1.234.567,50")  // 1234567.5
 * parseIDR("-Rp 1.000")       // -1000
 */
export function parseIDR(input: string): number | null {
  if (typeof input !== "string") return null;
  let s = input.trim();
  if (!s) return null;

  const negative = s.startsWith("-");
  if (negative) s = s.slice(1).trim();

  // Strip currency prefix/suffix
  s = s.replace(/^rp\.?\s*/i, "").replace(/\s*rupiah$/i, "").trim();

  if (!s) return null;

  // If both "." and "," present, the right-most one is the decimal separator.
  const lastDot = s.lastIndexOf(".");
  const lastComma = s.lastIndexOf(",");
  let normalized: string;
  if (lastDot >= 0 && lastComma >= 0) {
    if (lastComma > lastDot) {
      // Indonesian: "." thousands, "," decimal
      normalized = s.replace(/\./g, "").replace(",", ".");
    } else {
      // English: "," thousands, "." decimal
      normalized = s.replace(/,/g, "");
    }
  } else if (lastComma >= 0) {
    // Only commas — treat as decimal if fractional digits look short, else thousands
    const afterComma = s.slice(lastComma + 1);
    if (afterComma.length <= 2 && /^\d+$/.test(afterComma)) {
      normalized = s.replace(",", ".");
    } else {
      normalized = s.replace(/,/g, "");
    }
  } else {
    // Only dots — treat as thousand separators (Indonesian default).
    // "1.500" → 1500, "1.5" could be ambiguous; we default to thousands in this locale.
    normalized = s.replace(/\./g, "");
  }

  const n = Number(normalized);
  if (!Number.isFinite(n)) return null;
  return negative ? -n : n;
}
