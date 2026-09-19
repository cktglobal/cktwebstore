// ============================================================
// MODUL SEMAKAN LESEN — license-check.js
// ============================================================
// Letak fail ni dalam folder js/ setiap kedai KLIEN, dan tambah
// SATU baris ni dalam index.html (SEBELUM app.js):
//
//   <script src="js/license-check.js"></script>
//
// Kemudian dalam js/config.js kedai klien tu, tambah 3 baris ni
// (gantikan dengan nilai sebenar untuk klien tersebut):
//
//   window.LICENSE_KEY = "CKT-NAMAKLIEN-2026-XXXX";
//   window.LICENSE_SUPABASE_URL = "https://projek-lesen-pusat-anda.supabase.co";
//   window.LICENSE_SUPABASE_ANON_KEY = "anon-key-projek-lesen-pusat-anda";
//
// PENTING: LICENSE_SUPABASE_URL dan LICENSE_SUPABASE_ANON_KEY
// adalah untuk PROJEK LESEN PUSAT anda (schema-lesen-pusat-vendor.sql)
// — BUKAN Supabase kedai klien tu sendiri. Setiap klien guna
// LICENSE_KEY yang BERBEZA, tapi semua rujuk PROJEK LESEN PUSAT
// yang SAMA (milik anda).
// ============================================================

(function () {
  "use strict";

  function showLockScreen(message) {
    document.addEventListener("DOMContentLoaded", render);
    if (document.readyState !== "loading") render();

    function render() {
      const overlay = document.createElement("div");
      overlay.style.cssText =
        "position:fixed;inset:0;z-index:99999;background:#0F5257;color:#fff;" +
        "display:flex;align-items:center;justify-content:center;padding:24px;" +
        "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;text-align:center;";
      overlay.innerHTML =
        '<div style="max-width:340px;">' +
        '<div style="font-size:40px;margin-bottom:12px;">🔒</div>' +
        '<div style="font-size:18px;font-weight:700;margin-bottom:10px;">Langganan Tidak Aktif</div>' +
        '<div style="font-size:14px;opacity:0.9;line-height:1.6;">' + message + "</div>" +
        "</div>";
      document.body.innerHTML = "";
      document.body.appendChild(overlay);
    }
  }

  async function checkLicense() {
    const key = window.LICENSE_KEY;
    const url = window.LICENSE_SUPABASE_URL;
    const anonKey = window.LICENSE_SUPABASE_ANON_KEY;

    if (!key || !url || !anonKey) {
      // Tiada konfigurasi lesen langsung — anggap ini kedai TANPA
      // sekatan lesen (contoh: kedai anda sendiri, bukan klien
      // berbayar). App teruskan seperti biasa.
      window.__LICENSE_OK__ = true;
      return;
    }

    try {
      const res = await fetch(url + "/rest/v1/rpc/check_license", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: anonKey,
          Authorization: "Bearer " + anonKey,
        },
        body: JSON.stringify({ key: key }),
      });
      const data = await res.json();
      const row = Array.isArray(data) ? data[0] : null;

      if (!row) {
        window.__LICENSE_OK__ = false;
        showLockScreen(
          "Kunci lesen tidak sah atau tidak dijumpai. Sila hubungi pembekal sistem anda."
        );
        return;
      }

      const isActive = row.status === "active";
      const notExpired = !row.expires_at || new Date(row.expires_at) >= new Date();

      if (isActive && notExpired) {
        window.__LICENSE_OK__ = true;
      } else {
        window.__LICENSE_OK__ = false;
        const reason = !isActive
          ? "Langganan anda telah digantung."
          : "Tempoh langganan anda telah tamat.";
        showLockScreen(
          reason + " Sila hubungi pembekal sistem anda untuk perbaharui akses."
        );
      }
    } catch (err) {
      console.error("License check failed:", err);
      // Kalau semakan gagal sebab isu rangkaian, benarkan akses
      // sementara (elak kedai klien "mati" sebab isu sambungan
      // pendek, bukan isu langganan sebenar).
      window.__LICENSE_OK__ = true;
    }
  }

  // Jalankan semakan SEBELUM app.js sempat mula render kedai
  window.__LICENSE_CHECK_PROMISE__ = checkLicense();
})();
