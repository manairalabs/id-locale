# @manairalabs/id-locale

[![npm version](https://img.shields.io/npm/v/@manairalabs/id-locale.svg)](https://www.npmjs.com/package/@manairalabs/id-locale)
[![CI](https://github.com/manairalabs/id-locale/actions/workflows/ci.yml/badge.svg)](https://github.com/manairalabs/id-locale/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Indonesian locale utilities for TypeScript.** Everything you reinvent whenever you build for Indonesia: IDR formatting, NPWP / NIK validation, phone number normalization, PPN / PPh tax math, and Bahasa Indonesia `terbilang`.

*[Bahasa Indonesia](README.id.md)*

## Install

```bash
npm install @manairalabs/id-locale
```

Requires Node 18+. Ships ESM + CJS + type definitions. Zero runtime dependencies.

## What's included

| Module | Exports |
|--------|---------|
| Currency | `formatIDR`, `parseIDR` |
| Tax ID | `validateNPWP`, `formatNPWP`, `normalizeNPWP` |
| Citizen ID | `validateNIK`, `parseNIK` |
| Phone | `normalizePhone` |
| Words | `terbilang` |
| Tax math | `PPN.calc`, `PPh21.calc` |

## Quick examples

### IDR currency

```ts
import { formatIDR, parseIDR } from "@manairalabs/id-locale";

formatIDR(1234567);                                 // "Rp 1.234.567"
formatIDR(1234567.5, { minDecimals: 2, maxDecimals: 2 }); // "Rp 1.234.567,50"
formatIDR(-1000);                                   // "-Rp 1.000"
formatIDR(1000, { symbol: false });                 // "1.000"

parseIDR("Rp 1.234.567");                           // 1234567
parseIDR("Rp1.234.567,50");                         // 1234567.5
```

### NPWP (tax ID)

Accepts both 15-digit legacy and 16-digit post-2024 formats.

```ts
import { validateNPWP, formatNPWP } from "@manairalabs/id-locale";

validateNPWP("01.234.567.8-901.234");   // true
formatNPWP("012345678901234");           // "01.234.567.8-901.234"
formatNPWP("0123456789012345");          // "0123 4567 8901 2345"
```

### NIK (citizen ID)

```ts
import { parseNIK } from "@manairalabs/id-locale";

const parsed = parseNIK("3201015505900001");
// {
//   provinceCode: "32",
//   cityCode: "01",
//   districtCode: "01",
//   birthDate: new Date("1990-05-15"),
//   gender: "F",      // day + 40 → female
//   sequence: "0001"
// }
```

### Phone

```ts
import { normalizePhone } from "@manairalabs/id-locale";

normalizePhone("0812 3456 7890");       // "+6281234567890"
normalizePhone("+62-812-3456-7890");    // "+6281234567890"
normalizePhone("62 812 3456 7890", { format: "national" });      // "081234567890"
normalizePhone("62 812 3456 7890", { format: "international" }); // "+62 81234567890"
```

### Terbilang (number to Bahasa Indonesia words)

```ts
import { terbilang } from "@manairalabs/id-locale";

terbilang(1500);                                 // "seribu lima ratus"
terbilang(1_234_567);                            // "satu juta dua ratus tiga puluh empat ribu lima ratus enam puluh tujuh"
terbilang(50000, { rupiah: true });              // "lima puluh ribu rupiah"
terbilang(1234.56, { rupiah: true });            // "seribu dua ratus tiga puluh empat rupiah lima puluh enam sen"
```

### Tax math

```ts
import { PPN, PPh21 } from "@manairalabs/id-locale";

// PPN — default 12% (2025+ rate)
PPN.calc(1_000_000);
// { base: 1000000, rate: 0.12, tax: 120000, total: 1120000 }

PPN.calc(1_000_000, 0.11);  // custom rate
// { base: 1000000, rate: 0.11, tax: 110000, total: 1110000 }

// PPh 21 — progressive brackets per UU HPP (2022+)
PPh21.calc({
  monthlyGross: 20_000_000,
  status: "K/2",       // married, 2 dependents
});
// {
//   annualGross: 240_000_000,
//   annualTaxable: ...,
//   ptkp: 67_500_000,
//   annualTax: ...,
//   monthlyTax: ...,
//   noNPWPSurcharge: 0
// }

PPh21.calc({
  monthlyGross: 20_000_000,
  noNPWP: true,   // adds 20% surcharge
});
```

## Tax rates and edge cases

- **PPN** defaults to 12% (statutory rate since January 2025). Pass a custom rate for pre-2025 calculations or goods with reduced rates.
- **PPh 21** uses the progressive brackets per UU HPP (effective 2022). PTKP values follow PMK 101/2016, still current as of 2025.
- **PPh 21** uses the traditional progressive method, **not** TER (tarif efektif rata-rata, introduced January 2024 for monthly withholding). The annual reconciliation always uses progressive brackets.
- Tax rates and PTKP change. Pin a specific version in production payroll / invoicing use.

## Why this package exists

Every Indonesian dev team reinvents these primitives. The existing npm landscape is fragmented:

- `nusantara-valid` — NIK / NPWP / NISN validation only, last updated ~1 year ago
- `@develoka/angka-rupiah-js` — IDR formatting only
- `angka-menjadi-terbilang`, `terbilang-ts` — terbilang only, nothing else
- None ship modern TS / ESM / types and **none attempt PPN / PPh tax math**

This package is the missing bundled version with up-to-date tax helpers.

## License

MIT — see [LICENSE](LICENSE).

## Who makes this

Maintained by [Manaira Labs](https://manairalabs.com). We build AI products and consult for Indonesian businesses. Also check out [Bicara](https://bicara.ai), our AI-native ERP platform.
