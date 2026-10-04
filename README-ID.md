# Panel Admin Auto Order

Panel admin ini menggunakan Firebase Authentication + Cloud Firestore.

## Yang perlu dilakukan
1. Buat project di Firebase.
2. Aktifkan Authentication > Sign-in method > Email/Password.
3. Buat user admin di Authentication > Users.
4. Buat Firestore Database.
5. Masukkan konfigurasi Web App Firebase ke `firebase-config.js`.
6. Ganti `GANTI_EMAIL_ADMIN` pada `firestore.rules` dengan email admin.
7. Deploy `firestore.rules` ke Firestore.
8. Upload `index.html`, `admin.html`, `firebase-config.js`, `style.css` ke repository GitHub.
9. Aktifkan GitHub Pages.
10. Buka `/admin.html` untuk login.

## Penting
Jangan menaruh password admin di HTML/JavaScript. Login diverifikasi oleh Firebase Authentication dan akses data dibatasi oleh Firestore Security Rules.

GitHub Pages sendiri hanya menyajikan file statis; Firebase diperlukan agar autentikasi dan database benar-benar berjalan.
