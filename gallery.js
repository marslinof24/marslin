// Workspace interactions survive navigation without replacing the document shell.
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const stages = [
    {label:'First layout',title:'First version',image:'assets/prototype/website-first.png',description:'The first version used a silver palette, a circular M, and the “People first.” introduction.'},
    {label:'Metal exploration',title:'Metallic finish',image:'assets/prototype/website-metal.png',description:'This version explored darker metallic colors and a smaller logo while keeping the original page structure.'},
    {label:'Selected layout',title:'Revised layout',image:'assets/prototype/website-preview.png',description:'This version highlights project coordination and provides direct links to projects and learning notes.'}
  ];
  let current = 0, animation, dialog, opener, request = 0, activeMain;
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
    current=index;
    document.querySelectorAll('[data-version]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.version)===current)));
    position(animate);
    document.querySelector('#stage-display')?.setAttribute('aria-busy','true');
    const image=new Image();image.src=new URL(item.image,location.href).href;
    try { await image.decode(); } catch {
      if(ticket===request){
        const display=document.querySelector('#stage-display');display?.removeAttribute('aria-busy');
        if(display){let status=display.querySelector('[data-image-status]');if(!status){status=document.createElement('p');status.dataset.imageStatus='';status.setAttribute('role','status');display.append(status);}status.textContent='This screenshot could not be loaded. Select another version to continue.';}
      }
      return;
    }
    if(ticket!==request||!document.querySelector('#stage-display'))return;
    const display=document.querySelector('#stage-display');
    display.removeAttribute('aria-busy');
    display.innerHTML=`<figure class="workspace-figure"><button type="button" class="screenshot-open" data-enlarge aria-label="Enlarge screenshot: ${item.label}"><img src="${item.image}" alt="${item.label} version of the personal website"><span>Enlarge image ↗</span></button><figcaption><h3>${item.title}</h3><p>${escape(item.description)}</p><a class="text-link" href="https://github.com/marslinof24/marslin">View repository</a></figcaption></figure>`;
    document.querySelectorAll('[data-version]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.version)===current)));
    if(dialog?.open)dialog.querySelector('.gallery-image').innerHTML=`<img src="${item.image}" alt="${item.label} version of the personal website">`;
    // Keep the indicator's ongoing motion; image decoding must not reposition it.
  }
  let viewerMotion,closing=false;
  function revealViewer(source){
    closing=false;viewerMotion?.cancel();
    const from=source.getBoundingClientRect(),to=dialog.getBoundingClientRect();
    dialog.style.setProperty('--viewer-x',`${Math.max(0,Math.min(to.width,from.x+from.width/2-to.x))}px`);
    dialog.style.setProperty('--viewer-y',`${Math.max(0,Math.min(to.height,from.y+from.height/2-to.y))}px`);
    if(!reduced.matches)viewerMotion=dialog.animate([{opacity:0,transform:'scale(.96)'},{opacity:1,transform:'scale(1)'}],{duration:180,easing:'ease-out'});
  }
  async function closeViewer(){
    if(!dialog?.open||closing)return;closing=true;
    const live=getComputedStyle(dialog);const start={opacity:live.opacity,transform:live.transform};viewerMotion?.cancel();
    if(!reduced.matches){viewerMotion=dialog.animate([start,{opacity:0,transform:'scale(.96)'}],{duration:150,easing:'ease-in',fill:'forwards'});await viewerMotion.finished.catch(()=>{});}
    dialog?.close();viewerMotion?.cancel();closing=false;
  }
  function ensureDialog() {
    if(dialog?.isConnected)return;
    dialog=document.createElement('dialog');dialog.className='gallery-dialog';dialog.setAttribute('aria-labelledby','gallery-title');
    dialog.innerHTML='<div class="gallery-toolbar"><h2 id="gallery-title">Website development</h2><button type="button" data-close-gallery>Close ×</button></div><div class="gallery-controls"></div><div class="gallery-image"></div><p>Use your browser’s zoom to inspect details.</p>';
    dialog.addEventListener('click',event=>{if(event.target===dialog)closeViewer();});
    dialog.addEventListener('cancel',event=>{event.preventDefault();closeViewer();});
    dialog.addEventListener('close',()=>{(opener?.isConnected?opener:document.querySelector('[data-enlarge]'))?.focus({preventScroll:true});});
    document.body.append(dialog);
  }
  function enhance({detail} = {}) {
    const main=detail?.root?.querySelector('main') || document.querySelector('.page-layer:not(.page-layer-outgoing) main,body>main');
    if(main===activeMain){position();return;}
    activeMain=main;
    ++request;animation?.cancel();dialog?.remove();dialog=undefined;
    ensureDialog();
    if(!document.querySelector('#stage-display'))return;
    current=0;ensureDialog();position();
  }
  document.addEventListener('click',event=>{
    const version=event.target.closest('[data-version]');if(version)select(Number(version.dataset.version));
    const media=event.target.closest('[data-media]');if(media){ensureDialog();opener=media;dialog.querySelector('#gallery-title').textContent=media.dataset.mediaTitle;dialog.querySelector('.gallery-controls').innerHTML='';dialog.querySelector('.gallery-image').innerHTML=`<img src="${media.dataset.media}" alt="${escape(media.dataset.mediaTitle)}">`;dialog.showModal();revealViewer(media);dialog.querySelector('[data-close-gallery]').focus();}
    const open=event.target.closest('[data-enlarge]');if(open){ensureDialog();opener=open;dialog.querySelector('#gallery-title').textContent='Website development';dialog.querySelector('.gallery-controls').innerHTML=controls();dialog.querySelector('.gallery-image').innerHTML=`<img src="${stages[current].image}" alt="${stages[current].label} version of the personal website">`;dialog.showModal();revealViewer(open);position();dialog.querySelector('[data-close-gallery]').focus();}
    if(event.target.closest('[data-close-gallery]'))closeViewer();
  });
  document.addEventListener('mars:page',enhance);
  document.addEventListener('mars:prepare',enhance);
  addEventListener('resize',()=>position());
  reduced.addEventListener('change',()=>{animation?.cancel();position();});
  document.fonts.ready.then(()=>position());enhance();
})();
