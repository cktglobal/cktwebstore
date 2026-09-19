// supabase/functions/doku-notification/index.ts
//
// Edge Function ini TERIMA notifikasi (webhook) dari DOKU bila pelanggan
// selesai bayar. Ia SAHKAN dulu (verify signature) yang mesej ni betul-betul
// dari DOKU (bukan orang jahat cuba tipu sistem kata "dah bayar" walhal tidak)
// — baru kemaskini status pesanan jadi 'paid'.
//
// PENTING — anda kena daftarkan URL fungsi ni sebagai "Notification URL" di
// DOKU Dashboard (Settings > Notification URL), contoh:
//   https://xxxxx.supabase.co/functions/v1/doku-notification
//
// Secrets yang perlu di-set (sama seperti doku-create-payment):
//   DOKU_CLIENT_ID, DOKU_SECRET_KEY
//   DOKU_NOTIFICATION_PATH -> path SAHAJA (bukan URL penuh) yang anda daftar
//                             kat DOKU, cth: /functions/v1/doku-notification
//                             (ni WAJIB sepadan tepat dengan tetapan DOKU,
//                             sebab ia jadi sebahagian pengiraan tandatangan)
//   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY -> automatik disediakan Supabase

const DOKU_SECRET_KEY = Deno.env.get("DOKU_SECRET_KEY")!;
const NOTIFICATION_PATH = Deno.env.get("DOKU_NOTIFICATION_PATH") ?? "/functions/v1/doku-notification";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, client-id, request-id, request-timestamp, signature",
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
    const rawBody = await req.text();
    const clientId = req.headers.get("Client-Id") ?? "";
    const requestId = req.headers.get("Request-Id") ?? "";
    const requestTimestamp = req.headers.get("Request-Timestamp") ?? "";
    const receivedSignature = req.headers.get("Signature") ?? "";

    // 1. Sahkan tandatangan dulu — TOLAK terus kalau tak sepadan, ini pertahanan
    //    utama supaya orang lain tak boleh hantar notifikasi palsu "dah bayar"
    const digest = await sha256Base64(rawBody);
    const componentSignature =
      `Client-Id:${clientId}\n` +
      `Request-Id:${requestId}\n` +
      `Request-Timestamp:${requestTimestamp}\n` +
      `Request-Target:${NOTIFICATION_PATH}\n` +
      `Digest:${digest}`;
    const expectedSignature = "HMACSHA256=" + await hmacSha256Base64(componentSignature, DOKU_SECRET_KEY);

    if (expectedSignature !== receivedSignature) {
      console.error("doku-notification: signature tak sepadan — mungkin bukan dari DOKU sebenar, atau DOKU_NOTIFICATION_PATH tak sepadan tetapan dashboard");
      return new Response(JSON.stringify({ ok: false, error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Signature sah — proses notifikasi
    const body = JSON.parse(rawBody);
    const invoiceNumber = body?.order?.invoice_number;
    const txnStatus = body?.transaction?.status; // "SUCCESS" | "FAILED" | "PENDING"

    if (!invoiceNumber) {
      return new Response(JSON.stringify({ ok: false, error: "invoice_number tiada dalam notifikasi" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (txnStatus === "SUCCESS") {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

      // Ambil pesanan dulu — perlukan senarai item (untuk tolak stok) dan status
      // semasa (untuk elak tolak stok DUA KALI kalau DOKU hantar notifikasi
      // sama lebih dari sekali, sesuatu yang biasa berlaku pada webhook gateway)
      const getRes = await fetch(
        `${supabaseUrl}/rest/v1/orders?id=eq.${invoiceNumber}&select=status,items`,
        {
          headers: {
            "apikey": supabaseServiceKey,
            "Authorization": `Bearer ${supabaseServiceKey}`,
          },
        },
      );
      const rows = await getRes.json();
      const existingOrder = rows?.[0];

      if (existingOrder && existingOrder.status !== "paid") {
        // Tolak stok untuk setiap item — cuma sekarang (bayaran online DAH
        // disahkan berjaya), bukan semasa checkout tadi seperti pesanan manual
        const items = existingOrder.items || [];
        for (const line of items) {
          if (!line?.productId || !line?.qty) continue;
          await fetch(`${supabaseUrl}/rest/v1/rpc/decrement_stock`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "apikey": supabaseServiceKey,
              "Authorization": `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({ p_id: line.productId, qty: line.qty }),
          }).catch((e) => console.error("decrement_stock gagal untuk", line.productId, e));
        }
      }

      const updateRes = await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${invoiceNumber}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseServiceKey,
          "Authorization": `Bearer ${supabaseServiceKey}`,
          "Prefer": "return=minimal",
        },
        body: JSON.stringify({
          status: "paid",
          doku_transaction_id: body?.transaction?.original_request_id ?? null,
        }),
      });
      if (!updateRes.ok) {
        console.error("doku-notification: gagal kemaskini pesanan", await updateRes.text());
      }
    }
    // txnStatus FAILED/PENDING — tak buat apa-apa, biar status pesanan kekal
    // 'awaiting_payment' (pelanggan boleh cuba bayar semula; stok tak tersentuh
    // langsung sebab tak pernah ditolak lagi untuk pesanan yang belum berjaya)

    // DOKU jangkakan respons cepat & 200 OK sebagai tanda notifikasi diterima
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("doku-notification error:", err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
