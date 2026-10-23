const fs = require('node:fs');
const assert = require('node:assert/strict');
const {chromium} = require('playwright');
(async () => {
  const env = Object.fromEntries(fs.readFileSync('.env', 'utf8').split(/\r?\n/).filter(l => l.includes('=')).map(l => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]));
  const browser = await chromium.launch({channel: 'msedge', headless: true});
  const output = process.env.SCENE_OUTPUT || 'output/design-review/arc-scene';
  fs.mkdirSync(output, {recursive: true});
  fs.mkdirSync('output/design-review/portfolio-refinement', {recursive: true});
  let blockedMutations = 0, failDashboard = false;
  const errors = [], checks = [], measurements = [];
  try {
    const context = await browser.newContext({httpCredentials: {username:'admin', password:env.ADMIN_PASSWORD}, reducedMotion:'reduce'});
    await context.addInitScript(() => {localStorage.setItem('lg-scope', 'demo'); localStorage.setItem('lg-theme', 'light');});
    await context.route('**/*', route => {
      const req = route.request();
      if (new URL(req.url()).origin !== 'http://127.0.0.1:8000') return route.abort();
      if (failDashboard && new URL(req.url()).pathname === '/api/dashboard') return route.fulfill({status:503,json:{detail:'Falha sintética de teste'}});
      if (req.method() !== 'GET') {blockedMutations++; return route.abort();}
      return route.continue();
    });
    const page = await context.newPage();
    page.on('pageerror', e => errors.push(e.message));
    for (const width of [1920,1366,768,390,320]) {
      await page.setViewportSize({width,height:width > 1000 ? 768 : 844});
      await page.goto('http://127.0.0.1:8000/painel/overview');
      await page.waitForLoadState('networkidle');
      await page.locator('.scene-ready').waitFor();
      for (const theme of ['light','dark']) {
        if (await page.locator('html').getAttribute('data-theme') !== theme) await page.locator('#theme-toggle').click();
        await page.evaluate(()=>{document.activeElement?.blur();scrollTo(0,0);});
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `No overflow ${width}/${theme}`);
        const hierarchy = await page.evaluate(() => {
          const scene = document.querySelector('.workspace-scene').getBoundingClientRect();
          return {sceneHeight:scene.height, sceneTop:scene.top, sceneBottom:scene.bottom, resultTop:document.querySelector('.page-header').getBoundingClientRect().top, viewport:innerHeight,
            coverBottom:document.querySelector('.dossier[data-active=true]').getBoundingClientRect().bottom,
            captionBottom:document.querySelector('.scene-caption a').getBoundingClientRect().bottom,
            instructionVisible:getComputedStyle(document.querySelector('.scene-instruction')).display !== 'none'};
        });
        assert.ok(hierarchy.sceneTop < 180 && hierarchy.sceneBottom < hierarchy.resultTop, 'Editorial scene leads the first screen before results');
        assert.ok(hierarchy.coverBottom < hierarchy.viewport && hierarchy.captionBottom < hierarchy.viewport, 'Selected cover and opening action fit in first viewport');
        assert.equal(hierarchy.instructionVisible,true);
        assert.ok(hierarchy.resultTop-hierarchy.sceneBottom>=28,'Scene and results have a distinct section interval');
        if(width <= 600) assert.ok(hierarchy.sceneHeight <= 560, `Opening scene at ${width}: ${hierarchy.sceneHeight}`);
        if(width <= 600){
          const sizes=await page.locator('.scene-control').evaluateAll(buttons=>buttons.map(e=>e.getBoundingClientRect().height));
          assert.ok(Math.abs(sizes[0]-sizes[1])<1,'Paired controls keep equal height when a label wraps');
        }
        assert.ok(await page.locator('.workspace-scene + .page-header').count(), 'The scene precedes the unchanged analysis');
        measurements.push({width,theme,...hierarchy});
        await page.screenshot({path:`${output}/overview-${width}-${theme}.png`,fullPage:true});
        await page.screenshot({path:`${output}/opening-${width}-${theme}.png`});
        if (width === 1366 || width === 390 || width === 320) {
          await page.locator('.workspace-scene').screenshot({path:`output/design-review/portfolio-refinement/scene-detail-${theme}-${width}.png`});
          const sceneHeight = await page.locator('.workspace-scene').evaluate(e=>e.getBoundingClientRect().height);
          for(const cover of await page.locator('.dossier').all()){
            await cover.focus();
            assert.ok(Math.abs(await page.locator('.workspace-scene').evaluate(e=>e.getBoundingClientRect().height)-sceneHeight)<1,'Selecting any cover preserves scene height');
            assert.equal(await cover.evaluate(e=>getComputedStyle(e).filter),'none','Perspective must not dim cover text');
            assert.ok(await cover.locator('.dossier-face').evaluate(face=>face.scrollHeight<=face.clientHeight+2),'Cover grid fits all its text');
            const textLayout = await cover.locator('.dossier-face').evaluate(face => {
              const text = [...face.querySelectorAll('.dossier-title,.dossier-imprint,.dossier-subtitle')];
              const clipped = text.filter(e => e.offsetLeft < 0 || e.offsetTop < 0 ||
                e.offsetLeft + e.offsetWidth > face.clientWidth + 1 ||
                e.offsetTop + e.offsetHeight > face.clientHeight + 1 || e.scrollWidth > e.clientWidth + 1);
              const heading = face.querySelector('.dossier-title');
              const footer = face.querySelector('.dossier-subtitle');
              return {clipped:clipped.map(e=>e.className), separated:heading.offsetTop + heading.offsetHeight <= footer.offsetTop};
            });
            assert.deepEqual(textLayout.clipped, [], 'Cover text stays inside its printed face');
            assert.ok(textLayout.separated, 'Cover title and subtitle have separate areas');
            if (await cover.getAttribute('data-title') === 'Campanhas') {
              const inkGap = await cover.evaluate(e => {
                const art = e.querySelector('.dossier-art');
                const ink = art.getBBox(), area = art.getBoundingClientRect();
                const inkBottom = area.top + (ink.y + ink.height) * area.height / art.viewBox.baseVal.height;
                return e.querySelector('.dossier-title').getBoundingClientRect().top - inkBottom;
              });
              assert.ok(inkGap >= 4, `Campaign ink must clear the title box: ${inkGap.toFixed(2)}px`);
              measurements.push({width,theme,campaignInkGap:inkGap});
            }
            const title = await cover.getAttribute('data-title');
            await cover.evaluate(e=>e.blur());
            await page.locator('.workspace-scene').screenshot({path:`${output}/cover-${title}-${width}-${theme}.png`});
          }
          await page.locator('.dossier[data-title="Campanhas"]').focus();
          await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab');
          assert.ok(await page.locator('.dossier[data-active=true]').evaluate(e=>e.matches(':focus-visible')),'Keyboard focus stays visible');
          await page.locator('.workspace-scene').screenshot({path:`${output}/focus-${width}-${theme}.png`});
          await page.locator('[data-scene-next]').hover();
          assert.notEqual(await page.locator('[data-scene-next] > [aria-hidden]').evaluate(e=>getComputedStyle(e).backgroundColor),'rgba(0, 0, 0, 0)','Arrow hover has a theme surface');
          await page.locator('.workspace-scene').screenshot({path:`${output}/hover-${width}-${theme}.png`});
          await page.locator('.dossier[data-title="Campanhas"]').focus();
          await page.locator('.dossier[data-title="Campanhas"]').evaluate(e=>e.blur());
          await page.mouse.move(0,0);
        }
        checks.push(`${width}/${theme}: no document overflow`);
      }
    }
    const active = () => page.locator('.dossier[data-active=true]').getAttribute('data-title');
    await page.locator('.scene-results').click();
    assert.ok(await page.locator('#results').evaluate(e=>Math.abs(e.getBoundingClientRect().top-20)<2),'Results anchor reaches the data header');
    assert.equal(await active(),'Campanhas');
    assert.equal(await page.locator('[data-scene-next]').getAttribute('aria-label'),'Próximo dossiê: Insights de IA');
    assert.equal(await page.locator('[data-scene-prev-title]').textContent(),'Relatórios');
    await page.locator('[data-scene-next]').click(); assert.equal(await active(),'Insights de IA');
    assert.equal(await page.locator('[data-scene-open]').getAttribute('href'),'http://127.0.0.1:8000/painel/insights');
    assert.equal(await page.locator('[data-scene-next-title]').textContent(),'Oportunidades');
    await page.locator('[data-scene-prev]').click(); assert.equal(await active(),'Campanhas');
    await page.locator('.dossier[data-title="Relatórios"]').focus(); assert.equal(await active(),'Relatórios');
    await page.keyboard.press('ArrowRight'); assert.equal(await active(),'Campanhas');
    await page.keyboard.press('End'); assert.equal(await active(),'Oportunidades');
    await page.keyboard.press('ArrowRight'); assert.equal(await active(),'Orçamento');
    await page.keyboard.press('Home'); assert.equal(await active(),'Orçamento');
    const duration = await page.locator('.dossier').first().evaluate(e => getComputedStyle(e).transitionDuration);
    assert.equal(duration,'0s');
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('.dossier').first().evaluate(e=>getComputedStyle(e).transitionDuration),'0s','Keyboard navigation is instant');
    await page.locator('.dossier[data-active=true]').evaluate(e=>e.blur());
    await page.mouse.click(2,2);
    assert.equal(await page.locator('.dossier').first().evaluate(e=>getComputedStyle(e).transitionDuration),'0.28s','Pointer navigation uses a short transition');
    await page.locator('[data-scene-next]').click();
    await page.locator('.dossier[data-active=true]').evaluate(async e => {
      await Promise.all(e.getAnimations().map(animation => animation.finished));
    });
    const centered = await page.locator('.dossier[data-active=true]').boundingBox();
    assert.ok(centered && Math.abs(centered.x + centered.width / 2 - 160) < 2, 'Animated selection settles in the center at 320px');
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.locator('.dossier[data-title="Orçamento"]').focus();
    const palettes=[];
    for(const theme of ['light','dark']){
    if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('#theme-toggle').click();
    const contrast = await page.locator('.workspace-scene').evaluate(scene => {
      const luminance = value => {
        const hex=value.trim().replace('#','');
        const rgb=hex.length===3?[...hex].map(c=>c+c).join(''):hex;
        return [0,2,4].map(i=>parseInt(rgb.slice(i,i+2),16)/255)
          .map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4)
          .reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
      };
      const ratio=(a,b)=>(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
      const style=getComputedStyle(scene), result=[];
      for(const ink of ['--scene-ink','--scene-muted']) result.push(ratio(luminance(style.getPropertyValue(ink)),luminance(style.getPropertyValue('--scene-bg'))));
      for(const cover of scene.querySelectorAll('.dossier')) {
        const c=getComputedStyle(cover);
        result.push(ratio(luminance(c.getPropertyValue('--print')),luminance(c.getPropertyValue('--paper'))));
      }
      return {ratios:result,sceneLuminance:luminance(style.getPropertyValue('--scene-bg')),canvasLuminance:luminance(style.getPropertyValue('--canvas'))};
    });
    assert.ok(contrast.ratios.every(ratio=>ratio>=4.5),'Scene and central-cover palette contrast');
    assert.ok(Math.abs(contrast.sceneLuminance-contrast.canvasLuminance)<.15,'Gallery stays in the canvas tonal range');
    palettes.push({theme,...contrast});
    }
    checks.push('Normal motion settles at center; fourteen scene/cover palette pairs meet 4.5:1; no cover dimming; gallery follows both themes');
    await page.locator('.period-picker summary').click();
    await page.locator('#start').focus(); await page.keyboard.press('ArrowRight'); assert.equal(await active(),'Orçamento');
    await page.locator('#refresh').click();
    await page.waitForFunction(() => document.getElementById('content').getAttribute('aria-busy') === 'false');
    assert.equal(await page.locator('.workspace-scene').count(),1,'Refresh preserves exactly one scene');
    assert.equal(await active(),'Orçamento','Refresh preserves the selected destination');
    assert.equal(await page.locator('.workspace-scene + .page-header').count(),1);
    failDashboard = true;
    await page.locator('.period-picker summary').click();
    await page.locator('#refresh').click();
    await page.locator('#retry-load').waitFor();
    assert.equal(await page.locator('.workspace-scene + .page-header').count(),1,'Error keeps opening links outside failed content');
    failDashboard = false;
    await page.locator('#retry-load').click();
    await page.locator('.workspace-scene + .page-header').waitFor();
    assert.equal(await active(),'Orçamento','Retry retains selection and restores visual position');
    assert.equal(await page.locator('[data-scene-next]').isEnabled(),true);
    checks.push('Refresh/error/retry retain exactly one scene, selected destination and native controls');
    await page.locator('.dossier[data-title="Campanhas"]').focus();
    await page.locator('[data-scene-open]').click(); await page.waitForURL('**/painel/campaigns');
    assert.equal(await page.locator('.workspace-scene').count(),0);
    await page.goto('http://127.0.0.1:8000/painel/overview'); await page.waitForLoadState('networkidle');
    await page.locator('.dossier[data-title="Campanhas"]').focus();
    await page.keyboard.press('Enter'); await page.waitForURL('**/painel/campaigns');
    assert.equal(await page.locator('.workspace-scene').count(),0);
    checks.push('Scene leads first screen; selected cover and open action visible without scrolling; results anchor works; adjacent labels; native caption and Enter navigation; previous/next; focus centering; local arrows; Home/End; wrap; reduced motion; instant keyboard; 280ms pointer');
    await context.close();
    // With JS disabled the gallery is a simple, scrollable collection of native links.
    const plain = await browser.newContext({javaScriptEnabled:false,httpCredentials:{username:'admin',password:env.ADMIN_PASSWORD},viewport:{width:390,height:844}});
    await plain.route('**/*',route => new URL(route.request().url()).origin === 'http://127.0.0.1:8000' ? route.continue() : route.abort());
    const nojs = await plain.newPage(); await nojs.goto('http://127.0.0.1:8000/painel/overview');
    assert.equal(await nojs.locator('.dossier').count(),5);
    assert.equal(await nojs.locator('.scene-control:visible').count(),0);
    await nojs.locator('.dossier[href="/painel/reports"]').click(); await nojs.waitForURL('**/painel/reports');
    checks.push('Without JavaScript: all five native links remain usable; controls hidden');
    assert.deepEqual(errors,[]); assert.equal(blockedMutations,0);
    fs.writeFileSync(`${output}/results.json`,JSON.stringify({checks,measurements,palettes,errors,blockedMutations},null,2));
    console.log(JSON.stringify({checks,errors,blockedMutations},null,2));
  } finally { await browser.close(); }
})();
