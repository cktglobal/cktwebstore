// supabase/functions/store-api/index.ts
//
// Edge Function ini jadi "pintu" SATU-SATUNYA untuk semua operasi admin
// (produk, tetapan, pesanan, waybill, Telegram). Sebelum ni app.js tulis
// terus ke jadual Supabase guna anon key, dan PIN admin cuma disemak dalam
// browser — sesiapa boleh langkau PIN & ubah data. Sekarang:
//   1. Admin login -> PIN disemak di DATABASE (hash bcrypt, had cubaan)
//   2. Server pulangkan token sesi (sah 12 jam) — disimpan dalam
//      sessionStorage browser admin
//   3. Setiap permintaan admin bawa header "x-admin-token" -> disahkan di
//      sini sebelum apa-apa ditulis guna SUPABASE_SERVICE_ROLE_KEY
//
// Satu tindakan AWAM sahaja: "notify_new_order" — hantar notifikasi
// Telegram untuk pesanan manual baharu (token Telegram kekal di server,
// tak lagi didedahkan kepada browser). Setiap pesanan cuma boleh dinotify
// SEKALI (lajur orders.notified_at), jadi tak boleh disalah guna untuk spam.
//
// Secrets (Supabase Dashboard > Edge Functions > Secrets — dikongsi semua
// function dalam projek):
//   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY -> automatik disediakan Supabase
//   POS_CLIENT_ID / POS_CLIENT_SECRET / POS_ACCOUNT_NUMBER / POS_BASE_URL
//     -> sama seperti generate-waybill sebelum ni (untuk jana waybill)

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const POS_BASE_URL = Deno.env.get("POS_BASE_URL") ?? "https://posapi.pos.com.my";
const POS_CLIENT_ID = Deno.env.get("POS_CLIENT_ID") ?? "";
const POS_CLIENT_SECRET = Deno.env.get("POS_CLIENT_SECRET") ?? "";
const POS_ACCOUNT_NUMBER = Deno.env.get("POS_ACCOUNT_NUMBER") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-token",
};

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ---------- Akses database (service role) ----------

async function db(path: string, init: RequestInit = {}): Promise<unknown> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "apikey": SERVICE_KEY,
      "Authorization": `Bearer ${SERVICE_KEY}`,
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    console.error("store-api db error:", path, text);
    const msg = (data && (data as { message?: string }).message) || `Ralat database (${res.status})`;
    throw new HttpError(400, msg);
  }
  return data;
}

function rpc(name: string, args: Record<string, unknown>): Promise<unknown> {
  return db(`rpc/${name}`, { method: "POST", body: JSON.stringify(args) });
}

const enc = encodeURIComponent;

// ---------- Telegram ----------

function escapeHtml(text: unknown): string {
  return String(text ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function money(amount: unknown): string {
  return `RM${Number(amount || 0).toFixed(2)}`;
}

const ZONE_LABELS: Record<string, string> = {
  semenanjung: "Semenanjung Malaysia",
  sarawak: "Sarawak",
  sabah: "Sabah",
};

async function sendTelegram(token: string, chatId: string, message: string) {
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "HTML" }),
  });
  const data = await res.json();
  if (!data.ok) console.error("store-api: Telegram send error:", data.description);
  return { ok: !!data.ok, error: data.description as string | undefined };
}

async function sendTelegramFromSettings(message: string) {
  const rows = await db("settings?id=eq.1&select=telegram_bot_token,telegram_chat_id") as Array<Record<string, string>>;
  const token = rows?.[0]?.telegram_bot_token;
  const chatId = rows?.[0]?.telegram_chat_id;
  if (!token || !chatId) return { ok: false, error: "Telegram belum ditetapkan" };
  try {
    return await sendTelegram(token, chatId, message);
  } catch (err) {
    console.error("store-api: Telegram fetch error:", err);
    return { ok: false, error: String(err) };
  }
}

// deno-lint-ignore no-explicit-any
function newOrderMessage(o: any): string {
  const c = o.customer || {};
  const lines = (o.items || [])
    // deno-lint-ignore no-explicit-any
    .map((it: any) => `• ${it.qty}x ${escapeHtml(it.name)}${it.variantLabel && it.variantLabel !== "none" ? " (" + escapeHtml(it.variantLabel) + ")" : ""} — ${money(Number(it.price) * Number(it.qty))}`)
    .join("\n");
  return [
    `🛒 <b>Pesanan Baru Diterima</b>`,
    ``,
    `No. Pesanan: ${escapeHtml(o.id)}`,
    `Nama: ${escapeHtml(c.name)}`,
    `Telefon: ${escapeHtml(c.phone)}`,
    `Alamat: ${escapeHtml(c.address)}, ${escapeHtml(c.postcode)} (${ZONE_LABELS[c.zone] || escapeHtml(c.zone)})`,
    ``,
    `<b>Item:</b>`,
    lines,
    ``,
    `Penghantaran: ${money(o.shipping_cost)}`,
    `<b>Jumlah: ${money(o.total)}</b>`,
  ].join("\n");
}

// ---------- Sesi admin ----------

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip") || "unknown";
}

async function requireAdmin(req: Request): Promise<string> {
  const token = req.headers.get("x-admin-token") || "";
  if (!token) throw new HttpError(401, "Sesi admin tamat — sila login semula");
  const ok = await rpc("admin_check_session", { p_token: token });
  if (ok !== true) throw new HttpError(401, "Sesi admin tamat — sila login semula");
  return token;
}

// ---------- Validasi ----------

function str(v: unknown, max: number, field: string): string {
  if (v === null || v === undefined) return "";
  if (typeof v !== "string") throw new HttpError(400, `Medan ${field} tidak sah`);
  if (v.length > max) throw new HttpError(400, `Medan ${field} terlalu panjang`);
  return v;
}

function optStr(v: unknown, max: number, field: string): string | null {
  const s = str(v, max, field);
  return s === "" ? null : s;
}

function num(v: unknown, field: string, min = 0): number {
  const n = Number(v);
  if (!Number.isFinite(n) || n < min) throw new HttpError(400, `Medan ${field} tidak sah`);
  return n;
}

// Imej/video disimpan sebagai data URL (base64) — pastikan memang data URL
// jenis yang betul, bukan "javascript:" atau HTML.
function dataUrl(v: unknown, field: string, kinds: string[], max = 20_000_000): string | null {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v !== "string" || !kinds.some((k) => v.startsWith(`data:${k}`))) {
    throw new HttpError(400, `Fail ${field} tidak sah`);
  }
  if (v.length > max) throw new HttpError(400, `Fail ${field} terlalu besar`);
  return v;
}

function httpUrl(v: unknown, field: string): string {
  const s = str(v, 2000, field).trim();
  if (s && !/^https?:\/\//i.test(s)) throw new HttpError(400, `URL ${field} mesti bermula dengan https://`);
  return s;
}

const ORDER_STATUSES = ["awaiting_payment", "pending", "paid", "shipped", "completed"];
const ZONES = ["semenanjung", "sarawak", "sabah"];

// deno-lint-ignore no-explicit-any
function cleanShippingRates(rates: any) {
  if (!rates || typeof rates !== "object") throw new HttpError(400, "Kadar penghantaran tidak sah");
  const out: Record<string, Array<{ minKg: number; maxKg: number | null; rate: number }>> = {};
  for (const z of ZONES) {
    const rows = Array.isArray(rates[z]) ? rates[z] : [];
    if (rows.length > 50) throw new HttpError(400, "Terlalu banyak julat kadar penghantaran");
    // deno-lint-ignore no-explicit-any
    out[z] = rows.map((r: any) => ({
      minKg: num(r.minKg, "minKg"),
      maxKg: r.maxKg === null || r.maxKg === undefined || r.maxKg === "" ? null : num(r.maxKg, "maxKg"),
      rate: num(r.rate, "rate"),
    }));
  }
  return out;
}

// ---------- Tindakan ----------

// deno-lint-ignore no-explicit-any
type Body = Record<string, any>;

async function notifyNewOrder(body: Body) {
  const orderId = str(body.orderId, 100, "orderId");
  if (!orderId) throw new HttpError(400, "orderId tiada");
  // Tanda notified_at secara atomic — cuma pesanan manual, belum pernah
  // dinotify, dan dicipta dalam 30 minit lepas sahaja.
  const since = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  const rows = await db(
    `orders?id=eq.${enc(orderId)}&payment_method=eq.manual&notified_at=is.null&created_at=gte.${enc(since)}` +
      `&select=id,customer,items,total,shipping_cost`,
    {
      method: "PATCH",
      headers: { "Prefer": "return=representation" },
      body: JSON.stringify({ notified_at: new Date().toISOString() }),
    },
  ) as Array<unknown>;
  if (!rows?.length) return { ok: true, sent: false };
  const result = await sendTelegramFromSettings(newOrderMessage(rows[0]));
  return { ok: true, sent: result.ok };
}

async function login(req: Request, body: Body) {
  const pin = str(body.pin, 64, "PIN");
  let token: unknown;
  try {
    token = await rpc("admin_login", { p_pin: pin, p_ip: clientIp(req) });
  } catch (err) {
    if (String((err as Error).message).includes("TERLALU_BANYAK_CUBAAN")) {
      throw new HttpError(429, "Terlalu banyak cubaan PIN salah — cuba lagi selepas 15 minit");
    }
    throw err;
  }
  if (typeof token !== "string" || !token) throw new HttpError(401, "PIN salah");
  return { ok: true, token };
}

async function getSettings() {
  const rows = await db("settings?id=eq.1&select=*") as Array<Record<string, unknown>>;
  const row = { ...(rows?.[0] || {}) };
  delete row.admin_pin;
  delete row.admin_pin_hash;
  return { ok: true, settings: row };
}

async function saveSettings(token: string, body: Body) {
  const s = body.settings || {};
  const patch: Record<string, unknown> = {
    store_name: str(s.storeName, 120, "Nama Kedai").trim() || "Kedai Saya",
    store_logo: dataUrl(s.storeLogo, "logo", ["image/"], 3_000_000),
    qr_image: dataUrl(s.qrImage, "QR", ["image/"], 3_000_000),
    shipping_rates: cleanShippingRates(s.shippingRates),
    promo_video_type: ["none", "upload", "url", "image"].includes(s.promoVideoType) ? s.promoVideoType : "none",
    promo_video: dataUrl(s.promoVideo, "video", ["video/"], 25_000_000),
    promo_video_url: httpUrl(s.promoVideoUrl, "video"),
    telegram_bot_token: str(s.telegramBotToken, 200, "Bot Token").trim(),
    telegram_chat_id: str(s.telegramChatId, 100, "Chat ID").trim(),
    sender_name: str(s.senderName, 120, "Nama Sender").trim(),
    sender_phone: str(s.senderPhone, 30, "Telefon Sender").trim(),
    sender_email: str(s.senderEmail, 200, "Email Sender").trim(),
    sender_address1: str(s.senderAddress1, 300, "Alamat Sender").trim(),
    sender_city: str(s.senderCity, 100, "Bandar Sender").trim(),
    sender_state: str(s.senderState, 100, "Negeri Sender").trim(),
    sender_postcode: str(s.senderPostcode, 10, "Poskod Sender").trim(),
    updated_at: new Date().toISOString(),
  };
  const promoImages = Array.isArray(s.promoImages) ? s.promoImages : [];
  if (promoImages.length > 8) throw new HttpError(400, "Maksimum 8 imej banner");
  patch.promo_images = promoImages.map((im: unknown) => dataUrl(im, "banner", ["image/"], 3_000_000));
  patch.promo_image = (patch.promo_images as string[])[0] || null;

  await db("settings?id=eq.1", {
    method: "PATCH",
    headers: { "Prefer": "return=minimal" },
    body: JSON.stringify(patch),
  });

  const newPin = str(body.newPin, 64, "PIN").trim();
  if (newPin) await rpc("admin_set_pin", { p_token: token, p_new_pin: newPin });
  return { ok: true, pinChanged: !!newPin };
}

async function saveProduct(body: Body) {
  const p = body.product || {};
  const name = str(p.name, 200, "Nama Produk").trim();
  if (!name) throw new HttpError(400, "Nama produk diperlukan");
  const images = Array.isArray(p.images) ? p.images : [];
  if (images.length > 20) throw new HttpError(400, "Terlalu banyak gambar (maksimum 20)");
  const variants = (Array.isArray(p.variants) ? p.variants : []).slice(0, 10)
    // deno-lint-ignore no-explicit-any
    .map((v: any) => ({
      name: str(v?.name, 60, "nama variasi").trim(),
      options: (Array.isArray(v?.options) ? v.options : []).slice(0, 50)
        .map((o: unknown) => str(o, 60, "pilihan variasi").trim()).filter(Boolean),
    }))
    .filter((v: { name: string; options: string[] }) => v.name && v.options.length);
  const testimonials = (Array.isArray(p.testimonials) ? p.testimonials : []).slice(0, 30)
    // deno-lint-ignore no-explicit-any
    .map((t: any) => ({
      name: str(t?.name, 80, "nama testimoni").trim(),
      comment: str(t?.comment, 1000, "komen testimoni").trim(),
      rating: Math.min(5, Math.max(1, Math.round(Number(t?.rating) || 5))),
    }))
    .filter((t: { name: string; comment: string }) => t.name && t.comment);
  const stock = num(p.stock, "Stok");
  if (!Number.isInteger(stock)) throw new HttpError(400, "Stok mesti nombor bulat");

  const row = {
    name,
    description: str(p.description, 100_000, "Keterangan"),
    price: num(p.price, "Harga"),
    weight: num(p.weight, "Berat"),
    images: images.map((im: unknown) => dataUrl(im, "gambar produk", ["image/"], 3_000_000)),
    variants,
    category: str(p.category, 60, "Kategori").trim() || "Lain-Lain",
    stock,
    testimonials,
  };

  if (body.isNew) {
    const id = "prod-" + crypto.randomUUID().replace(/-/g, "").slice(0, 16);
    const rows = await db("products", {
      method: "POST",
      headers: { "Prefer": "return=representation" },
      body: JSON.stringify({ id, ...row }),
    }) as Array<unknown>;
    return { ok: true, product: rows[0] };
  }
  const id = str(p.id, 100, "id");
  if (!id) throw new HttpError(400, "id produk tiada");
  const rows = await db(`products?id=eq.${enc(id)}`, {
    method: "PATCH",
    headers: { "Prefer": "return=representation" },
    body: JSON.stringify(row),
  }) as Array<unknown>;
  if (!rows?.length) throw new HttpError(404, "Produk tidak dijumpai");
  return { ok: true, product: rows[0] };
}

async function deleteProduct(body: Body) {
  const id = str(body.id, 100, "id");
  const rows = await db(`products?id=eq.${enc(id)}`, {
    method: "DELETE",
    headers: { "Prefer": "return=representation" },
  }) as Array<unknown>;
  if (!rows?.length) throw new HttpError(404, "Produk tidak dijumpai");
  return { ok: true };
}

async function listOrders() {
  const rows = await db("orders?select=*&order=created_at.desc");
  return { ok: true, orders: rows };
}

async function getOrder(id: string) {
  const rows = await db(`orders?id=eq.${enc(id)}&select=*`) as Array<Record<string, unknown>>;
  if (!rows?.length) throw new HttpError(404, "Pesanan tidak dijumpai");
  return rows[0];
}

async function updateOrder(body: Body) {
  const id = str(body.id, 100, "id");
  const order = await getOrder(id);
  const patch: Record<string, unknown> = {};

  if (body.trackingNumber !== undefined) {
    patch.tracking_number = str(body.trackingNumber, 100, "No. Tracking").trim();
  }
  let justPaid = false;
  if (body.status !== undefined) {
    const status = String(body.status);
    if (!ORDER_STATUSES.includes(status)) throw new HttpError(400, "Status tidak sah");
    const tracking = (patch.tracking_number ?? order.tracking_number ?? "") as string;
    if (status === "shipped" && !tracking) {
      throw new HttpError(400, 'Sila isi & simpan No. Tracking dahulu sebelum tukar status ke "Shipped"');
    }
    if (status === "completed" && order.status !== "completed") patch.completed_at = new Date().toISOString();
    justPaid = status === "paid" && order.status !== "paid";
    patch.status = status;
  }
  if (!Object.keys(patch).length) return { ok: true, order };

  const rows = await db(`orders?id=eq.${enc(id)}`, {
    method: "PATCH",
    headers: { "Prefer": "return=representation" },
    body: JSON.stringify(patch),
  }) as Array<Record<string, unknown>>;

  if (justPaid) {
    const c = (order.customer || {}) as Record<string, unknown>;
    await sendTelegramFromSettings(
      `✅ <b>Bayaran Disahkan</b>\n\nNo. Pesanan: ${escapeHtml(id)}\nNama: ${escapeHtml(c.name)}\nJumlah: ${money(order.total)}`,
    );
  }
  return { ok: true, order: rows[0] };
}

async function deleteOrder(body: Body) {
  const id = str(body.id, 100, "id");
  const rows = await db(`orders?id=eq.${enc(id)}`, {
    method: "DELETE",
    headers: { "Prefer": "return=representation" },
  }) as Array<unknown>;
  if (!rows?.length) throw new HttpError(404, "Pesanan tidak dijumpai");
  return { ok: true };
}

async function telegramTest(body: Body) {
  const token = str(body.token, 200, "Bot Token").trim();
  const chatId = str(body.chatId, 100, "Chat ID").trim();
  if (!token || !chatId) throw new HttpError(400, "Sila isi Bot Token & Chat ID dahulu");
  if (!/^[0-9]+:[A-Za-z0-9_-]+$/.test(token)) throw new HttpError(400, "Format Bot Token tidak sah");
  return await sendTelegram(token, chatId, "🔔 Ini mesej test dari CKT Global Webstore. Jika anda terima ini, sambungan Telegram berfungsi!");
}

async function posAccessToken(): Promise<string> {
  const res = await fetch(`${POS_BASE_URL}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json" },
    body: new URLSearchParams({
      client_id: POS_CLIENT_ID,
      client_secret: POS_CLIENT_SECRET,
      grant_type: "client_credentials",
    }),
  });
  if (!res.ok) throw new HttpError(502, `Pos Laju Get Token gagal: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.access_token;
}

// Jana waybill Pos Laju — maklumat sender & penerima diambil dari DATABASE
// (bukan dari browser), browser cuma hantar bandar/negeri/berat yang admin
// sahkan.
async function generateWaybill(body: Body) {
  const id = str(body.orderId, 100, "orderId");
  const city = str(body.city, 100, "Bandar").trim();
  const stateVal = str(body.state, 100, "Negeri").trim();
  const weight = num(body.weight, "Berat");
  if (!city || !stateVal || !weight) throw new HttpError(400, "Sila lengkapkan Bandar, Negeri & Berat");

  const order = await getOrder(id);
  // deno-lint-ignore no-explicit-any
  const c = (order.customer || {}) as any;
  const sRows = await db("settings?id=eq.1&select=sender_name,sender_phone,sender_email,sender_address1,sender_city,sender_state,sender_postcode") as Array<Record<string, string>>;
  const s = sRows?.[0] || {};
  if (!s.sender_name || !s.sender_address1 || !s.sender_postcode) {
    throw new HttpError(400, "Sila lengkapkan Maklumat Kedai (Sender) dulu di Tetapan");
  }
  const phone = String(c.phone || "");
  const receiverPhone = phone.startsWith("+") ? phone : "+6" + phone.replace(/^0/, "");
  // deno-lint-ignore no-explicit-any
  const items = ((order.items || []) as any[]).map((it) => ({
    item_description: it.name,
    quantity: it.qty,
    hscode: "",
    notes: "",
    value: it.price,
  }));

  const token = await posAccessToken();
  const orderBody = {
    account_number: POS_ACCOUNT_NUMBER,
    product_code: "80000000",
    return_type: "01",
    item_type: "1",
    parcel: "domestic",
    webhook: true,
    service_level: "Standard",
    subscription_code: "CKTGLOBAL.WEBSTORE.1.0",
    platform: "API",
    mps: false,
    reference: { merchant_order_number: id, merchant_reference_number: id },
    pickup: { required: true, timeslot: { start_time: "09:00", end_time: "12:00" } },
    sender: {
      display_address: "",
      hide_sender_address: false,
      name: s.sender_name,
      phone_number: s.sender_phone,
      email: s.sender_email ?? "",
      address: {
        address1: s.sender_address1,
        address2: "",
        area: "",
        city: s.sender_city,
        state: s.sender_state,
        address_type: "Others",
        country: "MY",
        postcode: s.sender_postcode,
      },
    },
    receiver: {
      name: c.name,
      phone_number: receiverPhone,
      email: c.email ?? "",
      address: {
        address1: c.address,
        address2: "",
        area: "",
        city,
        state: stateVal,
        address_type: "Home",
        country: "MY",
        postcode: c.postcode,
      },
    },
    parcel_details: [
      {
        weight,
        length: 20,
        width: 15,
        height: 10,
        item_count: items.length,
        parcel_notes: "",
        item_category_details: "02",
        details: items,
      },
    ],
  };

  const res = await fetch(`${POS_BASE_URL}/api/order/v2.1/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify(orderBody),
  });
  const data = await res.json();
  if (!res.ok || data.message !== "success") {
    return { ok: false, error: data };
  }

  const trackingNo = data.data.tracking_no;
  const pdfUrl = data.data.consignment?.pdf ?? null;
  await db(`orders?id=eq.${enc(id)}`, {
    method: "PATCH",
    headers: { "Prefer": "return=minimal" },
    body: JSON.stringify({ tracking_number: trackingNo, waybill_pdf_url: pdfUrl }),
  });
  return { ok: true, tracking_no: trackingNo, label_pdf_url: pdfUrl };
}

// ---------- Router ----------

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);

  try {
    const body = (await req.json()) as Body;
    const action = String(body?.action || "");

    // Tindakan awam
    if (action === "notify_new_order") return json(await notifyNewOrder(body));
    if (action === "login") return json(await login(req, body));

    // Tindakan admin — sahkan sesi dulu
    const token = await requireAdmin(req);
    switch (action) {
      case "session":
        return json({ ok: true });
      case "logout":
        await rpc("admin_logout", { p_token: token });
        return json({ ok: true });
      case "get_settings":
        return json(await getSettings());
      case "save_settings":
        return json(await saveSettings(token, body));
      case "product_save":
        return json(await saveProduct(body));
      case "product_delete":
        return json(await deleteProduct(body));
      case "orders_list":
        return json(await listOrders());
      case "order_update":
        return json(await updateOrder(body));
      case "order_delete":
        return json(await deleteOrder(body));
      case "telegram_test":
        return json(await telegramTest(body));
      case "generate_waybill":
        return json(await generateWaybill(body));
      default:
        return json({ ok: false, error: "Tindakan tidak dikenali" }, 400);
    }
  } catch (err) {
    if (err instanceof HttpError) return json({ ok: false, error: err.message }, err.status);
    console.error("store-api error:", err);
    return json({ ok: false, error: "Ralat server" }, 500);
  }
});
