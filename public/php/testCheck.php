<?php
require 'vendor/autoload.php'; // if you're using composer packages like lcobucci/jwt

// include your functions file
require_once 'llamaCheckToken.php'; 

if ($argc < 2) {
    echo "Usage: php test_token.php <token> [local]\n";
    exit(1);
}

$token = $argv[1];
$local = isset($argv[2]) ? filter_var($argv[2], FILTER_VALIDATE_BOOLEAN) : false;

try {
    $user = parseToken($token, $local);
    echo "User ID: " . $user . PHP_EOL;
    exit(0); // success
} catch (Exception $e) {
    // your function already sets http_response_code() + die(), 
    // but if an exception escapes, catch it
    fwrite(STDERR, "Error: " . $e->getMessage() . PHP_EOL);
    exit(1); // failure
}
exit(0);
