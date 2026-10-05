/* Lilacmart Store - Supabase Catalog */

(function () {
  "use strict";

  const CONFIG = {
    storeName: "Lilacmart Store",
    whatsapp: "6289513348955",
    qrisImage: "qris.jpg"
  };

  let products = [];
  let cart = JSON.parse(localStorage.getItem("lilac_cart") || "[]");
  let category = "Semua";

  window.products = products;

  function $(id) {
    return document.getElementById(id);
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function money(value) {
    return "Rp" + Number(value || 0).toLocaleString("id-ID");
  }

  function saveCart() {
    localStorage.setItem("lilac_cart", JSON.stringify(cart));
    updateCartCount();
  }

  function updateCartCount() {
    const count = cart.reduce(function (n, item) {
      return n + Number(item.qty || 1);
    }, 0);

    [
      "cartCount",
      "cart-count",
      "cartBadge",
      "cart-badge"
    ].forEach(function (id) {
      const el = $(id);
      if (el) el.textContent = count;
    });
  }

  async function loadProducts() {
    try {
      if (
        !window.supabase ||
        !window.LILAC_SUPABASE_URL ||
        !window.LILAC_SUPABASE_KEY
      ) {
        throw new Error("Konfigurasi Supabase tidak ditemukan.");
      }

      const client = window.supabase.createClient(
        window.LILAC_SUPABASE_URL,
        window.LILAC_SUPABASE_KEY
      );

      const result = await client
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (result.error) {
        throw result.error;
      }

      products = (result.data || [])
        .map(function (p) {
          return {
            id: p.id,
            name: p.name || "Produk",
            cat: p.category || "Lainnya",
            price: Number(p.price || 0),
            icon: p.icon || "🛍️",
            image: p.image_url || "",
            description: p.description || "",
            status: p.status || "Ready",
            stock: Number(p.stock || 0)
          };
        })
        .filter(function (p) {
          return p.name.trim() !== "";
        });

      window.products = products;

      renderProducts();
      updateCounters();

      console.log(
        "Lilacmart: katalog Supabase berhasil dimuat",
        products
      );
    } catch (error) {
      console.error("Lilacmart katalog error:", error);

      products = [];
      window.products = products;

      renderProductsError(
        error.message || "Produk tidak dapat dimuat."
      );
    }
  }

  function updateCounters() {
    const ready = products.filter(function (p) {
      return String(p.status).toLowerCase().trim() === "ready";
    }).length;

    const readyEl = $("readyCount");

    if (readyEl) {
      readyEl.textContent = "(" + ready + " produk ready)";
    }

    const activeEl = $("activeCount");

    if (activeEl) {
      activeEl.textContent = products.length;
    }
  }

  function renderProductsError(message) {
    const box = $("products");

    if (!box) return;

    box.innerHTML =
      '<div style="padding:24px;text-align:center;background:#fff;border-radius:20px;">' +
      "<h3>⚠️ Katalog belum dapat dimuat</h3>" +
      "<p>" +
      esc(message || "Data produk bermasalah.") +
      "</p>" +
      '<button onclick="location.reload()" style="padding:12px 20px;border:0;border-radius:12px;">Coba lagi</button>' +
      "</div>";
  }

  function productImage(product) {
    if (product.image) {
      return (
        '<img src="' +
        esc(product.image) +
        '" alt="' +
        esc(product.name) +
        '" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\'">' +
        '<span style="display:none;font-size:42px">' +
        esc(product.icon) +
        "</span>"
      );
    }

    return (
      '<span style="font-size:48px">' +
      esc(product.icon) +
      "</span>"
    );
  }

  function renderProducts() {
    const box = $("products");

    if (!box) return;

    const list = products.filter(function (p) {
      return category === "Semua" || p.cat === category;
    });

    if (!list.length) {
      box.innerHTML =
        '<div style="padding:30px;text-align:center;">Belum ada produk pada kategori ini.</div>';

      updateCounters();
      return;
    }

    box.innerHTML = list
      .map(function (p) {
        const ready =
          String(p.status).toLowerCase().trim() === "ready" &&
          Number(p.stock || 0) > 0;

        return (
          '<article class="product-card" data-product-id="' +
          esc(p.id) +
          '">' +
          '<div class="product-image">' +
          productImage(p) +
          "</div>" +
          '<div class="product-info">' +
          "<small>" +
          esc(p.cat) +
          "</small>" +
          "<h3>" +
          esc(p.name) +
          "</h3>" +
          "<p>" +
          esc(p.description) +
          "</p>" +
          "<strong>" +
          money(p.price) +
          "</strong>" +
          '<button type="button" ' +
          (ready ? "" : "disabled") +
          ' onclick="addToCart(\'' +
          esc(p.id) +
          "')\">" +
          (ready ? "🛒 Tambah" : "Tidak tersedia") +
          "</button>" +
          "</div>" +
          "</article>"
        );
      })
      .join("");

    updateCounters();
  }

  function setCategory(name, button) {
    category = name || "Semua";

    document.querySelectorAll(".chip").forEach(function (el) {
      el.classList.remove("active");
    });

    if (button) {
      button.classList.add("active");
    }

    renderProducts();
  }

  window.setCategory = setCategory;

  function addToCart(id) {
    const product = products.find(function (p) {
      return String(p.id) === String(id);
    });

    if (!product) {
      showToast("Produk tidak ditemukan");
      return;
    }

    if (
      String(product.status).toLowerCase().trim() !== "ready" ||
      Number(product.stock || 0) <= 0
    ) {
      showToast("Produk sedang tidak tersedia");
      return;
    }

    const existing = cart.find(function (item) {
      return String(item.id) === String(id);
    });

    if (existing) {
      if (
        Number(existing.qty || 1) >=
        Number(product.stock || 0)
      ) {
        showToast("Jumlah melebihi stok");
        return;
      }

      existing.qty = Number(existing.qty || 1) + 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        icon: product.icon,
        image: product.image,
        qty: 1
      });
    }

    saveCart();
    renderCart();

    showToast(
      product.name + " ditambahkan ke keranjang"
    );
  }

  window.addToCart = addToCart;

  function changeQty(id, delta) {
    const item = cart.find(function (x) {
      return String(x.id) === String(id);
    });

    if (!item) return;

    item.qty = Number(item.qty || 1) + delta;

    if (item.qty <= 0) {
      cart = cart.filter(function (x) {
        return String(x.id) !== String(id);
      });
    }

    saveCart();
    renderCart();
  }

  window.changeQty = changeQty;

  function removeFromCart(id) {
    cart = cart.filter(function (x) {
      return String(x.id) !== String(id);
    });

    saveCart();
    renderCart();
  }

  window.removeFromCart = removeFromCart;

  function clearCart() {
    cart = [];
    saveCart();
    renderCart();
  }

  window.clearCart = clearCart;

  function cartTotal() {
    return cart.reduce(function (sum, item) {
      return (
        sum +
        Number(item.price || 0) *
          Number(item.qty || 1)
      );
    }, 0);
  }

  function renderCart() {
    const box = $("cartItems");

    if (!box) {
      updateCartCount();
      return;
    }

    if (!cart.length) {
      box.innerHTML =
        '<div style="padding:25px;text-align:center;">🛒 Keranjang masih kosong.</div>';
    } else {
      box.innerHTML = cart
        .map(function (item) {
          return (
            '<div class="cart-item">' +
            "<b>" +
            esc(item.icon || "🛍️") +
            " " +
            esc(item.name) +
            "</b>" +
            "<div>" +
            money(item.price) +
            " × " +
            item.qty +
            "</div>" +
            '<button onclick="changeQty(\'' +
            esc(item.id) +
            "',-1)\">−</button>" +
            "<span> " +
            item.qty +
            " </span>" +
            '<button onclick="changeQty(\'' +
            esc(item.id) +
            "',1)\">+</button>" +
            '<button onclick="removeFromCart(\'' +
            esc(item.id) +
            "')\">Hapus</button>" +
            "</div>"
          );
        })
        .join("");
    }

    const total = cartTotal();

    const count = cart.reduce(
      function (n, item) {
        return n + Number(item.qty || 1);
      },
      0
    );

    ["subtotal", "total", "cartTotal"].forEach(
      function (id) {
        const el = $(id);

        if (el) {
          el.textContent = money(total);
        }
      }
    );

    ["itemCount", "productCount"].forEach(
      function (id) {
        const el = $(id);

        if (el) {
          el.textContent = count;
        }
      }
    );

    updateCartCount();
  }

  function openCart() {
    renderCart();

    const modal =
      $("cartModal") ||
      $("cart-modal") ||
      $("cartDrawer");

    if (modal) {
      modal.classList.remove("hidden");
      modal.style.display = "";
      modal.classList.add("open");
    }
  }

  window.openCart = openCart;

  function closeCart() {
    const modal =
      $("cartModal") ||
      $("cart-modal") ||
      $("cartDrawer");

    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("open");
    }
  }

  window.closeCart = closeCart;

  function makeCheckoutModal() {
    if ($("lilacCheckoutModal")) return;

    const div = document.createElement("div");

    div.id = "lilacCheckoutModal";

    div.style.cssText =
      "position:fixed;inset:0;background:#0008;z-index:99999;display:none;overflow:auto;padding:20px;";

    div.innerHTML =
      '<div style="max-width:480px;margin:30px auto;background:#fff;border-radius:24px;padding:22px;">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;">' +
      "<h2>Checkout QRIS</h2>" +
      '<button id="lilacCloseCheckout" type="button">✕</button>' +
      "</div>" +
      '<p>Total: <b id="lilacCheckoutTotal">Rp0</b></p>' +
      '<input id="lilacName" placeholder="Nama Anda" style="width:100%;box-sizing:border-box;padding:13px;margin:7px 0;">' +
      '<input id="lilacPhone" placeholder="Nomor WhatsApp" style="width:100%;box-sizing:border-box;padding:13px;margin:7px 0;">' +
      '<textarea id="lilacNote" placeholder="Catatan (opsional)" style="width:100%;box-sizing:border-box;padding:13px;margin:7px 0;"></textarea>' +
      '<img src="' +
      esc(CONFIG.qrisImage) +
      '" alt="QRIS" style="display:block;max-width:260px;width:100%;margin:15px auto;border-radius:12px;">' +
      '<p style="text-align:center;">Scan QRIS di atas, lalu tekan <b>Saya sudah bayar</b>.</p>' +
      '<button id="lilacPaid" type="button" style="width:100%;padding:14px;border:0;border-radius:14px;background:#d63384;color:#fff;font-weight:bold;">Saya sudah bayar</button>' +
      '<button id="lilacWhatsApp" type="button" style="width:100%;padding:14px;border:0;border-radius:14px;margin-top:8px;">Kirim detail order ke WhatsApp</button>' +
      "</div>";

    document.body.appendChild(div);

    $("lilacCloseCheckout").onclick =
      closeCheckout;

    $("lilacPaid").onclick =
      submitOrder;

    $("lilacWhatsApp").onclick =
      sendWhatsApp;
  }

  function openCheckout() {
    if (!cart.length) {
      showToast("Keranjang masih kosong");
      return;
    }

    makeCheckoutModal();

    $("lilacCheckoutTotal").textContent =
      money(cartTotal());

    $("lilacCheckoutModal").style.display =
      "block";
  }

  window.checkout = openCheckout;

  function closeCheckout() {
    const modal = $("lilacCheckoutModal");

    if (modal) {
      modal.style.display = "none";
    }
  }

  window.closeCheckout = closeCheckout;

  function orderId() {
    return (
      "LM" +
      Date.now().toString().slice(-8) +
      Math.floor(Math.random() * 90 + 10)
    );
  }

  function collectCustomer() {
    const name =
      ($("lilacName") || {}).value || "";

    const phone =
      ($("lilacPhone") || {}).value || "";

    const note =
      ($("lilacNote") || {}).value || "";

    if (!name.trim()) {
      alert("Masukkan nama terlebih dahulu.");
      return null;
    }

    if (!phone.trim()) {
      alert(
        "Masukkan nomor WhatsApp terlebih dahulu."
      );
      return null;
    }

    return {
      name: name.trim(),
      phone: phone.trim(),
      note: note.trim()
    };
  }

  async function submitOrder() {
    const customer = collectCustomer();

    if (!customer) return;

    const order = {
      id: orderId(),
      name: customer.name,
      phone: customer.phone,
      note: customer.note,
      total: cartTotal(),
      items: cart.map(function (item) {
        return {
          id: item.id,
          name: item.name,
          price: Number(item.price || 0),
          qty: Number(item.qty || 1)
        };
      }),
      paymentStatus: "Menunggu verifikasi",
      paidAt: new Date().toISOString()
    };

    try {
      if (
        window.LilacDB &&
        typeof window.LilacDB.saveOrder ===
          "function"
      ) {
        await window.LilacDB.saveOrder(order);
      }

      const message =
        buildWhatsAppMessage(order);

      cart = [];

      saveCart();
      renderCart();
      closeCheckout();

      window.open(
        "https://wa.me/" +
          CONFIG.whatsapp +
          "?text=" +
          encodeURIComponent(message),
        "_blank"
      );
    } catch (error) {
      console.error(
        "Gagal menyimpan order:",
        error
      );

      alert(
        "Order belum berhasil disimpan. Coba lagi.\n\n" +
          (error.message || error)
      );
    }
  }

  window.submitOrder = submitOrder;

  function buildWhatsAppMessage(order) {
    const lines = order.items.map(
      function (item) {
        return (
          "• " +
          item.name +
          " x" +
          item.qty +
          " = " +
          money(
            item.price * item.qty
          )
        );
      }
    );

    return (
      "Halo " +
      CONFIG.storeName +
      ", saya sudah melakukan pembayaran QRIS.\n\n" +
      "Invoice: " +
      order.id +
      "\n" +
      "Nama: " +
      order.name +
      "\n" +
      "WhatsApp: " +
      order.phone +
      "\n\n" +
      "Pesanan:\n" +
      lines.join("\n") +
      "\n\nTotal: " +
      money(order.total) +
      "\nStatus: Menunggu verifikasi" +
      (order.note
        ? "\nCatatan: " + order.note
        : "")
    );
  }

  function sendWhatsApp() {
    const customer = collectCustomer();

    if (!customer) return;

    const fakeOrder = {
      id: orderId(),
      name: customer.name,
      phone: customer.phone,
      note: customer.note,
      total: cartTotal(),
      items: cart.map(function (item) {
        return {
          name: item.name,
          price: item.price,
          qty: item.qty
        };
      })
    };

    window.open(
      "https://wa.me/" +
        CONFIG.whatsapp +
        "?text=" +
        encodeURIComponent(
          buildWhatsAppMessage(fakeOrder)
        ),
      "_blank"
    );
  }

  window.sendWhatsApp = sendWhatsApp;

  function showToast(message) {
    let toast = $("lilacToast");

    if (!toast) {
      toast = document.createElement("div");

      toast.id = "lilacToast";

      toast.style.cssText =
        "position:fixed;left:50%;bottom:90px;transform:translateX(-50%);z-index:100000;background:#d63384;color:#fff;padding:12px 18px;border-radius:999px;box-shadow:0 8px 25px #0003;";

      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.display = "block";

    clearTimeout(
      window.__lilacToastTimer
    );

    window.__lilacToastTimer =
      setTimeout(function () {
        toast.style.display = "none";
      }, 2200);
  }

  window.showToast = showToast;

  document.addEventListener(
    "DOMContentLoaded",
    function () {
      updateCartCount();
      renderCart();

      loadProducts();

      document
        .querySelectorAll(
          "[data-cart], .cart-button"
        )
        .forEach(function (el) {
          el.addEventListener(
            "click",
            openCart
          );
        });

      document.addEventListener(
        "click",
        function (event) {
          const modal =
            $("lilacCheckoutModal");

          if (
            modal &&
            event.target === modal
          ) {
            closeCheckout();
          }
        }
      );
    }
  );

  if (
    document.readyState !== "loading"
  ) {
    setTimeout(function () {
      updateCartCount();
      renderCart();

      if (
        !window.__lilacProductsStarted
      ) {
        window.__lilacProductsStarted =
          true;

        loadProducts();
      }
    }, 0);
  } else {
    window.__lilacProductsStarted =
      true;
  }
})();
