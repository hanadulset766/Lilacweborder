# Lilacmart Store — Auto Order QRIS

Paket ini mengubah tampilan Lilacweborder menjadi tema pink/cream seperti screenshot dan menambahkan alur:
Katalog → Keranjang → Data pelanggan → QRIS → Konfirmasi → WhatsApp.

## File
- `index.html` — halaman toko
- `style.css` — tema/tampilan responsif
- `app.js` — produk, keranjang, checkout QRIS, WhatsApp
- `qris-placeholder.svg` — WAJIB diganti dengan gambar QRIS merchant asli

## Pasang di GitHub Pages
1. Upload semua file ke root repository.
2. Pastikan file utama bernama `index.html`.
3. GitHub → Settings → Pages → Deploy from branch → `main` → `/ (root)`.
4. Setelah aktif, buka URL Pages kamu.

## WAJIB ubah di app.js
- `whatsapp`: nomor WhatsApp toko, format 628xxxx tanpa `+`.
- `qrisImage`: nama file gambar QRIS asli, misalnya `qris.png`.
- Daftar produk dapat diubah pada array `products`.

## Tentang pembayaran QRIS
Versi ini memakai QRIS merchant yang ditampilkan sebagai gambar. Pelanggan tetap melakukan scan dan kemudian mengirim konfirmasi order ke WhatsApp.

Jika ingin **benar-benar otomatis** (status berubah menjadi PAID tanpa konfirmasi manual), GitHub Pages saja tidak cukup untuk menyimpan secret API dan menerima webhook. Gunakan payment gateway/backend yang menyediakan QRIS dinamis + status/inquiry/webhook. Bank Indonesia menjelaskan QRIS memiliki MPM statis dan dinamis; QRIS dinamis membawa nominal transaksi pada kode QR. 
