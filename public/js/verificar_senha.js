function verificarSenha() {
  const senhaInput = document.getElementById("inputSenha");

  if (!senhaInput) {
    console.error("Elemento de senha não encontrado.");
    return;
  }

  const senha = senhaInput.value;

  fetch("api/verificar_senha.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ inputSenha: senha })  // <- chave correta!
  })
    .then((res) => res.json())
    .then((resposta) => {
      if (resposta.success) {
        window.location.href = "painel_chamados.html";
      } else {
        document.getElementById("erroSenha").style.display = "block";
      }
    })
    .catch((erro) => {
      console.error("Erro ao verificar senha:", erro);
    });
}
