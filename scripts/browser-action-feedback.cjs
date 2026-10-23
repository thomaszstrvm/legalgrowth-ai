// Every API request is mocked. Local credentials authenticate HTML/static files only.
// This test never reads application/client data or invokes an external provider.
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require('playwright');
const origin=process.env.TEST_ORIGIN||'http://127.0.0.1:8000';
const output=process.env.ACTION_FEEDBACK_OUTPUT||'output/design-review/action-feedback-v1';
const metric={rows:1,days:1,cost:100,impressions:100,clicks:10,qualified:2,hires:1,contacts:3,appointments:1,conversions:1,ctr:10,cpc:10,cpq:50,cph:100};
const ai={connected:false,insights_ready:false,connections:{},monthly_limit:60,reserved_brl:0};
const budget={month:'2026-10',planned:2000,spent:100,balance:1900,consumed_percent:5,alerts:[],imported_ads:100,manual_expenses:0,software_expenses:0,allocations:{trabalhista:1400,previdenciario:600,infraestrutura:0,reserva:0}};
const dashboard={summary:metric,campaigns:{'Campanha sintética':metric},localities:{},keywords:{},evolution:[],budget,recommendations:[],ai,ai_priorities:[]};
const configuration={localities:['Cidade Sintética-SP'],ai,last_week:'2026-10-12',scheduler_enabled:false};
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
(async()=>{
  const env=Object.fromEntries(fs.readFileSync('.env','utf8').split(/\r?\n/).filter(line=>line.includes('=')).map(line=>[line.slice(0,line.indexOf('=')),line.slice(line.indexOf('=')+1)]));
  const browser=await chromium.launch({channel:'msedge',headless:true});
  fs.mkdirSync(output,{recursive:true});
  const checks=[],errors=[],unexpected=[];
  try{
    for(const width of [1366,390])for(const theme of ['light','dark']){
      const context=await browser.newContext({viewport:{width,height:900},httpCredentials:{username:'admin',password:env.ADMIN_PASSWORD},reducedMotion:'reduce'});
      await context.addInitScript(theme=>{localStorage.setItem('lg-scope','demo');localStorage.setItem('lg-theme',theme);},theme);
      let failFinance=false,rejectExpense=false,allowDashboard=false,dashboardRequests=0,expenseAttempts=0,expenseSaves=0;
      await context.route('**/*',async route=>{
        const request=route.request(),url=new URL(request.url());
        if(url.origin!==origin){unexpected.push('External request');return route.abort();}
        if(url.pathname.startsWith('/api/')){
          if(url.pathname==='/api/expenses'&&request.method()==='POST'){
            expenseAttempts++;
            if(rejectExpense)return route.fulfill({status:422,json:{detail:'Descrição sintética rejeitada para testar recuperação.'}});
            assert.equal(request.postDataJSON().scope,'demo');
            expenseSaves++;
            if(expenseSaves===1)failFinance=true;
            return route.fulfill({json:{id:expenseSaves}});
          }
          if(request.method()!=='GET'){unexpected.push('Unexpected mutation '+url.pathname);return route.abort();}
          if(url.pathname==='/api/dashboard'){
            dashboardRequests++;await pause(120);
            return route.fulfill({status:allowDashboard?200:503,json:allowDashboard?dashboard:{detail:'Falha sintética do dashboard.'}});
          }
          if(url.pathname==='/api/finance')return route.fulfill({status:failFinance?503:200,json:failFinance?{detail:'Leitura sintética indisponível.'}:{current:budget,previous:budget,expenses:expenseSaves?[{day:'2026-10-23',reference:'Despesa sintética confirmada',amount:12}]:[]}});
          if(url.pathname==='/api/settings'){await pause(120);return route.fulfill({json:configuration});}
          if(url.pathname==='/api/reports')return route.fulfill({json:[]});
          if(url.pathname==='/api/news')return route.fulfill({json:{latest:null,localities:configuration.localities,coverage_note:'Cobertura sintética para teste.'}});
          if(url.pathname==='/api/strategy')return route.fulfill({json:{opportunities:[],notice:'Sem oportunidades sintéticas.'}});
          if(url.pathname==='/api/contracts/demo')return route.fulfill({json:{fields:{}}});
          unexpected.push('Unexpected API '+url.pathname);return route.abort();
        }
        if(request.method()!=='GET'){unexpected.push('Unexpected non-GET');return route.abort();}
        return route.continue();
      });
      const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
      await page.goto(origin+'/painel/finance');
      await page.locator('#expense').waitFor({state:'attached'});
      await page.getByText('Adicionar despesa',{exact:true}).click();
      await page.locator('#expense [name=reference]').fill('Despesa sintética');
      await page.locator('#expense [name=amount]').fill('12');
      await page.getByRole('button',{name:'Salvar despesa',exact:true}).focus();await page.keyboard.press('Enter');
      await page.getByRole('button',{name:'Recarregar dados',exact:true}).waitFor();
      assert.match(await page.locator('#message').innerText(),/Salvo.*operação foi concluída.*não repita/i);
      assert.equal(await page.locator('#message').evaluate(el=>el===document.activeElement),true);
      assert.equal(await page.locator('#expense').count(),0,'Failed read cannot expose the old submit form');
      assert.equal(expenseAttempts,1);assert.equal(expenseSaves,1);
      await page.screenshot({path:`${output}/confirmed-refresh-error-${theme}-${width}.png`,fullPage:true});
      await page.getByRole('button',{name:'Recarregar dados',exact:true}).click();
      await page.waitForFunction(()=>document.getElementById('message').textContent.includes('continua indisponível'));
      assert.equal(expenseAttempts,1,'Repeated recovery must issue GET only');
      await page.getByRole('button',{name:'Recarregar dados',exact:true}).waitFor();
      failFinance=false;
      await page.getByRole('button',{name:'Recarregar dados',exact:true}).click();
      await page.locator('#expense .action-feedback').waitFor();
      assert.equal(await page.locator('#expense .action-feedback').evaluate(el=>el===document.activeElement),true);
      assert.equal(await page.locator('#expense').evaluate(el=>el.closest('details').open),true);
      assert.equal(await page.locator('#expense [name=reference]').inputValue(),'','No draft is retained');
      assert.equal(expenseAttempts,1);
      await page.screenshot({path:`${output}/recovered-focus-${theme}-${width}.png`,fullPage:true});
      await page.locator('#expense [name=reference]').fill('Segunda despesa sintética');
      await page.locator('#expense [name=amount]').fill('13');
      await page.getByRole('button',{name:'Salvar despesa',exact:true}).focus();await page.keyboard.press('Enter');
      await page.locator('#expense .action-feedback').waitFor();
      assert.equal(await page.locator('#expense .action-feedback').evaluate(el=>el===document.activeElement),true);
      assert.equal(expenseSaves,2);
      rejectExpense=true;
      await page.locator('#expense [name=reference]').fill('Rascunho sintético permanece no erro');
      await page.locator('#expense [name=amount]').fill('14');
      await page.getByRole('button',{name:'Salvar despesa',exact:true}).click();
      await page.locator('#expense .form-error').waitFor();
      assert.equal(await page.locator('#expense .form-error').evaluate(el=>el===document.activeElement),true);
      assert.equal(await page.locator('#expense [name=reference]').inputValue(),'Rascunho sintético permanece no erro');
      assert.equal(expenseSaves,2);
      assert.equal(dashboardRequests,0,'Finance must not depend on campaign dashboard');
      for(const routeName of ['settings','reports','news','strategy','contracts']){
        await page.goto(origin+'/painel/'+routeName);
        await page.waitForFunction(()=>document.getElementById('content').getAttribute('aria-busy')==='false');
        assert.equal(await page.locator('.load-error').count(),0,routeName+' independent route');
      }
      assert.equal(dashboardRequests,0,'Independent pages must not request the failing dashboard');
      allowDashboard=true;
      for(const [routeName,fragment] of [['settings','ai'],['campaigns','import'],['settings','locations']]){
        await page.goto(`${origin}/painel/${routeName}#${fragment}`);
        await page.waitForFunction(id=>document.activeElement?.id===id,fragment);
        assert.equal(await page.locator('#'+fragment).evaluate(el=>{const r=el.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight;}),true);
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
        await page.screenshot({path:`${output}/fragment-${fragment}-${theme}-${width}.png`});
      }
      await page.locator('#scope').focus();await page.locator('#scope').selectOption('real');
      await page.waitForFunction(()=>document.getElementById('content').getAttribute('aria-busy')==='false'&&document.getElementById('regions'));
      assert.equal(await page.locator('#scope').evaluate(el=>el===document.activeElement),true,'Normal updates must not replay the original fragment focus');
      checks.push({width,theme,confirmedPostReadFailure:true,repeatedRetryGetsOnly:true,successFocus:true,errorFocusAndDraft:true,dynamicFragments:['ai','import','locations'],normalUpdateKeepsFocus:true,independentRoutes:true,expenseAttempts,expenseSaves});
      await context.close();
    }
    assert.deepEqual(errors,[]);assert.deepEqual(unexpected,[]);
    const result={checks,jsErrors:errors,unexpectedRequests:unexpected,realMutations:0,externalRequests:0};
    fs.writeFileSync(output+'/results.json',JSON.stringify(result,null,2));
    const sources=['app/static/tokens.css','app/static/app.js','app/static/arc.css','app/static/style.css','app/templates/dashboard.html','scripts/browser-action-feedback.cjs'];
    fs.writeFileSync(output+'/manifest.json',JSON.stringify({generatedAt:new Date().toISOString(),sources:Object.fromEntries(sources.map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')]))},null,2));
    console.log(JSON.stringify(result));
  }finally{await browser.close();}
})().catch(error=>{console.error(error.message);process.exit(1);});
