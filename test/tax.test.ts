import { describe, it, expect } from "vitest";
import { PPN, PPh21, DEFAULT_PPN_RATE } from "../src/tax.js";

describe("PPN", () => {
  it("applies default 12% rate", () => {
    const r = PPN.calc(1_000_000);
    expect(r.rate).toBe(DEFAULT_PPN_RATE);
    expect(r.tax).toBe(120_000);
    expect(r.total).toBe(1_120_000);
  });

  it("supports custom rate", () => {
    const r = PPN.calc(1_000_000, 0.11);
    expect(r.tax).toBe(110_000);
    expect(r.total).toBe(1_110_000);
  });

  it("rejects negative base or rate", () => {
    expect(() => PPN.calc(-1)).toThrow(RangeError);
    expect(() => PPN.calc(100, -0.01)).toThrow(RangeError);
  });
});

describe("PPh21", () => {
  it("computes zero tax below PTKP", () => {
    // Monthly 4M → annual 48M, below TK/0 PTKP of 54M
    const r = PPh21.calc({ monthlyGross: 4_000_000, applyBiayaJabatan: false });
    expect(r.annualTax).toBe(0);
  });

  it("applies progressive brackets for higher income", () => {
    const r = PPh21.calc({ monthlyGross: 20_000_000, applyBiayaJabatan: false, status: "TK/0" });
    // Annual gross 240M - PTKP 54M = 186M taxable
    // Bracket 1: 60M * 5% = 3M
    // Bracket 2: 126M * 15% = 18.9M
    // Total = 21.9M
    expect(r.annualTax).toBe(21_900_000);
  });

  it("increases PTKP with marital status and dependents", () => {
    const single = PPh21.calc({ monthlyGross: 10_000_000, status: "TK/0", applyBiayaJabatan: false });
    const married = PPh21.calc({ monthlyGross: 10_000_000, status: "K/2", applyBiayaJabatan: false });
    expect(married.ptkp).toBeGreaterThan(single.ptkp);
    expect(married.annualTax).toBeLessThan(single.annualTax);
  });

  it("adds 20% surcharge when noNPWP", () => {
    const withNPWP = PPh21.calc({ monthlyGross: 20_000_000, applyBiayaJabatan: false });
    const noNPWP = PPh21.calc({ monthlyGross: 20_000_000, applyBiayaJabatan: false, noNPWP: true });
    expect(noNPWP.annualTax).toBeGreaterThan(withNPWP.annualTax);
    expect(noNPWP.noNPWPSurcharge).toBeGreaterThan(0);
    // Surcharge is 20% of pre-surcharge tax
    expect(Math.round(withNPWP.annualTax * 0.2)).toBe(noNPWP.noNPWPSurcharge);
  });

  it("rejects negative gross", () => {
    expect(() => PPh21.calc({ monthlyGross: -1 })).toThrow(RangeError);
  });
});
