// Local UI verification. No connection, generation, import or news-collection calls.
const fs = require('node:fs');
const {chromium} = require('playwright');
(async()=>{
  const env=Object.fromEntries(fs.readFileSync('.env','utf8').split(/\r?\n/).filter(l=>l.includes('=')).map(l=>[l.slice(0,l.indexOf('=')),l.slice(l.indexOf('=')+1)]));
  const browser=await chromium.launch({headless:true,channel:'msedge'});
  const context=await browser.newContext({httpCredentials:{username:'admin',password:env.ADMIN_PASSWORD}});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/api/**',async route=>{
    if(route.request().method()!=='GET'&&!route.request().url().endsWith('/api/reports/self-test'))
      return route.fulfill({status:409,json:{detail:'Operação bloqueada pelo teste visual.'}});
    return route.continue();
  });
  for(const width of [375,768,1440]){
    await page.setViewportSize({width,height:1000});
    for(const theme of ['light','dark']){
      await context.addInitScript(theme=>localStorage.setItem('lg-theme',theme),theme);
      for(const name of ['news','strategy','contracts','reports','finance']){
        await page.goto('http://127.0.0.1:8000/painel/'+name);
        await page.locator('#content section, #content details').first().waitFor();
        if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Overflow '+name+' '+width);
        if(await page.locator('html').getAttribute('data-theme')!==theme)throw Error('Theme mismatch');
        await page.screenshot({path:`tmp/evolution-${name}-${theme}-${width}.png`,fullPage:true});
      }
    }
  }
  await page.goto('http://127.0.0.1:8000/painel/reports');
  await page.getByText('Testar a conferência de erros',{exact:true}).click();
  await page.locator('#report-self-test').click();
  await page.getByText('6 de 6 erros conhecidos detectados. Nenhuma chamada paga.',{exact:true}).waitFor();
  if(errors.length)throw Error(errors.join('; '));
  console.log(JSON.stringify({pages:5,widths:[375,768,1440],themes:2,screenshots:30,overflow:false,jsErrors:0,selfTest:'6/6',externalGenerationCalls:0}));
  await browser.close();
})().catch(error=>{console.error(error.message);process.exit(1)});
