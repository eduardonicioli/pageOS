<?php
session_start();
echo json_encode([
  "autenticado" => isset($_SESSION['autenticado']) && $_SESSION['autenticado'] === true
]);
