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
        resultadoChamadoDiv.classList.add('d-none');
        mensagemErroChamadoDiv.classList.add('d-none');
        mensagemErroChamadoDiv.innerHTML = ''; // Limpa a mensagem de erro
    }

    hideResults(); // Inicialmente oculta

    // Permite ENTER para buscar
    chamadoIdInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            buscarChamadoBtn.click();
        }
    });

    buscarChamadoBtn.addEventListener('click', async function() {
        hideResults(); // Limpa tela

        const chamadoId = chamadoIdInput.value.trim();

        if (!chamadoId) {
            mensagemErroChamadoDiv.classList.remove('d-none');
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
                headers: { 'Content-Type': 'application/json' }
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

                resultadoChamadoDiv.classList.remove('d-none');
            } else {
                mensagemErroChamadoDiv.classList.remove('d-none');
                mensagemErroChamadoDiv.innerHTML = `
                    <div class="alert alert-danger text-center" role="alert">
                        ${result.message || 'Chamado não encontrado ou erro ao buscar.'}
                    </div>`;
            }

        } catch (error) {
            console.error('Erro na requisição:', error);
            mensagemErroChamadoDiv.classList.remove('d-none');
            mensagemErroChamadoDiv.innerHTML = `
                <div class="alert alert-danger text-center" role="alert">
                    Ocorreu um erro ao tentar buscar o chamado. Tente novamente mais tarde.
                </div>`;
        }
    });
});
