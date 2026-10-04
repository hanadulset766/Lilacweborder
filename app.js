const CONFIG={
  storeName:"Lilacmart Store",
  whatsapp:"6289513348955", // GANTI nomor WhatsApp toko
  qrisImage:"qris.jpg" // GANTI dengan file QRIS asli, mis. qris.png
};

const products=[
 {id:1,name:"Spotify Premium",cat:"Langganan",price:15000,icon:"🎵"},
 {id:2,name:"Canva Pro",cat:"Langganan",price:12000,icon:"🎨"},
 {id:3,name:"Netflix Premium",cat:"Streaming",price:25000,icon:"🎬"},
 {id:4,name:"Disney+ Hotstar",cat:"Streaming",price:20000,icon:"🏰"},
 {id:5,name:"ChatGPT Plus",cat:"AI",price:35000,icon:"🤖"},
 {id:6,name:"YouTube Premium",cat:"Streaming",price:18000,icon:"▶️"},
 {id:7,name:"CapCut Pro",cat:"Langganan",price:15000,icon:"✂️"},
 {id:8,name:"Viu Premium",cat:"Streaming",price:12000,icon:"🌷"},
 {id:9,name:"Alight Motion Pro",cat:"Langganan",price:10000,icon:"✨"},
 {id:10,name:"Gemini Advanced",cat:"AI",price:30000,icon:"💎"},
 {id:11,name:"Microsoft 365",cat:"Langganan",price:22000,icon:"📘"},
 {id:12,name:"Roblox Voucher",cat:"Game",price:25000,icon:"🎮"}
];
let category="Semua",cart=JSON.parse(localStorage.getItem("lilac_cart")||"[]"),lastOrder=null;

function rupiah(n){return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n)}
function save(){localStorage.setItem("lilac_cart",JSON.stringify(cart));updateCounts()}
function updateCounts(){let n=cart.reduce((a,b)=>a+b.qty,0);document.querySelectorAll("#cartCount,#bottomCount").forEach(x=>x.textContent=n)}
function setCategory(c,btn){category=c;document.querySelectorAll(".chip").forEach(x=>x.classList.remove("active"));btn.classList.add("active");renderProducts()}
function renderProducts(){
 const q=(document.getElementById("search")?.value||"").toLowerCase();
 const list=products.filter(p=>(category==="Semua"||p.cat===category)&&(p.name.toLowerCase().includes(q)));
 document.getElementById("activeCount").textContent=products.length;
 document.getElementById("readyCount").textContent=`(${products.length} produk ready)`;
 document.getElementById("products").innerHTML=list.map(p=>`<article class="card">
   <div class="product-img">${p.icon}</div><div class="card-body">
   <span class="tag">${p.cat}</span><h3>${p.name}</h3><div class="price">${rupiah(p.price)}</div>
   <button class="buy" onclick="add(${p.id})">Tambah ke Keranjang</button></div></article>`).join("");
}
function add(id){let x=cart.find(i=>i.id===id);x?x.qty++:cart.push({id,qty:1});save();showToast("Produk ditambahkan ke keranjang 💗")}
function openCart(){renderCart();document.getElementById("cartModal").classList.add("show")}
function closeCart(){document.getElementById("cartModal").classList.remove("show")}
function renderCart(){
 let total=0;
 const el=document.getElementById("cartItems");
 if(!cart.length){el.innerHTML="<p style='color:#856571'>Keranjang masih kosong.</p>";document.getElementById("cartTotal").textContent=rupiah(0);return}
 el.innerHTML=cart.map(i=>{let p=products.find(x=>x.id===i.id),sub=p.price*i.qty;total+=sub;return `<div class="cart-line"><div><b>${p.name}</b><div>${rupiah(p.price)} × ${i.qty}</div></div><div class="qty"><button onclick="qty(${p.id},-1)">−</button><b>${i.qty}</b><button onclick="qty(${p.id},1)">+</button></div></div>`}).join("");
 document.getElementById("cartTotal").textContent=rupiah(total);
}
function qty(id,d){let x=cart.find(i=>i.id===id);if(!x)return;x.qty+=d;if(x.qty<=0)cart=cart.filter(i=>i.id!==id);save();renderCart()}
function openCheckout(){if(!cart.length)return showToast("Keranjang masih kosong.");closeCart();let total=cart.reduce((s,i)=>s+products.find(p=>p.id===i.id).price*i.qty,0);document.getElementById("checkoutTotal").textContent=rupiah(total);document.getElementById("checkoutModal").classList.add("show")}
function closeCheckout(){document.getElementById("checkoutModal").classList.remove("show")}
function createOrder(){
 const name=document.getElementById("customerName").value.trim(),phone=document.getElementById("customerPhone").value.trim(),note=document.getElementById("customerNote").value.trim();
 if(!name||!phone)return showToast("Nama dan nomor WhatsApp wajib diisi.");
 const total=cart.reduce((s,i)=>s+products.find(p=>p.id===i.id).price*i.qty,0);
 lastOrder={id:"LM"+Date.now().toString().slice(-8),name,phone,note,total,items:cart.map(i=>({...i,name:products.find(p=>p.id===i.id).name,price:products.find(p=>p.id===i.id).price}))};
 document.getElementById("invoiceNo").textContent="Invoice #"+lastOrder.id;
 document.getElementById("qrisTotal").textContent=rupiah(total);
 document.getElementById("qrisImage").src=CONFIG.qrisImage;
 closeCheckout();document.getElementById("qrisModal").classList.add("show");
}
function closeQRIS(){
  document.getElementById("qrisModal").classList.remove("show");
}

function buildWhatsAppUrl(){
  if(!lastOrder){
    showToast("Data pesanan belum tersedia.");
    return null;
  }

  const lines = (lastOrder.items || []).map(function(item){
    return `${item.name} x${item.qty} = ${rupiah(item.price * item.qty)}`;
  }).join("\n");

  const msg = `HALO LILACMART 👋

Saya sudah melakukan pembayaran QRIS.

Invoice: ${lastOrder.id}
Nama: ${lastOrder.name}
WhatsApp: ${lastOrder.phone}

DETAIL PESANAN:
${lines}

TOTAL: ${rupiah(lastOrder.total)}

Status pembayaran: ${lastOrder.paymentStatus || "Menunggu verifikasi"}

Mohon diproses pesanannya. Terima kasih 🙏`;

  return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
}

async function confirmPaid(){
  if(!lastOrder){
    showToast("Data pesanan belum tersedia.");
    return;
  }

  lastOrder.paymentStatus = "Menunggu verifikasi";
  lastOrder.paidAt = new Date().toISOString();

  localStorage.setItem(
    "lilac_last_order",
    JSON.stringify(lastOrder)
  );

  try {
    await LilacDB.saveOrder(lastOrder);
  } catch (err) {
    showToast("Order gagal disimpan ke server. Coba lagi.");
    console.error(err);
    return;
  }

  const url = buildWhatsAppUrl();

  if(!url) return;

  window.location.href = url;
}

function sendWhatsApp(){
  const url = buildWhatsAppUrl();

  if(!url) return;

  window.location.href = url;
}

function konfirmasiDibayar(){
  return confirmPaid();
}

function kirimWhatsApp(){
  return sendWhatsApp();
}

function closeQRIS(){
  const qrModal = document.getElementById("qrisModal");

  if(qrModal){
    qrModal.classList.remove("show");
  }
}


function showToast(text){
  const toast = document.getElementById("toast");

  if(!toast){
    alert(text);
    return;
  }

  toast.textContent = text;
  toast.classList.add("show");

  setTimeout(function(){
    toast.classList.remove("show");
  }, 2500);
}


function scrollToTop(){
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


document.addEventListener("DOMContentLoaded", function(){
  renderProducts();
  updateCounts();
});
