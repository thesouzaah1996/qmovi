
/* ========= API ========= */
const API = {
  ENTRADAS_BASE: '/api/portaria/entradas', // GET ?page=&size=&q=  | POST body JSON
  FILA_BASE: '/api/portaria/fila',         // GET ?page=&size=&q=  | POST body JSON
  PAGE: 'page',
  SIZE: 'size',
  Q: 'q',
};

const TOAST_TITLE = 'Portaria';
const TOAST_MS = 8000;

/* ========= Toast com pausar/fechar (mesmo da Almox) ========= */
function showToast(message, title = TOAST_TITLE, ms = TOAST_MS){
  if (typeof title === 'number'){ ms = title; title = TOAST_TITLE; }

  const host = document.getElementById('toastHost');
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `
    <div class="toast-controls">
      <button class="pause" aria-label="Pausar" title="Pausar">
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

  let remaining = ms, paused = false, start = Date.now(), timer;
  const remove = () => {
    el.style.transition='opacity .25s ease, transform .25s ease';
    el.style.opacity='0'; el.style.transform='translateY(-6px)';
    clearTimeout(timer);
    setTimeout(()=>el.remove(), 260);
  };
  const startTimer = () => {
    start = Date.now();
    timer = setTimeout(remove, remaining);
    if (bar) bar.style.animationPlayState = 'running';
  };
  const pauseTimer = () => {
    remaining = Math.max(0, remaining - (Date.now()-start));
    clearTimeout(timer);
    if (bar) bar.style.animationPlayState = 'paused';
  };
  startTimer();

  const pauseBtn = el.querySelector('.pause');
  const closeBtn = el.querySelector('.close');
  pauseBtn?.addEventListener('click', () => {
    if (!paused){
      paused = true; pauseTimer();
      pauseBtn.title='Retomar';
      pauseBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
    } else {
      paused = false; startTimer();
      pauseBtn.title='Pausar';
      pauseBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
    }
  });
  closeBtn?.addEventListener('click', remove);
}

/* ========= Menu Usuário (mesma lógica) ========= */
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
})();

/* ========= Abas ========= */
const tabs = document.querySelectorAll('.tab');
const panels = {
  entradas: document.getElementById('panel-entradas'),
  fila: document.getElementById('panel-fila')
};
tabs.forEach(t => t.addEventListener('click', () => {
  tabs.forEach(x => x.classList.remove('is-active'));
  t.classList.add('is-active');
  const tab = t.dataset.tab;
  Object.entries(panels).forEach(([k,el]) => el.classList.toggle('is-hidden', k !== tab));
  // ajusta toolbar (botões)
  document.getElementById('btnNovaEntrada').style.display = tab === 'entradas' ? '' : 'none';
  document.getElementById('btnNovoFila').style.display   = tab === 'fila' ? '' : 'none';
}));

/* ========= Campos / elementos ========= */
const q = document.getElementById('q');
const btnNovaEntrada = document.getElementById('btnNovaEntrada');
const btnNovoFila = document.getElementById('btnNovoFila');

const bodyEntradas = document.getElementById('bodyEntradas');
const countEntradas = document.getElementById('countEntradas');
const pagerEntradas = document.getElementById('pagerEntradas');

const bodyFila = document.getElementById('bodyFila');
const countFila = document.getElementById('countFila');
const pagerFila = document.getElementById('pagerFila');

const dlgEntrada = document.getElementById('dlgEntrada');
const formEntrada = document.getElementById('formEntrada');

const nfNumero = document.getElementById('nfNumero');
const fornecedor = document.getElementById('fornecedor');
const placa = document.getElementById('placa');
const motorista = document.getElementById('motorista');
const volumes = document.getElementById('volumes');
const peso = document.getElementById('peso');
const chegada = document.getElementById('chegada');
const doca = document.getElementById('doca');
const statusEntrada = document.getElementById('statusEntrada');

const dlgFila = document.getElementById('dlgFila');
const formFila = document.getElementById('formFila');

const filaPlaca = document.getElementById('filaPlaca');
const filaTransp = document.getElementById('filaTransp');
const filaTipo = document.getElementById('filaTipo');
const filaPrioridade = document.getElementById('filaPrioridade');
const filaDoca = document.getElementById('filaDoca');
const filaStatus = document.getElementById('filaStatus');

/* ========= Estado / paginação ========= */
const state = {
  q: '',
  entradas: { page:0, size:10, totalPages:1, totalElements:0 },
  fila:     { page:0, size:10, totalPages:1, totalElements:0 }
};

function pageUrl(base, st){
  const u = new URL(base, window.location.origin);
  if (state.q) u.searchParams.set(API.Q, state.q);
  u.searchParams.set(API.PAGE, st.page);
  u.searchParams.set(API.SIZE, st.size);
  return u.toString();
}

/* ========= Fetch Entradas ========= */
async function fetchEntradas(){
  const url = pageUrl(API.ENTRADAS_BASE, state.entradas);
  const res = await fetch(url, { headers:{'Accept':'application/json'} });
  if (!res.ok) throw new Error('Falha ao carregar Entradas');
  const data = await res.json();
  const items = Array.isArray(data) ? data : (data?.content ?? data?.items ?? []);
  state.entradas.totalPages    = Number(data?.totalPages ?? 1);
  state.entradas.totalElements = Number(data?.totalElements ?? items.length);

  if (!items.length){
    bodyEntradas.innerHTML = `<tr><td id="empty" colspan="10">Nenhum registro.</td></tr>`;
    countEntradas.textContent = `0 itens`;
    pagerEntradas.innerHTML = '';
    return;
  }

  countEntradas.textContent = `${state.entradas.totalElements} itens`;
  bodyEntradas.innerHTML = items.map(row => {
    const s = (row.status ?? 'Aguardando');
    const badgeClass = s === 'Conferida' ? 'green' : (s === 'Conferindo' ? 'blue' : 'gray');
    return `
      <tr data-id="${row.id ?? ''}">
        <td>${row.nf ?? row.nfNumero ?? '-'}</td>
        <td>${row.fornecedor ?? '-'}</td>
        <td>${row.placa ?? '-'}</td>
        <td>${row.motorista ?? '-'}</td>
        <td>${Number(row.volumes ?? 0)}</td>
        <td>${Number(row.peso ?? 0)}</td>
        <td>${row.chegada ?? '-'}</td>
        <td>${row.doca ?? ''}</td>
        <td><span class="badge ${badgeClass}">${s}</span></td>
        <td>
          <div class="row-actions">
            <button type="button" class="btn tiny secondary js-editar">Editar</button>
            <button type="button" class="btn tiny danger js-remover">Remover</button>
          </div>
        </td>
      </tr>`;
  }).join('');

  renderPager(pagerEntradas, state.entradas, () => { fetchEntradas().catch(console.error); });
}

/* ========= Fetch Fila ========= */
async function fetchFila(){
  const url = pageUrl(API.FILA_BASE, state.fila);
  const res = await fetch(url, { headers:{'Accept':'application/json'} });
  if (!res.ok) throw new Error('Falha ao carregar Fila');
  const data = await res.json();
  const items = Array.isArray(data) ? data : (data?.content ?? data?.items ?? []);
  state.fila.totalPages    = Number(data?.totalPages ?? 1);
  state.fila.totalElements = Number(data?.totalElements ?? items.length);

  if (!items.length){
    bodyFila.innerHTML = `<tr><td id="empty" colspan="8">Sem veículos na fila.</td></tr>`;
    countFila.textContent = `0 veículos`;
    pagerFila.innerHTML = '';
    return;
  }

  countFila.textContent = `${state.fila.totalElements} veículos`;
  bodyFila.innerHTML = items.map((row, idx) => {
    const s = row.status ?? 'Aguardando';
    const pr = row.prioridade ?? 'Normal';
    const badgeS = s === 'Em Doca' ? 'blue' : (s === 'Chamado' ? 'yellow' : 'gray');
    const badgeP = pr === 'Urgente' ? 'yellow' : 'gray';
    return `
      <tr data-id="${row.id ?? ''}">
        <td>${(row.posicao ?? idx+1)}</td>
        <td>${row.placa ?? '-'}</td>
        <td>${row.transportadora ?? '-'}</td>
        <td>${row.tipo ?? 'Entrega'}</td>
        <td><span class="badge ${badgeP}">${pr}</span></td>
        <td>${row.docaPreferencial ?? ''}</td>
        <td><span class="badge ${badgeS}">${s}</span></td>
        <td>
          <div class="row-actions">
            <button type="button" class="btn tiny secondary js-chamar">Chamar</button>
            <button type="button" class="btn tiny secondary js-priorizar">↑ Priorizar</button>
            <button type="button" class="btn tiny danger js-remover">Remover</button>
          </div>
        </td>
      </tr>`;
  }).join('');

  renderPager(pagerFila, state.fila, () => { fetchFila().catch(console.error); });
}

/* ========= Pager util ========= */
function renderPager(container, st, cb){
  container.innerHTML = '';
  const total = Math.max(1, st.totalPages || 1);

  const prev = document.createElement('button');
  prev.textContent = '‹ Anterior';
  prev.disabled = st.page <= 0;
  prev.onclick = () => { st.page = Math.max(0, st.page-1); cb(); };
  container.appendChild(prev);

  const start = Math.max(0, st.page - 2);
  const end = Math.min(total - 1, st.page + 2);
  for (let i=start;i<=end;i++){
    const b = document.createElement('button');
    b.textContent = String(i+1);
    if (i === st.page) b.classList.add('is-active');
    b.onclick = () => { st.page = i; cb(); };
    container.appendChild(b);
  }

  const next = document.createElement('button');
  next.textContent = 'Próxima ›';
  next.disabled = st.page >= total-1;
  next.onclick = () => { st.page = Math.min(total-1, st.page+1); cb(); };
  container.appendChild(next);
}

/* ========= Create (placeholders de back) ========= */
async function criarEntrada(payload){
  const res = await fetch(API.ENTRADAS_BASE, {
    method:'POST', headers:{'Content-Type':'application/json','Accept':'application/json'},
    body:JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Erro ao salvar entrada');
  return res.json().catch(()=> ({}));
}

async function adicionarFila(payload){
  const res = await fetch(API.FILA_BASE, {
    method:'POST', headers:{'Content-Type':'application/json','Accept':'application/json'},
    body:JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Erro ao adicionar à fila');
  return res.json().catch(()=> ({}));
}

/* ========= Listeners ========= */
document.addEventListener('DOMContentLoaded', () => {
  // ícones
  window.lucide?.createIcons();

  // busca
  q?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter'){
      state.q = q.value || '';
      state.entradas.page = 0; state.fila.page = 0;
      Promise.all([fetchEntradas(), fetchFila()]).catch(console.error);
    }
  });

  // abrir modais
  btnNovaEntrada?.addEventListener('click', () => { formEntrada.reset(); dlgEntrada.showModal(); });
  btnNovoFila?.addEventListener('click', () => { formFila.reset(); dlgFila.showModal(); });

  // cancelar modais
  document.querySelectorAll('[data-cancel]').forEach(btn => {
    btn.addEventListener('click', () => {
      const d = btn.closest('dialog'); if (d?.open) d.close();
    });
  });

  // submit entrada
  formEntrada?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try{
      if (!nfNumero.value.trim() || !fornecedor.value.trim() || !placa.value.trim() || !chegada.value){
        throw new Error('Preencha ao menos NF, Fornecedor, Placa e Chegada.');
      }
      const payload = {
        nf: nfNumero.value.trim(),
        fornecedor: fornecedor.value.trim(),
        placa: placa.value.trim().toUpperCase(),
        motorista: motorista.value.trim(),
        volumes: volumes.value ? Number(volumes.value) : 0,
        peso: peso.value ? Number(peso.value) : 0,
        chegada: chegada.value,
        doca: doca.value || '',
        status: statusEntrada.value || 'Aguardando'
      };
      await criarEntrada(payload);
      dlgEntrada.close();
      showToast('Entrada registrada com sucesso.');
      state.entradas.page = 0;
      await fetchEntradas();
    }catch(err){
      showToast(err.message || 'Erro ao salvar entrada');
    }
  });

  // submit fila
  formFila?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try{
      if (!filaPlaca.value.trim() || !filaTransp.value.trim()){
        throw new Error('Informe Placa e Transportadora.');
      }
      const payload = {
        placa: filaPlaca.value.trim().toUpperCase(),
        transportadora: filaTransp.value.trim(),
        tipo: filaTipo.value,
        prioridade: filaPrioridade.value,
        docaPreferencial: filaDoca.value || '',
        status: filaStatus.value || 'Aguardando'
      };
      await adicionarFila(payload);
      dlgFila.close();
      showToast('Veículo adicionado à fila.');
      state.fila.page = 0;
      await fetchFila();
    }catch(err){
      showToast(err.message || 'Erro ao adicionar à fila');
    }
  });

  // ações tabela fila (delegação)
  bodyFila?.addEventListener('click', (e) => {
    const row = e.target.closest('tr'); if (!row) return;
    if (e.target.closest('.js-chamar'))  { showToast('Veículo chamado para doca.'); }
    if (e.target.closest('.js-priorizar')){ showToast('Prioridade aumentada para este veículo.'); }
    if (e.target.closest('.js-remover'))  { row.remove(); showToast('Removido da fila.'); }
  });

  // ações tabela entradas (delegação)
  bodyEntradas?.addEventListener('click', (e) => {
    const row = e.target.closest('tr'); if (!row) return;
    if (e.target.closest('.js-editar')){ showToast('Edição rápida ainda não implementada.'); }
    if (e.target.closest('.js-remover')){ row.remove(); showToast('Entrada removida.'); }
  });

  // footer ano
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // primeira carga
  Promise.all([fetchEntradas(), fetchFila()]).catch(console.error);
});

/* ESC fecha modais */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') document.querySelectorAll('dialog[open]').forEach(d => d.close());
});
