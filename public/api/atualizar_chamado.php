<?php
header('Content-Type: application/json');

require_once __DIR__ . '/../includes/db_config.php';

$response = ['success' => false, 'message' => ''];

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405); // Método não permitido
        throw new Exception('Método inválido. Use POST.');
    }

    $input = json_decode(file_get_contents("php://input"), true);

    if (!isset($input['uuid']) || !isset($input['status'])) {
        http_response_code(400);
        throw new Exception('Parâmetros obrigatórios ausentes (uuid e status).');
    }

    $uuid = trim($input['uuid']);
    $status = trim($input['status']);
    $descricaoServico = isset($input['descricao_servico']) ? trim($input['descricao_servico']) : null;

    // Conexão com PDO
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8",
        DB_USER,
        DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    // Prepara SQL com descrição, se enviada
    $sql = "UPDATE chamados SET status = :status";

    if ($descricaoServico !== null) {
        $sql .= ", descricao_servico = :descricao_servico";
    }

    $sql .= " WHERE uuid = :uuid";

    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':status', $status);
    $stmt->bindParam(':uuid', $uuid);

    if ($descricaoServico !== null) {
        $stmt->bindParam(':descricao_servico', $descricaoServico);
    }

    if ($stmt->execute()) {
        $response['success'] = true;
        $response['message'] = 'Chamado atualizado com sucesso.';
    } else {
        throw new Exception('Erro ao atualizar o chamado.');
    }

} catch (Exception $e) {
    $response['message'] = $e->getMessage();
    error_log('[ERRO] ' . $e->getMessage());
}

echo json_encode($response, JSON_UNESCAPED_UNICODE);
