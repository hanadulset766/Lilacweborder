const initialProducts=[
{id:1,name:"YouTube Premium",cat:"Langganan",price:12000,variants:3,icon:"▶️"},
{id:2,name:"Viu Premium",cat:"Streaming",price:10000,variants:6,icon:"◉"},
{id:3,name:"HboMax Premium",cat:"Streaming",price:20000,variants:2,icon:"HBO"},
{id:4,name:"LokLok Premium",cat:"Streaming",price:26000,variants:3,icon:"🎬"},
{id:5,name:"Netflix Premium",cat:"Streaming",price:28500,variants:3,icon:"N"},
{id:6,name:"Disney+ Premium",cat:"Streaming",price:27000,variants:3,icon:"✦"},
{id:7,name:"Canva Premium",cat:"Editing",price:10000,variants:4,icon:"Canva"},
{id:8,name:"Meitu+ Premium",cat:"Editing",price:20000,variants:3,icon:"M"},
{id:9,name:"Wink+ Premium",cat:"Editing",price:20000,variants:3,icon:"✦"},
{id:10,name:"Picsart Premium",cat:"Editing",price:15000,variants:4,icon:"P"},
{id:11,name:"iQIYI Premium",cat:"Streaming",price:23000,variants:3,icon:"iQ"},
{id:12,name:"Spotify Premium",cat:"Music",price:15000,variants:3,icon:"♫"},
{id:13,name:"CapCut Pro",cat:"Editing",price:18000,variants:3,icon:"✂"},
{id:14,name:"Vidio Platinum",cat:"Streaming",price:22000,variants:3,icon:"V"},
{id:15,name:"ChatGPT Plus",cat:"Other",price:25000,variants:2,icon:"AI"},
{id:16,name:"YouTube Music",cat:"Music",price:17000,variants:2,icon:"♫"},
{id:17,name:"Prime Video",cat:"Streaming",price:23000,variants:3,icon:"▶"},
{id:18,name:"Alight Motion",cat:"Editing",price:18000,variants:3,icon:"A"},
{id:19,name:"Filmora",cat:"Editing",price:20000,variants:3,icon:"F"},
{id:20,name:"Disney+ Hotstar",cat:"Streaming",price:27000,variants:3,icon:"✦"},
{id:21,name:"Claude Pro",cat:"Other",price:30000,variants:2,icon:"AI"},
{id:22,name:"Gemini Advanced",cat:"Other",price:28000,variants:2,icon:"✦"},
{id:23,name:"Tidal Premium",cat:"Music",price:18000,variants:3,icon:"♫"},
{id:24,name:"Mobile Legends",cat:"game",price:20000,variants:4,icon:"🎮"},
{id:25,name:"Canva Pro Lifetime",cat:"Editing",price:30000,variants:2,icon:"Canva"}];
let products=JSON.parse(localStorage.getItem("lm_products")||"null")||initialProducts;
let cart=JSON.parse(localStorage.getItem("lm_cart")||"[]"), category="Semua", pending=null;
const money=n=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n);
const save=()=>{localStorage.setItem("lm_products",JSON.stringify(products));localStorage.setItem("lm_cart",JSON.stringify(cart))};
function renderCats(){let cats=["Semua","Langganan","Streaming","Editing","Music","Other","game"];categories.innerHTML=cats.map(c=>`<button class="${c===category?"active":""}" onclick="setCat('${c}')">✦ ${c}</button>`).join("")}
function setCat(c){category=c;renderCats();renderProducts()}
function renderProducts(){let q=(search.value||"").toLowerCase();let list=products.filter(p=>(category==="Semua"||p.cat===category)&&p.name.toLowerCase().includes(q));productGrid.innerHTML=list.map(p=>`<article class="card"><span class="tag">▣ ${p.cat}</span><button class="heart">♥</button><div class="logo"><div class="logo-icon">${p.icon}</div></div><h3>${p.name}</h3><div class="price">Mulai ${money(p.price)}</div><div class="available">Tersedia (${p.variants} varian)</div><button class="buy" onclick="add(${p.id})">Beli Sekarang　✦</button></article>`).join("");activeCount.textContent=products.length;readyCount.textContent=`(${products.length} produk ready)`}
function add(id){let x=cart.find(i=>i.id===id);x?x.qty++:cart.push({id,qty:1});save();renderCart();open("cartModal")}
function renderCart(){let n=cart.reduce((s,i)=>s+i.qty,0);cartCount.textContent=n;cartCount2.textContent=n;cartItems.innerHTML=cart.length?cart.map(i=>{let p=products.find(x=>x.id===i.id);return `<div class="cartrow"><span>${p.name}<br><b>${money(p.price*i.qty)}</b></span><span class="qty"><button onclick="qty(${p.id},-1)">−</button> ${i.qty} <button onclick="qty(${p.id},1)">+</button></span></div>`}).join(""):"<p>Keranjang masih kosong.</p>";cartTotal.textContent=money(cart.reduce((s,i)=>s+products.find(p=>p.id===i.id).price*i.qty,0))}
function qty(id,d){let x=cart.find(i=>i.id===id);x.qty+=d;if(x.qty<1)cart=cart.filter(i=>i.id!==id);save();renderCart()}
function open(id){document.getElementById(id).classList.remove("hidden")}function closeAll(){document.querySelectorAll(".modal").forEach(x=>x.classList.add("hidden"))}
document.querySelectorAll("[data-close]").forEach(b=>b.onclick=closeAll);openCart.onclick=openCart2.onclick=()=>{renderCart();open("cartModal")};checkout.onclick=()=>{if(!cart.length)return alert("Keranjang masih kosong.");closeAll();open("checkoutModal")};
search.oninput=renderProducts;
document.querySelectorAll("[data-scroll]").forEach(b=>b.onclick=()=>document.getElementById(b.dataset.scroll).scrollIntoView());
checkoutForm.onsubmit=e=>{e.preventDefault();let total=cart.reduce((s,i)=>s+products.find(p=>p.id===i.id).price*i.qty,0);pending={id:"LM"+Date.now().toString().slice(-8),name:name.value,phone:phone.value,note:note.value,total};payTotal.textContent=money(total);closeAll();open("paymentModal")};
paid.onclick=async()=>{await saveOrder(pending);orderResult.textContent=`Nomor pesanan ${pending.id}. Silakan simpan nomor ini untuk konfirmasi melalui WhatsApp.`;cart=[];save();renderCart();closeAll();open("successModal")};
async function saveOrder(o){let orders=JSON.parse(localStorage.getItem("lm_orders")||"[]");orders.push({...o,time:new Date().toISOString()});localStorage.setItem("lm_orders",JSON.stringify(orders));if(window.LilacDB)await window.LilacDB.save(o)}
function renderAdmin(){adminProducts.innerHTML=products.map(p=>`<div class="adminrow"><b>${p.name}</b> — ${money(p.price)} <button onclick="delProduct(${p.id})">hapus</button></div>`).join("")}
function delProduct(id){products=products.filter(p=>p.id!==id);save();renderProducts();renderAdmin()}
resetProducts.onclick=()=>{products=initialProducts;save();renderProducts();renderAdmin()}
document.addEventListener("keydown",e=>{if(e.ctrlKey&&e.shiftKey&&e.key.toLowerCase()==="a"){open("adminModal");renderAdmin()}});
renderCats();renderProducts();renderCart();if(new URLSearchParams(location.search).get("admin")==="1"){open("adminModal");renderAdmin()}