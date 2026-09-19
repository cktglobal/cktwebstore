-- Migration: Tukar pembayaran online dari DOKU kepada Billplz
-- Jalankan skrip ni SEKALI sahaja di Supabase SQL Editor (Project anda > SQL Editor > New query)

alter table orders add column if not exists billplz_bill_id text;
alter table orders add column if not exists billplz_transaction_id text;
alter table orders add column if not exists billplz_payment_url text;

-- Column payment_method sedia ada ('manual' / 'doku') kekal — 'doku' terus
-- kekal pada pesanan LAMA untuk rekod sejarah. Pesanan BAHARU guna 'billplz'
-- untuk bayaran online terus (kod app.js/Edge Function dah tak cipta
-- pesanan 'doku' baru lepas migration ni).

-- Column doku_payment_url / doku_transaction_id TIDAK dibuang — dikekalkan
-- untuk rujukan sejarah pesanan lama yang dibayar melalui DOKU.
