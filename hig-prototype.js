// Local-only HIG study. Snapshot content; no editor state, backend or publication.
(() => {
  const main = document.querySelector('#main');
  const nav = document.querySelector('#hig-nav');
  const dialog = document.querySelector('#hig-lightbox');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover:hover) and (pointer:fine)');
  const names = {A:'Metal refined', B:'Balanced glass', C:'Content immersive'};
  const stages = [
    {label:'First layout',title:'The first version',image:'assets/prototype/website-first.png',description:'The original silver palette, circular M, and “People first.” introduction.'},
    {label:'Metal exploration',title:'Finding the material',image:'assets/prototype/website-metal.png',description:'A darker metal palette and a more compact mark, while retaining the original page structure.'},
    {label:'Selected layout',title:'A clearer direction',image:'assets/prototype/website-preview.png',description:'Project collaboration moves to the foreground, with a more direct route to projects and technical practice.'}
  ];
  let view, variant, stage = 0, capture = 'website', animation, opener;
  const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function url(page = view, design = variant) { return `hig-prototype.html?view=${page}&variant=${design}`; }
  function segments(lightbox = false) {
    return `<div class="version-segments" role="group" aria-label="${lightbox?'Enlarged image':'Development'} version"><span class="segment-selection" aria-hidden="true"></span>${stages.map((s,i)=>`<button type="button" data-stage="${i}" aria-pressed="${stage===i}">${s.label}</button>`).join('')}</div>`;
  }
  function workspace() {
    return `<div class="hig-workspace"><header class="page-intro"><h1>An open workbench.</h1><p>Screens from my practice. Notes and workstations behind the work.</p></header><section class="workstations"><h2>Workstations</h2><div class="station-items"><a class="station-card" href="https://hackmd.io/@MarsLin01"><strong>HackMD</strong><span>Notes & learning</span></a><a class="station-card" href="https://github.com/marslinof24"><strong>GitHub</strong><span>Code & repositories</span></a></div></section><div class="hig-workbench"><section class="hig-viewer" aria-labelledby="work-title"><header class="work-summary"><h2 id="work-title">Personal website</h2><p id="work-description">The making of this site. Real screenshots from the design process.</p></header><div id="website-versions">${segments()}<div id="stage-display" aria-live="polite"></div></div><div id="work-placeholder" hidden></div></section><aside class="work-index"><h2>Practice</h2><div role="group" aria-label="Choose a work item">${[['website','Personal website','Design & development'],['linux','Linux environment','Screenshot to add'],['data','Data & queries','Screenshot to add']].map(([id,title,status])=>`<button type="button" data-work="${id}" aria-pressed="${capture===id}"><strong>${title}</strong><span>${status}</span></button>`).join('')}</div></aside></div></div>`;
  }
  function positionSegments(animate=false) {
    document.querySelectorAll('.version-segments').forEach(group=>{
      if (!group.getBoundingClientRect().width) return;
      if(group.parentElement.id==='website-versions')group.parentElement.style.setProperty('--segment-height',group.offsetHeight+'px');
      const button=group.querySelector('[aria-pressed="true"]');
      const indicator=group.querySelector('.segment-selection');
      indicator.style.transition=animate&&!motion.matches?'transform 240ms ease,width 240ms ease':'none';
      indicator.style.width=button.offsetWidth+'px'; indicator.style.height=button.offsetHeight+'px';
      indicator.style.transform=`translate(${button.offsetLeft}px,${button.offsetTop}px)`;
    });
  }
  function positionNav(animate=false) {
    document.body.style.setProperty('--compare-height',document.querySelector('.hig-comparison').offsetHeight+'px');
    document.body.style.setProperty('--mobile-nav-height',nav.offsetHeight+'px');
    const active=nav.querySelector('[aria-current]'); if(!active)return;
    const indicator=nav.querySelector('.hig-selection');
    indicator.style.transition=animate&&!motion.matches?'transform 280ms ease,width 280ms ease':'none';
    indicator.style.width=active.offsetWidth+'px';indicator.style.height=active.offsetHeight+'px';
    indicator.style.transform=`translate(${active.offsetLeft}px,${active.offsetTop}px)`;
  }
  function updateStage(animate=false) {
    const s=stages[stage];
    const display=document.querySelector('#stage-display');
    if(display&&!dialog.open)display.innerHTML=`<figure><button type="button" class="image-open" data-enlarge aria-label="Enlarge ${esc(s.label)} screenshot"><img src="${s.image}" alt="${esc(s.label)} — actual saved website screenshot"><span>View larger ↗</span></button><figcaption><h3>${s.title}</h3><p>${s.description}</p><a class="text-link" href="https://github.com/marslinof24/marslin">View repository</a></figcaption></figure>`;
    document.querySelectorAll('[data-stage]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.stage)===stage)));
    if(dialog.open)dialog.querySelector('.lightbox-image').innerHTML=`<img src="${s.image}" alt="${esc(s.label)} — actual saved website screenshot">`;
    positionSegments(animate);
    if(display&&animate&&!motion.matches) {animation?.cancel();animation=display.animate([{opacity:.55},{opacity:1}],{duration:200});}
  }
  function updateWork() {
    if(!document.querySelector('#website-versions'))return;
    const website=capture==='website';
    document.querySelector('#website-versions').hidden=!website;
    const placeholder=document.querySelector('#work-placeholder');placeholder.hidden=website;
    document.querySelector('#work-title').textContent=website?'Personal website':capture==='linux'?'Linux environment':'Data & queries';
    document.querySelector('#work-description').textContent=website?'The making of this site. Real screenshots from the design process.':capture==='linux'?'A place for an environment screenshot, with its setup notes alongside.':'A place for database practice, query results, and the notes behind them.';
    if(!website)placeholder.innerHTML='<div class="hig-empty">Screenshot to add</div><p>Related notes to add</p>';
    document.querySelectorAll('[data-work]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.work===capture)));
    positionSegments();
  }
  function read() {
    const params=new URL(location.href).searchParams;
    view=params.get('view')==='workspace'?'workspace':'home';variant=names[params.get('variant')]?params.get('variant'):'A';
  }
  function render({animate=false,focus=false}={}) {
    read();document.body.dataset.variant=variant;document.body.dataset.view=view;
    document.title=`${view==='home'?'Home':'Workspace'} · ${names[variant]} — HIG prototype`;
    main.replaceChildren(view==='home'?document.querySelector('#hig-home-template').content.cloneNode(true):document.createRange().createContextualFragment(workspace()));
    main.querySelectorAll('a[href^="workspace.html"]').forEach(a=>{a.href=url('workspace')+new URL(a.href).hash;});
    nav.querySelectorAll('[data-page]').forEach(a=>{a.href=url(a.dataset.page);if(a.dataset.page===view)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    document.querySelectorAll('[data-variant]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.variant===variant)));
    document.querySelector('#hig-variant-name').textContent=names[variant];
    document.querySelector('.hig-menu').setAttribute('aria-expanded','false');nav.classList.remove('is-open');
    if(view==='workspace') {updateStage();updateWork();}
    positionNav(animate);
    if(animate&&!motion.matches){animation?.cancel();animation=main.animate([{opacity:.3,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:280});}
    if(focus)main.focus({preventScroll:true});
  }
  function go(page,design=variant,hash='') {
    history.replaceState({...history.state,scroll:scrollY},'',location.href);
    if(page!==view){stage=0;capture=hash==='#linux'?'linux':hash==='#data'?'data':'website';}
    history.pushState({scroll:0},'',url(page,design));render({animate:true,focus:true});window.scrollTo({top:0,behavior:'instant'});
  }
  function close() {dialog.close();}
  dialog.addEventListener('close',()=>{updateStage();(document.querySelector('[data-enlarge]') || opener)?.focus({preventScroll:true});});
  dialog.addEventListener('click',e=>{if(e.target===dialog)close();});
  document.addEventListener('click',event=>{
    const target=event.target.closest('a,button');if(!target)return;
    if(target.matches('a')&&(!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&!event.altKey&&event.button===0)) {
      const u=new URL(target.href);if(u.pathname.endsWith('/hig-prototype.html')){event.preventDefault();go(u.searchParams.get('view')==='workspace'?'workspace':'home',u.searchParams.get('variant')||variant,u.hash);return;}
    }
    if(target.dataset.variant){if(target.dataset.variant!==variant)go(view,target.dataset.variant);}
    if(target.dataset.stage!==undefined){stage=Number(target.dataset.stage);updateStage(true);}
    if(target.dataset.work){capture=target.dataset.work;updateWork();}
    if(target.hasAttribute('data-enlarge')){opener=target;dialog.querySelector('.lightbox-versions').innerHTML=segments(true);dialog.showModal();updateStage();dialog.querySelector('[data-close]').focus();}
    if(target.hasAttribute('data-close'))close();
    if(target.matches('.hig-menu')){const open=target.getAttribute('aria-expanded')!=='true';target.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open);positionNav();}
  });
  document.addEventListener('keydown',event=>{
    if(dialog.open||event.altKey||event.ctrlKey||event.metaKey||event.target.closest('input,textarea,select,button,a,[contenteditable],[role="slider"]'))return;
    if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();const keys=Object.keys(names);go(view,keys[(keys.indexOf(variant)+(event.key==='ArrowRight'?1:2))%3]);}
  });
  main.addEventListener('pointermove',event=>{
    if(motion.matches||!fine.matches)return;
    const metal=event.target.closest('.metal-scene');if(!metal)return;
    const r=metal.getBoundingClientRect(),x=(event.clientX-r.left)/r.width,y=(event.clientY-r.top)/r.height;
    metal.style.setProperty('--ry',`${(x-.5)*8}deg`);metal.style.setProperty('--rx',`${(.5-y)*8}deg`);metal.style.setProperty('--light-x',`${x*100}%`);metal.style.setProperty('--light-y',`${y*100}%`);
  });
  main.addEventListener('pointerout',event=>{const metal=event.target.closest('.metal-scene');if(metal&&!metal.contains(event.relatedTarget))metal.removeAttribute('style');});
  motion.addEventListener('change',()=>{animation?.cancel();main.querySelectorAll('.metal-scene').forEach(n=>n.removeAttribute('style'));positionNav();positionSegments();});
  addEventListener('resize',()=>{positionNav();positionSegments();});
  addEventListener('popstate',()=>{if(dialog.open)close();render();window.scrollTo({top:history.state?.scroll||0,behavior:'instant'});});
  if('scrollRestoration' in history)history.scrollRestoration='manual';
  history.replaceState({scroll:scrollY},'',location.href);render();document.fonts.ready.then(()=>{positionNav();positionSegments();});
})();
