/* ========= CONFIG API ========= */
const API = {
  BASE: '/api/produtos',
  BAIXA_BASE: '/api/produtos',
  PAGE_PARAM: 'page',
  SIZE_PARAM: 'size',
  SEARCH_PARAM: 'q',
};

const state = { page: 0, size: 10, totalPages: 0, totalElements: 0, q: '', loading: false };

/* ========= TEXTOS PADRÕES (TOAST) ========= */
const TOAST_TITLE = 'Baixa não autorizada';
const TOAST_MSG =
  'Solicite a aprovação do gestor responsável pelo setor antes de concluir a baixa. Sem essa autorização, a operação não será executada e poderá resultar em advertências ou responsabilização.';
const TOAST_MS = 9500;

/* ========= MENU DO USUÁRIO ========= */
(() => {
  const btn = document.getElementById('avatarBtn');
  const menu = document.getElementById('userMenu');
  if (!btn || !menu) return;

  const open = () => { menu.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); };
  const close = () => { menu.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); };
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

/* ========= ELEMENTOS ========= */
const gridBody   = document.getElementById('gridBody');
const listCount  = document.getElementById('listCount');
const btnNew     = document.getElementById('btnNew');
const btnBaixa   = document.getElementById('btnBaixa');
const pagerEl    = document.getElementById('pager');

const dlgProduto   = document.getElementById('modalProduto');
const formProduto  = document.getElementById('formProduto');
const fProductId   = document.getElementById('productId');     // novo: ID do Produto
const fName        = document.getElementById('name');
const fUnit        = document.getElementById('unit');
const fStock       = document.getElementById('stock');
const fLocation    = document.getElementById('location');
const fSector      = document.getElementById('sector');
const fNfe         = document.getElementById('nfeNumber');
const fChecker     = document.getElementById('checker');

const dlgBaixa       = document.getElementById('modalBaixa');
const formBaixa      = document.getElementById('formBaixa');
const fProdutoId     = document.getElementById('produtoId');   // string (id do produto)
const fQtdBaixa      = document.getElementById('quantidadeBaixa');
const fAutGestor     = document.getElementById('autGestor');
const fCheckerBaixa  = document.getElementById('checkerBaixa');

/* ========= HELPERS ========= */
// normaliza acentos e transforma um label de setor em um ENUM em CAIXA_ALTA
function toEnum(value) {
  if (!value) return '';
  return value
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/\s+/g, '_')                             // espaços -> _
    .replace(/[^A-Z_]/gi, '')                         // mantém letras/_
    .toUpperCase();
}

function normalizeResponse(data) {
  const items = Array.isArray(data) ? data : (data?.content ?? data?.items ?? []);
  state.totalPages = Number(data?.totalPages ?? 1);
  state.totalElements = Number(data?.totalElements ?? items.length);

  // ProdutoResponse do backend:
  // {
  //   "id": "ABC-123",   // <- idProduto (string)
  //   "nome": "Parafuso",
  //   "unidade": "UN",
  //   "quantidade": 50,
  //   "local": "A-01"
  // }
  return items.map(p => ({
    id: p.id ?? null, // string idProduto
    name: p.nome ?? '',
    unit: p.unidade ?? '',
    stock: Number(p.quantidade ?? 0),
    location: p.local ?? ''
  }));
}

function buildUrl() {
  const u = new URL(API.BASE, window.location.origin);
  u.searchParams.set(API.PAGE_PARAM, state.page);
  u.searchParams.set(API.SIZE_PARAM, state.size);
  if (state.q?.trim()) u.searchParams.set(API.SEARCH_PARAM, state.q.trim());
  return u.toString();
}

function setLoading(isLoading) {
  state.loading = isLoading;
  if (isLoading) gridBody.innerHTML = `<tr><td id="empty" colspan="6">Carregando…</td></tr>`;
}

function renderPager() {
  if (!pagerEl) return;
  pagerEl.innerHTML = '';
  const total = Math.max(1, state.totalPages || 1);

  const btnPrev = document.createElement('button');
  btnPrev.textContent = '‹ Anterior';
  btnPrev.disabled = state.page <= 0;
  btnPrev.onclick = () => { state.page = Math.max(0, state.page - 1); fetchAndRender(); };
  pagerEl.appendChild(btnPrev);

  const start = Math.max(0, state.page - 2);
  const end = Math.min(total - 1, state.page + 2);
  for (let i = start; i <= end; i++) {
    const b = document.createElement('button');
    b.textContent = String(i + 1);
    if (i === state.page) b.classList.add('is-active');
    b.onclick = () => { state.page = i; fetchAndRender(); };
    pagerEl.appendChild(b);
  }

  const btnNext = document.createElement('button');
  btnNext.textContent = 'Próxima ›';
  btnNext.disabled = state.page >= total - 1;
  btnNext.onclick = () => { state.page = Math.min(total - 1, state.page + 1); fetchAndRender(); };
  pagerEl.appendChild(btnNext);
}

function renderRows(items, fromBackend) {
  if (!items?.length) {
    gridBody.innerHTML = `<tr><td colspan="6" id="empty">Nenhum produto encontrado.</td></tr>`;
    listCount.textContent = '0 itens';
    return;
  }
  listCount.textContent = `${state.totalElements || items.length} itens`;

  gridBody.innerHTML = items.map(p => {
    const canActions = fromBackend && p.id != null;
    return `
      <tr data-id="${p.id ?? ''}">
        <td>${p.id ?? '-'}</td>
        <td>${(p.name ?? '').trim() || '-'}</td>
        <td>${(p.unit ?? '').trim() || '-'}</td>
        <td>${Number.isFinite(p.stock) ? p.stock : '-'}</td>
        <td>${(p.location ?? '').trim() || '-'}</td>
        <td>
          <div class="row-actions">
            ${canActions ? `
              <button type="button" class="btn tiny secondary js-edit" data-id="${p.id}">Editar</button>
              <button type="button" class="btn tiny danger js-remove" data-id="${p.id}">Remover</button>
            ` : `<span class="muted">—</span>`}
          </div>
        </td>
      </tr>`;
  }).join('');
}

/* ========= TOAST ========= */
function showToastError(message, title = 'Baixa bloqueada', ms = TOAST_MS) {
  if (typeof title === 'number') { ms = title; title = 'Baixa bloqueada'; }

  const host = document.getElementById('toastHost');
  if (!host) return;

  const el = document.createElement('div');
  el.className = 'toast error';
  el.innerHTML = `
    <div class="toast-controls">
      <button class="pause" aria-label="Pausar mensagem" title="Pausar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
      </button>
      <button class="close" aria-label="Fechar" title="Fechar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    <h4 class="title">${title}</h4>
    <p class="msg">${message}</p>
    <div class="progress"><i></i></div>
  `;

  host.appendChild(el);
  const bar = el.querySelector('.progress > i');
  if (bar) bar.style.animationDuration = `${ms}ms`;

  let remaining = ms;
  let paused = false;
  let start = Date.now();
  let timer;

  const remove = () => {
    el.style.transition = 'opacity .25s ease, transform .25s ease';
    el.style.opacity = '0';
    el.style.transform = 'translateY(-6px)';
    clearTimeout(timer);
    setTimeout(() => el.remove(), 260);
  };

  const startTimer = () => {
    start = Date.now();
    timer = setTimeout(remove, remaining);
    if (bar) bar.style.animationPlayState = 'running';
  };

  const pauseTimer = () => {
    const elapsed = Date.now() - start;
    remaining = Math.max(0, remaining - elapsed);
    clearTimeout(timer);
    if (bar) bar.style.animationPlayState = 'paused';
  };

  startTimer();

  const pauseBtn = el.querySelector('.pause');
  const closeBtn = el.querySelector('.close');

  pauseBtn?.addEventListener('click', () => {
    if (!paused) {
      paused = true;
      pauseTimer();
      pauseBtn.title = 'Retomar';
      pauseBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>`;
    } else {
      paused = false;
      startTimer();
      pauseBtn.title = 'Pausar';
      pauseBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        </svg>`;
    }
  });

  closeBtn?.addEventListener('click', remove);
}

/* ========= DATA FLOW ========= */
async function fetchAndRender() {
  try {
    setLoading(true);
    const res = await fetch(buildUrl(), { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`Falha ao carregar (${res.status})`);
    const data = await res.json();
    const items = normalizeResponse(data);
    renderRows(items, true);
    renderPager();
  } catch (err) {
    console.error(err);
    gridBody.innerHTML = `<tr><td id="empty" colspan="6">Erro ao carregar dados.</td></tr>`;
    listCount.textContent = '0 itens';
    if (pagerEl) pagerEl.innerHTML = '';
  } finally {
    setLoading(false);
  }
}

/** Cria produto conforme ProdutoRequest:
 * {
 *  "id": "ABC-123",
 *  "nota_fiscal": "12345-1",
 *  "nome": "Parafuso",
 *  "setor": "ALMOXARIFADO",
 *  "unidade": "UN",
 *  "quantidade": 10,
 *  "local": "A-01",
 *  "responsavel_recebimento": "Fulano"
 * }
 */
async function createProduct(payload) {
  const res = await fetch(API.BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(txt || `Erro ao salvar (${res.status})`);
  }
  return res.json().catch(() => ({}));
}

async function baixaEstoque({ id, quantidade, autorizadoGestor, conferente }) {
  const url = `${API.BAIXA_BASE}/${encodeURIComponent(id)}/baixa`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ quantidade, autorizadoGestor, conferente }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(txt || `Erro na baixa (${res.status})`);
  }
  return res.json().catch(() => ({}));
}

/* ========= BINDINGS ========= */
document.addEventListener('DOMContentLoaded', () => {
  fetchAndRender();

  const q = document.getElementById('q');
  q?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { state.q = q.value || ''; state.page = 0; fetchAndRender(); }
  });

  btnNew?.addEventListener('click', () => { formProduto.reset(); dlgProduto.showModal(); });
  btnBaixa?.addEventListener('click', () => { formBaixa.reset(); dlgBaixa.showModal(); });

  // Se "Autorizado? = NÃO" -> fecha modal e mostra toast
  fAutGestor?.addEventListener('change', () => {
    if (fAutGestor.value === 'NAO') {
      if (dlgBaixa.open) dlgBaixa.close();
      showToastError(TOAST_MSG, TOAST_TITLE, TOAST_MS);
    }
  });

  document.querySelectorAll('[data-cancel]').forEach(btn => {
    btn.addEventListener('click', () => {
      const dialog = btn.closest('dialog');
      if (dialog?.open) dialog.close();
    });
  });

  // SUBMIT: Novo Produto -> envia exatamente conforme ProdutoRequest
  formProduto?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = formProduto.querySelector('.btn');
    const original = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Salvando…';
    try {
      // transforma label do setor em ENUM esperado pelo backend
      const setorEnum = toEnum(fSector.value);

      const payload = {
        id: (fProductId.value || '').trim(),                         // @JsonProperty("id") -> idProduto
        nota_fiscal: (fNfe.value || '').trim(),                      // @JsonProperty("nota_fiscal")
        nome: (fName.value || '').trim(),
        setor: setorEnum,                                            // enum Setor
        unidade: (fUnit.value || '').trim(),
        quantidade: fStock.value ? Number(fStock.value) : 0,
        local: (fLocation.value || '').trim(),
        responsavel_recebimento: (fChecker.value || '').trim()       // @JsonProperty("responsavel_recebimento")
      };

      if (!payload.id) throw new Error("Informe o 'ID do Produto'.");

      await createProduct(payload);
      dlgProduto.open && dlgProduto.close();
      state.page = 0;
      await fetchAndRender();
    } catch (err) {
      alert(err.message || 'Erro ao salvar');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = original;
    }
  });

  // SUBMIT: Baixa
  formBaixa?.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Bloqueio: não autorizado
    if (fAutGestor.value === 'NAO') {
      if (dlgBaixa.open) dlgBaixa.close();
      showToastError(TOAST_MSG, TOAST_TITLE, TOAST_MS);
      return;
    }

    const submitBtn = formBaixa.querySelector('.btn');
    const original = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processando…';
    try {
      const id = (fProdutoId.value || '').trim();       // string (id do produto)
      const quantidade = Number(fQtdBaixa.value);
      const autorizadoGestor = fAutGestor.value === 'SIM';
      const conferente = (fCheckerBaixa.value || '').trim();

      if (!id || !quantidade || quantidade <= 0) {
        throw new Error('Preencha o ID do Produto e a Quantidade (> 0).');
      }

      await baixaEstoque({ id, quantidade, autorizadoGestor, conferente });
      dlgBaixa.open && dlgBaixa.close();
      await fetchAndRender();
    } catch (err) {
      alert(err.message || 'Erro na baixa de estoque');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = original;
    }
  });

  gridBody?.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.js-edit');
    const delBtn  = e.target.closest('.js-remove');
    if (editBtn) { console.log('Editar', editBtn.dataset.id); }
    if (delBtn)  { console.log('Remover', delBtn.dataset.id); }
  });

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') document.querySelectorAll('dialog[open]').forEach(d => d.close());
});
