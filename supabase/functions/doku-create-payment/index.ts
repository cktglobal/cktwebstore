// supabase/functions/doku-create-payment/index.ts
//
// Edge Function ini simpan kredential DOKU SECARA SELAMAT (server-side) dan
// buat 1 panggilan API bagi pihak app CKT Global: "Backend Integration" DOKU
// Checkout — hantar butiran pesanan, terima balik payment.url untuk pelanggan
// bayar (FPX/kad/e-wallet dll — ikut apa yang diaktifkan pada akaun DOKU anda).
//
// Kredential (DOKU_CLIENT_ID, DOKU_SECRET_KEY) TIDAK ditulis dalam fail ni —
// dibaca dari "Secrets" Supabase supaya selamat (secret key TAK BOLEH ada
// dalam kod browser — sesiapa boleh curi & buat transaksi palsu).
//
// Cara set secrets (Supabase Dashboard > Edge Functions > doku-create-payment
// > Secrets, ATAU guna Supabase CLI):
//   DOKU_CLIENT_ID       -> Client ID dari DOKU Dashboard (Settings > API)
//   DOKU_SECRET_KEY      -> Secret Key dari DOKU Dashboard (Settings > API)
//   DOKU_BASE_URL        -> https://api-sandbox.doku.com  (waktu testing)
//                           https://api.doku.com          (bila dah live/production)
//   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY -> automatik disediakan Supabase

const DOKU_CLIENT_ID = Deno.env.get("DOKU_CLIENT_ID")!;
const DOKU_SECRET_KEY = Deno.env.get("DOKU_SECRET_KEY")!;
const DOKU_BASE_URL = Deno.env.get("DOKU_BASE_URL") ?? "https://api-sandbox.doku.com";
const PAYMENT_PATH = "/checkout/v1/payment";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

async function sha256Base64(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return toBase64(new Uint8Array(hashBuffer));
}

async function hmacSha256Base64(text: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sigBuffer = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(text));
  return toBase64(new Uint8Array(sigBuffer));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const { orderId, amount, customerName, customerEmail, customerPhone } = payload;

    if (!orderId || !amount) {
      return new Response(
        JSON.stringify({ ok: false, error: "Medan orderId atau amount tiada" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // DOKU Support disahkan (23 Jul 2026, WhatsApp): nilai desimal (RM0.00)
    // MEMANG disokong untuk akaun ni — walaupun dokumentasi awam DOKU sebut
    // "tanpa desimal" (nampaknya rujukan IDR yang tiada sen). Jadi hantar
    // nilai TEPAT (dengan sen), bukan dibundarkan ke ringgit penuh lagi.
    // (Sebelum ni kita bundarkan RM5.90 jadi RM6.00 sebab ambil berat-hati
    // — sekarang dah disahkan tak perlu, boleh hantar RM5.90 terus.)
    const dokuAmount = Math.round(Number(amount) * 100) / 100;

    const requestBody = {
      order: {
        amount: dokuAmount,
        invoice_number: orderId,
        currency: "MYR",
        // Bawa pelanggan balik ke kedai automatik lepas bayaran selesai
        // (berjaya ATAU gagal) — tanpa ni, DOKU tunjuk page result DOKU
        // sendiri dan pelanggan "terperangkap" di situ, perlu navigasi manual.
        callback_url: "https://cktwebstore.com/",
        auto_redirect: true,
      },
      payment: {
        payment_due_date: 60, // minit
      },
      customer: {
        name: customerName || undefined,
        email: customerEmail || undefined,
        phone: customerPhone || undefined,
      },
      // PENTING: paksa DOKU hantar notifikasi ke URL ni terus dalam SETIAP
      // request — jangan bergantung pada tetapan "Notification URL" di
      // dashboard, sebab kami dapati ia berselerak (setiap kaedah bayaran
      // macam Cards/FPX/e-Wallet ada tetapan berasingan sendiri, mudah
      // tertinggal salah satu). Ini jamin notifikasi SENTIASA sampai ke
      // fungsi doku-notification kami, tak kira kaedah bayaran mana dipilih.
      additional_info: {
        override_notification_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/doku-notification`,
      },
    };

    const bodyString = JSON.stringify(requestBody);
    const requestId = crypto.randomUUID();
    const requestTimestamp = new Date().toISOString().replace(/\.\d+Z$/, "Z"); // ISO8601 UTC

    const digest = await sha256Base64(bodyString);
    const componentSignature =
      `Client-Id:${DOKU_CLIENT_ID}\n` +
      `Request-Id:${requestId}\n` +
      `Request-Timestamp:${requestTimestamp}\n` +
      `Request-Target:${PAYMENT_PATH}\n` +
      `Digest:${digest}`;
    const signature = "HMACSHA256=" + await hmacSha256Base64(componentSignature, DOKU_SECRET_KEY);

    const dokuRes = await fetch(`${DOKU_BASE_URL}${PAYMENT_PATH}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Client-Id": DOKU_CLIENT_ID,
        "Request-Id": requestId,
        "Request-Timestamp": requestTimestamp,
        "Signature": signature,
      },
      body: bodyString,
    });

    const dokuData = await dokuRes.json();

    if (!dokuRes.ok || !dokuData?.response?.payment?.url) {
      console.error("DOKU create payment gagal:", JSON.stringify(dokuData));
      return new Response(
        JSON.stringify({ ok: false, error: dokuData?.error_messages?.join(", ") || "DOKU menolak permintaan" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Simpan payment.url ke rekod pesanan supaya boleh rujuk balik kalau perlu
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseServiceKey,
        "Authorization": `Bearer ${supabaseServiceKey}`,
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({
        payment_method: "doku",
        doku_payment_url: dokuData.response.payment.url,
      }),
    });

    return new Response(
      JSON.stringify({ ok: true, paymentUrl: dokuData.response.payment.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("doku-create-payment error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
