const fallbackProducts = [
  ["YouTube Premium","Langganan","Rp 12.000","3","▶️"],
  ["Viu Premium","Streaming","Rp 10.000","6","◉"],
  ["HboMax Premium","Streaming","Rp 20.000","2","HBO"],
  ["LokLok Premium","Streaming","Rp 26.000","3","🎬"],
  ["Netflix Premium","Streaming","Rp 28.500","3","N"],
  ["Disney+ Premium","Streaming","Rp 27.000","3","✦"],
  ["Canva Premium","Editing","Rp 10.000","4","Canva"],
  ["Meitu+ Premium","Editing","Rp 20.000","3","M"],
  ["Wink+ Premium","Editing","Rp 20.000","3","✦"],
  ["Picsart Premium","Editing","Rp 15.000","4","P"],
  ["iQIYI Premium","Streaming","Rp 23.000","3","iQ"],
  ["Spotify Premium","Music","Rp 15.000","3","♫"],
  ["CapCut Pro","Editing","Rp 18.000","3","✂"],
  ["Vidio Platinum","Streaming","Rp 22.000","3","V"],
  ["ChatGPT Plus","Other","Rp 20.000","2","AI"],
  ["Disney+ Hotstar","Streaming","Rp 25.000","3","✦"],
  ["YouTube Music","Music","Rp 18.000","3","♫"],
  ["Grammarly Premium","Other","Rp 20.000","2","G"],
  ["Prime Video","Streaming","Rp 18.000","3","▶"],
  ["Apple Music","Music","Rp 20.000","3","♫"],
  ["Alight Motion","Editing","Rp 15.000","3","A"],
  ["Picsart Gold","Editing","Rp 18.000","3","P"],
  ["Gemini AI","Other","Rp 25.000","2","✦"],
  ["Canva Pro Lifetime","Editing","Rp 30.000","1","Canva"],
  ["Roblox Premium","Game","Rp 20.000","3","R"]
];

let products = [];
let visibleProducts = [];

let cart = JSON.parse(localStorage.getItem("lilac_cart") || "[]");

const productsEl = document.getElementById("products");
const search = document.getElementById("search");

function rupiah(value) {
  return "Rp " + Number(value || 0).toLocaleString("id-ID");
}

function normalizeCategory(category) {
  const c = String(category || "Other").trim();

  if (c.toLowerCase() === "game") return "Game";
  if (c.toLowerCase() === "lainnya") return "Other";
  if (c.toLowerCase() === "ai") return "Other";

  return c;
}

function convertSupabaseProduct(p) {
  return {
    id: p.id,
    name: p.name || "Produk",
    category: normalizeCategory(p.category),
    price: rupiah(p.price),
    stock: Number(p.stock || 0),
    icon: p.icon || "🛍️",
    image: p.image_url || "",
    description: p.description || "",
    status: p.status || "Ready",
    active: p.active !== false
  };
}

function convertFallbackProduct(p) {
  return {
    id: null,
    name: p[0],
    category: normalizeCategory(p[1]),
    price: p[2],
    stock: Number(p[3] || 0),
    icon: p[4],
    image: "",
    description: "",
    status: "Ready"
  };
}

async function loadProducts() {
  try {
    if (
      window.supabase &&
      window.LILAC_SUPABASE_URL &&
      window.LILAC_SUPABASE_KEY
    ) {
      const db = window.supabase.createClient(
        window.LILAC_SUPABASE_URL,
        window.LILAC_SUPABASE_KEY
      );

      const { data, error } = await db
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data) && data.length) {
        const online = data.map(convertSupabaseProduct);

        products = online;
      }
    }
  } catch (error) {
    console.log("Supabase tidak dapat dimuat, memakai produk cadangan.", error);
  }

  render();
}

function render(cat = "Semua", q = "") {
  productsEl.innerHTML = "";

  const keyword = String(q || "").toLowerCase();

  visibleProducts = products.filter(p => {
    const categoryMatch =
      cat === "Semua" || normalizeCategory(p.category) === normalizeCategory(cat);

    const searchMatch =
      p.name.toLowerCase().includes(keyword);

    const statusMatch =
      String(p.status || "").toLowerCase() !== "habis";
const activeMatch = p.active !== false;
    return categoryMatch && searchMatch && statusMatch;
  });

  visibleProducts.forEach((p, i) => {
    const c = document.createElement("article");
    c.className = "card";

    const imageHtml = p.image
      ? `<img src="${p.image}" alt="${p.name}" style="width:58px;height:58px;object-fit:cover;border-radius:12px;">`
      : `<div class="iconbox">${p.icon}</div>`;

    c.innerHTML = `
      <span class="tag">▣ ${p.category}</span>
      <span class="heart">♥</span>

      <div class="thumb">
        ${imageHtml}
      </div>

      <h3>${p.name}</h3>

      <p class="price">Mulai ${p.price}</p>

      <div class="variant">
        Tersedia (${p.stock} stok)
      </div>

      <button class="buy" data-i="${i}">
        Beli Sekarang　✦
      </button>
    `;

    productsEl.appendChild(c);
  });
}

function updateCart() {
  document.getElementById("cartCount").textContent = cart.length;
  document.getElementById("cartCountTop").textContent = cart.length;

  localStorage.setItem(
    "lilac_cart",
    JSON.stringify(cart)
  );
}

document.querySelectorAll(".cat").forEach(button => {
  button.onclick = () => {
    document
      .querySelectorAll(".cat")
      .forEach(x => x.classList.remove("active"));

    button.classList.add("active");

    render(
      button.dataset.cat,
      search.value
    );
  };
});

search.oninput = () => {
  const active = document.querySelector(".cat.active");

  render(
    active?.dataset.cat || "Semua",
    search.value
  );
};

productsEl.onclick = event => {
  const button = event.target.closest(".buy");

  if (!button) return;

  const product = visibleProducts[Number(button.dataset.i)];

  if (!product) return;

  cart.push([
    product.name,
    product.category,
    product.price,
    product.stock,
    product.icon
  ]);

  updateCart();
  openCart();
};

function openCart() {
  document.getElementById("modalContent").innerHTML = `
    <h2>🛍️ Keranjang (${cart.length})</h2>

    ${
      cart.length
        ? cart.map((p, i) => `
            <p>
              <b>${i + 1}. ${p[0]}</b> — ${p[2]}
            </p>
          `).join("")
        : `<p>Keranjang masih kosong.</p>`
    }

    ${
      cart.length
        ? `<button class="action" onclick="checkout()">
             Lanjut Checkout
           </button>`
        : ""
    }
  `;

  document
    .getElementById("modal")
    .classList.add("show");
}

function checkout() {
  const text = cart
    .map(p => `- ${p[0]} (${p[2]})`)
    .join("%0A");

  const msg =
    `Halo Lilacmart, saya ingin order:%0A` +
    `${text}%0A%0A` +
    `Total item: ${cart.length}`;

  window.open(
    "https://wa.me/628xxxxxxxxxx?text=" + msg,
    "_blank"
  );
}

document.getElementById("cartFloat").onclick = openCart;
document.getElementById("cartTop").onclick = openCart;

document.getElementById("close").onclick = () => {
  document
    .getElementById("modal")
    .classList.remove("show");
};

document.getElementById("modal").onclick = event => {
  if (event.target.id === "modal") {
    event.currentTarget.classList.remove("show");
  }
};

loadProducts();
updateCart();
