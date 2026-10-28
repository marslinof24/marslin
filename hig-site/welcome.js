// Progressive enhancement: every destination remains a normal static HTML link.
let welcomeCleanup;
function initializeWelcome() {
  welcomeCleanup?.();
  const navigation = document.querySelector('.welcome-navigation');
  if (!navigation) return;
  let transitioning = false;
  const lifetime = new AbortController();
  let activeStage;
  let activeFlight;
  const activeAnimations = [];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const welcome = document.querySelector('.welcome');
  const content = document.querySelector('.welcome-content');
  const logoSlot = document.querySelector('.welcome-logo-slot');

  // Fit the navigation to the real viewport while preserving its golden rectangle.
  // Keep a readable minimum; unusually short viewports can scroll naturally.
  function fitWelcome() {
    const style = getComputedStyle(welcome);
    const safeSpace = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    const fixedHeight = content.offsetHeight - navigation.offsetHeight;
    const availableHeight = document.documentElement.clientHeight - safeSpace - fixedHeight;
    const width = Math.min(content.clientWidth, Math.max(220, Math.min(320, availableHeight / 1.618)));
    welcome.style.setProperty('--nav-width', `${width}px`);
    // The placeholder reserves the logo's final visible box inside the centered stack.
    const dockTop = logoSlot.getBoundingClientRect().top - welcome.getBoundingClientRect().top
      - (22.75 - 16.38) / 2;
    welcome.style.setProperty('--logo-dock-top', `${dockTop}px`);
  }
  let layoutFrame;
  function scheduleLayout() {
    cancelAnimationFrame(layoutFrame);
    layoutFrame = requestAnimationFrame(fitWelcome);
  }
  const layoutObserver = new ResizeObserver(scheduleLayout);
  layoutObserver.observe(content);
  window.addEventListener('resize', scheduleLayout);
  fitWelcome();
  document.fonts.ready.then(() => { if (!lifetime.signal.aborted) scheduleLayout(); });
  welcomeCleanup = () => {
    lifetime.abort();
    activeAnimations.forEach(animation => animation.cancel());
    activeStage?.remove();
    activeFlight?.remove();
    layoutObserver.disconnect();
    window.removeEventListener('resize', scheduleLayout);
    cancelAnimationFrame(layoutFrame);
  };

  navigation.addEventListener('click', async (event) => {
    const link = event.target.closest('a');
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (reducedMotion.matches || !Element.prototype.animate || location.protocol === 'file:') return;
    event.preventDefault();
    if (transitioning) return;
    transitioning = true;
    const destination = new URL(link.href);
    let stage;
    let flight;
    try {
      link.setAttribute('aria-busy', 'true');
      const incoming = await SiteNavigation.loadPage(destination);
      if (lifetime.signal.aborted) return;
      if (!incoming.querySelector('.site-header') || !incoming.querySelector('main')) throw new Error('Missing page structure');

      const word = link.querySelector('.destination-word');
      const start = word.getBoundingClientRect();
      const wordStyle = getComputedStyle(word);
      flight = document.createElement('span');
      activeFlight = flight;
      flight.className = 'destination-flight';
      flight.textContent = word.textContent;
      flight.setAttribute('aria-hidden', 'true');
      Object.assign(flight.style, {
        left: `${start.left}px`, top: `${start.top}px`,
        fontSize: wordStyle.fontSize, lineHeight: wordStyle.lineHeight,
        fontFamily: wordStyle.fontFamily, fontWeight: wordStyle.fontWeight,
        letterSpacing: wordStyle.letterSpacing,
      });

      stage = document.createElement('div');
      activeStage = stage;
      stage.className = 'site-arrival';
      stage.inert = true;
      stage.setAttribute('aria-hidden', 'true');
      stage.append(...incoming.body.childNodes);
      document.body.append(stage, flight);
      document.body.classList.add('is-transitioning');

      const target = stage.querySelector('.nav a[aria-current="page"]');
      const end = target.getBoundingClientRect();
      const targetStyle = getComputedStyle(target);
      const scale = parseFloat(targetStyle.fontSize) / parseFloat(wordStyle.fontSize);
      // Desktop links include vertical padding; align the moving word to their text.
      const targetTop = end.top + parseFloat(targetStyle.paddingTop);
      target.style.opacity = '0';
      word.style.opacity = '0';

      const fadeOut = document.querySelector('.welcome').animate(
        [{ opacity: 1 }, { opacity: 0 }], { duration: 450, fill: 'forwards' });
      const skipFade = document.querySelector('.welcome-skip').animate(
        [{ opacity: 1 }, { opacity: 0 }], { duration: 250, fill: 'forwards' });
      const move = flight.animate([
        { transform: 'translate(0, 0) scale(1)' },
        { transform: `translate(${end.left - start.left}px, ${targetTop - start.top}px) scale(${scale})` },
      ], { duration: 1250, easing: 'cubic-bezier(.65, 0, .2, 1)', fill: 'forwards' });
      const header = stage.querySelector('.site-header').animate(
        [{ opacity: 0 }, { opacity: 1 }], { duration: 850, delay: 400, fill: 'forwards' });
      const reveal = stage.querySelector('main').animate(
        [{ opacity: 0, transform: 'translateY(22px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 1000, delay: 1000, easing: 'cubic-bezier(.2, .6, .2, 1)', fill: 'forwards' });
      const footer = stage.querySelector('footer')?.animate(
        [{ opacity: 0 }, { opacity: 1 }], { duration: 800, delay: 1200, fill: 'forwards' });
      activeAnimations.push(...[fadeOut, skipFade, move, header, reveal, footer].filter(Boolean));
      activeAnimations.forEach(animation => animation.finished.catch(() => {}));
      await move.finished;
      target.style.opacity = '';
      flight.remove();
      await Promise.all([reveal.finished, header.finished, footer?.finished]);

      // Adopt the actual destination DOM and URL, so refresh, Back, and normal links work.
      const children = [...stage.childNodes];
      layoutObserver.disconnect();
      window.removeEventListener('resize', scheduleLayout);
      cancelAnimationFrame(layoutFrame);
      for (const animation of [fadeOut, skipFade, move, header, reveal, footer]) animation?.cancel();
      document.body.replaceChildren(...children);
      document.body.className = incoming.body.className;
      document.body.classList.add('arrival-complete');
      document.title = incoming.title;
      const description = incoming.querySelector('meta[name="description"]');
      if (description) document.querySelector('meta[name="description"]').content = description.content;
      welcomeCleanup();
      SiteNavigation.adoptWelcomePage(destination);
      // Contact moves to the real anchor after the header has formed.
      const anchor = destination.hash && document.getElementById(destination.hash.slice(1));
      const focusTarget = anchor || document.querySelector('main');
      focusTarget.setAttribute('tabindex', '-1');
      focusTarget.focus({ preventScroll: true });
      if (anchor) anchor.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
      else window.scrollTo(0, 0);
    } catch {
      if (lifetime.signal.aborted) return;
      // Keep destinations usable on slow networks, blocked fetch, or unsupported transitions.
      stage?.remove();
      flight?.remove();
      location.assign(destination.href);
    }
  }, { signal: lifetime.signal });
}
initializeWelcome();
