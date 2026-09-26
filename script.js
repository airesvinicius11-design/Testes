/* =========================================================
   SEU ESPORTE AQUI - script.js
   Aviso importante (leia antes de colocar em produção):
   Este arquivo guarda os dados no navegador do próprio
   visitante (localStorage), só para fins de demonstração.
   Não é um banco de dados real, não é criptografado e não
   substitui um sistema de login seguro. Para uso real, os
   cadastros, mensagens e o painel administrativo precisam
   de um servidor com banco de dados e autenticação de verdade.
   ========================================================= */

const CHAVES = {
  usuarios: 'sea_usuarios',
  sessao: 'sea_sessao',
  leads: 'sea_leads',
  grupos: 'sea_grupos',
  campeonatos: 'sea_campeonatos',
  adminEmails: 'sea_admin_emails'
};
const ESTADOS = [
  ['AC','Acre','Rio Branco'],['AL','Alagoas','Maceió'],['AP','Amapá','Macapá'],
  ['AM','Amazonas','Manaus'],['BA','Bahia','Salvador'],['CE','Ceará','Fortaleza'],
  ['DF','Distrito Federal','Brasília'],['ES','Espírito Santo','Vitória'],
  ['GO','Goiás','Goiânia'],['MA','Maranhão','São Luís'],['MT','Mato Grosso','Cuiabá'],
  ['MS','Mato Grosso do Sul','Campo Grande'],['MG','Minas Gerais','Belo Horizonte'],
  ['PA','Pará','Belém'],['PB','Paraíba','João Pessoa'],['PR','Paraná','Curitiba'],
  ['PE','Pernambuco','Recife'],['PI','Piauí','Teresina'],['RJ','Rio de Janeiro','Rio de Janeiro'],
  ['RN','Rio Grande do Norte','Natal'],['RS','Rio Grande do Sul','Porto Alegre'],
  ['RO','Rondônia','Porto Velho'],['RR','Roraima','Boa Vista'],['SC','Santa Catarina','Florianópolis'],
  ['SP','São Paulo','São Paulo'],['SE','Sergipe','Aracaju'],['TO','Tocantins','Palmas']
];

function lerLista(chave){
  try{ return JSON.parse(localStorage.getItem(chave)) || []; }catch(e){ return []; }
}
function salvarLista(chave, lista){ localStorage.setItem(chave, JSON.stringify(lista)); }
function gerarId(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }


function mostrarToast(texto){
  const t = document.getElementById('toast');
  t.textContent = texto;
  t.classList.remove('hidden');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(()=> t.classList.add('hidden'), 3200);
}

function abrirModal(id){ document.getElementById(id).classList.remove('hidden'); }
function fecharModal(id){ document.getElementById(id).classList.add('hidden'); }

function abrirAuth(aba){
  abrirModal('modal-auth');
  mudarAbaAuth(aba);
}
function mudarAbaAuth(aba){
  const login = aba === 'login';
  document.getElementById('auth-tab-login').classList.toggle('active', login);
  document.getElementById('auth-tab-cadastro').classList.toggle('active', !login);
  document.getElementById('form-login').classList.toggle('hidden', !login);
  document.getElementById('form-cadastro').classList.toggle('hidden', login);
}
function fazerCadastro(e){
  e.preventDefault();
  const nome = document.getElementById('cad-nome').value.trim();
  const email = document.getElementById('cad-email').value.trim().toLowerCase();
  const senha = document.getElementById('cad-senha').value;
  const usuarios = lerLista(CHAVES.usuarios);
  if(usuarios.some(u => u.email === email)){
    mostrarToast('Já existe uma conta com este e-mail.');
    return;
  }
  usuarios.push({ nome, email, senha });
  salvarLista(CHAVES.usuarios, usuarios);
  localStorage.setItem(CHAVES.sessao, JSON.stringify({ nome, email }));
  fecharModal('modal-auth');
  atualizarChipUsuario();
  mostrarToast('Conta criada. Bem-vindo(a), ' + nome + '!');
}
function fazerLogin(e){
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const senha = document.getElementById('login-senha').value;
  const usuarios = lerLista(CHAVES.usuarios);
  const usuario = usuarios.find(u => u.email === email && u.senha === senha);
  if(!usuario){
    mostrarToast('E-mail ou senha incorretos.');
    return;
  }
  localStorage.setItem(CHAVES.sessao, JSON.stringify({ nome: usuario.nome, email: usuario.email }));
  fecharModal('modal-auth');
  atualizarChipUsuario();
  mostrarToast('Login realizado. Boas partidas, ' + usuario.nome + '!');
}
function atualizarChipUsuario(){
  const sessao = JSON.parse(localStorage.getItem(CHAVES.sessao) || 'null');
  const chip = document.getElementById('user-chip');
  const btnLogin = document.getElementById('btn-abrir-login');
  const btnCadastro = document.getElementById('btn-abrir-cadastro');
  if(sessao){
    chip.textContent = sessao.nome;
    chip.classList.remove('hidden');
    btnLogin.classList.add('hidden');
    btnCadastro.classList.add('hidden');
  }else{
    chip.classList.add('hidden');
    btnLogin.classList.remove('hidden');
    btnCadastro.classList.remove('hidden');
  }
}


function preencherEstados(){
  const sel = document.getElementById('sel-estado');
  sel.innerHTML = ESTADOS.map(e => `<option value="${e[0]}" data-capital="${e[2]}">${e[1]}</option>`).join('');
  preencherCapital();
}
function preencherCapital(){
  const sel = document.getElementById('sel-estado');
  const opt = sel.options[sel.selectedIndex];
  document.getElementById('input-cidade').value = opt ? opt.dataset.capital : '';
}
function buscarNoMapa(){
  const cidade = document.getElementById('input-cidade').value.trim();
  const sel = document.getElementById('sel-estado');
  const estado = sel.options[sel.selectedIndex] ? sel.options[sel.selectedIndex].textContent : '';
  const esporte = document.getElementById('sel-esporte').value;
  const consulta = `${esporte} em ${cidade}, ${estado}`;
  const url = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(consulta);
  document.getElementById('mapa-embed').src = 'https://maps.google.com/maps?q=' + encodeURIComponent(consulta) + '&t=&z=13&ie=UTF8&iwloc=&output=embed';
  window.open(url, '_blank');
}
function carregarLocaisExemplo(){
  const exemplos = [
    ['Quadra Central', 'Quadra poliesportiva • aberta até 22h'],
    ['Campo Society Vila Nova', 'Futebol society • grama sintética'],
    ['Ginásio Municipal', 'Vôlei e queimada • entrada gratuita']
  ];
  document.getElementById('locais-exemplo').innerHTML = exemplos.map(l => `
    <div class="lugar-exemplo"><strong>${l[0]}</strong><span>${l[1]}</span></div>
  `).join('');
}


function criarGrupo(e){
  e.preventDefault();
  const nome = document.getElementById('g-nome').value.trim();
  const esporte = document.getElementById('g-esporte').value;
  const local = document.getElementById('g-local').value.trim();
  const dataHora = document.getElementById('g-datahora').value;
  const jogadoresTexto = document.getElementById('g-jogadores').value.trim();
  const jogadores = jogadoresTexto ? jogadoresTexto.split(',').map(n => n.trim()).filter(Boolean) : [];

  const grupos = lerLista(CHAVES.grupos);
  grupos.push({
    id: gerarId(), nome, esporte, local, dataHora,
    jogadores, times: null, placar: null, cartoes: { amarelos: [], vermelhos: [] }
  });
  salvarLista(CHAVES.grupos, grupos);
  fecharModal('modal-grupo');
  e.target.reset();
  renderizarGrupos();
  mostrarToast('Grupo criado com sucesso!');
}
function renderizarGrupos(){
  const grupos = lerLista(CHAVES.grupos);
  const container = document.getElementById('lista-grupos');
  if(grupos.length === 0){
    container.innerHTML = '<p class="empty-state">Nenhum grupo criado ainda. Que tal começar o primeiro?</p>';
  }else{
    container.innerHTML = grupos.map(g => `
      <div class="item-card" onclick="abrirDetalheGrupo('${g.id}')">
        <h4>${g.nome}</h4>
        <div class="meta">${g.esporte}${g.local ? ' • ' + g.local : ''}</div>
        <div class="meta">${formatarDataHora(g.dataHora)}</div>
        <div class="contagem">${g.jogadores.length} jogador(es) confirmado(s)</div>
      </div>
    `).join('');
  }
  atualizarContadoresHero();
}
function formatarDataHora(valor){
  if(!valor) return 'Data a combinar';
  const d = new Date(valor);
  if(isNaN(d)) return valor;
  return d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});
}
function abrirDetalheGrupo(id){
  window._grupoAtual = id;
  renderizarDetalheGrupo();
  abrirModal('modal-grupo-detalhe');
  clearInterval(window._contadorInterval);
  window._contadorInterval = setInterval(renderizarContagemRegressiva, 1000);
}
function obterGrupo(id){
  return lerLista(CHAVES.grupos).find(g => g.id === id);
}
function atualizarGrupo(grupoAtualizado){
  const grupos = lerLista(CHAVES.grupos).map(g => g.id === grupoAtualizado.id ? grupoAtualizado : g);
  salvarLista(CHAVES.grupos, grupos);
}
function renderizarDetalheGrupo(){
  const g = obterGrupo(window._grupoAtual);
  if(!g) return;
  const timesHtml = g.times ? `
    <div class="times-sorteados">
      <div class="time-col"><h5>Time A</h5><ul>${g.times[0].map(j=>`<li>${j}</li>`).join('') || '<li>-</li>'}</ul></div>
      <div class="time-col"><h5>Time B</h5><ul>${g.times[1].map(j=>`<li>${j}</li>`).join('') || '<li>-</li>'}</ul></div>
    </div>` : '<p class="muted">Times ainda não sorteados.</p>';

  const placarHtml = g.placar ? `
    <p><strong>Placar final:</strong> Time A ${g.placar.a} x ${g.placar.b} Time B</p>
    <p class="muted">Cartões amarelos: ${g.cartoes.amarelos.join(', ') || 'nenhum'}</p>
    <p class="muted">Cartões vermelhos: ${g.cartoes.vermelhos.join(', ') || 'nenhum'}</p>
  ` : '';

  document.getElementById('grupo-detalhe-conteudo').innerHTML = `
    <h3>${g.nome}</h3>
    <p class="muted">${g.esporte}${g.local ? ' • ' + g.local : ''} • ${formatarDataHora(g.dataHora)}</p>

    <div id="contagem-regressiva" class="countdown"></div>

    <h5>Jogadores confirmados</h5>
    <p>${g.jogadores.length ? g.jogadores.join(', ') : 'Nenhum jogador adicionado.'}</p>
    <div class="row-2">
      <input id="novo-jogador" type="text" placeholder="Nome do jogador">
      <button class="btn btn-outline" onclick="adicionarJogador()">Adicionar jogador</button>
    </div>

    <h5>Times</h5>
    ${timesHtml}
    <button class="btn btn-primary" onclick="sortearTimes()">Sortear times</button>

    <h5>Resultado da partida</h5>
    ${placarHtml}
    <form class="placar-form" onsubmit="registrarPlacar(event)">
      Time A <input id="placar-a" type="number" min="0" value="${g.placar ? g.placar.a : 0}">
      x
      Time B <input id="placar-b" type="number" min="0" value="${g.placar ? g.placar.b : 0}">
      <button type="submit" class="btn btn-outline">Salvar placar</button>
    </form>
    <div class="row-2">
      <div class="field">
        <label>Cartão amarelo (nome do jogador)</label>
        <input id="cartao-amarelo" type="text">
        <button class="btn btn-ghost" onclick="registrarCartao('amarelos')" type="button">Registrar</button>
      </div>
      <div class="field">
        <label>Cartão vermelho (nome do jogador)</label>
        <input id="cartao-vermelho" type="text">
        <button class="btn btn-ghost" onclick="registrarCartao('vermelhos')" type="button">Registrar</button>
      </div>
    </div>
  `;
  renderizarContagemRegressiva();
}
function adicionarJogador(){
  const nome = document.getElementById('novo-jogador').value.trim();
  if(!nome) return;
  const g = obterGrupo(window._grupoAtual);
  g.jogadores.push(nome);
  atualizarGrupo(g);
  renderizarDetalheGrupo();
  renderizarGrupos();
}
function sortearTimes(){
  const g = obterGrupo(window._grupoAtual);
  if(g.jogadores.length < 2){
    mostrarToast('Adicione pelo menos 2 jogadores para sortear.');
    return;
  }
  const embaralhado = [...g.jogadores].sort(() => Math.random() - 0.5);
  const metade = Math.ceil(embaralhado.length / 2);
  g.times = [embaralhado.slice(0, metade), embaralhado.slice(metade)];
  atualizarGrupo(g);
  renderizarDetalheGrupo();
}
function registrarPlacar(e){
  e.preventDefault();
  const g = obterGrupo(window._grupoAtual);
  g.placar = {
    a: parseInt(document.getElementById('placar-a').value) || 0,
    b: parseInt(document.getElementById('placar-b').value) || 0
  };
  atualizarGrupo(g);
  renderizarDetalheGrupo();
  mostrarToast('Placar salvo.');
}
function registrarCartao(tipo){
  const campoId = tipo === 'amarelos' ? 'cartao-amarelo' : 'cartao-vermelho';
  const nome = document.getElementById(campoId).value.trim();
  if(!nome) return;
  const g = obterGrupo(window._grupoAtual);
  g.cartoes[tipo].push(nome);
  atualizarGrupo(g);
  renderizarDetalheGrupo();
}
function renderizarContagemRegressiva(){
  const g = obterGrupo(window._grupoAtual);
  const alvo = document.getElementById('contagem-regressiva');
  if(!g || !alvo) return;
  if(!g.dataHora){ alvo.innerHTML = '<p class="muted">Data da partida não definida.</p>'; return; }
  const diferenca = new Date(g.dataHora).getTime() - Date.now();
  if(diferenca <= 0){
    alvo.innerHTML = '<p class="muted">A partida já começou (ou já aconteceu).</p>';
    clearInterval(window._contadorInterval);
    return;
  }
  const dias = Math.floor(diferenca / 86400000);
  const horas = Math.floor((diferenca % 86400000) / 3600000);
  const min = Math.floor((diferenca % 3600000) / 60000);
  const seg = Math.floor((diferenca % 60000) / 1000);
  alvo.innerHTML = `
    <div><strong>${dias}</strong><span>dias</span></div>
    <div><strong>${horas}</strong><span>horas</span></div>
    <div><strong>${min}</strong><span>min</span></div>
    <div><strong>${seg}</strong><span>seg</span></div>
  `;
}

/* ================= CAMPEONATOS ================= */
function criarCampeonato(e){
  e.preventDefault();
  const nome = document.getElementById('camp-nome').value.trim();
  const timesTexto = document.getElementById('camp-times').value.trim();
  const nomesTimes = timesTexto.split(',').map(t => t.trim()).filter(Boolean);
  const times = nomesTimes.map(n => ({ nome: n, foto: null, jogadores: [] }));
  const campeonatos = lerLista(CHAVES.campeonatos);
  campeonatos.push({ id: gerarId(), nome, times, confrontos: [] });
  salvarLista(CHAVES.campeonatos, campeonatos);
  fecharModal('modal-campeonato');
  e.target.reset();
  renderizarCampeonatos();
  mostrarToast('Campeonato criado com sucesso!');
}
function renderizarCampeonatos(){
  const campeonatos = lerLista(CHAVES.campeonatos);
  const container = document.getElementById('lista-campeonatos');
  if(campeonatos.length === 0){
    container.innerHTML = '<p class="empty-state">Nenhum campeonato criado ainda.</p>';
  }else{
    container.innerHTML = campeonatos.map(c => `
      <div class="item-card" onclick="abrirDetalheCampeonato('${c.id}')">
        <h4>${c.nome}</h4>
        <div class="meta">${c.times.length} times</div>
        <div class="contagem">${c.confrontos.length} confronto(s) registrado(s)</div>
      </div>
    `).join('');
  }
}
function obterCampeonato(id){ return lerLista(CHAVES.campeonatos).find(c => c.id === id); }
function atualizarCampeonato(atualizado){
  const lista = lerLista(CHAVES.campeonatos).map(c => c.id === atualizado.id ? atualizado : c);
  salvarLista(CHAVES.campeonatos, lista);
}
function abrirDetalheCampeonato(id){
  window._campeonatoAtual = id;
  renderizarDetalheCampeonato();
  abrirModal('modal-campeonato-detalhe');
}
function renderizarDetalheCampeonato(){
  const c = obterCampeonato(window._campeonatoAtual);
  if(!c) return;
  document.getElementById('campeonato-detalhe-conteudo').innerHTML = `
    <h3>${c.nome}</h3>

    <h5>Times e jogadores</h5>
    <div class="cards-grid">
      ${c.times.map((t, i) => `
        <div class="item-card" style="cursor:default;">
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
            ${t.foto ? `<img src="${t.foto}" alt="Escudo de ${t.nome}" style="width:40px;height:40px;border-radius:8px;object-fit:cover;">` : `<div style="width:40px;height:40px;border-radius:8px;background:var(--areia-escura);display:flex;align-items:center;justify-content:center;font-weight:700;color:var(--verde);">${t.nome.charAt(0).toUpperCase()}</div>`}
            <h4 style="margin:0;">${t.nome}</h4>
          </div>
          <label class="fineprint">Escudo do time</label>
          <input type="file" accept="image/*" onchange="definirFotoTime(${i}, this)">
          <p class="meta" style="margin-top:8px;">Jogadores: ${t.jogadores.length ? t.jogadores.join(', ') : 'nenhum cadastrado'}</p>
          <div class="row-2">
            <input type="text" id="jogador-time-${i}" placeholder="Nome do jogador">
            <button type="button" class="btn btn-outline" onclick="adicionarJogadorTime(${i})">Adicionar</button>
          </div>
        </div>
      `).join('')}
    </div>

    <h5>Registrar confronto</h5>
    <form class="row-2" onsubmit="registrarConfronto(event)" style="align-items:end;">
      <div class="field"><label>Time A</label>
        <select id="conf-a">${c.times.map(t=>`<option>${t.nome}</option>`).join('')}</select>
      </div>
      <div class="field"><label>Time B</label>
        <select id="conf-b">${c.times.map(t=>`<option>${t.nome}</option>`).join('')}</select>
      </div>
      <div class="field"><label>Gols do Time A</label><input id="conf-golsa" type="number" min="0" value="0"></div>
      <div class="field"><label>Gols do Time B</label><input id="conf-golsb" type="number" min="0" value="0"></div>
      <button type="submit" class="btn btn-primary" style="grid-column:1/3;">Salvar confronto</button>
    </form>

    <h5>Confrontos</h5>
    ${c.confrontos.length ? `<table class="tabela"><tr><th>Time A</th><th>Placar</th><th>Time B</th></tr>
      ${c.confrontos.map(f=>`<tr><td>${f.timeA}</td><td>${f.golsA} x ${f.golsB}</td><td>${f.timeB}</td></tr>`).join('')}
    </table>` : '<p class="muted">Nenhum confronto registrado ainda.</p>'}

    <h5>Classificação</h5>
    ${renderizarTabelaClassificacao(c)}
  `;
}
function definirFotoTime(indice, input){
  const arquivo = input.files[0];
  if(!arquivo) return;
  if(arquivo.size > 1500000){
    mostrarToast('Escolha uma imagem menor (até ~1,5MB).');
    return;
  }
  const leitor = new FileReader();
  leitor.onload = () => {
    const c = obterCampeonato(window._campeonatoAtual);
    c.times[indice].foto = leitor.result;
    atualizarCampeonato(c);
    renderizarDetalheCampeonato();
  };
  leitor.readAsDataURL(arquivo);
}
function adicionarJogadorTime(indice){
  const input = document.getElementById('jogador-time-' + indice);
  const nome = input.value.trim();
  if(!nome) return;
  const c = obterCampeonato(window._campeonatoAtual);
  c.times[indice].jogadores.push(nome);
  atualizarCampeonato(c);
  renderizarDetalheCampeonato();
}
function registrarConfronto(e){
  e.preventDefault();
  const c = obterCampeonato(window._campeonatoAtual);
  c.confrontos.push({
    timeA: document.getElementById('conf-a').value,
    timeB: document.getElementById('conf-b').value,
    golsA: parseInt(document.getElementById('conf-golsa').value) || 0,
    golsB: parseInt(document.getElementById('conf-golsb').value) || 0
  });
  atualizarCampeonato(c);
  renderizarDetalheCampeonato();
  renderizarCampeonatos();
}
function renderizarTabelaClassificacao(c){
  const pontos = {};
  c.times.forEach(t => pontos[t.nome] = { pontos: 0, vitorias: 0, jogos: 0 });
  c.confrontos.forEach(f => {
    pontos[f.timeA].jogos++; pontos[f.timeB].jogos++;
    if(f.golsA > f.golsB){ pontos[f.timeA].pontos += 3; pontos[f.timeA].vitorias++; }
    else if(f.golsB > f.golsA){ pontos[f.timeB].pontos += 3; pontos[f.timeB].vitorias++; }
    else { pontos[f.timeA].pontos += 1; pontos[f.timeB].pontos += 1; }
  });
  const linhas = Object.entries(pontos).sort((a,b) => b[1].pontos - a[1].pontos);
  return `<table class="tabela"><tr><th>Time</th><th>Jogos</th><th>Vitórias</th><th>Pontos</th></tr>
    ${linhas.map(([nome,dados]) => `<tr><td>${nome}</td><td>${dados.jogos}</td><td>${dados.vitorias}</td><td>${dados.pontos}</td></tr>`).join('')}
  </table>`;
}


function enviarContato(e){
  e.preventDefault();
  const nome = document.getElementById('c-nome').value.trim();
  const email = document.getElementById('c-email').value.trim();
  const mensagem = document.getElementById('c-msg').value.trim();
  const leads = lerLista(CHAVES.leads);
  leads.push({ nome, email, mensagem, data: new Date().toISOString() });
  salvarLista(CHAVES.leads, leads);
  e.target.reset();
  mostrarToast('Mensagem recebida! Em breve entraremos em contato.');
  const assunto = encodeURIComponent('Contato pelo site - ' + nome);
  const corpo = encodeURIComponent(mensagem + '\n\nDe: ' + nome + ' (' + email + ')');
  window.open(`mailto:airesvinicius11@gmail.com?subject=${assunto}&body=${corpo}`, '_blank');
}


function alternarChat(){
  const box = document.getElementById('chat-box');
  box.classList.toggle('hidden');
  if(!box.classList.contains('hidden') && document.getElementById('chat-body').children.length === 0){
    adicionarMensagemChat('bot', 'Oi! Posso ajudar a criar um grupo, sortear times, achar uma quadra ou explicar como funciona o campeonato. O que você precisa?');
  }
}
function adicionarMensagemChat(quem, texto){
  const body = document.getElementById('chat-body');
  const div = document.createElement('div');
  div.className = 'chat-msg ' + quem;
  div.textContent = texto;
  body.appendChild(div);
  body.scrollTop = body.scrollHeight;
}
function enviarMensagemBot(e){
  e.preventDefault();
  const input = document.getElementById('chat-texto');
  const texto = input.value.trim();
  if(!texto) return;
  adicionarMensagemChat('user', texto);
  input.value = '';
  setTimeout(() => adicionarMensagemChat('bot', responderBot(texto)), 350);
}
function responderBot(pergunta){
  const p = pergunta.toLowerCase();
  if(p.includes('grupo')) return 'Para criar um grupo, vá até a seção "Grupos" e clique em "Criar grupo". Depois é só adicionar os jogadores e a data da partida.';
  if(p.includes('sorte')) return 'Dentro de um grupo, clique em "Sortear times" para dividir os jogadores confirmados em duas equipes.';
  if(p.includes('campeonato')) return 'Na seção "Campeonatos", crie um campeonato, cadastre os times e depois registre os confrontos. A classificação é calculada automaticamente.';
  if(p.includes('local') || p.includes('quadra') || p.includes('campo') || p.includes('mapa')) return 'Na seção "Locais", escolha seu estado, cidade e a modalidade, e clique em "Buscar" para ver os locais no mapa.';
  if(p.includes('cadastro') || p.includes('login') || p.includes('conta')) return 'Você pode criar uma conta ou entrar clicando nos botões no topo da página.';
  if(p.includes('cartão') || p.includes('placar')) return 'Dentro do grupo, use os campos de placar e cartões para registrar o resultado da partida.';
  return 'Ainda estou aprendendo. Você pode navegar pelas seções Locais, Grupos e Campeonatos, ou perguntar de outro jeito.';
}


function inicializarAdmin(){
  if(!localStorage.getItem(CHAVES.adminEmails)){
    salvarLista(CHAVES.adminEmails, ['airesvinicius11@gmail.com']);
  }
  if(window.location.hash === '#admin'){
    document.getElementById('admin-overlay').classList.remove('hidden');
  }
}
function entrarAdmin(){
  const email = document.getElementById('admin-email').value.trim().toLowerCase();
  const autorizados = lerLista(CHAVES.adminEmails).map(e => e.toLowerCase());
  if(!autorizados.includes(email)){
    document.getElementById('admin-erro').textContent = 'Este e-mail não tem acesso ao painel.';
    return;
  }
  document.getElementById('admin-login').classList.add('hidden');
  const dash = document.getElementById('admin-dashboard');
  dash.classList.remove('hidden');
  renderizarAdminDashboard();
}
function renderizarAdminDashboard(){
  const leads = lerLista(CHAVES.leads);
  const usuarios = lerLista(CHAVES.usuarios);
  const grupos = lerLista(CHAVES.grupos);
  const campeonatos = lerLista(CHAVES.campeonatos);
  const emails = lerLista(CHAVES.adminEmails);

  document.getElementById('admin-dashboard').innerHTML = `
    <div class="admin-topline">
      <h3>Painel administrativo</h3>
      <button class="btn btn-ghost" onclick="window.location.hash=''; window.location.reload();">Sair</button>
    </div>

    <div class="admin-section">
      <h4>Resumo</h4>
      <p>${usuarios.length} conta(s) criada(s) • ${grupos.length} grupo(s) • ${campeonatos.length} campeonato(s) • ${leads.length} mensagem(ns) recebida(s)</p>
    </div>

    <div class="admin-section">
      <h4>Mensagens recebidas</h4>
      ${leads.length ? leads.map(l => `
        <div class="admin-list-item"><strong>${l.nome}</strong> (${l.email})<br>${l.mensagem}</div>
      `).join('') : '<p class="muted">Nenhuma mensagem ainda.</p>'}
    </div>

    <div class="admin-section">
      <h4>Contas criadas</h4>
      ${usuarios.length ? usuarios.map(u => `<div class="admin-list-item">${u.nome} — ${u.email}</div>`).join('') : '<p class="muted">Nenhuma conta ainda.</p>'}
    </div>

    <div class="admin-section">
      <h4>E-mails autorizados a acessar este painel</h4>
      <div class="tag-list" id="admin-lista-emails">
        ${emails.map(e => `<span class="tag-chip">${e}<button onclick="removerAdminEmail('${e}')">✕</button></span>`).join('')}
      </div>
      <div class="row-2" style="margin-top:12px;">
        <input id="novo-admin-email" type="email" placeholder="novoemail@exemplo.com">
        <button class="btn btn-outline" onclick="adicionarAdminEmail()">Autorizar e-mail</button>
      </div>
      <p class="fineprint">Este controle é feito neste navegador. Para uma proteção real contra acessos não autorizados, é necessário um servidor com autenticação própria.</p>
    </div>
  `;
}
function adicionarAdminEmail(){
  const email = document.getElementById('novo-admin-email').value.trim().toLowerCase();
  if(!email) return;
  const emails = lerLista(CHAVES.adminEmails);
  if(!emails.includes(email)) emails.push(email);
  salvarLista(CHAVES.adminEmails, emails);
  renderizarAdminDashboard();
}
function removerAdminEmail(email){
  let emails = lerLista(CHAVES.adminEmails).filter(e => e !== email);
  if(emails.length === 0) emails = ['airesvinicius11@gmail.com'];
  salvarLista(CHAVES.adminEmails, emails);
  renderizarAdminDashboard();
}

function atualizarContadoresHero(){
  const grupos = lerLista(CHAVES.grupos);
  const totalJogadores = grupos.reduce((soma, g) => soma + g.jogadores.length, 0);
  document.getElementById('stat-jogadores').textContent = totalJogadores;
  document.getElementById('stat-grupos').textContent = grupos.length;
}


document.getElementById('hamburguer').addEventListener('click', () => {
  document.getElementById('nav-menu').classList.toggle('open');
});

document.addEventListener('DOMContentLoaded', () => {
  preencherEstados();
  carregarLocaisExemplo();
  renderizarGrupos();
  renderizarCampeonatos();
  atualizarChipUsuario();
  inicializarAdmin();
});
