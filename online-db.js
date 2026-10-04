(function () {
  const client = window.supabase.createClient(
    window.LILAC_SUPABASE_URL,
    window.LILAC_SUPABASE_KEY
  );

  window.LilacDB = {

    async saveOrder(order) {
      const { error } = await client
        .from("orders")
        .insert({
          id: order.id,
          name: order.name,
          phone: order.phone,
          note: order.note || "",
          total: order.total || 0,
          items: order.items || [],
          payment_status: order.paymentStatus || "Menunggu verifikasi",
          paid_at: order.paidAt || null
        });

      if (error) {
        console.error("Gagal menyimpan order:", error);
        throw error;
      }

      return true;
    },

    async updateStatus(id, status) {
      const { error } = await client
        .from("orders")
        .update({
          payment_status: status,
          status_updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (error) {
        console.error("Gagal mengubah status:", error);
        throw error;
      }

      return true;
    },

    async listOrders() {
      const { data, error } = await client
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Gagal mengambil order:", error);
        throw error;
      }

      return data || [];
    }
  };
})();
