-- ============================================================
-- Migration: Tambah lajur "category" pada jadual products
-- Jalankan ini di Supabase SQL Editor (sekali sahaja)
-- ============================================================

alter table products
  add column if not exists category text not null default 'Lain-Lain';
