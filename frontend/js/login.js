(() => {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const toggleBtn = document.getElementById('togglePassword');
  const senha = document.getElementById('senha');
  if (toggleBtn && senha) {
    const openIcon = '👁️';
    const closedIcon = '🙈';
    toggleBtn.textContent = closedIcon;
    toggleBtn.addEventListener('click', () => {
      const isPwd = senha.getAttribute('type') === 'password';
      senha.setAttribute('type', isPwd ? 'text' : 'password');
      toggleBtn.setAttribute('aria-pressed', String(isPwd));
      toggleBtn.textContent = isPwd ? openIcon : closedIcon;
    });
  }

  const form = document.getElementById('loginForm');
  if (!form) return;

  const feedback = document.getElementById('feedback');
  if (feedback) {
    feedback.textContent = '';
    feedback.style.display = 'none';
  }

  const API_BASE = 'http://localhost:8081';

  const toastHost = document.getElementById('toastHost') || (() => {
    const host = document.createElement('div');
    host.id = 'toastHost';
    host.className = 'toast-host';
    document.body.prepend(host);
    return host;
  })();

  function showToast({ title, message, variant = 'error', duration = 7500 }) {
    const toast = document.createElement('div');
    toast.className = 'toast ' + (variant === 'success' ? 'success' : 'error');

    const titleEl = document.createElement('p');
    titleEl.className = 'title';
    titleEl.textContent = title;

    const msgEl = document.createElement('p');
    msgEl.className = 'msg';
    msgEl.textContent = message;

    const progress = document.createElement('div');
    progress.className = 'progress';
    const bar = document.createElement('i');
    bar.style.transformOrigin = 'left';
    bar.style.transform = 'scaleX(1)';
    bar.style.animation = 'none';
    progress.appendChild(bar);

    const controls = document.createElement('div');
    controls.className = 'toast-controls';

    const pauseBtn = document.createElement('button');
    pauseBtn.type = 'button';
    pauseBtn.innerHTML = '⏸';

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.innerHTML = '✕';

    controls.appendChild(pauseBtn);
    controls.appendChild(closeBtn);

    toast.appendChild(controls);
    toast.appendChild(titleEl);
    toast.appendChild(msgEl);
    toast.appendChild(progress);

    toastHost.appendChild(toast);

    let total = duration;
    let remaining = total;
    let start = performance.now();
    let paused = false;
    let frameId;

    function tick(now) {
      if (paused) {
        frameId = requestAnimationFrame(tick);
        return;
      }

      const elapsed = now - start;
      const ratio = Math.max(0, 1 - elapsed / remaining);
      bar.style.transform = `scaleX(${ratio})`;

      if (elapsed >= remaining) {
        toast.remove();
        return;
      }

      frameId = requestAnimationFrame(tick);
    }

    frameId = requestAnimationFrame(tick);

    pauseBtn.addEventListener('click', () => {
      if (!paused) {
        const now = performance.now();
        const elapsed = now - start;
        remaining = Math.max(0, remaining - elapsed);
        paused = true;
        bar.style.opacity = '0.7';
        pauseBtn.innerHTML = '▶';
      } else {
        paused = false;
        start = performance.now();
        bar.style.opacity = '1';
        pauseBtn.innerHTML = '⏸';
      }
    });

    closeBtn.addEventListener('click', () => {
      if (frameId) cancelAnimationFrame(frameId);
      toast.remove();
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const usuario = document.getElementById('usuario');
    const senhaInput = document.getElementById('senha');

    const missing = [];
    if (!usuario.value.trim()) missing.push('usuário');
    if (!senhaInput.value.trim()) missing.push('senha');

    if (missing.length) {
      showToast({
        title: 'Verifique os campos',
        message: `Preencha ${missing.join(' e ')}.`,
        variant: 'error'
      });
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario: usuario.value.trim(),
          senha: senhaInput.value
        }),
        credentials: 'include'
      });

      if (response.ok) {
        // const data = await response.json();
        // localStorage.setItem('tokenDeAcesso', data.tokenDeAcesso);

        showToast({
          title: 'Login realizado',
          message: 'Login realizado com sucesso.',
          variant: 'success'
        });

        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 800);

        return;
      }

      if (response.status === 401 || response.status === 403) {
        showToast({
          title: 'Não foi possível entrar',
          message: 'Usuário ou senha inválidos.',
          variant: 'error'
        });
        return;
      }

      showToast({
        title: 'Não foi possível entrar',
        message: 'Não foi possível concluir o login no momento. Tente novamente em instantes.',
        variant: 'error'
      });
    } catch (err) {
      showToast({
        title: 'Não foi possível entrar',
        message: 'Não foi possível concluir o login no momento. Tente novamente em instantes.',
        variant: 'error'
      });
    }
  });
})();
