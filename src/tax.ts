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
    /** Gross monthly salary in IDR. */
    monthlyGross: number;
    /** Marital / dependent status. Default: "TK/0". */
    status?: "TK/0" | "TK/1" | "TK/2" | "TK/3" | "K/0" | "K/1" | "K/2" | "K/3";
    /** Monthly BPJS Kesehatan employee contribution deducted from gross. Default: 0. */
    bpjsKesehatan?: number;
    /** Monthly BPJS Ketenagakerjaan employee contribution deducted from gross. Default: 0. */
    bpjsKetenagakerjaan?: number;
    /** Employee has no NPWP (applies 20% surcharge). Default: false. */
    noNPWP?: boolean;
    /** Jabatan cost cap (5% of gross, capped at 500k/month). Enabled by default. */
    applyBiayaJabatan?: boolean;
  }

  export interface CalcResult {
    annualGross: number;
    annualTaxable: number;
    ptkp: number;
    annualTax: number;
    monthlyTax: number;
    noNPWPSurcharge: number;
  }

  function ptkpFor(status: string): number {
    const married = status.startsWith("K/");
    const dep = Number(status.split("/")[1] ?? "0");
    const capped = Math.min(dep, 3);
    return PTKP_ANNUAL.base + (married ? PTKP_ANNUAL.married : 0) + capped * PTKP_ANNUAL.perDependent;
  }

  function applyBrackets(annualTaxable: number): number {
    if (annualTaxable <= 0) return 0;
    let remaining = annualTaxable;
    let prev = 0;
    let tax = 0;
    for (const b of PPH21_BRACKETS_2023) {
      const slice = Math.min(remaining, b.upTo - prev);
      if (slice > 0) {
        tax += slice * b.rate;
        remaining -= slice;
      }
      if (remaining <= 0) break;
      prev = b.upTo;
    }
    return tax;
  }

  /**
   * Calculate monthly PPh 21 for an employee.
   *
   * Notes:
   *  - Uses the traditional progressive-bracket method (not the TER simplified rate).
   *    TER (tarif efektif rata-rata) introduced in Jan 2024 is used by employers for
   *    monthly withholding, while the annual reconciliation still uses brackets.
   *    If you specifically need TER rates, compute them separately.
   *  - Biaya Jabatan (job expense deduction) defaults on: 5% of annual gross capped at 6M.
   *  - Non-NPWP employees pay a 20% surcharge on the computed PPh 21.
   */
  export function calc(input: CalcInput): CalcResult {
    const {
      monthlyGross,
      status = "TK/0",
      bpjsKesehatan = 0,
      bpjsKetenagakerjaan = 0,
      noNPWP = false,
      applyBiayaJabatan = true,
    } = input;

    if (!Number.isFinite(monthlyGross) || monthlyGross < 0) {
      throw new RangeError(`PPh21.calc: monthlyGross must be non-negative, got ${monthlyGross}`);
    }

    const annualGross = monthlyGross * 12;

    const biayaJabatan = applyBiayaJabatan
      ? Math.min(annualGross * 0.05, 6_000_000)
      : 0;

    const annualBpjs = (bpjsKesehatan + bpjsKetenagakerjaan) * 12;

    const netAnnual = Math.max(0, annualGross - biayaJabatan - annualBpjs);
    const ptkp = ptkpFor(status);
    const annualTaxable = Math.max(0, netAnnual - ptkp);

    let annualTax = applyBrackets(annualTaxable);

    let noNPWPSurcharge = 0;
    if (noNPWP) {
      noNPWPSurcharge = annualTax * 0.2;
      annualTax += noNPWPSurcharge;
    }

    return {
      annualGross,
      annualTaxable,
      ptkp,
      annualTax: Math.round(annualTax),
      monthlyTax: Math.round(annualTax / 12),
      noNPWPSurcharge: Math.round(noNPWPSurcharge),
    };
  }
}
