document.addEventListener('DOMContentLoaded', () => {
    // 1. Mapeamento de Elementos Chave
    const DOM = {
        tabelaBody: document.getElementById('tabelaChamados'),
        alerta: document.getElementById('alertaCarregamento'),
        
        // Elementos de Filtro
        filtroStatus: document.getElementById('filtroStatus'),
        filtroUrgencia: document.getElementById('filtroUrgencia'),
        filtroDataInicio: document.getElementById('filtroDataInicio'),
        filtroDataFim: document.getElementById('filtroDataFim'),
        filtroBusca: document.getElementById('filtroBusca'),
        
        // Botões
        btnAplicar: document.getElementById('btnAplicarFiltros'),
        btnLimpar: document.getElementById('btnLimparFiltros'),
        btnSalvarStatus: document.getElementById('salvarStatusBtn'),
        
        // Modal
        modalDetalhes: document.getElementById('modalDetalhes'),
        modalUuid: document.getElementById('modalUuid'),
        modalRequerente: document.getElementById('modalRequerente'),
        modalDepartamento: document.getElementById('modalDepartamento'),
        modalDispositivo: document.getElementById('modalDispositivo'),
        modalErro: document.getElementById('modalErro'), // Mapeado para erro_apresentado
        modalUrgencia: document.getElementById('modalUrgencia'),
        modalDataAbertura: document.getElementById('modalDataAbertura'),
        modalDataEncerramento: document.getElementById('modalDataEncerramento'),
        modalTempoDecorrido: document.getElementById('modalTempoDecorrido'), // ✅ Tempo Total
        statusSelect: document.getElementById('statusSelect'),
        descricaoServico: document.getElementById('descricao_servico'),
    };
    
    // Instância do Modal do Bootstrap (null se não estiver na página)
    const bootstrapModal = DOM.modalDetalhes ? new bootstrap.Modal(DOM.modalDetalhes) : null;
    
    // 2. Inicialização e Event Listeners
    setupEventListeners();
    carregarChamadosComFiltro();


    function setupEventListeners() {
        // Aplica Filtros
        DOM.btnAplicar?.addEventListener('click', carregarChamadosComFiltro);

        // Limpa Filtros
        DOM.btnLimpar?.addEventListener('click', () => {
            DOM.filtroStatus.value = '';
            DOM.filtroUrgencia.value = '';
            DOM.filtroDataInicio.value = '';
            DOM.filtroDataFim.value = '';
            DOM.filtroBusca.value = '';
            carregarChamadosComFiltro();
        });

        // Salvar Status (Ação do Modal)
        DOM.btnSalvarStatus?.addEventListener('click', salvarStatus);
        
        // Delegação de eventos para o botão 'Detalhes' (otimiza o DOM)
        DOM.tabelaBody?.addEventListener('click', (e) => {
            const btn = e.target.closest('.btnDetalhes');
            if (btn) {
                abrirModalDetalhes(btn.dataset);
            }
        });
    }

    // 3. Lógica de Carregamento Principal (Corrigida a inserção dos TDs)
    
    async function carregarChamadosComFiltro() {
        const tabelaBody = DOM.tabelaBody;
        const alerta = DOM.alerta;
        if (!tabelaBody || !alerta) return;

        mostrarAlerta('Carregando chamados, aguarde...', 'info', alerta);
        tabelaBody.innerHTML = '';

        const filtros = {
            status: DOM.filtroStatus.value,
            urgencia: DOM.filtroUrgencia.value,
            dataInicio: DOM.filtroDataInicio.value,
            dataFim: DOM.filtroDataFim.value,
            busca: DOM.filtroBusca.value
        };

        try {
            const resposta = await fetch('api/painel_chamados.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(filtros)
            });

            const dados = await resposta.json();

            if (dados.success && Array.isArray(dados.chamados)) {
                tabelaBody.innerHTML = '';

                dados.chamados.forEach(chamado => {
                    
                    // Tratamento de valores para exibição
                    const erroDisplay = chamado.erro_apresentado || '-'; 
                    const tempoTotal = chamado.tempo_total || '-';
                    const dataAbertura = formatarData(chamado.data_abertura);
                    const dataEncerramento = formatarData(chamado.data_encerramento);
                    
                    // 🛑 CORREÇÃO CRÍTICA DA ORDEM DOS TDs ABAIXO 🛑
                    // A ordem dos TDs segue a TH: ...Encerramento, TEMPO, AÇÕES.
                    const linha = document.createElement('tr');
                    linha.innerHTML = `
                      <td>${chamado.uuid}</td>
                      <td>${chamado.requerente}</td>
                      <td>${chamado.departamento}</td>
                      <td>${chamado.dispositivo || '-'}</td>
                      <td>${erroDisplay}</td> 
                      <td>${chamado.urgencia}</td>
                      <td>${chamado.status}</td>
                      <td>${dataAbertura}</td>
                      <td>${dataEncerramento}</td>
                      
                      <td>${tempoTotal}</td> 
                      
                      <td>
                        <button class="btn btn-sm btn-outline-primary btnDetalhes" 
                          data-uuid="${chamado.uuid}" 
                          data-requerente="${chamado.requerente}" 
                          data-departamento="${chamado.departamento}"
                          data-dispositivo="${chamado.dispositivo || '-'}"
                          data-erro="${erroDisplay}" 
                          data-urgencia="${chamado.urgencia}"
                          data-status="${chamado.status}"
                          data-descricao="${chamado.descricao_servico || ''}"
                          data-data_abertura="${chamado.data_abertura}"
                          data-data_encerramento="${chamado.data_encerramento || ''}"
                          data-tempo-total="${tempoTotal}">
                          Detalhes
                        </button>
                      </td>
                    `;

                    tabelaBody.appendChild(linha);
                });

                alerta.classList.add('d-none');
            } else {
                mostrarAlerta('Nenhum chamado encontrado.', 'info', alerta);
            }
        } catch (erro) {
            console.error('Erro ao carregar chamados:', erro);
            mostrarAlerta('Erro ao conectar com o servidor ou processar os dados.', 'danger', alerta);
        }
    }

    // 4. Lógica do Modal e Ações
    
    function abrirModalDetalhes(data) {
        if (!bootstrapModal) return;

        // Mapeando dados do botão para elementos do modal
        DOM.modalUuid.textContent = data.uuid;
        DOM.modalRequerente.textContent = data.requerente;
        DOM.modalDepartamento.textContent = data.departamento;
        DOM.modalDispositivo.textContent = data.dispositivo;
        DOM.modalErro.textContent = data.erro; // erro_apresentado
        DOM.modalUrgencia.textContent = data.urgencia;
        DOM.modalDataAbertura.textContent = formatarData(data.data_abertura);
        DOM.modalDataEncerramento.textContent = formatarData(data.data_encerramento);
        DOM.modalTempoDecorrido.textContent = data.tempoTotal; // ✅ TEMPO TOTAL
        
        // Campos de Ação
        DOM.statusSelect.value = data.status;
        DOM.descricaoServico.value = data.descricao || '';
        DOM.btnSalvarStatus.dataset.uuid = data.uuid;

        bootstrapModal.show();
    }

    async function salvarStatus() {
        const uuid = DOM.btnSalvarStatus.dataset.uuid;
        const novoStatus = DOM.statusSelect.value;
        const descricao_servico = DOM.descricaoServico.value;
        
        if (!uuid) return alert('Erro: UUID do chamado não encontrado.');

        try {
            const resposta = await fetch('api/atualizar_chamado.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uuid: uuid,
                    status: novoStatus,
                    descricao_servico: descricao_servico
                })
            });

            const resultado = await resposta.json();

            if (resultado.success) {
                alert('Chamado atualizado com sucesso!');
                carregarChamadosComFiltro();
                bootstrapModal.hide();
            } else {
                alert('Erro ao atualizar chamado: ' + (resultado.message || ''));
            }
        } catch (err) {
            console.error('Erro ao atualizar chamado:', err);
            alert('Erro ao conectar com o servidor para atualização.');
        }
    }
});


// ----------------------------------------------------
// Funções Utilitárias (Mantidas fora do DOMContentLoaded para melhor organização)
// ----------------------------------------------------

function formatarData(data) {
    if (!data || data === "0000-00-00 00:00:00" || data === null) {
        return "Ainda não encerrado";
    }
    return new Date(data).toLocaleString("pt-BR");
}

function mostrarAlerta(mensagem, tipo, elemento) {
    // Note: O tipo 'info' é usado para carregamento, 'danger' para erro.
    elemento.classList.remove('d-none');
    elemento.classList.remove('alert-info', 'alert-danger');
    elemento.classList.add(`alert-${tipo}`);
    elemento.textContent = mensagem;
}