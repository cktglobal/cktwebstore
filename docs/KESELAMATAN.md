# Pembaikan Keselamatan — Panduan Deploy

## Masalah yang dibaiki

| # | Masalah (sebelum) | Kesan | Pembaikan |
|---|---|---|---|
| 1 | Semua jadual boleh dibaca & ditulis oleh sesiapa dengan anon key (anon key memang terdedah dalam `js/config.js`) | Orang luar boleh ubah harga, kadar penghantaran, status pesanan, padam data | Awam cuma boleh **baca** produk & lajur paparan kedai. Semua penulisan admin melalui Edge Function `store-api` yang sahkan sesi admin |
| 2 | `admin_pin` disimpan teks biasa & boleh dibaca awam; PIN disemak dalam browser | Sesiapa boleh dapat PIN / langkau login admin | PIN disimpan sebagai hash bcrypt (`admin_pin_hash`), disemak di server, had 5 cubaan salah / 15 minit setiap IP |
| 3 | Token bot Telegram boleh dibaca awam | Orang luar boleh guna bot anda | Token cuma dibaca server (`store-api`, `billplz-notification`) |
| 4 | Jadual `orders` boleh dibaca awam | Nama, telefon, alamat & resit SEMUA pelanggan terdedah | Tiada akses awam. Pelanggan jejak pesanan melalui `track_order` / `track_orders_by_phone` yang cuma pulangkan status, item, jumlah & nama (tiada telefon/alamat/resit) |
| 5 | Jumlah pesanan & harga dikira dalam browser, `billplz-create-payment` terima `amount` dari browser | Pelanggan boleh bayar RM0.01 dan pesanan tetap jadi "paid" | Fungsi DB `place_order` kira harga, berat, kos penghantaran & jumlah dari database. `billplz-create-payment` ambil jumlah dari database. `billplz-notification` sahkan amaun dibayar sama dengan jumlah pesanan |
| 6 | `decrement_stock` boleh dipanggil awam | Orang luar boleh kosongkan stok semua produk | Server sahaja |
| 7 | `generate-waybill` boleh dipanggil awam | Orang luar boleh cipta konsainan Pos Laju atas akaun kedai | Function lama dihentikan; jana waybill melalui `store-api` (admin sahaja) |
| 8 | `billplz-notification` log raw body (data pelanggan) & petunjuk tentang secret key | Data peribadi dalam log | Log debug dibuang |
| 9 | `supabase-js@2` dari CDN tanpa versi tetap | Kemas kini CDN boleh masukkan kod berbeza ke kedai tanpa disedari | Dikunci ke `@2.45.4` |

**cktlink tidak terjejas:** checkout cktlink cuma baca `settings.shipping_rates`, dan lajur itu kekal boleh dibaca awam.

## Langkah deploy (ikut susunan ni)

> Buat semasa kedai lengang. Antara langkah 3 dan 4, app lama di browser pelanggan tak boleh buat pesanan, jadi buat langkah 4 serta-merta selepas langkah 3.

### 1. Backup pangkalan data
Supabase Dashboard → **Database → Backups**. Pastikan ada backup terkini, atau export jadual `settings`, `products` dan `orders` (Table Editor → Export to CSV).

### 2. Deploy Edge Functions
Function baharu: `store-api`. Function yang dikemas kini: `billplz-create-payment`, `billplz-notification` dan `generate-waybill`.

**Cara A — Supabase CLI** (dari folder repo):
```bash
supabase functions deploy store-api --project-ref dhouwiyotjxfijtsspzt
supabase functions deploy billplz-create-payment --project-ref dhouwiyotjxfijtsspzt
supabase functions deploy billplz-notification --project-ref dhouwiyotjxfijtsspzt --no-verify-jwt
supabase functions deploy generate-waybill --project-ref dhouwiyotjxfijtsspzt
```

**Cara B — Dashboard:** Edge Functions → **Deploy a new function** → namakan `store-api` → tampal kandungan `supabase/functions/store-api/index.ts` → Deploy. Untuk 3 function lain, buka function tu → **Code** → tampal kandungan baharu → Deploy.

Nota:
- `store-api`, `billplz-create-payment` & `generate-waybill`: **"Verify JWT" ON** (lalai — dipanggil dari browser dengan anon key).
- `billplz-notification` mesti kekal **"Verify JWT" OFF**, sebab webhook Billplz tak bawa JWT (sama macam sekarang).
- `store-api` guna secrets Pos Laju yang sama (`POS_CLIENT_ID`, `POS_CLIENT_SECRET`, `POS_ACCOUNT_NUMBER`, `POS_BASE_URL`). Secrets Supabase dikongsi semua function dalam projek, jadi tak perlu set semula.
- Selepas yakin semuanya OK, boleh padam terus function `generate-waybill` di Dashboard.

### 3. Jalankan migration SQL
Supabase Dashboard → **SQL Editor** → New query → tampal **keseluruhan** `supabase/migration-keselamatan.sql` → Run.

PIN admin sedia ada **kekal sama**. Ia cuma ditukar kepada hash.

### 4. Deploy frontend
Merge branch ni ke `main`. Netlify auto-deploy dari `main` (site "tiny-sawine-cf31da", disambung melalui GitHub App), jadi **merge = terus live** dalam masa ~1 minit. Semak status di Netlify → Project overview (Building → Published).

Nota: Netlify **tidak** deploy Edge Functions. Fail `supabase/functions/*` mesti dideploy manual ke Supabase (langkah 2).

### 5. Uji
1. Buka kedai → buat satu pesanan ujian (upload resit) → pastikan notifikasi Telegram sampai.
2. `cktwebstore.com/?admin=1` → login dengan PIN sedia ada → semak tab Produk, Pesanan, Tetapan.
3. Buka checkout kedai cktlink (jenis "produk") → pastikan kos penghantaran masih dikira.

### 6. WAJIB selepas deploy
Sebelum ni PIN dan token Telegram boleh dibaca sesiapa, jadi anggap kedua-duanya **sudah bocor**:

1. **Tukar PIN admin**: Admin → Tetapan → "Tukar PIN Login" (min 6 aksara, lebih panjang lebih baik).
2. **Tukar token bot Telegram**: Telegram → @BotFather → `/revoke` → pilih bot → salin token baharu → tampal di Admin → Tetapan → Simpan.
3. **Semak data**: harga produk, stok, kadar penghantaran, QR bank (pastikan QR masih QR akaun anda!) dan status pesanan, kalau-kalau ada yang telah diubah orang luar.
4. **Semak Billplz & Pos Laju**: cari bil atau konsainan yang anda tak kenal.

## Terlupa PIN / terkunci
Di SQL Editor:
```sql
-- Tetapkan PIN baharu
update settings set admin_pin_hash = extensions.crypt('PIN-BAHARU-ANDA', extensions.gen_salt('bf')) where id = 1;
delete from admin_sessions;

-- Buang sekatan selepas terlalu banyak cubaan salah
delete from admin_login_attempts where not success;
```

## Had yang masih ada (untuk pertimbangan seterusnya)
- **Jejak ikut No. Telefon**: sesiapa yang tahu nombor telefon pelanggan boleh lihat senarai pesanannya (item, jumlah, status, nama), tetapi bukan alamat atau telefon. Kalau mahu lebih ketat, minta juga No. Pesanan atau 4 digit akhir.
- **Anon key** memang awam (itu reka bentuk Supabase). Keselamatan bergantung pada polisi RLS dan grant dalam migration, jadi **jangan** jalankan semula fail lama yang buka polisi awam (`migration-betulkan-padam-pesanan.sql` kini dikosongkan atas sebab ni).
- **Semakan lesen** (`license-check.js`) sengaja benarkan akses jika rangkaian gagal (fail-open).

---

## Pengukuhan tambahan (PR #5)

| Perkara | Kesan | Langkah deploy |
|---|---|---|
| **Had pesanan** (`supabase/migration-had-pesanan.sql`) — resit maks 2MB, 5 pesanan/jam setiap telefon, 10/jam setiap IP, 100/jam seluruh kedai | Spam tak boleh penuhkan database pelan Free (500MB) | Jalankan fail SQL tu di SQL Editor (bila-bila masa, tak ganggu kedai) |
| **Billplz guna formula rasmi sahaja** (`billplz-notification`) — 12 format lama dibuang, perbandingan signature tahan serangan masa | Kod lebih ringkas & ketat | Deploy semula function (Verify JWT kekal **OFF**) — tapi **semak log dulu** (lihat bawah) |
| **Content Security Policy** (`netlify.toml`) + skrip service worker diasingkan | Kalau kod jahat tersisip, ia tak boleh jalan atau hantar data keluar | Automatik bila merge ke `main` |

**Sebelum deploy `billplz-notification`:** Supabase → Edge Functions → `billplz-notification` → **Logs**, cari `signature sah (format:`. Semua bayaran berjaya sebelum ni patut tunjuk `format: rasmi-billplz-woocommerce`. Kalau ada format lain, **jangan deploy** versi baharu — beritahu developer dulu.

Had pesanan boleh diubah atau dimatikan sementara — lihat nota di hujung `migration-had-pesanan.sql`.
