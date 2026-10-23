// Synthetic, read-only fallback matrix. Script-failure diagnostics remain in the report.
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require('playwright');
const origin='http://127.0.0.1:8000',output='output/closure-v60/fallback';
const fixture=JSON.parse(fs.readFileSync('output/dossier-position-v59/after/fixture.json','utf8'));
const sourceFiles=['app/static/scene.js','app/templates/_workspace_scene.html','app/templates/dashboard.html'];
const hashes=()=>Object.fromEntries(sourceFiles.map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')]));
(async()=>{
 fs.mkdirSync(output,{recursive:true});
 const line=fs.readFileSync('.env','utf8').split(/\r?\n/).find(l=>l.startsWith('ADMIN_PASSWORD='));
 const password=line.slice(line.indexOf('=')+1).trim().replace(/^(['"])(.*)\1$/,'$2');
 const before=hashes(),checks=[],failures=[],pageErrors=[],consoleMessages=[],requests=[];
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{for(const mode of ['disabled','scene-blocked'])for(const width of [1440,768,390,320])for(const theme of ['light','dark']){
  const id=`${mode}-${width}-${theme}`,ctx=await browser.newContext({viewport:{width,height:900},javaScriptEnabled:mode!=='disabled',httpCredentials:{username:'admin',password},reducedMotion:'reduce'});
  await ctx.addInitScript(theme=>{localStorage.setItem('lg-theme',theme);localStorage.setItem('lg-scope','demo');},theme);
  await ctx.route('**/*',route=>{
   const req=route.request(),url=new URL(req.url());
   if(url.origin!==origin||req.method()!=='GET')throw Error('Forbidden request');
   if(mode==='scene-blocked'&&url.pathname==='/static/scene.js'){requests.push({id,path:url.pathname,action:'intentional-block'});return route.abort('failed');}
   if(url.pathname==='/api/dashboard')return route.fulfill({json:fixture});
   if(url.pathname.startsWith('/api/'))throw Error('Unexpected API '+url.pathname);
   return route.continue();
  });
  const page=await ctx.newPage();page.on('pageerror',e=>pageErrors.push({id,message:e.message}));page.on('console',m=>{if(m.type()==='error')consoleMessages.push({id,message:m.text()});});
  try{
   await page.goto(origin+'/painel/overview?scope=demo&start=2026-09-01&end=2026-09-30');await page.waitForLoadState('networkidle');
   // Test-only theme state: disabling application JS also disables the theme toggle.
   if(mode==='disabled')await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);
   await page.evaluate(()=>document.fonts.ready);
   assert.equal(await page.locator('.scene-ready').count(),0);
   assert.equal(await page.locator('.scene-footer').isVisible(),false);
   assert.equal(await page.locator('.scene-caption a:visible').count(),0);
   assert.equal(await page.locator('.scene-control:visible').count(),0);
   assert.equal(await page.locator('.dossier').count(),5);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
   const expected=['finance','reports','campaigns','insights','strategy'];
   for(let i=0;i<5;i++){
    const cover=page.locator('.dossier').nth(i),url=new URL(await cover.getAttribute('href'),origin);
    assert.equal(url.pathname,'/painel/'+expected[i]);
    if(mode==='scene-blocked'){assert.equal(url.searchParams.get('scope'),'demo');if(['campaigns','insights'].includes(expected[i])){assert.equal(url.searchParams.get('start'),'2026-09-01');assert.equal(url.searchParams.get('end'),'2026-09-30');}}
    await cover.focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');
    assert.ok(await cover.evaluate(e=>e===document.activeElement&&e.matches(':focus-visible')));
   }
   await page.locator('.dossier').first().focus();
   await page.locator('.workspace-scene').screenshot({path:output+'/'+id+'.png'});
   await page.locator('.dossier-campaigns').focus();await page.keyboard.press('Enter');await page.waitForURL(u=>u.pathname==='/painel/campaigns');
   checks.push(id);
  }catch(e){failures.push({id,error:e.message});}finally{await ctx.close();}
 }}finally{await browser.close();}
 const unexpectedConsole=consoleMessages.filter(m=>!m.message.includes('net::ERR_FAILED'));
 const result={checks,failures,pageErrors,consoleMessages,unexpectedConsole,requests,sourceHashes:before,sourceUnchanged:JSON.stringify(before)===JSON.stringify(hashes()),limitations:['No-JS dark theme is set through test-only DOM state; app theme toggle requires JS.','No-JS native links retain their original bare destinations. Applied scope/period enhancement requires app.js, and remains tested when only scene.js fails.','Intentional blocked script net::ERR_FAILED messages are retained as expected test diagnostics; other errors fail.']};
 fs.writeFileSync(output+'/results.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
 if(failures.length||pageErrors.length||unexpectedConsole.length||!result.sourceUnchanged)process.exitCode=1;
})().catch(e=>{console.error(e.message);process.exitCode=1;});
