# Panduan Tema Kedai — "Bangunan Sama, Warna Berbeza"

## Konsep

Macam rumah kedai yang **struktur/bentuk sama**, cuma **warna bangunan &
signboard** berbeza — app ni direka supaya **satu tempat sahaja** (bahagian
`:root` dalam `css/style.css`, di bahagian paling atas) mengawal SEMUA warna
kedai. Struktur/layout (grid produk, borang, butang, dll) **tidak perlu
disentuh langsung** bila nak buat kedai klien baru.

## Cara Tukar Warna Untuk Klien Baru

1. Buka `css/style.css`
2. Cari bahagian **"🎨 TEMA KEDAI"** di bahagian paling atas fail
3. Tukar nilai kod warna (kod hex, contoh `#0F5257`) kepada palet pilihan
   anda (lihat contoh siap guna di bawah)
4. **Simpan** — seluruh kedai terus bertukar warna, tiada tempat lain perlu
   diubah

## Apa Setiap Warna Kawal?

| Nama Variable | Kawal Bahagian Mana |
|---|---|
| `--bg` | Warna latar belakang keseluruhan kedai |
| `--surface` | Warna kad produk, kotak borang |
| `--primary` | Warna "signboard" — header atas, butang utama, navigasi |
| `--primary-dark` | Warna harga produk, teks aksen gelap |
| `--accent` | Warna butang penting (Tambah ke Troli, Hantar Pesanan) |
| `--accent-dark` | Warna accent versi gelap (hover/border) |
| `--text` | Warna teks utama |
| `--text-muted` | Warna teks kurang penting (keterangan, hint) |
| `--border` | Warna garis sempadan kad/kotak |

---

## Palet Warna Siap Guna (Copy-Paste Terus)

### 🔵 Kedai Biru Laut (Profesional/Korporat)
```css
--bg:#F4F8FB;
--surface:#FFFFFF;
--primary:#154D71;
--primary-dark:#0D3450;
--accent:#F2994A;
--accent-dark:#D9822E;
--text:#1C2B36;
--text-muted:#6B7C88;
--border:#DCE6ED;
```

### 🟢 Kedai Hijau Segar (Pertanian/Organik/Kesihatan)
```css
--bg:#F5F8F0;
--surface:#FFFFFF;
--primary:#2D5F3E;
--primary-dark:#1E4029;
--accent:#E8A33D;
--accent-dark:#CC8A28;
--text:#233021;
--text-muted:#6E7A6A;
--border:#DCE6D5;
```

### 🔴 Kedai Merah Bersemangat (Makanan/F&B/Retail)
```css
--bg:#FDF6F3;
--surface:#FFFFFF;
--primary:#9E2B25;
--primary-dark:#701D19;
--accent:#F2B441;
--accent-dark:#D99B2C;
--text:#2B1D1B;
--text-muted:#7A6C69;
--border:#EFDCD6;
```

### 🟣 Kedai Ungu Elegan (Fesyen/Kecantikan)
```css
--bg:#F8F5FA;
--surface:#FFFFFF;
--primary:#4B2E5A;
--primary-dark:#331F3E;
--accent:#E8A33D;
--accent-dark:#CC8A28;
--text:#241C29;
--text-muted:#736A79;
--border:#E3D9E9;
```

### ⚫ Kedai Hitam Moden (Elektronik/Automotif/Premium)
```css
--bg:#F5F5F5;
--surface:#FFFFFF;
--primary:#1A1A1A;
--primary-dark:#000000;
--accent:#D4A537;
--accent-dark:#B88E2A;
--text:#1A1A1A;
--text-muted:#6E6E6E;
--border:#DDDDDD;
```

### 🟠 CKT Global (Semasa — Kawalan Serangga/Pertanian)
```css
--bg:#FBF7EF;
--surface:#FFFFFF;
--primary:#0F5257;
--primary-dark:#0A3B3F;
--accent:#F2A541;
--accent-dark:#D88F2E;
--text:#1F2A2B;
--text-muted:#6E7B7C;
--border:#E4DCC7;
```

---

## Cara Cepat Uji Palet Sebelum Pilih

1. Buka [coolors.co](https://coolors.co) atau [color.adobe.com](https://color.adobe.com)
2. Cipta palet 3-4 warna berdasarkan logo/jenis produk klien
3. Pastikan `--primary` cukup gelap untuk teks putih di atasnya kekal jelas
   (untuk header & butang)
4. Test kedai di telefon sebenar selepas tukar — pastikan kontras teks/warna
   masih mudah dibaca

## Nota Penting

- **Fon** (`--font-display`, `--font-body`) juga boleh ditukar kalau nak
  jenama klien lebih berbeza (contoh: fon lebih moden/casual untuk kedai
  fesyen vs fon serif elegan untuk kedai premium) — tapi ini pilihan,
  tidak wajib
- **Logo & nama kedai** ditetapkan berasingan di Admin → Tetapan (bukan
  dalam fail CSS ni)
- Struktur/susunan (grid 2 lajur, kategori, troli, dll) **kekal 100% sama**
  — cuma "cat" yang berubah, sepadan konsep "bangunan sama, warna berbeza"
