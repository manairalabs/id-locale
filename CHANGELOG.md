# Changelog

All notable changes to `@manairalabs/id-locale` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.1.0] - 2026-04-17

### Added

- `formatIDR(n, opts?)` — IDR currency formatting with Indonesian thousand separator.
- `parseIDR(s)` — parse formatted IDR strings back to a number.
- `validateNPWP(s)` / `formatNPWP(s)` / `normalizeNPWP(s)` — tax ID (NPWP) validation and formatting, supports 15-digit legacy and 16-digit post-2024 formats.
- `validateNIK(s)` / `parseNIK(s)` — KTP citizen ID validation plus birth date / gender / region extraction.
- `normalizePhone(s)` — Indonesian phone number normalization (`08xx`, `+628xx`, `628xx` → canonical `+628xx`).
- `terbilang(n, opts?)` — number-to-Bahasa-Indonesia words, with rupiah mode (`"satu juta rupiah"`) and plain mode.
- `PPN.calc(base, rate?)` — value-added tax calculation (default 12% per 2025+ rate).
- `PPh21.calc(params)` — PPh 21 income tax calculator with 2024+ progressive brackets, BPJS deductions, PTKP by dependent count, and non-NPWP 20% surcharge.
