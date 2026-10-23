// Local comparison artifact only. No requests to the reference websites.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1600,height:1000}});
  let externalRequests=0;
  await page.route(/^https?:/,route=>{externalRequests++;return route.abort();});
  await page.goto(pathToFileURL(path.resolve('output/design-review/reference-comparison.html')).href);
  for(const reference of ['payrix','unic','legency','signal','format','arc','nova','linear','attio']){
   await page.locator('#reference').selectOption(reference);
   for(const screen of ['overview','settings','reports']){
    await page.locator('#screen').selectOption(screen);
    for(const version of ['after','round4-before']){
     await page.locator('#version').selectOption(version);
     await page.waitForFunction(()=>[...document.images].every(img=>img.complete&&img.naturalWidth>0));
     assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
     if(screen==='overview'&&version==='after')await page.screenshot({path:`output/design-review/reference-side-by-side-${reference}.png`,fullPage:true});
    }
   }
  }
  await page.locator('#reference').selectOption('payrix');await page.locator('#screen').selectOption('overview');await page.locator('#version').selectOption('after');
  await page.waitForFunction(()=>[...document.images].every(img=>img.complete&&img.naturalWidth>0));
  await page.screenshot({path:'output/design-review/reference-side-by-side.png',fullPage:true});
  assert.equal(externalRequests,0);
  console.log(JSON.stringify({referenceImages:9,screens:3,versions:2,combinations:54,sideBySideCaptures:9,imagesLoaded:true,externalRequests}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1});
