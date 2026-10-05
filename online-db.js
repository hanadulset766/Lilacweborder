// Penyimpanan pesanan.
// Jika SUPABASE_CONFIG sudah diisi, fungsi ini dapat dihubungkan ke Supabase.
// Untuk mode tanpa Supabase, pesanan tetap dibuat dan disimpan di browser.
async function saveOrder(order) {
  try {
    localStorage.setItem("lilacmart_last_order", JSON.stringify(order));
  } catch (e) {
    console.warn("Pesanan tidak dapat disimpan di browser.", e);
  }

  if (typeof SUPABASE_CONFIG !== "undefined" &&
      SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
    // Integrasi Supabase dapat ditambahkan setelah tabel database dibuat.
    // Sengaja tidak menggunakan service_role key di sisi client.
  }
  return { ok: true };
}
