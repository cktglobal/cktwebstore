-- ============================================================
-- Migration: HAD PESANAN (elak spam memenuhkan pangkalan data)
-- ============================================================
-- Projek Supabase pelan Free cuma ada 500MB. Tanpa had, orang jahat
-- boleh hantar pesanan palsu berulang kali (setiap satu dengan resit
-- besar) sampai database penuh & kedai berhenti berfungsi.
--
-- Had untuk pesanan dari kedai (pelanggan awam):
--   * Resit maksimum ~2MB (gambar resit dah dikecilkan oleh app ke
--     ~100KB; had ni untuk PDF besar atau permintaan yang dipalsukan)
--   * Maksimum 5 pesanan sejam untuk nombor telefon yang sama
--   * Maksimum 10 pesanan sejam dari alamat IP yang sama
--   * Maksimum 100 pesanan sejam untuk seluruh kedai
-- Pesanan dari server (service_role) tidak terjejas.
--
-- Jalankan SEKALI di Supabase SQL Editor (selamat dijalankan semula).
-- ============================================================

begin;

-- Log IP ringkas (disimpan sebagai hash, dipadam selepas 24 jam)
create table if not exists order_rate_log (
  id bigserial primary key,
  ip_hash text not null,
  created_at timestamptz not null default now()
);
create index if not exists order_rate_log_ip_time_idx on order_rate_log (ip_hash, created_at);
alter table order_rate_log enable row level security;
revoke all on order_rate_log from public, anon, authenticated;
revoke all on sequence order_rate_log_id_seq from public, anon, authenticated;

create index if not exists orders_phone_digits_time_idx
  on orders ((customer->>'phoneDigits'), created_at);
create index if not exists orders_created_at_idx on orders (created_at);

create or replace function enforce_order_limits()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_role text := coalesce(current_setting('request.jwt.claims', true)::json->>'role', '');
  v_headers json := nullif(current_setting('request.headers', true), '')::json;
  v_ip text;
  v_ip_hash text;
  v_phone text := new.customer->>'phoneDigits';
begin
  -- Hanya hadkan pesanan dari pelanggan awam (anon key)
  if v_role not in ('anon', 'authenticated') then
    return new;
  end if;

  if new.receipt_image is not null and length(new.receipt_image) > 3000000 then
    raise exception 'Fail resit terlalu besar (maksimum 2MB). Sila guna gambar/screenshot resit.';
  end if;

  if v_phone is not null and (
    select count(*) from orders
    where customer->>'phoneDigits' = v_phone
      and created_at > now() - interval '1 hour'
  ) >= 5 then
    raise exception 'Terlalu banyak pesanan dari nombor telefon ini dalam masa sejam. Sila cuba lagi kemudian atau hubungi kedai.';
  end if;

  if (select count(*) from orders where created_at > now() - interval '1 hour') >= 100 then
    raise exception 'Kedai sedang menerima terlalu banyak pesanan. Sila cuba lagi sebentar lagi.';
  end if;

  v_ip := btrim(split_part(coalesce(v_headers->>'x-forwarded-for', v_headers->>'cf-connecting-ip', ''), ',', 1));
  if v_ip <> '' then
    v_ip_hash := encode(sha256(convert_to(v_ip, 'UTF8')), 'hex');
    if (select count(*) from order_rate_log
        where ip_hash = v_ip_hash and created_at > now() - interval '1 hour') >= 10 then
      raise exception 'Terlalu banyak pesanan dari rangkaian ini dalam masa sejam. Sila cuba lagi kemudian atau hubungi kedai.';
    end if;
    insert into order_rate_log (ip_hash) values (v_ip_hash);
    delete from order_rate_log where created_at < now() - interval '24 hours';
  end if;

  return new;
end;
$$;

revoke execute on function enforce_order_limits() from public, anon, authenticated;

drop trigger if exists trg_enforce_order_limits on orders;
create trigger trg_enforce_order_limits
  before insert on orders
  for each row execute function enforce_order_limits();

commit;

-- ============================================================
-- Nota
-- ============================================================
-- Tukar had: ubah nombor 5 / 10 / 100 atau 3000000 di atas, kemudian
-- jalankan semula fail ni.
--
-- Matikan sementara (cth semasa promosi besar):
--   alter table orders disable trigger trg_enforce_order_limits;
-- Hidupkan semula:
--   alter table orders enable trigger trg_enforce_order_limits;
