const CONFIG = {
  storeName: "Lilacmart Store",
  whatsapp: "6289513348955",
  qrisImage: "qris.jpg",

  sheetId: "1OGqnNp5BYmE252a59vPxz9ooyCukkfqfa3lqz49jrNc",
  sheetName: "Katalog"
};

let products = [];

let category = "Semua";

let cart = JSON.parse(
  localStorage.getItem("lilac_cart") || "[]"
);

let lastOrder = null;


/* =====================================================
   GOOGLE SHEETS
===================================================== */

function loadProducts() {

  const oldScript = document.getElementById(
    "lilac-sheet-script"
  );

  if (oldScript) {
    oldScript.remove();
  }

  /*
   * Callback khusus Google Sheets.
   * Google akan memanggil:
   * window.lilacSheetCallback(data)
   */
  window.lilacSheetCallback = function(data) {

    try {

      console.log("Google Sheets response:", data);

      if (!data || !data.table) {
        throw new Error(
          "Data Google Sheets tidak ditemukan."
        );
      }

      const rows = data.table.rows || [];

      products = rows
        .map(function(row, index) {

          const cells = row.c || [];

          function value(position) {

            if (
              cells[position] &&
              cells[position].v !== undefined &&
              cells[position].v !== null
            ) {
              return String(cells[position].v).trim();
            }

            return "";
          }

          const idValue = value(0);

          const name = value(1);

          const cat = value(2);

          const priceText = value(3);

          const icon = value(4) || "🛍️";

          const image = value(5);

          const description = value(6);

          const status = value(7) || "Ready";

          /*
           * Harga bisa berupa:
           * 15000
           * Rp15.000
           * Rp 15.000
           */
          const price = Number(
            priceText.replace(/[^\d]/g, "")
          ) || 0;

          /*
           * ID dari Google Sheet.
           * Jika kosong, gunakan nomor baris.
           */
          const id =
            Number(idValue) ||
            (index + 1);

          return {
            id: id,
            name: name || "Produk",
            cat: cat || "Lainnya",
            price: price,
            icon: icon,
            image: image,
            description: description,
            status: status
          };

        })
        .filter(function(product) {

          return (
            product.name &&
            product.name.trim() !== ""
          );

        });

      console.log(
        "JUMLAH PRODUK:",
        products.length
      );

      console.log(
        "DATA PRODUK:",
        products
      );

      renderProducts();

      updateReadyCount();

    } catch (error) {

      console.error(
        "Gagal memproses Google Sheets:",
        error
      );

      showCatalogError(
        "Data Google Sheets tidak dapat diproses."
      );
    }
  };


  /*
   * URL JSONP Google Sheets
   */
  const url =
    "https://docs.google.com/spreadsheets/d/" +
    CONFIG.sheetId +
    "/gviz/tq" +
    "?sheet=" +
    encodeURIComponent(CONFIG.sheetName) +
    "&headers=1" +
    "&tqx=" +
    encodeURIComponent(
      "out:json;responseHandler:lilacSheetCallback"
    ) +
    "&_=" +
    Date.now();


  console.log(
    "Memuat katalog dari:",
    url
  );


  const script =
    document.createElement("script");

  script.id =
    "lilac-sheet-script";

  script.src = url;

  script.async = true;


  script.onerror = function() {

    console.error(
      "Google Sheets gagal diakses."
    );

    showCatalogError(
      "Google Sheets tidak dapat diakses."
    );

  };


  document.head.appendChild(script);


  /*
   * Timeout untuk mendeteksi jika callback
   * tidak pernah dipanggil.
   */
  setTimeout(function() {

    if (
      products.length === 0 &&
      document.getElementById("products")
    ) {

      console.warn(
        "Katalog belum menerima data dari Google Sheets."
      );

    }

  }, 8000);
}


/* =====================================================
   ERROR KATALOG
===================================================== */

function showCatalogError(message) {

  const box =
    document.getElementById("products");

  if (!box) return;

  box.innerHTML = `
    <div style="
      padding:25px;
      text-align:center;
      background:#fff;
      border-radius:16px;
      margin:15px;
    ">
      <div style="font-size:42px;">⚠️</div>

      <h3>Katalog belum dapat dimuat</h3>

      <p style="color:#856571;">
        ${message}
      </p>

      <button
        onclick="loadProducts()"
        style="
          border:0;
          padding:12px 20px;
          border-radius:12px;
          cursor:pointer;
        "
      >
        🔄 Coba Lagi
      </button>
    </div>
  `;
}


/* =====================================================
   FORMAT RUPIAH
===================================================== */

function rupiah(number) {

  return new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }
  ).format(Number(number) || 0);

}


/* =====================================================
   CART
===================================================== */

function save() {

  localStorage.setItem(
    "lilac_cart",
    JSON.stringify(cart)
  );

  updateCounts();

}


function updateCounts() {

  const count =
    cart.reduce(
      function(total, item) {
        return total + Number(item.qty || 0);
      },
      0
    );

  document
    .querySelectorAll(
      "#cartCount, #bottomCount"
    )
    .forEach(function(element) {

      element.textContent = count;

    });

}


function add(id) {

  const product =
    products.find(function(item) {

      return Number(item.id) === Number(id);

    });

  if (!product) {

    showToast(
      "Produk tidak ditemukan."
    );

    return;
  }


  const existing =
    cart.find(function(item) {

      return Number(item.id) === Number(id);

    });


  if (existing) {

    existing.qty++;

  } else {

    cart.push({
      id: product.id,
      qty: 1
    });

  }


  save();

  showToast(
    "Produk ditambahkan ke keranjang 💗"
  );

}


function qty(id, difference) {

  const item =
    cart.find(function(cartItem) {

      return Number(cartItem.id) === Number(id);

    });

  if (!item) return;


  item.qty += difference;


  if (item.qty <= 0) {

    cart =
      cart.filter(function(cartItem) {

        return Number(cartItem.id) !== Number(id);

      });

  }


  save();

  renderCart();

}


/* =====================================================
   CATEGORY
===================================================== */

function setCategory(categoryName, button) {

  category = categoryName;


  document
    .querySelectorAll(".chip")
    .forEach(function(chip) {

      chip.classList.remove("active");

    });


  if (button) {

    button.classList.add("active");

  }


  renderProducts();

}


/* =====================================================
   RENDER PRODUCTS
===================================================== */

function renderProducts() {

  const box =
    document.getElementById("products");

  if (!box) return;


  const searchElement =
    document.getElementById("search");


  const search =
    searchElement
      ? searchElement.value
          .toLowerCase()
          .trim()
      : "";


  const list =
    products.filter(function(product) {

      const categoryOK =
        category === "Semua" ||
        product.cat === category;


      const searchOK =
        !search ||
        product.name
          .toLowerCase()
          .includes(search);


      return categoryOK && searchOK;

    });


  if (!list.length) {

    box.innerHTML = `
      <div style="
        padding:30px;
        text-align:center;
      ">
        <div style="font-size:45px;">
          🛍️
        </div>

        <h3>
          ${
            products.length
              ? "Produk tidak ditemukan"
              : "Katalog sedang dimuat..."
          }
        </h3>
      </div>
    `;

    updateReadyCount();

    return;
  }


  box.innerHTML =
    list.map(function(product) {

      let imageHTML;


      if (product.image) {

        imageHTML = `
          <img
            src="${escapeHTML(product.image)}"
            alt="${escapeHTML(product.name)}"
            loading="lazy"
            onerror="
              this.style.display='none';
              this.nextElementSibling.style.display='block';
            "
          >

          <span
            style="
              display:none;
              font-size:42px;
            "
          >
            ${product.icon}
          </span>
        `;

      } else {

        imageHTML = `
          <span style="font-size:42px;">
            ${product.icon}
          </span>
        `;

      }


      return `
        <article class="card">

          <div class="product-img">
            ${imageHTML}
          </div>

          <span class="tag">
            ${escapeHTML(product.cat)}
          </span>

          <h3>
            ${escapeHTML(product.name)}
          </h3>

          ${
            product.description
              ? `
                <p style="
                  font-size:13px;
                  opacity:.75;
                ">
                  ${escapeHTML(product.description)}
                </p>
              `
              : ""
          }

          <div class="price">
            ${rupiah(product.price)}
          </div>

          <button
            class="buy"
            onclick="add(${Number(product.id)})"
          >
            Tambah ke Keranjang
          </button>

        </article>
      `;

    }).join("");


  updateReadyCount();

}


/* =====================================================
   HITUNG PRODUK READY
===================================================== */

function updateReadyCount() {

  const activeCount =
    document.getElementById(
      "activeCount"
    );

  if (activeCount) {

    activeCount.textContent =
      products.length;

  }


  const readyCount =
    document.getElementById(
      "readyCount"
    );


  if (readyCount) {

    const ready =
      products.filter(function(product) {

        return String(
          product.status
        )
          .toLowerCase()
          .trim() === "ready";

      }).length;


    readyCount.textContent =
      "(" + ready + " produk ready)";

  }

}


/* =====================================================
   SEARCH
===================================================== */

function searchProducts() {

  renderProducts();

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(value) {

  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* =====================================================
   CART MODAL
===================================================== */

function openCart() {

  renderCart();

  const modal =
    document.getElementById(
      "cartModal"
    );

  if (modal) {

    modal.classList.add("show");

  }

}


function closeCart() {

  const modal =
    document.getElementById(
      "cartModal"
    );

  if (modal) {

    modal.classList.remove("show");

  }

}


/* =====================================================
   RENDER CART
===================================================== */

function renderCart() {

  const element =
    document.getElementById(
      "cartItems"
    );

  const totalElement =
    document.getElementById(
      "cartTotal"
    );


  if (!element) return;


  if (!cart.length) {

    element.innerHTML =
      "<p style='color:#856571'>Keranjang masih kosong.</p>";


    if (totalElement) {

      totalElement.textContent =
        rupiah(0);

    }

    return;
  }


  let total = 0;


  element.innerHTML =
    cart.map(function(item) {

      const product =
        products.find(function(p) {

          return Number(p.id) ===
            Number(item.id);

        });


      if (!product) {

        return "";

      }


      const subtotal =
        product.price *
        item.qty;


      total += subtotal;


      return `
        <div class="cart-line">

          <div>
            <b>
              ${escapeHTML(product.name)}
            </b>

            <div>
              ${rupiah(product.price)}
              × ${item.qty}
            </div>
          </div>

          <div class="qty">

            <button
              onclick="qty(${product.id},-1)"
            >
              −
            </button>

            <b>
              ${item.qty}
            </b>

            <button
              onclick="qty(${product.id},1)"
            >
              +
            </button>

          </div>

        </div>
      `;

    }).join("");


  if (totalElement) {

    totalElement.textContent =
      rupiah(total);

  }

}


/* =====================================================
   CHECKOUT
===================================================== */

function openCheckout() {

  if (!cart.length) {

    showToast(
      "Keranjang masih kosong."
    );

    return;
  }


  closeCart();


  const total =
    cart.reduce(
      function(sum, item) {

        const product =
          products.find(function(p) {

            return Number(p.id) ===
              Number(item.id);

          });


        return sum +
          (
            product
              ? product.price * item.qty
              : 0
          );

      },
      0
    );


  const totalElement =
    document.getElementById(
      "checkoutTotal"
    );


  if (totalElement) {

    totalElement.textContent =
      rupiah(total);

  }


  const modal =
    document.getElementById(
      "checkoutModal"
    );


  if (modal) {

    modal.classList.add("show");

  }

}


function closeCheckout() {

  const modal =
    document.getElementById(
      "checkoutModal"
    );


  if (modal) {

    modal.classList.remove("show");

  }

}


/* =====================================================
   CREATE ORDER
===================================================== */

function createOrder() {

  const nameElement =
    document.getElementById(
      "customerName"
    );

  const phoneElement =
    document.getElementById(
      "customerPhone"
    );

  const noteElement =
    document.getElementById(
      "customerNote"
    );


  const name =
    nameElement
      ? nameElement.value.trim()
      : "";


  const phone =
    phoneElement
      ? phoneElement.value.trim()
      : "";


  const note =
    noteElement
      ? noteElement.value.trim()
      : "";


  if (!name || !phone) {

    showToast(
      "Nama dan nomor WhatsApp wajib diisi."
    );

    return;
  }


  let total = 0;


  const items =
    cart.map(function(item) {

      const product =
        products.find(function(p) {

          return Number(p.id) ===
            Number(item.id);

        });


      if (!product) return null;


      total +=
        product.price *
        item.qty;


      return {
        id: product.id,
        name: product.name,
        price: product.price,
        qty: item.qty
      };

    })
    .filter(Boolean);


  lastOrder = {

    id:
      "LM" +
      Date.now()
        .toString()
        .slice(-8),

    name: name,

    phone: phone,

    note: note,

    total: total,

    items: items,

    paymentStatus:
      "Menunggu verifikasi",

    paidAt: null

  };


  const invoice =
    document.getElementById(
      "invoiceNo"
    );


  if (invoice) {

    invoice.textContent =
      "Invoice #" +
      lastOrder.id;

  }


  const qrisTotal =
    document.getElementById(
      "qrisTotal"
    );


  if (qrisTotal) {

    qrisTotal.textContent =
      rupiah(total);

  }


  const qrisImage =
    document.getElementById(
      "qrisImage"
    );


  if (qrisImage) {

    qrisImage.src =
      CONFIG.qrisImage;

  }


  localStorage.setItem(
    "lilac_last_order",
    JSON.stringify(lastOrder)
  );


  closeCheckout();


  const modal =
    document.getElementById(
      "qrisModal"
    );


  if (modal) {

    modal.classList.add("show");

  }

}


/* =====================================================
   QRIS
===================================================== */

function closeQRIS() {

  const modal =
    document.getElementById(
      "qrisModal"
    );


  if (modal) {

    modal.classList.remove("show");

  }

}


/* =====================================================
   WHATSAPP
===================================================== */

function buildWhatsAppUrl() {

  if (!lastOrder) {

    showToast(
      "Data pesanan belum tersedia."
    );

    return null;

  }


  const lines =
    (lastOrder.items || [])
      .map(function(item) {

        return (
          item.name +
          " x" +
          item.qty +
          " = " +
          rupiah(
            item.price *
            item.qty
          )
        );

      })
      .join("\n");


  const message =
`HALO LILACMART 👋

Saya sudah melakukan pembayaran QRIS.

Invoice: ${lastOrder.id}
Nama: ${lastOrder.name}
WhatsApp: ${lastOrder.phone}

DETAIL PESANAN:
${lines}

TOTAL: ${rupiah(lastOrder.total)}

Status pembayaran: ${
  lastOrder.paymentStatus ||
  "Menunggu verifikasi"
}

Mohon diproses pesanannya. Terima kasih 🙏`;


  return (
    "https://wa.me/" +
    CONFIG.whatsapp +
    "?text=" +
    encodeURIComponent(message)
  );

}


async function confirmPaid() {

  if (!lastOrder) {

    showToast(
      "Data pesanan belum tersedia."
    );

    return;

  }


  lastOrder.paymentStatus =
    "Menunggu verifikasi";


  lastOrder.paidAt =
    new Date().toISOString();


  localStorage.setItem(
    "lilac_last_order",
    JSON.stringify(lastOrder)
  );


  /*
   * Simpan ke Supabase
   */
  try {

    if (
      window.LilacDB &&
      typeof window.LilacDB.saveOrder ===
        "function"
    ) {

      await window.LilacDB.saveOrder(
        lastOrder
      );

    } else {

      console.warn(
        "LilacDB belum tersedia."
      );

    }

  } catch (error) {

    console.error(
      "SUPABASE ERROR:",
      error
    );


    const code =
      error && error.code
        ? error.code
        : "";


    const message =
      error && error.message
        ? error.message
        : "Kesalahan tidak diketahui";


    showToast(
      "Supabase " +
      code +
      ": " +
      message
    );


    return;

  }


  const url =
    buildWhatsAppUrl();


  if (!url) return;


  window.location.href =
    url;

}


function sendWhatsApp() {

  const url =
    buildWhatsAppUrl();


  if (!url) return;


  window.location.href =
    url;

}


/*
 * Nama fungsi lama tetap dipertahankan
 * agar tombol HTML yang sudah ada tidak rusak.
 */

function konfirmasiDibayar() {

  return confirmPaid();

}


function kirimWhatsApp() {

  return sendWhatsApp();

}


/* =====================================================
   TOAST
===================================================== */

function showToast(text) {

  const toast =
    document.getElementById(
      "toast"
    );


  if (!toast) {

    alert(text);

    return;

  }


  toast.textContent =
    text;


  toast.classList.add(
    "show"
  );


  setTimeout(
    function() {

      toast.classList.remove(
        "show"
      );

    },
    2500
  );

}


/* =====================================================
   SCROLL
===================================================== */

function scrollToTop() {

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* =====================================================
   START
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  function() {

    console.log(
      "Lilacmart Store dimulai..."
    );


    updateCounts();


    loadProducts();

  }
);
