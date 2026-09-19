-- ============================================================
-- Migration: Tambah lajur video promosi pada jadual settings
-- Jalankan ini di Supabase SQL Editor (sekali sahaja)
-- ============================================================

alter table settings
  add column if not exists promo_video_type text not null default 'none',
  add column if not exists promo_video text,
  add column if not exists promo_video_url text;
