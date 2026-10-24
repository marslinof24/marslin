// Website development history, shared by direct visits and persistent navigation.
(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let animation;
  function syncVisibility() {
    const section = document.querySelector('#development-process');
    if (section) section.hidden = document.querySelector('[data-capture][aria-pressed="true"]')?.dataset.capture !== 'website';
  }
  document.addEventListener('click', event => {
    if (event.target.closest('[data-capture]')) syncVisibility();
    const button = event.target.closest('[data-development-version]');
    if (!button || button.getAttribute('aria-pressed') === 'true') return;
    const section = button.closest('#development-process');
    section.querySelectorAll('[data-development-version]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    section.querySelectorAll('[data-development-panel]').forEach(panel => {
      panel.hidden = panel.dataset.developmentPanel !== button.dataset.developmentVersion;
      if (!panel.hidden && !reducedMotion.matches) {
        animation?.cancel();
        animation = panel.animate([{opacity:.35,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:240,easing:'ease-out'});
      }
    });
  });
  reducedMotion.addEventListener('change', () => animation?.cancel());
  document.addEventListener('mars:page', syncVisibility);
  syncVisibility();
})();
