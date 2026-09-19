-- Migration: Tambah sokongan pembayaran online DOKU
-- Jalankan skrip ni SEKALI sahaja di Supabase SQL Editor (Project anda > SQL Editor > New query)

alter table orders add column if not exists payment_method text not null default 'manual';
-- 'manual' = upload resit (flow sedia ada), 'doku' = bayar online terus melalui DOKU

alter table orders add column if not exists doku_payment_url text;
alter table orders add column if not exists doku_transaction_id text;
