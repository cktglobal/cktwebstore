// supabase/functions/generate-waybill/index.ts
//
// DIHENTIKAN (KESELAMATAN). Versi lama function ni boleh dipanggil oleh
// SESIAPA sahaja dengan anon key (tiada semakan admin) — orang luar boleh
// cipta konsainan Pos Laju atas akaun kedai. Jana waybill kini dibuat
// melalui Edge Function "store-api" (tindakan "generate_waybill") yang
// sahkan sesi admin dahulu.
//
// Deploy versi ni untuk tutup function lama, ATAU padam terus function
// "generate-waybill" di Supabase Dashboard > Edge Functions.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve((req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  return new Response(
    JSON.stringify({ ok: false, error: "Function ini telah dihentikan — guna store-api (generate_waybill)" }),
    { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
