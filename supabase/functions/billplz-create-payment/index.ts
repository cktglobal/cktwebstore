// supabase/functions/billplz-create-payment/index.ts
//
// Edge Function ini simpan kredential Billplz SECARA SELAMAT (server-side) dan
// buat 1 panggilan API bagi pihak app CKT Global: cipta "Bill" Billplz —
// hantar butiran pesanan, terima balik url pembayaran untuk pelanggan bayar
// (FPX/kad/e-wallet dll — ikut apa yang diaktifkan pada akaun Billplz anda).
//
// Kredential (BILLPLZ_API_KEY, BILLPLZ_COLLECTION_ID) TIDAK ditulis dalam
// fail ni — dibaca dari "Secrets" Supabase supaya selamat (secret key TAK
// BOLEH ada dalam kod browser — sesiapa boleh curi & buat transaksi palsu).
//
// Cara set secrets (Supabase Dashboard > Edge Functions >
// billplz-create-payment > Secrets, ATAU guna Supabase CLI):
//   BILLPLZ_API_KEY      -> API Secret Key dari Billplz Dashboard
//                           (Settings > API Keys / Account Settings)
//   BILLPLZ_COLLECTION_ID -> ID Collection Billplz (Collections > pilih
//                            collection > "Collection ID" dalam URL/settings)
//   BILLPLZ_BASE_URL      -> https://www.billplz-sandbox.com  (waktu testing)
//                            https://www.billplz.com          (bila dah live/production)
//   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY -> automatik disediakan Supabase

const BILLPLZ_API_KEY = Deno.env.get("BILLPLZ_API_KEY")!;
const BILLPLZ_COLLECTION_ID = Deno.env.get("BILLPLZ_COLLECTION_ID")!;
const BILLPLZ_BASE_URL = Deno.env.get("BILLPLZ_BASE_URL") ?? "https://www.billplz-sandbox.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    // Billplz nak amount dalam SEN (integer), bukan Ringgit dengan titik
    // perpuluhan — cth RM10.50 kena hantar sebagai 1050.
    const billplzAmountCents = Math.round(Number(amount) * 100);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;

    const form = new URLSearchParams();
    form.set("collection_id", BILLPLZ_COLLECTION_ID);
    form.set("name", customerName || "Pelanggan CKT Global");
    form.set("email", customerEmail || "");
    if (customerPhone) form.set("mobile", customerPhone);
    form.set("amount", String(billplzAmountCents));
    form.set("description", `Pesanan ${orderId}`.slice(0, 200));
    // Billplz webhook (callback) tak bawa balik orderId kita secara automatik —
    // simpan dalam reference_1 supaya boleh padankan balik pesanan bila
    // notifikasi bayaran diterima kat billplz-notification.
    form.set("reference_1_label", "Order ID");
    form.set("reference_1", orderId);
    // Server-to-server webhook — Billplz panggil ni bila status bill berubah
    form.set("callback_url", `${supabaseUrl}/functions/v1/billplz-notification`);
    // Bawa pelanggan balik ke kedai automatik lepas bayaran selesai (berjaya
    // ATAU gagal) — tanpa ni pelanggan "terperangkap" di laman result Billplz.
    // Sertakan orderId (?trackOrder=) supaya app.js boleh terus buka panel
    // "Jejak Pesanan" (papar status "Bayaran Disahkan" dsb.) bukan homepage kosong.
    form.set("redirect_url", `https://cktwebstore.com/?trackOrder=${encodeURIComponent(orderId)}`);

    const authHeader = "Basic " + btoa(`${BILLPLZ_API_KEY}:`);

    const billplzRes = await fetch(`${BILLPLZ_BASE_URL}/api/v3/bills`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": authHeader,
      },
      body: form.toString(),
    });

    const billplzData = await billplzRes.json();

    if (!billplzRes.ok || !billplzData?.url) {
      console.error("Billplz create bill gagal:", JSON.stringify(billplzData));
      const errMsg = Array.isArray(billplzData?.error?.message)
        ? billplzData.error.message.join(", ")
        : (billplzData?.error?.message || "Billplz menolak permintaan");
      return new Response(
        JSON.stringify({ ok: false, error: errMsg }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Simpan bill id & payment url ke rekod pesanan supaya boleh rujuk balik kalau perlu
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
        payment_method: "billplz",
        billplz_bill_id: billplzData.id,
        billplz_payment_url: billplzData.url,
      }),
    });

    return new Response(
      JSON.stringify({ ok: true, paymentUrl: billplzData.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("billplz-create-payment error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
