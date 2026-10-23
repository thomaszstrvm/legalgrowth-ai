// Render the production insightFindings function with a small synthetic fixture.
// No server, credentials, DB, provider calls or product edits are used.
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const {chromium}=require('playwright');
const root=process.cwd(),out=root+'/media/legalgrowth-presentation/public/screens';
const src=fs.readFileSync('app/static/app.js','utf8');
function between(a,b){const start=src.indexOf(a),end=src.indexOf(b,start+1);if(start<0||end<0)throw Error('Production renderer changed');return src.slice(start,end);}
const helpers=between('const esc =','const dt =')+between('const panel=','function bindTableOverflow');
const renderer=between('function insightFindings(','function ');
const fixture={demonstration:true,findings:[{kind:'weakness',title:'Exemplo: compare os períodos',explanation:'Há poucos registros para concluir.',action:'Confira as evidências antes de mudar.',evidence:[{subject_name:'Campanha fictícia',label:'Contratações',metric:'hires',value:2,period:'current'}]}]};
const context={fixture};vm.createContext(context);vm.runInContext(helpers+renderer+';html=insightFindings(fixture)',context);
const css=['tokens.css','style.css','arc.css'].map(n=>fs.readFileSync('app/static/'+n,'utf8')).join('\n');
const fonts=['manrope','newsreader'].map(n=>`@font-face{font-family:'${n==='manrope'?'Manrope':'Newsreader'}';src:url(data:font/ttf;base64,${fs.readFileSync('app/static/fonts/'+n+'.ttf').toString('base64')});font-weight:100 900;}`).join('');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});const errors=[];
try{const page=await browser.newPage({viewport:{width:1000,height:700},deviceScaleFactor:2});await page.route('**/*',r=>r.abort());page.on('pageerror',e=>errors.push(e.message));
for(const theme of ['light','dark']){await page.setContent(`<html data-theme="${theme}"><head><style>${css}\n${fonts}\nbody{margin:0;padding:32px}#content{width:936px}</style></head><body data-page="insights"><div id="content">${context.html}</div></body></html>`);await page.evaluate(()=>document.fonts.ready);await page.locator('.rec.insight').screenshot({path:out+'/insight-film-'+theme+'.png'});}
if(errors.length)throw Error(errors.join(';'));fs.writeFileSync(out+'/insight-film-provenance.json',JSON.stringify({fixture,rendererSha256:crypto.createHash('sha256').update(renderer).digest('hex'),origin:'Exact production insightFindings and CSS, isolated offline rendering',externalRequests:0,pageErrors:errors},null,2));console.log('Actual insight component captured in both themes with synthetic short fixture.');}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
