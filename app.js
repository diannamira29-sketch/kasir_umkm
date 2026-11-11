const $ = (s) => document.querySelector(s);
const money = n => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(n)||0);
const today = () => new Date().toISOString().slice(0,10);
const seed = {
  categories:[
    {id:1,name:'Minuman',description:'Aneka minuman'},
    {id:2,name:'Makanan',description:'Makanan dan camilan'}
  ],
  products:[
    {id:1,code:'P001',name:'Teh Manis',categoryId:1,price:5000,stock:50},
    {id:2,code:'P002',name:'Air Mineral',categoryId:1,price:3000,stock:100},
    {id:3,code:'P003',name:'Roti Coklat',categoryId:2,price:8000,stock:30},
    {id:4,code:'P004',name:'Snack',categoryId:2,price:5000,stock:5}
  ],
  suppliers:[{id:1,name:'UD Sejahtera',phone:'081234567890',address:'Pidie'}],
  orders:[],transactions:[]
};
const DB_KEY = `kasir_umkm_db_user_${window.KASIR_USER_ID || 'local'}`;
let db = loadDB(), cart = [], reportRows = [];
function loadDB(){try{return JSON.parse(localStorage.getItem(DB_KEY))||structuredClone(seed)}catch{return structuredClone(seed)}}
function saveDB(){localStorage.setItem(DB_KEY,JSON.stringify(db))}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function categoryName(id){return db.categories.find(c=>c.id===Number(id))?.name||'-'}
function showPage(name){
  document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id===`page-${name}`));
  document.querySelectorAll('.nav-link[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===name));
  const titles={dashboard:'Dashboard',products:'Produk',categories:'Kategori',transactions:'Kasir / Transaksi',stock:'Stok & Supplier',reports:'Laporan Penjualan',settings:'Pengaturan'};
  $('#topTitle').textContent=titles[name]||'Dashboard';
  $('#sidebar').classList.remove('open');
  $('#todayText').textContent = new Date().toLocaleDateString('id-ID', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
});
$('#datePill').textContent = new Date().toLocaleDateString('id-ID', {
  day: 'numeric', month: 'long', year: 'numeric'
});
}
document.querySelectorAll('.nav-link[data-page]').forEach(b=>b.addEventListener('click',()=>showPage(b.dataset.page)));
document.querySelectorAll('[data-goto]').forEach(b=>b.addEventListener('click',()=>showPage(b.dataset.goto)));
$('#menuToggle').addEventListener('click',()=>$('#sidebar').classList.toggle('open'));
if (window.KASIR_USER_NAME) {
  $('#loggedInName').textContent = window.KASIR_USER_NAME;
  $('#userAvatar').textContent = window.KASIR_USER_NAME.trim().charAt(0).toUpperCase();
}
showPage('dashboard');

function stat(label,value,icon,note='Ringkasan data'){return `<div class="stat-card"><div class="stat-top"><span>${label}</span><span class="stat-icon">${icon}</span></div><div class="stat-value">${value}</div><div class="stat-note">${note}</div></div>`}
function renderDashboard(){
 const total=db.transactions.reduce((s,t)=>s+t.total,0), low=db.products.filter(p=>p.stock<=5);
 $('#dashboardStats').innerHTML=stat('Penjualan Hari Ini',money(db.transactions.filter(t=>t.date===today()).reduce((s,t)=>s+t.total,0)),'↗')+stat('Jumlah Transaksi',db.transactions.length,'▤')+stat('Total Produk',db.products.length,'◇')+stat('Stok Menipis',low.length,'▣','Perlu segera diperiksa');
 const recent=[...db.transactions].slice(-5).reverse();
 $('#recentTransactions').innerHTML=recent.length?`<div class="table-wrap"><table><thead><tr><th>No. Transaksi</th><th>Tanggal</th><th>Total</th></tr></thead><tbody>${recent.map(t=>`<tr><td>${t.code}</td><td>${t.date}</td><td><b>${money(t.total)}</b></td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">Belum ada transaksi penjualan.</div>';
 $('#lowStockList').innerHTML=low.length?low.map(p=>`<div class="cart-line"><div><b>${esc(p.name)}</b><small>${esc(p.code)}</small></div><span class="badge red">${p.stock} tersisa</span></div>`).join(''):'<div class="empty">Semua stok dalam kondisi aman.</div>';
}
function renderProducts(){
 const q=($('#productSearch')?.value||'').toLowerCase(),cat=$('#productCategoryFilter')?.value||'';
 $('#productCategoryFilter').innerHTML='<option value="">Semua kategori</option>'+db.categories.map(c=>`<option value="${c.id}" ${cat==c.id?'selected':''}>${esc(c.name)}</option>`).join('');
 const rows=db.products.filter(p=>(p.name.toLowerCase().includes(q)||p.code.toLowerCase().includes(q))&&(!cat||p.categoryId==cat));
 $('#productsTable').innerHTML=rows.length?rows.map(p=>`<tr><td><b>${esc(p.code)}</b></td><td>${esc(p.name)}</td><td>${esc(categoryName(p.categoryId))}</td><td>${money(p.price)}</td><td><span class="badge ${p.stock<=5?'red':''}">${p.stock}</span></td><td><button class="action-btn" onclick="editProduct(${p.id})">Edit</button><button class="action-btn delete" onclick="deleteProduct(${p.id})">Hapus</button></td></tr>`).join(''):'<tr><td colspan="6" class="empty">Produk tidak ditemukan.</td></tr>';
}
$('#productSearch').addEventListener('input',renderProducts);$('#productCategoryFilter').addEventListener('change',renderProducts);
function openModal(title,fields,onSave){
 $('#dialogTitle').textContent=title;$('#dialogBody').innerHTML=fields;const dlg=$('#appDialog');
 const form=$('#dialogForm');form.onsubmit=e=>{if(e.submitter?.value==='cancel')return;e.preventDefault();const data={};form.querySelectorAll('[name]').forEach(el=>data[el.name]=el.value);if(onSave(data)!==false)dlg.close()};
 dlg.showModal();
}
$('#addProductBtn').addEventListener('click',()=>productModal());
function productModal(id=null){const p=db.products.find(x=>x.id===id)||{};const categoryOptions=db.categories.map(c=>`<option value="${c.id}" ${p.categoryId===c.id?'selected':''}>${esc(c.name)}</option>`).join('');
 openModal(id?'Edit Produk':'Tambah Produk',`<div class="modal-field"><label>Kode Produk</label><input name="code" required value="${esc(p.code||'')}" placeholder="P005"></div><div class="modal-field"><label>Nama Produk</label><input name="name" required value="${esc(p.name||'')}"></div><div class="modal-field"><label>Kategori</label><select name="categoryId" required>${categoryOptions}</select></div><div class="modal-field"><label>Harga (Rp)</label><input name="price" type="number" min="0" required value="${p.price??''}"></div><div class="modal-field"><label>Stok</label><input name="stock" type="number" min="0" required value="${p.stock??0}"></div>`,d=>{if(db.products.some(x=>x.code.toLowerCase()===d.code.toLowerCase()&&x.id!==id)){alert('Kode produk sudah digunakan.');return false}const obj={id:id||Date.now(),...d,categoryId:Number(d.categoryId),price:Number(d.price),stock:Number(d.stock)};if(id)db.products=db.products.map(x=>x.id===id?obj:x);else db.products.push(obj);saveDB();renderAll()})}
function editProduct(id){productModal(id)}
function deleteProduct(id){if(confirm('Hapus produk ini?')){db.products=db.products.filter(p=>p.id!==id);saveDB();renderAll()}}
$('#addCategoryBtn').addEventListener('click',()=>openModal('Tambah Kategori',`<div class="modal-field"><label>Nama Kategori</label><input name="name" required></div><div class="modal-field"><label>Deskripsi</label><input name="description"></div>`,d=>{db.categories.push({id:Date.now(),...d});saveDB();renderAll()}));
function renderCategories(){$('#categoriesTable').innerHTML=db.categories.map(c=>`<tr><td><b>${esc(c.name)}</b></td><td>${esc(c.description)}</td><td>${db.products.filter(p=>p.categoryId===c.id).length}</td><td><button class="action-btn delete" onclick="deleteCategory(${c.id})">Hapus</button></td></tr>`).join('')||'<tr><td colspan="4" class="empty">Belum ada kategori.</td></tr>'}
function deleteCategory(id){if(db.products.some(p=>p.categoryId===id)){alert('Kategori masih digunakan oleh produk. Pindahkan produk terlebih dahulu.');return}if(confirm('Hapus kategori?')){db.categories=db.categories.filter(c=>c.id!==id);saveDB();renderAll()}}
function renderPOS(){
 const q=($('#posSearch').value||'').toLowerCase();
 $('#posProducts').innerHTML=db.products.filter(p=>p.name.toLowerCase().includes(q)||p.code.toLowerCase().includes(q)).map(p=>`<button class="product-tile" onclick="addToCart(${p.id})"><div class="product-emoji">📦</div><b>${esc(p.name)}</b><small>${p.stock} stok tersedia</small><strong>${money(p.price)}</strong></button>`).join('')||'<div class="empty">Produk tidak tersedia.</div>';
 $('#cartItems').innerHTML=cart.length?cart.map(item=>{const p=db.products.find(x=>x.id===item.id);return `<div class="cart-line"><div><b>${esc(p?.name||'Produk')}</b><small>${money(p?.price)} × ${item.qty}</small></div><div class="qty-control"><button onclick="changeQty(${item.id},-1)">−</button><b>${item.qty}</b><button onclick="changeQty(${item.id},1)">＋</button></div></div>`}).join(''):'<div class="empty">Keranjang masih kosong. Pilih produk untuk memulai transaksi.</div>';
 const total=cart.reduce((s,i)=>s+(db.products.find(p=>p.id===i.id)?.price||0)*i.qty,0);
 $('#cartTotal').textContent=money(total);updateChange();
}
function addToCart(id){const p=db.products.find(x=>x.id===id),item=cart.find(x=>x.id===id);if(!p||p.stock<=0){alert('Stok produk habis.');return}if(item){if(item.qty>=p.stock){alert('Jumlah melebihi stok tersedia.');return}item.qty++}else cart.push({id,qty:1});renderPOS()}
function changeQty(id,d){const item=cart.find(x=>x.id===id),p=db.products.find(x=>x.id===id);if(!item)return;item.qty+=d;if(item.qty<=0)cart=cart.filter(x=>x.id!==id);else if(item.qty>p.stock){item.qty=p.stock;alert('Jumlah melebihi stok.')}renderPOS()}
function updateChange(){const total=cart.reduce((s,i)=>s+(db.products.find(p=>p.id===i.id)?.price||0)*i.qty,0);$('#changeAmount').textContent=money(Math.max(0,Number($('#amountPaid').value||0)-total))}
$('#posSearch').addEventListener('input',renderPOS);$('#amountPaid').addEventListener('input',updateChange);$('#clearCartBtn').addEventListener('click',()=>{cart=[];renderPOS()});
$('#checkoutBtn').addEventListener('click',()=>{
 if(!cart.length){alert('Keranjang masih kosong.');return}
 const total=cart.reduce((s,i)=>s+db.products.find(p=>p.id===i.id).price*i.qty,0),paid=Number($('#amountPaid').value);
 if(paid<total){alert('Jumlah pembayaran belum mencukupi.');return}
 cart.forEach(i=>{const p=db.products.find(x=>x.id===i.id);p.stock-=i.qty});
 const tx={id:Date.now(),code:'TRX-'+String(db.transactions.length+1).padStart(3,'0'),date:today(),items:cart.map(i=>({...i,name:db.products.find(p=>p.id===i.id).name,price:db.products.find(p=>p.id===i.id).price})),total,paid,change:paid-total,method:$('#paymentMethod').value,status:'Lunas'};
 db.transactions.push(tx);saveDB();cart=[];$('#amountPaid').value='';renderAll();printReceipt(tx);alert('Transaksi berhasil disimpan.');
});
function printReceipt(t){const w=window.open('','_blank','width=360,height=600');if(!w){alert('Izinkan pop-up untuk mencetak struk.');return}w.document.write(`<html><head><title>Struk ${t.code}</title><style>body{font:13px monospace;padding:20px}h2{text-align:center}hr{border:0;border-top:1px dashed #333}p{display:flex;justify-content:space-between}</style></head><body><h2>KASIR UMKM</h2><center>Struk Pembayaran</center><hr><p>${t.code}<span>${t.date}</span></p><hr>${t.items.map(i=>`<p>${i.name} x${i.qty}<span>${money(i.price*i.qty)}</span></p>`).join('')}<hr><p><b>Total</b><b>${money(t.total)}</b></p><p>Dibayar <span>${money(t.paid)}</span></p><p>Kembalian <span>${money(t.change)}</span></p><p>Metode <span>${t.method}</span></p><hr><center>Terima kasih telah berbelanja</center><script>window.print()</script></body></html>`);w.document.close()}
function renderTransactions(){$('#transactionTable').innerHTML=[...db.transactions].reverse().map(t=>`<tr><td><b>${t.code}</b></td><td>${t.date}</td><td>${money(t.total)}</td><td>${t.method}</td><td><span class="badge">${t.status}</span></td><td><button class="action-btn" onclick="reprint(${t.id})">Cetak</button></td></tr>`).join('')||'<tr><td colspan="6" class="empty">Belum ada transaksi.</td></tr>'}
function reprint(id){const t=db.transactions.find(x=>x.id===id);if(t)printReceipt(t)}
function renderStock(){
 $('#stockTable').innerHTML=db.products.map(p=>`<tr><td>${esc(p.name)}</td><td><b>${p.stock}</b></td><td><span class="badge ${p.stock<=5?'red':p.stock<=15?'warn':''}">${p.stock<=5?'Menipis':p.stock<=15?'Perhatian':'Aman'}</span></td><td><button class="action-btn" onclick="addStock(${p.id})">＋ Tambah</button></td></tr>`).join('');
 $('#supplierList').innerHTML=db.suppliers.map(s=>`<div class="cart-line"><div><b>${esc(s.name)}</b><small>${esc(s.phone)} · ${esc(s.address)}</small></div><button class="action-btn delete" onclick="deleteSupplier(${s.id})">Hapus</button></div>`).join('')||'<div class="empty">Belum ada supplier.</div>';
 $('#ordersTable').innerHTML=db.orders.map(o=>`<tr><td>${o.date}</td><td>${esc(db.suppliers.find(s=>s.id===o.supplierId)?.name||'-')}</td><td>${esc(db.products.find(p=>p.id===o.productId)?.name||'-')}</td><td>${o.qty}</td><td><span class="badge ${o.status==='Diterima'?'':'warn'}">${o.status}</span></td><td>${o.status==='Dipesan'?`<button class="action-btn" onclick="receiveOrder(${o.id})">Terima</button>`:'-'}</td></tr>`).join('')||'<tr><td colspan="6" class="empty">Belum ada pesanan barang.</td></tr>';
}
function addStock(id){openModal('Tambah Stok',`<div class="modal-field"><label>Jumlah stok masuk</label><input name="qty" type="number" min="1" required></div>`,d=>{db.products.find(p=>p.id===id).stock+=Number(d.qty);saveDB();renderAll()})}
$('#addSupplierBtn').addEventListener('click',()=>openModal('Tambah Supplier',`<div class="modal-field"><label>Nama Supplier</label><input name="name" required></div><div class="modal-field"><label>No. Telepon</label><input name="phone"></div><div class="modal-field"><label>Alamat</label><input name="address"></div>`,d=>{db.suppliers.push({id:Date.now(),...d});saveDB();renderAll()}));
function deleteSupplier(id){if(db.orders.some(o=>o.supplierId===id&&o.status==='Dipesan')){alert('Supplier masih memiliki pesanan aktif.');return}if(confirm('Hapus supplier?')){db.suppliers=db.suppliers.filter(s=>s.id!==id);saveDB();renderAll()}}
$('#addOrderBtn').addEventListener('click',()=>{if(!db.suppliers.length||!db.products.length){alert('Tambahkan supplier dan produk terlebih dahulu.');return}openModal('Buat Pesanan Barang',`<div class="modal-field"><label>Supplier</label><select name="supplierId">${db.suppliers.map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select></div><div class="modal-field"><label>Produk</label><select name="productId">${db.products.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select></div><div class="modal-field"><label>Jumlah pesanan</label><input name="qty" type="number" min="1" required></div>`,d=>{db.orders.push({id:Date.now(),supplierId:Number(d.supplierId),productId:Number(d.productId),qty:Number(d.qty),date:today(),status:'Dipesan'});saveDB();renderAll()})});
function receiveOrder(id){const o=db.orders.find(x=>x.id===id);if(!o||o.status!=='Dipesan')return;const p=db.products.find(x=>x.id===o.productId);p.stock+=o.qty;o.status='Diterima';saveDB();renderAll()}
function renderReports(){
 const from=$('#reportFrom').value,to=$('#reportTo').value;
 reportRows=db.transactions.filter(t=>(!from||t.date>=from)&&(!to||t.date<=to));
 const total=reportRows.reduce((s,t)=>s+t.total,0);
 $('#reportStats').innerHTML=stat('Total Penjualan',money(total),'↗')+stat('Jumlah Transaksi',reportRows.length,'▤')+stat('Rata-rata Transaksi',money(reportRows.length?total/reportRows.length:0),'◉')+stat('Produk Terjual',reportRows.reduce((s,t)=>s+t.items.reduce((a,i)=>a+i.qty,0),0),'◇');
 $('#reportTable').innerHTML=reportRows.map(t=>`<tr><td>${t.date}</td><td>${t.code}</td><td>${money(t.total)}</td><td>${t.method}</td><td><span class="badge">${t.status}</span></td></tr>`).join('')||'<tr><td colspan="5" class="empty">Tidak ada data pada rentang tanggal ini.</td></tr>';
}
$('#filterReportBtn').addEventListener('click',renderReports);
$('#exportCsvBtn').addEventListener('click',()=>{const rows=[['Tanggal','No Transaksi','Total','Metode Pembayaran','Status'],...reportRows.map(t=>[t.date,t.code,t.total,t.method,t.status])];const csv=rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='laporan-penjualan.csv';a.click();URL.revokeObjectURL(url)});
$('#resetDataBtn').addEventListener('click',()=>{if(confirm('Reset semua data demo ke kondisi awal?')){db=structuredClone(seed);cart=[];saveDB();renderAll()}});
function renderAll(){renderDashboard();renderProducts();renderCategories();renderPOS();renderTransactions();renderStock();renderReports()}
renderAll();
