<?php
require_once __DIR__ . '/auth.php';
wajib_login();
?>
<!DOCTYPE html>
<html lang="id">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kasir Digital UMKM</title>
  <link rel="stylesheet" href="style.css">
</head>

<body>
  <div id="appView" class="app">
    <aside class="sidebar" id="sidebar">
      <div class="side-brand"><span class="brand-mark small">▦</span>
        <div><b>Kasir UMKM</b><small>Digital POS</small></div>
      </div>
      <div class="side-label">MENU UTAMA</div>
      <nav>
        <button class="nav-link active" data-page="dashboard"><span>▦</span> Dashboard</button>
        <button class="nav-link" data-page="products"><span>◇</span> Produk</button>
        <button class="nav-link" data-page="categories"><span>▤</span> Kategori</button>
        <button class="nav-link" data-page="transactions"><span>🛒</span> Transaksi</button>
        <button class="nav-link" data-page="stock"><span>▣</span> Stok & Supplier</button>
        <button class="nav-link" data-page="reports"><span>▥</span> Laporan</button>
      </nav>
      <div class="sidebar-bottom">
        <button class="nav-link" data-page="settings"><span>⚙</span> Pengaturan</button>
      </div>
    </aside>

    <main class="main">
      <header class="topbar">
        <button id="menuToggle" class="icon-btn mobile-only">☰</button>
        <div><b id="topTitle">Dashboard</b><small id="todayText"></small></div>
        <div class="user-chip">
          <span class="avatar" id="userAvatar">U</span>
          <span><b id="loggedInName">Pengguna</b><small>Kasir</small></span>
          <a class="btn light small" href="logout.php" style="margin-left:10px;text-decoration:none">Keluar</a>
        </div>
      </header>
      <div class="content">
        <section id="page-dashboard" class="page active">
          <div class="page-heading">
            <div>
              <p class="eyebrow">RINGKASAN USAHA</p>
              <h1>Dashboard</h1>
              <p class="muted">Pantau aktivitas penjualan dan persediaan usaha Anda.</p>
            </div><span class="date-pill" id="datePill"></span>
          </div>
          <div class="stats-grid" id="dashboardStats"></div>
          <div class="dashboard-grid">
            <div class="panel">
              <div class="panel-head">
                <div>
                  <h3>Penjualan Terbaru</h3>
                  <p class="muted">Daftar transaksi terakhir</p>
                </div><button class="btn light small" data-goto="reports">Lihat laporan</button>
              </div>
              <div id="recentTransactions"></div>
            </div>
            <div class="panel">
              <div class="panel-head">
                <div>
                  <h3>Stok Menipis</h3>
                  <p class="muted">Produk dengan stok 5 atau kurang</p>
                </div>
              </div>
              <div id="lowStockList"></div>
            </div>
          </div>
        </section>

        <section id="page-products" class="page">
          <div class="page-heading">
            <div>
              <p class="eyebrow">INVENTARIS</p>
              <h1>Data Produk</h1>
              <p class="muted">Tambah, ubah, dan hapus produk UMKM.</p>
            </div><button class="btn primary" id="addProductBtn">＋ Tambah Produk</button>
          </div>
          <div class="panel">
            <div class="toolbar"><input id="productSearch" placeholder="Cari nama atau kode produk..."><select
                id="productCategoryFilter">
                <option value="">Semua kategori</option>
              </select></div>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Kode</th>
                    <th>Nama Produk</th>
                    <th>Kategori</th>
                    <th>Harga</th>
                    <th>Stok</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody id="productsTable"></tbody>
              </table>
            </div>
          </div>
        </section>

        <section id="page-categories" class="page">
          <div class="page-heading">
            <div>
              <p class="eyebrow">INVENTARIS</p>
              <h1>Kategori Produk</h1>
              <p class="muted">Kelompokkan produk agar lebih mudah dikelola.</p>
            </div><button class="btn primary" id="addCategoryBtn">＋ Tambah Kategori</button>
          </div>
          <div class="panel">
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Nama Kategori</th>
                    <th>Deskripsi</th>
                    <th>Jumlah Produk</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody id="categoriesTable"></tbody>
              </table>
            </div>
          </div>
        </section>

        <section id="page-transactions" class="page">
          <div class="page-heading">
            <div>
              <p class="eyebrow">POINT OF SALES</p>
              <h1>Kasir / Transaksi</h1>
              <p class="muted">Pilih produk, masukkan ke keranjang, lalu proses pembayaran.</p>
            </div><span class="date-pill">Kasir aktif</span>
          </div>
          <div class="pos-layout">
            <div class="panel">
              <div class="toolbar"><input id="posSearch" placeholder="Cari produk..."></div>
              <div id="posProducts" class="product-grid"></div>
            </div>
            <div class="panel cart-panel">
              <div class="panel-head">
                <h3>Keranjang Belanja</h3><button id="clearCartBtn" class="text-btn">Kosongkan</button>
              </div>
              <div id="cartItems" class="cart-items"></div>
              <div class="cart-total"><span>Total pembayaran</span><strong id="cartTotal">Rp0</strong></div>
              <label>Metode Pembayaran</label><select id="paymentMethod">
                <option>Tunai</option>
                <option>Transfer</option>
                <option>QRIS</option>
              </select><label>Jumlah dibayar</label><input id="amountPaid" type="number" min="0"
                placeholder="Masukkan jumlah pembayaran">
              <div class="change-row"><span>Kembalian</span><b id="changeAmount">Rp0</b></div><button id="checkoutBtn"
                class="btn primary full">Bayar & Cetak Struk</button>
            </div>
          </div>
          <div class="panel history-panel">
            <div class="panel-head">
              <h3>Riwayat Transaksi</h3>
            </div>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>No. Transaksi</th>
                    <th>Tanggal</th>
                    <th>Total</th>
                    <th>Metode</th>
                    <th>Status</th>
                    <th>Struk</th>
                  </tr>
                </thead>
                <tbody id="transactionTable"></tbody>
              </table>
            </div>
          </div>
        </section>

        <section id="page-stock" class="page">
          <div class="page-heading">
            <div>
              <p class="eyebrow">PERSEDIAAN</p>
              <h1>Stok & Supplier</h1>
              <p class="muted">Pantau stok dan catat pemesanan barang kepada supplier.</p>
            </div>
          </div>
          <div class="dashboard-grid">
            <div class="panel">
              <div class="panel-head">
                <h3>Data Stok</h3>
              </div>
              <div class="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Produk</th>
                      <th>Stok</th>
                      <th>Status</th>
                      <th>Tambah Stok</th>
                    </tr>
                  </thead>
                  <tbody id="stockTable"></tbody>
                </table>
              </div>
            </div>
            <div class="panel">
              <div class="panel-head">
                <h3>Data Supplier</h3><button id="addSupplierBtn" class="btn primary small">＋ Supplier</button>
              </div>
              <div id="supplierList"></div>
            </div>
          </div>
          <div class="panel history-panel">
            <div class="panel-head">
              <h3>Pesanan Barang</h3><button id="addOrderBtn" class="btn light small">＋ Pesan Barang</button>
            </div>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Supplier</th>
                    <th>Produk</th>
                    <th>Jumlah</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody id="ordersTable"></tbody>
              </table>
            </div>
          </div>
        </section>

        <section id="page-reports" class="page">
          <div class="page-heading">
            <div>
              <p class="eyebrow">ANALISIS USAHA</p>
              <h1>Laporan Penjualan</h1>
              <p class="muted">Rekap transaksi dan pendapatan usaha.</p>
            </div><button id="exportCsvBtn" class="btn primary">↓ Export Excel (CSV)</button>
          </div>
          <div class="panel">
            <div class="toolbar"><label>Dari tanggal <input type="date" id="reportFrom"></label><label>Sampai tanggal
                <input type="date" id="reportTo"></label><button id="filterReportBtn"
                class="btn light">Tampilkan</button></div>
            <div id="reportStats" class="stats-grid compact"></div>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>No. Transaksi</th>
                    <th>Total</th>
                    <th>Metode Bayar</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody id="reportTable"></tbody>
              </table>
            </div>
          </div>
        </section>

        <section id="page-settings" class="page">
          <div class="page-heading">
            <div>
              <p class="eyebrow">PREFERENSI</p>
              <h1>Pengaturan</h1>
              <p class="muted">Informasi aplikasi dan penyimpanan data.</p>
            </div>
          </div>
          <div class="panel settings-panel">
            <h3>Sistem Kasir Digital UMKM</h3>
            <p>Aplikasi demonstrasi front-end untuk tugas Rekayasa Perangkat Lunak.</p>
            <p>Data disimpan pada browser menggunakan LocalStorage. Untuk penggunaan nyata, sistem perlu dihubungkan ke
              backend dan database.</p><button id="resetDataBtn" class="btn danger">Reset Data Awal</button>
          </div>
        </section>
      </div>
    </main>
  </div>

  <dialog id="appDialog">
    <form id="dialogForm" method="dialog">
      <div class="modal-head">
        <h3 id="dialogTitle">Form</h3><button class="icon-btn" value="cancel" aria-label="Tutup">×</button>
      </div>
      <div id="dialogBody"></div>
      <div class="modal-actions"><button class="btn light" value="cancel">Batal</button><button class="btn primary"
          id="dialogSaveBtn" value="default">Simpan</button></div>
    </form>
  </dialog>
  <script>
    window.KASIR_USER_ID = <?= json_encode((int)$_SESSION['user_id']) ?>;
    window.KASIR_USER_NAME = <?= json_encode($_SESSION['user_name'], JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP | JSON_HEX_QUOT) ?>;
  </script>
  <script src="app.js"></script>
</body>

</html>