/**
 * Convert a non-negative integer into Bahasa Indonesia words.
 *
 * Supports numbers up to 999,999,999,999,999 (just under one quadrillion).
 * Negative numbers are prefixed with "minus".
 * Decimals are truncated unless `fractional` is provided via the rupiah mode.
 */

const ONES = [
  "nol",
  "satu",
  "dua",
  "tiga",
  "empat",
  "lima",
  "enam",
  "tujuh",
  "delapan",
  "sembilan",
];

function hundreds(n: number): string {
  if (n === 0) return "";
  if (n < 10) return ONES[n]!;
  if (n < 12) return n === 10 ? "sepuluh" : "sebelas";
  if (n < 20) return `${ONES[n - 10]} belas`;
  if (n < 100) {
    const tens = Math.floor(n / 10);
    const rem = n % 10;
    return rem === 0 ? `${ONES[tens]} puluh` : `${ONES[tens]} puluh ${ONES[rem]}`;
  }
  const huns = Math.floor(n / 100);
  const rem = n % 100;
  const hprefix = huns === 1 ? "seratus" : `${ONES[huns]} ratus`;
  return rem === 0 ? hprefix : `${hprefix} ${hundreds(rem)}`;
}

function groups(n: bigint): string {
  if (n === 0n) return "nol";

  const units: Array<{ name: string; value: bigint }> = [
    { name: "triliun", value: 1_000_000_000_000n },
    { name: "miliar", value: 1_000_000_000n },
    { name: "juta", value: 1_000_000n },
    { name: "ribu", value: 1_000n },
  ];

  const parts: string[] = [];
  let remaining = n;

  for (const { name, value } of units) {
    const count = remaining / value;
    if (count > 0n) {
      if (name === "ribu" && count === 1n) {
        parts.push("seribu");
      } else {
        parts.push(`${hundreds(Number(count))} ${name}`);
      }
      remaining = remaining % value;
    }
  }

  if (remaining > 0n) {
    parts.push(hundreds(Number(remaining)));
  }

  return parts.join(" ").trim();
}

export interface TerbilangOptions {
  /** Append " rupiah" to the output. Default: false. */
  rupiah?: boolean;
  /** If rupiah=true and the input has 2 decimal places, append sen. Default: true. */
  includeSen?: boolean;
}

/**
 * Convert a number into Bahasa Indonesia words.
 *
 * @example
 * terbilang(0)                             // "nol"
 * terbilang(1500)                          // "seribu lima ratus"
 * terbilang(1_000_000)                     // "satu juta"
 * terbilang(1234567)                       // "satu juta dua ratus tiga puluh empat ribu lima ratus enam puluh tujuh"
 * terbilang(50000, { rupiah: true })       // "lima puluh ribu rupiah"
 * terbilang(1234.56, { rupiah: true })     // "seribu dua ratus tiga puluh empat rupiah lima puluh enam sen"
 * terbilang(-100)                          // "minus seratus"
 */
export function terbilang(value: number, options: TerbilangOptions = {}): string {
  if (!Number.isFinite(value)) {
    throw new TypeError(`terbilang expected a finite number, got ${value}`);
  }

  const { rupiah = false, includeSen = true } = options;

  const negative = value < 0;
  const abs = Math.abs(value);
  const whole = BigInt(Math.trunc(abs));
  const fractional = Math.round((abs - Math.trunc(abs)) * 100);

  let out = groups(whole);
  if (negative) out = `minus ${out}`;

  if (rupiah) {
    out += " rupiah";
    if (includeSen && fractional > 0) {
      out += ` ${hundreds(fractional)} sen`;
    }
  }

  return out;
}
