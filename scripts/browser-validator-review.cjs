// Validator-review QA: local authenticated HTML/static only; all APIs are synthetic.
// No route.fetch(), provider calls, database reads, real mutations, or secret output.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const origin=new URL(process.env.TEST_ORIGIN||'http://127.0.0.1:8000').origin;
assert.ok(['127.0.0.1','localhost','[::1]'].includes(new URL(origin).hostname));
const output=process.env.VALIDATOR_OUTPUT||'output/validator-review/browser';
const pages=['overview','campaigns','agents','insights','finance','reports','news','strategy','contracts','settings','market'];
const widths=[320,390,768,1024,1440],themes=['light','dark'];
const clone=value=>JSON.parse(JSON.stringify(value));
const box={window:{}};vm.runInNewContext(fs.readFileSync('app/static/demo-examples.js','utf8'),box);
const fixtures=box.window.LegalGrowthDemo;
const ai={connected:false,insights_ready:false,connections:{openai:{name:'OpenAI',connected:false},claude:{name:'Claude',connected:false}},monthly_limit:60,reserved_brl:0};
const metric={rows:3,days:3,cost:240,impressions:2400,clicks:120,qualified:12,hires:2,contacts:15,appointments:4,conversions:8,ctr:5,cpc:2,cpq:20,cph:120};
const budget={month:'2026-09',planned:2000,spent:240,balance:1760,consumed_percent:12,alerts:[],imported_ads:200,manual_expenses:40,software_expenses:80,legacy_software_allocation:true,allocations:{trabalhista:1200,previdenciario:600,infraestrutura:100,reserva:100}};
const dashboard={summary:metric,campaigns:{'Campanha Sintética A':metric,'Campanha Sintética sem denominador':{...metric,cost:0,qualified:0,hires:0,cpq:null,cph:null},'Campanha Sintética custo zero':{...metric,cost:0,cpq:0,cph:0}},localities:{'Cidade Sintética-SP':metric},keywords:{'termo educativo sintético':metric},evolution:[{date:'2026-09-01',cost:100,clicks:50},{date:'2026-09-03',cost:0,clicks:0},{date:'2026-09-09',cost:140,clicks:70}],budget,ai,ai_priorities:[],recommendations:[{id:9101,status:'pending',category:'orcamento',title:'Comparar investimento sintético',rationale:'Recomendação fictícia para QA.',evidence:{areas:{trabalhista:metric,previdenciario:{...metric,cpq:30,cph:180}}}}]};
const contentIdeas=[['2026-08-17','Organização de documentos'],[null,'Registros de trabalho'],['2026-02-30','Planejamento previdenciário']].map(([date,title],i)=>({id:9300+i,status:'pending',category:'mercado',title:'Conteúdo educativo: '+title,rationale:'Fixture educativa sintética.',evidence:{date,accessed:'2026-09-14T12:00:00',source:'Fonte sintética QA',locality:'Cidade Sintética-SP',value:10,unit:'unidades'}}));
const settings={ai,localities:['Cidade Sintética-SP'],last_week:'2026-09-07',scheduler_enabled:false};
const preview={real_ingestion_enabled:false,human_confirmation_required:true,fields:{name:{value:'Pessoa Exemplo — fictícia',status:'validado',reason:'Somente formato; não comprova identidade.',origins:[{page:1}],alternatives:['Pessoa Sintética']},cpf:{value:null,status:'ausente',reason:'Não encontrado.',origins:[]}}};
const sources=['app/static/app.js','app/static/arc.css','app/static/style.css','app/static/tokens.css','app/static/period-context.js','app/static/demo-examples.js','app/static/scene.js','app/templates/dashboard.html','app/templates/_workspace_scene.html','app/templates/_dossier_art.html','scripts/browser-validator-review.cjs'];
const hashes=()=>Object.fromEntries(sources.map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')]));
const checks=[],failures=[],errors=[],unexpected=[],requests=[],screens=[],componentStyles={};
let browser,password;
const state={marketCards:false,connected:false,realState:'filled',failDashboard:false,failureStatus:0,networkFailure:false,empty:false};
async function check(name,fn){try{await fn();checks.push(name);console.log('PASS '+name);}catch(error){failures.push({name,error:error.message});console.log('FAIL '+name+': '+error.message);}}
function mock(path,url){
 const connectedAI=state.connected?{...ai,connected:true,insights_ready:true,connections:{openai:{name:'OpenAI',connected:true},claude:{name:'Claude',connected:true}}}:ai;
 if(path==='/api/dashboard')return {...clone(dashboard),start:url.searchParams.get('start'),end:url.searchParams.get('end'),summary:state.empty?{...metric,rows:0}:metric,ai:connectedAI,...(state.marketCards?{recommendations:contentIdeas}:{})};
 if(path==='/api/settings')return {...settings,ai:connectedAI};
 if(path==='/api/finance')return {current:{...budget,month:url.searchParams.get('month')},previous:{...budget,month:'2026-08'},expenses:[{id:1,day:'2026-09-10',reference:'Despesa sintética setembro',amount:40},{id:2,day:'2026-08-05',reference:'Despesa sintética agosto',amount:80}]};
 if(path==='/api/reports')return [{id:9201,week_start:'2026-09-07'},{id:9202,week_start:'2026-08-31'}];
 if(path==='/api/executions')return {executions:[]};
 if(path==='/api/contracts/demo')return preview;
 if(path==='/api/market')return [{topic:'Tema educativo fictício',locality:'Cidade Sintética-SP',date:'2026-09-07',value:10,unit:'unidades sintéticas',source:'Fonte sintética de QA'}];
 if(path==='/api/insights'){
  if(url.searchParams.get('scope')==='demo')return {latest:null};
  const latest=fixtures.insight({scope:'demo'});delete latest.demonstration;latest.status='completed';latest.created_at='2026-09-14T12:00:00';latest.analyst='Analista sintético';latest.reviewer='Revisor sintético';
  if(state.realState==='partial'){latest.excluded=1;latest.findings=latest.findings.slice(0,1);}
  if(state.realState==='unverified'){latest.status='unverified';latest.message='Fixture sintética não verificada: a segunda revisão não foi concluída.';}
  return {latest:state.realState==='empty'?null:latest};
 }
 if(path==='/api/news'){
  const data=fixtures.news({scope:'demo'});delete data.demonstration;delete data.latest.demonstration;data.latest.status='completed';data.latest.created_at='2026-09-14T12:00:00';data.latest.sources.forEach(s=>{s.status='read';s.complete_window=true;});
  if(state.realState==='partial'){data.latest.sources[0].status='partial';data.latest.sources[0].complete_window=false;data.latest.truncated=true;}
  if(state.realState==='empty')data.latest=null;
  return data;
 }
 if(path==='/api/strategy')return {opportunities:[],notice:'Fixture vazia; nenhuma oportunidade real consultada.'};
 return undefined;
}
async function context(width=1440,theme='light',scale=1,height=900){
 const ctx=await browser.newContext({viewport:{width,height},deviceScaleFactor:scale,httpCredentials:{username:'admin',password},reducedMotion:'reduce',serviceWorkers:'block'});
 await ctx.addInitScript(theme=>{localStorage.setItem('lg-scope','demo');localStorage.setItem('lg-theme',theme);},theme);
 await ctx.route('**/*',async route=>{
  const req=route.request(),url=new URL(req.url());
  if(url.origin!==origin){unexpected.push('external blocked');return route.abort();}
  if(req.method()!=='GET'){unexpected.push('mutation blocked: '+url.pathname);return route.abort();}
  if(url.pathname.startsWith('/api/')){
   requests.push({path:url.pathname,query:Object.fromEntries(url.searchParams),method:req.method()});
   if(url.pathname==='/api/dashboard'&&state.networkFailure)return route.abort('connectionfailed');
   if(url.pathname==='/api/dashboard'&&(state.failDashboard||state.failureStatus))return route.fulfill({status:state.failureStatus||503,json:{detail:'Falha sintética controlada para testar recuperação.'}});
   const json=mock(url.pathname,url);
   if(json!==undefined)return route.fulfill({json});
   unexpected.push('unknown API blocked: '+url.pathname);return route.abort();
  }
  if(url.pathname==='/favicon.ico')return route.fulfill({status:204,body:''});
  if(/^\/painel\/[a-z]+$/.test(url.pathname)||url.pathname.startsWith('/static/'))return route.continue();
  unexpected.push('unknown local GET blocked: '+url.pathname);return route.abort();
 });
 const page=await ctx.newPage();page.setDefaultTimeout(7000);
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&!/503|400 \(Bad Request\)|422 \(Unprocessable|ERR_CONNECTION_FAILED/.test(m.text()))errors.push(m.text());});
 return {ctx,page};
}
async function ready(page){await page.waitForFunction(()=>document.getElementById('content')?.getAttribute('aria-busy')==='false');await page.waitForLoadState('networkidle');await page.evaluate(()=>document.fonts.ready);}
async function go(page,name,scope='demo',extra=''){state.marketCards=name==='market';const response=await page.goto(origin+'/painel/'+name+'?scope='+scope+'&start=2026-09-01&end=2026-09-30'+extra);assert.equal(response.status(),200);await ready(page);}
async function shot(page,name){
 if(name.startsWith('insights-')&&!name.includes('-real-'))componentStyles[name]=await page.locator('.insight-start, .insight-start > div, .insight-start h2, .insight-start p, .insight-start .button').evaluateAll(items=>items.map(item=>{const s=getComputedStyle(item);return {tag:item.tagName,style:Object.fromEntries([...s].map(key=>[key,s.getPropertyValue(key)]))};}));
await page.evaluate(()=>{document.activeElement?.blur();window.scrollTo(0,0);});await page.screenshot({path:output+'/'+name+'.png',fullPage:true});screens.push(name);}
async function noOverflow(page){assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'Document horizontal overflow');}
async function reportLayout(page){
 assert.equal(await page.locator('ul.report-list > li').count(),2);
 const rows=await page.locator('ul.report-list > li').evaluateAll(items=>items.map(item=>{
  const week=item.querySelector('.report-week').getBoundingClientRect(),downloads=item.querySelector('.report-downloads').getBoundingClientRect();
  return {overlap:Math.min(week.right,downloads.right)-Math.max(week.left,downloads.left)>1&&Math.min(week.bottom,downloads.bottom)-Math.max(week.top,downloads.top)>1,weekOverflow:item.querySelector('.report-week').scrollWidth>item.querySelector('.report-week').clientWidth+1};
 }));
 assert.ok(rows.every(row=>!row.overlap&&!row.weekOverflow),'Report week and download actions never overlap');
}
async function openPeriod(page){if(!await page.locator('.period-picker').evaluate(e=>e.open))await page.locator('.period-picker > summary').click();}
async function interactionChecks(){
 const {ctx,page}=await context();
 try{
  await check('v58 indicator dates visible, never inferred from filters or access time',async()=>{
   await go(page,'market');const date=page.locator('.rec > .rec-meta time');
   assert.equal(await date.count(),1);assert.ok(await date.isVisible());assert.equal(await date.getAttribute('datetime'),'2026-08-17');assert.equal(await date.innerText(),'17/08/2026');
   assert.equal(await page.getByText('Data do indicador não informada.',{exact:true}).count(),2);
   assert.equal(await page.locator('.rec > .rec-meta time[datetime="2026-09-14"]').count(),0);
  });
  await check('v58 demo notice carries fixed context once',async()=>{
   await go(page,'news');assert.equal(await page.locator('.demo-explanation').count(),1);assert.match(await page.locator('.demo-explanation').innerText(),/7 a 13 de setembro de 2026.*não acompanha os filtros/);
   assert.equal(await page.getByText('Nomes, notícias e números fictícios.',{exact:false}).count(),1);
   assert.equal(await page.locator('#scan-news').count(),0);
  });
  await check('P1-01 URL, four-page navigation, reload and Back',async()=>{
   await go(page,'campaigns','demo','&area=trabalhista');
   for(const name of ['agents','insights','overview','campaigns']){
    await page.locator('#main-nav a[href*="/painel/'+name+'"]').click();await ready(page);
    assert.equal(await page.locator('#start').inputValue(),'2026-09-01');assert.equal(await page.locator('#end').inputValue(),'2026-09-30');
    assert.equal(new URL(page.url()).searchParams.get('start'),'2026-09-01');
    if(name!=='campaigns')assert.equal(new URL(page.url()).searchParams.has('area'),false);
   }
   await page.reload();await ready(page);assert.equal(await page.locator('#start').inputValue(),'2026-09-01');
   await openPeriod(page);await page.locator('#start').fill('2026-08-01');await page.locator('#end').fill('2026-08-31');await page.locator('#refresh').click();await ready(page);
   assert.equal(new URL(page.url()).searchParams.get('start'),'2026-08-01');
   await page.goBack();await ready(page);assert.equal(await page.locator('#start').inputValue(),'2026-09-01');
   const last=requests.filter(r=>r.path==='/api/dashboard').at(-1);assert.equal(last.query.start,'2026-09-01');
  });
  for(const [name,start,end,field,message] of [['empty','','2026-09-30','start',/data inicial/],['inverted','2026-09-30','2026-09-01','end',/posterior/],['too-long','2024-01-01','2026-09-30','end',/366/]])await check('P2-02 invalid '+name,async()=>{
   await go(page,'overview');await openPeriod(page);await page.locator('#start').fill(start);await page.locator('#end').fill(end);const before=requests.length;
   await page.locator('#refresh').click();await page.locator('#period-error').waitFor();
   assert.match(await page.locator('#period-error').innerText(),message);assert.equal(requests.length,before);
   assert.equal(await page.locator('#'+field).evaluate(e=>e===document.activeElement),true);
   assert.equal(await page.locator('.period-picker').evaluate(e=>e.open),true);assert.equal(await page.locator('#start').inputValue(),start);
   assert.equal(await page.locator('#overview-summary').textContent(),'');assert.equal(await page.locator('#content .metric,.review-desk').count(),0);
   await shot(page,'invalid-'+name+'-1440');
  });
  await check('P1-02/03/04 monthly finance and all-month expenses',async()=>{
   await go(page,'finance','demo','&month=2026-09');assert.equal(await page.locator('#period-bar').isVisible(),false);
   assert.equal(await page.locator('#finance-month').inputValue(),'2026-09');
   await page.locator('#finance-month').fill('2026-08');await page.locator('#finance-month').dispatchEvent('change');await ready(page);
   const last=requests.filter(r=>r.path==='/api/finance').at(-1);assert.equal(last.query.month,'2026-08');assert.equal(last.query.start,undefined);
   const text=await page.locator('#content').innerText();assert.match(text,/Até 100 registros/);assert.match(text,/todos os meses/);assert.match(text,/10\/09\/2026/);assert.match(text,/05\/08\/2026/);assert.match(text,/não reduzem esse saldo/);
   await page.getByText('Ajustar orçamento',{exact:true}).click();assert.ok(await page.getByLabel('Alocação legada de infraestrutura').isVisible());
  });
  await check('P1-05 shared AI scope and billing',async()=>{await go(page,'settings');assert.match(await page.locator('#ai').innerText(),/Configuração compartilhada/);assert.match(await page.locator('#ai').innerText(),/Dados fictícios também podem gerar chamadas externas cobradas/);assert.equal(await page.locator('#api-key').getAttribute('type'),'password');});
  await check('P1-06 campaign efficiency including zero and null',async()=>{
   await go(page,'campaigns');const table=page.locator('.campaign-desktop').first();
   assert.ok(await table.getByRole('columnheader',{name:'Custo por qualificado',exact:true}).isVisible());assert.ok(await table.getByRole('columnheader',{name:'Custo por contratação',exact:true}).isVisible());
   assert.match(await table.getByRole('row').filter({hasText:'sem denominador'}).innerText(),/—.*—/);
   assert.match(await table.getByRole('row').filter({hasText:'custo zero'}).innerText(),/0,00/);
   assert.match(await page.locator('#content').innerText(),/divisor é zero/);
  });
  await check('P2-03 recommendation entity and decision meaning',async()=>{await go(page,'agents');await page.getByText('Revisar evidências',{exact:true}).first().click();assert.ok(await page.getByRole('columnheader',{name:'Área',exact:true}).isVisible());assert.match(await page.locator('.rec').first().innerText(),/nenhum anúncio é alterado|registra.*decisão/i);});
  await check('P2-04 report JSON uniqueness, full week, snapshot, Monday',async()=>{
   await go(page,'reports');assert.equal(await page.locator('a[href*="/api/reports/"][href*="/json"]').count(),2);assert.equal(await page.locator('a[href*="/api/reports/"][href*="/pdf"]').count(),2);
   assert.match(await page.locator('#content').innerText(),/07\/09\/2026 a 13\/09\/2026/);assert.match(await page.locator('#content').innerText(),/não se atualizam/);
   const input=page.locator('#report [name=week_start]');await input.fill('2026-09-08');const before=requests.length;await page.locator('#report button').click();
   assert.match(await page.locator('#report-week-error').innerText(),/segunda-feira/);assert.equal(await input.evaluate(e=>e===document.activeElement),true);assert.equal(requests.length,before);
   await input.fill('2026-09-14');await input.dispatchEvent('change');assert.match(await page.locator('#report-week-hint').innerText(),/14\/09\/2026 a 20\/09\/2026/);
  });
  for(const name of ['news','strategy','insights'])await check('P2-05 static demo '+name,async()=>{
   state.connected=false;await go(page,name);assert.ok(await page.getByRole('heading',{name:'Exemplo demonstrativo',exact:true}).isVisible());
   assert.match(await page.locator('#content').innerText(),/Nenhuma IA ou coleta foi executada/);assert.equal(await page.locator('#content a[href="null"],#content a[href*="/api/news/demo-"]').count(),0);
   if(name!=='insights')assert.equal(await page.locator('#scan-news,#insight-form').count(),0);
   if(name==='insights'){assert.equal(await page.locator('#insight-form').count(),0);assert.ok(await page.getByRole('heading',{name:'Exemplo: contatos qualificados registrados',exact:true}).isVisible());}
  });
  await check('Existing paid demo action is explicitly distinguished',async()=>{state.connected=true;await go(page,'insights');assert.ok(await page.locator('#insight-form').isVisible());assert.match(await page.locator('#content').innerText(),/cobrança, inclusive com dados fictícios/);assert.equal(await page.locator('.demo-explanation button').count(),0);state.connected=false;});
  await check('P2-06 contract format and ingestion limitation',async()=>{await go(page,'contracts');assert.match(await page.locator('#content').innerText(),/Formato conferido/);assert.match(await page.locator('#content').innerText(),/não comprova identidade/);assert.match(await page.locator('#page-description').innerText(),/bloqueados/);assert.equal(await page.locator('input[type=file]').count(),0);});
  for(const status of [400,422])await check('HTTP '+status+' has no retry action',async()=>{
   state.failureStatus=status;await go(page,'overview');assert.equal(await page.locator('.load-error').count(),1);assert.equal(await page.locator('#retry-load').count(),0);assert.equal(await page.locator('#overview-summary').textContent(),'');
   await shot(page,'http-'+status+'-1440');state.failureStatus=0;
  });state.failureStatus=0;
  await check('Connection failure offers retry',async()=>{
   state.networkFailure=true;await go(page,'overview');assert.ok(await page.locator('#retry-load').isVisible());state.networkFailure=false;await page.locator('#retry-load').click();await ready(page);assert.equal(await page.locator('#overview-summary .metric').count(),3);
  });state.networkFailure=false;
  await check('503 removes results and retry recovers',async()=>{
   await go(page,'overview');state.failDashboard=true;await page.reload();await ready(page);assert.ok(await page.locator('#retry-load').isVisible());assert.equal(await page.locator('#overview-summary').textContent(),'');
   await shot(page,'network-error-1440');state.failDashboard=false;await page.locator('#retry-load').click();await ready(page);assert.equal(await page.locator('#overview-summary .metric').count(),3);
  });state.failDashboard=false;
  await check('Keyboard skip, disclosure, menu Escape, focus return',async()=>{
   await go(page,'campaigns');await page.keyboard.press('Tab');assert.equal(await page.locator('.skip').evaluate(e=>e===document.activeElement),true);await page.keyboard.press('Enter');assert.equal(await page.locator('#main').evaluate(e=>e===document.activeElement),true);
   const details=page.locator('details').filter({has:page.getByText('Ver mais indicadores',{exact:true})});await details.locator('summary').focus();await page.keyboard.press('Space');assert.equal(await details.evaluate(e=>e.open),true);await page.keyboard.press('Enter');assert.equal(await details.evaluate(e=>e.open),false);
   await page.setViewportSize({width:390,height:900});await page.locator('#menu-toggle').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'true');await page.keyboard.press('Escape');assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'false');assert.equal(await page.locator('#menu-toggle').evaluate(e=>e===document.activeElement),true);
   await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');assert.equal(await page.locator('#menu-toggle').evaluate(e=>e===document.activeElement),true);
  });
 }finally{state.connected=false;state.failDashboard=false;state.failureStatus=0;state.networkFailure=false;await ctx.close();}
}
async function matrix(){
 for(const width of widths)for(const theme of themes){
  const {ctx,page}=await context(width,theme);
  try{for(const name of pages)await check('capture '+name+' '+theme+' '+width,async()=>{
   await go(page,name);await shot(page,name+'-'+theme+'-'+width);await noOverflow(page);assert.equal(await page.locator('.load-error').count(),0);assert.ok(await page.locator('#title').isVisible());
   if(name==='reports')await reportLayout(page);
   if(name==='overview'){
    const metrics=await page.locator('#overview-summary').boundingBox(),attention=await page.locator('#review-heading').boundingBox(),gallery=await page.locator('.workspace-scene').boundingBox();
    assert.equal(await page.locator('#overview-summary .metric').count(),3);assert.ok(metrics.y+metrics.height<gallery.y,'Metrics before gallery');
    if(width===1440){assert.ok(metrics.y+metrics.height<=900,'Three metrics in viewport');assert.ok(gallery.y<900,'Dossier collection begins in viewport');assert.ok(gallery.y+gallery.height<=attention.y,'Detailed analysis follows the dossier collection');assert.equal(await page.locator('.campaign-desktop table').first().evaluate(table=>table.scrollWidth<=table.closest('.table-wrap').clientWidth+1),true,'All six overview columns fit without internal scrolling');}
   }
  });}finally{await ctx.close();}
 }
 for(const theme of themes){
  // Reflow equivalent to a 1440x900 display at 200%, not physical browser zoom.
  const {ctx,page}=await context(720,theme,2,450);
  try{for(const name of pages)await check('200pct emulation '+name+' '+theme,async()=>{await go(page,name);await shot(page,'zoom200-emulated-'+name+'-'+theme);await noOverflow(page);if(name==='reports')await reportLayout(page);});}finally{await ctx.close();}
 }
 for(const width of [390,1440])for(const theme of themes){
  const {ctx,page}=await context(width,theme);
  try{for(const name of ['news','insights'])for(const variant of name==='news'?['filled','partial','empty']:['filled','partial','unverified'])await check('real-scope fixture '+name+' '+variant+' '+theme+' '+width,async()=>{
   state.realState=variant;state.connected=true;await go(page,name,'real');await shot(page,name+'-real-'+variant+'-'+theme+'-'+width);await noOverflow(page);assert.equal(await page.locator('.demo-explanation').count(),0);
   if(name==='news'&&variant==='partial')assert.match(await page.locator('.coverage-notice').innerText(),/Cobertura parcial/);
   if(name==='news'&&variant!=='empty'){assert.doesNotMatch(await page.locator('.sources').first().innerText(),/fonte fictícia/i);assert.match(await page.locator('.sources').first().innerText(),/link indisponível/i);}
   if(name==='insights'&&variant==='unverified'){assert.match(await page.locator('#content').innerText(),/não verificada/);assert.equal(await page.locator('.rec.insight').count(),0);}
  });}finally{state.realState='filled';state.connected=false;await ctx.close();}
 }
}
async function presentationCaptures(){
 // Client-facing examples use coherent totals and plain names, rather than the
 // deliberately pathological denominator fixtures used by the regression tests.
 dashboard.campaigns={
  'Orientação trabalhista — exemplo':{...metric,rows:2,days:2,cost:160,impressions:1600,clicks:80,qualified:8,hires:1,contacts:10,appointments:3,conversions:5,cph:160},
  'Planejamento previdenciário — exemplo':{...metric,rows:1,days:1,cost:80,impressions:800,clicks:40,qualified:4,hires:1,contacts:5,appointments:1,conversions:3,cph:80}
 };
 for(const key of ['cost','impressions','clicks','qualified','hires','contacts','appointments','conversions'])assert.equal(Object.values(dashboard.campaigns).reduce((sum,row)=>sum+row[key],0),metric[key],key+' presentation totals');
 for(const theme of themes){
  const {ctx,page}=await context(1440,theme,2,1000);
  try{for(const name of ['overview','campaigns','finance','reports','insights','agents','news','strategy']){
   await check('presentation '+name+' '+theme,async()=>{
    await go(page,name);await noOverflow(page);await shot(page,name+'-'+theme);
    const selector={overview:'.workspace-scene',campaigns:'.panel',finance:'.budget-line',reports:'.panel',insights:'.insight-start',agents:'.panel',news:'.news-layout',strategy:'.strategy-item'}[name];
    const target=page.locator(selector).first();
    if(await target.count())await target.screenshot({path:output+'/'+name+'-detail-'+theme+'.png'});
    if(name==='overview')await page.locator('.page-header').screenshot({path:output+'/metrics-'+theme+'.png'});
    if(name==='insights')await page.locator('.rec.insight').first().screenshot({path:output+'/insight-example-'+theme+'.png'});
   });
  }}finally{await ctx.close();}
 }
}
(async()=>{
 const line=fs.readFileSync('.env','utf8').split(/\r?\n/).find(line=>/^\s*ADMIN_PASSWORD\s*=/.test(line));assert.ok(line,'Local authentication required');password=line.slice(line.indexOf('=')+1).trim().replace(/^(['"])(.*)\1$/,'$2');
 fs.mkdirSync(output,{recursive:true});const before=hashes();browser=await chromium.launch({channel:'msedge',headless:true});
 try{if(process.env.VALIDATOR_PRESENTATION_ONLY==='1')await presentationCaptures();else{await interactionChecks();if(process.env.VALIDATOR_INTERACTIONS_ONLY!=='1')await matrix();}}
 finally{await browser.close();}
 const after=hashes(),changedDuringRun=sources.filter(file=>before[file]!==after[file]);
 fs.writeFileSync(output+'/component-styles.json',JSON.stringify(componentStyles,null,2));
 const result={passed:checks.length,checks,failures,errors,unexpected,requests,screens,captures:screens.length,changedDuringRun,realApiRequests:0,realMutations:0,externalRequestsAllowed:0,zoomMethod:'720x450 CSS viewport at deviceScaleFactor 2, equivalent reflow for 1440x900 at 200%; not actual browser or hardware zoom',limits:['Backend contract ingestion block is tested separately by coordinator.','No physical device, screen reader or end-user test.','Visual screenshots require independent review; asserts are not accessibility certification.']};
 fs.writeFileSync(output+'/results.json',JSON.stringify(result,null,2));fs.writeFileSync(output+'/manifest.json',JSON.stringify({generatedAt:new Date().toISOString(),before,after,changedDuringRun},null,2));
 console.log(JSON.stringify({passed:checks.length,failures,errors,unexpected,captures:screens.length,changedDuringRun}));
 if(failures.length||errors.length||unexpected.length)process.exitCode=1;
})().catch(error=>{console.error(error.message);process.exitCode=1;});
