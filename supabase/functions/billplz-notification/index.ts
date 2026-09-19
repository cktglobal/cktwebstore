// supabase/functions/billplz-notification/index.ts
//
// Edge Function ini TERIMA notifikasi (webhook) dari Billplz bila status bill
// berubah (bayaran berjaya/gagal). Ia SAHKAN dulu (verify X-Signature) yang
// mesej ni betul-betul dari Billplz (bukan orang jahat cuba tipu sistem kata
// "dah bayar" walhal tidak) — baru kemaskini status pesanan jadi 'paid'.
//
// PENTING — anda kena daftarkan URL fungsi ni sebagai "Callback URL" bill
// (dihantar automatik oleh billplz-create-payment setiap kali cipta bill,
// jadi tak perlu set manual dalam Billplz Dashboard).
//
// Secrets yang perlu di-set (Supabase Dashboard > Edge Functions >
// billplz-notification > Secrets):
//   BILLPLZ_X_SIGNATURE_KEY -> "X Signature Key" dari Billplz Dashboard
//                              (Collection anda > Settings, ATAU
//                              Account Settings jika guna X Signature akaun)
//   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY -> automatik disediakan Supabase
//
// NOTA: Algoritma pengesahan X-Signature di bawah dibina berdasarkan
// dokumentasi rasmi Billplz (susun parameter mengikut nama, gabung
// "namavalue" setiap satu dengan separator "|", HMAC-SHA256 hex guna
// X Signature Key). WAJIB uji end-to-end dengan akaun SANDBOX Billplz dulu
// sebelum live — kalau signature sentiasa "tak sepadan", semak semula
// susunan/format ni terhadap dokumentasi terkini Billplz.

const BILLPLZ_X_SIGNATURE_KEY = Deno.env.get("BILLPLZ_X_SIGNATURE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hmacSha256Hex(text: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sigBuffer = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(text));
  return toHex(new Uint8Array(sigBuffer));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Billplz hantar webhook sebagai application/x-www-form-urlencoded, BUKAN JSON
    const rawBody = await req.text();
    const params = new URLSearchParams(rawBody);

    const receivedSignature = params.get("x_signature") ?? "";

    // 1. Sahkan tandatangan dulu — TOLAK terus kalau tak sepadan, ini pertahanan
    //    utama supaya orang lain tak boleh hantar notifikasi palsu "dah bayar"
    const entries: [string, string][] = [];
    for (const [key, value] of params.entries()) {
      if (key === "x_signature") continue;
      entries.push([key, value]);
    }
    entries.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
    const signatureSource = entries.map(([k, v]) => `${k}${v}`).join("|");
    const expectedSignature = await hmacSha256Hex(signatureSource, BILLPLZ_X_SIGNATURE_KEY);

    if (expectedSignature !== receivedSignature.toLowerCase()) {
      console.error("billplz-notification: signature tak sepadan — mungkin bukan dari Billplz sebenar, atau BILLPLZ_X_SIGNATURE_KEY salah");
      return new Response(JSON.stringify({ ok: false, error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Signature sah — proses notifikasi
    const orderId = params.get("reference_1") ?? "";
    const isPaid = params.get("paid") === "true";
    const billId = params.get("id") ?? null;

    if (!orderId) {
      return new Response(JSON.stringify({ ok: false, error: "reference_1 (orderId) tiada dalam notifikasi" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (isPaid) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

      // Ambil pesanan dulu — perlukan senarai item (untuk tolak stok) dan status
      // semasa (untuk elak tolak stok DUA KALI kalau Billplz hantar notifikasi
      // sama lebih dari sekali, sesuatu yang biasa berlaku pada webhook gateway)
      const getRes = await fetch(
        `${supabaseUrl}/rest/v1/orders?id=eq.${orderId}&select=status,items`,
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

      const updateRes = await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseServiceKey,
          "Authorization": `Bearer ${supabaseServiceKey}`,
          "Prefer": "return=minimal",
        },
        body: JSON.stringify({
          status: "paid",
          billplz_transaction_id: billId,
        }),
      });
      if (!updateRes.ok) {
        console.error("billplz-notification: gagal kemaskini pesanan", await updateRes.text());
      }
    }
    // paid=false (state due/failed) — tak buat apa-apa, biar status pesanan kekal
    // 'awaiting_payment' (pelanggan boleh cuba bayar semula; stok tak tersentuh
    // langsung sebab tak pernah ditolak lagi untuk pesanan yang belum berjaya)

    // Billplz jangkakan respons cepat & 200 OK sebagai tanda notifikasi diterima
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("billplz-notification error:", err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
