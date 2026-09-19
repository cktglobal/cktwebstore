-- ============================================================
-- Migration: Tambah lajur maklumat sender & waybill Pos Laju
-- Jalankan ini di Supabase SQL Editor (sekali sahaja)
-- ============================================================

alter table settings
  add column if not exists sender_name text,
  add column if not exists sender_phone text,
  add column if not exists sender_email text,
  add column if not exists sender_address1 text,
  add column if not exists sender_city text,
  add column if not exists sender_state text,
  add column if not exists sender_postcode text;

alter table orders
  add column if not exists waybill_pdf_url text;
