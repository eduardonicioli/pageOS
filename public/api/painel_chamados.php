<?php
// public_html/api/painel_chamados.php

session_start();
// 🚨 Nota: Este endpoint está sendo acessado via AJAX/fetch (GET/POST),
// a verificação de autenticação deve ser tratada com cautela, mas a lógica básica de redirecionamento está correta.
if (!isset($_SESSION["autenticado"])) {
  // Retorna um erro HTTP 401 (Não Autorizado) para o JavaScript em vez de um redirecionamento
  http_response_code(401);
  echo json_encode(['success' => false, 'message' => 'Sessão expirada ou não autenticada.']);
  exit();
}

header('Content-Type: application/json');

// Ajustado o caminho para assumir que painel_chamados.php está em public_html/api/
require_once __DIR__ . '/../includes/db_config.php'; 
require_once __DIR__ . '/../api/calculo_tempo.php'; // ✅ Inclui a função calcularTempoChamado, que deve estar na mesma pasta 'api/'

$response = ['success' => false, 'chamados' => [], 'message' => ''];

try {
    // 1. Conexão com PDO
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

    // 2. Sanitização dos Filtros (Melhorada)
    $status     = $data['status']     ?? null;
    $urgencia   = $data['urgencia']   ?? null;
    $dataInicio = $data['dataInicio'] ?? null;
    $dataFim    = $data['dataFim']    ?? null;
    $busca      = $data['busca']      ?? null;

    // 3. Montagem da Query SQL
    $sql = "
        SELECT 
            uuid, 
            requerente, 
            departamento, 
            dispositivo, 
            erro_apresentado, 
            urgencia, 
            status, 
            comentario, 
            descricao_servico,
            data_abertura,
            data_encerramento
        FROM chamados
        WHERE 1 = 1
    ";

    $params = [];

    // Aplicação dinâmica de filtros
    if (!empty($status)) {
        $sql .= " AND status = :status";
        $params[':status'] = $status;
    }

    if (!empty($urgencia)) {
        $sql .= " AND urgencia = :urgencia";
        $params[':urgencia'] = $urgencia;
    }

    if (!empty($dataInicio)) {
        $sql .= " AND data_abertura >= :dataInicio";
        $params[':dataInicio'] = $dataInicio . ' 00:00:00';
    }

    if (!empty($dataFim)) {
        $sql .= " AND data_abertura <= :dataFim";
        $params[':dataFim'] = $dataFim . ' 23:59:59';
    }

    if (!empty($busca)) {
        $sql .= " AND (uuid LIKE :busca OR requerente LIKE :busca OR departamento LIKE :busca)";
        $params[':busca'] = '%' . $busca . '%';
    }

    $sql .= " ORDER BY data_abertura DESC";
    

    // 4. Execução e Busca de Resultados
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $chamados = $stmt->fetchAll();

    $chamados_processados = [];

    // 5. Processamento dos Dados, Cálculo do Tempo e Formatação
    foreach ($chamados as $chamado) {
        
        // 🟢 CALCULA O TEMPO TOTAL E ADICIONA AO ARRAY
        $chamado['tempo_total'] = calcularTempoChamado(
            $chamado['data_abertura'], 
            $chamado['data_encerramento']
        );
        
        // 🔹 CONVERTE DATAS PARA FORMATO ISO 8601 (Compatível com JavaScript)
        if (!empty($chamado['data_abertura'])) {
            $chamado['data_abertura'] = date('c', strtotime($chamado['data_abertura']));
        }
        if (!empty($chamado['data_encerramento'])) {
            $chamado['data_encerramento'] = date('c', strtotime($chamado['data_encerramento']));
        }

        $chamados_processados[] = $chamado;
    }


    $response['success'] = true;
    $response['chamados'] = $chamados_processados;

} catch (PDOException $e) {
    http_response_code(500);
    $response['message'] = 'Erro ao buscar chamados no banco de dados.';
    error_log('[DB ERROR] ' . $e->getMessage());
}

echo json_encode($response, JSON_UNESCAPED_UNICODE);