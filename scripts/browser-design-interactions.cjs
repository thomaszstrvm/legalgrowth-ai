const fs=require('node:fs');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
  const env=Object.fromEntries(fs.readFileSync('.env','utf8').split(/\r?\n/).filter(l=>l.includes('=')).map(l=>[l.slice(0,l.indexOf('=')),l.slice(l.indexOf('=')+1)]));
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try {
    const context=await browser.newContext({httpCredentials:{username:'admin',password:env.ADMIN_PASSWORD},viewport:{width:1366,height:768},reducedMotion:'reduce'});
    await context.addInitScript(()=>{localStorage.setItem('lg-scope','demo');localStorage.setItem('lg-theme','light');});
    let expenseFails=true,mutations=0;
    await context.route('**/*',async route=>{
      const request=route.request(),url=new URL(request.url());
      if(url.origin!=='http://127.0.0.1:8000')return route.abort();
      if(request.method()==='GET')return route.continue();
      mutations++;
      if(url.pathname==='/api/expenses')return route.fulfill({status:expenseFails?422:200,json:expenseFails?{detail:'Confira a descrição e tente novamente.'}:{id:999}});
      return route.fulfill({status:409,json:{detail:'Operação bloqueada pelo teste.'}});
    });
    const page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://127.0.0.1:8000/painel/campaigns');await page.waitForLoadState('networkidle');
    await page.keyboard.press('Tab');assert.equal(await page.locator('.skip').evaluate(e=>e===document.activeElement),true);
    await page.keyboard.press('Enter');assert.equal(await page.locator('#main').evaluate(e=>e===document.activeElement),true);
    const disclosure=page.locator('.disclosure').filter({hasText:'Ver mais indicadores'});
    await disclosure.locator('summary').focus();
    await page.keyboard.press('Enter');
    assert.equal(await disclosure.evaluate(e=>e.open),true,'Disclosure opens with keyboard');
    await page.keyboard.press('Enter');
    assert.equal(await disclosure.evaluate(e=>e.open),false,'Disclosure closes with keyboard');
    await page.keyboard.press('Enter');
    const scroll=page.locator('details[open] .table-wrap').first();await scroll.focus();
    await page.keyboard.press('ArrowRight');await page.waitForTimeout(200);
    assert.ok(await scroll.evaluate(e=>e.scrollLeft>0),'Wide table keyboard scrolling');
    await page.getByText('Gastos por dia',{exact:true}).click();
    await page.locator('.chart').waitFor({state:'visible'});
    await page.evaluate(()=>{document.activeElement?.blur();document.querySelectorAll('.table-wrap').forEach(e=>e.scrollLeft=0);window.scrollTo(0,0);});
    await page.screenshot({path:'output/design-review/after/campaigns-expanded-1366.png',fullPage:true});
    const graph=await page.evaluate(()=>{
      const container=document.createElement('div');container.innerHTML=chart([{date:'2026-10-01',cost:10,clicks:1},{date:'2026-10-02',cost:0,clicks:0},{date:'2026-10-04',cost:20,clicks:2}]);
      const zero=document.createElement('div');zero.innerHTML=chart([{date:'2026-10-01',cost:0,clicks:0}]);
      return {points:container.querySelector('polyline').getAttribute('points'),text:container.textContent,
        middleDate:container.querySelector('.chart-date-mid').textContent,
        middlePosition:Number(container.querySelector('.chart-date-mid').dataset.chartDatePosition),
        scale:[...container.querySelectorAll('.chart-scale span')].map(e=>e.textContent),
        zeroPoints:zero.querySelector('polyline').getAttribute('points'),
        singleDateHasMiddle:!!zero.querySelector('.chart-date-mid'),empty:chart([])};
    });
    assert.equal(graph.points,'96,90 316,150 756,30');assert.ok(graph.text.includes('R$ 0'));
    assert.equal(graph.middleDate,'02/10/2026');assert.equal(graph.middlePosition,1/3,'Missing days retain calendar spacing');
    assert.equal(graph.scale.length,3);assert.match(graph.scale[1],/10,00/);
    assert.equal(graph.zeroPoints,'96,150');assert.equal(graph.singleDateHasMiddle,false);assert.equal(graph.empty,'');
    const dateLabel=page.locator('.chart-date-mid').first();
    assert.equal(await dateLabel.evaluate(e=>getComputedStyle(e).getPropertyValue('--date-position').trim()),await dateLabel.getAttribute('data-chart-date-position'),'CSP-compatible positioning reaches the rendered axis');
    const contrast=[];
    for(const theme of ['light','dark']){
      if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('#theme-toggle').click();
      contrast.push(...await page.evaluate(()=>{
        const style=getComputedStyle(document.documentElement);
        const lum=hex=>{const raw=hex.trim().replace('#',''),rgb=raw.length===3?[...raw].map(c=>c+c).join(''):raw;return [0,2,4].map(i=>parseInt(rgb.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);};
        return [['--ink','--bg'],['--muted','--bg'],['--muted','--canvas'],['--muted','--soft'],['--accent','--bg'],['--on-accent','--accent'],['--notice-ink','--notice-bg'],['--warning','--error-bg'],['--ledger-ink','--ledger-bg'],['--ledger-muted','--ledger-bg'],['--nav-muted','--nav-bg'],['--nav-ink','--nav-selected'],['--feature-ink','--feature-bg'],['--feature-muted','--feature-bg'],['--on-feature-action','--feature-action'],['--notice-ink','--bg']].map(([a,b])=>{const l=lum(style.getPropertyValue(a)),r=lum(style.getPropertyValue(b));return {theme:document.documentElement.dataset.theme,pair:[a,b],ratio:(Math.max(l,r)+.05)/(Math.min(l,r)+.05)};});
      }));
    }
    contrast.forEach(c=>assert.ok(c.ratio>=4.5,JSON.stringify(c)));
    await page.goto('http://127.0.0.1:8000/painel/finance');await page.waitForLoadState('networkidle');
    await page.getByText('Adicionar despesa',{exact:true}).click();
    await page.locator('#expense [name=reference]').fill('Despesa fictícia de teste');
    await page.locator('#expense [name=amount]').fill('12');
    await page.getByRole('button',{name:'Salvar despesa',exact:true}).click();
    await page.locator('#expense .form-error').waitFor();
    assert.equal(await page.locator('#expense [name=reference]').inputValue(),'Despesa fictícia de teste');
    assert.equal(await page.locator('#expense .form-error').evaluate(e=>e===document.activeElement),true);
    expenseFails=false;await page.getByRole('button',{name:'Salvar despesa',exact:true}).click();
    await page.waitForFunction(()=>document.getElementById('message').textContent==='Salvo.');
    await page.goto('http://127.0.0.1:8000/painel/settings');await page.waitForLoadState('networkidle');
    await page.locator('[data-configure=claude]').click();assert.equal(await page.locator('#ai-provider').inputValue(),'claude');
    await page.locator('#api-key').fill('synthetic-key-not-a-real-secret');
    await page.locator('#show-key').click();assert.equal(await page.locator('#api-key').getAttribute('type'),'text');
    await page.locator('#ai-provider').selectOption('openai');assert.equal(await page.locator('#api-key').inputValue(),'');
    const unlabeled=await page.locator('input,select,textarea').evaluateAll(items=>items.filter(e=>!e.labels?.length&&!e.getAttribute('aria-label')).map(e=>e.id||e.name));assert.deepEqual(unlabeled,[]);
    assert.ok(await page.evaluate(()=>document.fonts.check('16px "Manrope"')));
    await page.setViewportSize({width:390,height:844});
    await page.locator('#menu-toggle').focus();await page.keyboard.press('Enter');
    assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'true');
    await page.keyboard.press('Escape');assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'false');
    assert.equal(await page.locator('#menu-toggle').evaluate(e=>e===document.activeElement),true);
    // 320 CSS px approximates reflow at 400% on a 1280px viewport.
    await page.setViewportSize({width:320,height:800});
    for(const name of ['overview','campaigns','settings','reports']){
      await page.goto('http://127.0.0.1:8000/painel/'+name);await page.waitForLoadState('networkidle');
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'320px '+name);
    }
    // Report exports must be discoverable without horizontally scrolling a table.
    for(const [width,height] of [[1920,1080],[1366,768],[768,1024],[390,844],[320,800]]){
      await page.setViewportSize({width,height});
      for(const theme of ['light','dark']){
        if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('#theme-toggle').click();
        const links=page.locator('.report-downloads a');
        assert.ok(await links.count()>=2,'Both report formats are offered');
        for(const link of await links.all()){
          const box=await link.boundingBox();
          assert.ok(box&&box.x>=0&&box.x+box.width<=width,'Report export visible without horizontal scroll');
        }
        const dateLines=await page.locator('.task-board>.panel tbody td:first-child').evaluateAll(cells=>cells.map(cell=>{const range=document.createRange();range.selectNodeContents(cell);return range.getClientRects().length;}));
        assert.ok(dateLines.every(lines=>lines===1),'Report dates stay on one line');
        if(width!==320)await page.screenshot({path:`output/design-review/after/reports-${theme}-${width}.png`,fullPage:true});
      }
    }
    assert.deepEqual(errors,[]);
    const result={keyboardSkip:true,keyboardTableScroll:true,mobileMenuEscape:true,formValuesRetained:true,formRetry:true,chartZeroAndDateSpacing:true,controlsLabeled:true,reflow320:true,reportExportsVisible:true,contrast,mutationsMocked:mutations,realMutations:0,jsErrors:0};
    fs.writeFileSync('output/design-review/interaction-results.json',JSON.stringify(result,null,2));console.log(JSON.stringify({...result,contrast:`${contrast.length} pairs >= 4.5:1`}));
  } finally {await browser.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1});
