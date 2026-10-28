// Workspace interactions survive navigation without replacing the document shell.
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const stages = [
    {label:'First layout',title:'First version',image:'assets/prototype/website-first.png',description:'The first version used a silver palette, a circular M, and the “People first.” introduction.'},
    {label:'Metal exploration',title:'Metallic finish',image:'assets/prototype/website-metal.png',description:'This version explored darker metallic colors and a smaller logo while keeping the original page structure.'},
    {label:'Selected layout',title:'Revised layout',image:'assets/prototype/website-preview.png',description:'This version highlights project coordination and provides direct links to projects and learning notes.'}
  ];
  let current = 0, work = 'website', animation, dialog, opener, request = 0, activeMain;
  const escape = value => value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function controls() {
    return `<div class="version-segments" role="group" aria-label="Website version"><span class="segment-selection" aria-hidden="true"></span>${stages.map((s,i)=>`<button type="button" data-version="${i}" aria-pressed="${i===current}">${s.label}</button>`).join('')}</div>`;
  }
  function position(animate=false) {
    document.querySelectorAll('.version-segments').forEach(group=>{
      if(!group.offsetWidth)return;
      const selected=group.querySelector('[aria-pressed=true]'),indicator=group.querySelector('.segment-selection');
      indicator.style.transition=animate&&!reduced.matches?'transform 240ms ease,width 240ms ease':'none';
      indicator.style.width=selected.offsetWidth+'px';indicator.style.height=selected.offsetHeight+'px';
      indicator.style.transform=`translate(${selected.offsetLeft}px,${selected.offsetTop}px)`;
    });
  }
  async function select(index,animate=true) {
    const ticket=++request,item=stages[index]; if(!item)return;
    const image=new Image();image.src=new URL(item.image,location.href).href;
    try { await Promise.race([image.decode(),new Promise(resolve=>setTimeout(resolve,1200))]); } catch { /* The image's alt text remains usable. */ }
    if(ticket!==request||!document.querySelector('#stage-display'))return;
    current=index;
    const display=document.querySelector('#stage-display');
    display.innerHTML=`<figure class="workspace-figure"><button type="button" class="screenshot-open" data-enlarge aria-label="Enlarge screenshot: ${item.label}"><img src="${item.image}" alt="${item.label} version of the personal website"><span>Enlarge image ↗</span></button><figcaption><h3>${item.title}</h3><p>${escape(item.description)}</p><a class="text-link" href="https://github.com/marslinof24/marslin">View repository</a></figcaption></figure>`;
    document.querySelectorAll('[data-version]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.version)===current)));
    if(dialog?.open)dialog.querySelector('.gallery-image').innerHTML=`<img src="${item.image}" alt="${item.label} version of the personal website">`;
    position(animate);
    if(animate&&!reduced.matches){animation?.cancel();animation=display.animate([{opacity:.6},{opacity:1}],{duration:180});}
  }
  function chooseWork(id) {
    work=['website','linux','data'].includes(id)?id:'website';
    const website=work==='website';
    document.querySelector('#website-versions').hidden=!website;
    const empty=document.querySelector('#work-placeholder');empty.hidden=website;
    document.querySelector('#work-title').textContent=website?'Personal website':work==='linux'?'Linux environment':'Data & queries';
    document.querySelector('#work-description').textContent=website?'Screenshots showing how this website has developed.':work==='linux'?'Linux setup screenshots and notes will be added here.':'Database queries, results, and learning notes will be added here.';
    if(!website)empty.innerHTML='<div class="workspace-empty">Screenshots coming soon</div><p>Notes coming soon</p>';
    document.querySelectorAll('[data-work]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.work===work)));
    position();
  }
  function ensureDialog() {
    if(dialog?.isConnected)return;
    dialog=document.createElement('dialog');dialog.className='gallery-dialog';dialog.setAttribute('aria-labelledby','gallery-title');
    dialog.innerHTML='<div class="gallery-toolbar"><h2 id="gallery-title">Website development</h2><button type="button" data-close-gallery>Close ×</button></div><div class="gallery-controls"></div><div class="gallery-image"></div><p>Use your browser’s zoom to inspect details.</p>';
    dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
    dialog.addEventListener('close',()=>{(document.querySelector('[data-enlarge]')||opener)?.focus({preventScroll:true});});
    document.body.append(dialog);
  }
  function enhance({detail} = {}) {
    const main=detail?.root?.querySelector('main') || document.querySelector('.page-layer:not(.page-layer-outgoing) main,body>main');
    if(main===activeMain){position();return;}
    activeMain=main;
    ++request;animation?.cancel();dialog?.remove();dialog=undefined;
    if(!document.querySelector('#stage-display'))return;
    current=0;chooseWork(location.hash.slice(1));ensureDialog();position();
  }
  document.addEventListener('click',event=>{
    const version=event.target.closest('[data-version]');if(version)select(Number(version.dataset.version));
    const button=event.target.closest('[data-work]');if(button) {
      chooseWork(button.dataset.work);
      const url=new URL(location.href);url.hash=button.dataset.work;
      history.replaceState(history.state,'',url);
    }
    const open=event.target.closest('[data-enlarge]');if(open){ensureDialog();opener=open;dialog.querySelector('.gallery-controls').innerHTML=controls();dialog.querySelector('.gallery-image').innerHTML=`<img src="${stages[current].image}" alt="${stages[current].label} version of the personal website">`;dialog.showModal();position();dialog.querySelector('[data-close-gallery]').focus();}
    if(event.target.closest('[data-close-gallery]'))dialog?.close();
  });
  document.addEventListener('mars:page',enhance);
  document.addEventListener('mars:prepare',enhance);
  document.addEventListener('mars:anchor',()=>{if(document.querySelector('#stage-display'))chooseWork(location.hash.slice(1));});
  addEventListener('resize',()=>position());
  addEventListener('hashchange',()=>{if(document.querySelector('#stage-display'))chooseWork(location.hash.slice(1));});
  reduced.addEventListener('change',()=>{animation?.cancel();position();});
  document.fonts.ready.then(()=>position());enhance();
})();
