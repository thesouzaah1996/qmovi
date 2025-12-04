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
  pauseBtn.textContent = '⏸';

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.textContent = '✕';

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
      pauseBtn.textContent = '▶';
      bar.style.opacity = '0.6';
    } else {
      paused = false;
      start = performance.now();
      pauseBtn.textContent = '⏸';
      bar.style.opacity = '1';
    }
  });

  closeBtn.addEventListener('click', () => {
    if (frameId) cancelAnimationFrame(frameId);
    toast.remove();
  });
}
