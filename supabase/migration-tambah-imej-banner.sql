-- ============================================================
-- Migration: Tambah lajur imej banner promosi pada jadual settings
-- Jalankan ini di Supabase SQL Editor (sekali sahaja)
-- ============================================================

alter table settings
  add column if not exists promo_image text;
