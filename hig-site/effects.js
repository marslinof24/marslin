// Local integrated build. Effects enhance fully readable static HTML.
(() => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  let cleanup = () => {};
  let observer;
  let viewerAnimation;
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
  document.addEventListener('mars:page', enhance);
  enhance();
})();
