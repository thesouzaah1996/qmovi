window.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();

  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  const btn = document.getElementById('userBtn');
  const menu = document.getElementById('userMenu');

  const closeMenu = () => {
    menu?.removeAttribute('open');
    btn?.setAttribute('aria-expanded','false');
    document.removeEventListener('click', onOutside);
    document.removeEventListener('keydown', onEsc);
  };
  const onEsc = e => { if (e.key === 'Escape') closeMenu(); };
  const onOutside = e => { if (!menu.contains(e.target) && !btn.contains(e.target)) closeMenu(); };

  btn?.addEventListener('click', () => {
    const open = menu.hasAttribute('open');
    if (open) closeMenu();
    else {
      menu.setAttribute('open','');
      btn.setAttribute('aria-expanded','true');
      setTimeout(() => {
        document.addEventListener('click', onOutside);
        document.addEventListener('keydown', onEsc);
      }, 0);
    }
  });
});
