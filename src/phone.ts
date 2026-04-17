/**
 * Indonesian phone number normalization.
 *
 * Accepted inputs:
 *   "081234567890", "+6281234567890", "6281234567890", "81234567890"
 *   with or without spaces, dashes, dots, or parentheses
 *
 * Canonical output: "+62" followed by the national digits, e.g. "+6281234567890".
 *
 * Returns null for inputs that cannot plausibly be Indonesian numbers.
 */

const ID_CC = "62";

export interface NormalizePhoneOptions {
  /** Output format. Default: "e164". */
  format?: "e164" | "national" | "international";
}

/**
 * Normalize an Indonesian phone number.
 *
 * @example
 * normalizePhone("08123 4567 890")        // "+6281234567890"
 * normalizePhone("+62-812-3456-7890")     // "+6281234567890"
 * normalizePhone("(021) 123 4567")        // "+62211234567"
 * normalizePhone("999")                   // null
 * normalizePhone("08123456789", { format: "national" }) // "08123456789"
 */
export function normalizePhone(
  input: string,
  options: NormalizePhoneOptions = {},
): string | null {
  if (typeof input !== "string") return null;

  // Strip everything except digits and a leading +
  let cleaned = input.trim().replace(/[\s().\-]/g, "");
  const hasPlus = cleaned.startsWith("+");
  if (hasPlus) cleaned = cleaned.slice(1);
  if (!/^\d+$/.test(cleaned)) return null;

  let national: string;
  if (cleaned.startsWith(ID_CC)) {
    national = "0" + cleaned.slice(2);
  } else if (cleaned.startsWith("0")) {
    national = cleaned;
  } else {
    // Bare digits without country code or leading zero — assume national missing leading 0
    national = "0" + cleaned;
  }

  // Reasonable length bounds: national form is 8-13 digits including leading 0
  if (national.length < 8 || national.length > 14) return null;

  const format = options.format ?? "e164";
  switch (format) {
    case "national":
      return national;
    case "international":
      return `+${ID_CC} ${national.slice(1)}`;
    case "e164":
    default:
      return `+${ID_CC}${national.slice(1)}`;
  }
}
