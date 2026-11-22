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
 * A resolved date in the future steps back a century.
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
 * Resolve the birth date encoded in a NIK's DDMMYY segment.
 *
 * Century heuristic: if YY <= current two-digit year, assume 2000s;
 * otherwise 1900s. If that date is still in the future, step back a
 * century (a NIK cannot encode a birth that has not happened yet).
 *
 * Returns null when the day/month do not form a real calendar date
 * (e.g. 31 February rolls over to March and is rejected).
 */
function resolveBirthDate(day: number, month: number, yy: number): Date | null {
  const now = new Date();
  const nowYY = now.getUTCFullYear() % 100;
  let year = (yy <= nowYY ? 2000 : 1900) + yy;

  let date = new Date(Date.UTC(year, month - 1, day));
  if (date.getTime() > now.getTime()) {
    year -= 100;
    date = new Date(Date.UTC(year, month - 1, day));
  }

  const valid =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;
  return valid ? date : null;
}

/**
 * Validate that the input is a 16-digit numeric string with a real calendar birth date. Format-only; does not verify registry.
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

  const yy = Number(d.slice(10, 12));
  return resolveBirthDate(day, month, yy) !== null;
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

  // validateNIK passed, so the date resolves; the fallback never triggers.
  const birthDate = resolveBirthDate(day, month, yy) ?? new Date(Date.UTC(1900 + yy, month - 1, day));

  return {
    provinceCode,
    cityCode,
    districtCode,
    birthDate,
    gender,
    sequence: d.slice(12, 16),
  };
}
