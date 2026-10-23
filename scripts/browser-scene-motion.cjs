// Presentation QA with synthetic API responses and read-only HTML/static requests.
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require('playwright');
const origin=new URL(process.env.TEST_ORIGIN||'http://127.0.0.1:8000').origin;
assert.ok(['127.0.0.1','localhost','[::1]'].includes(new URL(origin).hostname),'Local server only');
const output=process.env.MOTION_OUTPUT||'output/design-review/design-engineering-v1/motion';
const channel=process.env.MOTION_CHANNEL||'msedge';
const navigationOnly=process.env.MOTION_NAVIGATION_ONLY==='1';
const sources=['app/static/app.js','app/static/scene.js','app/static/arc.css','app/static/style.css','app/static/tokens.css','app/templates/_workspace_scene.html','app/templates/dashboard.html','scripts/browser-scene-motion.cjs'];
const hashes=()=>Object.fromEntries(sources.map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')]));
const beforeHashes=hashes();
const metric={rows:1,days:1,cost:125,impressions:100,clicks:10,qualified:2,hires:1,contacts:3,appointments:1,conversions:1,ctr:10,cpc:12.5,cpq:62.5,cph:125};
const dashboard={summary:metric,campaigns:{'Campanha sintética':metric},localities:{},keywords:{},evolution:[],budget:{month:'2026-10',planned:2000,spent:125,balance:1875,consumed_percent:6.25,alerts:[]},recommendations:[],ai:{connected:false,insights_ready:false},ai_priorities:[]};
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function state(page){
  return page.locator('.dossier[data-active=true]').evaluate(cover=>({x:cover.style.getPropertyValue('--tilt-x'),y:cover.style.getPropertyValue('--tilt-y'),transform:getComputedStyle(cover.querySelector('.dossier-face')).transform,transition:getComputedStyle(cover.querySelector('.dossier-face')).transitionDuration}));
}
async function dataSnapshot(page){
  return page.evaluate(()=>({links:[...document.querySelectorAll('.dossier')].map(link=>link.getAttribute('href')),data:document.getElementById('content').innerText}));
}
async function point(page){
  await page.locator('.dossier[data-active=true]').scrollIntoViewIfNeeded();
  const box=await page.locator('.dossier[data-active=true]').boundingBox();
  return {x:box.x+box.width*.75,y:box.y+box.height*.3};
}
async function mouseTilt(page){
  const target=await point(page);await page.mouse.move(target.x,target.y,{steps:4});
  await page.waitForFunction(()=>Boolean(document.querySelector('.dossier[data-active=true]').style.getPropertyValue('--tilt-x')));
}
async function idleCheck(page){
  await sleep(260);
  const before=await page.evaluate(()=>({...window.__motionFrames,pending:window.__motionPending.size}));
  await sleep(320);
  const after=await page.evaluate(()=>({...window.__motionFrames,pending:window.__motionPending.size}));
  assert.equal(after.requested,before.requested,'No idle requestAnimationFrame loop');
  assert.equal(after.executed,before.executed,'No idle animation callback');
  assert.equal(after.pending,0);
  return after;
}
async function navigateWithTransition(page,mode){
  page.__motionPhase=mode;
  const href=await page.locator('[data-scene-open]').getAttribute('href'),target=new URL(href,origin);
  assert.equal(target.origin,origin);assert.equal(target.pathname,'/painel/campaigns');
  assert.equal(target.searchParams.get('scope'),'demo');
  assert.ok(target.searchParams.get('start')&&target.searchParams.get('end'),'Applied date context retained');
  await Promise.all([page.waitForURL(target.href),page.locator('[data-scene-open]').click()]);
  await page.waitForFunction(()=>document.getElementById('content').getAttribute('aria-busy')==='false');
  let eventTimeout=null;
  try{await page.waitForFunction(()=>window.__documentReveal?.eventObserved,{},{timeout:2000});}catch(error){eventTimeout=error.message;}
  const observed=await page.evaluate(()=>window.__documentReveal);
  if(observed?.hasTransition){
    await page.waitForFunction(()=>window.__documentReveal.finished||window.__documentReveal.finishError,{},{timeout:3000});
  }
  assert.equal(await page.locator('body').getAttribute('data-page'),'campaigns');
  assert.equal(await page.locator('#title').innerText(),'Campanhas');
  return {mode,destination:target.pathname+target.search,eventTimeout,...(await page.evaluate(()=>window.__documentReveal)),
    fallback:observed?.hasTransition?null:'Native navigation worked; browser did not provide a ViewTransition in pagereveal.'};
}
(async()=>{
  const env=Object.fromEntries(fs.readFileSync('.env','utf8').split(/\r?\n/).filter(line=>line.includes('=')).map(line=>[line.slice(0,line.indexOf('=')),line.slice(line.indexOf('=')+1)]));
  fs.mkdirSync(output,{recursive:true});
  const browser=await chromium.launch({channel,headless:process.env.MOTION_HEADED!=='1'});
  const checks=[],errors=[],unexpected=[],transitionEvents=[],requests=[];
  const browserVersion=browser.version();let failure=null;
  try{
    async function setup(width,theme,touch=false){
      const context=await browser.newContext({viewport:{width,height:900},hasTouch:touch,isMobile:touch,reducedMotion:'no-preference',httpCredentials:{username:'admin',password:env.ADMIN_PASSWORD}});
      await context.exposeBinding('__recordTransition',(source,event)=>transitionEvents.push({width,theme,touch,phase:source.page.__motionPhase||'setup',...event}));
      await context.addInitScript(theme=>{
        localStorage.setItem('lg-scope','demo');localStorage.setItem('lg-theme',theme);
        window.__documentReveal={eventObserved:false,hasTransition:false,ready:false,finished:false};
        const reason=error=>({name:error?.name||typeof error,message:error?.message||String(error)});
        const record=event=>{window.__recordTransition({path:location.pathname,time:performance.now(),...event}).catch(()=>{});};
        const observe=(transition,state,eventName)=>{
          transition.ready.then(()=>{state.ready=true;state.animationDuration=getComputedStyle(document.documentElement,'::view-transition-new(root)').animationDuration;state.animationName=getComputedStyle(document.documentElement,'::view-transition-new(root)').animationName;record({event:eventName,promise:'ready',status:'resolved',animationDuration:state.animationDuration,animationName:state.animationName});},error=>{state.readyError=reason(error);record({event:eventName,promise:'ready',status:'rejected',reason:reason(error)});});
          transition.finished.then(()=>{state.finished=true;record({event:eventName,promise:'finished',status:'resolved'});},error=>{state.finishError=reason(error);record({event:eventName,promise:'finished',status:'rejected',reason:reason(error)});});
        };
        window.addEventListener('pageswap',event=>{
          record({event:'pageswap',hasTransition:Boolean(event.viewTransition)});
          if(event.viewTransition)observe(event.viewTransition,{},'pageswap');
        });
        window.addEventListener('pagereveal',event=>{
          const state=window.__documentReveal;
          state.eventObserved=true;state.hasTransition=Boolean(event.viewTransition);
          state.reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
          state.visibility=document.visibilityState;state.documentReady=document.readyState;
          state.stylesheets=[...document.styleSheets].map(sheet=>({href:sheet.href?new URL(sheet.href).pathname:null,disabled:sheet.disabled}));
          record({event:'pagereveal',hasTransition:state.hasTransition,reducedMotion:state.reducedMotion,visibility:state.visibility,documentReady:state.documentReady,stylesheets:state.stylesheets});
          if(event.viewTransition){
            observe(event.viewTransition,state,'pagereveal');
            if(sessionStorage.getItem('motion-test-skip')==='1'){
              sessionStorage.removeItem('motion-test-skip');state.testRequestedSkip=true;
              event.viewTransition.skipTransition();record({event:'test-skipTransition'});
            }
          }
        });
        const request=window.requestAnimationFrame.bind(window),cancel=window.cancelAnimationFrame.bind(window);
        window.__motionFrames={requested:0,executed:0,cancelled:0};window.__motionPending=new Set();
        window.requestAnimationFrame=callback=>{
          window.__motionFrames.requested++;
          const id=request(time=>{window.__motionPending.delete(id);window.__motionFrames.executed++;callback(time);});
          window.__motionPending.add(id);return id;
        };
        window.cancelAnimationFrame=id=>{if(window.__motionPending.delete(id))window.__motionFrames.cancelled++;cancel(id);};
      },theme);
      await context.route('**/*',route=>{
        const request=route.request(),url=new URL(request.url());
        if(url.origin!==origin||request.method()!=='GET'){unexpected.push('Blocked external/mutation');return route.abort();}
        if(url.pathname==='/api/dashboard'){requests.push({method:request.method(),path:url.pathname,query:url.search});return route.fulfill({json:dashboard});}
        if(url.pathname.startsWith('/api/')){unexpected.push('Unmocked API '+url.pathname);return route.abort();}
        return route.continue();
      });
      const page=await context.newPage();page.on('pageerror',error=>errors.push({width,theme,phase:page.__motionPhase||'setup',path:new URL(page.url()).pathname,name:error.name,message:error.message}));
      await page.goto(origin+'/painel/overview');
      await page.locator('.scene-ready').waitFor();
      await page.waitForFunction(()=>document.getElementById('content').getAttribute('aria-busy')==='false');
      await page.evaluate(()=>document.fonts.ready);await sleep(350);
      return {context,page};
    }
    for(const width of [1366,390])for(const theme of ['light','dark']){
      const {context,page}=await setup(width,theme);
      if(navigationOnly){
        const normalNavigation=await navigateWithTransition(page,'normal');
        await page.emulateMedia({reducedMotion:'reduce'});
        await page.goto(origin+'/painel/overview');await page.locator('.scene-ready').waitFor();
        await page.waitForFunction(()=>document.getElementById('content').getAttribute('aria-busy')==='false');
        const reducedNavigation=await navigateWithTransition(page,'reduce');
        await page.emulateMedia({reducedMotion:'no-preference'});
        await page.goto(origin+'/painel/overview');await page.locator('.scene-ready').waitFor();
        await page.waitForFunction(()=>document.getElementById('content').getAttribute('aria-busy')==='false');
        await page.evaluate(()=>sessionStorage.setItem('motion-test-skip','1'));
        const interruptedNavigation=await navigateWithTransition(page,'explicit-skip-test-only');
        await page.screenshot({path:`${output}/navigation-final-${theme}-${width}.png`});
        checks.push({width,theme,normalNavigation,reducedNavigation,interruptedNavigation});
        await context.close();continue;
      }
      assert.equal(await page.evaluate(()=>matchMedia('(hover: hover) and (pointer: fine)').matches),true);
      const original=await dataSnapshot(page),initial=await state(page);
      assert.deepEqual(original.links.map(link=>new URL(link,origin).pathname),['/painel/finance','/painel/reports','/painel/campaigns','/painel/insights','/painel/strategy']);
      const idleInitial=await idleCheck(page);
      await page.screenshot({path:`${output}/initial-${theme}-${width}.png`});
      await mouseTilt(page);
      await page.screenshot({path:`${output}/pointer-during-${theme}-${width}.png`});
      await sleep(230);
      const tilted=await state(page);
      assert.ok(Math.abs(parseFloat(tilted.x))>0&&Math.abs(parseFloat(tilted.x))<=3);
      assert.ok(Math.abs(parseFloat(tilted.y))>0&&Math.abs(parseFloat(tilted.y))<=2);
      assert.notEqual(tilted.transform,initial.transform,'Actual computed face transform changes');
      assert.deepEqual(await dataSnapshot(page),original,'Tilt must not mutate links or business data');
      await page.screenshot({path:`${output}/pointer-settled-${theme}-${width}.png`});
      const idleTilted=await idleCheck(page);
      await page.mouse.move(1,1);await sleep(240);
      assert.equal((await state(page)).x,'');assert.equal((await state(page)).y,'');
      assert.equal((await state(page)).transform,initial.transform,'Pointer leave restores initial face');
      await page.screenshot({path:`${output}/reset-final-${theme}-${width}.png`});
      await mouseTilt(page);
      await page.keyboard.press('Tab');await page.locator('.dossier[data-active=true]').focus();
      assert.equal((await state(page)).x,'');
      assert.equal((await state(page)).transform,'none','Keyboard focus disables face motion');
      const focusFrames=await page.evaluate(()=>window.__motionFrames.requested);
      const target=await point(page);await page.mouse.move(target.x-15,target.y+10);
      await sleep(80);assert.equal((await state(page)).x,'');
      assert.equal(await page.evaluate(()=>window.__motionFrames.requested),focusFrames,'Focus-visible guard schedules no tilt');
      await page.screenshot({path:`${output}/keyboard-focus-${theme}-${width}.png`});
      await page.evaluate(()=>document.activeElement.blur());await page.mouse.move(1,1);await mouseTilt(page);
      await page.emulateMedia({reducedMotion:'reduce'});await sleep(80);
      assert.equal((await state(page)).x,'');assert.equal((await state(page)).transform,'none');
      assert.equal((await state(page)).transition,'0s');
      const reduceFrames=await page.evaluate(()=>window.__motionFrames.requested);
      await page.mouse.move(target.x-20,target.y-15);await sleep(80);
      assert.equal((await state(page)).x,'');assert.equal(await page.evaluate(()=>window.__motionFrames.requested),reduceFrames);
      await page.screenshot({path:`${output}/reduced-motion-${theme}-${width}.png`});
      assert.deepEqual(await dataSnapshot(page),original);
      const support=await page.evaluate(()=>({viewTransition:CSS.supports('view-transition-name','root'),transitionDuration:getComputedStyle(document.documentElement,'::view-transition-new(root)').animationDuration}));
      await page.emulateMedia({reducedMotion:'no-preference'});
      const normalNavigation=await navigateWithTransition(page,'normal');
      await page.emulateMedia({reducedMotion:'reduce'});
      await page.goto(origin+'/painel/overview');await page.locator('.scene-ready').waitFor();
      await page.waitForFunction(()=>document.getElementById('content').getAttribute('aria-busy')==='false');
      const reducedNavigation=await navigateWithTransition(page,'reduce');
      checks.push({width,theme,pointer:'mouse',initial,tilted,reset:true,focusReset:true,reducedMotionReset:true,linksAndDataPreserved:true,idleInitial,idleTilted,nativeTransitionSupport:support,normalNavigation,reducedNavigation});
      await context.close();

      const touchSetup=await setup(width,theme,true),touchPage=touchSetup.page;
      assert.equal(await touchPage.evaluate(()=>matchMedia('(pointer: coarse)').matches),true);
      const touchOriginal=await dataSnapshot(touchPage),touchPoint=await point(touchPage);
      const cdp=await touchSetup.context.newCDPSession(touchPage);
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[touchPoint]});
      await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:touchPoint.x+30,y:touchPoint.y+25}]});
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      await sleep(240);
      assert.equal(new URL(touchPage.url()).pathname,'/painel/overview','A touch swipe does not activate the link');
      assert.equal((await state(touchPage)).x,'');assert.equal((await state(touchPage)).y,'');
      await touchPage.mouse.move(touchPoint.x,touchPoint.y);await sleep(80);
      assert.equal((await state(touchPage)).x,'','Coarse pointer media also blocks synthetic mouse');
      assert.deepEqual(await dataSnapshot(touchPage),touchOriginal);
      const idleTouch=await idleCheck(touchPage);
      await touchPage.screenshot({path:`${output}/touch-no-tilt-${theme}-${width}.png`});
      checks.push({width,theme,pointer:'touch-emulation',touchSwipe:true,noTilt:true,linksAndDataPreserved:true,idleTouch});
      await touchSetup.context.close();
    }
    const fallbackContext=await browser.newContext({javaScriptEnabled:false,httpCredentials:{username:'admin',password:env.ADMIN_PASSWORD}});
    await fallbackContext.route('**/*',route=>{
      const request=route.request(),url=new URL(request.url());
      if(url.origin!==origin||request.method()!=='GET'||url.pathname.startsWith('/api/')){unexpected.push('Unexpected no-JS request');return route.abort();}
      return route.continue();
    });
    const fallbackPage=await fallbackContext.newPage();await fallbackPage.goto(origin+'/painel/overview');
    await Promise.all([fallbackPage.waitForURL(origin+'/painel/campaigns'),fallbackPage.locator('.dossier[href="/painel/campaigns"]').click()]);
    assert.equal(await fallbackPage.locator('body').getAttribute('data-page'),'campaigns');
    await fallbackContext.close();
    checks.push({noJavascriptNativeLink:true});
    assert.deepEqual(unexpected,[]);
  }catch(error){failure={name:error.name,message:error.message};}
  finally{
    await browser.close();
    const result={channel,browserVersion,headless:process.env.MOTION_HEADED!=='1',navigationOnly,checks,failure,jsErrors:errors,transitionEvents,requests,unexpectedRequests:unexpected,realMutations:0,providerRequests:0,changedDuringRun:sources.filter(file=>beforeHashes[file]!==hashes()[file]),limitations:['All pageerror events are retained verbatim; no generic error is silently suppressed.','Promise rejections are observed by test-only handlers; this changes unhandled-rejection reporting and is not a production fix.','Touch uses Chromium device emulation/CDP, not physical hardware.','Cross-document navigation records pagereveal and ready/finished separately: finished alone is not proof that an animation ran.','Explicit skipTransition is a controlled test interruption, not a real user navigating twice.','DOM promises from a document that is destroyed may not reach the test recorder.','Routing disables the browser HTTP cache; timing differs from ordinary browsing.','Idle RAF counters observe application JavaScript over bounded intervals, not browser compositor frames.']};
    fs.writeFileSync(output+'/results.json',JSON.stringify(result,null,2));
    fs.writeFileSync(output+'/manifest.json',JSON.stringify({generatedAt:new Date().toISOString(),before:beforeHashes,after:hashes()},null,2));
    console.log(JSON.stringify({channel,browserVersion,checks:checks.length,failure,jsErrors:errors,transitionEventCount:transitionEvents.length,mockedGETs:requests.length,unexpected:unexpected.length,output}));
    if(failure||errors.length||unexpected.length)process.exitCode=1;
  }
})().catch(error=>{console.error(error.message);process.exit(1);});
