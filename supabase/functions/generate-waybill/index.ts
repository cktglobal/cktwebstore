// supabase/functions/generate-waybill/index.ts
//
// Edge Function ini simpan kredential Pos Laju SECARA SELAMAT (server-side)
// dan buat 2 panggilan API bagi pihak app CKT Global:
//   1. Get Token (dapatkan Bearer token)
//   2. Create Order (cipta konsainan, dapatkan tracking_no + PDF label)
//
// Kredential (POS_CLIENT_ID, POS_CLIENT_SECRET, POS_ACCOUNT_NUMBER) TIDAK
// ditulis dalam fail ni — dibaca dari "Secrets" Supabase supaya selamat.

const POS_BASE_URL = Deno.env.get("POS_BASE_URL") ?? "https://posapi.pos.com.my";
const POS_CLIENT_ID = Deno.env.get("POS_CLIENT_ID")!;
const POS_CLIENT_SECRET = Deno.env.get("POS_CLIENT_SECRET")!;
const POS_ACCOUNT_NUMBER = Deno.env.get("POS_ACCOUNT_NUMBER")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getAccessToken(): Promise<string> {
  const res = await fetch(`${POS_BASE_URL}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "application/json",
    },
    body: new URLSearchParams({
      client_id: POS_CLIENT_ID,
      client_secret: POS_CLIENT_SECRET,
      grant_type: "client_credentials",
    }),
  });
  if (!res.ok) {
    throw new Error(`Get Token gagal: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.access_token;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const { orderId, sender, receiver, weight, dimensions, items, pickup } = payload;

    if (!sender || !receiver || !weight || !items) {
      return new Response(
        JSON.stringify({ ok: false, error: "Medan sender, receiver, weight, atau items tiada" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const token = await getAccessToken();

    const orderBody = {
      account_number: POS_ACCOUNT_NUMBER,
      product_code: "80000000",       // Kod produk Pos Laju standard domestik
      return_type: "01",
      item_type: "1",
      parcel: "domestic",
      webhook: true,
      service_level: "Standard",
      subscription_code: "CKTGLOBAL.WEBSTORE.1.0",
      platform: "API",
      mps: false,
      reference: {
        merchant_order_number: orderId,
        merchant_reference_number: orderId,
      },
      pickup: {
        required: true,
        timeslot: {
          start_time: pickup?.start_time ?? "09:00",
          end_time: pickup?.end_time ?? "12:00",
        },
      },
      sender: {
        display_address: "",
        hide_sender_address: false,
        name: sender.name,
        phone_number: sender.phone_number,
        email: sender.email ?? "",
        address: {
          address1: sender.address1,
          address2: sender.address2 ?? "",
          area: sender.area ?? "",
          city: sender.city,
          state: sender.state,
          address_type: "Others",
          country: "MY",
          postcode: sender.postcode,
        },
      },
      receiver: {
        name: receiver.name,
        phone_number: receiver.phone_number,
        email: receiver.email ?? "",
        address: {
          address1: receiver.address1,
          address2: receiver.address2 ?? "",
          area: receiver.area ?? "",
          city: receiver.city,
          state: receiver.state,
          address_type: "Home",
          country: "MY",
          postcode: receiver.postcode,
        },
      },
      parcel_details: [
        {
          weight: weight,
          length: dimensions?.length ?? 20,
          width: dimensions?.width ?? 15,
          height: dimensions?.height ?? 10,
          item_count: items.length,
          parcel_notes: "",
          item_category_details: "02", // Sale of goods
          details: items.map((it: { name: string; quantity: number; value: number }) => ({
            item_description: it.name,
            quantity: it.quantity,
            hscode: "",
            notes: "",
            value: it.value,
          })),
        },
      ],
    };

    const orderRes = await fetch(`${POS_BASE_URL}/api/order/v2.1/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(orderBody),
    });

    const orderData = await orderRes.json();

    if (!orderRes.ok || orderData.message !== "success") {
      return new Response(
        JSON.stringify({ ok: false, error: orderData }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        tracking_no: orderData.data.tracking_no,
        label_pdf_url: orderData.data.consignment?.pdf,
        label_jpeg_url: orderData.data.consignment?.jpeg,
        tracking_url: orderData.data.tracking_url,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
