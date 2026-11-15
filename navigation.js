let siteNavigationCleanup;
let siteNavigationSelect;

function initializeSiteNavigation() {
  siteNavigationCleanup?.();
  siteNavigationSelect = undefined;
  const nav = document.querySelector('#site-nav');
  const toggle = document.querySelector('.menu-toggle');
  if (!nav || !toggle) return;
  const links = [...nav.querySelectorAll('a')];
  const controller = new AbortController();
  const options = { signal: controller.signal };
  const indicator = document.createElement('span');
  indicator.className = 'nav-indicator';
  indicator.setAttribute('aria-hidden', 'true');
  nav.prepend(indicator);
  nav.classList.add('nav-has-indicator');
  let frame,motionFrame,lastTime;
  const spring={value:[0,0,0,0],velocity:[0,0,0,0],target:[0,0,0,0]};
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  function paint(){
    const [x,y,width,height]=spring.value;
    indicator.style.width=width+'px';indicator.style.height=height+'px';
    indicator.style.transform=`translate3d(${x}px,${y}px,0)`;
  }
  function step(now){
    const dt=Math.min(.032,(now-lastTime)/1000||.016);lastTime=now;
    let moving=false;
    for(let i=0;i<4;i++){
      const distance=spring.value[i]-spring.target[i],v=spring.velocity[i],w=22,e=Math.exp(-w*dt),c=v+w*distance;
      spring.value[i]=spring.target[i]+(distance+c*dt)*e;
      spring.velocity[i]=(v-w*c*dt)*e;
      if(Math.abs(spring.value[i]-spring.target[i])>.02||Math.abs(spring.velocity[i])>.05)moving=true;
    }
    paint();motionFrame=moving?requestAnimationFrame(step):undefined;
  }
  function position(animate = false) {
    document.documentElement.classList.toggle('large-text',parseFloat(getComputedStyle(document.documentElement).fontSize)>24);
    const selected = nav.querySelector('[aria-current="page"]');
    document.documentElement.style.setProperty('--mobile-nav-height',nav.offsetHeight+'px');
    if (!selected || !nav.offsetWidth) return;
    indicator.style.transition='none';
    spring.target=[selected.offsetLeft,selected.offsetTop,selected.offsetWidth,selected.offsetHeight];
    if(!animate||reduce.matches){
      cancelAnimationFrame(motionFrame);motionFrame=undefined;
      spring.value=[...spring.target];spring.velocity.fill(0);paint();
    }else if(!motionFrame){lastTime=performance.now();motionFrame=requestAnimationFrame(step);}
    indicator.style.opacity='1';
    nav.classList.add('indicator-ready');
  }
  function refresh() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => position());
  }
  function closeMenu() {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
  }
  siteNavigationSelect = (url, animate) => {
    let label = '';
    links.forEach(link => {
      const selected = new URL(link.href).pathname === url.pathname;
      link.classList.remove('is-selected');
      if (selected) { link.setAttribute('aria-current', 'page'); label = link.textContent; }
      else link.removeAttribute('aria-current');
    });
    const mobileLabel = document.querySelector('.mobile-page-label');
    if (mobileLabel) mobileLabel.textContent = label;
    position(animate);
    closeMenu();
  };
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    if (open) position();
  }, options);
  document.addEventListener('click', event => {
    if (!event.target.closest('.site-header')) closeMenu();
  }, options);
  toggle.closest('.site-header').addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) { closeMenu(); toggle.focus(); }
  }, options);
  nav.addEventListener('keydown', event => {
    const index = links.indexOf(event.target);
    if (index < 0) return;
    let next;
    if (['ArrowRight', 'ArrowDown'].includes(event.key)) next = (index + 1) % links.length;
    if (['ArrowLeft', 'ArrowUp'].includes(event.key)) next = (index - 1 + links.length) % links.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = links.length - 1;
    if (next !== undefined) { event.preventDefault(); links[next].focus(); }
  }, options);
  matchMedia('(min-width: 651px)').addEventListener('change', () => { closeMenu(); refresh(); }, options);
  const observer = new ResizeObserver(refresh);
  observer.observe(nav);
  links.forEach(link => observer.observe(link));
  document.fonts.ready.then(() => { if (!controller.signal.aborted) refresh(); });
  position();
  siteNavigationCleanup = () => {
    controller.abort(); observer.disconnect(); cancelAnimationFrame(frame);cancelAnimationFrame(motionFrame);
    indicator.remove(); nav.classList.remove('nav-has-indicator', 'indicator-ready');
  };
}

// Progressive enhancement: every route is still a standalone static HTML page.
const SiteNavigation = (() => {
  const routes = new Set(['home.html', 'workspace.html', 'portfolio.html', 'about.html']);
  const cache = new Map();
  const pending = new Map();
  const scrollPositions = new Map();
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const initialURL = new URL(location.href);
  const welcomeSnapshot = document.body.classList.contains('welcome-page')
    ? { body: document.body.innerHTML, title: document.title,
      description: document.querySelector('meta[name="description"]')?.content } : null;
  let serial = 0;
  let sequence = 0;
  let currentURL = new URL(location.href);
  let currentKey;
  let finishTransition;
  let interruptTransition;
  const keyFor = url => url.pathname + url.search;
  const newKey = () => `${Date.now()}-${++serial}`;
  function entry(url, replace = false) {
    currentKey = newKey();
    history[replace ? 'replaceState' : 'pushState'](
      { ...history.state, marsNavigation: currentKey }, '', url.href);
    currentURL = new URL(url.href);
  }
  if (location.protocol !== 'file:') {
    currentKey = history.state?.marsNavigation;
    if (!currentKey) entry(currentURL, true);
    history.scrollRestoration = 'manual';
  }
  function saveScroll() {
    if (currentKey) scrollPositions.set(currentKey, [scrollX, scrollY]);
  }
  function remember(url, html) {
    const key = keyFor(url);
    cache.delete(key); cache.set(key, html);
    while (cache.size > 4) cache.delete(cache.keys().next().value);
  }
  function isContent(url) {
    return url.origin === location.origin
      && url.pathname.slice(0, url.pathname.lastIndexOf('/') + 1)
        === initialURL.pathname.slice(0, initialURL.pathname.lastIndexOf('/') + 1)
      && routes.has(url.pathname.split('/').pop());
  }
  async function prepareImages(doc, url, signal) {
    const images=[...doc.querySelectorAll('main img')].filter(image=>!image.closest('[hidden]')).slice(0,2);
    await Promise.all(images.map(async node=>{
      const image=new Image();image.src=new URL(node.getAttribute('src'),url).href;
      let onAbort;
      try {
        await Promise.race([image.decode().catch(()=>{}),new Promise((resolve,reject)=>{
          onAbort=()=>reject(new DOMException('Navigation expired','AbortError'));
          if(signal.aborted)onAbort();else signal.addEventListener('abort',onAbort,{once:true});
        })]);
      } finally {if(onAbort)signal.removeEventListener('abort',onAbort);}
      if(signal.aborted)throw new DOMException('Navigation expired','AbortError');
    }));
  }
  async function loadPage(url) {
    const key = keyFor(url);
    if (cache.has(key)) return new DOMParser().parseFromString(cache.get(key), 'text/html');
    if(pending.get(key)?.controller.signal.aborted)pending.delete(key);
    if (!pending.has(key)) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const request = (async () => {
        try {
          const response = await fetch(key, { signal: controller.signal });
          if (!response.ok) throw new Error('Destination unavailable');
          const html = await response.text();
          const doc = new DOMParser().parseFromString(html, 'text/html');
          if (!doc.querySelector('.site-header') || !doc.querySelector('main') || !doc.querySelector('footer')) {
            throw new Error('Missing page structure');
          }
          await prepareImages(doc, url, controller.signal);
          remember(url, html);
          return html;
        } finally { clearTimeout(timeout); if(pending.get(key)?.controller===controller)pending.delete(key); }
      })();
      pending.set(key, {request, controller});
    }
    return new DOMParser().parseFromString(await pending.get(key).request, 'text/html');
  }
  function wrapContent(root = document.body) {
    let stack = root.querySelector('.page-stack');
    if (stack) return stack;
    const main = root.querySelector(':scope > main');
    if (!root.classList.contains('site-page') || !main) return null;
    stack = document.createElement('div'); stack.className = 'page-stack';
    const layer = document.createElement('div'); layer.className = 'page-layer';
    main.before(stack); stack.append(layer); layer.append(main);
    const footer = root.querySelector(':scope > footer');
    if (footer) layer.append(footer);
    return stack;
  }
  function metadata(doc) {
    document.title = doc.title;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = doc.querySelector('meta[name="description"]')?.content || '';
  }
  function place(url, key, restore = false) {
    let anchor;
    try { anchor = url.hash && document.getElementById(decodeURIComponent(url.hash.slice(1))); } catch { /* Use page top for an invalid hash. */ }
    const target = anchor || document.querySelector('.page-layer:not(.page-layer-outgoing) main, body > main');
    if (restore && scrollPositions.has(key)) window.scrollTo(...scrollPositions.get(key));
    else if (anchor) anchor.scrollIntoView({ block: 'start', behavior: 'instant' });
    else window.scrollTo(0, 0);
    if (target) { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
  }
  function retireIdentifiers(layer,ticket) {
    // #main carries the page width/padding. Preserve it before renaming IDs.
    layer.querySelectorAll('main').forEach(main=>{
      const style=getComputedStyle(main);
      for(const property of ['width','max-width','margin-left','margin-right','padding-left','padding-right','min-height','box-sizing'])main.style.setProperty(property,style.getPropertyValue(property));
    });
    const identifiers=new Map();
    layer.querySelectorAll('[id]').forEach(node=>{const old=node.id,next=`retired-${ticket}-${old}`;identifiers.set(old,next);node.id=next;});
    layer.querySelectorAll('*').forEach(node=>{
      for(const attribute of [...node.attributes]) {
        let value=attribute.value;
        value=value.replace(/url\((['"]?)#([^)'"\s]+)\1\)/g,(all,quote,id)=>identifiers.has(id)?`url(#${identifiers.get(id)})`:all);
        if(['aria-labelledby','aria-describedby'].includes(attribute.name))value=value.split(/\s+/).map(id=>identifiers.get(id)||id).join(' ');
        if(['href','xlink:href'].includes(attribute.name)&&value.startsWith('#')&&identifiers.has(value.slice(1)))value='#'+identifiers.get(value.slice(1));
        if(value!==attribute.value)node.setAttribute(attribute.name,value);
      }
    });
  }
  async function navigate(url, { restore = false, key } = {}) {
    const ticket=++sequence;
    document.querySelectorAll('#site-nav a').forEach(link=>{
      if(new URL(link.href).pathname===url.pathname)link.setAttribute('aria-busy','true');
      else link.removeAttribute('aria-busy');
    });
    saveScroll();
    for(const [pendingKey,work] of pending)if(pendingKey!==keyFor(url))work.controller.abort();
    try {
      const doc=await loadPage(url);
      if(ticket!==sequence)return;
      const frozen=interruptTransition?.();
      const stack=wrapContent();if(!stack)throw new Error('No page shell');
      const outgoing=frozen||stack.querySelector(':scope > .page-layer');
      outgoing.querySelectorAll('video').forEach(video=>video.pause());
      const oldRect=outgoing.getBoundingClientRect();
      const incoming=document.createElement('div');incoming.className='page-layer page-layer-incoming';
      incoming.append(doc.querySelector('main'),doc.querySelector('footer'));
      const moving=!motion.matches&&Boolean(Element.prototype.animate);
      if(moving){incoming.style.opacity='0';incoming.style.transform='translateY(8px)';}
      // Freeze the actual on-screen position before scroll restoration or layout changes.
      stack.style.minHeight=oldRect.height+'px';
      outgoing.classList.add('page-layer-outgoing');
      Object.assign(outgoing.style,{top:oldRect.top+'px',left:oldRect.left+'px',width:oldRect.width+'px',height:oldRect.height+'px'});
      outgoing.inert=true;outgoing.setAttribute('aria-hidden','true');
      retireIdentifiers(outgoing,ticket);
      stack.append(incoming);
      stack.style.minHeight=Math.max(oldRect.height,incoming.getBoundingClientRect().height)+'px';
      metadata(doc);
      if(restore){currentKey=key;currentURL=new URL(url.href);}else entry(url);
      siteNavigationSelect?.(url,!restore&&moving);
      place(url,currentKey,restore);
      document.dispatchEvent(new CustomEvent('mars:prepare'));
      let animations=[],done=false;
      const finish=()=>{
        if(done)return;done=true;
        animations.forEach(animation=>animation.cancel());outgoing.remove();
        incoming.style.opacity='';incoming.style.transform='';incoming.classList.remove('page-layer-incoming');
        if(finishTransition===finish){stack.style.minHeight='';finishTransition=undefined;interruptTransition=undefined;}
      };
      finishTransition=finish;
      interruptTransition=()=>{
        if(done)return;
        done=true;
        // Preserve the visible composite, including both partially faded layers.
        // A new destination fades over these exact presentation values.
        const layers=[outgoing,incoming].map(node=>({node,rect:node.getBoundingClientRect(),opacity:getComputedStyle(node).opacity}));
        animations.forEach(animation=>animation.cancel());
        const frozen=document.createElement('div');frozen.className='page-layer';
        Object.assign(frozen.style,{position:'fixed',inset:'0',width:innerWidth+'px',height:innerHeight+'px',pointerEvents:'none',overflow:'hidden'});
        for(const {node,rect,opacity} of layers){
          node.classList.remove('page-layer-incoming');
          Object.assign(node.style,{position:'fixed',top:rect.top+'px',left:rect.left+'px',width:rect.width+'px',height:rect.height+'px',transform:'none',opacity});
          frozen.append(node);
        }
        stack.append(frozen);finishTransition=undefined;interruptTransition=undefined;
        return frozen;
      };
      if(moving){
        animations=[
          outgoing.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-8px)'}],{duration:160,easing:'ease-out',fill:'both'}),
          incoming.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:220,delay:60,easing:'cubic-bezier(.2,.65,.25,1)',fill:'both'})
        ];
        await Promise.allSettled(animations.map(animation=>animation.finished));
      }
      finish();if(ticket!==sequence)return;
      document.dispatchEvent(new CustomEvent('mars:page',{detail:{restore}}));
    }catch{if(ticket===sequence)location.assign(url.href);}
    finally{if(ticket===sequence)document.querySelectorAll('#site-nav [aria-busy]').forEach(link=>link.removeAttribute('aria-busy'));}
  }
  function adoptWelcomePage(url) {
    saveScroll(); entry(url); wrapContent(); initializeSiteNavigation();
    document.dispatchEvent(new CustomEvent('mars:page'));
  }
  function prepareWelcomePage(root) {
    wrapContent(root);
    initializeSiteNavigation();
    document.dispatchEvent(new CustomEvent('mars:prepare', {detail:{root}}));
  }
  function prefetch(event) {
    const link = event.target.closest('a[href]');
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const url = new URL(link.href);
    if (isContent(url)) loadPage(url).catch(() => {});
  }
  document.addEventListener('pointerover', prefetch);
  document.addEventListener('focusin', prefetch);
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href]');
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const url = new URL(link.href);
    if (!isContent(url) || !document.body.classList.contains('site-page') || location.protocol === 'file:') return;
    event.preventDefault();
    if (keyFor(url) === keyFor(currentURL)) {
      ++sequence; finishTransition?.();
      if (url.hash !== new URL(location.href).hash) { saveScroll(); entry(url); }
      siteNavigationSelect?.(url, false); place(url, currentKey); document.dispatchEvent(new CustomEvent('mars:anchor'));
      return;
    }
    navigate(url);
  });
  window.addEventListener('popstate', () => {
    const url = new URL(location.href);
    const key = history.state?.marsNavigation || newKey();
    if (!history.state?.marsNavigation) history.replaceState({ ...history.state, marsNavigation: key }, '', url.href);
    if (welcomeSnapshot && keyFor(url) === keyFor(initialURL)) {
      ++sequence; saveScroll(); finishTransition?.(); siteNavigationCleanup?.();
      document.body.innerHTML = welcomeSnapshot.body;
      document.body.className = 'welcome-page welcome-restored';
      document.title = welcomeSnapshot.title;
      document.querySelector('meta[name="description"]').content = welcomeSnapshot.description || '';
      currentKey = key; currentURL = url;
      if (typeof initializeWelcome === 'function') initializeWelcome();
      place(url, key, true);
    } else if (isContent(url)) {
      if (!document.body.classList.contains('site-page')) {
        const ticket = ++sequence;
        saveScroll();
        loadPage(url).then(doc => {
          if (ticket !== sequence) return;
          if (typeof welcomeCleanup === 'function') welcomeCleanup();
          document.body.replaceChildren(...doc.body.childNodes);
          document.body.className = 'site-page arrival-complete';
          metadata(doc); currentKey = key; currentURL = url;
          wrapContent(); initializeSiteNavigation(); place(url, key, true);
          document.dispatchEvent(new CustomEvent('mars:page', {detail:{restore:true}}));
        }).catch(() => { if (ticket === sequence) location.assign(url.href); });
      } else navigate(url, { restore: true, key });
    }
  });
  window.addEventListener('pagehide', saveScroll);
  window.addEventListener('pageshow', event => {
    if (event.persisted) { finishTransition?.(); initializeSiteNavigation(); }
  });
  if (document.body.classList.contains('site-page')) remember(currentURL, document.documentElement.outerHTML);
  wrapContent(); initializeSiteNavigation();
  return { loadPage, prepareWelcomePage, adoptWelcomePage };
})();
