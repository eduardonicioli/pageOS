<?php
// Define os cabeçalhos para permitir CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Se for uma requisição OPTIONS (pré-voo do CORS), responda 200 OK e saia
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Inclui o arquivo de configuração do banco de dados
require_once __DIR__ . '/../includes/db_config.php';

// Conexão com o banco de dados
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// Verifica a conexão
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro de conexão com o banco de dados: ' . $conn->connect_error
    ]);
    exit();
}

// Pega o corpo da requisição JSON
$data = json_decode(file_get_contents("php://input"), true);

// Validação dos dados recebidos
if (json_last_error() !== JSON_ERROR_NONE || !is_array($data)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Requisição inválida. Esperado JSON.'
    ]);
    $conn->close();
    exit();
}

// Função para validar e formatar a data/hora recebida
function validaHoraAbertura($conn, $hora) {
    if (!empty($hora)) {
        $hora_escapada = $conn->real_escape_string($hora);
        $dt = date_create($hora_escapada);
        if ($dt) {
            $dt->setTimezone(new DateTimeZone('America/Sao_Paulo'));
            return $dt->format('Y-m-d H:i:s');
        }
    }
    return (new DateTime('now', new DateTimeZone('America/Sao_Paulo')))->format('Y-m-d H:i:s');
}

// Verifica se os campos obrigatórios estão presentes
if (empty($data['requerente']) || empty($data['urgencia']) || empty($data['departamento']) ||
    empty($data['dispositivo']) || empty($data['erroApresentado'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Por favor, preencha todos os campos obrigatórios.'
    ]);
    $conn->close();
    exit();
}

// Sanitização e atribuição de variáveis
$requerente = $conn->real_escape_string($data['requerente']);
$urgencia = $conn->real_escape_string($data['urgencia']);
$departamento = $conn->real_escape_string($data['departamento']);
$dispositivo = $conn->real_escape_string($data['dispositivo']);
$erroApresentado = $conn->real_escape_string($data['erroApresentado']);
$comentario = isset($data['comentario']) ? $conn->real_escape_string($data['comentario']) : null;
$horaAbertura = validaHoraAbertura($conn, $data['horaAbertura'] ?? '');

// Geração de um ID único
$uuid = '';
$maxAttempts = 10;
$prefix = 'OS';
$year = date('Y');

for ($i = 0; $i < $maxAttempts; $i++) {
    $randomNum = str_pad(mt_rand(1000, 9999), 4, '0', STR_PAD_LEFT);
    $tempUuid = "{$prefix}-{$year}-{$randomNum}";

    $stmt_check = $conn->prepare("SELECT uuid FROM chamados WHERE uuid = ?");
    $stmt_check->bind_param("s", $tempUuid);
    $stmt_check->execute();
    $stmt_check->store_result();

    if ($stmt_check->num_rows == 0) {
        $uuid = $tempUuid;
        $stmt_check->close();
        break;
    }
    $stmt_check->close();

    if ($i == $maxAttempts - 1) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Não foi possível gerar um ID único para o chamado após várias tentativas. Tente novamente.'
        ]);
        $conn->close();
        exit();
    }
}

// Inserir os dados no banco de dados
$stmt = $conn->prepare("INSERT INTO chamados (uuid, requerente, urgencia, departamento, dispositivo, erro_apresentado, comentario, data_abertura) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssssssss", $uuid, $requerente, $urgencia, $departamento, $dispositivo, $erroApresentado, $comentario, $horaAbertura);

// Define o status inicial como "aberto"
$status = "aberto";
  
if ($stmt->execute()) {
    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Chamado aberto com sucesso!',
        'chamadoId' => $uuid
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao inserir chamado: ' . $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?>