// public_html/js/theme.js

document.addEventListener('DOMContentLoaded', () => {
  const themeToggleButton = document.getElementById('theme-toggle');
  const body = document.body;

  const applyTheme = (theme) => {
    if (theme === 'dark') {
      body.classList.add('dark-mode');
      if (themeToggleButton) themeToggleButton.textContent = '☀️';
    } else {
      body.classList.remove('dark-mode');
      if (themeToggleButton) themeToggleButton.textContent = '🌙';
    }
  };

  // Aplica o tema salvo no localStorage, ou padrão light
  const savedTheme = localStorage.getItem('theme') || 'light';
  applyTheme(savedTheme);

  if (themeToggleButton) {
    themeToggleButton.addEventListener('click', () => {
      const isDarkMode = body.classList.toggle('dark-mode');
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
      themeToggleButton.textContent = isDarkMode ? '☀️' : '🌙';
    });
  }
});
