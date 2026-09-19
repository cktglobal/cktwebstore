-- ============================================================
-- Migration: Backfill customer->>phoneDigits untuk pesanan SEDIA ADA
-- (pesanan yang dibuat SEBELUM ciri carian ikut telefon ditambah)
-- Jalankan ini di Supabase SQL Editor (sekali sahaja)
-- ============================================================

update orders
set customer = jsonb_set(
  customer,
  '{phoneDigits}',
  to_jsonb(regexp_replace(customer->>'phone', '\D', '', 'g'))
)
where customer->>'phoneDigits' is null
  and customer->>'phone' is not null;
