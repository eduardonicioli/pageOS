// public_html/js/theme.js

document.addEventListener('DOMContentLoaded', function() {
    const themeToggleButton = document.getElementById('theme-toggle');
    const body = document.body;

    // Função para aplicar o tema salvo
    function applySavedTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            body.classList.add('dark-mode');
            if (themeToggleButton) {
                themeToggleButton.textContent = '☀️'; // Ícone de sol para indicar que está no modo escuro
            }
        } else {
            body.classList.remove('dark-mode');
            if (themeToggleButton) {
                themeToggleButton.textContent = '🌙'; // Ícone de lua para indicar que está no modo claro
            }
        }
    }

    // Aplica o tema salvo ao carregar a página
    applySavedTheme();

    // Adiciona evento de clique ao botão
    if (themeToggleButton) { // Verifica se o botão existe antes de adicionar o listener
        themeToggleButton.addEventListener('click', function() {
            body.classList.toggle('dark-mode'); // Alterna a classe 'dark-mode' no body

            // Salva a preferência no localStorage
            if (body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
                this.textContent = '☀️'; // Mudar ícone para sol
            } else {
                localStorage.setItem('theme', 'light');
                this.textContent = '🌙'; // Mudar ícone para lua
            }
        });
    }
});