// Local evidence viewer: never fetches websites or sends product data.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
(async()=>{
 const edition=['exceptional','editorial-v2','editorial-v3','editorial-v4','editorial-v5','editorial-v6'].includes(process.argv[2])?process.argv[2]:'portfolio-refinement';
 const directory=`output/design-review/${edition}`;
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
  const page=await browser.newPage({viewport:{width:1500,height:1000}});
  let externalRequests=0,combinations=0;
  await page.route(/^https?:/,route=>{externalRequests++;return route.abort();});
  await page.goto(pathToFileURL(path.resolve(`${directory}/comparison.html`)).href);
 const screens=edition!=='portfolio-refinement'?['overview','settings','reports','finance']:['overview','settings','reports'];
  for(const screen of screens)for(const theme of ['light','dark'])for(const width of ['1366','390']){
   await page.locator('#screen').selectOption(screen);
   await page.locator('#theme').selectOption(theme);
   await page.locator('#width').selectOption(width);
   await page.waitForFunction(()=>[...document.images].every(img=>img.complete&&img.naturalWidth>0));
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   combinations++;
  }
  await page.locator('#screen').selectOption('overview');
  await page.locator('#theme').selectOption('light');
  await page.locator('#width').selectOption('1366');
  await page.waitForFunction(()=>[...document.images].every(img=>img.complete&&img.naturalWidth>0));
  if(edition!=='portfolio-refinement')for(const reference of await page.locator('#reference option').evaluateAll(options=>options.map(option=>option.value))){
   await page.locator('#reference').selectOption(reference);
   await page.waitForFunction(()=>[...document.images].every(img=>img.complete&&img.naturalWidth>0));
   await page.screenshot({path:`${directory}/comparison-${reference}.png`,fullPage:false});
  }
  await page.screenshot({path:`${directory}/comparison-desktop.png`,fullPage:true});
  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  assert.equal(externalRequests,0);
  const result={combinations,imagesLoaded:true,viewerMobileReflow:true,externalRequests};
  fs.writeFileSync(`${directory}/comparison-results.json`,JSON.stringify(result,null,2));
  console.log(JSON.stringify(result));
 } finally {await browser.close();}
})().catch(error=>{console.error(error.message);process.exitCode=1});
