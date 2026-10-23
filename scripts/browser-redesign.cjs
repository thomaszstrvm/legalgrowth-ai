// Render only synthetic demo data. Block every mutation and external request.
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require('playwright');
const phase = process.argv[2] || 'after';
const quick=process.env.DESIGN_QUICK==='1';
const viewports=process.env.DESIGN_WIDTHS?process.env.DESIGN_WIDTHS.split(',').map(w=>[Number(w),900]):process.env.DESIGN_NARROW==='1'?[[320,844]]:quick?[[1366,768],[390,844]]:[[1920,1080],[1366,768],[768,1024],[390,844]];
if(viewports.some(([w])=>!Number.isInteger(w)||w<320||w>2560))throw Error('Invalid design viewport');
const allPages=['overview','campaigns','insights','news','strategy','agents','contracts','finance','reports','settings','market'];
const pages=process.env.DESIGN_PAGES?process.env.DESIGN_PAGES.split(','):quick?['overview','settings','reports']:allPages;
if(pages.some(name=>!allPages.includes(name)))throw Error('Unknown design page');
if (!['before', 'after'].includes(phase)) throw Error('Use before or after');
const directory = path.join('output', 'design-review', phase);
fs.mkdirSync(directory, {recursive:true});
(async () => {
  const env = Object.fromEntries(fs.readFileSync('.env','utf8').split(/\r?\n/).filter(l=>l.includes('=')).map(l=>[l.slice(0,l.indexOf('=')),l.slice(l.indexOf('=')+1)]));
  const browser = await chromium.launch({channel:'msedge',headless:true});
  const errors = [], screenshots = [];
  try {
    for (const [width,height] of viewports) {
      for (const theme of ['light','dark']) {
        const context = await browser.newContext({viewport:{width,height},httpCredentials:{username:'admin',password:env.ADMIN_PASSWORD},reducedMotion:'reduce'});
        await context.addInitScript(theme=>{localStorage.setItem('lg-scope','demo');localStorage.setItem('lg-theme',theme);},theme);
        await context.route('**/*', route => {
          const request=route.request(), url=new URL(request.url());
          if(url.origin!=='http://127.0.0.1:8000'||request.method()!=='GET')return route.abort();
          return route.continue();
        });
        const page = await context.newPage();
        page.on('pageerror',error=>errors.push(error.message));
        page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text());});
        for(const name of pages) {
          await page.goto('http://127.0.0.1:8000/painel/'+name);
          await page.waitForLoadState('networkidle');
          await page.waitForFunction(()=>!document.getElementById('content').textContent.includes('Carregando…'));
          if(await page.locator('#message.error').count())throw Error('Page error '+name);
          if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Overflow '+name+' '+width);
          if(await page.locator('html').getAttribute('data-theme')!==theme)throw Error('Theme mismatch');
          if(name==='campaigns') {
            const positions=await page.locator('.task-board>.metrics .metric:not(:first-child)').evaluateAll(metrics=>metrics.map(e=>({value:e.querySelector('strong').getBoundingClientRect().top,hint:e.querySelector('.hint').getBoundingClientRect().top})));
            if(positions.length!==2||Math.abs(positions[0].value-positions[1].value)>1||Math.abs(positions[0].hint-positions[1].hint)>1)throw Error('Campaign metric alignment '+width+'/'+theme);
          }
          const file=path.join(directory,`${name}-${theme}-${width}.png`);
          await page.screenshot({path:file,fullPage:true});screenshots.push(file);
        }
        await context.close();
      }
    }
    if(errors.length)throw Error(errors.join('\n'));
    const result={phase,quick,screenshots:screenshots.length,viewports,themes:2,pages:pages.length,overflow:false,consoleErrors:errors,mutations:0};
    fs.writeFileSync(path.join(directory,'results.json'),JSON.stringify(result,null,2));
    console.log(JSON.stringify(result));
  } finally { await browser.close(); }
})().catch(error=>{console.error(error.message);process.exitCode=1;});
