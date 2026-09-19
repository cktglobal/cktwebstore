-- ============================================================
-- Migration + Automasi: Padam automatik pesanan "Completed"
-- selepas 3 hari
-- Jalankan KESELURUHAN fail ini di Supabase SQL Editor (sekali sahaja)
-- ============================================================

-- 1. Tambah lajur untuk rekod BILA pesanan jadi "Completed"
--    (diperlukan supaya kiraan "3 hari" tepat — dikira dari tarikh
--    siap, bukan tarikh pesanan dibuat)
alter table orders
  add column if not exists completed_at timestamptz;

-- 2. Aktifkan sambungan penjadualan (pg_cron) — percuma, tersedia
--    pada semua pelan Supabase termasuk Free Tier
create extension if not exists pg_cron;

-- 3. Padam job lama (jika ada) sebelum cipta semula, elak duplikasi
select cron.unschedule('delete-old-completed-orders')
where exists (
  select 1 from cron.job where jobname = 'delete-old-completed-orders'
);

-- 4. Jadualkan tugasan: setiap hari jam 2:00 pagi (UTC), padam
--    pesanan yang status "completed" DAN sudah lebih 3 hari sejak
--    tarikh siap (completed_at)
select cron.schedule(
  'delete-old-completed-orders',
  '0 2 * * *',
  $$
  delete from orders
  where status = 'completed'
    and completed_at is not null
    and completed_at < now() - interval '3 days'
  $$
);

-- ============================================================
-- CARA SEMAK / URUS TUGASAN NI DI MASA DEPAN
-- ============================================================

-- Lihat semua tugasan berjadual yang aktif:
-- select * from cron.job;

-- Lihat sejarah 10 kali tugasan ni dijalankan (untuk pastikan berjaya):
-- select jobname, status, return_message, start_time, end_time
-- from cron.job_run_details
-- where jobname = 'delete-old-completed-orders'
-- order by start_time desc limit 10;

-- Kalau nak BERHENTIKAN automasi ni pada bila-bila masa:
-- select cron.unschedule('delete-old-completed-orders');

-- Kalau nak TUKAR tempoh (contoh: 7 hari bukan 3 hari), tukar
-- "interval '3 days'" di atas kepada "interval '7 days'", padam
-- job lama dulu (arahan 3), kemudian jadualkan semula (arahan 4).
