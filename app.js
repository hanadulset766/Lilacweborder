const STORE_KEY="lilacmart_products_v1";
const CART_KEY="lilacmart_cart_v1";
const WHATSAPP_NUMBER="6281234567890"; // GANTI dengan nomor WhatsApp toko, tanpa + dan tanpa spasi.

const defaultProducts=[
  {id:1,name:"Paket Premium",price:25000,image:"💎"},
  {id:2,name:"Voucher Digital",price:50000,image:"🎟️"},
  {id:3,name:"Produk Hemat",price:15000,image:"🛍️"},
  {id:4,name:"Paket Pro",price:75000,image:"🚀"}
];

function getProducts(){return JSON.parse(localStorage.getItem(STORE_KEY)||"null")||defaultProducts}
function saveProducts(p){localStorage.setItem(STORE_KEY,JSON.stringify(p))}
function getCart(){return JSON.parse(localStorage.getItem(CART_KEY)||"[]")}
function saveCart(c){localStorage.setItem(CART_KEY,JSON.stringify(c))}
function rupiah(n){return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n)}

function renderProducts(){
 const el=document.getElementById("products"); if(!el)return;
 const products=getProducts();
 document.getElementById("productCount").textContent=`${products.length} produk`;
 el.innerHTML=products.map(p=>`<article class="card">
   <div class="product-img">${escapeHtml(p.image||"🛍️")}</div>
   <h3>${escapeHtml(p.name)}</h3><div class="price">${rupiah(p.price)}</div>
   <button class="btn primary full" style="margin-top:12px" onclick="addToCart(${p.id})">Tambah</button>
 </article>`).join("");
}
function addToCart(id){
 const c=getCart(), item=c.find(x=>x.id===id);
 if(item)item.qty++; else c.push({id,qty:1});
 saveCart(c); renderCart();
}
function changeQty(id,delta){
 const c=getCart().map(x=>x.id===id?{...x,qty:x.qty+delta}:x).filter(x=>x.qty>0);
 saveCart(c);renderCart();
}
function clearCart(){saveCart([]);renderCart()}
function renderCart(){
 const el=document.getElementById("cart"); if(!el)return;
 const products=getProducts(), cart=getCart();
 if(!cart.length){el.innerHTML="<p class='muted'>Keranjang masih kosong.</p>";document.getElementById("total").textContent=rupiah(0);return}
 let total=0;
 el.innerHTML=cart.map(i=>{
   const p=products.find(x=>x.id===i.id); if(!p)return "";
   const sub=p.price*i.qty;total+=sub;
   return `<div class="cart-row"><div><b>${escapeHtml(p.name)}</b><div class="muted">${rupiah(p.price)} × ${i.qty}</div></div>
   <div class="qty"><button onclick="changeQty(${i.id},-1)">−</button><b>${i.qty}</b><button onclick="changeQty(${i.id},1)">+</button></div></div>`
 }).join("");
 document.getElementById("total").textContent=rupiah(total);
}
function checkoutWhatsApp(){
 const name=document.getElementById("customerName").value.trim();
 const phone=document.getElementById("customerPhone").value.trim();
 const note=document.getElementById("customerNote").value.trim();
 const cart=getCart(),products=getProducts();
 if(!cart.length)return alert("Keranjang masih kosong.");
 if(!name||!phone)return alert("Isi nama dan nomor WhatsApp terlebih dahulu.");
 let total=0, lines=cart.map(i=>{const p=products.find(x=>x.id===i.id);const sub=p.price*i.qty;total+=sub;return `- ${p.name} x${i.qty} = ${rupiah(sub)}`}).join("\n");
 const text=`Halo Lilacmart, saya ingin order:\n\n${lines}\n\nTotal: ${rupiah(total)}\nNama: ${name}\nNo. WhatsApp: ${phone}${note?`\nCatatan: ${note}`:""}`;
 window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`,"_blank");
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
document.addEventListener("DOMContentLoaded",()=>{renderProducts();renderCart()});
