const products = [
  {id:1,name:"Produk Lilac 1",price:15000,emoji:"🎀"},
  {id:2,name:"Produk Lilac 2",price:25000,emoji:"🛍️"},
  {id:3,name:"Produk Lilac 3",price:35000,emoji:"💜"},
  {id:4,name:"Produk Lilac 4",price:50000,emoji:"🎁"}
];

let cart = JSON.parse(localStorage.getItem("lilacmart_cart") || "[]");
let currentOrder = null;

const rupiah = n => new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n);

function renderProducts(){
  const grid=document.getElementById("productGrid");
  grid.innerHTML=products.map(p=>`
    <article class="product">
      <div class="emoji">${p.emoji}</div>
      <h3>${p.name}</h3>
      <div class="price">${rupiah(p.price)}</div>
      <button class="primary" onclick="addToCart(${p.id})">Tambah</button>
    </article>`).join("");
}
function addToCart(id){
  const item=cart.find(x=>x.id===id);
  if(item)item.qty++;
  else cart.push({id,qty:1});
  saveCart(); renderCart(); updateCount();
}
function saveCart(){localStorage.setItem("lilacmart_cart",JSON.stringify(cart))}
function updateCount(){document.getElementById("cartCount").textContent=cart.reduce((s,x)=>s+x.qty,0)}
function total(){
  return cart.reduce((s,x)=>{const p=products.find(p=>p.id===x.id);return s+p.price*x.qty},0);
}
function renderCart(){
  const box=document.getElementById("cartItems");
  if(!cart.length){box.innerHTML="<p>Keranjang masih kosong.</p>";}
  else box.innerHTML=cart.map(x=>{
    const p=products.find(p=>p.id===x.id);
    return `<div class="cart-row"><span>${p.name}<br>${rupiah(p.price)} × ${x.qty}</span>
      <span class="qty"><button onclick="changeQty(${p.id},-1)">−</button>
      <button onclick="changeQty(${p.id},1)">+</button></span></div>`;
  }).join("");
  document.getElementById("cartTotal").textContent=rupiah(total());
}
function changeQty(id,d){
  const x=cart.find(x=>x.id===id); if(!x)return;
  x.qty+=d;if(x.qty<=0)cart=cart.filter(x=>x.id!==id);
  saveCart();renderCart();updateCount();
}
function openModal(id){document.getElementById(id).classList.remove("hidden")}
function closeModals(){document.querySelectorAll(".modal").forEach(x=>x.classList.add("hidden"))}

document.getElementById("cartBtn").onclick=()=>{renderCart();openModal("cartModal")};
document.getElementById("checkoutBtn").onclick=()=>{
  if(!cart.length)return alert("Keranjang masih kosong.");
  closeModals();openModal("checkoutModal");
};
document.querySelectorAll("[data-close]").forEach(b=>b.onclick=closeModals);

document.getElementById("orderForm").onsubmit=e=>{
  e.preventDefault();
  currentOrder={
    id:"LM-"+Date.now(),
    name:document.getElementById("customerName").value.trim(),
    phone:document.getElementById("customerPhone").value.trim(),
    address:document.getElementById("customerAddress").value.trim(),
    items:cart.map(x=>({...x})),
    total:total(),
    createdAt:new Date().toISOString(),
    status:"Menunggu pembayaran"
  };
  document.getElementById("paymentTotal").textContent=rupiah(currentOrder.total);
  closeModals();openModal("paymentModal");
};

document.getElementById("confirmPaymentBtn").onclick=async()=>{
  if(!currentOrder)return;
  currentOrder.status="Pembayaran dikonfirmasi oleh pelanggan";
  await saveOrder(currentOrder);
  document.getElementById("orderMessage").textContent=
    `Nomor pesanan: ${currentOrder.id}. Simpan nomor ini untuk pengecekan pesanan.`;
  cart=[];saveCart();updateCount();closeModals();openModal("successModal");
};

renderProducts();renderCart();updateCount();
