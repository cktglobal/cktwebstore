-- Migration: Tambah ciri stok produk
-- Jalankan skrip ni SEKALI sahaja di Supabase SQL Editor (Project anda > SQL Editor > New query)

-- 1. Tambah kolum stok ke jadual products (default 0 untuk produk sedia ada —
--    anda perlu kemaskini stok produk lama tu di admin panel selepas migration ni)
alter table products add column if not exists stock integer not null default 0;

-- 2. Fungsi untuk tolak stok secara atomic (selamat) di server.
--    Ini penting supaya kalau 2 pelanggan checkout produk yang sama dalam masa
--    hampir serentak, stok tetap tepat (tak overselling) — proses tolak stok
--    berlaku terus dalam satu langkah di database, bukan baca-nilai-lama-then-tulis
--    dari browser (yang boleh terlepas pandang perubahan serentak).
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
