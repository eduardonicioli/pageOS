<?php
// public_html/api/calculo_tempo.php
date_default_timezone_set('America/Sao_Paulo');

/**
 * Calcula o tempo decorrido entre duas datas e formata de forma legível.
 *
 * @param string $data_abertura Data e hora de abertura (formato MySQL).
 * @param string|null $data_encerramento Data e hora de encerramento. Se nula, usa o tempo atual.
 * @return string Tempo formatado (ex: "3 dias, 5 horas e 12 minutos").
 */
function calcularTempoChamado($data_abertura, $data_encerramento = null) {
    // Retorna string de erro se a data de abertura não for válida.
    if (empty($data_abertura)) {
        return 'N/A';
    }
    
    try {
        $inicio = new DateTime($data_abertura);
        // Usa a data de encerramento se existir, senão usa a data/hora atual.
        $fim = !empty($data_encerramento) ? new DateTime($data_encerramento) : new DateTime();
        
        $intervalo = $inicio->diff($fim);
        
        $partes = [];
        if ($intervalo->y > 0) $partes[] = $intervalo->y . ' ano';
        if ($intervalo->m > 0) $partes[] = $intervalo->m . ' mês';
        if ($intervalo->d > 0) $partes[] = $intervalo->d . ' dia';
        if ($intervalo->h > 0) $partes[] = $intervalo->h . ' hora';
        if ($intervalo->i > 0) $partes[] = $intervalo->i . ' minuto';
        
        // Se a duração for muito curta, mostra segundos, senão retorna "Menos de um minuto".
        if (empty($partes)) {
             return ($intervalo->s > 0) ? $intervalo->s . ' segundo(s)' : 'Menos de um minuto';
        }
        
        // Junta as partes formatadas (ex: 3 dias, 5 horas e 12 minutos)
        $ultimo = array_pop($partes);
        
        if (empty($partes)) {
            return $ultimo;
        }
        
        return implode(', ', $partes) . ' e ' . $ultimo;

    } catch (Exception $e) {
        // Em caso de erro de data (formato inválido)
        return 'Erro no cálculo do tempo.';
    }
}
?>