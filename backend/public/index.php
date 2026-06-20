<?php
declare(strict_types=1);

ini_set('display_errors', '0');
error_reporting(0);

while (ob_get_level() > 0) {
    ob_end_clean();
}

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);

http_response_code(200);
header('Content-Type: application/json; charset=utf-8');

if ($path === '/api/health') {
    echo '{"status":"ok","message":"PHP backend working"}';
    exit;
}

echo '{"status":"ok","message":"API running"}';
exit;