// ====== KONFIGURASI SUPABASE & EDGE FUNCTION ======
// ====== KONFIGURASI SUPABASE — GANTI DUA NILAI DI BAWAH ======
  // 1. Buka projek Supabase anda -> Project Settings -> Data API
  // 2. Salin "Project URL" dan "anon public" key, tampal di sini
  window.SUPABASE_URL = "https://dhouwiyotjxfijtsspzt.supabase.co";
  window.SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRob3V3aXlvdGp4ZmlqdHNzcHp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0MjUxMzYsImV4cCI6MjEwMDAwMTEzNn0.rXt7fHBMOD1y2RnpTyJ6RkwcPLU6K3kooEjk3iJS66I";
  window.WAYBILL_FUNCTION_URL = "https://dhouwiyotjxfijtsspzt.supabase.co/functions/v1/generate-waybill";
  window.BILLPLZ_CREATE_PAYMENT_URL = "https://dhouwiyotjxfijtsspzt.supabase.co/functions/v1/billplz-create-payment";
