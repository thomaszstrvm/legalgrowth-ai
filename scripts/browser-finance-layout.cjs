// Empty and populated financial layouts with synthetic expenses; no writes.
const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const env=Object.fromEntries(fs.readFileSync('.env','utf8').split(/\r?\n/).filter(l=>l.includes('=')).map(l=>[l.slice(0,l.indexOf('=')),l.slice(l.indexOf('=')+1)]));
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const directory='output/design-review/exceptional/finance-states';fs.mkdirSync(directory,{recursive:true});
 try{
  const context=await browser.newContext({httpCredentials:{username:'admin',password:env.ADMIN_PASSWORD},reducedMotion:'reduce'});
  await context.addInitScript(()=>{localStorage.setItem('lg-scope','demo');localStorage.setItem('lg-theme','light');});
  let populated=false,mutations=0;
  await context.route('**/*',async route=>{
   const request=route.request(),url=new URL(request.url());
   if(url.origin!=='http://127.0.0.1:8000')return route.abort();
   if(request.method()!=='GET'){mutations++;return route.abort();}
   if(url.pathname==='/api/finance'){
    const response=await route.fetch(),data=await response.json();
    data.expenses=populated?[
     {id:9901,day:'2026-10-21',reference:'Ferramenta fictícia de organização dos relatórios',amount:12,category:'infraestrutura'},
     {id:9902,day:'2026-10-20',reference:'Assinatura demonstrativa para acompanhamento de campanhas e revisão dos relatórios mensais',amount:28,category:'infraestrutura'},
     {id:9903,day:'2026-10-19',reference:'Arquivo de demonstração',amount:5,category:'infraestrutura'}
    ]:[];
    data.current.software_expenses=populated?45:0;
    return route.fulfill({json:data});
   }
   return route.continue();
  });
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const width of [1366,390,320])for(const filled of [false,true]){
   populated=filled;await page.setViewportSize({width,height:844});
   await page.goto('http://127.0.0.1:8000/painel/finance');await page.waitForLoadState('networkidle');
   const group=page.locator('.finance-expenses');
   assert.equal(await group.locator('#expense').count(),1,'Existing expense form stays with its records');
   assert.ok(await group.getByText(filled?'Ferramenta fictícia de organização dos relatórios':'Ainda não há registros.',{exact:true}).isVisible());
   if(filled){
    assert.equal(await group.getByRole('table').count(),1,'Table semantics remain exposed');
    assert.equal(await group.getByRole('columnheader').count(),3,'Headers remain available to assistive technology');
    assert.equal(await group.locator('tbody tr').count(),3);
    for(const row of await group.locator('tbody tr').all()){
     const geometry=await row.evaluate(e=>{
      const cells=[...e.children],r=cells.map(cell=>cell.getBoundingClientRect());
      return {width:e.getBoundingClientRect().width,descriptionWidth:r[1].width,descriptionBottom:r[1].bottom,dateTop:r[0].top,valueTop:r[2].top,overflow:cells.some(cell=>cell.scrollWidth>cell.clientWidth)};
     });
     assert.equal(geometry.overflow,false,'All expense fields fit their assigned area');
     if(width<=600){
      assert.ok(geometry.descriptionWidth>=geometry.width-1,'Description uses the full record width');
      assert.ok(geometry.descriptionBottom<=geometry.dateTop,'Date follows description');
      assert.ok(Math.abs(geometry.dateTop-geometry.valueTop)<1,'Date and value share a metadata row');
     }
    }
   }
   for(const theme of ['light','dark']){
    if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('#theme-toggle').click();
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    await page.screenshot({path:`${directory}/${filled?'populated':'empty'}-${theme}-${width}.png`,fullPage:true});
   }
   await group.getByText('Adicionar despesa',{exact:true}).click();
   assert.ok(await page.getByRole('button',{name:'Salvar despesa',exact:true}).isVisible());
   assert.equal(await page.locator('#expense [name=reference]').getAttribute('maxlength'),'100');
   assert.equal(await page.locator('#expense [name=amount]').getAttribute('min'),'0.01');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  }
  assert.equal(mutations,0);assert.deepEqual(errors,[]);
  const result={captures:12,states:['empty','three synthetic expenses'],widths:[1366,390,320],themes:2,tableSemanticsPreserved:true,mobileFullWidthDescriptions:true,formConstraintsPreserved:true,mutations,errors};
  fs.writeFileSync(`${directory}/results.json`,JSON.stringify(result,null,2));console.log(JSON.stringify(result));
 }finally{await browser.close();}
})().catch(error=>{console.error(error.message);process.exitCode=1});
