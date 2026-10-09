-- ============================================================
-- Skema Supabase untuk App Jualan CKT Global
-- Cara guna: Buka Supabase Dashboard -> SQL Editor -> New Query
-- Tampal keseluruhan fail ini -> tekan "Run"
-- ============================================================

-- 1. Jadual TETAPAN (satu baris sahaja, id=1)
create table if not exists settings (
  id int primary key default 1,
  store_name text not null default 'Kedai Saya',
  store_logo text,
  qr_image text,
  admin_pin text not null default '1234',
  shipping_rates jsonb not null default '{}'::jsonb,
  promo_images jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- Masukkan baris tetapan lalai (kalau belum ada)
insert into settings (id, store_name, admin_pin, shipping_rates)
values (
  1,
  'CKT Global',
  '1234',
  '{
    "semenanjung": [
      {"minKg":0, "maxKg":3, "rate":5.90},
      {"minKg":3.01, "maxKg":5, "rate":7.00},
      {"minKg":5.01, "maxKg":10, "rate":10.00}
    ],
    "sarawak": [
      {"minKg":0, "maxKg":3, "rate":12.00},
      {"minKg":3.01, "maxKg":5, "rate":15.00},
      {"minKg":5.01, "maxKg":10, "rate":20.00}
    ],
    "sabah": [
      {"minKg":0, "maxKg":3, "rate":12.00},
      {"minKg":3.01, "maxKg":5, "rate":15.00},
      {"minKg":5.01, "maxKg":10, "rate":20.00}
    ]
  }'::jsonb
)
on conflict (id) do nothing;

-- 2. Jadual PRODUK
create table if not exists products (
  id text primary key,
  name text not null,
  description text,
  price numeric not null default 0,
  weight numeric not null default 0,
  images jsonb not null default '[]'::jsonb,
  variants jsonb not null default '[]'::jsonb,
  stock integer not null default 0,
  testimonials jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- 3. Jadual PESANAN
create table if not exists orders (
  id text primary key,
  created_at timestamptz not null default now(),
  customer jsonb not null,
  items jsonb not null,
  weight numeric not null default 0,
  subtotal numeric not null default 0,
  shipping_cost numeric not null default 0,
  total numeric not null default 0,
  receipt_image text,
  status text not null default 'pending',
  tracking_number text default ''
);

-- ============================================================
-- Row Level Security (RLS) — Peraturan Akses
-- Awam cuma boleh BACA settings & products. Tiada akses terus ke orders.
-- Semua penulisan dibuat melalui fungsi DB / Edge Function store-api.
-- PENTING: selepas fail ni (dan migration-*.sql lain), jalankan
-- migration-keselamatan.sql PALING AKHIR — ia cipta fungsi place_order,
-- track_order, login admin dsb. dan hadkan lajur settings yang boleh
-- dibaca awam.
-- ============================================================
alter table settings enable row level security;
alter table products enable row level security;
alter table orders enable row level security;

drop policy if exists "public read settings" on settings;
create policy "public read settings" on settings for select using (true);

drop policy if exists "public read products" on products;
create policy "public read products" on products for select using (true);

-- ============================================================
-- Fungsi: tolak stok produk secara atomic (selamat dari race condition
-- bila 2 pelanggan checkout produk sama dalam masa hampir serentak)
-- ============================================================
create or replace function decrement_stock(p_id text, qty integer)
returns integer as $$
declare
  new_stock integer;
begin
  update products
  set stock = greatest(stock - qty, 0)
  where id = p_id
  returning stock into new_stock;
  return new_stock;
end;
$$ language plpgsql;
