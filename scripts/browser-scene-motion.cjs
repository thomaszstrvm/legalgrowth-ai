// Presentation QA with synthetic API responses and read-only HTML/static requests.
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require('playwright');
const origin=process.env.TEST_ORIGIN||'http://127.0.0.1:8000';
const output=process.env.MOTION_OUTPUT||'output/design-review/design-engineering-v1/motion';
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
  assert.equal(await page.locator('[data-scene-open]').getAttribute('href'),origin+'/painel/campaigns');
  await Promise.all([page.waitForURL(origin+'/painel/campaigns'),page.locator('[data-scene-open]').click()]);
  await page.waitForFunction(()=>document.getElementById('content').getAttribute('aria-busy')==='false');
  await page.waitForFunction(()=>window.__documentReveal?.eventObserved,{},{timeout:2000}).catch(()=>{});
  const observed=await page.evaluate(()=>window.__documentReveal);
  if(observed?.hasTransition){
    await page.waitForFunction(()=>window.__documentReveal.finished||window.__documentReveal.finishError,{},{timeout:3000});
    assert.equal(await page.evaluate(()=>window.__documentReveal.finished),true,'Observed transition reaches finished');
  }
  assert.equal(await page.locator('body').getAttribute('data-page'),'campaigns');
  assert.equal(await page.locator('#title').innerText(),'Campanhas');
  return {mode,destination:'/painel/campaigns',...(await page.evaluate(()=>window.__documentReveal)),
    fallback:observed?.hasTransition?null:'Native navigation worked; browser did not provide a ViewTransition in pagereveal.'};
}
(async()=>{
  const env=Object.fromEntries(fs.readFileSync('.env','utf8').split(/\r?\n/).filter(line=>line.includes('=')).map(line=>[line.slice(0,line.indexOf('=')),line.slice(line.indexOf('=')+1)]));
  fs.mkdirSync(output,{recursive:true});
  const browser=await chromium.launch({channel:'msedge',headless:true});
  const checks=[],errors=[],unexpected=[],transitionWarnings=[];
  try{
    async function setup(width,theme,touch=false){
      const context=await browser.newContext({viewport:{width,height:900},hasTouch:touch,isMobile:touch,reducedMotion:'no-preference',httpCredentials:{username:'admin',password:env.ADMIN_PASSWORD}});
      await context.addInitScript(theme=>{
        localStorage.setItem('lg-scope','demo');localStorage.setItem('lg-theme',theme);
        window.__documentReveal={eventObserved:false,hasTransition:false,ready:false,finished:false};
        window.addEventListener('pagereveal',event=>{
          const state=window.__documentReveal;
          state.eventObserved=true;state.hasTransition=Boolean(event.viewTransition);
          state.reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
          if(event.viewTransition){
            event.viewTransition.ready.then(()=>{
              state.ready=true;state.animationDuration=getComputedStyle(document.documentElement,'::view-transition-new(root)').animationDuration;
            }).catch(()=>{state.readyError=true;});
            event.viewTransition.finished.then(()=>{state.finished=true;}).catch(()=>{state.finishError=true;});
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
        if(url.pathname==='/api/dashboard')return route.fulfill({json:dashboard});
        if(url.pathname.startsWith('/api/')){unexpected.push('Unmocked API '+url.pathname);return route.abort();}
        return route.continue();
      });
      const page=await context.newPage();page.on('pageerror',error=>{
        // Chromium can abort a document transition during context/navigation teardown.
        // Keep this exact lifecycle rejection visible, rather than classifying it as app JS.
        if(error.message==='Transition was aborted because of invalid state. ViewTransition opt-in disabled')
          transitionWarnings.push({width,theme,url:page.url(),message:error.message});
        else errors.push(error.message);
      });
      await page.goto(origin+'/painel/overview');
      await page.locator('.scene-ready').waitFor();
      await page.waitForFunction(()=>document.getElementById('content').getAttribute('aria-busy')==='false');
      await page.evaluate(()=>document.fonts.ready);await sleep(350);
      return {context,page};
    }
    for(const width of [1366,390])for(const theme of ['light','dark']){
      const {context,page}=await setup(width,theme);
      assert.equal(await page.evaluate(()=>matchMedia('(hover: hover) and (pointer: fine)').matches),true);
      const original=await dataSnapshot(page),initial=await state(page);
      assert.deepEqual(original.links,['/painel/finance','/painel/reports','/painel/campaigns','/painel/insights','/painel/strategy']);
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
      assert.equal(touchPage.url(),origin+'/painel/overview','A touch swipe does not activate the link');
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
    assert.deepEqual(errors,[]);assert.deepEqual(unexpected,[]);
    const result={checks,noJavascriptNativeLink:true,jsErrors:errors,transitionWarnings,unexpectedRequests:unexpected,realMutations:0,providerRequests:0,limitations:['Touch uses Chromium device emulation/CDP, not physical hardware.','During-motion screenshots sample the transition; frame time is not guaranteed.','Cross-document navigation records pagereveal/ViewTransition completion or explicit native fallback; exact timing and perceived visual quality are not certified.','Exact Chromium opt-in-disabled transition rejections are reported separately; they are not proof of a completed animation.','Idle RAF counters observe application JavaScript over bounded intervals, not browser compositor frames.']};
    fs.writeFileSync(output+'/results.json',JSON.stringify(result,null,2));
    const sources=['app/static/scene.js','app/static/arc.css','app/static/style.css','app/static/tokens.css','app/templates/_workspace_scene.html','app/templates/dashboard.html','scripts/browser-scene-motion.cjs'];
    fs.writeFileSync(output+'/manifest.json',JSON.stringify({generatedAt:new Date().toISOString(),sources:Object.fromEntries(sources.map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')]))},null,2));
    console.log(JSON.stringify(result));
  }finally{await browser.close();}
})().catch(error=>{console.error(error.message);process.exit(1);});
