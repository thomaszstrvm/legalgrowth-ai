// All API responses are synthetic. Only local HTML/static GETs reach the server.
// No real API fetch, mutations, external requests, or credential output.
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require('playwright');
const origin=new URL(process.env.TEST_ORIGIN||'http://127.0.0.1:8000').origin;
assert.ok(['127.0.0.1','localhost','[::1]'].includes(new URL(origin).hostname),'Loopback origin required');
const output=process.env.EDITORIAL_STATES_OUTPUT||'output/design-review/design-engineering-v1/states';
const widths=[1366,390,320],themes=['light','dark'];
const metric={rows:3,days:3,cost:420,impressions:4200,clicks:126,qualified:12,hires:2,contacts:18,appointments:6,conversions:12,ctr:3,cpc:3.33,cpq:35,cph:210};
const ai={connected:true,insights_ready:true,connections:{openai:{name:'OpenAI',connected:true},claude:{name:'Claude',connected:true}},monthly_limit:60,reserved_brl:4};
const budget={month:'2026-10',planned:2000,spent:420,balance:1580,consumed_percent:21,alerts:[],imported_ads:420,manual_expenses:0,software_expenses:0,allocations:{trabalhista:1400,previdenciario:600,infraestrutura:0,reserva:0}};
const dashboard={summary:metric,campaigns:{'Campanha sintética de orientação':metric},localities:{},keywords:{},evolution:[],budget,recommendations:[],ai,ai_priorities:[]};
const evidence=[{subject_name:'Campanha sintética de orientação',label:'Contatos qualificados',metric:'qualified',period:'current',value:12},{subject_name:'Campanha sintética de orientação',label:'Custo por contato qualificado',metric:'cpq',period:'current',value:35}];
const findings=[{kind:'strength',title:'Contatos qualificados distribuídos pelo período',explanation:'Nesta amostra exclusivamente sintética, os contatos aparecem em mais de um dia. Isso ajuda a conferir o acompanhamento sem atribuir causalidade à campanha.',action:'Confira os registros agrupados antes de decidir sobre o próximo período.',evidence},{kind:'weakness',title:'Amostra pequena para comparar contratações',explanation:'Duas contratações sintéticas não sustentam uma conclusão sobre a tendência futura. Mudanças de custo podem refletir a quantidade reduzida de registros.',action:'Reúna outro período comparável e revise as diferenças antes de ajustar o orçamento.',evidence:[{subject_name:'Campanha sintética de orientação',label:'Contratações',metric:'hires',period:'current',value:2}]}];
const insight={analyst:'OpenAI · exemplo sintético',reviewer:'Claude · exemplo sintético',created_at:'2026-10-23T12:00:00',status:'completed',coverage:{campaigns:1},excluded:0,findings};
const articles=[{id:9101,title:'Cidade Sintética anuncia atendimento educativo sobre benefícios',source:'Jornal Sintético Regional',published:'2026-10-15',url:'https://example.invalid/noticia-sintetica-1'},{id:9102,title:'Encontro fictício orienta trabalhadores sobre documentação',source:'Agência Sintética Local',published:'2026-10-16',url:'https://example.invalid/noticia-sintetica-2'}];
const news={localities:['Cidade Sintética-SP'],coverage_note:'Fixture de QA: notícias, cidades, números e fontes exclusivamente sintéticos.',latest:{id:9901,status:'completed',start:'2026-10-12',end:'2026-10-18',created_at:'2026-10-23T12:00:00',message:'Coleta sintética concluída; hipóteses conferidas nesta fixture.',cities:['Cidade Sintética-SP'],signals:[{label:'Orientação sobre benefícios',count:2,source_count:2}],scenarios:[{title:'Acompanhar dúvidas sobre a documentação',observation:'Duas publicações fictícias mencionaram encontros educativos na região.',scenario:'Pode haver interesse em conteúdo geral sobre os documentos exigidos, sem inferir demanda por serviços jurídicos.',watch_next:'Verifique se novas fontes confirmam o assunto e mantenha a revisão humana.',article_ids:[9101,9102]}],articles,sources:[{name:'Jornal Sintético Regional',status:'read',complete_window:true},{name:'Agência Sintética Local',status:'read',complete_window:true}],truncated:false}};
const cases=[
 {name:'insights-filled',page:'insights',title:'Insights de IA',latest:insight},
 {name:'insights-partial',page:'insights',title:'Insights de IA',latest:{...insight,excluded:1,findings:[findings[0]]}},
 {name:'insights-unverified',page:'insights',title:'Insights de IA',latest:{...insight,status:'unverified',message:'Análise sintética não verificada: a segunda IA não concluiu a revisão. Nenhuma conclusão deve orientar decisões antes da conferência.'}},
 {name:'news-filled',page:'news',title:'Notícias regionais',news},
 {name:'news-partial',page:'news',title:'Notícias regionais',news:{...news,latest:{...news.latest,message:'Fontes parciais: a cobertura sintética não alcançou toda a semana. Confira os limites antes de interpretar os assuntos.',sources:[{name:'Jornal Sintético Regional',status:'partial',complete_window:false},{name:'Agência Sintética Local',status:'unavailable',complete_window:false}],truncated:true}}},
 {name:'news-empty',page:'news',title:'Notícias regionais',news:{...news,latest:null}},
 {name:'overview-empty',page:'overview',title:'Resumo'}
];
function passwordFromLocalEnv(){
 const line=fs.readFileSync('.env','utf8').split(/\r?\n/).find(line=>/^\s*ADMIN_PASSWORD\s*=/.test(line));
 assert.ok(line,'Local authentication password required');
 const value=line.slice(line.indexOf('=')+1).trim();
 return /^(['"]).*\1$/.test(value)?value.slice(1,-1):value;
}
async function verifyState(page,fixture){
 const content=page.locator('#content');
 assert.equal(await page.title(),fixture.title+' | LegalGrowth');
 assert.equal(await page.locator('#title').textContent(),fixture.title);
 assert.equal(await page.locator('.load-error,.form-error').count(),0,'No loading/form error');
 if(fixture.page==='insights'){
  assert.ok(await page.getByLabel('Quem faz a análise').isVisible());
  assert.ok(await page.getByRole('button',{name:'Analisar novamente',exact:true}).isVisible());
  assert.match(await page.locator('.insight-meta').innerText(),/Análise: OpenAI.*Revisão: Claude/);
  if(fixture.name==='insights-unverified'){
   assert.match(await content.getByRole('status').innerText(),/não verificada.*não concluiu a revisão/);
   assert.equal(await page.locator('.rec.insight').count(),0,'Unverified conclusions hidden');
  }else{
   assert.ok(await page.getByRole('heading',{name:'Pontos fortes',exact:true}).isVisible());
   assert.ok(await page.getByRole('heading',{name:'Pontos a melhorar',exact:true}).isVisible());
   assert.match(await content.innerText(),/não garante que todos sejam detectados/);
   for(const summary of await content.locator('details > summary').all())await summary.click();
   assert.ok(await page.getByRole('columnheader',{name:'Campanha / grupo',exact:true}).first().isVisible());
   if(fixture.name==='insights-partial'){
    assert.match(await content.innerText(),/1 conclusão\(ões\) sem confirmação foram retiradas/);
    assert.match(await content.innerText(),/Nenhum ponto confirmado nesta categoria/);
   }
  }
 }else if(fixture.page==='news'){
  assert.match(await content.innerText(),/Região acompanhada: Cidade Sintética-SP/);
  if(fixture.name==='news-empty'){
   assert.match(await content.innerText(),/As notícias encontradas aparecerão aqui, com fontes e links/);
   assert.ok(await page.getByRole('button',{name:'Buscar notícias da semana anterior',exact:true}).isVisible());
  }else{
   assert.ok(await page.getByRole('heading',{name:'Assuntos encontrados',exact:true}).isVisible());
   assert.ok(await page.getByRole('heading',{name:'Possibilidades para acompanhar',exact:true}).isVisible());
   assert.match(await content.innerText(),/Cenários são hipóteses; duas IAs também podem errar/);
   for(const summary of await content.locator('details > summary').all())await summary.click();
   const links=content.locator('a[href^="https://example.invalid/"]');
   assert.equal(await links.count(),4,'Scenario and source list preserve sources');
   for(const link of await links.all())assert.match(await link.getAttribute('rel'),/noopener/);
   if(fixture.name==='news-partial'){
    assert.match(await content.innerText(),/Fontes parciais/);
    assert.ok(await page.getByRole('cell',{name:'Parcial',exact:true}).isVisible());
    assert.ok(await page.getByRole('cell',{name:'Indisponível',exact:true}).isVisible());
    assert.match(await content.innerText(),/Cobertura incompleta/);
    assert.match(await content.innerText(),/atingiu o limite de notícias/);
   }
  }
 }else{
  assert.ok(await page.getByRole('heading',{name:'Comece pelos resultados das campanhas',exact:true}).isVisible());
  assert.equal(await content.locator('.start-steps > li').count(),3);
  assert.ok(await content.getByRole('link',{name:'Importar resultados',exact:true}).isVisible());
 }
}
(async()=>{
 const password=passwordFromLocalEnv();
 const browser=await chromium.launch({channel:'msedge',headless:true});
 fs.mkdirSync(output,{recursive:true});
 const checks=[],errors=[],unexpected=[],apiCalls=[];
 let blockedMutations=0,blockedExternal=0;
 try{
  for(const width of widths)for(const theme of themes)for(const fixture of cases){
   const label=fixture.name+'-'+theme+'-'+width;
   const context=await browser.newContext({viewport:{width,height:900},httpCredentials:{username:'admin',password},reducedMotion:'reduce',serviceWorkers:'block'});
   try{
    await context.addInitScript(theme=>{localStorage.setItem('lg-scope','real');localStorage.setItem('lg-theme',theme);},theme);
    await context.route('**/*',async route=>{
     const req=route.request(),url=new URL(req.url());
     if(url.origin!==origin){blockedExternal++;unexpected.push(label+': external request blocked');return route.abort();}
     if(req.method()!=='GET'){blockedMutations++;unexpected.push(label+': mutation blocked');return route.abort();}
     if(url.pathname.startsWith('/api/')){
      apiCalls.push({case:label,path:url.pathname});
      if(url.pathname==='/api/dashboard')return route.fulfill({json:fixture.page==='overview'?{...dashboard,summary:{...metric,rows:0},campaigns:{}}:dashboard});
      if(url.pathname==='/api/insights'&&fixture.page==='insights')return route.fulfill({json:{latest:fixture.latest}});
      if(url.pathname==='/api/news'&&fixture.page==='news')return route.fulfill({json:fixture.news});
      unexpected.push(label+': unexpected API '+url.pathname);return route.abort();
     }
     if(url.pathname==='/favicon.ico')return route.fulfill({status:204,body:''});
     if(url.pathname==='/painel/'+fixture.page||url.pathname.startsWith('/static/'))return route.continue();
     unexpected.push(label+': unexpected local GET '+url.pathname);return route.abort();
    });
    const page=await context.newPage();
    page.on('pageerror',error=>errors.push(label+': '+error.message));
    page.on('console',message=>{if(message.type()==='error')errors.push(label+': '+message.text());});
    const response=await page.goto(origin+'/painel/'+fixture.page);
    assert.equal(response.status(),200,label+': authenticated HTML');
    await page.waitForFunction(()=>document.getElementById('content')?.getAttribute('aria-busy')==='false');
    await page.waitForLoadState('networkidle');
    await page.evaluate(()=>document.fonts.ready);
    await verifyState(page,fixture);
    assert.equal(await page.locator('html').getAttribute('data-theme'),theme);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,label+': no document overflow');
    assert.deepEqual(await page.evaluate(()=>[...document.fonts].filter(font=>font.status==='error').map(font=>font.family)),[],label+': fonts loaded');
    await page.evaluate(()=>{document.activeElement?.blur();window.scrollTo(0,0);});
    await page.screenshot({path:output+'/'+label+'.png',fullPage:true});
    checks.push({state:fixture.name,width,theme,overflow:false,titlesAndStateLabels:true,expandedEvidence:!fixture.name.endsWith('empty')&&!fixture.name.endsWith('unverified')});
   }finally{await context.close();}
  }
  assert.deepEqual(errors,[]);assert.deepEqual(unexpected,[]);
  const result={captures:checks.length,checks,apiCalls,jsAndConsoleErrors:errors,unexpectedRequests:unexpected,blockedMutations,blockedExternal,realApiRequests:0,realMutations:0,externalRequestsAllowed:0};
  fs.writeFileSync(output+'/results.json',JSON.stringify(result,null,2));
  const files=['app/static/app.js','app/static/arc.css','app/static/style.css','app/templates/dashboard.html','app/templates/_workspace_scene.html','app/templates/_dossier_art.html','scripts/browser-editorial-states.cjs'];
  fs.writeFileSync(output+'/manifest.json',JSON.stringify({generatedAt:new Date().toISOString(),sources:Object.fromEntries(files.map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')]))},null,2));
  console.log(JSON.stringify({captures:checks.length,widths,themes,states:cases.map(f=>f.name),apiRequestsMocked:apiCalls.length,errors:errors.length,unexpectedRequests:unexpected.length,realMutations:0}));
 }finally{await browser.close();}
})().catch(error=>{console.error(error.message);process.exitCode=1;});
