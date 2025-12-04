// js/api.js

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
    const p = new URLSearchParams({ termo });
    return `${API_HOST}${this.BASE}/buscar?${p.toString()}`;
  }
};

// guarda só em memória enquanto a página estiver aberta
let BASIC_AUTH_HEADER = null;

function ensureAuthHeader() {
  if (BASIC_AUTH_HEADER) return BASIC_AUTH_HEADER;

  const user = window.prompt('Usuário HTTP Basic:');
  const pass = window.prompt('Senha HTTP Basic:');

  if (!user || !pass) {
    throw new Error('Credenciais HTTP Basic não informadas.');
  }

  BASIC_AUTH_HEADER = 'Basic ' + btoa(`${user}:${pass}`);
  return BASIC_AUTH_HEADER;
}

async function apiGet(url) {
  const auth = ensureAuthHeader();

  const resp = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': auth
    }
  });
  return resp;
}

async function apiJson(url, method, body) {
  const auth = ensureAuthHeader();

  const resp = await fetch(url, {
    method,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': auth
    },
    body: body ? JSON.stringify(body) : null
  });
  return resp;
}
