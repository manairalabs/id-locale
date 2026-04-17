import { describe, it, expect } from "vitest";
import { formatIDR, parseIDR } from "../src/idr.js";

describe("formatIDR", () => {
  it("formats positive integers with Rp prefix and Indonesian thousand separator", () => {
    expect(formatIDR(0)).toBe("Rp 0");
    expect(formatIDR(1000)).toBe("Rp 1.000");
    expect(formatIDR(1234567)).toBe("Rp 1.234.567");
    expect(formatIDR(1000000000)).toBe("Rp 1.000.000.000");
  });

  it("formats negative numbers with leading minus", () => {
    expect(formatIDR(-1000)).toBe("-Rp 1.000");
    expect(formatIDR(-1234567)).toBe("-Rp 1.234.567");
  });

  it("supports symbol and spacing options", () => {
    expect(formatIDR(1000, { symbol: false })).toBe("1.000");
    expect(formatIDR(1000, { spaceAfterSymbol: false })).toBe("Rp1.000");
  });

  it("formats decimals when requested", () => {
    expect(formatIDR(1234.5, { minDecimals: 2, maxDecimals: 2 })).toBe("Rp 1.234,50");
    expect(formatIDR(1234.567, { minDecimals: 2, maxDecimals: 2 })).toBe("Rp 1.234,57");
  });

  it("throws on non-finite input", () => {
    expect(() => formatIDR(NaN)).toThrow(TypeError);
    expect(() => formatIDR(Infinity)).toThrow(TypeError);
  });
});

describe("parseIDR", () => {
  it("parses Indonesian-formatted strings", () => {
    expect(parseIDR("Rp 1.000")).toBe(1000);
    expect(parseIDR("Rp 1.234.567")).toBe(1234567);
    expect(parseIDR("Rp1.234.567,50")).toBe(1234567.5);
  });

  it("parses with or without Rp prefix", () => {
    expect(parseIDR("1.000")).toBe(1000);
    expect(parseIDR("1.234.567,50")).toBe(1234567.5);
  });

  it("handles negative", () => {
    expect(parseIDR("-Rp 1.000")).toBe(-1000);
    expect(parseIDR("-1.234.567,50")).toBe(-1234567.5);
  });

  it("accepts English-style separators too", () => {
    expect(parseIDR("Rp 1,234,567.50")).toBe(1234567.5);
    expect(parseIDR("1,234,567")).toBe(1234567);
  });

  it("returns null for garbage", () => {
    expect(parseIDR("")).toBeNull();
    expect(parseIDR("abc")).toBeNull();
    expect(parseIDR("Rp")).toBeNull();
  });

  it("round-trips with formatIDR", () => {
    const n = 12345678;
    expect(parseIDR(formatIDR(n))).toBe(n);
  });
});
