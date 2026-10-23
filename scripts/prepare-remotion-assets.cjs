const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {spawnSync}=require('node:child_process');
const {chromium}=require('playwright');
const root=process.cwd(),out=path.join(root,'media/legalgrowth-presentation/public');
fs.mkdirSync(out,{recursive:true});fs.mkdirSync(path.join(out,'covers'),{recursive:true});fs.mkdirSync(path.join(out,'screens'),{recursive:true});fs.mkdirSync(path.join(out,'fonts'),{recursive:true});
const sources=[];
function copy(source,dest){fs.copyFileSync(path.join(root,source),path.join(out,dest));sources.push({source,dest,sha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(root,source))).digest('hex')});}
for(const name of ['manrope.ttf','newsreader.ttf','OFL-Manrope.txt','OFL-Newsreader.txt'])copy('app/static/fonts/'+name,'fonts/'+name);
for(const name of ['metrics-light.png','metrics-dark.png','overview-light.png','overview-dark.png','overview-detail-light.png','overview-detail-dark.png','campaigns-detail-light.png','finance-detail-light.png','finance-detail-dark.png','insight-example-light.png','insight-example-dark.png','reports-detail-dark.png'])copy('output/closure-v60/presentation/'+name,'screens/'+name);
const py=spawnSync(path.join(root,'.venv/Scripts/python.exe'),['-c',"from jinja2 import Environment, FileSystemLoader; print(Environment(loader=FileSystemLoader('app/templates')).get_template('_workspace_scene.html').render())"],{encoding:'utf8',env:{...process.env,PYTHONIOENCODING:'utf-8'}});
if(py.status)throw Error(py.stderr);
const css=['tokens.css','style.css','arc.css'].map(n=>fs.readFileSync(path.join(root,'app/static',n),'utf8')).join('\n');
const fonts=['manrope','newsreader'].map(n=>`@font-face{font-family:'${n==='manrope'?'Manrope':'Newsreader'}';src:url(data:font/ttf;base64,${fs.readFileSync(path.join(root,'app/static/fonts',n+'.ttf')).toString('base64')}) format('truetype');font-weight:100 900;}`).join('');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});const errors=[];
try{const page=await browser.newPage({viewport:{width:1800,height:900},deviceScaleFactor:3});await page.route('**/*',r=>r.abort());page.on('pageerror',e=>errors.push(e.message));
for(const theme of ['light','dark']){
await page.setContent(`<html data-theme="${theme}"><head><style>${css}\n${fonts}\nhtml,body{background:transparent!important;margin:0}.workspace-scene{margin:0;padding:40px;background:transparent!important;border:0}.scene-masthead,.scene-footer{display:none!important}.scene-gallery{display:flex!important;gap:28px;height:500px;perspective:none;overflow:visible!important;padding:0!important}.dossier{transform:none!important;flex:0 0 288px!important;box-shadow:none!important}.dossier-face{transform:none!important}</style></head><body>${py.stdout}</body></html>`);
await page.evaluate(()=>document.fonts.ready);
for(const id of ['finance','reports','campaigns','insights','strategy'])await page.locator('.dossier-'+id).screenshot({path:path.join(out,'covers',id+'-'+theme+'.png'),omitBackground:true});
}if(errors.length)throw Error(errors.join('\n'));}finally{await browser.close();}
fs.writeFileSync(path.join(out,'asset-provenance.json'),JSON.stringify({sources,coverOrigin:'Unmodified production Jinja artwork and CSS, isolated local render; no app, DB or credentials',coverThemes:['light','dark'],captureErrors:errors},null,2));console.log('10 actual covers, synthetic screenshots for both themes and local fonts prepared.');})();
