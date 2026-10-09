-- ============================================================
-- Migration KESELAMATAN — tutup akses awam ke pangkalan data
-- ============================================================
-- Sebelum ni semua jadual (settings, products, orders) boleh dibaca
-- DAN ditulis oleh sesiapa sahaja yang ada anon key (anon key memang
-- terdedah dalam js/config.js — itu normal). Akibatnya orang luar boleh:
--   * baca admin_pin & token bot Telegram dari jadual settings
--   * baca nama/telefon/alamat SEMUA pelanggan dari jadual orders
--   * ubah harga produk, kadar penghantaran, status pesanan, padam data
--
-- Selepas migration ni:
--   * settings  -> awam cuma boleh BACA lajur paparan kedai (nama, logo,
--                  QR, kadar penghantaran, banner). PIN disimpan sebagai
--                  hash bcrypt (admin_pin_hash), token Telegram & alamat
--                  sender tak lagi boleh dibaca awam.
--   * products  -> awam cuma boleh BACA.
--   * orders    -> awam TIADA akses terus. Pelanggan buat pesanan melalui
--                  fungsi place_order() (harga, berat, kos penghantaran &
--                  jumlah dikira di SERVER — tak boleh dipalsukan dari
--                  browser), dan jejak pesanan melalui track_order() /
--                  track_orders_by_phone() yang cuma pulangkan maklumat
--                  asas (tiada alamat/telefon).
--   * Semua operasi admin (produk, tetapan, pesanan, waybill, Telegram)
--     melalui Edge Function "store-api" yang sahkan sesi admin di server.
--
-- PENTING — SUSUNAN DEPLOY (ikut docs/KESELAMATAN.md):
--   1. Deploy Edge Function store-api + billplz-create-payment +
--      billplz-notification + generate-waybill (versi baharu)
--   2. Jalankan fail ni di Supabase SQL Editor (sekali sahaja)
--   3. Terus deploy app.js/config.js/index.html baharu (Netlify)
-- Antara langkah 2 dan 3, app lama di browser pelanggan tak boleh buat
-- pesanan — buat masa kedai lengang, dan jangan lengahkan langkah 3.
--
-- Fail ni selamat dijalankan lebih dari sekali.
-- ============================================================

begin;

create extension if not exists pgcrypto with schema extensions;

-- ------------------------------------------------------------
-- 0. Pastikan semua lajur yang digunakan wujud (kalau ada migration
--    lama yang terlepas, grant lajur di bawah akan gagal tanpa ni)
-- ------------------------------------------------------------
alter table settings
  add column if not exists promo_image text,
  add column if not exists promo_images jsonb not null default '[]'::jsonb,
  add column if not exists promo_video_type text not null default 'none',
  add column if not exists promo_video text,
  add column if not exists promo_video_url text,
  add column if not exists telegram_bot_token text,
  add column if not exists telegram_chat_id text,
  add column if not exists sender_name text,
  add column if not exists sender_phone text,
  add column if not exists sender_email text,
  add column if not exists sender_address1 text,
  add column if not exists sender_city text,
  add column if not exists sender_state text,
  add column if not exists sender_postcode text,
  add column if not exists admin_pin_hash text;

alter table orders
  add column if not exists completed_at timestamptz,
  add column if not exists waybill_pdf_url text,
  add column if not exists payment_method text not null default 'manual',
  add column if not exists billplz_bill_id text,
  add column if not exists billplz_transaction_id text,
  add column if not exists billplz_payment_url text,
  add column if not exists notified_at timestamptz;

alter table products
  add column if not exists category text not null default 'Lain-Lain',
  add column if not exists stock integer not null default 0,
  add column if not exists testimonials jsonb not null default '[]'::jsonb;

-- ------------------------------------------------------------
-- 1. PIN admin -> hash bcrypt (PIN sedia ada kekal sama, cuma tak lagi
--    disimpan sebagai teks biasa)
-- ------------------------------------------------------------
update settings
set admin_pin_hash = extensions.crypt(admin_pin, extensions.gen_salt('bf'))
where admin_pin_hash is null and admin_pin is not null and admin_pin <> '';

alter table settings alter column admin_pin drop not null;
alter table settings alter column admin_pin drop default;
update settings set admin_pin = null where admin_pin is not null;

-- ------------------------------------------------------------
-- 2. Jadual sesi admin & rekod cubaan login (server sahaja)
-- ------------------------------------------------------------
create table if not exists admin_sessions (
  token_hash text primary key,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create table if not exists admin_login_attempts (
  id bigserial primary key,
  ip text,
  success boolean not null,
  attempted_at timestamptz not null default now()
);
create index if not exists admin_login_attempts_time_idx on admin_login_attempts (attempted_at);

alter table admin_sessions enable row level security;
alter table admin_login_attempts enable row level security;
revoke all on admin_sessions from public, anon, authenticated;
revoke all on admin_login_attempts from public, anon, authenticated;
revoke all on sequence admin_login_attempts_id_seq from public, anon, authenticated;

-- ------------------------------------------------------------
-- 3. Kunci akses jadual
-- ------------------------------------------------------------
alter table settings enable row level security;
alter table products enable row level security;
alter table orders enable row level security;

-- settings: baca lajur paparan kedai sahaja
drop policy if exists "public update settings" on settings;
drop policy if exists "public read settings" on settings;
create policy "public read settings" on settings for select using (true);
revoke all on settings from anon, authenticated;
grant select (
  id, store_name, store_logo, qr_image, shipping_rates,
  promo_image, promo_images, promo_video_type, promo_video, promo_video_url,
  updated_at
) on settings to anon, authenticated;

-- products: baca sahaja
drop policy if exists "public write products" on products;
drop policy if exists "public update products" on products;
drop policy if exists "public delete products" on products;
drop policy if exists "public read products" on products;
create policy "public read products" on products for select using (true);
revoke all on products from anon, authenticated;
grant select on products to anon, authenticated;

-- orders: tiada akses terus langsung
drop policy if exists "public read orders" on orders;
drop policy if exists "public write orders" on orders;
drop policy if exists "public update orders" on orders;
drop policy if exists "public delete orders" on orders;
revoke all on orders from anon, authenticated;

-- decrement_stock: sebelum ni sesiapa boleh panggil & kosongkan stok
-- mana-mana produk. Sekarang server (service_role) sahaja.
revoke execute on function decrement_stock(text, integer) from public, anon, authenticated;
grant execute on function decrement_stock(text, integer) to service_role;

-- ------------------------------------------------------------
-- 4. Fungsi bantu
-- ------------------------------------------------------------

-- Maklumat pesanan yang selamat dipaparkan kepada pelanggan (TIADA
-- telefon/alamat/emel/resit)
create or replace function public_order_json(o orders)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'id', o.id,
    'created_at', o.created_at,
    'customer', jsonb_build_object('name', o.customer->>'name', 'zone', o.customer->>'zone'),
    'items', o.items,
    'weight', o.weight,
    'subtotal', o.subtotal,
    'shipping_cost', o.shipping_cost,
    'total', o.total,
    'status', o.status,
    'tracking_number', coalesce(o.tracking_number, ''),
    'payment_method', o.payment_method,
    'completed_at', o.completed_at
  );
$$;

-- Zon ikut 2 digit pertama poskod — sama dengan getZone() dalam app.js
create or replace function zone_from_postcode(p_postcode text)
returns text
language plpgsql
immutable
as $$
declare
  n int;
begin
  if p_postcode !~ '^[0-9]{5}$' then return null; end if;
  n := substr(p_postcode, 1, 2)::int;
  if n between 87 and 91 then return 'sabah'; end if;
  if n between 93 and 98 then return 'sarawak'; end if;
  return 'semenanjung';
end;
$$;

-- Kos penghantaran — logik sama dengan calcShipping() dalam app.js
create or replace function calc_shipping(p_zone text, p_weight numeric)
returns numeric
language plpgsql
stable
set search_path = public
as $$
declare
  r record;
  first_rate numeric;
  last_rate numeric;
  last_max numeric;
  n int := 0;
begin
  for r in
    select (e->>'minKg')::numeric as min_kg,
           nullif(e->>'maxKg', '')::numeric as max_kg,
           (e->>'rate')::numeric as rate
    from settings s, jsonb_array_elements(coalesce(s.shipping_rates->p_zone, '[]'::jsonb)) e
    where s.id = 1
    order by (e->>'minKg')::numeric
  loop
    n := n + 1;
    if n = 1 then first_rate := r.rate; end if;
    if p_weight >= r.min_kg and (r.max_kg is null or p_weight <= r.max_kg) then
      return r.rate;
    end if;
    last_rate := r.rate;
    last_max := r.max_kg;
  end loop;
  if n = 0 then return 0; end if;
  -- JS: weight > null dinilai sebagai weight > 0
  if p_weight > coalesce(last_max, 0) then return last_rate; end if;
  return first_rate;
end;
$$;

-- ------------------------------------------------------------
-- 5. Fungsi AWAM untuk pelanggan
-- ------------------------------------------------------------

-- Cipta pesanan. Harga/berat diambil dari jadual products, kos
-- penghantaran dikira di sini — nilai dari browser TIDAK dipercayai.
-- Pesanan manual (upload resit) tolak stok terus; pesanan Billplz tolak
-- stok bila webhook sahkan bayaran (billplz-notification).
create or replace function place_order(
  p_customer jsonb,
  p_items jsonb,
  p_payment_method text,
  p_receipt_image text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_name text := btrim(coalesce(p_customer->>'name', ''));
  v_phone text := btrim(coalesce(p_customer->>'phone', ''));
  v_address text := btrim(coalesce(p_customer->>'address', ''));
  v_city text := btrim(coalesce(p_customer->>'city', ''));
  v_postcode text := btrim(coalesce(p_customer->>'postcode', ''));
  v_email text := btrim(coalesce(p_customer->>'email', ''));
  v_phone_digits text;
  v_zone text;
  v_line jsonb;
  v_prod products%rowtype;
  v_qty int;
  v_label text;
  v_need int;
  v_need_map jsonb := '{}'::jsonb;
  v_items jsonb := '[]'::jsonb;
  v_subtotal numeric := 0;
  v_weight numeric := 0;
  v_ship numeric;
  v_id text;
  v_receipt text := p_receipt_image;
  v_order orders%rowtype;
  k text;
  v text;
begin
  if p_payment_method is null or p_payment_method not in ('manual', 'billplz') then
    raise exception 'Kaedah bayaran tidak sah';
  end if;
  if v_name = '' or v_phone = '' or v_address = '' or v_city = '' then
    raise exception 'Sila lengkapkan semua maklumat';
  end if;
  if length(v_name) > 120 or length(v_phone) > 30 or length(v_address) > 500
     or length(v_city) > 100 or length(v_email) > 200 then
    raise exception 'Maklumat terlalu panjang';
  end if;
  v_phone_digits := regexp_replace(v_phone, '\D', '', 'g');
  if length(v_phone_digits) < 9 then
    raise exception 'No. telefon tidak sah';
  end if;
  v_zone := zone_from_postcode(v_postcode);
  if v_zone is null then
    raise exception 'Poskod tidak sah';
  end if;
  if v_email <> '' and v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'Emel tidak sah';
  end if;

  if p_payment_method = 'manual' then
    if v_receipt is null
       or not (v_receipt like 'data:image/%' or v_receipt like 'data:application/pdf%') then
      raise exception 'Sila upload resit bayaran (gambar atau PDF)';
    end if;
    if length(v_receipt) > 10000000 then
      raise exception 'Fail resit terlalu besar';
    end if;
  else
    if v_email = '' then
      raise exception 'Emel diperlukan untuk bayaran online';
    end if;
    v_receipt := null;
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 50 then
    raise exception 'Troli kosong atau tidak sah';
  end if;

  for v_line in select * from jsonb_array_elements(p_items)
  loop
    if coalesce(v_line->>'qty', '') !~ '^[0-9]{1,4}$' then
      raise exception 'Kuantiti tidak sah';
    end if;
    v_qty := (v_line->>'qty')::int;
    if v_qty < 1 then
      raise exception 'Kuantiti tidak sah';
    end if;

    select * into v_prod from products where id = v_line->>'productId';
    if not found then
      raise exception 'Ada produk dalam troli yang tidak lagi wujud — sila kemaskini troli anda';
    end if;

    v_label := coalesce(nullif(v_line->>'variantLabel', ''), 'none');
    if jsonb_array_length(coalesce(v_prod.variants, '[]'::jsonb)) > 0 then
      if not exists (
        select 1
        from jsonb_array_elements(v_prod.variants) vv,
             jsonb_array_elements_text(coalesce(vv->'options', '[]'::jsonb)) opt
        where (vv->>'name') || ': ' || opt = v_label
      ) then
        raise exception 'Sila pilih variasi untuk "%"', v_prod.name;
      end if;
    else
      v_label := 'none';
    end if;

    v_need := coalesce((v_need_map->>v_prod.id)::int, 0) + v_qty;
    if v_need > v_prod.stock then
      raise exception 'Stok "%" tidak mencukupi (baki: %). Sila kemaskini troli anda.', v_prod.name, v_prod.stock;
    end if;
    v_need_map := v_need_map || jsonb_build_object(v_prod.id, v_need);

    v_items := v_items || jsonb_build_array(jsonb_build_object(
      'productId', v_prod.id,
      'name', v_prod.name,
      'variantLabel', v_label,
      'qty', v_qty,
      'price', v_prod.price
    ));
    v_subtotal := v_subtotal + v_prod.price * v_qty;
    v_weight := v_weight + v_prod.weight * v_qty;
  end loop;

  -- Pesanan manual: tolak stok terus (atomic — gagal kalau stok tak cukup)
  if p_payment_method = 'manual' then
    for k, v in select key, value from jsonb_each_text(v_need_map)
    loop
      update products set stock = stock - v::int where id = k and stock >= v::int;
      if not found then
        raise exception 'Stok tidak mencukupi — sila kemaskini troli anda';
      end if;
    end loop;
  end if;

  v_ship := calc_shipping(v_zone, v_weight);
  v_id := 'order-' || to_char(clock_timestamp(), 'YYMMDDHH24MISS') || '-' || encode(gen_random_bytes(6), 'hex');

  insert into orders (
    id, created_at, customer, items, weight, subtotal, shipping_cost, total,
    receipt_image, status, tracking_number, payment_method
  ) values (
    v_id, now(),
    jsonb_build_object(
      'name', v_name, 'phone', v_phone, 'phoneDigits', v_phone_digits,
      'address', v_address, 'city', v_city, 'postcode', v_postcode,
      'zone', v_zone, 'email', v_email
    ),
    v_items, v_weight, v_subtotal, v_ship, v_subtotal + v_ship,
    v_receipt,
    case when p_payment_method = 'billplz' then 'awaiting_payment' else 'pending' end,
    '', p_payment_method
  )
  returning * into v_order;

  return public_order_json(v_order);
end;
$$;

create or replace function track_order(p_id text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select public_order_json(o) from orders o where o.id = p_id;
$$;

create or replace function track_orders_by_phone(p_phone text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  digits text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
  result jsonb;
begin
  if length(digits) < 9 then return '[]'::jsonb; end if;
  select coalesce(jsonb_agg(public_order_json(o) order by o.created_at desc), '[]'::jsonb)
    into result
  from orders o
  where o.customer->>'phoneDigits' = digits;
  return result;
end;
$$;

-- ------------------------------------------------------------
-- 6. Fungsi ADMIN — dipanggil oleh Edge Function store-api sahaja
-- ------------------------------------------------------------

-- Login: had 5 cubaan gagal setiap 15 minit untuk satu IP, dan 30
-- cubaan gagal keseluruhan (elak teka PIN secara brute-force).
-- Pulangkan token sesi (sah 12 jam) atau null kalau PIN salah.
create or replace function admin_login(p_pin text, p_ip text)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  ok boolean;
  token text;
begin
  if (select count(*) from admin_login_attempts
      where not success and ip = p_ip and attempted_at > now() - interval '15 minutes') >= 5
     or (select count(*) from admin_login_attempts
      where not success and attempted_at > now() - interval '15 minutes') >= 30 then
    raise exception 'TERLALU_BANYAK_CUBAAN';
  end if;

  select coalesce(s.admin_pin_hash = crypt(coalesce(p_pin, ''), s.admin_pin_hash), false)
    into ok
  from settings s where s.id = 1;
  ok := coalesce(ok, false);

  insert into admin_login_attempts (ip, success) values (p_ip, ok);
  delete from admin_login_attempts where attempted_at < now() - interval '7 days';

  if not ok then return null; end if;

  delete from admin_sessions where expires_at < now();
  token := encode(gen_random_bytes(32), 'hex');
  insert into admin_sessions (token_hash, expires_at)
  values (encode(sha256(convert_to(token, 'UTF8')), 'hex'), now() + interval '12 hours');
  return token;
end;
$$;

create or replace function admin_check_session(p_token text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from admin_sessions
    where token_hash = encode(sha256(convert_to(coalesce(p_token, ''), 'UTF8')), 'hex')
      and expires_at > now()
  );
$$;

create or replace function admin_logout(p_token text)
returns void
language sql
security definer
set search_path = public
as $$
  delete from admin_sessions
  where token_hash = encode(sha256(convert_to(coalesce(p_token, ''), 'UTF8')), 'hex');
$$;

-- Tukar PIN & tamatkan semua sesi lain (kecuali sesi semasa)
create or replace function admin_set_pin(p_token text, p_new_pin text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if p_new_pin is null or length(p_new_pin) < 6 or length(p_new_pin) > 64 then
    raise exception 'PIN mesti sekurang-kurangnya 6 aksara';
  end if;
  update settings set admin_pin_hash = crypt(p_new_pin, gen_salt('bf')) where id = 1;
  delete from admin_sessions
  where token_hash <> encode(sha256(convert_to(coalesce(p_token, ''), 'UTF8')), 'hex');
end;
$$;

-- ------------------------------------------------------------
-- 7. Kebenaran fungsi
-- (Supabase beri EXECUTE kepada anon/authenticated secara lalai untuk
--  fungsi baharu — tarik balik dulu, kemudian beri yang perlu sahaja)
-- ------------------------------------------------------------
revoke execute on function public_order_json(orders) from public, anon, authenticated;
revoke execute on function zone_from_postcode(text) from public, anon, authenticated;
revoke execute on function calc_shipping(text, numeric) from public, anon, authenticated;
revoke execute on function place_order(jsonb, jsonb, text, text) from public, anon, authenticated;
revoke execute on function track_order(text) from public, anon, authenticated;
revoke execute on function track_orders_by_phone(text) from public, anon, authenticated;
revoke execute on function admin_login(text, text) from public, anon, authenticated;
revoke execute on function admin_check_session(text) from public, anon, authenticated;
revoke execute on function admin_logout(text) from public, anon, authenticated;
revoke execute on function admin_set_pin(text, text) from public, anon, authenticated;

grant execute on function place_order(jsonb, jsonb, text, text) to anon, authenticated, service_role;
grant execute on function track_order(text) to anon, authenticated, service_role;
grant execute on function track_orders_by_phone(text) to anon, authenticated, service_role;
grant execute on function public_order_json(orders) to service_role;
grant execute on function zone_from_postcode(text) to service_role;
grant execute on function calc_shipping(text, numeric) to service_role;
grant execute on function admin_login(text, text) to service_role;
grant execute on function admin_check_session(text) to service_role;
grant execute on function admin_logout(text) to service_role;
grant execute on function admin_set_pin(text, text) to service_role;

commit;

-- ============================================================
-- SELEPAS MIGRATION
-- ============================================================
-- PIN lama masih berfungsi untuk login. Tukar PIN baharu (min 6 aksara)
-- di Admin > Tetapan selepas login.
--
-- Terlupa PIN? Tetapkan semula terus di SQL Editor:
--   update settings set admin_pin_hash = extensions.crypt('PIN-BAHARU-ANDA', extensions.gen_salt('bf')) where id = 1;
--   delete from admin_sessions;
--
-- Terkunci sebab terlalu banyak cubaan login salah? Kosongkan rekod:
--   delete from admin_login_attempts where not success;
