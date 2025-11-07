window.addEventListener('DOMContentLoaded', () => {
  // Ícones
  if (window.lucide && lucide.createIcons) lucide.createIcons();

  // Ano auto
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Dropdown do usuário
  const btn = document.getElementById('userBtn');
  const menu = document.getElementById('userMenu');

  const closeMenu = () => {
    if (!menu) return;
    menu.removeAttribute('open');
    btn?.setAttribute('aria-expanded', 'false');
    document.removeEventListener('click', onClickOutside);
    document.removeEventListener('keydown', onEsc);
  };
  const onEsc = (e) => { if (e.key === 'Escape') closeMenu(); };
  const onClickOutside = (e) => { if (!menu.contains(e.target) && !btn.contains(e.target)) closeMenu(); };

  btn?.addEventListener('click', () => {
    if (!menu) return;
    const isOpen = menu.hasAttribute('open');
    if (isOpen) closeMenu();
    else {
      menu.setAttribute('open', '');
      btn.setAttribute('aria-expanded', 'true');
      setTimeout(() => {
        document.addEventListener('click', onClickOutside);
        document.addEventListener('keydown', onEsc);
      }, 0);
    }
  });

  // // Placeholders de navegação (trocar por rotas reais depois)
  // document.querySelectorAll('.module').forEach(card => {
  //   card.addEventListener('click', (e) => {
  //     e.preventDefault();
  //     const mod = card.getAttribute('data-module') || '';
  //     alert('Abrir módulo: ' + mod.toUpperCase());
  //   });
  // });

  // Logout simulado
  document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    alert('Encerrar sessão e voltar para o login');
  });
});
