<?php
session_start();
header("Content-Type: application/json");

$senhaCorreta = "XXXXXXXX"; // Substitua pela senha correta desejada
$input = json_decode(file_get_contents("php://input"), true);

if (isset($input["inputSenha"]) && $input["inputSenha"] === $senhaCorreta) {
  $_SESSION["autenticado"] = true;
  echo json_encode(["success" => true]);
} else {
  echo json_encode(["success" => false, "message" => "Senha incorreta"]);
}
