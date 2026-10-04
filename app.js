const CONFIG={
  storeName:"Lilacmart Store",
  whatsapp:"6289513348955", // GANTI nomor WhatsApp toko
  qrisImage:"qris.jpg" // GANTI dengan file QRIS asli, mis. qris.png
};

const products=[
let products = [];

const SHEET_CSV_URL =
"https://docs.google.com/spreadsheets/d/1OGqnNp5BYmE252a59vPxz9ooyCukkfqfa3lqz49jrNc/gviz/tq?tqx=out:csv&sheet=Katalog";

function parseCSV(text){
  const rows=[];
  let row=[];
  let cell="";
  let quoted=false;

  for(let i=0;i<text.length;i++){
    const c=text[i];
    const next=text[i+1];

    if(c === '"' && quoted && next === '"'){
      cell+='"';
      i++;
    }else if(c === '"'){
      quoted=!quoted;
    }else if(c === "," && !quoted){
      row.push(cell);
      cell="";
    }else if((c === "\n" || c === "\r") && !quoted){
      if(c === "\r" && next === "\n") i++;
      row.push(cell);
      if(row.some(x=>x.trim()!=="")) rows.push(row);
      row=[];
      cell="";
    }else{
      cell+=c;
    }
  }

  if(cell!=="" || row.length){
    row.push(cell);
    if(row.some(x=>x.trim()!=="")) rows.push(row);
  }

  return rows;
}

async function loadProducts(){
  try{
    const response = await fetch(SHEET_CSV_URL, {
      cache:"no-store"
    });

    if(!response.ok){
      throw new Error("Gagal mengambil Google Sheets");
    }

    const csv = await response.text();
    const rows = parseCSV(csv);

    if(rows.length < 2){
      throw new Error("Data katalog kosong");
    }

    const headers = rows[0].map(x=>x.trim());

    products = rows.slice(1).map(row=>{
      const data={};

      headers.forEach((header,index)=>{
        data[header]=
          row[index] !== undefined
          ? row[index].trim()
          : "";
      });

      return {
        id:Number(data["ID"]) || 0,
        name:data["Nama Produk"] || "Produk",
        cat:data["Kategori"] || "Lainnya",
        price:Number(
          String(data["Harga"] || "0")
            .replace(/[^\d]/g,"")
        ) || 0,
        icon:data["Icon"] || "🛍️",
        image:data["URL Gambar"] || "",
        description:data["Deskripsi"] || "",
        status:data["Status"] || "Ready"
      };
    }).filter(p=>p.id && p.name);

    renderProducts();

    const ready = products.filter(
      p => p.status.toLowerCase() === "ready"
    ).length;

    const readyEl=document.getElementById("readyCount");
    if(readyEl){
      readyEl.textContent=`(${ready} produk ready)`;
    }

    const activeEl=document.getElementById("activeCount");
    if(activeEl){
      activeEl.textContent=products.length;
    }

  }catch(error){
    console.error("Gagal memuat katalog:",error);

    const box=document.getElementById("products");

    if(box){
      box.innerHTML=`
        <div style="padding:20px;text-align:center">
          <h3>⚠️ Katalog belum dapat dimuat</h3>
          <p>Periksa koneksi internet atau Google Sheets.</p>
        </div>
      `;
    }
  }
}
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
   <div class="product-img">
  ${
    p.image
      ? `<img src="${p.image}" alt="${p.name}" loading="lazy"
           onerror="this.style.display='none';this.nextElementSibling.style.display='block'">
         <span style="display:none">${p.icon}</span>`
      : `<span>${p.icon}</span>`
  }
</div>
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
  console.error("SUPABASE ERROR:", err);

  const code = err && err.code ? err.code : "";
  const message = err && err.message ? err.message : "Kesalahan tidak diketahui";
  const hint = err && err.hint ? err.hint : "";

  showToast(
    "Supabase " + code + ": " + message
  );

  if (hint) {
    console.error("Supabase HINT:", hint);
  }

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
  loadProducts();
  updateCounts();
});
