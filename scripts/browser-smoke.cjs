// Execute with Playwright installed. Credentials are read locally and never printed.
const fs = require('node:fs');
const {chromium} = require('playwright');
(async()=>{
  const env=Object.fromEntries(fs.readFileSync('.env','utf8').split(/\r?\n/).filter(l=>l.includes('=')).map(l=>[l.slice(0,l.indexOf('=')),l.slice(l.indexOf('=')+1)]));
  const browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||'msedge'});
  const context=await browser.newContext({httpCredentials:{username:'admin',password:env.ADMIN_PASSWORD},viewport:{width:1440,height:1000}});
  const page=await context.newPage();const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  // Isolate browser tests from a key the user may have connected meanwhile.
  let connected=false;
  await page.route('**/api/dashboard?*',async route=>{const response=await route.fetch();const body=await response.json();body.ai.connected=connected;body.ai.insights_ready=false;body.ai.connections={openai:{name:'OpenAI',connected},claude:{name:'Claude',connected:false}};await route.fulfill({json:body});});
  await page.route('**/api/settings?*',async route=>{const response=await route.fetch();const body=await response.json();body.ai.connected=connected;body.ai.insights_ready=false;body.ai.connections={openai:{name:'OpenAI',connected},claude:{name:'Claude',connected:false}};await route.fulfill({json:body});});
  await page.goto('http://127.0.0.1:8000');
  await page.locator('#scope').selectOption('demo');
  await page.locator('.metrics').waitFor();
  await page.screenshot({path:'tmp/dashboard-desktop.png',fullPage:true});
  for(const route of ['campaigns','market','agents','finance','reports','settings','insights']){
    await page.goto('http://127.0.0.1:8000/painel/'+route);
    await page.locator('#content section, #content details').first().waitFor();
    if(await page.locator('#message').innerText())throw Error(await page.locator('#message').innerText());
  }
  await page.goto('http://127.0.0.1:8000/painel/agents');
  await page.locator('#analyze').click();
  await page.getByText('Resultados revisados. Confira as recomendações.',{exact:true}).waitFor();
  await page.getByText('Conferir um texto antes de publicar',{exact:true}).click();
  await page.locator('textarea').fill('Resultado garantido em todos os processos');
  await page.getByRole('button',{name:'Verificar texto'}).click();
  await page.locator('#review-result h3').waitFor();
  if(!(await page.locator('#review-result').innerText()).includes('Promessa de resultado'))throw Error('Conformidade sem alerta');
  await page.setViewportSize({width:390,height:844});
  await page.goto('http://127.0.0.1:8000');
  await page.locator('.metrics').waitFor();
  await page.screenshot({path:'tmp/dashboard-mobile.png',fullPage:true});
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth);
  if(overflow)throw Error('Overflow horizontal mobile');
  await page.locator('#scope').selectOption('real');
  await page.locator('#banner').waitFor({state:'hidden'});
  await page.goto('http://127.0.0.1:8000/painel/settings');
  await page.locator('#ai-connect').waitFor();
  await page.screenshot({path:'tmp/settings-mobile.png',fullPage:true});
  await page.setViewportSize({width:1440,height:1000});
  await page.screenshot({path:'tmp/settings-desktop.png',fullPage:true});
  if(await page.locator('#api-key').getAttribute('type')!=='password')throw Error('Key field is not masked');
  // Frontend connection states are tested with intercepted local endpoints, never a real key.
  const fakeKey=require('node:crypto').randomBytes(24).toString('hex');
  let connectAttempts=0;
  await page.route('**/api/ai/connect',async route=>{
    const body=route.request().postDataJSON();
    if(body.api_key!==fakeKey)throw Error('Key was not submitted');
    connectAttempts++;
    if(connectAttempts===1){await route.fulfill({status:422,json:{detail:'A chave não foi aceita.'}});return;}
    connected=true;
    await route.fulfill({json:{connected:true}});
  });
  await page.route('**/api/ai/disconnect*',async route=>{connected=false;await route.fulfill({json:{connected:false}});});
  await page.locator('#api-key').fill(fakeKey);
  await page.getByRole('button',{name:'Mostrar',exact:true}).click();
  await page.getByRole('button',{name:'Testar e conectar',exact:true}).click();
  await page.getByText('A chave não foi aceita.',{exact:true}).waitFor();
  if(await page.locator('#api-key').inputValue())throw Error('Key remained after failure');
  if(await page.locator('#api-key').getAttribute('type')!=='password')throw Error('Key no longer masked after failure');
  await page.getByRole('button',{name:'Mostrar',exact:true}).waitFor();
  await page.locator('#api-key').fill(fakeKey);
  await page.getByRole('button',{name:'Testar e conectar',exact:true}).click();
  await page.getByText('Conexão salva. Acesse Insights de IA para analisar e revisar.',{exact:true}).waitFor();
  if(await page.locator('#api-key').inputValue())throw Error('Key remained populated');
  if((await page.content()).includes(fakeKey))throw Error('Key exposed in HTML');
  if(await page.evaluate(key=>JSON.stringify(localStorage).includes(key)||JSON.stringify(sessionStorage).includes(key),fakeKey))throw Error('Key saved in browser storage');
  await page.goto('http://127.0.0.1:8000/painel/agents');
  await page.route('**/api/analyze?*',route=>route.fulfill({status:502,json:{detail:'A IA não respondeu. As recomendações locais continuam disponíveis.'}}));
  await page.getByRole('button',{name:'Analisar com IA',exact:true}).click();
  await page.getByText('A IA não respondeu. As recomendações locais continuam disponíveis.',{exact:true}).waitFor();
  await page.locator('#content .panel').first().waitFor();
  await page.goto('http://127.0.0.1:8000/painel/settings');
  await page.getByRole('button',{name:'Desconectar OpenAI',exact:true}).click();
  await page.getByText('Chave removida desta conexão.',{exact:true}).waitFor();
  if(errors.length)throw Error(errors.join('; '));
  console.log(JSON.stringify({pages:8,desktop:true,mobile:true,analysis:true,compliance:true,scopeSwitch:true,connectionUI:'mocked error, success and disconnect',providerFailureKeepsDashboard:true,keyNotStoredInBrowser:true,jsErrors:errors.length}));
  await browser.close();
})().catch(e=>{console.error(e.message);process.exit(1)});
