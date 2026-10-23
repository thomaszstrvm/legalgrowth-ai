// Synthetic API fixtures only. Local credentials authenticate HTML/static files;
// viewer emulation checks frontend visibility, never backend authorization.
const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const origin='http://127.0.0.1:8000';
const output='output/design-review/strategy-fixtures';
const metric={rows:1,days:1,cost:123,impressions:100,clicks:10,qualified:3,hires:1,contacts:5,appointments:2,conversions:2,ctr:10,cpc:12.3,cpq:41,cph:123};
const ai={connected:false,insights_ready:false,connections:{},monthly_limit:20,reserved_brl:0};
function dashboard(scope){return {scope,start:'2026-10-01',end:'2026-10-22',summary:metric,campaigns:{[scope==='demo'?'CAMPANHA SINTÉTICA DEMO':'CAMPANHA SINTÉTICA REAL']:metric},localities:{},keywords:{},evolution:[{date:'2026-10-01',cost:123,clicks:10}],budget:{month:'2026-10',planned:2000,spent:123,balance:1877,consumed_percent:6.15,alerts:[]},recommendations:[],ai,ai_priorities:[]};}
const socialWeights={access:25,relevance:20,information_gap:15,benefit:15,prevention:15,community:10};
const financialWeights={demand:20,area_fit:10,capacity:20,cost_time:20,history:15,sustainability:15};
const criterion=value=>({value,evidence_ids:['evidence-synthetic-1'],rationale:'Justificativa fictícia para avaliar a apresentação.',human_confirmed:true});
const opportunity={id:'synthetic-1',title:'Notícia fictícia <img src=x onerror="window.__fixtureXss=1">',source_url:'https://example.com/noticia-ficticia',published:'2026-10-20',event_date:null,cities:['Cruzeiro-SP'],areas:['trabalhista'],source_reliability:'Confiabilidade fictícia: confirmar a fonte.',social:{score:0,status:'Avaliação humana ponderada',missing:[],criteria:Object.fromEntries(Object.keys(socialWeights).map(k=>[k,criterion(0)])),weights:socialWeights},financial:{score:null,status:'Dados insuficientes',missing:Object.keys(financialWeights).filter(k=>k!=='demand'),criteria:{demand:criterion(30)},weights:financialWeights},economic_view:'Sem base para projetar retorno financeiro.',social_view:'Exemplo sintético de benefício social avaliado.',devils_advocate:'O título não demonstra necessidade de contratação.',question:'O conteúdo ajuda a comunidade sem gerar contratos?',next_step:'Conferir a fonte e solicitar avaliação humana.',human_review_required:true,method:'deterministic',uncertainty:'high',conflict:'CONFLITO SINTÉTICO: fontes discordam sobre a data.'};
const strategy={schema_version:'1.0',method:'deterministic',notice:'As dimensões são independentes. Dados exclusivamente sintéticos.',opportunities:[opportunity,{...opportunity,id:'synthetic-2',title:'Segundo exemplo fictício',conflict:null}]};
const news={latest:{id:999,status:'completed',start:'2026-10-12',end:'2026-10-18',created_at:'2026-10-19T08:00:00',message:'NOTÍCIAS SINTÉTICAS PARA TESTE',cities:['Cruzeiro-SP'],signals:[{label:'Trabalho',count:2,source_count:1}],scenarios:[{title:'Cenário fictício para acompanhamento',observation:'Uma fonte fictícia publicou uma notícia.',scenario:'A notícia pode orientar uma pauta educativa.',watch_next:'Confirmar o acontecimento com outras fontes.',article_ids:['article-synthetic-1']}],articles:[{id:'article-synthetic-1',url:'https://example.com/noticia-ficticia',title:'Notícia sintética <script>window.__fixtureXss=1</script>',source:'Jornal fictício',published:'2026-10-15'}],sources:[{name:'Jornal fictício',status:'partial',complete_window:false},{name:'Outra fonte fictícia',status:'unavailable',complete_window:false}],truncated:true}};
(async()=>{
  const env=Object.fromEntries(fs.readFileSync('.env','utf8').split(/\r?\n/).filter(l=>l.includes('=')).map(l=>[l.slice(0,l.indexOf('=')),l.slice(l.indexOf('=')+1)]));
  const browser=await chromium.launch({channel:'msedge',headless:true});
  fs.mkdirSync(output,{recursive:true});
  const errors=[];let blockedMutations=0;
  try{
    async function contextFor(viewer=false){
      const context=await browser.newContext({httpCredentials:{username:'admin',password:env.ADMIN_PASSWORD},viewport:{width:1440,height:900},reducedMotion:'reduce'});
      await context.addInitScript(()=>{try{localStorage.setItem('lg-scope','demo');localStorage.setItem('lg-theme','light');}catch{ /* about:blank has no storage origin */ }});
      await context.route('**/*',async route=>{
        const request=route.request(),url=new URL(request.url());
        if(url.origin!==origin)return route.abort();
        if(request.method()!=='GET'){blockedMutations++;return route.abort();}
        if(url.pathname==='/api/dashboard')return route.fulfill({json:dashboard(url.searchParams.get('scope'))});
        if(url.pathname==='/api/strategy')return route.fulfill({json:strategy});
        if(url.pathname==='/api/news')return route.fulfill({json:news});
        if(url.pathname==='/api/settings')return route.fulfill({json:{ai,localities:['Cruzeiro-SP'],last_week:'2026-10-12',scheduler_enabled:false}});
        if(url.pathname==='/api/executions')return route.fulfill({json:{executions:[]}});
        if(url.pathname==='/api/reports')return route.fulfill({json:[]});
        if(url.pathname==='/api/finance')return route.fulfill({json:{current:dashboard('demo').budget,previous:dashboard('demo').budget,expenses:[]}});
        if(url.pathname.startsWith('/api/'))throw Error('Unexpected API fixture request: '+url.pathname);
        if(viewer&&(url.pathname==='/'||url.pathname.startsWith('/painel/'))){
          const response=await route.fetch();
          return route.fulfill({response,body:(await response.text()).replace('data-user="admin"','data-user="viewer"')});
        }
        return route.continue();
      });
      context.on('page',page=>page.on('pageerror',error=>errors.push(error.message)));
      return context;
    }
    const context=await contextFor(),page=await context.newPage();
    let fault=false,releaseReal=null,realWaiting=false;
    await page.route('**/api/dashboard?*',async route=>{
      if(new URL(route.request().url()).searchParams.get('scope')!=='real')return route.fallback();
      if(fault)return route.fulfill({status:503,json:{detail:'Falha sintética para testar recuperação.'}});
      if(releaseReal){realWaiting=true;await releaseReal.promise;}
      return route.fulfill({json:dashboard('real')});
    });
    await page.goto(origin+'/');await page.getByText('CAMPANHA SINTÉTICA DEMO',{exact:true}).first().waitFor();
    fault=true;await page.locator('#scope').selectOption('real');
    await page.waitForFunction(()=>document.getElementById('content').getAttribute('aria-busy')==='false'&&document.getElementById('message').textContent.includes('Falha sintética'));
    assert.equal(await page.locator('#content').innerText().then(t=>t.includes('CAMPANHA SINTÉTICA DEMO')),false);
    assert.equal(await page.locator('#overview-summary').isVisible(),false);
    fault=false;await page.getByRole('button',{name:'Tentar novamente',exact:true}).click();
    await page.getByText('CAMPANHA SINTÉTICA REAL',{exact:true}).first().waitFor();
    await page.locator('#scope').selectOption('demo');await page.getByText('CAMPANHA SINTÉTICA DEMO',{exact:true}).first().waitFor();
    let resolve;releaseReal={promise:new Promise(r=>resolve=r)};
    await page.locator('#scope').selectOption('real');
    for(let n=0;!realWaiting&&n<100;n++)await page.waitForTimeout(10);
    assert.ok(realWaiting,'Real response deliberately held');
    await page.locator('#scope').selectOption('demo');await page.getByText('CAMPANHA SINTÉTICA DEMO',{exact:true}).first().waitFor();
    const oldResponse=page.waitForResponse(r=>r.url().includes('/api/dashboard?')&&r.url().includes('scope=real'));
    resolve();await oldResponse;releaseReal=null;await page.waitForTimeout(100);
    assert.equal(await page.locator('#scope').inputValue(),'demo');
    assert.equal((await page.locator('#content').innerText()).includes('CAMPANHA SINTÉTICA REAL'),false);
    const captures=[];
    for(const width of [1440,768,390])for(const theme of ['light','dark']){
      await page.setViewportSize({width,height:900});
      await page.goto(origin+'/painel/strategy');await page.locator('.strategy-item').first().waitFor();
      if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('#theme-toggle').click();
      const text=await page.locator('#content').innerText();
      assert.ok(text.includes('CONFLITO SINTÉTICO'));
      assert.ok(text.includes('Não informado'));
      assert.ok(text.includes('Dados insuficientes'));
      assert.ok(/0\s*\/\s*100/.test(text),'Zero score is not treated as unavailable');
      assert.equal(await page.locator('#content img').count(),0,'Untrusted title stays text');
      assert.equal(await page.evaluate(()=>window.__fixtureXss),undefined);
      const collapsed=`${output}/strategy-collapsed-${theme}-${width}.png`;await page.screenshot({path:collapsed,fullPage:true});captures.push(collapsed);
      for(const detail of await page.locator('#content details').all())await detail.evaluate(e=>e.open=true);
      assert.ok((await page.locator('#content').innerText()).includes('evidence-synthetic-1'),'Evidence identifier exposed as identifier');
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Strategy reflow '+width+' '+theme);
      const file=`${output}/strategy-${theme}-${width}.png`;await page.screenshot({path:file,fullPage:true});captures.push(file);
    }
    for(const width of [1440,768,390])for(const theme of ['light','dark']){
      await page.setViewportSize({width,height:900});await page.goto(origin+'/painel/news');
      await page.locator('#scope').selectOption('real');await page.getByText('NOTÍCIAS SINTÉTICAS PARA TESTE',{exact:true}).waitFor();
      if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('#theme-toggle').click();
      for(const detail of await page.locator('#content details').all())await detail.evaluate(e=>e.open=true);
      const content=await page.locator('#content').innerText();
      assert.ok(content.includes('Cobertura incompleta'));assert.ok(content.includes('Indisponível'));
      assert.ok(content.includes('A coleta atingiu o limite de notícias'));
      assert.equal(await page.locator('#content script').count(),0);assert.equal(await page.evaluate(()=>window.__fixtureXss),undefined);
      const newsOverflow=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,elements:[...document.querySelectorAll('#content *')].filter(e=>e.getBoundingClientRect().right>innerWidth).slice(0,12).map(e=>({tag:e.tagName,class:e.className,width:e.getBoundingClientRect().width}))}));
      assert.equal(newsOverflow.overflow,false,'News reflow '+width+' '+theme+' '+JSON.stringify(newsOverflow.elements));
      const file=`${output}/news-${theme}-${width}.png`;await page.screenshot({path:file,fullPage:true});captures.push(file);
    }
    const viewer=await contextFor(true),readOnly=await viewer.newPage();
    for(const name of ['settings','agents','reports','contracts','finance']){
      await readOnly.goto(origin+'/painel/'+name);await readOnly.waitForFunction(()=>document.getElementById('content').getAttribute('aria-busy')==='false');
      assert.equal(await readOnly.locator('body').getAttribute('data-user'),'viewer');
      assert.equal(await readOnly.locator('#content form, #analyze, #scan-news, #report-self-test, [data-decision], [data-configure], [data-disconnect], [data-import]').count(),0,'Viewer has no administrative action on '+name);
    }
    assert.deepEqual(errors,[]);assert.equal(blockedMutations,0);
    const result={scopeFailureClearsOldData:true,summaryHiddenOnFailure:true,retryButtonRecovery:true,outOfOrderIgnored:true,strategySynthetic:true,newsSynthetic:true,zeroDistinctFromNull:true,untrustedTitleEscaped:true,viewerFrontendOnly:true,viewerApiAuthorizationTested:false,viewports:[1440,768,390],themes:2,captures,jsErrors:0,realMutations:0,paidCalls:0};
    fs.writeFileSync(`${output}/results.json`,JSON.stringify(result,null,2));console.log(JSON.stringify(result));
  }finally{await browser.close();}
})().catch(error=>{console.error(error.message);process.exitCode=1;});
