import React from 'react';
import {AbsoluteFill, Composition, Easing, interpolate, registerRoot, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Audio} from '@remotion/media';
import {loadFont} from '@remotion/fonts';
import {productCase} from './product-case';

void loadFont({family:'LaunchNews',url:staticFile('fonts/newsreader.ttf'),weight:'400'});
void loadFont({family:'LaunchManrope',url:staticFile('fonts/manrope.ttf'),weight:'400'});

const c={canvas:'#181c19',surface:'#242824',soft:'#2e342e',ink:'#eeeee7',muted:'#b8bcb2',line:'#3d423b',accent:'#b8d4bc',notice:'#f0d7a8'};
const soft=Easing.bezier(0.4,0,0.2,1);
// Critically damped closed-form response: no random state, overshoot or repeated bounce.
const settle=(u:number)=>(1-(1+8*u)*Math.exp(-8*u))/(1-9*Math.exp(-8));
const knots=[0,.5,2.5,3,5.5,6,7.5,8.5,11.5,12,15.5,16];
const money=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(productCase.summary.cost);
const period='12–18 out 2026';
const campaign=productCase.campaigns['1'].label;
const titleStyle:React.CSSProperties={position:'absolute',left:120,top:174,fontFamily:'LaunchNews',fontSize:106,lineHeight:1.04,letterSpacing:-2.6,margin:0,fontWeight:400};

export const ProductLaunch60:React.FC=()=>{
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  const t=frame/fps;
  const step=(a:number,b:number)=>interpolate(t,[a,b],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:soft});
  const show=(a:number,b:number)=>step(a,a+.2)*(1-step(b-.2,b));
  const pose=(values:number[])=>interpolate(t,knots,values,{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:settle});
  const x=pose([1080,1040,1040,120,120,120,120,120,120,560,560,1110]);
  const y=pose([300,285,285,320,320,320,320,320,320,290,290,338]);
  const w=pose([760,760,760,1680,1680,1680,1680,1680,1680,1100,1100,690]);
  const h=pose([580,580,580,580,580,580,580,580,580,650,650,550]);
  const costLeft=pose([58,58,58,62,62,1240,1240,1240,1240,712,712,62]);
  const costTop=pose([300,300,300,220,220,180,180,180,180,270,270,244]);
  const costSize=pose([112,112,112,124,124,78,78,78,78,78,78,108]);
  const costLabelSize=pose([45,45,45,54,54,43,43,43,43,43,43,43]);
  const evidence=step(8,8.5);
  const report=step(11.5,12);
  const closing=step(16,16.25);
  const dateX=pose([58,58,58,1170,1170,1170,1170,1170,1170,62,62,62]);
  const dateY=pose([165,165,165,52,52,52,52,52,52,163,163,416]);
  const dateSize=pose([44,44,44,45,45,45,45,45,45,48,48,42]);
  const cursorOpacity=show(1.9,2.55)+show(4.9,5.55)+show(7.5,8.15)+show(11,11.55);
  const cursorX=interpolate(t,[1.9,2.25,2.5,4.9,5.2,5.5,7.5,7.8,8,11,11.3,11.5],[1370,1325,1325,1660,1620,1620,1650,1610,1610,1650,1610,1610],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:soft});
  const cursorY=interpolate(t,[1.9,2.25,2.5,4.9,5.2,5.5,7.5,7.8,8,11,11.3,11.5],[860,830,830,860,831,831,732,710,710,860,837,837],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:soft});

  return <AbsoluteFill style={{backgroundColor:c.canvas,color:c.ink,fontFamily:'LaunchManrope',fontVariantNumeric:'tabular-nums'}}>
    <Audio src={staticFile('audio/product-launch60-v1.wav')} premountFor={fps}/>
    <div style={{position:'absolute',left:120,top:62,fontSize:49,fontWeight:600,letterSpacing:-1}}>LegalGrowth</div>
    <div style={{position:'absolute',right:120,top:72,fontSize:44,color:c.muted}}>Em desenvolvimento · 25.10.2026</div>
    <div style={{position:'absolute',left:120,right:120,top:145,height:2,backgroundColor:c.line}}/>

    <div style={{...titleStyle,top:320,width:830,opacity:1-step(2.25,2.5),overflow:'hidden'}}>
      <div style={{translate:`0 ${28*(1-step(0,.5))}px`}}>Entenda seus<br/>resultados.</div>
      <div style={{fontFamily:'LaunchManrope',fontSize:53,lineHeight:1.4,letterSpacing:0,marginTop:38,color:c.muted}}>Investimento e campanhas,<br/>no mesmo lugar.</div>
    </div>
    <h1 style={{...titleStyle,opacity:show(2.9,5.5)}}>Veja a campanha por inteiro.</h1>
    <h1 style={{...titleStyle,opacity:show(5.9,11.5)}}>Saiba o que revisar.</h1>
    <h1 style={{...titleStyle,opacity:show(11.9,15.5),fontSize:100}}>Registre. Acompanhe.</h1>

    {/* The same DOM surface carries the same case and amount throughout the take.
        Only internal content changes; clipped text windows have separate timings. */}
    <div data-persistent-surface="campaign-evidence-report" style={{position:'absolute',left:x,top:y,width:w,height:h,borderRadius:6,backgroundColor:c.surface,border:`2px solid ${c.line}`,overflow:'hidden',boxShadow:'0 26px 60px rgba(0,0,0,.19)'}}>
      <div style={{position:'absolute',left:0,top:0,bottom:0,width:9,backgroundColor:c.accent,opacity:.5+.25*report}}/>
      <div style={{position:'absolute',left:31,top:0,bottom:0,width:1,backgroundColor:c.line,opacity:report}}/>

      <div style={{position:'absolute',left:58,top:47,right:58,height:105,overflow:'hidden',opacity:1-step(2.3,2.5)}}><div style={{fontFamily:'LaunchNews',fontSize:81}}>Resumo</div></div>
      <div style={{position:'absolute',left:58,top:455,fontSize:44,color:c.muted,opacity:1-step(2.3,2.5)}}>{productCase.summary.clicks} cliques registrados</div>
      <div style={{position:'absolute',left:58,top:520,fontSize:41,color:c.accent,opacity:show(1.5,2.5)}}>Campanhas →</div>

      {/* This amount never fades or swaps. It moves from overview to supporting
          evidence and into the weekly-report cover, retaining its exact value. */}
      <div data-persistent-value="cost" style={{position:'absolute',left:costLeft,top:costTop,width:410}}>
        <div style={{position:'absolute',left:0,top:-66,fontSize:costLabelSize,color:c.muted,opacity:1-step(11.3,11.5)}}>Gasto</div>
        <div style={{fontSize:costSize,letterSpacing:-3,lineHeight:1.15,color:c.accent,whiteSpace:'nowrap'}}>{money}</div>
      </div>
      <div style={{position:'absolute',left:dateX,top:dateY,fontSize:dateSize,color:c.muted,whiteSpace:'nowrap',opacity:1-step(15.3,15.5)+step(16,16.2)}}>{period}</div>

      <div style={{position:'absolute',left:58,top:44,width:1060,height:100,overflow:'hidden',opacity:show(3,11.5)}}>
        <div style={{fontFamily:'LaunchNews',fontSize:68,translate:`0 ${15*(1-step(3,3.2))}px`}}>{campaign}</div>
      </div>

      <div style={{position:'absolute',inset:58,opacity:show(3,5.5),overflow:'hidden'}}>
        <div style={{position:'absolute',left:0,right:0,top:78,height:2,backgroundColor:c.line}}/>
        <div style={{position:'absolute',left:555,top:96}}><div style={{fontSize:54,color:c.muted}}>Cliques</div><div style={{fontSize:124,marginTop:14,lineHeight:1.15}}>{productCase.summary.clicks}</div></div>
        <div style={{position:'absolute',left:1060,top:96}}><div style={{fontSize:54,color:c.muted}}>Qualificados</div><div style={{fontSize:124,marginTop:14,lineHeight:1.15}}>{productCase.summary.qualified}</div></div>
        <div style={{position:'absolute',left:0,right:0,bottom:0,display:'flex',justifyContent:'space-between',fontSize:49,opacity:step(4,4.5)}}>
          <span style={{color:c.muted}}>Pontos para revisar</span><span style={{color:c.accent,borderBottom:`2px solid ${c.accent}`,paddingBottom:7}}>Ver recomendação →</span>
        </div>
      </div>

      <div style={{position:'absolute',left:58,right:58,top:140,bottom:32,opacity:show(6,11.5),overflow:'hidden'}}>
        <div style={{position:'absolute',left:0,top:0,width:1120,height:110,overflow:'hidden',fontFamily:'LaunchNews',fontSize:82,lineHeight:1.15}}>Revisar mensuração</div>
        <div style={{position:'absolute',left:0,top:112,width:1100,height:80,fontSize:50,color:c.muted,opacity:1-step(7.65,7.85),overflow:'hidden'}}>Confira o rastreamento dos resultados.</div>
        <div style={{position:'absolute',left:0,right:0,top:200-55*evidence,borderTop:`2px solid ${c.line}`,paddingTop:22,display:'flex',justifyContent:'space-between',fontSize:51,color:c.accent}}><span>Revisar evidências</span><span>{evidence>.5?'−':'+'}</span></div>
        <div style={{position:'absolute',left:0,right:0,top:240,height:165,overflow:'hidden',opacity:step(8.3,8.5)}}>
          <div style={{translate:`0 ${20*(1-evidence)}px`}}>
            <div style={{display:'flex',gap:72,alignItems:'baseline',fontSize:65}}><span>{productCase.summary.clicks} cliques</span><span style={{color:c.muted}}>→</span><span style={{color:c.notice}}>{productCase.summary.conversions} conversões registradas</span></div>
            <div style={{fontSize:44,color:c.muted,lineHeight:1.3,marginTop:16,opacity:1-step(10.6,10.8)}}>Sem registro não significa ausência de interesse.</div>
            <div style={{position:'absolute',left:0,top:98,fontSize:45,color:c.accent,opacity:step(10.8,11)}}>Confira com o responsável. A decisão é humana.</div>
          </div>
        </div>
      </div>

      <div style={{position:'absolute',inset:62,opacity:show(12,15.5),overflow:'hidden'}}>
        <div style={{fontFamily:'LaunchNews',fontSize:77,lineHeight:1.08}}>Relatório semanal</div>
        <div style={{position:'absolute',left:0,right:0,top:178,height:2,backgroundColor:c.line}}/>
        <div style={{position:'absolute',left:0,top:208,fontSize:55,color:c.muted}}>Investimento</div>
        <div style={{position:'absolute',left:0,right:0,top:308,display:'flex',justifyContent:'space-between',fontSize:58}}><span style={{color:c.muted}}>Cliques</span><span>{productCase.summary.clicks}</span></div>
        <div style={{position:'absolute',left:0,right:0,top:388,borderTop:`2px solid ${c.line}`,paddingTop:18,fontSize:47,color:c.accent,lineHeight:1.2}}>Conferir o registro<br/>dos resultados.</div>
      </div>

      <div style={{position:'absolute',left:1350,top:505,fontSize:43,color:c.accent,opacity:show(10.6,11.5)}}>Relatórios →</div>

      <div style={{position:'absolute',left:62,top:55,right:62,height:172,overflow:'hidden',opacity:closing,fontFamily:'LaunchNews',fontSize:75,lineHeight:1.1}}>Resultados<br/>da semana</div>
    </div>

    <svg width="44" height="58" viewBox="0 0 44 58" style={{position:'absolute',left:cursorX,top:cursorY,opacity:cursorOpacity,rotate:'-12deg'}}><path d="M 3 2 V 47 L 15 36 L 27 56 L 36 51 L 24 32 L 41 29 Z" fill={c.ink} stroke={c.canvas} strokeWidth="3"/></svg>
    <div style={{position:'absolute',left:120,top:345,width:920,opacity:closing,overflow:'hidden'}}>
      <div style={{fontFamily:'LaunchNews',fontSize:124,lineHeight:1.03,letterSpacing:-3,translate:`0 ${22*(1-closing)}px`}}>Decida o<br/>próximo passo.</div>
      <div style={{fontSize:51,color:c.muted,marginTop:40}}>A decisão continua com você.</div>
      <div style={{fontSize:44,color:c.muted,marginTop:36}}>Portfólio de Thomas Marques</div>
    </div>
    <div style={{position:'absolute',left:120,right:120,bottom:48,fontSize:48,color:c.muted}}>Portfólio · dados fictícios · fluxo ilustrado</div>
  </AbsoluteFill>;
};

const Root:React.FC=()=> <Composition id="LegalGrowthProduct60" component={ProductLaunch60} width={1920} height={1080} fps={60} durationInFrames={1200}/>;
registerRoot(Root);
