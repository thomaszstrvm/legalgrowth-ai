// Presentation regression QA: every API is synthetic; only local HTML/assets use auth.
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require('playwright');
const origin=process.env.TEST_ORIGIN||'http://127.0.0.1:8000';
const output=process.env.TABLE_CUES_OUTPUT||'output/design-review/design-engineering-v1/critic-fixes';
const metric={rows:1,days:1,cost:100,impressions:100,clicks:10,qualified:2,hires:1,contacts:3,appointments:1,conversions:1,ctr:10,cpc:10,cpq:50,cph:100};
const dashboard={summary:metric,campaigns:{'Campanha sintética':metric},localities:{'Cidade sintética':metric},keywords:{'Termo sintético':metric},evolution:[],recommendations:[],ai:{connected:true,insights_ready:true},ai_priorities:[]};
const news={localities:['Cidade Sintética-SP'],coverage_note:'Fontes sintéticas para QA.',latest:{id:9901,status:'collected',start:'2026-10-12',end:'2026-10-18',created_at:'2026-10-23',message:'Notícias sintéticas reunidas.',cities:['Cidade Sintética-SP'],signals:[{label:'Orientação sobre benefícios',count:2,source_count:1}],scenarios:[],articles:[],sources:[{name:'Jornal Sintético Regional',status:'partial',complete_window:false}],truncated:false}};
async function cuesMatchGeometry(page){
  await page.waitForFunction(()=>[...document.querySelectorAll('.table-wrap[data-scroll-hint]')].every(wrapper=>{
    const overflow=wrapper.clientWidth>0&&wrapper.scrollWidth>wrapper.clientWidth+1;
    const hint=document.getElementById(wrapper.dataset.scrollHint);
    return hint.hidden===!overflow&&wrapper.getAttribute('aria-describedby')===(overflow?hint.id:null);
  }));
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Document has no horizontal overflow');
}
async function ready(page){await page.waitForFunction(()=>document.querySelector('#content[aria-busy=false]'));await page.evaluate(()=>document.fonts.ready);await cuesMatchGeometry(page);}
(async()=>{
  const env=Object.fromEntries(fs.readFileSync('.env','utf8').split(/\r?\n/).filter(line=>line.includes('=')).map(line=>[line.slice(0,line.indexOf('=')),line.slice(line.indexOf('=')+1)]));
  const browser=await chromium.launch({channel:'msedge',headless:true});
  const checks=[],errors=[],unexpected=[];fs.mkdirSync(output,{recursive:true});
  try{
    for(const width of [1366,390,320])for(const theme of ['light','dark']){
      let coverage='partial';
      const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce',httpCredentials:{username:'admin',password:env.ADMIN_PASSWORD}});
      await context.addInitScript(theme=>{localStorage.setItem('lg-scope','real');localStorage.setItem('lg-theme',theme);},theme);
      await context.route('**/*',route=>{
        const request=route.request(),url=new URL(request.url());
        if(url.origin!==origin||request.method()!=='GET'){unexpected.push('Blocked external/mutation');return route.abort();}
        if(url.pathname==='/api/dashboard')return route.fulfill({json:dashboard});
        if(url.pathname==='/api/news'){
          const fixture=structuredClone(news);
          if(coverage!=='partial')fixture.latest.sources=[{name:'Jornal Sintético Regional',status:'read',complete_window:true}];
          fixture.latest.truncated=coverage==='truncated';
          return route.fulfill({json:fixture});
        }
        if(url.pathname==='/api/insights')return route.fulfill({json:{latest:{status:'unverified',analyst:'OpenAI sintética',reviewer:'Claude sintética',created_at:'2026-10-23',message:'Análise sintética não verificada. Confira a conexão antes de tentar novamente.'}}});
        if(url.pathname.startsWith('/api/')){unexpected.push('Unmocked API '+url.pathname);return route.abort();}
        return route.continue();
      });
      const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
      await page.goto(origin+'/painel/campaigns');await ready(page);
      const disclosure=page.locator('details').filter({has:page.locator('summary').filter({hasText:'Ver mais indicadores'})});
      const summary=disclosure.locator('summary'),table=disclosure.locator('.table-wrap');
      assert.equal(await disclosure.locator('.table-scroll-hint').isVisible(),false,'Closed disclosure has no visible cue');
      await summary.focus();await page.keyboard.press('Enter');await cuesMatchGeometry(page);
      assert.equal(await summary.evaluate(e=>document.activeElement===e),true,'Opening keeps focus on summary');
      assert.equal(await disclosure.locator('.table-scroll-hint').isVisible(),true,'Wide table advertises horizontal scroll');
      await table.focus();await page.keyboard.press('ArrowRight');
      await page.waitForFunction(()=>document.activeElement?.classList.contains('table-wrap')&&document.activeElement.scrollLeft>0);
      assert.equal(await table.getAttribute('tabindex'),'0');
      await page.screenshot({path:`${output}/campaigns-${theme}-${width}.png`,fullPage:true});
      await summary.focus();await page.keyboard.press('Enter');await cuesMatchGeometry(page);
      await page.locator('#scope').selectOption('demo');await ready(page);
      const fresh=page.locator('details').filter({has:page.locator('summary').filter({hasText:'Ver mais indicadores'})});
      await fresh.locator('summary').click();await cuesMatchGeometry(page);
      assert.equal(await fresh.locator('.table-scroll-hint').isVisible(),true,'Observer reconnects after render');

      await page.goto(origin+'/painel/news');await ready(page);
      const notice=page.locator('.coverage-notice');assert.equal(await notice.count(),1);
      assert.match(await notice.innerText(),/Cobertura parcial/);
      const appearance=await notice.evaluate(e=>{const s=getComputedStyle(e);return {background:s.backgroundColor,border:s.borderTopWidth,padding:s.paddingTop};});
      assert.equal(appearance.background,'rgba(0, 0, 0, 0)');assert.equal(appearance.border,'0px');
      const sources=page.locator('details').filter({has:page.locator('summary').filter({hasText:'O que foi possível consultar'})});
      await sources.locator('summary').click();await cuesMatchGeometry(page);
      const sourceTable=sources.locator('.table-wrap');await sourceTable.focus();
      await page.setViewportSize({width:320,height:900});await cuesMatchGeometry(page);
      assert.equal(await sources.locator('.table-scroll-hint').isVisible(),true,'Narrow sources table overflows');
      await page.setViewportSize({width:1366,height:900});await cuesMatchGeometry(page);
      assert.equal(await sources.locator('.table-scroll-hint').isVisible(),false,'No desktop cue for fitting table');
      assert.equal(await sourceTable.evaluate(e=>document.activeElement===e),true,'Resize never moves focus');
      await page.setViewportSize({width,height:900});await cuesMatchGeometry(page);
      await page.screenshot({path:`${output}/news-partial-${theme}-${width}.png`,fullPage:true});
      coverage='complete';await page.locator('#scope').selectOption('demo');await ready(page);await page.locator('#scope').selectOption('real');await ready(page);
      assert.equal(await notice.count(),0,'Complete coverage has no warning');
      coverage='truncated';await page.locator('#scope').selectOption('demo');await ready(page);await page.locator('#scope').selectOption('real');await ready(page);
      assert.equal(await notice.count(),1,'Truncation is still an incomplete coverage warning');

      await page.goto(origin+'/painel/insights');await ready(page);
      const error=page.locator('.error-inline');
      const padding=await error.evaluate(e=>{const s=getComputedStyle(e);return [s.paddingTop,s.paddingRight,s.paddingBottom,s.paddingLeft].map(parseFloat);});
      assert.ok(padding.every(value=>value>=16),'Error retains padding on all four sides');
      assert.equal(await error.getAttribute('role'),'status');
      await page.screenshot({path:`${output}/insights-unverified-${theme}-${width}.png`,fullPage:true});
      checks.push({width,theme,geometry:true,disclosureKeyboard:true,arrowScroll:true,reconnect:true,resizeFocus:true,desktopNoCue:true,partialCompact:true,completeNoWarning:true,truncationWarning:true,errorPadding:padding});
      await context.close();
    }
    assert.deepEqual(errors,[]);assert.deepEqual(unexpected,[]);
    const result={checks,errors,unexpected,realMutations:0,providerRequests:0,limitations:['Chromium headless only; no physical touch device or screen reader audit.','Synthetic fixtures validate presentation and interaction, not news source accuracy.']};
    fs.writeFileSync(output+'/results.json',JSON.stringify(result,null,2));
    fs.writeFileSync(output+'/manifest.json',JSON.stringify({generatedAt:new Date().toISOString(),sources:Object.fromEntries(['app/static/app.js','app/static/style.css','app/static/arc.css','scripts/browser-table-cues.cjs'].map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')]))},null,2));
    console.log(JSON.stringify(result));
  }finally{await browser.close();}
})().catch(error=>{console.error(error.stack);process.exitCode=1;});
