/**
 * NPWP (Nomor Pokok Wajib Pajak) — Indonesian taxpayer identification number.
 *
 * Historical format: 15 digits, displayed as XX.XXX.XXX.X-XXX.XXX.
 * Since 2024, individual taxpayers use a 16-digit NIK-based NPWP.
 *
 * This module accepts both 15- and 16-digit forms. Format validation only —
 * does not verify the number against the DJP registry.
 */

/**
 * Strip formatting characters and return digits only.
 * Accepts dots, hyphens, and whitespace as separators.
 */
export function normalizeNPWP(input: string): string {
  if (typeof input !== "string") return "";
  return input.replace(/[.\-\s]/g, "");
}

/**
 * Validate an NPWP string.
 *
 * Returns true if the input, after stripping separators, is either:
 *  - a 15-digit legacy NPWP, or
 *  - a 16-digit post-2024 NPWP.
 *
 * Format-only check. Does not validate against DJP database.
 */
export function validateNPWP(input: string): boolean {
  const d = normalizeNPWP(input);
  if (!/^\d+$/.test(d)) return false;
  return d.length === 15 || d.length === 16;
}

/**
 * Format a 15-digit NPWP as XX.XXX.XXX.X-XXX.XXX.
 * Format a 16-digit NPWP as a space-grouped 4-4-4-4 pattern.
 *
 * Returns the original string if it is not a recognized length.
 */
export function formatNPWP(input: string): string {
  const d = normalizeNPWP(input);
  if (!/^\d+$/.test(d)) return input;

  if (d.length === 15) {
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}.${d.slice(8, 9)}-${d.slice(9, 12)}.${d.slice(12, 15)}`;
  }

  if (d.length === 16) {
    return `${d.slice(0, 4)} ${d.slice(4, 8)} ${d.slice(8, 12)} ${d.slice(12, 16)}`;
  }

  return input;
}
