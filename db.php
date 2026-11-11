<?php
// Koneksi database MySQL untuk aplikasi Kasir Digital UMKM.
$host = 'localhost';
$dbname = 'kasir_umkm';
$dbuser = 'root';
$dbpass = ''; // Default XAMPP biasanya kosong. Ubah jika MySQL Anda memakai password.

try {
    $pdo = new PDO(
        "mysql:host={$host};dbname={$dbname};charset=utf8mb4",
        $dbuser,
        $dbpass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    exit('Koneksi database gagal. Pastikan MySQL aktif dan database kasir_umkm sudah dibuat.');
}
