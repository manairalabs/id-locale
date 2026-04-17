import { describe, it, expect } from "vitest";
import { normalizePhone } from "../src/phone.js";

describe("normalizePhone", () => {
  it("handles 08xx local form", () => {
    expect(normalizePhone("081234567890")).toBe("+6281234567890");
  });

  it("handles +62 form", () => {
    expect(normalizePhone("+6281234567890")).toBe("+6281234567890");
  });

  it("handles 62 form without plus", () => {
    expect(normalizePhone("6281234567890")).toBe("+6281234567890");
  });

  it("strips whitespace, dashes, dots, parentheses", () => {
    expect(normalizePhone("0812 3456 7890")).toBe("+6281234567890");
    expect(normalizePhone("+62-812-3456-7890")).toBe("+6281234567890");
    expect(normalizePhone("(0812) 3456.7890")).toBe("+6281234567890");
  });

  it("supports alternate output formats", () => {
    expect(normalizePhone("081234567890", { format: "national" })).toBe("081234567890");
    expect(normalizePhone("081234567890", { format: "international" })).toBe("+62 81234567890");
  });

  it("returns null for non-numeric input", () => {
    expect(normalizePhone("not-a-phone")).toBeNull();
    expect(normalizePhone("")).toBeNull();
  });

  it("returns null for implausibly short input", () => {
    expect(normalizePhone("0")).toBeNull();
  });
});
