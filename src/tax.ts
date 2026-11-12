/**
 * Indonesian tax helpers.
 *
 *  - PPN (Value Added Tax / Pajak Pertambahan Nilai)
 *  - PPh 21 (income tax on employment / Pajak Penghasilan Pasal 21)
 *
 * These helpers implement the published statutory rates and PTKP brackets
 * current as of 2025. Tax rates change; review releases before trusting
 * the output for production payroll or invoicing.
 */

// -- PPN -----------------------------------------------------------------

/** Current default PPN rate (12% since Jan 2025). */
export const DEFAULT_PPN_RATE = 0.12;

export namespace PPN {
  export interface CalcResult {
    base: number;
    rate: number;
    tax: number;
    total: number;
  }

  /**
   * Calculate PPN on a given base amount.
   * Default rate is the current statutory PPN (12% in 2025+).
   */
  export function calc(base: number, rate: number = DEFAULT_PPN_RATE): CalcResult {
    if (!Number.isFinite(base) || base < 0) {
      throw new RangeError(`PPN.calc: base must be a non-negative finite number, got ${base}`);
    }
    if (!Number.isFinite(rate) || rate < 0) {
      throw new RangeError(`PPN.calc: rate must be a non-negative finite number, got ${rate}`);
    }
    const tax = Math.round(base * rate);
    return { base, rate, tax, total: base + tax };
  }
}

// -- PPh 21 --------------------------------------------------------------

/**
 * PTKP (Penghasilan Tidak Kena Pajak) — annual tax-free income thresholds.
 * Based on PMK 101/2016 values still current as of 2025.
 */
export const PTKP_ANNUAL = {
  base: 54_000_000, // TK/0 — single, no dependents
  married: 4_500_000, // +K/0 supplement
  perDependent: 4_500_000, // up to 3 dependents count
} as const;

/**
 * Progressive PPh 21 brackets per UU HPP (2022+).
 *
 * Each bracket is applied to annual taxable income above the prior
 * bracket's upper bound.
 */
export const PPH21_BRACKETS_2023 = [
  { upTo: 60_000_000, rate: 0.05 },
  { upTo: 250_000_000, rate: 0.15 },
  { upTo: 500_000_000, rate: 0.25 },
  { upTo: 5_000_000_000, rate: 0.3 },
  { upTo: Infinity, rate: 0.35 },
] as const;

export namespace PPh21 {
  export interface CalcInput {
    /** Monthly gross salary before deductions. */
    monthlyGross: number;
    /** Marital status: TK/0, TK/1..3, K/0, K/1..3. */
    status?: "TK/0" | "TK/1" | "TK/2" | "TK/3" | "K/0" | "K/1" | "K/2" | "K/3";
    /** Employee contribution to BPJS Kesehatan (health). */
    bpjsKesehatan?: number;
    /** Employee contribution to BPJS Ketenagakerjaan (employment). */
    bpjsKetenagakerjaan?: number;
  }

  export interface CalcResult {
    monthlyGross: number;
    annualGross: number;
    ptkp: number;
    annualNetTaxable: number;
    annualTax: number;
    monthlyTax: number;
  }

  /**
   * Resolve the PTKP for the given status string.
   */
  function ptkpFor(status: CalcInput["status"]): number {
    const { base, married, perDependent } = PTKP_ANNUAL;
    switch (status) {
      case "TK/1":
        return base + perDependent;
      case "TK/2":
        return base + 2 * perDependent;
      case "TK/3":
        return base + 3 * perDependent;
      case "K/0":
        return base + married;
      case "K/1":
        return base + married + perDependent;
      case "K/2":
        return base + married + 2 * perDependent;
      case "K/3":
        return base + married + 3 * perDependent;
      case "TK/0":
      default:
        return base;
    }
  }

  /**
   * Apply progressive annual brackets to annual tax-free income.
   */
  function applyBrackets(annualTaxable: number): number {
    let tax = 0;
    let prev = 0;
    for (const b of PPH21_BRACKETS_2023) {
      if (annualTaxable <= prev) break;
      const taxableInBracket = Math.min(annualTaxable, b.upTo) - prev;
      tax += taxableInBracket * b.rate;
      prev = b.upTo;
    }
    return tax;
  }

  /**
   * Calculate estimated PPh 21 for one month.
   *
   * This is a simplified non-TER (Tarif Efektif Rata-rata) calc:
   * monthlyGross × 12 − minus 12 months of BPJS contributions − PTKP → PKP,
   * then annual brackets apply and the annual tax is spread over 12 months.
   *
   * @example
   * PPh21.calc({ monthlyGross: 10_000_000 })                              // TK/0 default
   * PPh21.calc({ monthlyGross: 10_000_000, status: "K/1", bpjsKesehatan: 100_000 })
   */
  export function calc(input: CalcInput): CalcResult {
    const {
      monthlyGross,
      status = "TK/0",
      bpjsKesehatan = 0,
      bpjsKetenagakerjaan = 0,
    } = input;

    if (!Number.isFinite(monthlyGross) || monthlyGross < 0) {
      throw new RangeError(`PPh21.calc: monthlyGross must be non-negative, got ${monthlyGross}`);
    }
    if (!Number.isFinite(bpjsKesehatan) || bpjsKesehatan < 0) {
      throw new RangeError(`PPh21.calc: bpjsKesehatan must be non-negative, got ${bpjsKesehatan}`);
    }
    if (!Number.isFinite(bpjsKetenagakerjaan) || bpjsKetenagakerjaan < 0) {
      throw new RangeError(`PPh21.calc: bpjsKetenagakerjaan must be non-negative, got ${bpjsKetenagakerjaan}`);
    }

    const ptkp = ptkpFor(status);
    const annualGross = monthlyGross * 12;
    const annualNetTaxable = Math.max(
      0,
      annualGross - (bpjsKesehatan + bpjsKetenagakerjaan) * 12 - ptkp,
    );
    const annualTax = applyBrackets(annualNetTaxable);

    return {
      monthlyGross,
      annualGross,
      ptkp,
      annualNetTaxable,
      annualTax,
      monthlyTax: annualTax / 12,
    };
  }
}
