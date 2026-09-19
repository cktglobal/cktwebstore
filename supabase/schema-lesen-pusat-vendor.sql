-- ============================================================
-- SKEMA PANGKALAN DATA LESEN PUSAT (Untuk Vendor/Anda)
-- ============================================================
-- PENTING: Jalankan skema ini di projek Supabase BERASINGAN —
-- BUKAN di projek Supabase mana-mana pelanggan/klien anda.
-- Ini adalah "pusat kawalan" untuk SEMUA lesen pelanggan anda.
-- ============================================================

create table if not exists licenses (
  license_key text primary key,
  client_name text not null,
  plan text not null default 'monthly',        -- 'monthly' | 'yearly' | 'lifetime'
  status text not null default 'active',        -- 'active' | 'suspended' | 'cancelled'
  activated_at timestamptz not null default now(),
  expires_at timestamptz,                        -- null = tiada tarikh luput (lifetime)
  notes text,                                     -- contoh: nombor telefon/emel klien
  created_at timestamptz not null default now()
);

-- ============================================================
-- KESELAMATAN: Jangan dedahkan jadual ni terus kepada public.
-- Sebaliknya, guna FUNGSI (RPC) yang cuma pulangkan status untuk
-- SATU kunci lesen sahaja — bukan seluruh jadual. Ini elak orang
-- lain "intip" senarai semua klien anda.
-- ============================================================

alter table licenses enable row level security;
-- SENGAJA tiada "select" policy awam di sini — akses hanya
-- melalui fungsi check_license() di bawah.

create or replace function check_license(key text)
returns table(status text, expires_at timestamptz, plan text)
language sql
security definer
set search_path = public
as $$
  select status, expires_at, plan
  from licenses
  where license_key = key;
$$;

grant execute on function check_license(text) to anon;
grant execute on function check_license(text) to authenticated;

-- ============================================================
-- CARA URUS LESEN (Guna SQL Editor / Table Editor Supabase)
-- ============================================================

-- Tambah lesen baru untuk klien baru (contoh):
-- insert into licenses (license_key, client_name, plan, status, expires_at, notes)
-- values ('CKT-ABDUL-2026-XJ4K', 'Kedai Abdul Sdn Bhd', 'monthly', 'active',
--         now() + interval '30 days', '012-3456789');

-- Perbaharui langganan bulanan (lanjutkan 30 hari lagi):
-- update licenses set expires_at = expires_at + interval '30 days', status = 'active'
-- where license_key = 'CKT-ABDUL-2026-XJ4K';

-- Perbaharui langganan tahunan (lanjutkan 365 hari):
-- update licenses set expires_at = expires_at + interval '365 days', status = 'active'
-- where license_key = 'CKT-ABDUL-2026-XJ4K';

-- Gantung/tarik balik akses klien (contoh: gagal bayar):
-- update licenses set status = 'suspended' where license_key = 'CKT-ABDUL-2026-XJ4K';

-- Lihat semua lesen & status semasa:
-- select license_key, client_name, plan, status, expires_at from licenses order by created_at desc;

-- Lihat lesen yang akan luput dalam 7 hari (untuk hantar peringatan bayaran):
-- select license_key, client_name, expires_at from licenses
-- where status = 'active' and expires_at < now() + interval '7 days'
-- order by expires_at asc;
