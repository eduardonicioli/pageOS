document.addEventListener('DOMContentLoaded', function () {
  const chamadoIdInput = document.getElementById('chamadoIdInput');
  const buscarChamadoBtn = document.getElementById('buscarChamadoBtn');
  const resultadoChamadoDiv = document.getElementById('resultadoChamado');
  const mensagemErroChamadoDiv = document.getElementById('mensagemErroChamado');

  const chamadoIdDisplay = document.getElementById('chamadoIdDisplay');
  const chamadoStatus = document.getElementById('chamadoStatus');
  const chamadoRequerente = document.getElementById('chamadoRequerente');
  const chamadoDepartamento = document.getElementById('chamadoDepartamento');
  const chamadoDispositivo = document.getElementById('chamadoDispositivo');
  const chamadoErro = document.getElementById('chamadoErro');
  const chamadoUrgencia = document.getElementById('chamadoUrgencia');
  const chamadoComentario = document.getElementById('chamadoComentario');
  const chamadoDataAbertura = document.getElementById('chamadoDataAbertura');
  const chamadoDataEncerramento = document.getElementById('chamadoDataEncerramento');
  // 🔹 NOVO: Seleção do elemento para exibir o tempo total
  const chamadoTempoTotal = document.getElementById('chamadoTempoTotal'); 
  

  function hideResults() {
    // Usando 'hidden' no lugar de 'd-none' para consistência com o CSS base do projeto
    resultadoChamadoDiv.classList.add('hidden'); 
    mensagemErroChamadoDiv.classList.add('hidden');
    mensagemErroChamadoDiv.innerHTML = '';
  }

  // Se você usa Bootstrap e 'd-none', use d-none aqui. Caso contrário, mantenha 'hidden'.
  hideResults(); 

  chamadoIdInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      buscarChamadoBtn.click();
    }
  });

  buscarChamadoBtn.addEventListener('click', async function () {
    hideResults();

    const chamadoId = chamadoIdInput.value.trim();

    if (!chamadoId) {
      mensagemErroChamadoDiv.classList.remove('hidden');
      mensagemErroChamadoDiv.innerHTML = `
        <div class="alert alert-warning text-center" role="alert">
          Por favor, digite um ID de chamado para buscar.
        </div>`;
      return;
    }

    try {
      const apiUrl = `api/consultar_chamado.php?id=${encodeURIComponent(chamadoId)}`;
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        chamadoIdDisplay.textContent = result.chamado.uuid;
        chamadoStatus.textContent = result.chamado.status;
        chamadoRequerente.textContent = result.chamado.requerente;
        chamadoDepartamento.textContent = result.chamado.departamento;
        chamadoDispositivo.textContent = result.chamado.dispositivo;
        chamadoErro.textContent = result.chamado.erro_apresentado;
        chamadoUrgencia.textContent = result.chamado.urgencia;
        chamadoComentario.textContent = result.chamado.comentario || 'N/A';
        chamadoDataAbertura.textContent = new Date(result.chamado.data_abertura).toLocaleString('pt-BR');

        // Tratamento da data de encerramento
        if (result.chamado.data_encerramento) {
          chamadoDataEncerramento.textContent = new Date(result.chamado.data_encerramento).toLocaleString('pt-BR');
        } else {
          chamadoDataEncerramento.textContent = 'Ainda não encerrado';
        }

        // 🟢 NOVO: Exibir o Tempo Total calculado pelo PHP
        // O PHP retorna o campo 'tempo_total'
        chamadoTempoTotal.textContent = result.chamado.tempo_total; 
        
        resultadoChamadoDiv.classList.remove('hidden');
      } else {
        mensagemErroChamadoDiv.classList.remove('hidden');
        mensagemErroChamadoDiv.innerHTML = `
          <div class="alert alert-danger text-center" role="alert">
            ${result.message || 'Chamado não encontrado ou erro ao buscar.'}
          </div>`;
      }

    } catch (error) {
      console.error('Erro na requisição:', error);
      mensagemErroChamadoDiv.classList.remove('hidden');
      mensagemErroChamadoDiv.innerHTML = `
        <div class="alert alert-danger text-center" role="alert">
          Ocorreu um erro ao tentar buscar o chamado. Tente novamente mais tarde.
        </div>`;
    }
  });
});