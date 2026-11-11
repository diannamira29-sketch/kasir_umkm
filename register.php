<?php
require_once __DIR__ . '/auth.php';
if (!empty($_SESSION['user_id'])) {
    header('Location: index.php'); exit;
}
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nama = trim($_POST['nama'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $konfirmasi = $_POST['konfirmasi'] ?? '';
    if ($nama === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = 'Nama dan alamat email yang valid wajib diisi.';
    } elseif (strlen($password) < 8) {
        $error = 'Password minimal 8 karakter.';
    } elseif ($password !== $konfirmasi) {
        $error = 'Konfirmasi password tidak sama.';
    } else {
        $check = $pdo->prepare('SELECT id FROM users WHERE email = ?');
        $check->execute([$email]);
        if ($check->fetch()) {
            $error = 'Email sudah terdaftar. Gunakan email lain atau login.';
        } else {
            $hash = password_hash($password, PASSWORD_DEFAULT);
            $insert = $pdo->prepare('INSERT INTO users (nama, email, password) VALUES (?, ?, ?)');
            $insert->execute([$nama, $email, $hash]);
            session_regenerate_id(true);
            $_SESSION['user_id'] = (int)$pdo->lastInsertId();
            $_SESSION['user_name'] = $nama;
            header('Location: index.php'); exit;
        }
    }
}
?>
<!DOCTYPE html>
<html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Daftar Akun - Kasir Digital UMKM</title><link rel="stylesheet" href="style.css"></head>
<body class="auth-page"><main class="auth-card">
<div class="auth-brand"><span class="brand-mark">▦</span><span>Kasir Digital UMKM</span></div>
<h1>Buat Akun Baru</h1><p class="muted">Daftarkan akun untuk mulai menggunakan sistem kasir.</p>
<?php if ($error): ?><div class="auth-error"><?= htmlspecialchars($error) ?></div><?php endif; ?>
<form method="post" action="register.php">
<label for="nama">Nama Lengkap</label><input id="nama" name="nama" required maxlength="100" autocomplete="name" placeholder="Nama Anda">
<label for="email">Email</label><input id="email" name="email" type="email" required maxlength="190" autocomplete="email" placeholder="nama@email.com">
<label for="password">Password</label><input id="password" name="password" type="password" required minlength="8" autocomplete="new-password" placeholder="Minimal 8 karakter">
<label for="konfirmasi">Konfirmasi Password</label><input id="konfirmasi" name="konfirmasi" type="password" required minlength="8" autocomplete="new-password" placeholder="Ulangi password">
<button class="btn primary" type="submit">Daftar Akun</button>
</form>
<div class="auth-foot">Sudah punya akun? <a href="login.php">Login</a></div>
</main></body></html>
