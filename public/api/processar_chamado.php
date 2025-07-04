<?php
// public_html/api/processar_chamado.php

// Define os cabeçalhos para permitir CORS (Cross-Origin Resource Sharing)
// Essencial para que seu frontend possa se comunicar
header("Access-Control-Allow-Origin: *"); // Permite acesso de qualquer origem. Em produção, substitua * pela URL do seu site.
header("Access-Control-Allow-Methods: POST, OPTIONS"); // Apenas POST para submeter dados e OPTIONS para preflight
header("Access-Control-Allow-Headers: Content-Type"); // Permite o cabeçalho Content-Type
header("Content-Type: application/json; charset=UTF-8"); // A resposta será JSON

// Se for uma requisição OPTIONS (pré-voo do CORS), responda 200 OK e saia
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Inclui o arquivo de configuração do banco de dados
// O caminho '__DIR__ . '/../../includes/db_config.php'' assume que 'includes' está dois níveis acima de 'processar_chamado.php'
// Ex: projetoSuporte/public_html/api/processar_chamado.php
// Volta um: projetoSuporte/public_html/
// Volta dois: projetoSuporte/
// Entra em includes/: projetoSuporte/includes/db_config.php
require_once __DIR__ . '/../../includes/db_config.php'; 

// Conexão com o banco de dados
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// Verifica a conexão
if ($conn->connect_error) {
    http_response_code(500); // Erro interno do servidor
    echo json_encode([
        'success' => false,
        'message' => 'Erro de conexão com o banco de dados: ' . $conn->connect_error
    ]);
    exit();
}

// Pega o corpo da requisição JSON (o que vem do seu JavaScript)
$data = json_decode(file_get_contents("php://input"), true);

// Validação dos dados recebidos
if (json_last_error() !== JSON_ERROR_NONE || !is_array($data)) {
    http_response_code(400); // Bad Request
    echo json_encode([
        'success' => false,
        'message' => 'Requisição inválida. Esperado JSON.'
    ]);
    $conn->close();
    exit();
}

// Verifica se os campos obrigatórios estão presentes
if (empty($data['requerente']) || empty($data['urgencia']) || empty($data['departamento']) || 
    empty($data['dispositivo']) || empty($data['erroApresentado'])) {
    http_response_code(400); // Bad Request
    echo json_encode([
        'success' => false,
        'message' => 'Por favor, preencha todos os campos obrigatórios.'
    ]);
    $conn->close();
    exit();
}

// Sanitização e atribuição de variáveis para evitar SQL Injection
$requerente = $conn->real_escape_string($data['requerente']);
$urgencia = $conn->real_escape_string($data['urgencia']);
$departamento = $conn->real_escape_string($data['departamento']);
$dispositivo = $conn->real_escape_string($data['dispositivo']);
$erroApresentado = $conn->real_escape_string($data['erroApresentado']);
$comentario = isset($data['comentario']) ? $conn->real_escape_string($data['comentario']) : null;
$horaAbertura = isset($data['horaAbertura']) ? $conn->real_escape_string($data['horaAbertura']) : date('Y-m-d H:i:s'); // Usa a data do JS ou a atual do servidor

// Geração de um ID único e legível (UUID)
$uuid = '';
$maxAttempts = 10;
$prefix = 'CHMD';
$year = date('Y');

for ($i = 0; $i < $maxAttempts; $i++) {
    $randomNum = str_pad(mt_rand(1000, 9999), 4, '0', STR_PAD_LEFT);
    $tempUuid = "{$prefix}-{$year}-{$randomNum}";

    // Prepara e executa a consulta para verificar se o UUID já existe
    $stmt_check = $conn->prepare("SELECT uuid FROM chamados WHERE uuid = ?");
    $stmt_check->bind_param("s", $tempUuid);
    $stmt_check->execute();
    $stmt_check->store_result();

    if ($stmt_check->num_rows == 0) {
        $uuid = $tempUuid;
        $stmt_check->close();
        break; // UUID único encontrado
    }
    $stmt_check->close();
    
    if ($i == $maxAttempts - 1) {
        // Se após várias tentativas não conseguir gerar um UUID único
        http_response_code(500); // Erro interno do servidor
        echo json_encode([
            'success' => false,
            'message' => 'Não foi possível gerar um ID único para o chamado após várias tentativas. Tente novamente.'
        ]);
        $conn->close();
        exit();
    }
}

// Inserir os dados no banco de dados usando prepared statements (melhor segurança)
$stmt = $conn->prepare("INSERT INTO chamados (uuid, requerente, urgencia, departamento, dispositivo, erro_apresentado, comentario, data_abertura) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

// 'ssssssss' indica 8 parâmetros do tipo string
$stmt->bind_param("ssssssss", $uuid, $requerente, $urgencia, $departamento, $dispositivo, $erroApresentado, $comentario, $horaAbertura);

if ($stmt->execute()) {
    http_response_code(201); // Created
    echo json_encode([
        'success' => true,
        'message' => 'Chamado aberto com sucesso!',
        'chamadoId' => $uuid // Retorna o ID gerado para o frontend
    ]);
} else {
    http_response_code(500); // Erro interno do servidor
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao inserir chamado: ' . $stmt->error
    ]);
}

$stmt->close();
$conn->close();

?>