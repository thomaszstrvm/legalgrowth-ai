// Synthetic presentation edge cases; all writes and off-origin traffic blocked.
const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('playwright');
(async()=>{
 const env=Object.fromEntries(fs.readFileSync('.env','utf8').split(/\r?\n/).filter(l=>l.includes('=')).map(l=>[l.slice(0,l.indexOf('=')),l.slice(l.indexOf('=')+1)]));
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const output='output/design-review/editorial-v7/states';fs.mkdirSync(output,{recursive:true});
 try{
  const context=await browser.newContext({httpCredentials:{username:'admin',password:env.ADMIN_PASSWORD},reducedMotion:'reduce'});
  await context.addInitScript(()=>{localStorage.setItem('lg-scope','demo');localStorage.setItem('lg-theme','light');});
  let large=false,mutations=0,detailFixture='';
  await context.route('**/*',async route=>{
   const req=route.request(),url=new URL(req.url());
   if(url.origin!=='http://127.0.0.1:8000')return route.abort();
   if(req.method()!=='GET'){mutations++;return route.abort();}
   if(url.pathname==='/api/dashboard'){
    const response=await route.fetch(),data=await response.json();
    data.recommendations=[{id:9901,status:'pending',category:'orcamento',title:'Recomendação sintética',rationale:'Fixture visual',evidence:{}}];
    if(detailFixture==='metadata')data.recommendations[0].evidence.campaign='Campanha fictícia com identificação adicional';
    if(detailFixture==='multiple')data.recommendations.push({...data.recommendations[0],id:9902,title:'Segunda recomendação sintética'});
    if(large)data.summary.cost=1234567.89;
    return route.fulfill({json:data});
   }
   return route.continue();
  });
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const width of [1366,1280,768,390,320])for(const highAmount of [false,true]){
   large=highAmount;await page.setViewportSize({width,height:844});
   await page.goto('http://127.0.0.1:8000/painel/overview');await page.waitForLoadState('networkidle');
   for(const theme of ['light','dark']){
    if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('#theme-toggle').click();
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'No overflow');
    const value=page.locator('#overview-summary .metric strong').first();
    assert.ok(await value.evaluate(e=>e.scrollWidth<=e.clientWidth+1),'Large amount fits its metric');
    assert.ok(await page.getByRole('heading',{name:'Comparar o investimento entre as áreas',exact:true}).isVisible());
    assert.ok(await page.locator('.review-desk').evaluate(e=>parseFloat(getComputedStyle(e.querySelector('h2')).fontSize)<=.75*parseFloat(getComputedStyle(e.querySelector('.rec h3')).fontSize)),'Recommendation content has greater emphasis than its section label at every breakpoint');
    assert.notEqual(await page.locator('.review-desk .rec a').evaluate(e=>getComputedStyle(e).backgroundColor),'rgba(0, 0, 0, 0)','Read action is visually primary when a recommendation exists');
    assert.equal(await page.locator('.review-action button').evaluate(e=>getComputedStyle(e).backgroundColor),'rgba(0, 0, 0, 0)','Refresh is visually secondary when content exists');
    assert.equal(await page.locator('.chapter-emblem').getAttribute('aria-hidden'),'true');
    if(width>=1280){
     const campaigns=await page.locator('.campaign-workspace').boundingBox(),budget=await page.locator('.budget-workspace').boundingBox();
     assert.ok(budget.y-campaigns.y-campaigns.height<=32,'A long recommendation must not push the budget away from campaigns');
     const primary=page.locator('.rec a'),secondary=page.locator('.review-action button');
     const a=await primary.boundingBox(),b=await secondary.boundingBox();
     assert.ok(Math.abs(a.y-b.y)<2&&b.x>=a.x+a.width,'Recommendation actions share a row without overlap');
     await primary.focus();await page.keyboard.press('Tab');
     assert.equal(await secondary.evaluate(e=>e===document.activeElement),true,'Reading action precedes refresh in keyboard order');
     const skip=await page.locator('.skip').boundingBox();
     assert.ok(skip.y+skip.height<=0,'The unfocused skip link stays outside the visible viewport');
     if(width===1366&&!large)await page.screenshot({path:`${output}/focus-viewport-${theme}-1366.png`,fullPage:false});
     // Full-page screenshots can compose fixed elements against a scrolled viewport.
     // Save interaction evidence above, then restore neutral framing for the portfolio.
     await page.evaluate(()=>{document.activeElement.blur();window.scrollTo(0,0);});
    }
    await page.screenshot({path:`${output}/${large?'large-amount':'recommendation'}-${theme}-${width}.png`,fullPage:true});
   }
  }
  large=false;
  for(const variant of ['metadata','multiple'])for(const theme of ['light','dark']){
   detailFixture=variant;await page.setViewportSize({width:1280,height:844});
   await page.goto('http://127.0.0.1:8000/painel/overview');await page.waitForLoadState('networkidle');
   if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('#theme-toggle').click();
   if(variant==='metadata')assert.ok(await page.locator('.rec-meta').isVisible());
   else assert.equal(await page.locator('.rec').count(),2);
   const last=await page.locator('.rec').last().boundingBox(),refresh=await page.locator('.review-action').boundingBox();
   assert.ok(refresh.y>=last.y+last.height,'Detailed recommendations keep their natural flow');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   await page.screenshot({path:`${output}/${variant}-${theme}-1280.png`,fullPage:true});
  }
  assert.equal(mutations,0);assert.deepEqual(errors,[]);
  const result={captures:24,focusViewportCaptures:2,widths:[1366,1280,768,390,320],themes:2,largeAmountFits:true,recommendationVisible:true,actionRowAndKeyboardOrder:true,unfocusedSkipOutsideViewport:true,detailedRecommendations:true,decorativeArtHiddenFromAT:true,mutations,errors};
  fs.writeFileSync(`${output}/results.json`,JSON.stringify(result,null,2));console.log(JSON.stringify(result));
 }finally{await browser.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
