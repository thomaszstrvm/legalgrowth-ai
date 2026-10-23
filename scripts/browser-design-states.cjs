const fs=require('node:fs'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url'),path=require('node:path');
const {chromium}=require('playwright');
(async()=>{
  const env=Object.fromEntries(fs.readFileSync('.env','utf8').split(/\r?\n/).filter(l=>l.includes('=')).map(l=>[l.slice(0,l.indexOf('=')),l.slice(l.indexOf('=')+1)]));
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try{
    const context=await browser.newContext({httpCredentials:{username:'admin',password:env.ADMIN_PASSWORD},viewport:{width:390,height:844}});
    await context.addInitScript(()=>localStorage.setItem('lg-scope','demo'));
    let empty=true;
    await context.route('**/api/dashboard?*',async route=>{
      const response=await route.fetch(),data=await response.json();
      if(empty){data.summary.rows=0;data.campaigns={};}
      else {const row=Object.values(data.campaigns)[0];data.campaigns={['Campanha fictícia com nome extenso para testar leitura e quebra de linha '.repeat(6)]:row};}
      return route.fulfill({json:data});
    });
    await context.route('**/api/**',route=>route.request().method()==='GET'?route.fallback():route.abort());
    const page=await context.newPage();
    await page.goto('http://127.0.0.1:8000/');await page.locator('.empty-state').waitFor();
    assert.equal(await page.locator('#overview-summary').isVisible(),false,'Empty overview hides old totals');
    assert.ok(await page.getByRole('link',{name:'Importar resultados',exact:true}).isVisible());
    await page.screenshot({path:'output/design-review/after/overview-empty-390.png',fullPage:true});
    empty=false;await page.reload();await page.locator('.campaign-mobile article').waitFor();
    assert.equal(await page.locator('#overview-summary .metric').count(),3,'Populated overview has three summary metrics');
    assert.equal(await page.locator('#overview-summary').isVisible(),true);
    const chartLabels=await page.locator('.chart-scale,.chart-dates').evaluateAll(labels=>labels.map(e=>parseFloat(getComputedStyle(e).fontSize)));
    assert.ok(chartLabels.length===2&&chartLabels.every(size=>size>=12),'Mobile chart labels remain readable');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    await page.screenshot({path:'output/design-review/after/overview-long-name-390.png',fullPage:true});
    empty=true;await page.reload();await page.locator('.empty-state').waitFor();
    assert.equal(await page.locator('#overview-summary').textContent(),'','Old totals are removed after empty response');
    const gallery=await browser.newPage();
    await gallery.goto(pathToFileURL(path.resolve('output/design-review/index.html')).href);
    await gallery.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
    await gallery.locator('#size').selectOption('390');await gallery.locator('#theme').selectOption('dark');
    await gallery.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
    assert.ok((await gallery.locator('#after').getAttribute('src')).endsWith('overview-dark-390.png'));
    console.log(JSON.stringify({syntheticEmpty:true,summaryLifecycle:true,readableMobileChart:true,longNameReflow:true,comparisonGallery:true,paidCalls:0}));
  }finally{await browser.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1});
