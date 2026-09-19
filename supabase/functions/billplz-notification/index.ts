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
// Selepas bayaran disahkan, function ni JUGA terus hantar notifikasi Telegram
// (guna Bot Token/Chat ID yang admin dah set di panel Tetapan kedai, jadual
// "settings") — ini SATU-SATUNYA notifikasi admin terima untuk pesanan Billplz
// (app.js sengaja tak notify semasa customer tekan "Teruskan ke Pembayaran",
// sebab belum tentu jadi bayar).
//
// Secrets yang perlu di-set (Supabase Dashboard > Edge Functions >
// billplz-notification > Secrets):
//   BILLPLZ_X_SIGNATURE_KEY -> "X Signature Key" dari Billplz Dashboard
//                              (Collection anda > Settings, ATAU
//                              Account Settings jika guna X Signature akaun)
//   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY -> automatik disediakan Supabase
//
// NOTA pasal X-Signature: dokumentasi/implementasi Billplz yang tersedia
// tidak seragam pasal susunan parameter (ikut urutan asal dihantar, ATAU
// disusun mengikut nama) dan cara gabung (terus "namavalue" TANPA separator,
// ATAU dengan separator "|"). Sebab tu verifySignature() di bawah cuba
// BEBERAPA kombinasi popular sekaligus dan terima mana-mana yang padan —
// ini tak kurangkan keselamatan (orang jahat tetap perlu tahu
// BILLPLZ_X_SIGNATURE_KEY sebenar untuk hasilkan mana-mana signature yang
// sah), cuma lebih toleran kepada variasi format. verifySignature() log
// kombinasi mana yang padan (console.log, bukan console.error) — boleh
// rujuk log tu untuk kemas kini code ni guna SATU format yang disahkan sahaja.

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

// Cuba beberapa kombinasi susunan/separator yang biasa digunakan implementasi
// Billplz (lihat NOTA di atas fail ni), pulangkan label kombinasi pertama
// yang padan dengan signature diterima, atau null kalau tiada satu pun padan.
async function verifySignature(
  originalOrderEntries: [string, string][],
  receivedSignature: string,
  secret: string,
): Promise<string | null> {
  const sortedEntries = [...originalOrderEntries].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  const candidates: Record<string, string> = {
    "urutan-asal|tiada-separator": originalOrderEntries.map(([k, v]) => `${k}${v}`).join(""),
    "urutan-asal|pipe-separator": originalOrderEntries.map(([k, v]) => `${k}${v}`).join("|"),
    "susun-nama|tiada-separator": sortedEntries.map(([k, v]) => `${k}${v}`).join(""),
    "susun-nama|pipe-separator": sortedEntries.map(([k, v]) => `${k}${v}`).join("|"),
    "urutan-asal|query-string": originalOrderEntries.map(([k, v]) => `${k}=${v}`).join("&"),
    "susun-nama|query-string": sortedEntries.map(([k, v]) => `${k}=${v}`).join("&"),
  };
  const receivedLower = receivedSignature.toLowerCase();
  for (const [label, source] of Object.entries(candidates)) {
    const computed = await hmacSha256Hex(source, secret);
    if (computed === receivedLower) return label;
  }
  return null;
}

function escapeHtml(text: string): string {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function money(amount: number): string {
  return `RM${Number(amount || 0).toFixed(2)}`;
}

async function notifyTelegramPaid(
  supabaseUrl: string,
  supabaseServiceKey: string,
  order: { id: string; customer?: Record<string, unknown>; items?: Array<Record<string, unknown>>; total?: number; shipping_cost?: number },
) {
  try {
    const settingsRes = await fetch(
      `${supabaseUrl}/rest/v1/settings?id=eq.1&select=telegram_bot_token,telegram_chat_id`,
      {
        headers: {
          "apikey": supabaseServiceKey,
          "Authorization": `Bearer ${supabaseServiceKey}`,
        },
      },
    );
    const settingsRows = await settingsRes.json();
    const token = settingsRows?.[0]?.telegram_bot_token;
    const chatId = settingsRows?.[0]?.telegram_chat_id;
    if (!token || !chatId) return; // Telegram belum ditetapkan oleh admin — senyap sahaja

    const customer = order.customer || {};
    const items = order.items || [];
    const itemLines = items
      .map((it) => `• ${it.qty}x ${escapeHtml(String(it.name))}${it.variantLabel && it.variantLabel !== "none" ? ` (${escapeHtml(String(it.variantLabel))})` : ""} — ${money(Number(it.price || 0) * Number(it.qty || 0))}`)
      .join("\n");
    const message = [
      `💳 <b>Bayaran Online Berjaya (Billplz)</b>`,
      ``,
      `No. Pesanan: ${order.id}`,
      `Nama: ${escapeHtml(String(customer.name || ""))}`,
      `Telefon: ${escapeHtml(String(customer.phone || ""))}`,
      `Alamat: ${escapeHtml(String(customer.address || ""))}, ${escapeHtml(String(customer.postcode || ""))}`,
      ``,
      `<b>Item:</b>`,
      itemLines,
      ``,
      `Penghantaran: ${money(Number(order.shipping_cost || 0))}`,
      `<b>Jumlah: ${money(Number(order.total || 0))}</b>`,
    ].join("\n");

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "HTML" }),
    });
    const data = await res.json();
    if (!data.ok) console.error("billplz-notification: Telegram send error:", data.description);
  } catch (err) {
    console.error("billplz-notification: Telegram fetch error:", err);
  }
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

    // DEBUG SEMENTARA — log raw body & panjang secret supaya boleh kesan sama
    // ada nama field tak macam dijangka, atau BILLPLZ_X_SIGNATURE_KEY tersilap
    // (extra space/newline dsb). BUANG log ni lepas isu signature selesai.
    console.log("billplz-notification DEBUG rawBody:", rawBody);
    console.log("billplz-notification DEBUG receivedSignature:", JSON.stringify(receivedSignature), "length:", receivedSignature.length);
    console.log("billplz-notification DEBUG secret length:", BILLPLZ_X_SIGNATURE_KEY.length, "secret first/last char code:", BILLPLZ_X_SIGNATURE_KEY.charCodeAt(0), BILLPLZ_X_SIGNATURE_KEY.charCodeAt(BILLPLZ_X_SIGNATURE_KEY.length - 1));

    // 1. Sahkan tandatangan dulu — TOLAK terus kalau tak sepadan, ini pertahanan
    //    utama supaya orang lain tak boleh hantar notifikasi palsu "dah bayar"
    const entries: [string, string][] = [];
    for (const [key, value] of params.entries()) {
      if (key === "x_signature") continue;
      entries.push([key, value]);
    }
    const matchedFormat = await verifySignature(entries, receivedSignature, BILLPLZ_X_SIGNATURE_KEY);

    if (!matchedFormat) {
      console.error("billplz-notification: signature tak sepadan (semua format dicuba gagal) — mungkin bukan dari Billplz sebenar, atau BILLPLZ_X_SIGNATURE_KEY salah");
      return new Response(JSON.stringify({ ok: false, error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.log(`billplz-notification: signature sah (format: ${matchedFormat})`);

    // 2. Signature sah — proses notifikasi
    // NOTA: webhook Billplz sebenar TIDAK bawa balik reference_1/reference_2
    // (medan tu hanya wujud pada Redirect browser, bukan Callback server-to-
    // server ni) — sebab tu kita padankan order guna billplz_bill_id yang kita
    // sendiri simpan masa cipta bayaran (billplz-create-payment), bukan
    // reference_1.
    const isPaid = params.get("paid") === "true";
    const billId = params.get("id") ?? null;

    if (!billId) {
      return new Response(JSON.stringify({ ok: false, error: "id (bill id) tiada dalam notifikasi" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (isPaid) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

      // Ambil pesanan dulu — perlukan butiran penuh untuk tolak stok & bina
      // mesej Telegram, dan status semasa untuk elak tolak stok/notify DUA KALI
      // kalau Billplz hantar notifikasi sama lebih dari sekali (biasa berlaku
      // pada webhook gateway)
      const getRes = await fetch(
        `${supabaseUrl}/rest/v1/orders?billplz_bill_id=eq.${billId}&select=id,status,items,customer,total,shipping_cost`,
        {
          headers: {
            "apikey": supabaseServiceKey,
            "Authorization": `Bearer ${supabaseServiceKey}`,
          },
        },
      );
      const rows = await getRes.json();
      const existingOrder = rows?.[0];

      if (!existingOrder) {
        console.error("billplz-notification: tiada order dengan billplz_bill_id =", billId);
        return new Response(JSON.stringify({ ok: false, error: "Order tidak dijumpai untuk bill ini" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const orderId = existingOrder.id;
      const isFirstTimePaid = existingOrder.status !== "paid";

      if (isFirstTimePaid) {
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
      } else if (isFirstTimePaid) {
        await notifyTelegramPaid(supabaseUrl, supabaseServiceKey, { id: orderId, ...existingOrder });
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
