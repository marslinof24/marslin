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
  let frame;
  function position(animate = false) {
    const selected = nav.querySelector('[aria-current="page"]');
    document.documentElement.style.setProperty('--mobile-nav-height',nav.offsetHeight+'px');
    if (!selected || !nav.offsetWidth) return;
    if (!animate) indicator.style.transition = 'none';
    indicator.style.width = `${selected.offsetWidth}px`;
    indicator.style.height = `${selected.offsetHeight}px`;
    indicator.style.transform = `translate3d(${selected.offsetLeft}px, ${selected.offsetTop}px, 0)`;
    indicator.style.opacity = '1';
    if (!animate) {
      indicator.getBoundingClientRect(); // Commit geometry before enabling motion.
      indicator.style.transition = '';
    }
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
  matchMedia('(min-width: 601px)').addEventListener('change', () => { closeMenu(); refresh(); }, options);
  const observer = new ResizeObserver(refresh);
  observer.observe(nav);
  links.forEach(link => observer.observe(link));
  document.fonts.ready.then(() => { if (!controller.signal.aborted) refresh(); });
  position();
  siteNavigationCleanup = () => {
    controller.abort(); observer.disconnect(); cancelAnimationFrame(frame);
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
  function wrapContent() {
    let stack = document.querySelector('.page-stack');
    if (stack) return stack;
    const main = document.querySelector('body > main');
    if (!document.body.classList.contains('site-page') || !main) return null;
    stack = document.createElement('div'); stack.className = 'page-stack';
    const layer = document.createElement('div'); layer.className = 'page-layer';
    main.before(stack); stack.append(layer); layer.append(main);
    const footer = document.querySelector('body > footer');
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
  async function navigate(url, { restore = false, key } = {}) {
    const ticket=++sequence;
    saveScroll();finishTransition?.();
    for(const [pendingKey,work] of pending)if(pendingKey!==keyFor(url))work.controller.abort();
    try {
      const doc=await loadPage(url);
      if(ticket!==sequence)return;
      const stack=wrapContent();if(!stack)throw new Error('No page shell');
      const outgoing=stack.querySelector('.page-layer');
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
      outgoing.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));
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
        if(finishTransition===finish){stack.style.minHeight='';finishTransition=undefined;}
      };
      finishTransition=finish;
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
  }
  function adoptWelcomePage(url) {
    saveScroll(); entry(url); wrapContent(); initializeSiteNavigation();
    document.dispatchEvent(new CustomEvent('mars:page'));
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
      if (url.hash !== currentURL.hash) { saveScroll(); entry(url); }
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
  return { loadPage, adoptWelcomePage };
})();
