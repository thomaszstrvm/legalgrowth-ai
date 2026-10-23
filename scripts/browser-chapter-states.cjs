// Current auxiliary pages, synthetic fixtures and real CSS; no API mutations.
const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('playwright');
(async()=>{
 const env=Object.fromEntries(fs.readFileSync('.env','utf8').split(/\r?\n/).filter(l=>l.includes('=')).map(l=>[l.slice(0,l.indexOf('=')),l.slice(l.indexOf('=')+1)]));
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const output=process.env.CHAPTER_OUTPUT||'output/design-review/editorial-v7/chapters';fs.mkdirSync(output,{recursive:true});
 const results=[],errors=[];let fixture='',blocked=0;
 try{
  const context=await browser.newContext({httpCredentials:{username:'admin',password:env.ADMIN_PASSWORD},reducedMotion:'reduce'});
  await context.addInitScript(()=>{localStorage.setItem('lg-scope','demo');localStorage.setItem('lg-theme','light');});
  await context.route('**/*',async route=>{
   const request=route.request(),url=new URL(request.url());
   if(url.origin!=='http://127.0.0.1:8000'||request.method()!=='GET'){blocked++;return route.abort();}
   if(url.pathname==='/api/reports')return route.fulfill({json:fixture==='empty'?[]:[{id:9901,week_start:'2026-10-05'},{id:9902,week_start:'2026-10-12'},{id:9903,week_start:'2026-10-19'}]});
   return route.continue();
  });
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  for(const width of [1366,901,768,390,320])for(const theme of ['light','dark'])for(const name of ['reports','settings','insights','finance']){
   fixture='populated';await page.setViewportSize({width,height:900});
   await page.goto(`http://127.0.0.1:8000/painel/${name}`);await page.waitForLoadState('networkidle');
   if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('#theme-toggle').click();
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${name} ${width}: overflow`);
   assert.equal(await page.locator('.chapter-art-full').isVisible(),width>900,'Optical artwork changes with available size');
   assert.equal(await page.locator('.chapter-emblem').getAttribute('aria-hidden'),'true');
   if(name==='reports'){
    assert.equal(await page.locator('.report-downloads a').count(),6);
    for(const a of await page.locator('.report-downloads a').all()){
     const box=await a.boundingBox();assert.ok(box.x>=0&&box.x+box.width<=width&&box.height>=44,'Complete export target');
     assert.match(await a.getAttribute('href'),/^\/api\/reports\/990[123]\/(pdf|json)\?scope=demo$/);
    }
    if(width>900){const a=await page.locator('.report-create h2').boundingBox(),b=await page.locator('.task-board>.panel h2').boundingBox();assert.ok(Math.abs(a.y-b.y)<2,'Creation and archive headings align');}
   }
   if(name==='finance'&&width<=600){const b=await page.locator('.task-board>.budget-line').boundingBox();assert.ok(b.height<245,'Mobile finance summary remains compact');}
   if(name==='settings'&&width<=380){
    const key=await page.locator('#api-key').boundingBox(),show=await page.locator('#show-key').boundingBox();
    assert.ok(show.y>=key.y+key.height,'Show-key action does not consume the narrow input width');
    assert.ok(await page.locator('#api-key').evaluate(e=>{const s=getComputedStyle(e),ctx=document.createElement('canvas').getContext('2d');ctx.font=`${s.fontWeight} ${s.fontSize} ${s.fontFamily}`;return ctx.measureText(e.placeholder).width<=e.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight);}),'Placeholder fits without reducing font size');
   }
   const selector={reports:'.report-create',settings:'.connection-editor',insights:'.insight-start',finance:'.task-board>.budget-line'}[name];
   const contrast=await page.locator(selector).evaluate(e=>{
    const ctx=document.createElement('canvas').getContext('2d');
    const luminance=color=>{ctx.fillStyle=color;ctx.fillRect(0,0,1,1);return [...ctx.getImageData(0,0,1,1).data].slice(0,3).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);};
    const s=getComputedStyle(e),background=luminance(s.backgroundColor);
    return ['--ink','--muted'].map(token=>{const foreground=luminance(s.getPropertyValue(token));return (Math.max(foreground,background)+.05)/(Math.min(foreground,background)+.05);});
   });assert.ok(contrast.every(r=>r>=4.5),`${name} chapter surface contrast ${contrast}`);
   await page.screenshot({path:`${output}/${name}-${theme}-${width}.png`,fullPage:true});results.push({name,width,theme,contrast});
  }
  fixture='empty';await page.goto('http://127.0.0.1:8000/painel/reports');await page.waitForLoadState('networkidle');
  for(const theme of ['light','dark']){
   if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('#theme-toggle').click();
   assert.equal(await page.locator('html').getAttribute('data-theme'),theme);
   assert.equal(await page.locator('.report-downloads a').count(),0);assert.ok(await page.locator('#report').isVisible());
   await page.screenshot({path:`${output}/reports-empty-${theme}-320.png`,fullPage:true});
  }
  assert.equal(blocked,0);assert.deepEqual(errors,[]);
  const result={states:results.length,emptyReport:true,results,blocked,errors};fs.writeFileSync(`${output}/results.json`,JSON.stringify(result,null,2));console.log(JSON.stringify({states:results.length,emptyReport:true,blocked,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
