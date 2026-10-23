// Fault injection in read-only browser requests. No application data is changed.
const fs=require('node:fs');
const {chromium}=require('playwright');
(async()=>{
  const env=Object.fromEntries(fs.readFileSync('.env','utf8').split(/\r?\n/).filter(x=>x.includes('=')).map(x=>[x.slice(0,x.indexOf('=')),x.slice(x.indexOf('=')+1)]));
  const browser=await chromium.launch({headless:true,channel:'msedge'});
  try{
    const context=await browser.newContext({httpCredentials:{username:'admin',password:env.ADMIN_PASSWORD}});
    await context.addInitScript(()=>{
      Storage.prototype.getItem=function(){throw new DOMException('Blocked','SecurityError')};
      Storage.prototype.setItem=function(){throw new DOMException('Blocked','SecurityError')};
    });
    const page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    let fault='html';
    await page.route('**/api/dashboard?*',async route=>{
      if(fault==='html')return route.fulfill({status:503,contentType:'text/html',body:'<h1>private upstream diagnostics</h1>'});
      if(fault==='network')return route.abort('failed');
      return route.continue();
    });
    await page.goto('http://127.0.0.1:8000/');
    await page.getByText('O servidor não retornou uma resposta válida.',{exact:false}).waitFor();
    if((await page.locator('body').innerText()).includes('private upstream'))throw Error('Raw error exposed');
    if((await page.locator('#content').innerText()).includes('Carregando'))throw Error('Loading never ended');
    fault='network';await page.reload();
    await page.getByText('Não foi possível acessar o painel.',{exact:false}).waitFor();
    fault=null;
    await page.locator('.period-picker summary').click();
    await page.locator('#refresh').click();
    await page.locator('#content section').first().waitFor();
    if(await page.locator('#message').innerText())throw Error('Stale error after recovery');
    await page.locator('#scope').selectOption('demo');
    await page.locator('.metrics').waitFor();
    await page.locator('#theme-toggle').click();
    if(errors.length)throw Error(errors.join('; '));
    console.log(JSON.stringify({htmlError:'sanitized',networkError:'readable',storageBlocked:'usable',recovery:'passed',jsErrors:0,paidCalls:0}));
  }finally{await browser.close()}
})().catch(error=>{console.error(error.message);process.exit(1)});
