<?php
require_once __DIR__ . '/auth.php';
if (!empty($_SESSION['user_id'])) {
    header('Location: index.php'); exit;
}
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password === '') {
        $error = 'Masukkan email dan password dengan benar.';
    } else {
        $stmt = $pdo->prepare('SELECT id, nama, password FROM users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        if ($user && password_verify($password, $user['password'])) {
            session_regenerate_id(true);
            $_SESSION['user_id'] = (int)$user['id'];
            $_SESSION['user_name'] = $user['nama'];
            header('Location: index.php'); exit;
        }
        $error = 'Email atau password salah.';
    }
}
?>
<!DOCTYPE html>
<html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Login - Kasir Digital UMKM</title><link rel="stylesheet" href="style.css"></head>
<body class="auth-page"><main class="auth-card">
<div class="auth-brand"><span class="brand-mark">▦</span><span>Kasir Digital UMKM</span></div>
<h1>Selamat Datang</h1><p class="muted">Masuk menggunakan akun yang sudah Anda daftarkan.</p>
<?php if ($error): ?><div class="auth-error"><?= htmlspecialchars($error) ?></div><?php endif; ?>
<form method="post" action="login.php">
<label for="email">Email</label><input id="email" name="email" type="email" required autocomplete="username" placeholder="nama@email.com">
<label for="password">Password</label><input id="password" name="password" type="password" required autocomplete="current-password" placeholder="Masukkan password">
<button class="btn primary" type="submit">Login</button>
</form>
<div class="auth-foot">Belum punya akun? <a href="register.php">Daftar sekarang</a></div>
</main></body></html>
