/**
 * @manairalabs/id-locale
 *
 * Indonesian locale utilities for TypeScript.
 *
 * See README.md for usage and README.id.md for dokumentasi Bahasa Indonesia.
 */

export { formatIDR, parseIDR } from "./idr.js";
export type { FormatIDROptions } from "./idr.js";

export { validateNPWP, formatNPWP, normalizeNPWP } from "./npwp.js";

export { validateNIK, parseNIK, normalizeNIK } from "./nik.js";
export type { ParsedNIK } from "./nik.js";

export { normalizePhone } from "./phone.js";
export type { NormalizePhoneOptions } from "./phone.js";

export { terbilang } from "./terbilang.js";
export type { TerbilangOptions } from "./terbilang.js";

export { PPN, PPh21, DEFAULT_PPN_RATE, PTKP_ANNUAL, PPH21_BRACKETS_2023 } from "./tax.js";
