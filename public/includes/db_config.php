<?php
// includes/db_config.php

// Substitua 'SEU_HOST_BD', 'SEU_USUARIO_BD', 'SUA_SENHA_BD', 'SEU_NOME_BD'
// pelas informações que o serv00.net te fornece no painel de controle do MySQL.
define('DB_HOST', 'xxxxxxxxx'); // Geralmente é 'localhost', mas verifique no seu painel serv00.net
define('DB_USER', 'xxxxxxxxx');   // EX: 'uXXXXX_usuario_bd'
define('DB_PASS', 'xxxxxxxxx');     // EX: 'SenhaForte123'
define('DB_NAME', 'xxxxxxxxx');     // EX: 'uXXXXX_nome_do_banco'

// Este arquivo DEVE estar FORA da pasta public_html para segurança!
// Ele NÃO deve ser acessível diretamente pelo navegador.
?>
