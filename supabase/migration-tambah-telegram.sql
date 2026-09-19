-- ============================================================
-- Migration: Tambah lajur notifikasi Telegram pada jadual settings
-- Jalankan ini di Supabase SQL Editor (sekali sahaja)
-- ============================================================

alter table settings
  add column if not exists telegram_bot_token text,
  add column if not exists telegram_chat_id text;
