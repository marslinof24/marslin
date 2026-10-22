let siteNavigationCleanup;

function initializeSiteNavigation() {
  siteNavigationCleanup?.();
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#site-nav');
  if (!toggle || !nav) return;
  const header = toggle.closest('.site-header');
  const links = [...nav.querySelectorAll('a')];
  links.forEach(link => link.classList.remove('is-selected'));
  nav.classList.remove('indicator-ready');
  const controller = new AbortController();
  const options = { signal: controller.signal };
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const breakpoint = matchMedia('(min-width: 601px)');
  let selected = nav.querySelector('[aria-current="page"]') || links[0];
  let leaving = false;
  let frame;
  const indicator = document.createElement('span');
  indicator.className = 'nav-indicator';
  indicator.setAttribute('aria-hidden', 'true');
  nav.prepend(indicator);
  nav.classList.add('nav-has-indicator');

  function slideTo(link = selected) {
    if (!nav.offsetWidth || !link) return;
    indicator.style.width = `${link.offsetWidth}px`;
    indicator.style.height = `${link.offsetHeight}px`;
    indicator.style.transform = `translate3d(${link.offsetLeft}px, ${link.offsetTop}px, 0)`;
    indicator.style.opacity = '1';
  }
  function refresh() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      slideTo();
      nav.classList.add('indicator-ready');
    });
  }
  function closeMenu() {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
  }
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    if (open) refresh();
  }, options);
  header.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) {
      closeMenu();
      toggle.focus();
    }
  }, options);
  nav.addEventListener('keydown', event => {
    const index = links.indexOf(event.target);
    if (index < 0) return;
    let next;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % links.length;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + links.length) % links.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = links.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      links[next].focus();
    }
  }, options);

  document.addEventListener('click', async event => {
    const link = event.target.closest('a[href]');
    if (!link) {
      if (!event.target.closest('.site-header')) closeMenu();
      return;
    }
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey
      || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const destination = new URL(link.href);
    const current = new URL(location.href);
    const routes = ['index.html', 'home.html', 'portfolio.html', 'workspace.html', 'about.html'];
    if (destination.origin !== current.origin || !routes.includes(destination.pathname.split('/').pop())) return;
    if (destination.pathname === current.pathname && destination.search === current.search) {
      if (nav.contains(link)) {
        selected = link;
        slideTo();
        if (!destination.hash) event.preventDefault();
        closeMenu();
      }
      return;
    }
    if (motion.matches || !Element.prototype.animate) return;
    event.preventDefault();
    if (leaving) return;
    leaving = true;
    if (nav.contains(link)) {
      selected = link;
      nav.querySelectorAll('.is-selected').forEach(item => item.classList.remove('is-selected'));
      link.classList.add('is-selected');
      slideTo(link);
    }
    document.body.classList.add('page-is-leaving');
    try {
      // Let the glass focus reach the selected item before the page lifts away.
      await document.body.animate([
        { opacity: 1, transform: 'translateY(0)' },
        { opacity: 0, transform: 'translateY(-24px)' },
      ], { duration: 380, delay: nav.contains(link) ? 180 : 0,
        easing: 'cubic-bezier(.4, 0, .2, 1)', fill: 'forwards' }).finished;
    } finally {
      location.assign(destination.href);
    }
  }, options);
  breakpoint.addEventListener('change', () => { closeMenu(); refresh(); }, options);
  const observer = new ResizeObserver(refresh);
  observer.observe(nav);
  links.forEach(link => observer.observe(link));
  document.fonts.ready.then(() => { if (!controller.signal.aborted) refresh(); });
  refresh();
  siteNavigationCleanup = () => {
    controller.abort();
    observer.disconnect();
    cancelAnimationFrame(frame);
    indicator.remove();
    nav.classList.remove('nav-has-indicator', 'indicator-ready');
  };
}

// Restoring a page from the back/forward cache must also undo its outgoing fade.
window.addEventListener('pageshow', event => {
  if (!event.persisted) return;
  document.body.getAnimations().forEach(animation => animation.cancel());
  document.body.classList.remove('page-is-leaving');
  initializeSiteNavigation();
});
initializeSiteNavigation();
