// public_html/js/abrir_chamado.js

// Garante que o script só execute depois que o DOM estiver completamente carregado
document.addEventListener('DOMContentLoaded', function() {
    // Seleciona os elementos HTML necessários do formulário
    const form = document.getElementById('formAbrirChamado');
    const requerenteInput = document.getElementById('requerente');
    const urgenciaSelect = document.getElementById('urgencia');
    const departamentoSelect = document.getElementById('departamento');
    const dispositivoSelect = document.getElementById('dispositivo');
    const erroApresentadoSelect = document.getElementById('erroApresentado');
    const outroErroContainer = document.getElementById('outroErroContainer');
    const outroErroInput = document.getElementById('outroErro');
    const comentarioTextarea = document.getElementById('comentario');

    // --- Lógica para mostrar/esconder o campo "Outro" ---
    erroApresentadoSelect.addEventListener('change', function() {
        if (this.value === 'Outro') {
            outroErroContainer.classList.remove('hidden'); // Mostra o contêiner
            outroErroInput.setAttribute('required', 'required'); // Torna o campo de texto obrigatório
            outroErroInput.focus(); // Coloca o foco no novo campo
        } else {
            outroErroContainer.classList.add('hidden'); // Esconde o contêiner
            outroErroInput.removeAttribute('required'); // Remove a obrigatoriedade
            outroErroInput.value = ''; // Limpa o valor se for ocultado
        }
    });

    // --- Lógica de Submissão do Formulário ---
    form.addEventListener('submit', async function(event) {
        event.preventDefault(); // Impede o envio padrão do formulário (que recarregaria a página)

        // Coleta os valores de todos os campos do formulário
        const requerente = requerenteInput.value.trim();
        const urgencia = urgenciaSelect.value;
        const departamento = departamentoSelect.value;
        const dispositivo = dispositivoSelect.value;
        let erroApresentado = erroApresentadoSelect.value; // Pega o valor selecionado no dropdown
        const comentario = comentarioTextarea.value.trim();
        const horaAbertura = new Date().toISOString(); // Gera a data/hora atual no formato ISO (universal)

        // Se a opção "Outro" foi selecionada, pega o valor do campo de texto livre
        if (erroApresentado === 'Outro') {
            erroApresentado = outroErroInput.value.trim();
        }

        // --- Validação Básica dos Campos Obrigatórios ---
        // Verifica se algum campo obrigatório está vazio (incluindo as seleções iniciais dos dropdowns)
        if (!requerente || !urgencia || !departamento || !dispositivo || !erroApresentadoSelect.value) {
            alert('Por favor, preencha todos os campos obrigatórios (incluindo as seleções).');
            return; // Interrompe a função se a validação falhar
        }
        // Validação específica para o campo 'Outro' se ele foi selecionado
        if (erroApresentadoSelect.value === 'Outro' && !outroErroInput.value.trim()) {
            alert('Por favor, descreva o erro em detalhes no campo "Outro".');
            return;
        }
        // Validação de comprimento para o campo de comentário (exemplo)
        if (comentario.length > 500) {
            alert('O comentário é muito longo. Máximo de 500 caracteres.');
            return;
        }

        // Cria um objeto com os dados do chamado para enviar ao backend
        const dadosChamado = {
            horaAbertura: horaAbertura,
            requerente: requerente,
            urgencia: urgencia,
            departamento: departamento,
            dispositivo: dispositivo,
            erroApresentado: erroApresentado, // Já contém a descrição de 'Outro' se aplicável
            comentario: comentario
        };

        // --- Envio dos Dados para o Backend PHP ---
        // A URL será relativa, pois o script PHP estará no mesmo domínio
        const apiUrl = 'api/processar_chamado.php'; 

        try {
            // Usa a API Fetch para fazer uma requisição POST para o seu script PHP
            const response = await fetch(apiUrl, {
                method: 'POST', // Método HTTP para enviar dados
                headers: {
                    'Content-Type': 'application/json' // Informa que o corpo da requisição é JSON
                },
                body: JSON.stringify(dadosChamado) // Converte o objeto JavaScript em uma string JSON
            });

            const result = await response.json(); // Converte a resposta do servidor de JSON para um objeto JavaScript

            if (response.ok) { // Verifica se a resposta HTTP indica sucesso (status 200-299)
                if (result.success) { // Verifica a propriedade 'success' na resposta JSON do PHP
                    alert(`Chamado aberto com sucesso! ID do Chamado: ${result.chamadoId}\n\n` +
                          `Por favor, anote este ID para acompanhar seu chamado.`);
                    
                    // Limpar o formulário após o envio bem-sucedido
                    form.reset(); // Reseta todos os campos do formulário para os valores iniciais
                    outroErroContainer.classList.add('hidden'); // Esconde o campo 'Outro' novamente
                    outroErroInput.removeAttribute('required'); // Remove a obrigatoriedade
                    outroErroInput.value = ''; // Garante que o campo 'Outro' esteja limpo
                    requerenteInput.focus(); // Coloca o foco de volta no primeiro campo
                } else {
                    alert(`Erro ao abrir o chamado: ${result.message || 'Erro desconhecido.'}`);
                }
            } else {
                // Se a resposta HTTP não for de sucesso, exibe a mensagem de erro HTTP
                alert(`Erro no servidor (Status: ${response.status}): ${result.message || 'Erro desconhecido.'}`);
            }
        } catch (error) {
            // Captura erros de rede ou de parsing do JSON
            console.error('Erro na requisição ou ao processar resposta:', error);
            alert('Não foi possível conectar ao servidor ou processar a resposta. Verifique sua conexão ou tente novamente mais tarde.');
        }
    });
});