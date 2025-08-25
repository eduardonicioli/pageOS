<?php
session_start();
if (!isset($_SESSION["autenticado"])) {
  header("Location: painel_chamados.php");
  exit();
}
header('Content-Type: application/json');
require_once __DIR__ . '/../includes/db_config.php';

$response = ['success' => false, 'chamados' => [], 'message' => ''];

try {
    // Conexão com PDO
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );

    // Captura do corpo JSON com filtros (POST)
    $data = json_decode(file_get_contents('php://input'), true) ?: [];

    // Sanitização dos filtros
    $status     = isset($data['status'])     && $data['status']     !== '' ? trim($data['status'])     : null;
    $urgencia   = isset($data['urgencia'])   && $data['urgencia']   !== '' ? trim($data['urgencia'])   : null;
    $dataInicio = isset($data['dataInicio']) && $data['dataInicio'] !== '' ? trim($data['dataInicio']) : null;
    $dataFim    = isset($data['dataFim'])    && $data['dataFim']    !== '' ? trim($data['dataFim'])    : null;
    $busca      = isset($data['busca'])      && $data['busca']      !== '' ? trim($data['busca'])      : null;

    // SQL base com JOINs se necessário no futuro
    $sql = "
        SELECT 
            uuid, 
            requerente, 
            departamento, 
            dispositivo, 
            erro_apresentado AS erro, 
            urgencia, 
            status, 
            comentario, 
            descricao_servico,
            data_abertura
        FROM chamados
        WHERE 1 = 1
    ";

    $params = [];

    // Aplicação dinâmica de filtros
    if ($status) {
        $sql .= " AND status = :status";
        $params[':status'] = $status;
    }

    if ($urgencia) {
        $sql .= " AND urgencia = :urgencia";
        $params[':urgencia'] = $urgencia;
    }

    if ($dataInicio) {
        $sql .= " AND data_abertura >= :dataInicio";
        $params[':dataInicio'] = $dataInicio . ' 00:00:00';
    }

    if ($dataFim) {
        $sql .= " AND data_abertura <= :dataFim";
        $params[':dataFim'] = $dataFim . ' 23:59:59';
    }

    if ($busca) {
        $sql .= " AND (uuid LIKE :busca OR requerente LIKE :busca OR departamento LIKE :busca)";
        $params[':busca'] = '%' . $busca . '%';
    }

    $sql .= " ORDER BY data_abertura DESC";

    // Execução segura
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $chamados = $stmt->fetchAll();

    $response['success'] = true;
    $response['chamados'] = $chamados;

} catch (PDOException $e) {
    http_response_code(500);
    $response['message'] = 'Erro ao buscar chamados.';
    error_log('[DB ERROR] ' . $e->getMessage());
}

echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
