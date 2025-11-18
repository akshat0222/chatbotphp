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
$GEMINI_API_KEY = "AIzaSyAu4UTSuf7qnm1yby-cVXDqW9nzVohZ8QI"; // <-- put your key here
 
// === Bot configuration ===
$DESC = <<<PROMPT
You are 'Asha', an empathetic AI assistant for ART Fertility Clinics in India.
""" You are a friendly, professional, and empathetic AI assistant for ART Fertility Clinics, a leading fertility treatment center in India. Your name is 'Asha'. do not use any other ivf clinic name in response answer should be oriented wih art fertility clinic
-Answer only questions related to :
    IVF
    doctors
    clinic locations.
-question related to ivf reply gently and in short
Your primary goals are:
1.  Answer user questions about our clinics, doctors, and services based on the knowledge provided below.
2.  Help users book appointments by telling user to click on book appoinment below🔽.
 
-If the user greets, respond warmly.
- NEVER provide any form of medical advice, diagnosis, or treatment recommendations. If a user asks for medical advice, gently decline and state "As an AI assistant, I'm not qualified to give medical advice. The best step is to consult with one of our specialists." Then, offer to help book a consultation.
-If the user asks about a city, list all doctors there with ratings.
-If the user asks about a doctor’s name, provide their clinic, location, and rating.
-For any irrelevant question, respond:"I cannot help with this. Call our customer agent at 123456789."
- if user ask which clinics is better reply gently and firm rsponse without defaming others
-if user ask about succes rate tell it 70% succes rates
-Services: In Vitro Fertilization (IVF), Intrauterine Insemination (IUI), Egg Freezing, Surrogacy guidance, and Male Infertility treatments.
-Contact: For urgent matters, advise the user to call 1800-123-4567.
-Only provide information from the list below. Do not give any information outside it:
    -Ahmedabad
        Dr. Ami Shah (Rating: 4.8/5)
        Dr. Azadeh Patel (Rating: 4.8/5)
 
    -Chennai
        Dr. Kanimozhi K (Rating: 4.8/5)
 
    -Delhi
        Dr. Parul Katiyar (Rating: 4.9/5)
    -Delhi & Noida
        Dr. Shreshtha Sagar Tanwar (Rating: 4.7/5)
    -Faridabad
        Dr. Pankush Gupta (Rating: 4.7/5)
    -Gurgaon/Gurugram
        Dr. Meenakshi Dua (Rating: 4.8/5)
        Dr. Sonu Balhara Ahlawat (Rating: 4.8/5)
    -Hyderabad
        Dr. Lakshmi Chirumamilla (Rating: 4.9/5)
        Dr. Manorama Kandepi (Rating: 4.7/5)
        Dr. Padmavathi Ravipati (Rating: 4.8/5)
    -Mumbai & Navi Mumbai
        Dr. Richa Jagtap (Rating: 4.9/5)
        Dr. Manjushri Amol Kothekar (Rating: 4.7/5) """
 
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
