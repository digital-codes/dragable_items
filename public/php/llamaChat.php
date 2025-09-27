<?php
// audioRx.php
date_default_timezone_set('UTC');

// remote handler
require_once("remoteLlm.php");
// jwt check
require_once 'llamaCheckToken.php'; 


// Define paths
$logFile = __DIR__ . '/llamachat.log';

// Helper to log errors
function logError($message, $logFile)
{
    $entry = sprintf("[%s] ERROR: %s\n", date('Y-m-d H:i:s'), $message);
    file_put_contents($logFile, $entry, FILE_APPEND);
}


// don't set     
// header('Access-Control-Allow-Origin: *');
// here. is already done in website config

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    http_response_code(204);
    exit;
}

// Check if the request is from localhost
$clientIp = $_SERVER['REMOTE_ADDR'];
if ($clientIp === '127.0.0.1' || $clientIp === '::1') {
    $isLocal = true;
} else {
    $isLocal = false;
}

// parse init
$iniPath = $isLocal ? './config.ini' : '/var/www/files/llama/config.ini';
if (!file_exists($iniPath)) {
    logError("Missing ini file: $iniPath", $logFile);
    http_response_code(500);
    echo json_encode(['error' => 'Configuration file not found']);
    exit;
}

$configLlm = parse_ini_file($iniPath, true)['REMOTE'] ?? null;

if (!$configLlm) {
    logError("Invalid config format in $iniPath", $logFile);
    http_response_code(500);
    echo json_encode(['error' => 'Invalid config format']);
    exit;
}

// ----------

$data = json_decode(file_get_contents('php://input'), true);

// Check if the request has an Authorization header
if (!isset($_SERVER['HTTP_AUTHORIZATION'])) {
    http_response_code(401);
    exit('Unauthorized');
}

// Get the token from the Authorization header
$token = str_replace('Bearer ', '', $_SERVER['HTTP_AUTHORIZATION']);

try {
    $user = parseToken($token, $isLocal);
} catch (Exception $e) {
    http_response_code(401);
    exit('Unauthorized (2)');
}

if (!isset($data['query'])) {
    logError('Missing user query', $logFile);
    http_response_code(400);
    echo json_encode(['error' => 'Missing user query']);
    exit;
}
// user input
$userQuery = escapeshellarg($data['query']); // Protect input

if (!isset($data['prompt'])) {
    logError('Missing prompt', $logFile);
    http_response_code(400);
    echo json_encode(['error' => 'Missing prompt']);
    exit;
}
$systemPrompt = $data['prompt'];

if (isset($data['context'])) {
    // add context to query
    $contextPrompt = "Nutze bei der Beantwortung folgenden Kontext: " . PHP_EOL . $data['context'] . PHP_EOL;
    $userQuery = $contextPrompt . PHP_EOL  . "Die Frage lautet:" . PHP_EOL  . $userQuery . PHP_EOL;
} else {
    // no context
    $userQuery = "Die Frage lautet:" . PHP_EOL  . $userQuery . PHP_EOL;
}   



// Call the remote LLM API
$apiKey = $configLlm['api_key'];
$model = $configLlm['llmodel'];
$url = $configLlm['llurl'];
logError("Using remote LLM API at $url", $logFile);

// Call the function
$response = remoteQuery($apiKey, $model, $url, $systemPrompt, $userQuery);
if ($response['status'] === 'error') {
    http_response_code(500);
    logError("remote llm failed", $logFile);
    echo json_encode([
        'error' => 'LLM execution failed',
    ]);
    exit;
} else {
    // Process the response as needed
    $messages = $response['messages'];
    logError("LLM response: " . print_r($response, true), $logFile);
    $output = $response['reply'];
    $output = preg_replace('/^Assistant:\s*/i', '', $output);
}

// trim output 
$output = preg_replace('/<think>.*?<\/think>/is', '', $output);
$output = trim($output);

echo json_encode(value: ['status' => 'ok', 'text' => $output]);




