document.addEventListener('DOMContentLoaded', function() {
  const loginButton = document.getElementById('discord-login-button');
  const avatar = document.getElementById('discord-avatar');
  const authContainer = document.getElementById('discord-auth-container');
  function isLoggedIn() {
    return localStorage.getItem('discord_token') !== null;
  }
  function updateUI() {
    if (isLoggedIn()) {
      loginButton.style.display = 'none';
      avatar.style.display = 'block';
      avatar.src = localStorage.getItem('discord_avatar');
    } else {
      loginButton.style.display = 'block';
      avatar.style.display = 'none';
      avatar.src = '';
    }
  }
  updateUI();
  loginButton.addEventListener('click', function() {
    const clientId = '1342803370859298826';
    const redirectUri = 'https://discord.com/oauth2/authorize?client_id=1342803370859298826&response_type=code&redirect_uri=http%3A%2F%2Fscp-sp.ru&scope=identify';
    const scope = 'identify';
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}`;
    window.location.href = discordAuthUrl;
  });
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  if (code) {
    fetch('/api/discord/callback?code=' + code)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          localStorage.setItem('discord_token', data.token);
          localStorage.setItem('discord_avatar', data.avatar);

          updateUI();

          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          console.error('Ошибка аутентификации:', data.error);
          alert('Ошибка аутентификации через Discord.');
        }
      })
      .catch(error => {
        console.error('Ошибка при обмене кода на токен:', error);
        alert('Произошла ошибка при аутентификации через Discord.');
      });
  }
});
