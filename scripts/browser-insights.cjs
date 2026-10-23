// UI fixture only: every insight generation is intercepted; no provider calls.
const fs=require('node:fs');
const {chromium}=require('playwright');
(async()=>{
  const env=Object.fromEntries(fs.readFileSync('.env','utf8').split(/\r?\n/).filter(l=>l.includes('=')).map(l=>[l.slice(0,l.indexOf('=')),l.slice(l.indexOf('=')+1)]));
  const browser=await chromium.launch({headless:true,channel:'msedge'});
  const context=await browser.newContext({httpCredentials:{username:'admin',password:env.ADMIN_PASSWORD},viewport:{width:1440,height:1000},colorScheme:'light'});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  let latest=null,fail=false;
  await page.route('**/api/dashboard?*',async route=>{
    const response=await route.fetch(),body=await response.json();
    body.ai.insights_ready=true;body.ai.connected=true;
    await route.fulfill({json:body});
  });
  await page.route('**/api/insights?*',async route=>{
    if(route.request().method()==='POST'){
      const analyst=new URL(route.request().url()).searchParams.get('analyst');
      latest={id:1,analyst:analyst==='claude'?'Claude':'OpenAI',reviewer:analyst==='claude'?'OpenAI':'Claude',status:fail?'unverified':'partial',created_at:'2026-10-21T12:00:00',coverage:{campaigns:2},excluded:1,message:fail?'A revisão não foi concluída. Nenhuma conclusão foi exibida como revisada.':'Revisão concluída.',findings:fail?[]:[
        {id:'one',kind:'strength',title:'Há contratações registradas',explanation:'Os anúncios estão acompanhados por registros de contratações do escritório.',action:'Mantenha o acompanhamento dos contatos até a contratação.',evidence:[{label:'Contratações',metric:'hires',value:4,subject_name:'Todas as campanhas',period:'current'}]},
        {id:'two',kind:'weakness',title:'Confira o registro de conversões',explanation:'A falta de conversões registradas precisa ser revisada antes de avaliar o desempenho.',action:'Verifique se o acompanhamento dos anúncios está funcionando.',evidence:[{label:'Conversões do anúncio',metric:'conversions',value:0,subject_name:'Campanha de demonstração',period:'current'}]}
      ]};
      await route.fulfill({json:latest});
    }else await route.fulfill({json:{latest}});
  });
  // Fail closed on accidental connection mutations in a visual test.
  await page.route('**/api/ai/**',route=>route.fulfill({status:409,json:{detail:'Conexões reais não são alteradas por este teste.'}}));
  await page.goto('http://127.0.0.1:8000/painel/insights');
  await page.locator('#scope').selectOption('demo');
  await page.locator('#analyst').selectOption('claude');
  await page.getByRole('button',{name:'Analisar campanhas',exact:true}).click();
  await page.locator('.insight').first().waitFor();
  if(!(await page.locator('.insight-meta').innerText()).includes('Análise: Claude · Revisão: OpenAI'))throw Error('Roles not swapped');
  if(!(await page.locator('#content').innerText()).includes('sem confirmação foram retiradas'))throw Error('Rejected finding not explained');
  for(const width of [1440,768,375]){
    await page.setViewportSize({width,height:1000});
    for(const theme of ['light','dark']){
      if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('#theme-toggle').click();
      await page.reload();await page.locator('.insight').first().waitFor();
      if(await page.locator('html').getAttribute('data-theme')!==theme)throw Error('Theme was not saved');
      for(const route of ['insights','settings','campaigns','overview']){
        await page.goto('http://127.0.0.1:8000/'+(route==='overview'?'':'painel/'+route));
        await page.locator('#content section, #content details, .metrics').first().waitFor();
        if(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth))throw Error('Overflow '+route+' '+width+' '+theme);
        await page.screenshot({path:`tmp/${route}-${theme}-${width}.png`,fullPage:true});
      }
      await page.goto('http://127.0.0.1:8000/painel/insights');await page.locator('.insight').first().waitFor();
    }
  }
  await page.locator('#menu-toggle').click();
  await page.getByRole('navigation').waitFor({state:'visible'});
  if(await page.locator('#menu-toggle').getAttribute('aria-expanded')!=='true')throw Error('Mobile navigation not expanded');
  fail=true;
  await page.getByRole('button',{name:'Analisar novamente',exact:true}).click();
  await page.locator('.error-inline').waitFor();
  if(await page.locator('.insight').count())throw Error('Unreviewed conclusions exposed');
  if(errors.length)throw Error(errors.join('; '));
  console.log(JSON.stringify({themes:['light','dark'],widths:[375,768,1440],screenshots:24,themePersistence:true,mobileMenu:true,insightRoles:'swapped',reviewFailure:'closed',providers:'mocked',jsErrors:0}));
  await browser.close();
})().catch(error=>{console.error(error.message);process.exit(1)});
