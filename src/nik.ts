/**
 * NIK (Nomor Induk Kependudukan) — Indonesian citizen ID number, 16 digits.
 *
 * Structure: PP KK CC DDMMYY NNNN
 *   PP = province code (2 digits)
 *   KK = city/regency code (2 digits)
 *   CC = sub-district (kecamatan) code (2 digits)
 *   DD = day of birth; women have +40 added (so 41-71 = female days 1-31)
 *   MM = month of birth
 *   YY = two-digit year of birth
 *   NNNN = sequential number within the registration unit
 *
 * Century heuristic: if YY <= current two-digit year, assume 2000s; otherwise 1900s.
 */

export interface ParsedNIK {
  provinceCode: string;
  cityCode: string;
  districtCode: string;
  birthDate: Date;
  gender: "M" | "F";
  sequence: string;
}

/**
 * Strip whitespace and return digits.
 */
export function normalizeNIK(input: string): string {
  if (typeof input !== "string") return "";
  return input.replace(/\s+/g, "");
}

/**
 * Validate that the input is a 16-digit numeric string with a plausible
 * birth date and month. Format-only; does not verify registry.
 */
export function validateNIK(input: string): boolean {
  const d = normalizeNIK(input);
  if (!/^\d{16}$/.test(d)) return false;

  // Day: 01-31 for males, 41-71 for females
  const dayRaw = Number(d.slice(6, 8));
  const day = dayRaw > 40 ? dayRaw - 40 : dayRaw;
  if (day < 1 || day > 31) return false;

  const month = Number(d.slice(8, 10));
  if (month < 1 || month > 12) return false;

  // Year is two-digit; we cannot fully validate without context, so accept 00-99
  return true;
}

/**
 * Parse a validated NIK into its structured components.
 * Returns null if the NIK is invalid.
 */
export function parseNIK(input: string): ParsedNIK | null {
  if (!validateNIK(input)) return null;
  const d = normalizeNIK(input);

  const provinceCode = d.slice(0, 2);
  const cityCode = d.slice(2, 4);
  const districtCode = d.slice(4, 6);

  const dayRaw = Number(d.slice(6, 8));
  const gender: "M" | "F" = dayRaw > 40 ? "F" : "M";
  const day = dayRaw > 40 ? dayRaw - 40 : dayRaw;

  const month = Number(d.slice(8, 10));
  const yy = Number(d.slice(10, 12));

  // Century heuristic: current 2-digit year boundary
  const nowYY = new Date().getUTCFullYear() % 100;
  const century = yy <= nowYY ? 2000 : 1900;
  const year = century + yy;

  const birthDate = new Date(Date.UTC(year, month - 1, day));

  return {
    provinceCode,
    cityCode,
    districtCode,
    birthDate,
    gender,
    sequence: d.slice(12, 16),
  };
}
