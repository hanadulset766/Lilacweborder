const STORE_KEY="lilacmart_products_v1";
const ORDERS_KEY="lilacmart_orders_v1";
const ADMIN_USER="admin";
const ADMIN_PASS="Admin123!";
const SESSION_KEY="lilacmart_admin_session";

const defaultProducts=[
  {id:1,name:"Paket Premium",price:25000,image:"💎"},
  {id:2,name:"Voucher Digital",price:50000,image:"🎟️"},
  {id:3,name:"Produk Hemat",price:15000,image:"🛍️"},
  {id:4,name:"Paket Pro",price:75000,image:"🚀"}
];

function getProducts(){return JSON.parse(localStorage.getItem(STORE_KEY)||"null")||defaultProducts}
function saveProducts(p){localStorage.setItem(STORE_KEY,JSON.stringify(p))}
function rupiah(n){return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n)}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}

function showDashboard(){
 document.getElementById("loginView").classList.add("hidden");
 document.getElementById("dashboard").classList.remove("hidden");
 renderAdmin();
}
function renderAdmin(){
 const products=getProducts();
 document.getElementById("statProducts").textContent=products.length;
 document.getElementById("statOrders").textContent=JSON.parse(localStorage.getItem(ORDERS_KEY)||"[]").length;
 document.getElementById("adminProducts").innerHTML=products.map(p=>`
 <div class="admin-product"><div><b>${escapeHtml(p.image)} ${escapeHtml(p.name)}</b><div class="muted">${rupiah(p.price)}</div></div>
 <button class="btn danger" onclick="deleteProduct(${p.id})">Hapus</button></div>`).join("");
}
function deleteProduct(id){
 if(!confirm("Hapus produk ini?"))return;
 saveProducts(getProducts().filter(p=>p.id!==id));renderAdmin();
}
function logoutAdmin(){sessionStorage.removeItem(SESSION_KEY);location.reload()}
document.addEventListener("DOMContentLoaded",()=>{
 if(sessionStorage.getItem(SESSION_KEY)==="1")showDashboard();
 document.getElementById("loginForm").addEventListener("submit",e=>{
   e.preventDefault();
   const u=document.getElementById("username").value.trim(),p=document.getElementById("password").value;
   if(u===ADMIN_USER&&p===ADMIN_PASS){sessionStorage.setItem(SESSION_KEY,"1");showDashboard()}
   else document.getElementById("loginError").textContent="Username atau password salah.";
 });
 document.getElementById("productForm").addEventListener("submit",e=>{
   e.preventDefault();
   const products=getProducts();
   products.push({id:Date.now(),name:document.getElementById("pName").value.trim(),price:Number(document.getElementById("pPrice").value),image:document.getElementById("pImage").value.trim()||"🛍️"});
   saveProducts(products);e.target.reset();document.getElementById("pImage").value="🛍️";renderAdmin();
 });
});
