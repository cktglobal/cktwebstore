-- Migration: Tambah ciri testimoni pelanggan (ditaip sendiri oleh admin)
-- Jalankan skrip ni SEKALI sahaja di Supabase SQL Editor (Project anda > SQL Editor > New query)

alter table products add column if not exists testimonials jsonb not null default '[]'::jsonb;
