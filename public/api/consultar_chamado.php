<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../includes/db_config.php';

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro de conexão com o banco de dados: ' . $conn->connect_error
    ]);
    exit();
}

$chamadoId = isset($_GET['id']) ? $conn->real_escape_string($_GET['id']) : '';

if (empty($chamadoId)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'ID do chamado não fornecido.'
    ]);
    $conn->close();
    exit();
}

$stmt = $conn->prepare("
    SELECT uuid, requerente, urgencia, departamento, dispositivo, erro_apresentado, comentario, status, data_abertura, data_encerramento
    FROM chamados
    WHERE uuid = ?
");
$stmt->bind_param("s", $chamadoId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $chamado = $result->fetch_assoc();

    // 🔹 Converter datas para formato ISO 8601 (compatível com o JavaScript)
    if (!empty($chamado['data_abertura'])) {
        $chamado['data_abertura'] = date('c', strtotime($chamado['data_abertura']));
    }
    if (!empty($chamado['data_encerramento'])) {
        $chamado['data_encerramento'] = date('c', strtotime($chamado['data_encerramento']));
    }

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'chamado' => $chamado
    ]);
} else {
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'message' => 'Chamado não encontrado.'
    ]);
}

$stmt->close();
$conn->close();