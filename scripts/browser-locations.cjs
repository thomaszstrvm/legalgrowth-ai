// Synthetic API responses only. No real settings, database writes or paid calls.
const fs=require('node:fs');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const {chromium}=require('playwright');
const output=process.env.LOCATIONS_OUTPUT||'output/design-review/locations-v1';
fs.mkdirSync(output,{recursive:true});
(async()=>{
  const env=Object.fromEntries(fs.readFileSync('.env','utf8').split(/\r?\n/).filter(l=>l.includes('=')).map(l=>[l.slice(0,l.indexOf('=')),l.slice(l.indexOf('=')+1)]));
  const browser=await chromium.launch({channel:'msedge',headless:true});
  const errors=[],checks=[];let simulatedSaves=0;
  try{
    for(const width of [1366,390,320])for(const theme of ['light','dark']){
      const context=await browser.newContext({viewport:{width,height:width===1366?900:844},httpCredentials:{username:'admin',password:env.ADMIN_PASSWORD},reducedMotion:'reduce'});
      await context.addInitScript(theme=>{if(!localStorage.getItem('lg-scope'))localStorage.setItem('lg-scope','demo');localStorage.setItem('lg-theme',theme);},theme);
      const saved={demo:['Curitiba-PR','Florianópolis-SC'],real:[]};
      let rejectNextSave=false;
      await context.route('**/*',route=>{
        const req=route.request(),url=new URL(req.url());
        if(url.origin!=='http://127.0.0.1:8000')return route.abort();
        const scope=url.searchParams.get('scope')||'real';
        if(url.pathname==='/api/dashboard')return route.fulfill({json:{summary:{rows:0},recommendations:[],ai_priorities:[],ai:{connected:false}}});
        if(url.pathname==='/api/settings')return route.fulfill({json:{localities:saved[scope],ai:{connections:{},insights_ready:false,monthly_limit:60}}});
        if(url.pathname==='/api/news')return route.fulfill({json:{latest:null,localities:saved[scope],coverage_note:'As fontes atuais cobrem o Vale do Paraíba (SP). Outras regiões precisam de fontes compatíveis.'}});
        if(url.pathname==='/api/regions'&&req.method()==='POST'){
          if(rejectNextSave){rejectNextSave=false;return route.fulfill({status:422,json:{detail:'Revise as cidades indicadas antes de salvar.',errors:[{row:1,code:'invalid_locality',message:'Confira o nome da cidade e selecione um estado válido.'}]}});}
          const body=req.postDataJSON();assert.ok(['real','demo'].includes(body.scope));
          saved[body.scope]=body.localities;simulatedSaves++;
          return route.fulfill({json:{status:'saved'}});
        }
        if(req.method()!=='GET'||url.pathname.startsWith('/api/'))return route.abort();
        return route.continue();
      });
      const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
      await page.goto('http://127.0.0.1:8000/painel/settings');
      await page.locator('#regions').waitFor();
      assert.equal(await page.locator('.locality-row').count(),2);
      await page.getByRole('button',{name:'Adicionar cidade',exact:true}).click();
      await page.locator('.locality-row').last().getByRole('textbox').fill('Recife');
      await page.locator('.locality-row').last().getByRole('combobox').selectOption('PE');
      await page.getByRole('button',{name:'Salvar região',exact:true}).click();
      await page.getByText('Região salva. Os dados históricos foram preservados.',{exact:true}).waitFor();
      assert.deepEqual(saved.demo,['Curitiba-PR','Florianópolis-SC','Recife-PE']);
      await page.screenshot({path:`${output}/saved-${theme}-${width}.png`,fullPage:true});
      await page.reload();await page.locator('#regions').waitFor();
      assert.equal(await page.locator('.locality-row').count(),3);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      await page.screenshot({path:`${output}/settings-${theme}-${width}.png`,fullPage:true});
      rejectNextSave=true;await page.getByRole('button',{name:'Salvar região',exact:true}).click();
      await page.locator('#regions .form-error').waitFor();
      assert.equal(await page.locator('[aria-invalid=true]').count(),2);
      assert.equal(await page.locator('.locality-row').nth(1).getByRole('textbox').evaluate(e=>e===document.activeElement),true);
      assert.equal(await page.locator('.locality-row').nth(1).getByRole('textbox').getAttribute('aria-describedby'),'location-error-1');
      await page.screenshot({path:`${output}/error-${theme}-${width}.png`,fullPage:true});
      await page.locator('.locality-row').nth(1).getByRole('textbox').fill('Florianópolis');
      assert.equal(await page.locator('[aria-invalid=true]').count(),0);
      assert.equal(saved.demo.length,3);
      await page.waitForFunction(()=>!document.getElementById('add-locality').disabled);
      await page.locator('[data-remove-locality]').last().focus();await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(()=>document.activeElement.id),'add-locality');
      assert.equal(await page.locator('#add-locality').evaluate(e=>e.matches(':focus-visible')),true);
      await page.locator('.location-actions').scrollIntoViewIfNeeded();
      await page.screenshot({path:`${output}/focus-${theme}-${width}.png`});
      await page.locator('[data-remove-locality]').last().click();
      assert.equal(saved.demo.length,3); // Removing a draft does not persist until Save.
      await page.locator('#scope').selectOption('real');
      await page.locator('#regions input[name=city]').waitFor();
      await page.waitForFunction(()=>document.querySelectorAll('.locality-row').length===1);
      assert.equal(await page.locator('#regions input[name=city]').inputValue(),'');
      await page.getByRole('button',{name:'Salvar região',exact:true}).click();
      assert.deepEqual(saved.real,[]); // Native required validation blocks empty region.
      await page.goto('http://127.0.0.1:8000/painel/news');
      await page.getByText('Escolha as cidades atendidas em Configurações para começar.',{exact:true}).waitFor();
      assert.equal(await page.locator('#scan-news').count(),0);
      await page.screenshot({path:`${output}/news-empty-${theme}-${width}.png`,fullPage:true});
      await page.goto('http://127.0.0.1:8000/painel/settings');await page.locator('#regions').waitFor();
      for(let i=1;i<20;i++)await page.locator('#add-locality').click();
      await page.locator('#add-locality').click();assert.equal(await page.locator('.locality-row').count(),20);
      await page.getByText('O limite é de 20 cidades.',{exact:true}).waitFor();
      await page.locator('#location-feedback').scrollIntoViewIfNeeded();
      await page.screenshot({path:`${output}/limit-${theme}-${width}.png`});
      checks.push({width,theme,add:true,save:true,reload:true,scopeIsolation:true,emptyValidation:true,limit20:true,overflow:false});
      await context.close();
    }
    assert.deepEqual(errors,[]);
    const result={checks,errors,simulatedSaves,realMutations:0,externalRequests:0};
    fs.writeFileSync(`${output}/results.json`,JSON.stringify(result,null,2));console.log(JSON.stringify(result));
    const sources=['app/static/app.js','app/static/arc.css','app/static/style.css','app/templates/dashboard.html','app/api.py','scripts/browser-locations.cjs'];
    fs.writeFileSync(`${output}/manifest.json`,JSON.stringify({generatedAt:new Date().toISOString(),sources:Object.fromEntries(sources.map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')]))},null,2));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
