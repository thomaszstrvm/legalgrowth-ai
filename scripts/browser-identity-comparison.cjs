// Local presentation artifact verification; no application mutations or network.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
  const page=await browser.newPage({viewport:{width:1600,height:1100}});
  let externalRequests=0;
  await page.route(/^https?:/,route=>{externalRequests++;return route.abort();});
  await page.goto(pathToFileURL(path.resolve('output/design-review/before-after.html')).href);
  for(const screen of ['overview','settings','reports'])for(const theme of ['light','dark'])for(const size of ['1366','390']){
   await page.locator('#screen').selectOption(screen);
   await page.locator('#theme').selectOption(theme);
   await page.locator('#size').selectOption(size);
   await page.waitForFunction(()=>[...document.images].every(img=>img.complete&&img.naturalWidth>0));
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   if(screen==='overview'&&theme==='light'&&size==='1366')await page.screenshot({path:'output/design-review/identity-before-after.png',fullPage:true});
  }
  assert.equal(externalRequests,0);
  const result={combinations:12,imagesLoaded:true,overflow:false,externalRequests};
  fs.writeFileSync('output/design-review/identity-comparison-results.json',JSON.stringify(result,null,2));
  console.log(JSON.stringify(result));
 } finally {await browser.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1});
