/* ========= CONFIG API ========= */
const API_HOST = 'http://localhost:8080'; // backend Spring Boot

const API = {
  BASE: '/api/almoxarifado/produto',

  listUrl() {
    return `${API_HOST}${this.BASE}/listar`; // GET
  }
};

/* ========= ESTADO ========= */
let produtosCache = [];

/* ========= FUNÇÕES DE UI ========= */

function setAnoRodape() {
  const spanYear = document.getElementById('year');
  if (spanYear) {
    spanYear.textContent = new Date().getFullYear();
  }
}

function atualizarContador() {
  const el = document.getElementById('listCount');
  if (!el) return;
  const total = produtosCache.length;
  el.textContent = total === 1 ? '1 item' : `${total} itens`;
}

function limparGrid() {
  const tbody = document.getElementById('gridBody');
  if (tbody) {
    tbody.innerHTML = '';
  }
}

function renderGrid(produtos) {
  const tbody = document.getElementById('gridBody');
  if (!tbody) return;

  limparGrid();

  if (!produtos || produtos.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 6;
    td.textContent = 'Nenhum produto encontrado.';
    td.style.textAlign = 'center';
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  produtos.forEach((p) => {
    const tr = document.createElement('tr');

    const tdId = document.createElement('td');
    tdId.textContent = p.idProduto ?? p.id ?? '';
    tr.appendChild(tdId);

    const tdNome = document.createElement('td');
    tdNome.textContent = p.nome ?? '';
    tr.appendChild(tdNome);

    const tdUnidade = document.createElement('td');
    tdUnidade.textContent = p.unidade ?? '';
    tr.appendChild(tdUnidade);

    const tdQuantidade = document.createElement('td');
    tdQuantidade.textContent = p.quantidade ?? '';
    tr.appendChild(tdQuantidade);

    const tdLocal = document.createElement('td');
    tdLocal.textContent = p.local ?? '';
    tr.appendChild(tdLocal);

    // Coluna de ações (por enquanto vazia, já que você pediu só o listar)
    const tdAcoes = document.createElement('td');
    tdAcoes.classList.add('row-actions');
    tr.appendChild(tdAcoes);

    tbody.appendChild(tr);
  });
}

/* ========= CHAMADA À API: LISTAR ========= */

async function carregarProdutos() {
  try {
    const response = await fetch(API.listUrl(), {
      method: 'GET',
      credentials: 'include', // importante se estiver usando sessão/login do Spring Security
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro ao listar produtos. Status: ${response.status}`);
    }

    const data = await response.json();
    produtosCache = Array.isArray(data) ? data : [];
    renderGrid(produtosCache);
    atualizarContador();
  } catch (err) {
    console.error('Falha ao carregar produtos:', err);
    produtosCache = [];
    renderGrid(produtosCache);
    atualizarContador();
    // aqui você pode integrar com seu sistema de toast, se quiser
    // showToastError('Não foi possível carregar a lista de produtos.');
  }
}

/* ========= BOOT ========= */

document.addEventListener('DOMContentLoaded', () => {
  setAnoRodape();
  carregarProdutos();
});
