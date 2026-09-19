# CKT Global Webstore

App jualan mudah alih (mobile-first) untuk CKT Global — katalog produk ikut kategori,
troli, checkout dengan pengiraan shipping ikut zon & berat, bayaran QR bank, jejak
pesanan pelanggan, dan panel admin. Data disimpan di **Supabase**.

## Struktur Projek

```
cktwebstore/
├── index.html              ← Halaman utama (struktur HTML)
├── css/
│   └── style.css           ← Semua styling (design tokens, layout, komponen)
├── js/
│   ├── config.js           ← Konfigurasi Supabase (URL + anon key)
│   └── app.js               ← Logik aplikasi penuh (katalog, troli, checkout, admin)
├── supabase/
│   ├── schema.sql           ← Skema pangkalan data asal (jadual settings/products/orders)
│   └── migration-tambah-kategori.sql  ← Migration tambahan (lajur kategori)
├── netlify.toml             ← Konfigurasi deploy Netlify
├── .gitignore
└── README.md                ← Fail ini
```

## Setup Pantas

### 1. Supabase (pangkalan data)
1. Cipta projek di [supabase.com](https://supabase.com)
2. Buka **SQL Editor** → jalankan kandungan `supabase/schema.sql`
3. Kalau projek Supabase sedia ada (dah ada jadual `products` tanpa lajur kategori),
   jalankan juga `supabase/migration-tambah-kategori.sql`
4. Dapatkan **Project URL** dan **anon public key** di
   **Project Settings → Data API**
5. Masukkan kedua-dua nilai tu dalam `js/config.js`:
   ```js
   window.SUPABASE_URL = "https://xxxxxxxx.supabase.co";
   window.SUPABASE_ANON_KEY = "eyJhbGciOi...";
   ```

### 2. Buka & Edit di VS Code
1. Buka keseluruhan folder `cktwebstore/` ini di VS Code
2. Edit `js/config.js` dengan kunci Supabase anda (langkah di atas)
3. Boleh terus edit `css/style.css` untuk ubah reka bentuk, atau `js/app.js`
   untuk ubah logik/ciri
4. Untuk test tempatan, guna extension **Live Server** (klik kanan `index.html` →
   "Open with Live Server") — tak perlu build step, ia fail statik biasa

### 3. Upload ke GitHub
```bash
git init
git add .
git commit -m "Initial commit — CKT Global Webstore"
git branch -M main
git remote add origin https://github.com/USERNAME/cktwebstore.git
git push -u origin main
```

### 4. Deploy ke Netlify

> ⚠️ **Setiap kali kod dikemas kini** (app.js atau style.css berubah), tukar nombor
> `?v=...` di `index.html` (baris `<link>` dan `<script>` yang rujuk `css/style.css`
> dan `js/app.js`) kepada nombor baru — contoh tukar `?v=1784520134` kepada
> `?v=1784520200`. Ini pastikan telefon pelanggan (terutamanya iPhone/Safari) ambil
> versi **terbaru**, bukan versi lama yang tersimpan dalam cache.

**Cara A — Drag & Drop (paling pantas, tak perlu GitHub):**
1. Buka [app.netlify.com](https://app.netlify.com) → tab "Sites"
2. Drag & drop keseluruhan folder `cktwebstore/` ke kotak upload

**Cara B — Sambung GitHub (auto-deploy setiap kali push):**
1. Netlify Dashboard → "Add new site" → "Import an existing project"
2. Pilih repo GitHub `cktwebstore` yang anda push tadi
3. Build command: (kosongkan — tiada build step diperlukan)
4. Publish directory: `.` (root)
5. Deploy

### 5. Sambungkan Domain Sendiri
1. Site settings → Domain management → Add a domain → masukkan domain anda
2. Salin DNS records yang diberi Netlify → tampal di pembekal domain anda (contoh: Porkbun)
3. Tunggu status "Verified" (biasanya 10 minit – beberapa jam)

## PWA (Progressive Web App) — "Add to Home Screen"

App ini kini disediakan sebagai PWA. Selepas deploy, pelanggan boleh pasang
app terus ke skrin utama telefon mereka, tanpa App Store/Play Store.

**Fail berkaitan:**
- `manifest.json` — nama app, ikon, warna tema
- `sw.js` — service worker (bolehkan app dipasang & simpan salinan asas untuk buka pantas)
- `icons/` — ikon app (192px, 512px, dan versi khas iOS)

**Cara pelanggan pasang (iPhone/Safari):**
1. Buka `cktwebstore.com` di Safari
2. Tekan ikon **Share** (kotak dengan anak panah ke atas) di bar bawah
3. Skrol & pilih **"Add to Home Screen"**
4. Tekan **"Add"** — ikon CKT Global akan muncul di skrin utama macam app biasa

**Cara pelanggan pasang (Android/Chrome):**
1. Buka `cktwebstore.com` di Chrome
2. Chrome mungkin **automatik** tunjuk banner "Add to Home Screen" / "Install app" di bawah
3. Kalau tidak muncul automatik: tekan **⋮** (menu 3 titik) → **"Add to Home screen"** atau **"Install app"**

**Nota:**
- Ciri PWA ni hanya berfungsi untuk versi **struktur folder** (index.html + css + js), **BUKAN** untuk fail tunggal `sales-app.html` yang berasingan — jadi pastikan anda deploy folder projek ni sepenuhnya (termasuk `manifest.json`, `sw.js`, dan folder `icons/`)
- Selepas app dipasang di skrin utama, ia dibuka **tanpa** address bar browser, rasa macam app asli
- Data produk/pesanan tetap perlukan internet (Supabase) — service worker cuma cache bingkai app (HTML/CSS/JS), bukan data

## Admin

- Akses panel admin melalui tab **⚙️ Admin** dalam app
- PIN lalai: `1234` (tukar serta-merta di Admin → Tetapan selepas guna kali pertama)

## Nota Penting

- Data (produk, pesanan) disimpan di Supabase — bukan dalam fail app, jadi selamat
  walaupun anda kemas kini/upload semula fail app
- Gambar (produk, logo, QR, resit) disimpan sebagai base64 terus dalam pangkalan data
  untuk kesederhanaan — sesuai untuk kedai kecil/sederhana
- Troli pelanggan disimpan dalam `localStorage` peranti masing-masing (bukan Supabase)
