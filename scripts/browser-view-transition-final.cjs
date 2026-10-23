// Bounded Chrome experiment. No app import, .env, database or provider access.
// Eight fixed cases; no retries until green and no production modifications.
'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const crypto=require('node:crypto'),assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const output=path.join(root,'output/closure-v60/view-transition');
const sources=['app/templates/dashboard.html','app/templates/_workspace_scene.html','app/templates/_chapter_art.html','app/templates/_dossier_art.html','app/static/app.js','app/static/scene.js','app/static/period-context.js','app/static/arc.css','app/static/style.css','app/static/tokens.css','scripts/browser-view-transition-final.cjs'];
const hashes=()=>Object.fromEntries(sources.map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex')]));
const before=hashes();
const rendered=spawnSync(path.join(root,'.venv/Scripts/python.exe'),['-c',[
  'import json',
  'from jinja2 import Environment, FileSystemLoader, select_autoescape',
  "env=Environment(loader=FileSystemLoader('app/templates'), autoescape=select_autoescape(['html']))",
  "print(json.dumps({p:env.get_template('dashboard.html').render(page=p,user='admin') for p in ['overview','insights']}))"
].join('\n')],{cwd:root,encoding:'utf8',env:{...process.env,PYTHONIOENCODING:'utf-8'}});
if(rendered.status!==0)throw new Error('Isolated Jinja rendering failed: '+rendered.stderr);
const html=JSON.parse(rendered.stdout);
const metric={rows:1,days:1,cost:100,impressions:1000,clicks:50,qualified:5,hires:1,contacts:8,appointments:2,conversions:3,ctr:5,cpc:2,cpq:20,cph:100};
const dashboard={summary:metric,campaigns:{'Campanha sintética':metric},localities:{},keywords:{},evolution:[],budget:{month:'2026-09',planned:2000,spent:100,balance:1900,consumed_percent:5,alerts:[]},recommendations:[],ai:{connected:false,insights_ready:false},ai_priorities:[]};
const serverRequests=[],violations=[];
let caseId='setup';
const mime={'.css':'text/css','.js':'text/javascript','.ttf':'font/ttf','.woff2':'font/woff2','.svg':'image/svg+xml','.png':'image/png'};
const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://127.0.0.1');
  serverRequests.push({caseId,method:req.method,path:url.pathname,query:url.search});
  res.setHeader('Content-Security-Policy',"default-src 'self'; connect-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'self'");
  if(req.method!=='GET'){violations.push({caseId,method:req.method,path:url.pathname});res.writeHead(405);return res.end();}
  if(url.pathname==='/favicon.ico'){res.writeHead(204);return res.end();}
  if(url.pathname.startsWith('/api/')){
    let value;
    if(url.pathname==='/api/dashboard')value={...dashboard,start:url.searchParams.get('start'),end:url.searchParams.get('end')};
    else if(url.pathname==='/api/insights')value={latest:null};
    else {violations.push({caseId,path:url.pathname,reason:'Unknown fixture API'});res.writeHead(404);return res.end();}
    res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});return res.end(JSON.stringify(value));
  }
  if(url.pathname.startsWith('/painel/')){
    const name=url.pathname.slice('/painel/'.length);
    if(!html[name]){res.writeHead(404);return res.end();}
    res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});return res.end(html[name]);
  }
  if(url.pathname.startsWith('/static/')){
    const staticRoot=path.join(root,'app/static');
    const file=path.resolve(staticRoot,'.'+decodeURIComponent(url.pathname.slice('/static'.length)));
    if(!file.startsWith(staticRoot+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end();}
    res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'public, max-age=3600'});
    return res.end(fs.readFileSync(file));
  }
  violations.push({caseId,path:url.pathname,reason:'Unknown fixture URL'});res.writeHead(404);res.end();
});

// Installed only in the instrumented arm. Baseline gets no lifecycle listeners.
function instrumentation(){
  const docId=crypto.randomUUID();
  const reason=error=>({name:error?.name||typeof error,message:error?.message||String(error)});
  const css=()=>[...document.styleSheets].map(sheet=>{
    let rules=[];let error=null;
    try{rules=[...sheet.cssRules].filter(rule=>rule.cssText.startsWith('@view-transition')).map(rule=>rule.cssText);}catch(e){error=reason(e);}
    return {path:sheet.href?new URL(sheet.href).pathname:null,disabled:sheet.disabled,optInRules:rules,error};
  });
  const record=details=>{
    const key='qa-vt-events',events=JSON.parse(sessionStorage.getItem(key)||'[]');
    events.push({docId,path:location.pathname,ms:performance.now(),visibility:document.visibilityState,readyState:document.readyState,...details});
    sessionStorage.setItem(key,JSON.stringify(events));
  };
  for(const name of ['DOMContentLoaded','load'])window.addEventListener(name,()=>record({event:name,css:css()}));
  for(const name of ['pageswap','pagereveal'])window.addEventListener(name,event=>{
    const transition=event.viewTransition;
    record({event:name,hasTransition:Boolean(transition),css:css()});
    if(!transition)return;
    transition.ready.then(()=>record({event:name,promise:'ready',status:'resolved',animationName:getComputedStyle(document.documentElement,'::view-transition-new(root)').animationName,duration:getComputedStyle(document.documentElement,'::view-transition-new(root)').animationDuration}),error=>record({event:name,promise:'ready',status:'rejected',reason:reason(error)}));
    transition.finished.then(()=>record({event:name,promise:'finished',status:'resolved'}),error=>record({event:name,promise:'finished',status:'rejected',reason:reason(error)}));
  });
}

(async()=>{
  fs.mkdirSync(output,{recursive:true});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin=`http://127.0.0.1:${server.address().port}`;
  const browser=await chromium.launch({channel:'chrome',headless:true});
  const cases=[];const browserVersion=browser.version();
  try{
    for(const instrumented of [false,true])for(const cacheEnabled of [true,false])for(const reducedMotion of ['no-preference','reduce']){
      caseId=`${instrumented?'instrumented':'baseline'}-${cacheEnabled?'cache':'no-cache'}-${reducedMotion}`;
      const result={id:caseId,instrumented,cacheEnabled,reducedMotion,errors:[],failures:[],network:[],events:[]};cases.push(result);
      const context=await browser.newContext({viewport:{width:1366,height:900},reducedMotion,serviceWorkers:'block'});
      try{
        await context.addInitScript(()=>{localStorage.setItem('lg-scope','demo');localStorage.setItem('lg-theme','light');});
        if(instrumented)await context.addInitScript(instrumentation);
        const page=await context.newPage();page.setDefaultTimeout(5000);
        page.on('pageerror',error=>result.errors.push({name:error.name,message:error.message,path:new URL(page.url()).pathname}));
        page.on('request',request=>{if(new URL(request.url()).origin!==origin)violations.push({caseId,reason:'External browser request',url:request.url()});});
        const cdp=await context.newCDPSession(page);await cdp.send('Network.enable');
        await cdp.send('Network.setCacheDisabled',{cacheDisabled:!cacheEnabled});
        const requestMap=new Map();
        cdp.on('Network.requestWillBeSent',event=>requestMap.set(event.requestId,event.request.url));
        cdp.on('Network.requestServedFromCache',event=>result.network.push({event:'servedFromCache',path:new URL(requestMap.get(event.requestId)||origin).pathname}));
        cdp.on('Network.responseReceived',event=>{const url=new URL(event.response.url);result.network.push({event:'response',path:url.pathname,status:event.response.status,fromDiskCache:Boolean(event.response.fromDiskCache),fromServiceWorker:Boolean(event.response.fromServiceWorker)});});
        const query='?scope=demo&start=2026-09-01&end=2026-09-30';
        await page.goto(origin+'/painel/overview'+query);
        await page.waitForFunction(()=>document.getElementById('content').getAttribute('aria-busy')==='false');
        await page.evaluate(()=>document.fonts.ready);
        const insights=page.locator('.dossier[href^="/painel/insights"]');
        await insights.focus();
        const destination=new URL(await insights.getAttribute('href'),origin);
        assert.equal(destination.pathname,'/painel/insights');
        for(const [key,value] of [['scope','demo'],['start','2026-09-01'],['end','2026-09-30']])assert.equal(destination.searchParams.get(key),value);
        await page.screenshot({path:path.join(output,caseId+'-before-enter.png')});
        await Promise.all([page.waitForURL(destination.href),page.keyboard.press('Enter')]);
        await page.waitForFunction(()=>document.getElementById('content').getAttribute('aria-busy')==='false');
        // Fixed bounded observation window, identical in both arms; not retrying an abort.
        await page.waitForTimeout(700);
        assert.equal(await page.locator('body').getAttribute('data-page'),'insights');
        assert.equal(await page.locator('#scope').inputValue(),'demo');
        assert.equal(await page.locator('#start').inputValue(),'2026-09-01');
        assert.equal(await page.locator('#end').inputValue(),'2026-09-30');
        result.destination=new URL(page.url()).pathname+new URL(page.url()).search;
        result.periodLabel=await page.locator('#period-label').innerText();
        result.resources=await page.evaluate(()=>performance.getEntriesByType('resource').filter(entry=>entry.name.includes('/static/')).map(entry=>({path:new URL(entry.name).pathname,transferSize:entry.transferSize,encodedBodySize:entry.encodedBodySize,duration:entry.duration})));
        if(instrumented)result.events=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('qa-vt-events')||'[]'));
        await page.screenshot({path:path.join(output,caseId+'-destination.png')});
      }catch(error){result.failures.push({name:error.name,message:error.message});}
      finally{await context.close();}
    }
  }finally{
    await browser.close();await new Promise(resolve=>server.close(resolve));
    const after=hashes();
    const result={browserVersion,channel:'chrome',headless:true,viewport:{width:1366,height:900},theme:'light',fixture:'Jinja-rendered production templates plus unchanged local static assets; standalone Node synthetic API',playwrightRouting:false,cases,serverRequests,violations,changedDuringRun:sources.filter(file=>before[file]!==after[file]),realMutations:0,providerRequests:0,limits:['Eight predetermined cases, one execution each; no statistical reliability claim.','Baseline has no document lifecycle handlers; lifecycle absence there is unobserved, not proof of no transition.','Instrumented handlers read CSSOM and write sessionStorage, which may affect timing and rejection reporting.','Headless Chrome and synthetic API; does not reproduce authenticated server headers, server latency, manual browsing or every viewport.','Lifecycle promises in destroyed outgoing documents may not run before destruction.']};
    fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(result,null,2));
    fs.writeFileSync(path.join(output,'manifest.json'),JSON.stringify({generatedAt:new Date().toISOString(),before,after},null,2));
    const errors=cases.reduce((n,c)=>n+c.errors.length,0),failures=cases.reduce((n,c)=>n+c.failures.length,0);
    console.log(JSON.stringify({browserVersion,cases:cases.length,errors,failures,violations:violations.length,changedDuringRun:result.changedDuringRun,output}));
    if(errors||failures||violations.length||result.changedDuringRun.length)process.exitCode=1;
  }
})().catch(error=>{console.error(error.message);server.close();process.exitCode=1;});
