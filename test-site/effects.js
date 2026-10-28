// Local integrated build. Effects enhance fully readable static HTML.
(() => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  let cleanup = () => {};
  let observer;
  let viewerAnimation;
  const shots = {
    website: { title: 'Personal website', status: 'Local prototype capture',
      description: 'An actual local capture of the selected homepage prototype. Built with HTML, CSS, and JavaScript.', image: '../assets/prototype/website-preview.png' },
    linux: { title: 'Linux environment', status: 'Screenshot to add',
      description: 'A place for an environment screenshot, with its setup notes alongside.' },
    data: { title: 'Data & queries', status: 'Screenshot to add',
      description: 'A place for database practice, query results, and the notes behind them.' },
  };
  function selectCapture(id, animate = true) {
    const item = shots[id];
    const viewer = document.querySelector('#capture-viewer');
    if (!item || !viewer) return;
    viewerAnimation?.cancel();
    viewer.innerHTML = `<div class="capture-frame${item.image ? '' : ' is-placeholder'}">${item.image
      ? `<img src="${item.image}" alt="Actual local screenshot of the selected personal website homepage A" width="1425" height="790">`
      : '<div class="capture-empty"><span class="empty-image" aria-hidden="true"></span><span>Screenshot to add</span></div>'}</div>
      <div class="capture-caption"><p class="capture-status">${item.status}</p><h2>${item.title}</h2><p>${item.description}</p>${item.image
        ? '<a class="text-link" href="https://github.com/marslinof24/marslin">View repository</a>'
        : '<span class="capture-pending">Related notes to add</span>'}</div>`;
    document.querySelectorAll('[data-capture]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.capture === id)));
    if (animate && !motion.matches) viewerAnimation = viewer.animate(
      [{ opacity: .3, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }],
      { duration: 280, easing: 'cubic-bezier(.2,.65,.25,1)' });
  }
  function enhance({ detail } = {}) {
    cleanup(); observer?.disconnect();
    const main = document.querySelector('.site-page main');
    if (!main) return;
    const controller = new AbortController();
    const animations = [];
    let frame;
    const scenes = [...main.querySelectorAll('[data-metal]')];
    function reset() {
      cancelAnimationFrame(frame);
      scenes.forEach(scene => {
        scene.classList.remove('is-reacting');
        ['--rx', '--ry', '--light-x', '--light-y'].forEach(prop => scene.style.removeProperty(prop));
      });
    }
    scenes.forEach(scene => {
      scene.addEventListener('pointermove', event => {
        if (!pointer.matches || motion.matches || event.pointerType === 'touch') return;
        const rect = scene.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          scene.classList.add('is-reacting');
          scene.style.setProperty('--ry', `${(x - .5) * 8}deg`);
          scene.style.setProperty('--rx', `${(.5 - y) * 8}deg`);
          scene.style.setProperty('--light-x', `${x * 100}%`);
          scene.style.setProperty('--light-y', `${y * 100}%`);
        });
      }, { signal: controller.signal });
      scene.addEventListener('pointerleave', reset, { signal: controller.signal });
    });
    motion.addEventListener('change', () => {
      reset(); observer?.disconnect(); animations.forEach(animation => animation.cancel());
      viewerAnimation?.cancel();
    }, { signal: controller.signal });
    pointer.addEventListener('change', reset, { signal: controller.signal });
    if (shots[location.hash.slice(1)]) selectCapture(location.hash.slice(1), false);
    // Leave the first viewport to the page transition; reveal lower sections once.
    if (!motion.matches && !detail?.restore && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        animations.push(entry.target.animate([
          { opacity: .25, transform: 'translateY(18px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ], { duration: 650, easing: 'cubic-bezier(.2,.65,.25,1)' }));
      }), { threshold: .08 });
      main.querySelectorAll('.featured-section,.workspace-strip,.about-resume>section,.dossier-section,.personal-body,.personal-social,.ws-workbench')
        .forEach(section => { if (section.getBoundingClientRect().top >= innerHeight) observer.observe(section); });
    }
    cleanup = () => { controller.abort(); reset(); observer?.disconnect(); animations.forEach(animation => animation.cancel()); viewerAnimation?.cancel(); };
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-capture]');
    if (!button || button.getAttribute('aria-pressed') === 'true') return;
    selectCapture(button.dataset.capture);
  });
  document.addEventListener('mars:page', enhance);
  enhance();
})();
