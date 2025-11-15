/* ================== CONFIG ================== */
const API = {
  BASE: '/api/usuarios',  // GET ?page=&size=&q=
  PAGE_PARAM: 'page',
  SIZE_PARAM: 'size',
  SEARCH_PARAM: 'q',
};

/* ================== STATE ================== */
const state = { page:0, size:10, totalPages:0, totalElements:0, q:'', loading:false };

/* ================== ELEMENTS ================== */
const gridBody  = document.getElementById('gridBody');
const listCount = document.getElementById('listCount');
const pagerEl   = document.getElementById('pager');

const qInput  = document.getElementById('q');
const btnNovo = document.getElementById('btnNovo');

const dlgUser   = document.getElementById('modalUser');
const formUser  = document.getElementById('formUser');
const uid    = document.getElementById('uid');
const nameEl = document.getElementById('name');
const emailEl= document.getElementById('email');
const roleEl = document.getElementById('role');
const statusEl = document.getElementById('status');
const pwdEl  = document.getElementById('pwd');
const pwd2El = document.getElementById('pwd2');

const dlgToggle  = document.getElementById('modalToggle');
const formToggle = document.getElementById('formToggle');
const toggleMsg  = document.getElementById('toggleMsg');

/* ================== HELPERS ================== */
function createIcons(){ if (window.lucide) lucide.createIcons(); }
(function(){ const y=document.getElementById('year'); if(y) y.textContent=new Date().getFullYear(); })();

function buildUrl(){
  const u = new URL(API.BASE, window.location.origin);
  u.searchParams.set(API.PAGE_PARAM, state.page);
  u.searchParams.set(API.SIZE_PARAM, state.size);
  if (state.q?.trim()) u.searchParams.set(API.SEARCH_PARAM, state.q.trim());
  return u.toString();
}

function setLoading(isLoading){
  state.loading = isLoading;
  if (isLoading) gridBody.innerHTML = `<tr><td id="empty" colspan="7">Carregando…</td></tr>`;
}

function normalize(data){
  const items = Array.isArray(data) ? data : (data?.content ?? data?.items ?? []);
  state.totalPages    = Number(data?.totalPages ?? 1);
  state.totalElements = Number(data?.totalElements ?? items.length);
  return items.map(u => ({
    id: u.id ?? u.userId ?? null,
    nome: u.nome ?? u.name ?? '',
    email: u.email ?? '',
    perfil: u.perfil ?? u.role ?? 'COLAB',
    status: u.status ?? (u.ativo === false ? 'INATIVO' : 'ATIVO'),
    ultimoAcesso: u.ultimoAcesso ?? u.lastLogin ?? null,
  }));
}

/* Toast com X e “pausar” */
function toast(msg, title='Ok', type='success', ms=7000){
  const host = document.getElementById('toastHost'); if(!host) return;
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `
    <button class="pause" aria-label="Pausar"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg></button>
    <button class="close" aria-label="Fechar"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
    <h4 class="title">${title}</h4>
    <p class="msg">${msg}</p>
    <div class="progress"><i></i></div>
  `;
  el.style.setProperty('--toast-duration', `${ms}ms`);
  host.appendChild(el);

  let remaining = ms, started = Date.now(), timer;
  const remove = () => { el.style.opacity='0'; el.style.transform='translateY(-6px)'; clearTimeout(timer); setTimeout(()=>el.remove(), 260); };
  const pause  = () => { clearTimeout(timer); remaining -= Date.now() - started; el.querySelector('.progress>i').style.animationPlayState='paused'; };
  const resume = () => { started = Date.now(); el.querySelector('.progress>i').style.animationPlayState='running'; timer=setTimeout(remove, remaining); };

  el.querySelector('.pause')?.addEventListener('click', () => el.dataset.p === '1' ? (el.dataset.p='0',resume()) : (el.dataset.p='1',pause()));
  el.querySelector('.close')?.addEventListener('click', remove);
  timer = setTimeout(remove, remaining);
}

/* ================== RENDER ================== */
function renderPager(){
  pagerEl.innerHTML = '';
  const total = Math.max(1, state.totalPages || 1);

  const prev = document.createElement('button');
  prev.textContent = '‹ Anterior';
  prev.disabled = state.page <= 0;
  prev.onclick = ()=>{ state.page = Math.max(0, state.page-1); fetchAndRender(); };
  pagerEl.appendChild(prev);

  const start = Math.max(0, state.page-2);
  const end   = Math.min(total-1, state.page+2);
  for(let i=start;i<=end;i++){
    const b=document.createElement('button'); b.textContent = String(i+1);
    if(i===state.page) b.classList.add('is-active');
    b.onclick = ()=>{ state.page=i; fetchAndRender(); };
    pagerEl.appendChild(b);
  }

  const next = document.createElement('button');
  next.textContent = 'Próxima ›';
  next.disabled = state.page >= total-1;
  next.onclick = ()=>{ state.page = Math.min(total-1, state.page+1); fetchAndRender(); };
  pagerEl.appendChild(next);
}

function renderRows(items){
  if(!items?.length){
    gridBody.innerHTML = `<tr><td id="empty" colspan="7">Nenhum usuário encontrado.</td></tr>`;
    listCount.textContent = '0 itens';
    return;
  }
  listCount.textContent = `${state.totalElements || items.length} itens`;

  gridBody.innerHTML = items.map(u=>{
    const badge = u.status === 'ATIVO'
      ? `<span class="badge ok">Ativo</span>` : `<span class="badge off">Inativo</span>`;
    const dt = u.ultimoAcesso ? new Date(u.ultimoAcesso).toLocaleString() : '-';
    const acao = u.status === 'ATIVO'
      ? `<button class="btn tiny danger js-toggle">Desativar</button>`
      : `<button class="btn tiny js-toggle">Reativar</button>`;
    return `
      <tr data-id="${u.id ?? ''}">
        <td>${u.id ?? '-'}</td>
        <td>${u.nome || '-'}</td>
        <td>${u.email || '-'}</td>
        <td>${u.perfil}</td>
        <td>${badge}</td>
        <td>${dt}</td>
        <td>
          <div class="row-actions">
            <button class="btn tiny secondary js-edit"><i data-lucide="pencil"></i>Editar</button>
            ${acao}
          </div>
        </td>
      </tr>
    `;
  }).join('');
  createIcons();
}

/* ================== DATA ================== */
async function fetchAndRender(){
  try{
    setLoading(true);
    const res = await fetch(buildUrl(), { headers:{'Accept':'application/json'} });
    if(!res.ok) throw new Error(`Falha ao carregar (${res.status})`);
    const data = await res.json();
    const items = normalize(data);
    renderRows(items);
    renderPager();
  }catch(err){
    console.error(err);
    gridBody.innerHTML = `<tr><td id="empty" colspan="7">Erro ao carregar dados.</td></tr>`;
    listCount.textContent = '0 itens';
    pagerEl.innerHTML = '';
  }finally{
    setLoading(false);
  }
}

async function saveUser(payload, id){
  const url = id ? `${API.BASE}/${encodeURIComponent(id)}` : API.BASE;
  const method = id ? 'PUT' : 'POST';
  const res = await fetch(url, {
    method,
    headers:{'Content-Type':'application/json','Accept':'application/json'},
    body: JSON.stringify(payload),
  });
  if(!res.ok){
    const txt = await res.text().catch(()=> '');
    throw new Error(txt || `Erro ao salvar (${res.status})`);
  }
  return res.json().catch(()=> ({}));
}

/* ================== BINDINGS ================== */
document.addEventListener('DOMContentLoaded', () => {
  createIcons();
  fetchAndRender();

  // Busca Enter (igual almox)
  qInput?.addEventListener('keydown', (e)=> {
    if (e.key === 'Enter'){
      state.q = qInput.value || '';
      state.page = 0;
      fetchAndRender();
    }
  });

  // Novo
  btnNovo?.addEventListener('click', ()=>{
    formUser.reset();
    uid.value = '';
    document.getElementById('userModalTitle').textContent = 'Novo usuário';
    dlgUser.showModal();
  });

  // Cancelar modais
  document.querySelectorAll('[data-cancel]').forEach(b=>{
    b.addEventListener('click', ()=>{
      const d=b.closest('dialog'); if(d?.open) d.close();
    });
  });

  // Salvar
  formUser?.addEventListener('submit', async (e)=>{
    e.preventDefault();

    if (!uid.value || pwdEl.value || pwd2El.value){
      if (pwdEl.value !== pwd2El.value){
        toast('As senhas não coincidem.', 'Validação', 'error'); return;
      }
      if (pwdEl.value && pwdEl.value.length < 6){
        toast('A senha deve ter ao menos 6 caracteres.', 'Validação', 'error'); return;
      }
    }

    const payload = {
      nome: (nameEl.value || '').trim(),
      email: (emailEl.value || '').trim(),
      perfil: roleEl.value,
      status: statusEl.value,          // ATIVO/INATIVO
      senha: pwdEl.value || undefined, // envia só se digitada
    };

    try{
      await saveUser(payload, uid.value || undefined);
      dlgUser.close();
      state.page = 0;
      await fetchAndRender();
      toast('Usuário salvo com sucesso.', 'Sucesso', 'success');
    }catch(err){
      toast(err.message || 'Erro ao salvar usuário.', 'Erro', 'error');
    }
  });

  // Ações da tabela
  gridBody?.addEventListener('click', (e)=>{
    const tr = e.target.closest('tr'); if(!tr) return;
    const id = tr.dataset.id;

    if (e.target.closest('.js-edit')){
      const t = tr.querySelectorAll('td');
      uid.value = id;
      nameEl.value  = t[1].textContent.trim();
      emailEl.value = t[2].textContent.trim();
      roleEl.value  = t[3].textContent.trim();
      statusEl.value = tr.querySelector('.badge.off') ? 'INATIVO' : 'ATIVO';
      pwdEl.value = ''; pwd2El.value = '';
      document.getElementById('userModalTitle').textContent = 'Editar usuário';
      dlgUser.showModal();
    }

    if (e.target.closest('.js-toggle')){
      const ativar = !!tr.querySelector('.badge.off');
      document.getElementById('toggleTitle').textContent = ativar ? 'Reativar usuário' : 'Desativar usuário';
      toggleMsg.textContent = ativar ? 'Confirmar reativação deste usuário?' : 'Confirmar desativação deste usuário?';
      dlgToggle.showModal();

      formToggle.onsubmit = async (ev)=>{
        ev.preventDefault();
        try{
          const res = await fetch(`${API.BASE}/${encodeURIComponent(id)}/${ativar?'ativar':'desativar'}`, { method:'PUT' });
          if(!res.ok) throw new Error(`Falha ${res.status}`);
          dlgToggle.close();
          await fetchAndRender();
          toast(`Usuário ${ativar?'reativado':'desativado'} com sucesso.`, 'Status', 'success');
        }catch(err){
          toast('Não foi possível alterar o status.', 'Erro', 'error');
        }
      };
    }
  });

  // Dropdown do usuário (igual padrão)
  const btn = document.getElementById('userBtn');
  const menu = document.getElementById('userMenu');
  if (btn && menu){
    const close = () => { menu.removeAttribute('open'); btn.setAttribute('aria-expanded','false'); };
    const toggle = () => { const o=!menu.hasAttribute('open'); o?menu.setAttribute('open',''):menu.removeAttribute('open'); btn.setAttribute('aria-expanded',o?'true':'false'); };
    btn.addEventListener('click', (ev)=>{ ev.stopPropagation(); toggle(); });
    document.addEventListener('click', (ev)=>{ if(!menu.contains(ev.target) && !btn.contains(ev.target)) close(); });
    document.addEventListener('keydown', (ev)=>{ if(ev.key==='Escape') close(); });
  }
});
