document.addEventListener('DOMContentLoaded', () => {
  carregarChamadosComFiltro();

  document.getElementById('btnAplicarFiltros').addEventListener('click', () => {
    carregarChamadosComFiltro();
  });

  document.getElementById('btnLimparFiltros').addEventListener('click', () => {
    document.getElementById('filtroStatus').value = '';
    document.getElementById('filtroUrgencia').value = '';
    document.getElementById('filtroDataInicio').value = '';
    document.getElementById('filtroDataFim').value = '';
    document.getElementById('filtroBusca').value = '';
    carregarChamadosComFiltro();
  });

  document.getElementById('salvarStatusBtn').addEventListener('click', async () => {
    const uuid = document.getElementById('salvarStatusBtn').dataset.uuid;
    const novoStatus = document.getElementById('statusSelect').value;
    const descricao_servico = document.getElementById('descricao_servico').value;

    try {
      const resposta = await fetch('api/atualizar_chamado.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uuid,
          status: novoStatus,
          descricao_servico: descricao_servico
        })
      });

      const resultado = await resposta.json();

      if (resultado.success) {
        alert('Chamado atualizado com sucesso!');
        carregarChamadosComFiltro();
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalDetalhes'));
        modal.hide();
      } else {
        alert('Erro ao atualizar chamado: ' + (resultado.message || ''));
      }
    } catch (err) {
      console.error('Erro ao atualizar chamado:', err);
      alert('Erro ao atualizar chamado.');
    }
  });
});

async function carregarChamadosComFiltro() {
  const tabelaBody = document.getElementById('tabelaChamados');
  const alerta = document.getElementById('alertaCarregamento');
  if (!tabelaBody || !alerta) return;

  alerta.classList.remove('d-none');
  alerta.classList.replace('alert-danger', 'alert-info');
  alerta.textContent = 'Carregando chamados, aguarde...';

  const filtros = {
    status: document.getElementById('filtroStatus').value,
    urgencia: document.getElementById('filtroUrgencia').value,
    dataInicio: document.getElementById('filtroDataInicio').value,
    dataFim: document.getElementById('filtroDataFim').value,
    busca: document.getElementById('filtroBusca').value
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
        const linha = document.createElement('tr');
        linha.innerHTML = `
          <td>${chamado.uuid}</td>
          <td>${chamado.requerente}</td>
          <td>${chamado.departamento}</td>
          <td>${chamado.dispositivo || '-'}</td>
          <td>${chamado.erro || '-'}</td>
          <td>${chamado.urgencia}</td>
          <td>${chamado.status}</td>
          <td>${new Date(chamado.data_abertura).toLocaleString('pt-BR')}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary btnDetalhes" 
              data-uuid="${chamado.uuid}" 
              data-requerente="${chamado.requerente}" 
              data-departamento="${chamado.departamento}"
              data-dispositivo="${chamado.dispositivo || '-'}"
              data-erro="${chamado.erro || '-'}"
              data-urgencia="${chamado.urgencia}"
              data-status="${chamado.status}"
              data-descricao="${chamado.descricao_servico || ''}">
              Detalhes
            </button>
          </td>
        `;
        tabelaBody.appendChild(linha);
      });

      document.querySelectorAll('.btnDetalhes').forEach(btn => {
        btn.addEventListener('click', () => abrirModalDetalhes(btn.dataset));
      });

      alerta.classList.add('d-none');
    } else {
      mostrarAlerta('Nenhum chamado encontrado.', alerta);
    }
  } catch (erro) {
    console.error('Erro ao carregar chamados:', erro);
    mostrarAlerta('Erro ao conectar com o servidor ou processar os dados.', alerta);
  }
}

function mostrarAlerta(mensagem, elemento) {
  elemento.classList.remove('d-none');
  elemento.classList.replace('alert-info', 'alert-danger');
  elemento.textContent = mensagem;
}

function abrirModalDetalhes(data) {
  const modal = new bootstrap.Modal(document.getElementById('modalDetalhes'));
  document.getElementById('modalUuid').textContent = data.uuid;
  document.getElementById('modalRequerente').textContent = data.requerente;
  document.getElementById('modalDepartamento').textContent = data.departamento;
  document.getElementById('modalDispositivo').textContent = data.dispositivo;
  document.getElementById('modalErro').textContent = data.erro;
  document.getElementById('modalUrgencia').textContent = data.urgencia;
  document.getElementById('statusSelect').value = data.status;
  document.getElementById('descricao_servico').value = data.descricao || '';
  document.getElementById('salvarStatusBtn').dataset.uuid = data.uuid;

  modal.show();
}
