<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chatbot Widget</title>
</head>
<body>
    <h1>Chatbot Widget</h1>
    <div id="chatbot-container"></div>
<script src="chatbot-widget.js?v=1"></script>
</body>
</html>
 
<?php
session_start();
 
// === Gemini API Key ===
$GEMINI_API_KEY = "give your key"
// === Bot configuration ===
$DESC = <<<PROMPT """ provide decription here"""
 
PROMPT;
 
//header('Content-Type: application/json');
 
// Handle user message
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $user_query = trim($data['message'] ?? '');
 
    if ($user_query === '') {
        echo json_encode(['reply' => 'Please type something.']);
        exit;
    }
 
    // Create prompt for Gemini
    $prompt = $DESC . "\nUser: " . $user_query;
    // === cURL to Gemini API ===
    $ch = curl_init("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent");
    $payload = json_encode([
        "contents" => [
            ["parts" => [["text" => $prompt]]]
        ]
    ]);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => ["x-goog-api-key:". $GEMINI_API_KEY, "Content-Type: application/json"],
        CURLOPT_POSTFIELDS => $payload
    ]);
 
    $response = curl_exec($ch);
    if (curl_errno($ch)) {
        echo json_encode(['reply' => 'Error contacting AI server.']);
        exit;
    }
    curl_close($ch);
 
    $respData = json_decode($response, true);
    $reply = $respData['candidates'][0]['content']['parts'][0]['text'] ?? "Sorry, I didn’t get that.";
 
    echo json_encode(['reply' => $reply]);
    exit;
}
 
echo json_encode(['reply' => 'Invalid request']);
 
?>
