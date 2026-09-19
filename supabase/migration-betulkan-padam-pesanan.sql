-- Migration: Betulkan polisi RLS untuk padam pesanan
-- Jalankan skrip ni SEKALI sahaja di Supabase SQL Editor (Project anda > SQL Editor > New query)
--
-- Punca masalah: jadual "orders" ada RLS (Row Level Security) diaktifkan,
-- tapi schema asal cuma bagi polisi untuk select/insert/update — TIADA polisi
-- untuk "delete". Bila RLS aktif tapi tiada polisi untuk sesuatu operasi,
-- Postgres senyap-senyap tolak operasi tu (0 baris terjejas) tanpa error —
-- sebab itu butang padam nampak "berjaya" tapi pesanan lama tetap kekal.

drop policy if exists "public delete orders" on orders;
create policy "public delete orders" on orders for delete using (true);
