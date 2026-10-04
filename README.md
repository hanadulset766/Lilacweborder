# Lilacmart Auto Order

Website toko digital statis yang siap dipakai di GitHub Pages.

## File
- `index.html` — halaman toko/pelanggan
- `admin.html` — panel admin
- `style.css` — tampilan responsif
- `app.js` — produk, keranjang, checkout WhatsApp
- `admin.js` — login demo dan CRUD produk

## Login demo
- Username: `admin`
- Password: `Admin123!`

## Upload ke GitHub Pages
1. Upload semua file di root repository.
2. Pastikan nama halaman utama adalah `index.html`.
3. GitHub → Settings → Pages.
4. Source: Deploy from a branch.
5. Branch: `main`, folder: `/ (root)`.
6. Tunggu deployment selesai.
7. Toko: `https://USERNAME.github.io/NAMA-REPO/`
8. Admin: `https://USERNAME.github.io/NAMA-REPO/admin.html`

## WhatsApp
Buka `app.js`, cari `WHATSAPP_NUMBER`, lalu ganti dengan nomor toko dalam format internasional tanpa `+` dan tanpa spasi.

## Catatan keamanan
Login admin di versi ini adalah DEMO berbasis JavaScript/localStorage/sessionStorage. Jangan gunakan untuk menyimpan data sensitif atau mengelola uang secara nyata. Untuk produksi, gunakan backend, database, autentikasi server-side, HTTPS, dan endpoint pembayaran/webhook yang aman.
