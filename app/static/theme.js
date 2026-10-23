'use strict';
(() => {
  const system=window.matchMedia('(prefers-color-scheme: dark)');
  const saved=()=>{try{return localStorage.getItem('lg-theme');}catch{return null;}};
  const apply=theme=>{
    document.documentElement.dataset.theme=theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='dark'?'#181c19':'#f2f3ee');
    const button=document.getElementById('theme-toggle');
    if(button){button.setAttribute('aria-pressed',String(theme==='dark'));button.textContent=theme==='dark'?'Modo escuro: ligado':'Modo escuro';}
  };
  apply(saved()||(system.matches?'dark':'light'));
  system.addEventListener('change',event=>{if(!saved())apply(event.matches?'dark':'light');});
  document.addEventListener('DOMContentLoaded',()=>{
    apply(document.documentElement.dataset.theme);
    document.getElementById('theme-toggle').addEventListener('click',()=>{
      const theme=document.documentElement.dataset.theme==='dark'?'light':'dark';
      try{localStorage.setItem('lg-theme',theme);}catch{}
      apply(theme);
    });
    const menu=document.getElementById('menu-toggle');
    const setMenu=open=>{menu.setAttribute('aria-expanded',String(open));document.querySelector('aside').classList.toggle('menu-open',open);};
    menu.addEventListener('click',()=>setMenu(menu.getAttribute('aria-expanded')!=='true'));
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){setMenu(false);menu.focus();}});
  });
})();
