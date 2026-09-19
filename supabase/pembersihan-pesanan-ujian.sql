-- ============================================================
-- Pembersihan: Padam SEMUA pesanan ujian
-- ⚠️ AMARAN: Ini akan padam SEMUA rekod dalam jadual "orders" secara
-- KEKAL (termasuk resit, tracking number, dll). Tidak boleh dibatalkan.
-- Hanya jalankan ini kalau anda pasti semua pesanan yang ada sekarang
-- adalah data UJIAN sahaja, bukan pesanan pelanggan sebenar.
-- ============================================================

truncate table orders;

-- ============================================================
-- ALTERNATIF: Kalau anda nak padam pesanan TERTENTU sahaja
-- (bukan semua), guna arahan di bawah — gantikan No. Pesanan
-- dengan ID sebenar, dan uncomment (buang -- di depan) baris tu.
-- ============================================================

-- delete from orders where id = 'order-mrtqa6cq-zhh4g';
-- delete from orders where id in ('order-abc123', 'order-def456');
