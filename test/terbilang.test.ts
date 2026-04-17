import { describe, it, expect } from "vitest";
import { terbilang } from "../src/terbilang.js";

describe("terbilang", () => {
  it("handles zero", () => {
    expect(terbilang(0)).toBe("nol");
  });

  it("handles single digits", () => {
    expect(terbilang(1)).toBe("satu");
    expect(terbilang(7)).toBe("tujuh");
  });

  it("handles 10-19 range (sepuluh, sebelas, X belas)", () => {
    expect(terbilang(10)).toBe("sepuluh");
    expect(terbilang(11)).toBe("sebelas");
    expect(terbilang(12)).toBe("dua belas");
    expect(terbilang(19)).toBe("sembilan belas");
  });

  it("handles tens and tens+units", () => {
    expect(terbilang(20)).toBe("dua puluh");
    expect(terbilang(25)).toBe("dua puluh lima");
    expect(terbilang(99)).toBe("sembilan puluh sembilan");
  });

  it("handles hundreds (seratus vs N ratus)", () => {
    expect(terbilang(100)).toBe("seratus");
    expect(terbilang(101)).toBe("seratus satu");
    expect(terbilang(250)).toBe("dua ratus lima puluh");
    expect(terbilang(999)).toBe("sembilan ratus sembilan puluh sembilan");
  });

  it("handles thousands (seribu vs N ribu)", () => {
    expect(terbilang(1000)).toBe("seribu");
    expect(terbilang(1500)).toBe("seribu lima ratus");
    expect(terbilang(2000)).toBe("dua ribu");
    expect(terbilang(12345)).toBe("dua belas ribu tiga ratus empat puluh lima");
  });

  it("handles millions, billions, trillions", () => {
    expect(terbilang(1_000_000)).toBe("satu juta");
    expect(terbilang(1_500_000)).toBe("satu juta lima ratus ribu");
    expect(terbilang(1_000_000_000)).toBe("satu miliar");
    expect(terbilang(1_000_000_000_000)).toBe("satu triliun");
  });

  it("handles negative numbers", () => {
    expect(terbilang(-100)).toBe("minus seratus");
  });

  it("supports rupiah mode", () => {
    expect(terbilang(50000, { rupiah: true })).toBe("lima puluh ribu rupiah");
    expect(terbilang(1234.56, { rupiah: true })).toBe(
      "seribu dua ratus tiga puluh empat rupiah lima puluh enam sen",
    );
  });

  it("rupiah mode without sen when fractional is zero", () => {
    expect(terbilang(1000, { rupiah: true })).toBe("seribu rupiah");
  });
});
