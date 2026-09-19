-- Migration: Tambah sokongan banner carousel (berbilang imej)
-- Jalankan skrip ni SEKALI sahaja di Supabase SQL Editor (Project anda > SQL Editor > New query)

alter table settings add column if not exists promo_images jsonb not null default '[]'::jsonb;

-- Migrate imej banner sedia ada (kalau ada) terus ke dalam array baru
update settings
set promo_images = jsonb_build_array(promo_image)
where promo_image is not null and (promo_images is null or promo_images = '[]'::jsonb);
