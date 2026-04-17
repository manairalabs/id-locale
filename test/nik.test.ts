import { describe, it, expect } from "vitest";
import { validateNIK, parseNIK } from "../src/nik.js";

describe("validateNIK", () => {
  it("accepts a 16-digit NIK with valid date fields", () => {
    // province 32, city 01, district 01, birth 15-05-90, seq 0001 → male
    expect(validateNIK("3201011505900001")).toBe(true);
    // female (day + 40)
    expect(validateNIK("3201015505900001")).toBe(true);
  });

  it("rejects non-16-digit input", () => {
    expect(validateNIK("12345")).toBe(false);
    expect(validateNIK("32010115059000011")).toBe(false);
  });

  it("rejects impossible month/day", () => {
    expect(validateNIK("3201013213900001")).toBe(false); // month 13
    expect(validateNIK("3201010005900001")).toBe(false); // day 0 (male)
  });
});

describe("parseNIK", () => {
  it("parses male NIK correctly", () => {
    const parsed = parseNIK("3201011505900001");
    expect(parsed).not.toBeNull();
    expect(parsed?.provinceCode).toBe("32");
    expect(parsed?.cityCode).toBe("01");
    expect(parsed?.districtCode).toBe("01");
    expect(parsed?.gender).toBe("M");
    expect(parsed?.birthDate.getUTCFullYear()).toBe(1990);
    expect(parsed?.birthDate.getUTCMonth()).toBe(4);
    expect(parsed?.birthDate.getUTCDate()).toBe(15);
    expect(parsed?.sequence).toBe("0001");
  });

  it("parses female NIK (day + 40)", () => {
    const parsed = parseNIK("3201015505900001");
    expect(parsed?.gender).toBe("F");
    expect(parsed?.birthDate.getUTCDate()).toBe(15); // 55 - 40 = 15
  });

  it("returns null for invalid NIK", () => {
    expect(parseNIK("invalid")).toBeNull();
  });
});
