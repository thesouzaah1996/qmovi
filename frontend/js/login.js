(() => {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const toggleBtn = document.getElementById('togglePassword');
  const senha = document.getElementById('senha');
  if (toggleBtn && senha) { toggleBtn.textContent = '👁️‍🗨️';
    toggleBtn.addEventListener('click', () => {
      const isPwd = senha.getAttribute('type') === 'password';
      senha.setAttribute('type', isPwd ? 'text' : 'password');
      toggleBtn.setAttribute('aria-pressed', String(isPwd));
      // icon: open eye when showing, crossed/alternate when hidden
      toggleBtn.textContent = isPwd ? '👁️‍🗨️' : '👁️‍🗨️';
    });
  }

  const form = document.getElementById('loginForm');
  const feedback = document.getElementById('feedback');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const usuario = document.getElementById('usuario');
      const senha = document.getElementById('senha');

      const missing = [];
      if (!usuario.value.trim()) missing.push('usuário');
      if (!senha.value.trim()) missing.push('senha');

      if (missing.length) {
        feedback.textContent = `Preencha ${missing.join(' e ')}.`;
        feedback.style.color = '#b42318';
        return;
      }
      // Aqui você faria a chamada ao backend (fetch).
      feedback.textContent = 'Validando...';
      feedback.style.color = '#5b6b7a';
      setTimeout(() => {
        feedback.textContent = 'Pronto para enviar ao backend.';
        feedback.style.color = '#0a7a3d';
      }, 600);
    });
  }
})();