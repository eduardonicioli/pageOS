// public_html/js/acompanhar_chamado.js

document.addEventListener('DOMContentLoaded', function() {
    const chamadoIdInput = document.getElementById('chamadoIdInput');
    const buscarChamadoBtn = document.getElementById('buscarChamadoBtn');
    const resultadoChamadoDiv = document.getElementById('resultadoChamado');
    const mensagemErroChamadoDiv = document.getElementById('mensagemErroChamado');

    // Elementos para exibir os detalhes do chamado
    const chamadoIdDisplay = document.getElementById('chamadoIdDisplay');
    const chamadoStatus = document.getElementById('chamadoStatus');
    const chamadoRequerente = document.getElementById('chamadoRequerente');
    const chamadoDepartamento = document.getElementById('chamadoDepartamento');
    const chamadoDispositivo = document.getElementById('chamadoDispositivo');
    const chamadoErro = document.getElementById('chamadoErro');
    const chamadoUrgencia = document.getElementById('chamadoUrgencia');
    const chamadoComentario = document.getElementById('chamadoComentario');
    const chamadoDataAbertura = document.getElementById('chamadoDataAbertura');

    // Esconde os elementos de resultado e erro no início
    function hideResults() {
        resultadoChamadoDiv.classList.add('hidden');
        mensagemErroChamadoDiv.classList.add('hidden');
        mensagemErroChamadoDiv.textContent = ''; // Limpa a mensagem de erro
    }

    hideResults(); // Garante que estejam ocultos ao carregar a página

    buscarChamadoBtn.addEventListener('click', async function() {
        hideResults(); // Esconde resultados anteriores antes de uma nova busca
        const chamadoId = chamadoIdInput.value.trim();

        if (!chamadoId) {
            mensagemErroChamadoDiv.classList.remove('hidden');
            mensagemErroChamadoDiv.textContent = 'Por favor, digite um ID de chamado para buscar.';
            return;
        }

        try {
            // A URL aponta para o novo endpoint PHP para consultar chamados
            const apiUrl = `api/consultar_chamado.php?id=${encodeURIComponent(chamadoId)}`;
            
            const response = await fetch(apiUrl, {
                method: 'GET', // Requisição GET para buscar dados
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Preenche os elementos com os dados do chamado
                chamadoIdDisplay.textContent = result.chamado.uuid;
                chamadoStatus.textContent = result.chamado.status;
                chamadoRequerente.textContent = result.chamado.requerente;
                chamadoDepartamento.textContent = result.chamado.departamento;
                chamadoDispositivo.textContent = result.chamado.dispositivo;
                chamadoErro.textContent = result.chamado.erro_apresentado;
                chamadoUrgencia.textContent = result.chamado.urgencia;
                chamadoComentario.textContent = result.chamado.comentario || 'N/A'; // Exibe N/A se não houver comentário
                chamadoDataAbertura.textContent = new Date(result.chamado.data_abertura).toLocaleString('pt-BR'); // Formata a data

                resultadoChamadoDiv.classList.remove('hidden'); // Mostra a seção de resultados
            } else {
                mensagemErroChamadoDiv.classList.remove('hidden');
                mensagemErroChamadoDiv.textContent = result.message || 'Chamado não encontrado ou erro ao buscar.';
            }

        } catch (error) {
            console.error('Erro na requisição ou ao processar resposta:', error);
            mensagemErroChamadoDiv.classList.remove('hidden');
            mensagemErroChamadoDiv.textContent = 'Ocorreu um erro ao tentar buscar o chamado. Tente novamente mais tarde.';
        }
    });
});