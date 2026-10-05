// Integrasi database opsional. Untuk keamanan, gunakan anon/public key saja.
// Website tetap berfungsi dengan localStorage jika Supabase belum dikonfigurasi.
window.LilacDB={save:async(order)=>{
 const cfg=window.SUPABASE_CONFIG||{};
 if(!cfg.url||!cfg.anonKey)return true;
 // Endpoint/database dapat diaktifkan setelah tabel "orders" dibuat.
 return true;
}};