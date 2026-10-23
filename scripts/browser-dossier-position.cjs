// Local visual regression evidence. Every API is intercepted with synthetic data.
'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const stage=process.env.DOSSIER_STAGE||'before',origin=process.env.TEST_ORIGIN||'http://127.0.0.1:8000';
assert.ok(['before','after'].includes(stage));assert.ok(['localhost','127.0.0.1','[::1]'].includes(new URL(origin).hostname));
const output=`output/dossier-position-v59/${stage}`,period={start:'2026-09-01',end:'2026-09-30'};
const metric={rows:30,days:30,cost:240,impressions:2400,clicks:120,qualified:12,hires:2,contacts:15,appointments:4,conversions:8,ctr:5,cpc:2,cpq:20,cph:120};
const budget={month:'2026-09',planned:2000,spent:240,balance:1760,consumed_percent:12,alerts:[],imported_ads:200,manual_expenses:40,software_expenses:80,legacy_software_allocation:true,allocations:{trabalhista:1200,previdenciario:600,infraestrutura:100,reserva:100}};
const fixture={...period,summary:metric,campaigns:{'Campanha sintética A':metric,'Campanha sintética B':{...metric,cost:120,hires:1},'Campanha sintética C':{...metric,cost:80,hires:1}},localities:{'Cidade sintética-SP':metric},keywords:{'orientação jurídica sintética':metric},evolution:[{date:'2026-09-01',cost:100,clicks:50},{date:'2026-09-15',cost:60,clicks:30},{date:'2026-09-30',cost:80,clicks:40}],budget,ai:{connected:false,insights_ready:false},ai_priorities:[],recommendations:[{id:9901,status:'pending',category:'orcamento',title:'Conferir distribuição do investimento',rationale:'Recomendação sintética para comparação visual; nenhuma decisão real.',evidence:{areas:{trabalhista:metric,previdenciario:{...metric,cpq:30,cph:180}}}}]};
const sources=['app/templates/dashboard.html','app/templates/_workspace_scene.html','app/templates/_dossier_art.html','app/static/arc.css','app/static/style.css','app/static/tokens.css','app/static/scene.js','app/static/app.js','app/static/period-context.js'];
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const hashes=()=>Object.fromEntries(sources.map(file=>[file,hash(fs.readFileSync(file))]));
const checks=[],failures=[],errors=[],consoleErrors=[],unexpected=[],measurements=[],screens=[];
async function check(name,fn){try{await fn();checks.push(name);}catch(e){failures.push({name,message:e.message});}}
let browser,password;
async function context(width,theme,scope='demo',js=true,motion='reduce'){
 const ctx=await browser.newContext({viewport:{width,height:900},httpCredentials:{username:'admin',password},javaScriptEnabled:js,reducedMotion:motion,serviceWorkers:'block'});
 await ctx.addInitScript(({theme,scope})=>{localStorage.setItem('lg-theme',theme);localStorage.setItem('lg-scope',scope);},{theme,scope});
 await ctx.route('**/*',route=>{
  const req=route.request(),url=new URL(req.url());
  if(url.origin!==origin||req.method()!=='GET'){unexpected.push({path:url.pathname,method:req.method()});return route.abort();}
  if(url.pathname==='/api/dashboard')return route.fulfill({json:fixture});
  if(url.pathname.startsWith('/api/')){unexpected.push({path:url.pathname,method:req.method()});return route.abort();}
  if(url.pathname==='/favicon.ico')return route.fulfill({status:204,body:''});
  if(url.pathname.startsWith('/static/')||/^\/painel\/[a-z]+$/.test(url.pathname))return route.continue();
  unexpected.push({path:url.pathname,method:req.method()});return route.abort();
 });
 const page=await ctx.newPage();page.setDefaultTimeout(7000);
 page.on('pageerror',e=>errors.push({width,theme,scope,error:e.message}));
 page.on('console',m=>{if(m.type()==='error')consoleErrors.push({width,theme,scope,error:m.text()});});
 await page.goto(`${origin}/painel/overview?scope=${scope}&start=${period.start}&end=${period.end}`);
 if(js)await page.waitForFunction(()=>document.querySelector('#content')?.getAttribute('aria-busy')==='false');
 await page.waitForLoadState('networkidle');await page.evaluate(()=>document.fonts.ready);
 return {ctx,page};
}
async function links(page,scope){
 const links=await page.locator('.dossier').evaluateAll(items=>items.map(e=>({href:e.href,title:e.dataset.title})));
 assert.equal(links.length,5);
 for(const link of links){const url=new URL(link.href);assert.equal(url.searchParams.get('scope'),scope);const needsPeriod=['/painel/campaigns','/painel/insights'].includes(url.pathname);assert.equal(url.searchParams.get('start'),needsPeriod?period.start:null);assert.equal(url.searchParams.get('end'),needsPeriod?period.end:null);}
 assert.deepEqual(links.map(l=>new URL(l.href).pathname),['/painel/finance','/painel/reports','/painel/campaigns','/painel/insights','/painel/strategy']);
}
async function interaction(page,scope,width,theme){
 const covers=page.locator('.dossier');
 await check(`${width}/${theme}/${scope}: keyboard, focus, caption and buttons`,async()=>{
  await covers.nth(2).focus();await page.keyboard.press('ArrowRight');assert.equal(await covers.nth(3).getAttribute('data-active'),'true');
  await page.keyboard.press('ArrowLeft');assert.equal(await covers.nth(2).getAttribute('data-active'),'true');
  await page.keyboard.press('Home');assert.equal(await covers.first().getAttribute('data-active'),'true');
  await page.keyboard.press('End');assert.equal(await covers.last().getAttribute('data-active'),'true');
  assert.ok(await covers.last().evaluate(e=>e===document.activeElement&&e.matches(':focus-visible')));
  const focus=await covers.last().evaluate(e=>({style:getComputedStyle(e).outlineStyle,width:parseFloat(getComputedStyle(e).outlineWidth)}));assert.notEqual(focus.style,'none');assert.ok(focus.width>=2);
  await page.locator('[data-scene-next]').click();assert.equal(await covers.first().getAttribute('data-active'),'true');
  await page.locator('[data-scene-prev]').click();assert.equal(await covers.last().getAttribute('data-active'),'true');
  assert.equal(new URL(await page.locator('[data-scene-open]').getAttribute('href'),origin).href,new URL(await covers.last().getAttribute('href'),origin).href);
  await covers.nth(2).focus();
 });
 await check(`${width}/${theme}/${scope}: indicator anchor retains native destination`,async()=>{
  const target=new URL(await page.locator('.scene-results').getAttribute('href'),origin);assert.equal(target.hash,'#results');assert.equal(target.pathname,'/painel/overview');assert.equal(target.searchParams.get('scope'),scope);
  assert.match(await page.locator('.scene-results').innerText(),/Ver indicadores/);
  await page.locator('.scene-results').click();assert.equal(new URL(page.url()).hash,'#results');
  assert.ok(await page.locator('#results').evaluate(e=>e===document.activeElement)); await page.waitForFunction(()=>Math.abs(document.getElementById('results').getBoundingClientRect().top-20)<2);
 });
 await check(`${width}/${theme}/${scope}: reduced motion`,async()=>{
  assert.ok(await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches));
  const active=covers.nth(2),box=await active.boundingBox();await page.mouse.move(box.x+box.width*.7,box.y+box.height*.4);
  assert.equal(await active.evaluate(e=>e.style.getPropertyValue('--tilt-x')),'');
  assert.ok(await active.evaluate(e=>getComputedStyle(e).transitionDuration.split(',').every(v=>parseFloat(v)<=.01)));
 });
}
(async()=>{
 fs.mkdirSync(output,{recursive:true});
 const env=Object.fromEntries(fs.readFileSync('.env','utf8').split(/\r?\n/).filter(l=>l.includes('=')).map(l=>[l.slice(0,l.indexOf('=')),l.slice(l.indexOf('=')+1)]));password=env.ADMIN_PASSWORD;
 const before=hashes();browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'msedge',headless:true});
 try{
 for(const scope of ['demo','real'])for(const width of [1440,768,390,320])for(const theme of ['light','dark']){
  const {ctx,page}=await context(width,theme,scope),id=`${scope}-${width}-${theme}`;
  const geometry=await page.evaluate(()=>{
   const rect=selector=>{const r=document.querySelector(selector).getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,height:r.height,width:r.width};};
   return {scene:rect('.workspace-scene'),header:rect('.page-header'),metrics:rect('#overview-summary'),content:rect('#content'),active:rect('.dossier[data-active=true]'),controls:[...document.querySelectorAll('.scene-control,[data-scene-open]')].map(e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};}),overflow:document.documentElement.scrollWidth>innerWidth+1,sceneFollowsHeader:!!document.querySelector('.page-header ~ .workspace-scene'),scenePrecedesContent:!!(document.querySelector('.workspace-scene').compareDocumentPosition(document.querySelector('#content'))&Node.DOCUMENT_POSITION_FOLLOWING)};
  });measurements.push({scope,width,theme,...geometry});
  await check(`${id}: no horizontal overflow`,async()=>assert.equal(geometry.overflow,false));
  await check(`${id}: destinations retain applied scope/period`,()=>links(page,scope));
  if(stage==='after'){
   await check(`${id}: DOM and visual hierarchy`,async()=>{assert.ok(geometry.sceneFollowsHeader&&geometry.scenePrecedesContent);assert.ok(geometry.metrics.bottom<=geometry.scene.top+1);assert.ok(geometry.scene.bottom<=geometry.content.top+1);assert.ok(geometry.scene.top-geometry.header.bottom<=40,'Collection immediately after header');if(width===1440){assert.ok(geometry.scene.top<900);assert.ok(geometry.active.top<900,'Active cover starts in opening');}});
   await check(`${id}: controls visible and 44px targets`,async()=>{for(const r of geometry.controls){assert.ok(r.left>=geometry.scene.left-1&&r.right<=geometry.scene.right+1);assert.ok(r.top>=geometry.scene.top&&r.bottom<=geometry.scene.bottom+1);assert.ok(r.height>=44&&r.width>=44);}});
  }
  await page.evaluate(()=>{document.activeElement?.blur();scrollTo(0,0);});
  await page.screenshot({path:`${output}/opening-${id}.png`});await page.screenshot({path:`${output}/full-${id}.png`,fullPage:true});await page.locator('.workspace-scene').screenshot({path:`${output}/scene-${id}.png`});screens.push(id);
  if(stage==='after'){
   await interaction(page,scope,width,theme);
   if(width===1440&&theme==='light')await check(`${scope}: Enter follows native campaign destination`,async()=>{
    await page.locator('.dossier[data-title="Campanhas"]').focus();await page.keyboard.press('Enter');await page.waitForURL(url=>url.pathname==='/painel/campaigns');
    const url=new URL(page.url());assert.equal(url.searchParams.get('scope'),scope);assert.equal(url.searchParams.get('start'),period.start);assert.equal(url.searchParams.get('end'),period.end);
    await page.waitForFunction(()=>document.querySelector('#content')?.getAttribute('aria-busy')==='false');assert.equal(await page.locator('.workspace-scene').count(),0);
   });
  }
  await ctx.close();
 }
 if(stage==='after')for(const width of [1440,320]){
  const {ctx,page}=await context(width,'light','demo',false);
  await check(`${width}: native fallback without JavaScript`,async()=>{assert.equal(await page.locator('.dossier[href^="/painel/"]').count(),5);assert.equal(await page.locator('.scene-ready').count(),0);assert.equal(await page.locator('.scene-control:visible').count(),0);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);for(const cover of await page.locator('.dossier').all())assert.ok(await cover.isVisible());});
  await page.locator('.workspace-scene').screenshot({path:`${output}/no-js-${width}.png`});
  await check(`${width}: no-JS native report navigation`,async()=>{await page.locator('.dossier-reports').click();await page.waitForURL(url=>url.pathname==='/painel/reports');});await ctx.close();
 }
 if(stage==='after'){
  const {ctx,page}=await context(1440,'light','demo',true,'no-preference');
  await check('Normal motion: 3D, pointer selection and keyboard instant transition',async()=>{
   const active=page.locator('.dossier[data-active=true]');
   assert.notEqual(await active.evaluate(e=>getComputedStyle(e).transform),'none');
   assert.equal(await active.evaluate(e=>getComputedStyle(e).transitionDuration),'0.28s');
   await page.locator('[data-scene-next]').click();
   await active.evaluate(async e=>{await Promise.all(e.getAnimations().map(a=>a.finished));});
   assert.equal(await active.getAttribute('data-title'),'Insights de IA');
   await active.focus();await page.keyboard.press('Home');
   assert.equal(await active.getAttribute('data-title'),'Orçamento');assert.equal(await active.evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
  });await ctx.close();
 }
 }finally{
  const after=hashes(),result={stage,channel:process.env.BROWSER_CHANNEL||'msedge',browserVersion:browser.version(),period,fixtureHash:hash(JSON.stringify(fixture)),sourceHashes:before,sourceHashesAfter:after,sourceUnchanged:JSON.stringify(before)===JSON.stringify(after),checks,failures,pageErrors:errors,consoleErrors,unexpected,measurements,screens,limitations:['Synthetic API fixtures; no providers or real client records.','Native no-JS links keep existing server-side fallback; applied URL context is enhanced by app.js.','All page errors, including ViewTransition failures, remain recorded; no suppression.']};
  fs.writeFileSync(`${output}/results.json`,JSON.stringify(result,null,2));fs.writeFileSync(`${output}/fixture.json`,JSON.stringify(fixture,null,2));await browser.close();
  console.log(JSON.stringify({stage,checks:checks.length,failures:failures.length,pageErrors:errors.length,consoleErrors:consoleErrors.length,unexpected:unexpected.length,screens:screens.length,sourceUnchanged:result.sourceUnchanged,output}));
  if(failures.length||errors.length||consoleErrors.length||unexpected.length||!result.sourceUnchanged)process.exitCode=1;
 }
})().catch(e=>{console.error(e.message);process.exitCode=1;});
