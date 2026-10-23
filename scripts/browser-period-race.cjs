// Regression for applied vs draft period. All APIs, including POSTs, are mocked.
const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const origin='http://127.0.0.1:8000';
const metric={rows:1,cost:100,qualified:2,hires:1,cpq:50,cph:100};
(async()=>{
  const line=fs.readFileSync('.env','utf8').split(/\r?\n/).find(l=>/^ADMIN_PASSWORD=/.test(l));
  const password=line.slice(line.indexOf('=')+1).trim().replace(/^(['"])(.*)\1$/,'$2');
  const browser=await chromium.launch({channel:'msedge',headless:true});
  const requests=[],unexpected=[],errors=[];
  let delayed=true,fail=false,release;const gate=new Promise(resolve=>release=resolve);
  try{
    const context=await browser.newContext({httpCredentials:{username:'admin',password},reducedMotion:'reduce'});
    await context.addInitScript(()=>{
      if(!sessionStorage.getItem('lg-period-real'))sessionStorage.setItem('lg-period-real',JSON.stringify({start:'2026-07-01',end:'2026-07-31'}));
    });
    await context.route('**/*',async route=>{
      const req=route.request(),u=new URL(req.url());
      if(u.origin!==origin){unexpected.push('External');return route.abort();}
      if(u.pathname.startsWith('/api/')){
        requests.push({path:u.pathname,method:req.method(),query:Object.fromEntries(u.searchParams)});
        if(req.method()==='POST'){
          if(['/api/analyze','/api/insights'].includes(u.pathname))return route.fulfill({json:{message:'Operação sintética.'}});
          unexpected.push('Unexpected POST');return route.abort();
        }
        if(req.method()!=='GET'){unexpected.push('Unexpected method');return route.abort();}
        if(u.pathname==='/api/dashboard'){
          if(delayed)await gate;
          if(fail)return route.fulfill({status:503,json:{detail:'Falha transitória sintética.'}});
          return route.fulfill({json:{start:u.searchParams.get('start'),end:u.searchParams.get('end'),summary:metric,campaigns:{['Dados sintéticos '+u.searchParams.get('start')]:metric},localities:{},keywords:{},evolution:[],recommendations:[],ai_priorities:[],ai:{connected:true,insights_ready:true}}});
        }
        if(u.pathname==='/api/executions')return route.fulfill({json:{executions:[]}});
        if(u.pathname==='/api/insights')return route.fulfill({json:{latest:null}});
        if(u.pathname==='/api/finance'){
          const budget={month:u.searchParams.get('month'),planned:1000,spent:0,balance:1000,consumed_percent:0,alerts:[],allocations:{trabalhista:1000},imported_ads:0,manual_expenses:0,software_expenses:0};
          return route.fulfill({json:{current:budget,previous:{...budget,month:'2026-08'},expenses:[]}});
        }
        unexpected.push('Unmocked API '+u.pathname);return route.abort();
      }
      if(req.method()!=='GET'){unexpected.push('Unexpected mutation');return route.abort();}
      return route.continue();
    });
    const p=await context.newPage();p.setDefaultTimeout(5000);p.on('pageerror',error=>errors.push(error.message));
    const ready=()=>p.waitForFunction(()=>document.querySelector('#content')?.getAttribute('aria-busy')==='false');
    const open=async()=>{if(!await p.locator('.period-picker').evaluate(e=>e.open))await p.locator('.period-picker summary').click();};
    const draft=async(start,end)=>{await open();await p.locator('#start').fill(start);await p.locator('#end').fill(end);};
    const navigate=async name=>{await p.locator('#main-nav a[href*="/painel/'+name+'"]').click();await ready();};
    await p.goto(origin+'/painel/campaigns?scope=demo&start=2026-09-01&end=2026-09-30&area=trabalhista');
    await draft('2026-08-01','2026-08-31');await p.locator('#area').selectOption('previdenciario');delayed=false;release();await ready();
    assert.equal(new URL(p.url()).searchParams.get('start'),'2026-09-01');
    assert.equal(new URL(p.url()).searchParams.get('area'),'trabalhista');
    assert.match(await p.locator('.campaign-desktop').innerText(),/Dados sintéticos 2026-09-01/);
    assert.match(await p.locator('#period-label').innerText(),/01\/09\/2026/);
    assert.equal(await p.locator('#start').inputValue(),'2026-08-01','Draft remains editable');
    assert.equal(await p.evaluate(()=>JSON.parse(sessionStorage.getItem('lg-period-demo')).start),'2026-09-01');
    assert.equal(await p.evaluate(()=>params().get('area')),'trabalhista');
    await navigate('agents');assert.equal(new URL(p.url()).searchParams.get('start'),'2026-09-01');assert.equal(new URL(p.url()).searchParams.has('area'),false);
    await draft('2026-08-01','2026-08-31');await p.locator('.period-picker summary').click();await p.locator('#analyze').click();await ready();
    assert.equal(requests.find(r=>r.path==='/api/analyze'&&r.method==='POST').query.start,'2026-09-01');
    await navigate('insights');await draft('2026-08-01','2026-08-31');await p.locator('.period-picker summary').click();await p.locator('#insight-form button').click();await ready();
    assert.equal(requests.find(r=>r.path==='/api/insights'&&r.method==='POST').query.start,'2026-09-01');
    await p.locator('#scope').selectOption('real');await ready();assert.equal(await p.locator('#start').inputValue(),'2026-07-01');
    await p.locator('#scope').selectOption('demo');await ready();assert.equal(await p.locator('#start').inputValue(),'2026-09-01');
    fail=true;await draft('2026-08-01','2026-08-31');await p.locator('#refresh').click();await p.locator('#retry-load').waitFor();
    fail=false;await p.goBack();await ready();assert.equal(await p.locator('#message').innerText(),'');assert.equal(await p.locator('#start').inputValue(),'2026-09-01');
    await navigate('finance');assert.equal(await p.locator('#finance-month').inputValue(),'2026-09');
    await p.locator('#finance-month').fill('2026-08');await p.locator('#finance-month').dispatchEvent('change');await ready();
    assert.equal(requests.filter(r=>r.path==='/api/finance').at(-1).query.month,'2026-08');
    await navigate('campaigns');assert.equal(await p.locator('#start').inputValue(),'2026-09-01','Financial month never overwrites analytical period');
    const before=requests.length;await draft('2026-10-20','2026-10-01');await p.locator('#refresh').click();
    assert.equal(requests.length,before);assert.equal(await p.locator('#retry-load').count(),0);assert.equal(await p.locator('.period-picker').evaluate(e=>e.open),true);
    assert.equal(new URL(p.url()).searchParams.get('start'),'2026-09-01','Invalid draft does not replace applied URL');
    assert.deepEqual(unexpected,[]);assert.deepEqual(errors,[]);
    console.log(JSON.stringify({delayedGetDraftRace:true,areaSnapshot:true,linksUseApplied:true,postAnalyzeUsesApplied:true,postInsightsUsesApplied:true,scopeIsolation:true,backClearsError:true,monthSeparate:true,invalidDraftBlocked:true,mockedPosts:requests.filter(r=>r.method==='POST').length,realApiRequests:0,unexpected,errors}));
    await context.close();
  }finally{await browser.close();}
})().catch(error=>{console.error(error.stack);process.exitCode=1;});
