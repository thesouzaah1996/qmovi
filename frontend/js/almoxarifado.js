/* ========= MENU DO USUÁRIO ========= */
(() => {
  const btn = document.getElementById('avatarBtn');
  const menu = document.getElementById('userMenu');
  if (!btn || !menu) return;

  const open = () => { menu.classList.add('open'); btn.setAttribute('aria-expanded','true'); };
  const close = () => { menu.classList.remove('open'); btn.setAttribute('aria-expanded','false'); };
  const toggle = () => (menu.classList.contains('open') ? close() : open());

  btn.addEventListener('click', (e) => { e.stopPropagation(); toggle(); });
  document.addEventListener('click', (e) => { if (!menu.contains(e.target) && !btn.contains(e.target)) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  menu.addEventListener('click', (e) => {
    const item = e.target.closest('.menu-item');
    if (!item) return;
    const action = item.dataset.action;
    if (action === 'profile') { console.log('Editar perfil…'); close(); }
    if (action === 'logout')  { console.log('Sair…'); close(); }
  });
})();

/* ========= MOCK: DADOS CHUMBADOS ========= */
const MOCK_PRODUCTS = [
  { id: 101, sku: 'PLT-AB123', name: 'Pé de mesa aço 70cm', category: 'Ferragens', unit: 'un', stock: 36, location: 'A-01-03', min: 10 },
  { id: 102, sku: 'MDP-18BR',  name: 'Chapa MDP 18mm Branca', category: 'Madeiras',  unit: 'cx', stock: 8,  location: 'B-02-01', min: 6  },
  { id: 103, sku: 'PAR-8X40',  name: 'Parafuso 8x40 zincado', category: 'Parafusos', unit: 'kg', stock: 12, location: 'C-05-02', min: 5  }
];

/* ========= ELEMENTOS ========= */
const gridBody      = document.getElementById('gridBody');
const listCount     = document.getElementById('listCount');
const btnNew        = document.getElementById('btnNew');
const btnClearAll   = document.getElementById('btnClearAll');

const dlgProduto    = document.getElementById('modalProduto');
const tituloProd    = document.getElementById('produtoTitulo');
const formProduto   = document.getElementById('formProduto');

const fId       = document.getElementById('id');
const fSku      = document.getElementById('sku');
const fName     = document.getElementById('name');
const fCategory = document.getElementById('category');
const fUnit     = document.getElementById('unit');
const fStock    = document.getElementById('stock');
const fLocation = document.getElementById('location');
const fMin      = document.getElementById('min');

const dlgRemover    = document.getElementById('modalRemover');
const formRemover   = document.getElementById('formRemover');
const removeResumo  = document.getElementById('removeResumo');

/* === Baixa de estoque (ID + quantidade) === */
const btnBaixa         = document.getElementById('btnBaixa');
const dlgBaixa         = document.getElementById('modalBaixa');
const formBaixa        = document.getElementById('formBaixa');
const produtoId        = document.getElementById('produtoId');
const quantidadeBaixa  = document.getElementById('quantidadeBaixa');

/* ========= RENDER ========= */
function renderRows(items) {
  if (!items?.length) {
    gridBody.innerHTML = `<tr><td colspan="7" id="empty">Nenhum produto cadastrado nesta sessão.</td></tr>`;
    listCount.textContent = '0 itens';
    return;
  }
  listCount.textContent = `${items.length} itens`;
  gridBody.innerHTML = items.map(p => `
    <tr data-id="${p.id}">
      <td>${p.id}</td>
      <td>${p.name}</td>
      <td>${p.unit}</td>
      <td>${p.stock}</td>
      <td>${p.location}</td>
      <td>${p.min}</td>
      <td>
        <div class="row-actions">
          <button type="button" class="btn tiny secondary js-edit" data-id="${p.id}">Editar</button>
          <button type="button" class="btn tiny danger js-remove" data-id="${p.id}">Remover</button>
        </div>
      </td>
    </tr>
  `).join('');
}

/* ========= HELPERS ========= */
function openNewModal() {
  tituloProd.textContent = 'Novo produto';
  [fId,fSku,fName,fCategory,fStock,fLocation,fMin].forEach(el => el.value = '');
  fUnit.value = 'un';
  dlgProduto.showModal();
}
function openEditModal(id) {
  const p = MOCK_PRODUCTS.find(i => String(i.id) === String(id));
  if (!p) return;
  tituloProd.textContent = `Editar produto #${p.id}`;
  fId.value = p.id; fSku.value = p.sku; fName.value = p.name;
  fCategory.value = p.category ?? ''; fUnit.value = p.unit ?? 'un';
  fStock.value = p.stock ?? ''; fLocation.value = p.location ?? '';
  fMin.value = p.min ?? '';
  dlgProduto.showModal();
}
function openRemoveModal(id) {
  const p = MOCK_PRODUCTS.find(i => String(i.id) === String(id));
  if (!p) return;
  removeResumo.innerHTML = `Você está prestes a remover <strong>${p.name}</strong> (SKU ${p.sku}).`;
  dlgRemover.showModal();
}

/* === Baixa de estoque (por ID) === */
function openBaixaModal() {
  if (!dlgBaixa) return;
  if (produtoId) produtoId.value = '';
  if (quantidadeBaixa) quantidadeBaixa.value = '';
  dlgBaixa.showModal();
}

/* ========= BINDINGS ========= */
document.addEventListener('DOMContentLoaded', () => {
  renderRows(MOCK_PRODUCTS);

  btnNew?.addEventListener('click', openNewModal);

  // Delegação para ações da tabela
  gridBody?.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.js-edit');
    const delBtn  = e.target.closest('.js-remove');
    if (editBtn) openEditModal(editBtn.dataset.id);
    if (delBtn)  openRemoveModal(delBtn.dataset.id);
  });

  // Botões Cancelar → fecham o dialog pai
  document.querySelectorAll('[data-cancel]').forEach(btn => {
    btn.addEventListener('click', () => {
      const dialog = btn.closest('dialog');
      if (dialog?.open) dialog.close();
    });
  });

  // Microfeedback de ação (sem persistir nada)
  formProduto?.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = formProduto.querySelector('.btn');
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Salvando...';
    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = original;
      if (dlgProduto.open) dlgProduto.close();
    }, 600);
  });

  formRemover?.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = formRemover.querySelector('.btn.danger');
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Removendo...';
    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = original;
      if (dlgRemover.open) dlgRemover.close();
    }, 600);
  });

  // === Baixa de estoque: abrir modal + microfeedback (pré-visualização) ===
  btnBaixa?.addEventListener('click', openBaixaModal);

  formBaixa?.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = formBaixa.querySelector('.btn');
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Processando baixa...';
    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = original;
      if (dlgBaixa?.open) dlgBaixa.close();
    }, 700);
  });

  // Demonstração: limpar sessão (sem efeito real)
  btnClearAll?.addEventListener('click', () => {
    console.log('Limpar sessão (pré-visualização).');
  });
});
