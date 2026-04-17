# @manairalabs/id-locale

[![npm version](https://img.shields.io/npm/v/@manairalabs/id-locale.svg)](https://www.npmjs.com/package/@manairalabs/id-locale)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Utilitas locale Indonesia untuk TypeScript.** Semua yang biasanya Anda tulis ulang saat membangun untuk pasar Indonesia: format IDR, validasi NPWP / NIK, normalisasi nomor telepon, kalkulasi PPN / PPh, dan *terbilang* Bahasa Indonesia.

*[English](README.md)*

## Pemasangan

```bash
npm install @manairalabs/id-locale
```

Membutuhkan Node 18+. Menyediakan ESM + CJS + definisi tipe. Tanpa dependensi runtime.

## Yang tersedia

| Modul | Fungsi |
|-------|--------|
| Mata uang | `formatIDR`, `parseIDR` |
| NPWP | `validateNPWP`, `formatNPWP`, `normalizeNPWP` |
| NIK | `validateNIK`, `parseNIK` |
| Telepon | `normalizePhone` |
| Terbilang | `terbilang` |
| Pajak | `PPN.calc`, `PPh21.calc` |

## Contoh cepat

```ts
import { formatIDR, terbilang, PPN, PPh21 } from "@manairalabs/id-locale";

formatIDR(1_234_567);                    // "Rp 1.234.567"
terbilang(50000, { rupiah: true });      // "lima puluh ribu rupiah"

PPN.calc(1_000_000);                     // PPN 12% (tarif 2025+)
PPh21.calc({ monthlyGross: 20_000_000, status: "K/2" });
```

Dokumentasi lengkap ada di [README.md](README.md) (Bahasa Inggris).

## Catatan pajak

- **PPN** default 12% (tarif per Januari 2025).
- **PPh 21** memakai tarif progresif UU HPP. PTKP per PMK 101/2016.
- Implementasi PPh 21 memakai metode progresif, **bukan TER** (tarif efektif rata-rata). Rekonsiliasi tahunan tetap pakai tarif progresif.
- Pin versi tertentu di production karena aturan pajak bisa berubah.

## Kenapa paket ini ada

Paket locale Indonesia di npm tersebar dan tidak terawat:

- `nusantara-valid` — hanya validasi NIK / NPWP, update terakhir ~1 tahun
- `@develoka/angka-rupiah-js` — hanya format IDR
- Paket terbilang — hanya terbilang
- Tidak ada yang bundle semua + TS modern + **tidak ada yang hitung PPN / PPh**

Paket ini mengisi celah itu.

## Lisensi

MIT — lihat [LICENSE](LICENSE).

## Tentang pembuat

Dikelola oleh [Manaira Labs](https://manairalabs.com). Kami membangun produk AI dan menyediakan konsultasi untuk bisnis Indonesia. Lihat juga [Bicara Business Platform](https://bicara.ai), platform bisnis native AI untuk UKM Indonesia.
