document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('formAbrirChamado');
    const requerenteInput = document.getElementById('requerente');
    const urgenciaSelect = document.getElementById('urgencia');
    const departamentoSelect = document.getElementById('departamento');
    const dispositivoSelect = document.getElementById('dispositivo');
    const erroApresentadoSelect = document.getElementById('erroApresentado');
    const outroErroContainer = document.getElementById('outroErroContainer');
    const outroErroInput = document.getElementById('outroErro');
    const comentarioTextarea = document.getElementById('comentario');

    // Manipula a visibilidade do campo "Outro Erro"
    erroApresentadoSelect.addEventListener('change', function () {
        if (this.value === 'Outro') {
            outroErroContainer.classList.remove('hidden');
            outroErroInput.setAttribute('required', 'required');
            outroErroInput.focus();
        } else {
            outroErroContainer.classList.add('hidden');
            outroErroInput.removeAttribute('required');
            outroErroInput.value = '';
        }
    });

    // Manipula o envio do formulário
    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const requerente = requerenteInput.value.trim();
        const urgencia = urgenciaSelect.value;
        const departamento = departamentoSelect.value;
        const dispositivo = dispositivoSelect.value;
        let erroApresentado = erroApresentadoSelect.value;
        const comentario = comentarioTextarea.value.trim();
        const horaAbertura = new Date().toISOString();

        if (erroApresentado === 'Outro') {
            erroApresentado = outroErroInput.value.trim();
        }

        if (!requerente || !urgencia || !departamento || !dispositivo || !erroApresentado) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        if (erroApresentadoSelect.value === 'Outro' && !outroErroInput.value.trim()) {
            alert('Por favor, descreva o erro em detalhes no campo "Outro".');
            return;
        }

        if (comentario.length > 500) {
            alert('O comentário é muito longo. Máximo de 500 caracteres.');
            return;
        }

        const dadosChamado = {
            horaAbertura,
            requerente,
            urgencia,
            departamento,
            dispositivo,
            erroApresentado,
            comentario
        };

        try {
            const response = await fetch('api/processar_chamado.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosChamado)
            });

            console.log('Resposta do servidor:', response);
            const result = await response.json();
            console.log('Dados recebidos:', result);

            if (response.ok && result.success) {
                alert(`Chamado aberto com sucesso! ID: ${result.chamadoId}`);
                form.reset();
                outroErroContainer.classList.add('hidden');
                outroErroInput.removeAttribute('required');
                outroErroInput.value = '';
                requerenteInput.focus();
            } else {
                alert(`Erro: ${result.message || 'Erro desconhecido.'}`);
            }
        } catch (error) {
            console.error('Erro ao enviar o chamado:', error);
            alert('Erro ao enviar o chamado. Tente novamente.');
        }
    });
});