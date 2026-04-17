import { describe, it, expect } from "vitest";
import { validateNPWP, formatNPWP, normalizeNPWP } from "../src/npwp.js";

describe("normalizeNPWP", () => {
  it("strips dots, hyphens, and whitespace", () => {
    expect(normalizeNPWP("01.234.567.8-901.234")).toBe("012345678901234");
    expect(normalizeNPWP("01 234 567 8 901 234")).toBe("012345678901234");
  });
});

describe("validateNPWP", () => {
  it("accepts a 15-digit legacy NPWP", () => {
    expect(validateNPWP("012345678901234")).toBe(true);
    expect(validateNPWP("01.234.567.8-901.234")).toBe(true);
  });

  it("accepts a 16-digit post-2024 NPWP", () => {
    expect(validateNPWP("0123456789012345")).toBe(true);
    expect(validateNPWP("0123 4567 8901 2345")).toBe(true);
  });

  it("rejects non-numeric strings", () => {
    expect(validateNPWP("abc")).toBe(false);
    expect(validateNPWP("01.234.X67.8-901.234")).toBe(false);
  });

  it("rejects wrong lengths", () => {
    expect(validateNPWP("12345")).toBe(false);
    expect(validateNPWP("123456789012345678")).toBe(false);
  });
});

describe("formatNPWP", () => {
  it("formats 15-digit legacy NPWP", () => {
    expect(formatNPWP("012345678901234")).toBe("01.234.567.8-901.234");
  });

  it("formats 16-digit NPWP", () => {
    expect(formatNPWP("0123456789012345")).toBe("0123 4567 8901 2345");
  });

  it("returns input unchanged for unrecognized formats", () => {
    expect(formatNPWP("12345")).toBe("12345");
  });
});
