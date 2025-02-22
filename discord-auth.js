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
    fetch('https://rohanov.pythonanywhere.com')
      .then(response => response.json())
      .then(data => {
        if (data.authorization_url) {
          window.location.href = data.authorization_url;
        } else {
          console.error('Failed to get authorization URL:', data);
          alert('Failed to initiate Discord login.');
        }
      })
      .catch(error => {
        console.error('Error fetching authorization URL:', error);
        alert('Failed to initiate Discord login.');
      });
  });
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  if (code) {
    fetch('https://rohanov.pythonanywhere.com' + code)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          localStorage.setItem('discord_token', data.token);
          localStorage.setItem('discord_avatar', data.avatar);
          updateUI();
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          console.error('Authentication error:', data.error);
          alert('Discord authentication failed.');
        }
      })
      .catch(error => {
        console.error('Error during authentication:', error);
        alert('An error occurred during Discord authentication.');
      });
  }
});   
