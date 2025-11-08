/* ========= CONFIG API =========
   Ajuste BASE/BAIXA_BASE para casar com seu back (ex.: Spring Boot) */
const API = {
  BASE: '/api/produtos',             // GET ?page=0&size=10&q=..., POST body JSON
  BAIXA_BASE: '/api/produtos',       // POST /{id}/baixa
  PAGE_PARAM: 'page',
  SIZE_PARAM: 'size',
  SEARCH_PARAM: 'q',
};

const state = {
  page: 0,
  size: 10,
  totalPages: 0,
  totalElements: 0,
  q: '',
  loading: false,
};

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

/* ========= ELEMENTOS ========= */
const gridBody   = document.getElementById('gridBody');
const listCount  = document.getElementById('listCount');
const btnNew     = document.getElementById('btnNew');
const btnBaixa   = document.getElementById('btnBaixa');
const pagerEl    = document.getElementById('pager');

const dlgProduto   = document.getElementById('modalProduto');
const formProduto  = document.getElementById('formProduto');
const fName        = document.getElementById('name');
const fCategory    = document.getElementById('category');
const fUnit        = document.getElementById('unit');
const fStock       = document.getElementById('stock');
const fLocation    = document.getElementById('location');
const fMin         = document.getElementById('min');
const fSector      = document.getElementById('sector');
const fNfe         = document.getElementById('nfeNumber');
const fChecker     = document.getElementById('checker');

const dlgBaixa       = document.getElementById('modalBaixa');
const formBaixa      = document.getElementById('formBaixa');
const fProdutoId     = document.getElementById('produtoId');
const fQtdBaixa      = document.getElementById('quantidadeBaixa');
const fSubsequente   = document.getElementById('subsequente');
const wrapAutGestor  = document.getElementById('wrapAutGestor');
const fAutGestor     = document.getElementById('autGestor');
const fCheckerBaixa  = document.getElementById('checkerBaixa');

/* ========= HELPERS ========= */
function normalizeResponse(data) {
  // Aceita paginação Spring (content/totalPages/totalElements) ou array simples
  const items = Array.isArray(data) ? data : (data?.content ?? data?.items ?? []);
  state.totalPages = Number(data?.totalPages ?? 1);
  state.totalElements = Number(data?.totalElements ?? items.length);
  return items.map(p => ({
    id: p.id ?? p.productId ?? null,
    name: p.name ?? p.nome ?? '',
    unit: (p.unit ?? p.unidade ?? ''),
    stock: Number(p.stock ?? p.estoque ?? 0),
    location: p.location ?? p.local ?? '',
    min: Number(p.min ?? p.minimo ?? 0),
    // campos extras opcionais vindos do back (não obrigatórios para render):
    sector: p.sector ?? p.setor ?? '',
    nfe: p.nfe ?? p.notaFiscal ?? p.numeroNotaFiscal ?? '',
    checker: p.checker ?? p.conferente ?? '',
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
  if (isLoading) {
    gridBody.innerHTML = `<tr><td id="empty" colspan="7">Carregando…</td></tr>`;
  }
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
    gridBody.innerHTML = `<tr><td colspan="7" id="empty">Nenhum produto encontrado.</td></tr>`;
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
        <td>${Number.isFinite(p.min) ? p.min : '-'}</td>
        <td>
          <div class="row-actions">
            ${canActions ? `
              <button type="button" class="btn tiny secondary js-edit" data-id="${p.id}">Editar</button>
              <button type="button" class="btn tiny danger js-remove" data-id="${p.id}">Remover</button>
            ` : `<span class="muted">—</span>`}
          </div>
        </td>
      </tr>
    `;
  }).join('');
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
    gridBody.innerHTML = `<tr><td id="empty" colspan="7">Erro ao carregar dados.</td></tr>`;
    listCount.textContent = '0 itens';
    if (pagerEl) pagerEl.innerHTML = '';
  } finally {
    setLoading(false);
  }
}

async function createProduct(payload) {
  // POST /api/produtos
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

async function baixaEstoque({ id, quantidade, subsequente, autorizadoGestor, conferente }) {
  // POST /api/produtos/{id}/baixa  (ajuste se seu endpoint for diferente)
  const url = `${API.BAIXA_BASE}/${encodeURIComponent(id)}/baixa`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      quantidade,
      subsequente,        // 'SIM' / 'NAO'
      autorizadoGestor,   // 'SIM' / 'NAO' / ''
      conferente
    }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(txt || `Erro na baixa (${res.status})`);
  }
  return res.json().catch(() => ({}));
}

/* ========= BINDINGS ========= */
document.addEventListener('DOMContentLoaded', () => {
  // busca inicial do back
  fetchAndRender();

  // busca por texto (Enter)
  const q = document.getElementById('q');
  q?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      state.q = q.value || '';
      state.page = 0;
      fetchAndRender();
    }
  });

  // novo produto
  btnNew?.addEventListener('click', () => {
    formProduto.reset();
    dlgProduto.showModal();
  });

  // abrir baixa
  btnBaixa?.addEventListener('click', () => {
    formBaixa.reset();
    wrapAutGestor.classList.add('is-hidden');
    dlgBaixa.showModal();
  });

  // mostrar/ocultar "Autorização do gestor?" quando subsequente = NAO
  fSubsequente?.addEventListener('change', () => {
    const isNo = fSubsequente.value === 'NAO';
    wrapAutGestor.classList.toggle('is-hidden', !isNo);
    if (!isNo) fAutGestor.value = '';
  });

  // cancelar modais
  document.querySelectorAll('[data-cancel]').forEach(btn => {
    btn.addEventListener('click', () => {
      const dialog = btn.closest('dialog');
      if (dialog?.open) dialog.close();
    });
  });

  // submit novo produto
  formProduto?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = formProduto.querySelector('.btn');
    const original = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Salvando…';

    try {
      const payload = {
        nome: (fName.value || '').trim(),
        setor: (fSector.value || '').trim(),
        categoria: (fCategory.value || '').trim(),
        unidade: (fUnit.value || '').trim(),
        estoque: fStock.value ? Number(fStock.value) : 0,
        local: (fLocation.value || '').trim(),
        minimo: fMin.value ? Number(fMin.value) : 0,
        notaFiscal: (fNfe.value || '').trim(),
        conferente: (fChecker.value || '').trim(),
      };
      await createProduct(payload);
      dlgProduto.open && dlgProduto.close();
      // Recarrega da API para que botões de ação apareçam
      state.page = 0;
      await fetchAndRender();
    } catch (err) {
      alert(err.message || 'Erro ao salvar');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = original;
    }
  });

  // submit baixa de estoque
  formBaixa?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = formBaixa.querySelector('.btn');
    const original = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processando…';

    try {
      const id = Number(fProdutoId.value);
      const quantidade = Number(fQtdBaixa.value);
      const subsequente = fSubsequente.value || '';
      const autorizadoGestor = (subsequente === 'NAO') ? (fAutGestor.value || '') : '';
      const conferente = (fCheckerBaixa.value || '').trim();

      if (!id || !quantidade || !subsequente) {
        throw new Error('Preencha ID, Quantidade e Subsequente.');
      }
      if (subsequente === 'NAO' && !autorizadoGestor) {
        throw new Error('Informe se há autorização do gestor.');
      }

      await baixaEstoque({ id, quantidade, subsequente, autorizadoGestor, conferente });
      dlgBaixa.open && dlgBaixa.close();
      await fetchAndRender();
    } catch (err) {
      alert(err.message || 'Erro na baixa de estoque');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = original;
    }
  });

  // ações (aparecem só quando veio do back)
  gridBody?.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.js-edit');
    const delBtn  = e.target.closest('.js-remove');
    if (editBtn) {
      const id = editBtn.dataset.id;
      console.log('Editar', id, '(implementar quando o back expor o endpoint)');
    }
    if (delBtn) {
      const id = delBtn.dataset.id;
      console.log('Remover', id, '(implementar quando o back expor o endpoint)');
    }
  });

  // footer: ano
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

// Esc fecha qualquer dialog
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') document.querySelectorAll('dialog[open]').forEach(d => d.close());
});
