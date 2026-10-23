'use strict';
const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const brl = value => value == null ? '—' : Number(value).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const num = value => value == null ? '—' : Number(value).toLocaleString('pt-BR',{maximumFractionDigits:2});
const dt = value => value ? new Date(value.length===10?value+'T12:00:00':value).toLocaleDateString('pt-BR') : '—';
const monthLabel = value => new Date(value+'-01T12:00:00').toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
const page = document.body.dataset.page, isAdmin = document.body.dataset.user==='admin';
const titles = {strategy:'Oportunidades',contracts:'Contratos',news:'Notícias regionais',insights:'Insights de IA',overview:'Resumo',campaigns:'Campanhas',market:'Ideias de conteúdo',agents:'Recomendações',finance:'Orçamento e gastos',reports:'Relatórios',settings:'Configurações'};
const areaName = {trabalhista:'Trabalhista',previdenciario:'Previdenciário'};
$('title').textContent=titles[page];
document.title=titles[page]+' | LegalGrowth';
const descriptions={overview:'Acompanhe o investimento e os resultados do escritório.',campaigns:'Compare os resultados e confira o que merece atenção.',finance:'Confira o saldo disponível e os gastos do mês.',reports:'Reúna os resultados em um relatório para ler e compartilhar.',settings:'Gerencie as conexões de IA e as preferências do escritório.',agents:'Confira as sugestões antes de decidir o que mudar.',market:'Indicadores públicos para orientar conteúdos educativos.',insights:'Pontos fortes, pontos fracos e o que vale revisar nas suas campanhas.',news:'Notícias sobre emprego, trabalho, aposentadoria e benefícios nas cidades escolhidas pelo escritório.',strategy:'O que pode ajudar a comunidade e o que precisa ser avaliado pelo escritório.',contracts:'Confira os dados encontrados no contrato antes de cadastrar um cliente.'};
$('page-description').textContent=descriptions[page]||'';
$('page-description').hidden=!descriptions[page];
const today = new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Sao_Paulo'}).format(new Date());
$('end').value=today; $('start').value=today.slice(0,8)+'01';
try{$('scope').value=localStorage.getItem('lg-scope')==='demo'?'demo':'real';}catch{$('scope').value='real';}
$('period-bar').hidden=['settings','reports','market','news','strategy','contracts'].includes(page);
$('area').parentElement.hidden=page!=='campaigns';
$('scope').parentElement.hidden=page==='contracts';
let renderVersion=0, currentData=null, working=false, selectedAnalyst='openai', selectedAIProvider='openai';
const scope=()=>$('scope').value;
const params=()=>new URLSearchParams({scope:scope(),start:$('start').value,end:$('end').value,...(page==='campaigns'&&$('area').value?{area:$('area').value}:{})});
const message=(text,error=false)=>{$('message').textContent=text;$('message').className=error?'error':'';};
async function api(url,options={}){
  let response;
  try{response=await fetch(url,{...options,headers:{'X-Requested-With':'LegalGrowth',...(options.body instanceof FormData?{}:options.body?{'Content-Type':'application/json'}:{}),...options.headers}});}
  catch{throw Error('Não foi possível acessar o painel. Confira se o servidor está ligado e tente novamente.');}
  let body;
  try{body=await response.json();}catch{
    throw Error('O servidor não retornou uma resposta válida. Atualize a página e tente novamente.');
  }
  if(!response.ok)throw Error(typeof body?.detail==='string'?body.detail:'Não foi possível concluir a operação. Confira os campos e tente novamente.');
  return body;
}

const post=(url,body)=>api(url,{method:'POST',...(body?{body:JSON.stringify(body)}:{})});
const panel=(title,body,extra='')=>`<section class="panel"><div class="section-head"><h2>${esc(title)}</h2>${extra}</div>${body}</section>`;
const empty=text=>`<p class="empty">${esc(text)}</p>`;
const disclosureSummary=label=>`<summary><span>${esc(label)}</span><i class="disclosure-mark" aria-hidden="true"></i></summary>`;
const details=(label,body)=>`<details class="disclosure">${disclosureSummary(label)}<div>${body}</div></details>`;
function table(headers,rows){
  if(!rows.length)return empty('Ainda não há registros.');
  const numeric=new Set(['Gasto','Valor','Orçamento','Visualizações','Cliques','Taxa de cliques','Custo por clique','Conversões do anúncio','Contatos','Qualificados','Contatos qualificados','Atendimentos','Contratações','Custo por qualificado','Custo por contratação']);
  const cellClass=i=>i===0?'wrap':numeric.has(headers[i])?'numeric':'';
  return `<div class="table-wrap" role="region" aria-label="${esc('Tabela: '+headers.join(', '))}" tabindex="0"><table><thead><tr>${headers.map((h,i)=>`<th scope="col" class="${cellClass(i)}">${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map((cell,i)=>`<td class="${cellClass(i)}">${cell}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
const input=(name,label,type='number',value='',attrs='')=>`<label>${label}<input name="${name}" type="${type}" value="${esc(value)}" ${attrs} required></label>`;
function metrics(s){return `<div class="metrics">${[['Gasto em anúncios',brl(s.cost),'no período'],['Contatos qualificados',num(s.qualified),'com perfil para atendimento'],['Contratações',num(s.hires),'registradas pelo escritório']].map(([label,value,hint])=>`<div class="metric"><small>${label}</small><strong>${value}</strong><small class="hint">${hint}</small></div>`).join('')}</div>`;}
function updateOverviewSummary(summary){
  const target=$('overview-summary');
  const visible=page==='overview'&&summary.rows>0;
  target.hidden=!visible;
  target.innerHTML=visible?metrics(summary):'';
  target.closest('.page-header').classList.toggle('has-results',visible);
}
function metricTable(data,full=false){return table(full?['Campanha / grupo','Gasto','Visualizações','Cliques','Taxa de cliques','Custo por clique','Conversões do anúncio','Contatos','Qualificados','Atendimentos','Contratações','Custo por qualificado','Custo por contratação']:['Campanha','Gasto','Contatos qualificados','Contratações'],Object.entries(data).map(([name,s])=>full?[esc(name),brl(s.cost),num(s.impressions),num(s.clicks),num(s.ctr)+(s.ctr==null?'':'%'),brl(s.cpc),num(s.conversions),num(s.contacts),num(s.qualified),num(s.appointments),num(s.hires),brl(s.cpq),brl(s.cph)]:[esc(name),brl(s.cost),num(s.qualified),num(s.hires)]));}
function chart(rows){
  if(!rows.length)return '';
  const maximum=Math.max(...rows.map(r=>r.cost),0),scale=maximum||1;
  const timestamp=r=>Date.parse(r.date+'T00:00:00Z');
  const first=timestamp(rows[0]),duration=timestamp(rows.at(-1))-first||1;
  const x=r=>96+(timestamp(r)-first)*660/duration,y=r=>150-r.cost/scale*120;
  // The middle date follows elapsed time, not the index of a possibly missing day.
  const middleDate=new Date(first+duration/2).toISOString().slice(0,10);
  const middlePosition=(Date.parse(middleDate+'T00:00:00Z')-first)/duration;
  const middleLabel=middlePosition>0&&middlePosition<1?`<span class="chart-date-mid" data-chart-date-position="${middlePosition}">${dt(middleDate)}</span>`:'';
  return `<div class="chart-frame"><div class="chart-scale" aria-hidden="true"><span>${esc(brl(scale))}</span><span>${esc(brl(scale/2))}</span><span>R$ 0</span></div><svg class="chart" viewBox="88 20 680 140" preserveAspectRatio="none" role="img" aria-label="Gasto em anúncios por dia, com eixo começando em zero. Valores na tabela abaixo."><line x1="96" y1="30" x2="756" y2="30"/><line class="chart-guide" x1="96" y1="90" x2="756" y2="90"/><line x1="96" y1="150" x2="756" y2="150"/><polygon class="chart-area" points="${x(rows[0])},150 ${rows.map(r=>`${x(r)},${y(r)}`).join(' ')} ${x(rows.at(-1))},150"/><polyline points="${rows.map(r=>`${x(r)},${y(r)}`).join(' ')}"/>${rows.map(r=>`<path class="chart-point" d="M ${x(r)} ${y(r)} l .001 0" vector-effect="non-scaling-stroke"><title>${dt(r.date)}: ${brl(r.cost)}</title></path>`).join('')}</svg></div><div class="chart-dates"><span>${dt(rows[0].date)}</span>${middleLabel}<span>${dt(rows.at(-1).date)}</span></div><p class="muted">Maior gasto diário: ${brl(maximum)}. Dias sem registro não equivalem a gasto zero.</p>${details('Ver valores por dia',table(['Dia','Gasto','Cliques'],rows.map(r=>[dt(r.date),brl(r.cost),num(r.clicks)])))}`;
}
function budgetLine(b){return `<section class="budget-line" aria-label="Orçamento"><div><p class="muted">Orçamento de ${esc(monthLabel(b.month))}</p><p>${brl(b.spent)} usados de ${brl(b.planned)}</p></div><div><p class="muted">Saldo estimado</p><p class="balance${b.balance<0?' alert':''}">${brl(b.balance)}</p></div><div class="budget-meter"><span class="muted">${num(b.consumed_percent)}% usado</span><progress value="${Math.max(0,Math.min(b.consumed_percent,100))}" max="100" aria-label="Percentual do orçamento usado"></progress></div>${b.alerts.length?`<p class="alert">${b.balance<=0?'O orçamento do mês foi atingido.':'O orçamento está perto do limite.'}</p>`:''}</section>`;}
function recCopy(r){
  const t=r.title,e=r.evidence;
  if(t.includes('mensuração'))return ['Conferir o registro de resultados','Há gasto em anúncios sem conversões registradas. Confira se o acompanhamento dos resultados está funcionando.'];
  if(t.includes('CPC crescente'))return ['Revisar o custo dos cliques','O custo por clique subiu em relação ao período anterior. Revise as palavras-chave e o texto dos anúncios.'];
  if(t.includes('custo por contato qualificado'))return ['Revisar o custo para conseguir contatos','O custo por contato qualificado subiu. Confira as buscas que levam ao anúncio e a página de destino.'];
  if(r.category==='qualidade')return ['Aguardar mais resultados','Ainda há poucos resultados para decidir se vale a pena aumentar o investimento.'];
  if(r.category==='palavras-chave')return ['Revisar uma palavra-chave','Esta palavra-chave teve gasto, mas nenhum contato qualificado registrado. Confira se ela corresponde ao serviço oferecido.'];
  if(r.category==='orcamento')return ['Comparar o investimento entre as áreas','Compare o custo por contato e a capacidade de atendimento antes de mudar a distribuição do orçamento.'];
  if(r.category==='geografia')return ['Comparar os resultados por cidade','Confira o custo e os contatos de cada cidade antes de mudar onde anunciar.'];
  if(r.category==='mercado')return [t.replace('Conteúdo educativo: ','Explicar: '),'Use este tema como ponto de partida para um conteúdo informativo, com revisão de um advogado.'];
  return [t,r.rationale];
}
function evidence(r){
  const e=r.evidence;let html='';
  if(e.start)html+=`<p>Período: ${dt(e.start)} a ${dt(e.end)}</p>`;
  if(e.current||e.metrics)html+=metricTable({'Período selecionado':e.current||e.metrics,...(e.previous?.cost!==undefined?{'Período anterior':e.previous}:{})});
  if(e.areas)html+=metricTable(Object.fromEntries(Object.entries(e.areas).map(([k,v])=>[areaName[k]||k,v])));
  if(e.localities)html+=metricTable(e.localities);
  if(e.unit)html+=`<p>${num(e.value)} ${esc(e.unit)} · ${dt(e.date)}</p>${e.previous?`<p>Anterior: ${num(e.previous.value)} · ${dt(e.previous.date)}</p>`:''}`;
  if(e.source)html+=`<p class="sources">Fonte: ${esc(e.source)}${e.accessed?' · consulta em '+dt(e.accessed):''}</p>`;
  html+='<p class="muted">Esses dados não garantem o mesmo resultado no futuro.</p>';
  return html;
}
function visibleRecs(data){
  const filtered=data.recommendations.filter(r=>r.status==='pending'&&(!r.evidence.start||(r.evidence.start===data.start&&r.evidence.end===data.end)));
  const unique=new Map();for(const r of filtered){const key=[r.category,r.title,r.evidence.campaign||'',r.evidence.keyword||''].join('|');if(!unique.has(key))unique.set(key,r);}
  const rank=id=>{const i=data.ai_priorities.indexOf(id);return i<0?999:i;};
  return [...unique.values()].sort((a,b)=>rank(a.id)-rank(b.id));
}
function recs(list,{compact=false}={}){return list.length?list.map(r=>{const [title,body]=recCopy(r);return `<article class="rec"><div class="rec-top"><h3>${esc(title)}</h3>${currentData.ai_priorities.includes(r.id)?'<span class="status priority">Prioridade sugerida pela IA</span>':r.status!=='pending'?`<span class="status">${r.status==='approved'?'Aprovada':'Descartada'}</span>`:''}</div>${r.evidence.campaign||r.evidence.keyword?`<span class="rec-meta">${esc(r.evidence.campaign||r.evidence.keyword)}</span>`:''}<p>${esc(body)}</p>${compact?'<a href="/painel/agents">Ver recomendação</a>':details('Ver dados',evidence(r))+(isAdmin&&r.status==='pending'?`<div class="actions"><button class="secondary" data-decision="approved" data-id="${r.id}">Aprovar</button><button class="quiet" data-decision="rejected" data-id="${r.id}">Descartar</button></div>`:'')}</article>`;}).join(''):empty('Nenhuma recomendação pendente para este período.');}
function analyzeButton(data){return isAdmin?`<button id="analyze">${data.ai.connected?'Analisar com IA':'Atualizar recomendações'}</button>`:'';}
function importForm(kind){return isAdmin?`<form data-import="${kind}" class="form-narrow"><label>Escolher arquivo<input name="file" type="file" accept=".csv" required></label><p class="help">Use um arquivo CSV com os ${kind==='market'?'indicadores públicos':'resultados das campanhas'}. Somente dados agrupados, sem informações de pessoas.</p><div class="actions"><button>Importar arquivo</button><a href="/api/templates/${kind}">Baixar modelo</a></div></form>`:empty('Peça ao responsável para importar os dados.');}
function budgetForm(b){return `<form id="budget"><div class="form-grid">${input('month','Mês','month',b.month)}${input('total','Orçamento total (R$)','number',b.planned,'min="1" step="0.01"')}${Object.entries(b.allocations).map(([k,v])=>input(k,({trabalhista:'Trabalhista',previdenciario:'Previdenciário',infraestrutura:'Ferramentas e IA',reserva:'Reserva'}[k])+' (R$)','number',v,'min="0" step="0.01"')).join('')}</div><p class="help">A soma das áreas, ferramentas e reserva deve ser igual ao total.</p><button>Salvar orçamento</button></form>`;}
function aiPanel(config){
  const s=config.ai, connections=s.connections||{};
  return `<section class="connection-workspace" id="ai"><div class="connection-overview"><h2>Conectar suas IAs</h2><p class="help">Use uma IA para analisar as campanhas e outra para conferir as conclusões.</p><div class="provider-list">${['openai','claude'].map(p=>{const c=connections[p]||{name:p==='openai'?'OpenAI':'Claude',connected:false};return `<div class="provider-row"><div><strong>${c.name}</strong><p class="muted">${c.connected?'Conectada':'Ainda não conectada'}</p></div>${isAdmin?(c.connected?`<button id="${p==='openai'?'disconnect-ai':'disconnect-claude'}" data-disconnect="${p}" class="quiet">Desconectar ${c.name}</button>`:`<button data-configure="${p}" class="secondary">Conectar ${c.name}</button>`):''}</div>`;}).join('')}</div><p class="help connection-privacy">As IAs recebem apenas códigos e números agrupados. A associação com os nomes fica cifrada neste servidor; a chave não é enviada. Dados pessoais de clientes não devem ser importados.</p></div><div class="connection-editor">${isAdmin?`<details class="disclosure" id="connection-form" ${!s.insights_ready?'open':''}>${disclosureSummary('Adicionar ou trocar chave')}<form id="ai-connect" class="form-narrow"><label>Serviço<select id="ai-provider" name="provider"><option value="openai">OpenAI</option><option value="claude">Claude (Anthropic)</option></select></label><label for="api-key">Chave da API</label><div class="key-row"><input id="api-key" name="api_key" type="password" placeholder="Cole sua chave aqui" autocomplete="off" spellcheck="false" minlength="20" maxlength="512" required><button type="button" id="show-key" class="secondary" aria-pressed="false">Mostrar</button></div><p class="key-help"><a id="key-link" href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">Criar chave na OpenAI ↗</a></p><p class="help">A chave fica protegida no servidor. A API é cobrada pela sua conta no serviço, separadamente da assinatura de chat.</p><button type="submit">Testar e conectar</button><details class="limits disclosure">${disclosureSummary('Limite compartilhado de uso')}<div><label>Reserva mensal para as duas IAs (R$)<input name="monthly_limit" type="number" min="1" max="200" step="1" value="${s.monthly_limit}" required></label><p class="help">Cada insight reserva R$ 2 para análise e revisão. A priorização de recomendações reserva R$ 1. Tentativas com falha também contam. Este é um controle interno; confira a cobrança nos serviços.</p><p class="help">Neste mês: ${brl(s.reserved_brl)} reservados de ${brl(s.monthly_limit)}.</p></div></details></form></details>`:empty('Peça ao responsável para conectar as IAs.')}</div>${s.insights_ready?'<p class="connection-next"><a href="/painel/insights">Abrir Insights de IA</a></p>':''}</section>`;
}
function insightPanel(s,result){
  let html='';
  if(!s.insights_ready)html+=`<section class="insight-start"><div><h2>${isAdmin?'Conecte as duas IAs para começar':'As IAs ainda não estão conectadas'}</h2><p>${isAdmin?'Uma analisa os resultados; a outra confere se as conclusões têm apoio nos dados.':'Peça ao responsável pelo escritório para conectar os serviços. As análises salvas continuam disponíveis abaixo.'}</p></div>${isAdmin?'<a class="button" href="/painel/settings#ai">Conectar IAs</a>':''}</section>`;
  else if(isAdmin)html+=`<form id="insight-form" class="insight-toolbar"><label>Quem faz a análise<select id="analyst"><option value="openai">OpenAI</option><option value="claude">Claude</option></select></label><p class="muted" id="reviewer-label">Revisão pelo Claude</p><button> ${result?'Analisar novamente':'Analisar campanhas'}</button></form><p class="help">Inclui todas as campanhas, cidades e palavras-chave do período. Cada consulta reserva R$ 2 do limite local.</p>`;
  if(!result)return html+empty('A análise aparecerá aqui com os dados que sustentam cada conclusão.');
  html+=`<div class="insight-meta"><span>Análise: ${esc(result.analyst)} · Revisão: ${esc(result.reviewer)}</span><span>${dt(result.created_at)}</span></div>`;
  if(['failed','unverified'].includes(result.status))return html+`<p class="error-inline" role="status">${esc(result.message)}</p>`;
  html+=`<p class="help">${num(result.coverage.campaigns)} campanha(s) no período. ${result.excluded?`${num(result.excluded)} conclusão(ões) sem confirmação foram retiradas.`:'Nenhuma divergência foi apontada pela segunda IA.'}</p>`;
  for(const [kind,title] of [['strength','Pontos fortes'],['weakness','Pontos a melhorar']]){
    const findings=result.findings.filter(f=>f.kind===kind);
    html+=panel(title,findings.length?findings.map(f=>`<article class="rec insight"><h3>${esc(f.title)}</h3><p>${esc(f.explanation)}</p><p><strong>Próximo passo:</strong> ${esc(f.action)}</p>${details('Dados usados nesta conclusão',table(['Campanha / grupo','Indicador','Período','Valor'],f.evidence.map(e=>[esc(e.subject_name),esc(e.label),e.period==='current'?'Selecionado':'Anterior', ['cost','cpc','cpq','cph'].includes(e.metric)?brl(e.value):num(e.value)+(e.metric==='ctr'?'%':'')])) )}</article>`).join(''):empty('Nenhum ponto confirmado nesta categoria.'));
  }
  return html+'<p class="help">A revisão por outra IA ajuda a encontrar erros, mas não garante que todos sejam detectados. Confira as evidências antes de decidir. A análise salva usa os dados do momento da consulta.</p>';
}

function newsPanel(data,selectedScope){
  const schedule='<p class="help">Segundas-feiras, às 8h (Brasília), pelo agendamento do Codex. O computador e o Codex precisam estar disponíveis para executar a coleta.</p>';
  let html='';
  if(selectedScope!=='real')return empty('Este acompanhamento usa notícias reais. Em Dados exibidos, selecione Meus dados.')+schedule;
  const cities=data.localities||[];
  if(!cities.length)return `<section class="empty-state"><h2>Escolha sua região para começar</h2><p>Escolha as cidades atendidas em Configurações para começar.</p><a class="button" href="/painel/settings#locations">Escolher cidades</a><p class="help">${esc(data.coverage_note||'A cobertura depende das fontes cadastradas.')}</p></section>`+schedule;
  html+=`<p><strong>Região acompanhada:</strong> ${esc(cities.join(', ')||'Nenhuma cidade escolhida')} · <a href="/painel/settings#locations">Alterar cidades</a></p><p class="help">${esc(data.coverage_note||'A cobertura depende das fontes cadastradas.')}</p>`;
  html+=schedule;
  const n=data.latest;
  if(isAdmin)html+=`<button id="scan-news" data-refresh="${Boolean(n)}">${n?'Atualizar semana anterior':'Buscar notícias da semana anterior'}</button><p class="help">Se as duas IAs estiverem conectadas, a análise e a revisão usam R$ 2 da reserva local. Sem elas, o painel reúne as notícias.</p>`;
  if(!n)return html+empty('As notícias encontradas aparecerão aqui, com fontes e links.');
  if(n.status==='collecting')return html+empty('A coleta está em andamento. Atualize esta página em alguns minutos.');
  html+=`<div class="insight-meta"><span>${dt(n.start)} a ${dt(n.end)}</span><span>Atualizado em ${dt(n.created_at)}</span></div><p class="help">${esc(n.message)}</p><p class="help">Cidades: ${esc((n.cities||[]).join(', '))}.</p>`;
  html+=panel('Assuntos encontrados',table(['Assunto','Publicações encontradas','Fontes'],(n.signals||[]).map(s=>[esc(s.label),num(s.count),num(s.source_count)])))+'<p class="help">Essas contagens mostram apenas as notícias desta coleta. Não medem desemprego nem procura por advogados. Publicações parecidas podem tratar do mesmo acontecimento.</p>';
  html+=panel('Possibilidades para acompanhar',(n.scenarios||[]).length?n.scenarios.map(s=>`<article class="rec"><h3>${esc(s.title)}</h3><p><strong>O que foi noticiado:</strong> ${esc(s.observation)}</p><p><strong>Uma possibilidade:</strong> ${esc(s.scenario)}</p><p><strong>O que observar:</strong> ${esc(s.watch_next)}</p><p class="sources">${(n.articles||[]).filter(a=>s.article_ids.includes(a.id)).map(a=>`<a href="${esc(a.url)}" target="_blank" rel="noopener noreferrer">${esc(a.source)} · ${dt(a.published)} — ${esc(a.title)}</a>`).join('')}</p></article>`).join(''):empty('Nenhum cenário foi confirmado pela revisão. As notícias abaixo continuam disponíveis.'));
  html+=details('Notícias e fontes',(n.articles||[]).map(a=>`<article class="rec"><h3><a href="${esc(a.url)}" target="_blank" rel="noopener noreferrer">${esc(a.title)}</a></h3><p class="muted">${esc(a.source)} · ${dt(a.published)}</p></article>`).join('')||empty('Nenhuma notícia encontrada com os filtros desta semana.'));
  html+=details('O que foi possível consultar',table(['Fonte','Leitura','Período'],(n.sources||[]).map(s=>[esc(s.name),s.status==='read'?'Lida':s.status==='partial'?'Parcial':'Indisponível',s.complete_window?'Feed alcançou o início da semana':'Cobertura incompleta'])))+'<p class="help">A coleta lê títulos e trechos públicos dos jornais. Bloqueios não são contornados. Cenários são hipóteses; duas IAs também podem errar.</p>';
  if(n.truncated)html+='<p class="help">A coleta atingiu o limite de notícias. A análise considera somente as notícias listadas.</p>';
  return html+`<a href="/api/news/${n.id}/json">Baixar dados para outra IA</a>`;
}
const states=['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];
function localityRow(value=''){
  const separator=value.lastIndexOf('-'),city=separator<0?value:value.slice(0,separator),state=separator<0?'':value.slice(separator+1);
  return `<div class="locality-row"><label>Cidade<input name="city" value="${esc(city)}" maxlength="77" placeholder="Nome da cidade" autocomplete="off" required></label><label>Estado<select name="state" required><option value="">UF</option>${states.map(uf=>`<option ${uf===state?'selected':''}>${uf}</option>`).join('')}</select></label><button type="button" class="secondary" data-remove-locality aria-label="Remover cidade ${esc(city)}">Remover</button></div>`;
}
function locationsPanel(config){
  const cities=config.localities||[];
  return `<section id="locations" class="panel"><div class="section-head"><h2>Sua região de atuação</h2><span class="muted">Até 20 cidades</span></div><p>Escolha onde o escritório atende. Essas cidades orientam novas importações e a busca de notícias.</p><p class="help">As fontes atuais cobrem o Vale do Paraíba (SP). Outras regiões precisam de fontes compatíveis; escolher uma cidade não garante notícias disponíveis.</p>${isAdmin?`<form id="regions"><div id="locality-rows">${(cities.length?cities:['']).map(localityRow).join('')}</div><div class="location-actions"><button type="button" id="add-locality" class="secondary">Adicionar cidade</button><button>Salvar região</button></div><p id="location-feedback" class="help" role="status"></p></form>`:empty(cities.join(', ')||'Nenhuma cidade escolhida. Peça ao responsável para configurar.')}<p class="help">Campanhas e relatórios já salvos mantêm suas cidades originais. Os exemplos fictícios têm uma seleção separada.</p></section>`;
}
async function render(){
  const version=++renderVersion;
  const selectedScope=scope();
  const query=params();
  // A filter change must never relabel a previous response as new data.
  $('content').setAttribute('aria-busy','true');
  $('content').innerHTML='<p class="loading-state" role="status">Carregando os dados selecionados…</p>';
  updateOverviewSummary({rows:0});
  $('banner').hidden=selectedScope!=='demo';
  $('period-label').textContent=page==='finance'?monthLabel(query.get('end').slice(0,7)):dt(query.get('start'))+' a '+dt(query.get('end'));
  try{
  const data=await api('/api/dashboard?'+query);if(version!==renderVersion)return;
  let html='';const pending=visibleRecs(data);
  if(page==='overview'){
    if(!data.summary.rows){
      html=`<section class="empty-state"><h2>Comece pelos resultados das campanhas</h2><p>O painel mostra quanto foi gasto e quais contatos chegaram ao escritório. Para começar, importe os resultados do período.</p><ol class="start-steps"><li><strong>Prepare o arquivo</strong><p>Use o modelo com gastos, contatos e contratações. Não inclua dados pessoais.</p><a href="/api/templates/campaigns">Baixar modelo de resultados</a></li><li><strong>Importe e acompanhe</strong><p>Os números e os pontos que precisam de atenção aparecerão aqui.</p></li></ol><a class="button" href="/painel/campaigns#import">Importar resultados</a><div class="empty-links"><a href="/painel/finance">Definir orçamento</a><a href="/painel/settings#ai">Configurar IA</a></div></section><p class="help">Quer conhecer o painel primeiro? Selecione “Exemplo fictício” no campo acima.</p>`;
    }else{
      html=`<div class="overview-board"><div class="overview-lead"><section class="result-ledger" aria-labelledby="result-heading"><div class="section-head"><h2 id="result-heading">Gastos ao longo do período</h2><a href="/painel/campaigns">Explorar resultados</a></div><div class="performance-plot">`+chart(data.evolution)+`</div></section><section class="review-desk" aria-labelledby="review-heading"><div class="section-head"><h2 id="review-heading">Pontos para revisar</h2></div>`+recsWithData(pending.slice(0,3),data,{compact:true})+`<div class="review-action">${analyzeButton(data)}</div>${!data.ai.connected&&isAdmin?'<div class="overview-connect"><p>Use uma IA para ajudar a revisar os resultados.</p><a href="/painel/settings#ai">Configurar IA</a></div>':''}</section></div><section class="campaign-workspace"><div class="section-head"><h2>Campanhas no período</h2><a href="/painel/campaigns">Ver detalhes</a></div>`+overviewCampaigns(data.campaigns)+`</section><section class="budget-workspace"><div class="section-head"><h2>Orçamento do mês</h2><a href="/painel/finance">Conferir gastos</a></div>`+budgetLine(data.budget)+`</section></div>`;

    }
  }
  if(page==='campaigns')html=metrics(data.summary)+panel('Resultados',overviewCampaigns(data.campaigns),'<a href="#import">Importar arquivo</a>')+details('Ver mais indicadores',metricTable(data.campaigns,true)+`<p class="help">Conversões são ações registradas nos anúncios. Não significam, por si só, uma contratação.</p>`)+details('Gastos por dia',chart(data.evolution))+details('Cidades e palavras-chave',metricTable(data.localities)+metricTable(data.keywords))+`<section id="import" class="panel"><h2>Importar resultados</h2>${importForm('campaigns')}${details('Como preparar o arquivo','<p class="help">Baixe o modelo acima e preencha uma linha por campanha, dia, cidade e palavra-chave. Na coluna scope, use “real” para seus dados ou “demo” para exemplos. Use datas no formato AAAA-MM-DD e ponto nos valores decimais. Salve como CSV separado por vírgulas. Não inclua nomes, telefones ou documentos de clientes.</p>')}</section>`;
  if(page==='market'){
    const rows=await api('/api/market?scope='+selectedScope);
    html=panel('Temas para explicar ao público',recsWithData(data.recommendations.filter(r=>r.category==='mercado').slice(0,5),data))+'<p class="help">Os indicadores ajudam a escolher temas. Eles não mostram quem precisa contratar um advogado.</p>'+details('Ver fontes',table(['Tema','Cidade','Data','Valor','Fonte'],rows.map(r=>[esc(r.topic),esc(r.locality),dt(r.date),num(r.value)+' '+esc(r.unit),esc(r.source)])))+details('Adicionar indicadores',importForm('market'));
  }
  if(page==='agents'){
    const history=await api('/api/executions?scope='+selectedScope);
    html=panel('Recomendações para revisar',recsWithData(pending,data),analyzeButton(data))+`<p class="help">Aprovar salva sua decisão. As mudanças nos anúncios continuam sendo feitas por você.</p><p><a href="/painel/market">Ver ideias de conteúdo</a></p>`+
      details('Conferir um texto antes de publicar',isAdmin?`<form id="compliance"><label>Texto do anúncio<textarea name="text" maxlength="5000" required placeholder="Cole o texto que deseja revisar"></textarea></label><div class="actions"><button class="secondary">Verificar texto</button></div></form><div id="review-result" role="status" aria-live="polite"></div><p class="help">Esta conferência aponta possíveis problemas. A revisão final deve ser feita por um advogado.</p>`:empty('Disponível para o responsável.'))+
      details('Decisões anteriores',recsWithData(data.recommendations.filter(r=>r.status!=='pending'),data))+
      details('Histórico de análises',table(['Data','Análise','Resultado'],history.executions.map(e=>[dt(e.created_at),esc(({analise_deterministica:'Revisão dos resultados',conformidade:'Revisão de texto',relatorio:'Relatório',openai:'Análise com IA'})[e.agent]||e.agent),esc(({success:'Concluída',error:'Não concluída',skipped:'Já realizada'})[e.status]||e.status)])));
  }
  if(page==='finance'){
    const f=await api(`/api/finance?scope=${selectedScope}&month=${query.get('end').slice(0,7)}`);
    html=(f.current.legacy_software_allocation?'<p class="help">Seu plano antigo ainda reserva uma parte para ferramentas. Revise a distribuição; os gastos com software agora aparecem separados.</p>':'')+budgetLine(f.current)+panel('Onde foi gasto',table(['Tipo','Valor'],[['Anúncios importados',brl(f.current.imported_ads)],['Outras despesas de mídia',brl(f.current.manual_expenses)],['Ferramentas e IA (fora da verba de mídia)',brl(f.current.software_expenses)]]))+
      '<section class="finance-expenses" aria-label="Despesas">'+panel('Despesas',table(['Data','Descrição','Valor'],f.expenses.map(e=>[dt(e.day),esc(e.reference),brl(e.amount)])))+
      (isAdmin?details('Adicionar despesa',`<form id="expense"><div class="form-grid">${input('day','Data','date',today)}${input('reference','Descrição','text','','maxlength="100"')}${input('amount','Valor (R$)','number','','min="0.01" step="0.01"')}<label>Tipo<select name="category"><option value="infraestrutura">Ferramentas e IA</option><option value="reserva">Outras despesas</option><option value="anuncios_nao_importados">Anúncio não importado</option></select></label></div><p class="help">Não adicione aqui um gasto com anúncios que já foi importado.</p><button>Salvar despesa</button></form>`):'')+'</section>'+
      (isAdmin?details('Ajustar orçamento',budgetForm(f.current)):'')+
      details('Comparar com o mês anterior',table(['Mês','Gasto','Orçamento'],[f.current,f.previous].map(b=>[esc(monthLabel(b.month)),brl(b.spent),brl(b.planned)])))+
      '<p class="help">Os avisos deste painel não interrompem os gastos no Google Ads.</p>';
  }
  if(page==='reports'){
    const rows=await api('/api/reports?scope='+selectedScope),config=await api('/api/settings?scope='+selectedScope);
    html='<section class="report-create"><h2>Criar relatório</h2>'+ (isAdmin?`<form id="report" class="report-form"><div class="report-controls"><label>Semana que começa em<input name="week_start" type="date" value="${config.last_week}" required></label><button>Criar relatório</button></div><p class="help">Escolha uma segunda-feira. O relatório reúne os resultados até o domingo.</p></form>`:empty('Peça ao responsável para gerar um relatório.'))+'</section>'+
      panel('Relatórios salvos',table(['Semana de','Baixar relatório'],rows.map(r=>[dt(r.week_start),`<span class="report-downloads"><a href="/api/reports/${r.id}/pdf?scope=${selectedScope}">Baixar PDF</a><a href="/api/reports/${r.id}/json?scope=${selectedScope}">Baixar para IA</a></span>`])))+
      (isAdmin?details('Testar a conferência de erros','<p>Usamos apenas uma cópia fictícia: trocamos números e referências para testar a detecção. Seus relatórios não são alterados.</p><button id="report-self-test" class="secondary">Executar teste gratuito</button><div id="self-test-result" role="status"></div>'):'')+
      details('Outras opções',`<p class="help">${config.scheduler_enabled?'Geração automática ativa: '+esc(config.schedule):'A geração automática está desativada.'} Um relatório salvo mantém os dados do momento em que foi criado.</p>`+table(['Semana de','Dados'],rows.map(r=>[dt(r.week_start),`<a href="/api/reports/${r.id}/json?scope=${selectedScope}">Baixar JSON</a>`])));
  }
  if(page==='strategy'){const result=await api('/api/strategy?scope='+selectedScope);html=strategyPanel(result);}
  if(page==='contracts'){html=contractIntro();if(isAdmin){const preview=await api('/api/contracts/demo');html+=contractPanel(preview);}}
  if(page==='news'){const n=await api('/api/news?scope='+selectedScope);html=newsPanel(n,selectedScope)+'<p><a href="/painel/strategy">Análise estratégica: impacto social e viabilidade</a></p>';}
  if(page==='insights'){const result=await api('/api/insights?'+query);html=insightPanel(data.ai,result.latest);}
  if(page==='settings'){
    const config=await api('/api/settings?scope='+selectedScope);
    html=locationsPanel(config)+aiPanel(config)+'<p><a href="/painel/contracts">Contratos e clientes — conhecer a conferência</a></p>'+`<p class="help">O orçamento fica em <a href="/painel/finance">Gastos</a>. Os relatórios ficam em <a href="/painel/reports">Relatórios</a>.</p>`;
  }
  if(version!==renderVersion)return;
  updateOverviewSummary(data.summary);
  currentData=data;$('content').innerHTML=page==='overview'?html:`<div class="task-board">${html}</div>`;bind();$('content').setAttribute('aria-busy','false');
  }catch(error){
    if(version!==renderVersion)return;
    currentData=null;
    $('content').innerHTML='<div class="load-error"><p>Os dados selecionados não foram carregados.</p><button id="retry-load" class="secondary">Tentar novamente</button></div>';
    $('content').setAttribute('aria-busy','false');
    $('retry-load').onclick=()=>{message('');render().catch(e=>message(e.message,true));};
    throw error;
  }
}
// Rendering helpers only read this snapshot; keys never enter it.
function recsWithData(list,data,options){const old=currentData;currentData=data;const result=recs(list,options);currentData=old;return result;}
async function action(task,success='Salvo.',progress='Aguarde…'){
  if(working)return;working=true;
  const form=document.activeElement?.closest('form');
  form?.querySelector('.form-error')?.remove();
  document.querySelectorAll('button').forEach(b=>b.disabled=true);$('scope').disabled=true;
  message(progress);$('content').setAttribute('aria-busy','true');
  try{const result=await task();await render();message(typeof success==='function'?success(result):success);}
  catch(error){
    if(form?.isConnected){
      message('Não foi possível concluir. Confira a mensagem no formulário.',true);
      const feedback=document.createElement('p');
      feedback.className='form-error';feedback.tabIndex=-1;feedback.textContent=error.message;
      form.append(feedback);feedback.focus();
    }else {message(error.message,true);$('message').focus();}
  }
  finally{$('content').setAttribute('aria-busy','false');working=false;$('scope').disabled=false;document.querySelectorAll('button').forEach(b=>b.disabled=false);}
}
function bind(){
  // CSSOM preserves the strict CSP: no inline style attribute in generated HTML.
  document.querySelectorAll('[data-chart-date-position]').forEach(label=>label.style.setProperty('--date-position',label.dataset.chartDatePosition));
  if($('report-self-test'))$('report-self-test').onclick=async()=>{
    const button=$('report-self-test');button.disabled=true;
    try{const result=await post('/api/reports/self-test');$('self-test-result').innerHTML=`<p>${result.detected} de ${result.total} erros conhecidos detectados. Nenhuma chamada paga.</p><p class="help">${esc(result.message)}</p>`;}catch(error){message(error.message,true);}finally{button.disabled=false;}
  };

  if($('scan-news'))$('scan-news').onclick=()=>action(()=>post('/api/news?scope=real&refresh='+$('scan-news').dataset.refresh),r=>r.message,'Lendo os jornais e conferindo os cenários…');
  document.querySelectorAll('[data-decision]').forEach(button=>button.onclick=()=>action(()=>post(`/api/recommendations/${button.dataset.id}/decision`,{scope:scope(),decision:button.dataset.decision}),'Decisão salva. Nenhum anúncio foi alterado.'));
  document.querySelectorAll('[data-import]').forEach(form=>form.onsubmit=event=>{event.preventDefault();action(()=>api(`/api/import/${form.dataset.import}?scope=${scope()}`,{method:'POST',body:new FormData(form)}),r=>`${r.added} registro(s) adicionado(s).`);});
  if($('analyze'))$('analyze').onclick=()=>action(()=>post('/api/analyze?'+new URLSearchParams({scope:scope(),start:$('start').value,end:$('end').value,use_ai:currentData.ai.connected})),r=>r.ai?.message||'Resultados revisados. Confira as recomendações.');
  if($('regions')){
    $('add-locality').onclick=()=>{
      if($('locality-rows').children.length>=20){$('location-feedback').textContent='O limite é de 20 cidades.';return;}
      $('locality-rows').insertAdjacentHTML('beforeend',localityRow());
      $('locality-rows').lastElementChild.querySelector('input').focus();
      $('location-feedback').textContent='Nova cidade adicionada. Preencha o nome e o estado.';
    };
    $('locality-rows').onclick=event=>{
      const button=event.target.closest('[data-remove-locality]');if(!button)return;
      if($('locality-rows').children.length===1){$('location-feedback').textContent='Mantenha ao menos uma cidade. Você pode editar o nome e o estado.';return;}
      button.closest('.locality-row').remove();$('add-locality').focus();$('location-feedback').textContent='Cidade removida da seleção. Salve para confirmar.';
    };
    $('regions').onsubmit=event=>{
      event.preventDefault();
      const localities=Array.from($('locality-rows').children,row=>`${row.querySelector('input').value.trim()}-${row.querySelector('select').value}`);
      action(()=>post('/api/regions',{scope:scope(),localities}),'Região salva. Os dados históricos foram preservados.');
    };
  }
  for(const id of ['expense','budget','report'])if($(id))$(id).onsubmit=event=>{event.preventDefault();const form=new FormData(event.target),body={scope:scope(),...Object.fromEntries(form)};action(()=>id==='report'?post('/api/reports?'+new URLSearchParams({scope:scope(),week_start:body.week_start})):post('/api/'+({expense:'expenses',budget:'budget'}[id]),body),id==='report'?'Relatório pronto para baixar.':'Salvo.');};
  if($('show-key'))$('show-key').onclick=()=>{const input=$('api-key'),show=input.type==='password';input.type=show?'text':'password';$('show-key').textContent=show?'Ocultar':'Mostrar';$('show-key').setAttribute('aria-pressed',String(show));};
  if($('ai-connect'))$('ai-connect').onsubmit=event=>{
    event.preventDefault();const key=$('api-key').value.trim(),limit=new FormData(event.target).get('monthly_limit');
    $('api-key').value='';$('api-key').type='password';
    $('show-key').textContent='Mostrar';$('show-key').setAttribute('aria-pressed','false');
    action(()=>post('/api/ai/connect',{api_key:key,monthly_limit:limit,provider:$('ai-provider').value}),'Conexão salva. Acesse Insights de IA para analisar e revisar.');
  };
  document.querySelectorAll('[data-disconnect]').forEach(button=>button.onclick=()=>action(()=>post('/api/ai/disconnect?provider='+button.dataset.disconnect),'Chave removida desta conexão.'));
  if($('ai-provider')){
    const updateProvider=()=>{const claude=$('ai-provider').value==='claude';$('key-link').href=claude?'https://platform.claude.com/settings/keys':'https://platform.openai.com/api-keys';$('key-link').textContent=claude?'Criar chave na Anthropic ↗':'Criar chave na OpenAI ↗';};
    $('ai-provider').value=selectedAIProvider;updateProvider();
    $('ai-provider').onchange=()=>{selectedAIProvider=$('ai-provider').value;$('api-key').value='';updateProvider();};
    document.querySelectorAll('[data-configure]').forEach(button=>button.onclick=()=>{$('connection-form').open=true;$('ai-provider').value=button.dataset.configure;selectedAIProvider=button.dataset.configure;$('api-key').value='';updateProvider();$('api-key').focus();});
  }
  if($('analyst')){const updateAnalyst=()=>{$('reviewer-label').textContent='Revisão '+($('analyst').value==='openai'?'pelo Claude':'pela OpenAI');};$('analyst').value=selectedAnalyst;updateAnalyst();$('analyst').onchange=()=>{selectedAnalyst=$('analyst').value;updateAnalyst();};}
  if($('insight-form'))$('insight-form').onsubmit=event=>{event.preventDefault();const query=params();query.set('analyst',$('analyst').value);action(()=>post('/api/insights?'+query),r=>r.message,'Analisando as campanhas e conferindo as conclusões com a segunda IA…');};
  if($('compliance'))$('compliance').onsubmit=async event=>{
    event.preventDefault();const button=event.target.querySelector('button');button.disabled=true;
    try{const result=await post('/api/compliance',{scope:scope(),text:new FormData(event.target).get('text')});$('review-result').innerHTML=`<h3>${result.flags.length?'Pontos para revisar':'Nenhum problema identificado nesta conferência'}</h3><p>${esc(result.flags.join(' · '))}</p><p class="help">Peça a um advogado para revisar o texto antes de publicar.</p>`;}
    catch(error){message(error.message,true);}finally{button.disabled=false;}
  };
}
$('refresh').onclick=()=>{message('');document.querySelector('.period-picker').open=false;render().catch(e=>message(e.message,true));};
$('scope').onchange=()=>{message('');try{localStorage.setItem('lg-scope',scope());}catch{}render().catch(e=>message(e.message,true));};
render().catch(e=>message(e.message,true));

function strategyPanel(result){
  const uncertainty={high:'Alta',medium:'Média',low:'Baixa'};
  return `<div class="strategy-list">`+result.opportunities.map(item=>{
    const source=/^https?:\/\//i.test(item.source_url||'')?`<a href="${esc(item.source_url)}" target="_blank" rel="noopener noreferrer">Ler fonte</a>`:'Fonte indisponível';
    return `<article class="strategy-item"><header class="strategy-heading"><div><h2>${esc(item.title)}</h2><p class="source-context">${source}<span>Publicação: ${dt(item.published)}</span><span>Acontecimento: ${item.event_date?dt(item.event_date):'data não informada'}</span></p></div></header><dl class="dimension-scores">${[['Benefício social',item.social],['Potencial financeiro',item.financial]].map(([label,dimension])=>`<div><dt>${label}</dt><dd class="${dimension.score==null?'score-missing':''}">${dimension.score==null?'Dados insuficientes':num(dimension.score)+'/100'}</dd></div>`).join('')}</dl><div class="strategy-reading"><section><h3>Leitura social</h3><p>${esc(item.social_view)}</p></section><section><h3>Leitura financeira</h3><p>${esc(item.economic_view)}</p></section></div><dl class="analysis-status"><div><dt>Incerteza</dt><dd>${esc(uncertainty[item.uncertainty]||'Não informada')}</dd></div><div><dt>Conflito</dt><dd>${esc(item.conflict??'Não informado')}</dd></div><div><dt>Revisão humana</dt><dd>${item.human_review_required===true?'Necessária':item.human_review_required===false?'Não exigida nesta análise':'Não informada'}</dd></div></dl><div class="strategy-next"><h3>Próximo passo</h3><p>${esc(item.next_step)}</p></div>${details('Riscos e contraponto',`<p>${esc(item.devils_advocate)}</p><p><strong>${esc(item.question)}</strong></p>`)}${dimensionDetails('Benefício social',item.social)}${dimensionDetails('Potencial financeiro',item.financial)}${details('Fonte, contexto e método',`<dl class="context-facts"><div><dt>Confiabilidade da fonte</dt><dd>${esc(item.source_reliability||'Não informada')}</dd></div><div><dt>Cidades</dt><dd>${esc((item.cities||[]).join(', ')||'Não informadas')}</dd></div><div><dt>Áreas jurídicas</dt><dd>${esc((item.areas||[]).map(area=>areaName[area]||area).join(', ')||'Não informadas')}</dd></div><div><dt>Método</dt><dd>${esc(item.method==='deterministic'?'Regras locais, sem análise por IA':item.method||'Não informado')}</dd></div></dl>`)} </article>`;
  }).join('')+`</div>`+(result.opportunities.length?'':empty('Ainda não há notícias coletadas neste ambiente.'))+`<p class="help">${esc(result.notice)}</p><a href="/painel/news">Voltar às notícias</a>`;
}
function dimensionDetails(label,dimension){
  const names={access:'Acesso à orientação',relevance:'Relevância do tema',information_gap:'Falta de informação',benefit:'Benefício para as pessoas',prevention:'Prevenção de problemas',community:'Alcance na comunidade',demand:'Procura comprovada',area_fit:'Compatibilidade com a área',capacity:'Capacidade de atendimento',cost_time:'Custo e tempo',history:'Histórico de resultados',sustainability:'Sustentabilidade financeira'};
  const weights=dimension.weights||{},criteria=dimension.criteria||{};
  const missing=dimension.missing||[];
  const rows=Object.entries(weights).map(([name,weight])=>{
    const criterion=criteria[name];
    return `<div><dt>${esc(names[name]||name)}<span>Peso: ${num(weight)}%</span></dt><dd>${criterion?`<strong>${num(criterion.value)}/100</strong><p>${esc(criterion.rationale)}</p><p class="help">Referências de evidência: ${esc((criterion.evidence_ids||[]).join(', ')||'Não informadas')}. ${criterion.human_confirmed===true?'Confirmado por uma pessoa.':'Confirmação humana não informada.'}</p>`:'Evidência necessária para avaliar.'}</dd></div>`;
  }).join('');
  return details(`Critérios: ${label.toLowerCase()}`,`<p>${esc(dimension.status||'Avaliação não informada')}</p>${missing.length?`<p class="help">Falta avaliar: ${missing.map(name=>esc(names[name]||name)).join(', ')}.</p>`:''}<dl class="criteria-list">${rows}</dl><p class="help">Os pesos e a nota vêm da avaliação registrada. Uma nota ausente não equivale a zero; as duas dimensões são independentes.</p>`);
}
function contractIntro(){return panel('Por enquanto, apenas uma demonstração','<p>O recebimento de contratos reais está bloqueado enquanto os controles de segurança são preparados. Não envie documentos de clientes.</p><p class="help">O exemplo abaixo foi criado pelo próprio sistema. Nenhuma informação é enviada a uma IA.</p>');}
function contractPanel(preview){
  const labels={name:'Nome',cpf:'CPF',rg:'RG',birth_date:'Nascimento',phone:'Telefone',email:'E-mail',address:'Endereço',city:'Cidade',state:'Estado',postal_code:'CEP',legal_area:'Área jurídica',service:'Serviço',contract_date:'Data do contrato',benefit_number:'Número do benefício'};
  const found=Object.entries(preview.fields).filter(([,f])=>f.value),missing=Object.entries(preview.fields).filter(([,f])=>!f.value);
  return panel('Confira os dados do contrato','<dl class="contract-fields">'+found.map(([key,f])=>`<div><dt>${esc(labels[key]||key)}</dt><dd><strong>${esc(f.value)}</strong><p>${esc(f.status)} · ${esc([...new Set(f.origins.map(o=>'Página '+o.page))].join(', '))}</p><p class="help">${esc(f.reason)}</p></dd></div>`).join('')+'</dl>'+details('Campos não encontrados',`<p>${missing.map(([key])=>esc(labels[key]||key)).join(', ')}.</p>`)+ '<p class="help">Um formato válido não comprova identidade. Nesta demonstração nenhum cadastro de cliente é salvo.</p>');
}

function overviewCampaigns(campaigns){
  const rows=Object.entries(campaigns);
  if(!rows.length)return empty('Nenhuma campanha neste período.');
  const mobile=rows.map(([name,values])=>`<article><h3>${esc(name)}</h3><dl><div><dt>Gasto</dt><dd>${brl(values.cost)}</dd></div><div><dt>Contatos qualificados</dt><dd>${num(values.qualified)}</dd></div><div><dt>Contratações</dt><dd>${num(values.hires)}</dd></div></dl></article>`).join('');
  return `<div class="campaign-desktop">${metricTable(campaigns)}</div><div class="campaign-mobile">${mobile}</div>`;
}
