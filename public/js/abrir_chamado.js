// public_html/js/abrir_chamado.js

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formAbrirChamado');
  const requerenteInput = document.getElementById('requerente');
  const urgenciaSelect = document.getElementById('urgencia');
  const departamentoSelect = document.getElementById('departamento');
  const dispositivoSelect = document.getElementById('dispositivo');
  const erroApresentadoSelect = document.getElementById('erroApresentado');
  const outroErroContainer = document.getElementById('outroErroContainer');
  const outroErroInput = document.getElementById('outroErro');
  const comentarioTextarea = document.getElementById('comentario');

  const feedbackModalElement = document.getElementById('feedbackModal');
  const feedbackModal = new bootstrap.Modal(feedbackModalElement);
  const feedbackModalLabel = document.getElementById('feedbackModalLabel');
  const feedbackModalBody = document.getElementById('feedbackModalBody');

  erroApresentadoSelect.addEventListener('change', () => {
    if (erroApresentadoSelect.value === 'Outro') {
      outroErroContainer.classList.remove('hidden');
      outroErroInput.setAttribute('required', 'required');
      outroErroInput.focus();
    } else {
      outroErroContainer.classList.add('hidden');
      outroErroInput.removeAttribute('required');
      outroErroInput.value = '';
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const requerente = requerenteInput.value.trim();
    const urgencia = urgenciaSelect.value;
    const departamento = departamentoSelect.value;
    const dispositivo = dispositivoSelect.value;
    const comentario = comentarioTextarea.value.trim();
    let erroApresentado = erroApresentadoSelect.value === 'Outro' ? outroErroInput.value.trim() : erroApresentadoSelect.value;
    const horaAbertura = new Date().toISOString();

    if (!requerente || !urgencia || !departamento || !dispositivo || !erroApresentado) {
      mostrarFeedback('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (erroApresentadoSelect.value === 'Outro' && !erroApresentado) {
      mostrarFeedback('Erro', 'Por favor, descreva o erro em detalhes no campo "Outro".');
      return;
    }

    if (comentario.length > 500) {
      mostrarFeedback('Erro', 'O comentário é muito longo. Máximo de 500 caracteres.');
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

      const result = await response.json();

      if (response.ok && result.success) {
        feedbackModalLabel.textContent = 'Sucesso';
        feedbackModalBody.innerHTML = `
          <div class="text-center">
            <p class="fs-5 mb-3">Chamado aberto com sucesso!</p>
            <p>Anote o ID do chamado:</p>
            <h4 class="fw-bold text-primary" id="chamadoIdTexto">${result.chamadoId}</h4>
            <button type="button" class="btn btn-outline-primary btn-sm mt-2" id="btnCopiarOS">Copiar</button>
            <div class="mt-3">
              <a href="https://forms.gle/xGKHHnJSYULA31GS7" target="_blank" class="btn btn-success btn-sm">
                📋 Enviar Feedback sobre o Atendimento
              </a>
            </div>
          </div>
        `;
        feedbackModal.show();

        const btnCopiarOS = document.getElementById('btnCopiarOS');
if (btnCopiarOS) {
  btnCopiarOS.addEventListener('click', () => {
    const texto = document.getElementById('chamadoIdTexto')?.innerText;

        if (!texto) {
            alert('Erro: ID do chamado não encontrado!');
            return;
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(texto)
                .then(() => {
                    btnCopiarOS.textContent = 'Copiado!';
                    setTimeout(() => btnCopiarOS.textContent = 'Copiar', 2000);
                })
                .catch((err) => {
                    console.error('Erro no clipboard API:', err);
                    copiarTextoFallback(texto);
            });
        } else {
        copiarTextoFallback(texto);
        }

        function copiarTextoFallback(valor) {
        const temp = document.createElement('textarea');
        temp.value = valor;
        document.body.appendChild(temp);
        temp.select();
        try {
            const sucesso = document.execCommand('copy');
            btnCopiarOS.textContent = sucesso ? 'Copiado!' : 'Erro ao copiar';
        } catch (err) {
            console.error('Fallback falhou:', err);
            btnCopiarOS.textContent = 'Erro ao copiar';
        }
        document.body.removeChild(temp);
        setTimeout(() => btnCopiarOS.textContent = 'Copiar', 2000);
        }
    });
    }


        form.reset();
        outroErroContainer.classList.add('hidden');
        outroErroInput.removeAttribute('required');
        outroErroInput.value = '';
        requerenteInput.focus();
      } else {
        mostrarFeedback('Erro', result.message || 'Erro desconhecido.');
      }
    } catch (error) {
      console.error('Erro ao enviar o chamado:', error);
      mostrarFeedback('Erro', 'Erro ao enviar o chamado. Tente novamente.');
    }
  });

  function mostrarFeedback(titulo, mensagem) {
    feedbackModalLabel.textContent = titulo;
    feedbackModalBody.textContent = mensagem;
    feedbackModal.show();
  }
});
