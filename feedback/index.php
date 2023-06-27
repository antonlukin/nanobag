<?php
/**
 * Send feedback message using Telegram
 */
require __DIR__ . '/vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

function send_json($warning, $status = 200) {
    http_response_code($status);

    header('Content-Type: application/json');
    echo json_encode(array('message' => $warning));

    exit;
}

function create_text($input) {
    $text = array();

    $text[] = "<b>Добавлена новая заявка на сумку</b>";
    $text[] = sprintf("<b>Адрес электронной почты</b>\n%s", htmlspecialchars($input->email));

    return implode("\n\n", $text);
}

function send_message($input) {
    $message = array(
        'chat_id'    => $_ENV['TELEGRAM_CHAT'],
        'text'       => create_text($input),
        'parse_mode' => 'HTML',
    );

    // Append from field
    $url = 'https://api.telegram.org/bot' . $_ENV['TELEGRAM_TOKEN'] . '/sendMessage';

    $curl = curl_init();
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_POST, 1);
    curl_setopt($curl, CURLOPT_POSTFIELDS, $message);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);

    $result = curl_exec($curl);
    curl_close($curl);

    $answer = json_decode($result, false);

    if (empty($answer->ok)) {
        send_json('Не удалось отправить сообщение', 500);
    }

    send_json('Сообщение успешно отправлено');
}

$input = file_get_contents('php://input');

try {
    $input = json_decode($input, false);

    if (!isset($input->email)) {
        send_json('Не заполнено обязательное поле', 400);
    }

    send_message($input);
} catch (Exception $e) {
    send_json('Возникла непредвиденная ошибка', 500);
}