// Exercise the new composition at its breakpoint, with synthetic GET-only data.
const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('playwright');
(async()=>{
 const env=Object.fromEntries(fs.readFileSync('.env','utf8').split(/\r?\n/).filter(l=>l.includes('=')).map(l=>[l.slice(0,l.indexOf('=')),l.slice(l.indexOf('=')+1)]));
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const output='output/design-review/editorial-v7/layout';fs.mkdirSync(output,{recursive:true});
 const results=[],errors=[];let empty=false,blocked=0;
 try{
  const context=await browser.newContext({httpCredentials:{username:'admin',password:env.ADMIN_PASSWORD},reducedMotion:'reduce'});
  await context.addInitScript(()=>{localStorage.setItem('lg-scope','demo');localStorage.setItem('lg-theme','light');});
  await context.route('**/*',async route=>{
   const request=route.request(),url=new URL(request.url());
   if(url.origin!=='http://127.0.0.1:8000'||request.method()!=='GET'){blocked++;return route.abort();}
   if(empty&&url.pathname==='/api/dashboard'){
    const response=await route.fetch(),data=await response.json();data.summary.rows=0;data.campaigns={};
    return route.fulfill({json:data});
   }
   return route.continue();
  });
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  for(const width of [900,901,1180,1181,1279,1280,1281,1366,1920,767,768,769,800,801,600,601,390,320])for(const theme of ['light','dark']){
   await page.setViewportSize({width,height:900});
   await page.goto('http://127.0.0.1:8000/painel/overview');await page.waitForLoadState('networkidle');
   if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('#theme-toggle').click();
   const header=await page.locator('.page-header').boundingBox(),content=await page.locator('#content').boundingBox();
   assert.ok(content.y>=header.y+header.height,'Analysis follows the compact opening');
   if(width>=901)assert.ok(header.height<330,'Desktop opening is compact, including the tablet boundary');
   const ledger=await page.locator('.result-ledger').boundingBox(),lead=await page.locator('.overview-lead').boundingBox();
   assert.ok(Math.abs(ledger.width-lead.width)<2,'Empty review gives the chart the full analytical width');
   if(width>=901){
    const title=await page.locator('.page-heading h1').evaluate(e=>({height:e.getBoundingClientRect().height,line:parseFloat(getComputedStyle(e).lineHeight),scroll:e.scrollWidth,width:e.clientWidth}));
    assert.ok(title.height<title.line*1.5&&title.scroll<=title.width+1,'Desktop Resumo title stays on one line without clipping');
   }
   if(width>=1280){
    const campaigns=await page.locator('.campaign-workspace').boundingBox(),budget=await page.locator('.budget-workspace').boundingBox();
    assert.ok(campaigns.x>=ledger.x+ledger.width,'Campaigns share the spread with the chart');
    assert.ok(Math.abs(campaigns.y-ledger.y)<2,'Campaigns and chart begin together');
    assert.ok(Math.abs(budget.x-campaigns.x)<2&&budget.y>=campaigns.y+campaigns.height,'Budget follows campaigns in their reading column');
    assert.ok(campaigns.y<600,'Campaigns appear in the first desktop viewport');
    const board=await page.locator('.overview-board').boundingBox();
    assert.ok(Math.abs(campaigns.x+campaigns.width-board.x-board.width)<1,'The spread fills its width at the first desktop breakpoint');
   }
   assert.equal(await page.locator('.review-action button').evaluate(e=>getComputedStyle(e).backgroundColor),'rgba(0, 0, 0, 0)','Empty analysis action stays secondary');
   const balance=await page.locator('.budget-workspace .balance').evaluate(e=>{const range=document.createRange();range.selectNodeContents(e);return [...range.getClientRects()].map(r=>r.y);});
   assert.equal(new Set(balance).size,1,'Budget amount stays whole on one line');
   if(width>=901){
    const values=await page.locator('#overview-summary .metric strong').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().y));
    assert.ok(Math.max(...values)-Math.min(...values)<1,'Desktop metric values share their starting line');
    const borders=await page.locator('#overview-summary .metric').evaluateAll(es=>es.slice(1).map(e=>e.getBoundingClientRect().bottom));
    assert.ok(Math.max(...borders)-Math.min(...borders)<1,'Metric separators finish on the same baseline');
   }
   if(width>=601&&width<=900){
    const values=await page.locator('#overview-summary .metric strong').evaluateAll(es=>es.slice(1).map(e=>e.getBoundingClientRect().y));
    assert.ok(Math.max(...values)-Math.min(...values)<1,`Tablet outcome values align despite wrapped labels: ${width} ${theme} ${values}`);
   }
   if(width<=600){
    const budget=await page.locator('.budget-workspace .budget-line').boundingBox(),meter=await page.locator('.budget-workspace .budget-meter').boundingBox();
    assert.ok(Math.abs(budget.width-meter.width)<1,'Mobile budget meter follows the full content width');
    assert.ok(budget.height<210,'Mobile budget summary stays compact with all values visible');
   }
   const connection=await page.locator('.overview-connect').boundingBox();
   assert.equal(await page.locator('.campaign-mobile').isVisible(),width<768,'Campaign records change presentation only when the table has enough width');
   assert.ok(connection.height<130,'Connection support must not stretch into a blank vertical column');
   if(width<=900)assert.ok((await page.locator('.review-desk').boundingBox()).height<270,'Empty recommendation stays compact');
   if(width===1366)await page.screenshot({path:`output/design-review/editorial-v7/${theme}-preview.png`,fullPage:false});
   await page.screenshot({path:`output/design-review/after/overview-${theme}-${width}.png`,fullPage:true});
   if(width<=1180){
    await page.locator('#menu-toggle').click();
    assert.equal(await page.locator('#main-nav a:visible').count(),9,'All destinations remain reachable through compact navigation');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'false');
   }
   await page.locator('.period-picker summary').click();
   assert.equal(await page.locator('#area').isVisible(),false,'Area filter is intentionally reserved for campaigns');
   for(const selector of ['#start','#end','#refresh']){
    const box=await page.locator(selector).boundingBox();assert.ok(box&&box.x>=0&&box.x+box.width<=width,`Filter ${selector} stays within ${width}px: ${JSON.stringify(box)}`);
   }
   await page.locator('#start').fill('2026-10-01');await page.locator('#end').fill('2026-10-18');
   await page.locator('#refresh').click();await page.waitForLoadState('networkidle');
   assert.equal(await page.locator('#start').inputValue(),'2026-10-01');
   assert.equal(await page.locator('#end').inputValue(),'2026-10-18');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   results.push({width,theme,filtersFit:true,periodRetained:true,analysisTop:Math.round(content.y)});
  }
  empty=true;
  for(const theme of ['light','dark']){
   await page.setViewportSize({width:1366,height:900});await page.reload();await page.waitForLoadState('networkidle');
   if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('#theme-toggle').click();
   assert.ok(await page.locator('.empty-state').isVisible());assert.equal(await page.locator('#overview-summary').isVisible(),false);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   await page.screenshot({path:`${output}/empty-${theme}.png`,fullPage:true});
  }
  assert.equal(blocked,0);assert.deepEqual(errors,[]);
  fs.writeFileSync(`${output}/results.json`,JSON.stringify({results,emptyState:true,blocked,errors},null,2));
  console.log(JSON.stringify({breakpointAndFilterStates:results.length,emptyState:true,blocked,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});

