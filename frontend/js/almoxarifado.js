/* ========= CONFIG API ========= */
const API_HOST = 'http://localhost:8080';

const API = {
  BASE: '/api/almoxarifado/produto',

  listUrl() {
    return `${API_HOST}${this.BASE}/listar`;
  },
  createUrl() {
    return `${API_HOST}${this.BASE}/criar`;
  },
  updateUrl(idProduto) {
    return `${API_HOST}${this.BASE}/editar/${encodeURIComponent(idProduto)}`;
  },
  deleteUrl(idProduto) {
    return `${API_HOST}${this.BASE}/remover/${encodeURIComponent(idProduto)}`;
  },
  baixaUrl() {
    return `${API_HOST}${this.BASE}/baixa-estoque`;
  },
  buscarUrl(termo) {
    return `${API_HOST}${this.BASE}/buscar?termo=${encodeURIComponent(termo)}`;
  },
  exportCsvUrl() {
    return `${API_HOST}${this.BASE}/exportar-csv`;
  },
  relatorioPdfUrl() {
    return `${API_HOST}${this.BASE}/relatorio-produtos-pdf`;
  }
};

/* ========= ESTADO ========= */
const state = {
  produtos: [],
  page: 1,
  pageSize: 8
};

/* ========= HELPERS GERAIS ========= */

function setAnoRodape() {
  const spanYear = document.getElementById('year');
  if (spanYear) spanYear.textContent = new Date().getFullYear();
}

function getPageItems() {
  const list = state.produtos || [];
  const start = (state.page - 1) * state.pageSize;
  const end = start + state.pageSize;
  return {
    items: list.slice(start, end),
    total: list.length
  };
}

function atualizarContador(total) {
  const el = document.getElementById('listCount');
  if (!el) return;
  el.textContent = total === 1 ? '1 item' : `${total} itens`;
}

/* ========= GRID ========= */

function limparGrid() {
  const tbody = document.getElementById('gridBody');
  if (tbody) tbody.innerHTML = '';
}

function criarBotaoLinha(texto, tipo, onClick) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn tiny ' + (tipo === 'danger' ? 'danger' : 'secondary');
  btn.textContent = texto;
  btn.addEventListener('click', onClick);
  return btn;
}

function renderGrid() {
  const tbody = document.getElementById('gridBody');
  if (!tbody) return;

  limparGrid();

  const { items, total } = getPageItems();

  if (!items.length) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 6;
    td.textContent = 'Nenhum produto encontrado.';
    td.style.textAlign = 'center';
    tr.appendChild(td);
    tbody.appendChild(tr);
    atualizarContador(0);
    renderPager(0);
    return;
  }

  items.forEach((p) => {
    const tr = document.createElement('tr');

    const idProduto = p.idProduto ?? p.id ?? p.codigo ?? '';

    const tdId = document.createElement('td');
    tdId.textContent = idProduto;
    tr.appendChild(tdId);

    const tdNome = document.createElement('td');
    tdNome.textContent = p.nome ?? '';
    tr.appendChild(tdNome);

    const tdUnidade = document.createElement('td');
    tdUnidade.textContent = p.unidade ?? p.unidadeMedida ?? '';
    tr.appendChild(tdUnidade);

    const tdQuantidade = document.createElement('td');
    tdQuantidade.textContent = p.quantidade ?? p.estoque ?? '';
    tr.appendChild(tdQuantidade);

    const tdLocal = document.createElement('td');
    tdLocal.textContent = p.local ?? p.localizacao ?? '';
    tr.appendChild(tdLocal);

    const tdAcoes = document.createElement('td');
    tdAcoes.classList.add('row-actions');

    const btnEditar = criarBotaoLinha('Editar', 'secondary', () =>
      abrirModalProduto(p)
    );
    const btnExcluir = criarBotaoLinha('Excluir', 'danger', () =>
      abrirModalDelete(idProduto, p.nome)
    );

    tdAcoes.appendChild(btnEditar);
    tdAcoes.appendChild(btnExcluir);

    tr.appendChild(tdAcoes);
    tbody.appendChild(tr);
  });

  atualizarContador(total);
  renderPager(total);
}

/* ========= PAGINAÇÃO ========= */

function renderPager(total) {
  const pager = document.getElementById('pager');
  if (!pager) return;

  pager.innerHTML = '';

  if (total <= state.pageSize) return;

  const totalPages = Math.ceil(total / state.pageSize);

  const makeBtn = (label, page, disabled, isActive) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = label;
    if (disabled) btn.disabled = true;
    if (isActive) btn.classList.add('is-active');
    btn.addEventListener('click', () => {
      if (!disabled && state.page !== page) {
        state.page = page;
        renderGrid();
      }
    });
    return btn;
  };

  pager.appendChild(makeBtn('«', 1, state.page === 1, false));
  pager.appendChild(makeBtn('‹', state.page - 1, state.page === 1, false));

  for (let p = 1; p <= totalPages; p++) {
    pager.appendChild(makeBtn(String(p), p, false, state.page === p));
  }

  pager.appendChild(makeBtn('›', state.page + 1, state.page === totalPages, false));
  pager.appendChild(makeBtn('»', totalPages, state.page === totalPages, false));
}

/* ========= AVATAR ========= */

function initUserMenu() {
  const btn = document.getElementById('avatarBtn');
  const menu = document.getElementById('userMenu');
  if (!btn || !menu) return;

  const toggle = () => {
    const open = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  };

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggle();
  });

  document.addEventListener('click', (e) => {
    if (!menu.classList.contains('open')) return;
    if (!menu.contains(e.target) && e.target !== btn) {
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) {
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  menu.addEventListener('click', (e) => {
    const item = e.target.closest('[data-action]');
    if (!item) return;

    const action = item.getAttribute('data-action');
    if (action === 'logout') {
      showToast({
        title: 'Logout',
        message: 'Aqui você chama a API de logout ou limpa o storage.',
        variant: 'success'
      });
    } else if (action === 'profile') {
      showToast({
        title: 'Em breve',
        message: 'Tela de perfil ainda não disponível.',
        variant: 'error'
      });
    }

    menu.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  });
}

/* ========= MODAIS ========= */

function safeShowDialog(dialog) {
  if (!dialog) return;
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', 'open');
}

function safeCloseDialog(dialog) {
  if (!dialog) return;
  if (typeof dialog.close === 'function') dialog.close();
  else dialog.removeAttribute('open');
}

/* ========= MODAL PRODUTO ========= */

function resetModalProduto() {
  document.getElementById('productId').value = '';
  document.getElementById('nfeNumber').value = '';
  document.getElementById('name').value = '';
  document.getElementById('sector').value = '';
  document.getElementById('unit').value = '';
  document.getElementById('stock').value = '';
  document.getElementById('location').value = '';
  document.getElementById('checker').value = '';

  const titulo = document.getElementById('produtoTitulo');
  if (titulo) titulo.textContent = 'Novo Produto';
}

function preencherModalProduto(produto) {
  document.getElementById('productId').value =
    produto.idProduto ?? produto.id ?? produto.codigo ?? '';

  document.getElementById('nfeNumber').value =
    produto.notaFiscal ?? produto.nota_fiscal ?? '';

  document.getElementById('name').value = produto.nome ?? '';

  document.getElementById('sector').value = produto.setor ?? '';

  document.getElementById('unit').value =
    produto.unidade ?? produto.unidadeMedida ?? '';

  document.getElementById('stock').value =
    produto.quantidade ?? produto.estoque ?? '';

  document.getElementById('location').value =
    produto.local ?? produto.localizacao ?? '';

  document.getElementById('checker').value =
    produto.responsavelRecebimento ?? produto.responsavel_recebimento ?? '';

  const titulo = document.getElementById('produtoTitulo');
  if (titulo) titulo.textContent = 'Editar Produto';
}

function abrirModalProduto(produto) {
  const modal = document.getElementById('modalProduto');
  const form = document.getElementById('formProduto');
  if (!modal || !form) return;

  if (produto) {
    preencherModalProduto(produto);
    form.dataset.mode = 'edit';
    form.dataset.idProduto = produto.idProduto ?? produto.id ?? produto.codigo;
  } else {
    resetModalProduto();
    form.dataset.mode = 'create';
    delete form.dataset.idProduto;
  }

  safeShowDialog(modal);
}

function initModalProduto() {
  const modal = document.getElementById('modalProduto');
  const form = document.getElementById('formProduto');
  const btnNew = document.getElementById('btnNew');

  if (!modal || !form || !btnNew) return;

  btnNew.addEventListener('click', () => abrirModalProduto(null));

  modal.querySelectorAll('[data-cancel]').forEach(btn =>
    btn.addEventListener('click', () => safeCloseDialog(modal))
  );

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const body = {
      id: document.getElementById('productId').value.trim(),
      nota_fiscal: document.getElementById('nfeNumber').value.trim(),
      nome: document.getElementById('name').value.trim(),
      setor: document.getElementById('sector').value,
      unidade: document.getElementById('unit').value.trim(),
      quantidade: Number(document.getElementById('stock').value || 0),
      local: document.getElementById('location').value.trim(),
      responsavel_recebimento: document.getElementById('checker').value.trim()
    };

    const mode = form.dataset.mode || 'create';
    const idProdutoRef = form.dataset.idProduto;

    try {
      const url = mode === 'edit'
        ? API.updateUrl(idProdutoRef)
        : API.createUrl();

      const method = mode === 'edit' ? 'PUT' : 'POST';

      const resp = await apiJson(url, method, body);

      if (!resp.ok) throw new Error(`Erro ao salvar produto. Status: ${resp.status}`);

      const saved = await resp.json();
      const savedId = saved.idProduto ?? saved.id ?? saved.codigo ?? body.id;

      if (mode === 'create') {
        state.produtos.unshift(saved);
        state.page = 1;
        showToast({
          title: 'Produto criado',
          message: 'Produto criado com sucesso.',
          variant: 'success'
        });
      } else {
        const chaveBusca = idProdutoRef || savedId;
        const idx = state.produtos.findIndex(p => {
          const pid = p.idProduto ?? p.id ?? p.codigo;
          return pid === chaveBusca;
        });

        if (idx !== -1) state.produtos[idx] = saved;

        showToast({
          title: 'Produto editado',
          message: 'Produto editado com sucesso.',
          variant: 'success'
        });
      }

      safeCloseDialog(modal);
      renderGrid();

    } catch (err) {
      console.error(err);

      showToast({
        title: 'Erro ao salvar',
        message: mode === 'edit'
          ? 'Não foi possível editar o produto.'
          : 'Não foi possível criar o produto.',
        variant: 'error'
      });
    }
  });
}

/* ========= MODAL BAIXA (ALTERAÇÃO APLICADA AQUI) ========= */

function initModalBaixa() {
  const modal = document.getElementById('modalBaixa');
  const form = document.getElementById('formBaixa');
  const btnBaixa = document.getElementById('btnBaixa');

  if (!modal || !form || !btnBaixa) return;

  btnBaixa.addEventListener('click', () => {
    form.reset();
    safeShowDialog(modal);
  });

  modal.querySelectorAll('[data-cancel]').forEach(btn =>
    btn.addEventListener('click', () => safeCloseDialog(modal))
  );

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const idProduto = document.getElementById('produtoId').value.trim();
    const quantidade = Number(document.getElementById('quantidadeBaixa').value || 0);
    const autGestor = document.getElementById('autGestor').value;
    const conferente = document.getElementById('checkerBaixa').value.trim();

    if (!idProduto || !quantidade || !autGestor || !conferente) {
      showToast({
        title: 'Campos obrigatórios',
        message: 'Preencha todos os campos da baixa de estoque.',
        variant: 'error'
      });
      return;
    }

    const body = {
      id: idProduto,
      quantidade_baixa: quantidade,
      autorizado_gestor: autGestor === 'SIM',
      conferente
    };

    try {
      const resp = await apiJson(API.baixaUrl(), 'POST', body);
      if (!resp.ok) throw new Error(`Erro ao dar baixa. Status: ${resp.status}`);

      // 🟢 NOVO: atualiza SOMENTE o item na posição correta
      const updated = await resp.json();
      const updatedId = updated.idProduto ?? updated.id ?? updated.codigo;

      const idx = state.produtos.findIndex(p => {
        const pid = p.idProduto ?? p.id ?? p.codigo;
        return pid === updatedId;
      });

      if (idx !== -1) {
        state.produtos[idx] = updated;
      }

      showToast({
        title: 'Baixa realizada',
        message: 'Baixa de estoque realizada com sucesso.',
        variant: 'success'
      });

      safeCloseDialog(modal);
      renderGrid(); // apenas re-renderiza, sem perder ordem

    } catch (err) {
      console.error(err);

      showToast({
        title: 'Erro na baixa',
        message: 'Não foi possível realizar a baixa de estoque.',
        variant: 'error'
      });
    }
  });
}

/* ========= MODAL DELETE ========= */

function abrirModalDelete(idProduto, nome) {
  const modal = document.getElementById('modalDelete');
  const form = document.getElementById('formDelete');
  const nameEl = document.getElementById('deleteName');
  const idEl = document.getElementById('deleteId');

  if (!modal || !form || !nameEl || !idEl) return;

  nameEl.textContent = nome ?? '';
  idEl.value = idProduto;
  safeShowDialog(modal);
}

function initModalDelete() {
  const modal = document.getElementById('modalDelete');
  const form = document.getElementById('formDelete');
  if (!modal || !form) return;

  modal.querySelectorAll('[data-cancel]').forEach(btn =>
    btn.addEventListener('click', () => safeCloseDialog(modal))
  );

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const idProduto = document.getElementById('deleteId').value;
    if (!idProduto) {
      safeCloseDialog(modal);
      return;
    }

    try {
      const resp = await apiJson(API.deleteUrl(idProduto), 'DELETE');
      if (!resp.ok) throw new Error(`Erro ao excluir. Status: ${resp.status}`);

      state.produtos = state.produtos.filter(p => {
        const pid = p.idProduto ?? p.id ?? p.codigo;
        return pid !== idProduto;
      });

      showToast({
        title: 'Excluído',
        message: 'Produto excluído com sucesso.',
        variant: 'success'
      });

      safeCloseDialog(modal);
      renderGrid();

    } catch (err) {
      console.error(err);
      showToast({
        title: 'Erro ao excluir',
        message: 'Não foi possível excluir o produto.',
        variant: 'error'
      });
    }
  });
}

/* ========= BUSCA ========= */

function initBusca() {
  const input = document.getElementById('q');
  if (!input) return;

  let timeout = null;

  input.addEventListener('input', () => {
    clearTimeout(timeout);
    const termo = input.value.trim();

    timeout = setTimeout(async () => {
      if (!termo) {
        await carregarProdutos();
        return;
      }

      try {
        const resp = await apiGet(API.buscarUrl(termo));
        if (!resp.ok) throw new Error(`Erro ao buscar. Status: ${resp.status}`);

        const data = await resp.json();
        state.produtos = Array.isArray(data) ? data : [];
        state.page = 1;
        renderGrid();

      } catch (err) {
        console.error(err);
        showToast({
          title: 'Erro na busca',
          message: 'Não foi possível buscar o produto. Atualmente, a busca é feita pelo ID do produto, ou pelo seu nome. Verifique também se não existem erros ortográficos em sua busca.',
          variant: 'error'
        });
      }
    }, 300);
  });
}

/* ========= EXPORTAR ========= */

function exportarCSV() {
  window.open(API.exportCsvUrl(), '_blank');
}

function imprimirRelatorioPdf() {
  window.open(API.relatorioPdfUrl(), '_blank');
}

/* ========= FETCH HELPERS ========= */

async function apiGet(url) {
  return fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Accept': 'application/json' }
  });
}

async function apiJson(url, method, body) {
  return fetch(url, {
    method,
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });
}

/* ========= CARREGAR PRODUTOS ========= */

async function carregarProdutos() {
  try {
    const resp = await apiGet(API.listUrl());
    if (!resp.ok) throw new Error(`Erro ao listar produtos. Status: ${resp.status}`);

    const data = await resp.json();
    state.produtos = Array.isArray(data) ? data : [];
    state.page = 1;
    renderGrid();

  } catch (err) {
    console.error(err);
    state.produtos = [];
    renderGrid();
    showToast({
      title: 'Erro ao carregar',
      message: 'Não foi possível carregar produtos.',
      variant: 'error'
    });
  }
}

/* ========= BOOT ========= */

document.addEventListener('DOMContentLoaded', () => {
  setAnoRodape();
  initUserMenu();
  initModalProduto();
  initModalBaixa();
  initModalDelete();
  initBusca();

  const btnExportCSV = document.getElementById('btnExportCSV');
  if (btnExportCSV) btnExportCSV.addEventListener('click', exportarCSV);

  const btnPrint = document.getElementById('btnPrint');
  if (btnPrint) btnPrint.addEventListener('click', imprimirRelatorioPdf);

  carregarProdutos();
});
