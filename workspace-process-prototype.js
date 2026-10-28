// Prototype only. Three layouts, real screenshots, no persistence or publication.
(() => {
  const stages = [
    { title: 'The first version', phase: 'First layout', image: 'assets/prototype/website-first.png', text: 'The original silver palette, circular M, and “People first.” introduction.' },
    { title: 'Finding the material', phase: 'Metal exploration', image: 'assets/prototype/website-metal.png', text: 'A darker metal palette and a more compact mark, while retaining the original page structure.' },
    { title: 'A clearer direction', phase: 'Selected homepage layout', image: 'assets/prototype/website-preview.png', text: 'Project collaboration moves to the foreground, with a more direct route to projects and technical practice.' }
  ];
  const names = ['A · Development timeline', 'B · Version viewer', 'C · Visual overview'];
  let variant = ['A','B','C'].indexOf(new URL(location.href).searchParams.get('variant'));
  if (variant < 0) variant = 0;
  let selected = 0;
  const layout = document.querySelector('#process-layout');
  function figure(stage) {
    return `<figure><img src="${stage.image}" alt="${stage.phase} — actual saved website screenshot" loading="lazy"><figcaption><p class="phase">${stage.phase}</p><h3>${stage.title}</h3><p>${stage.text}</p></figcaption></figure>`;
  }
  function render() {
    layout.className = variant === 0 ? 'process-timeline' : variant === 2 ? 'process-gallery' : 'process-viewer';
    layout.innerHTML = variant === 1
      ? `<div class="process-tabs" role="group" aria-label="Choose a development version">${stages.map((s,i)=>`<button type="button" data-version="${i}" aria-pressed="${selected===i}">${s.phase}</button>`).join('')}</div>${figure(stages[selected])}`
      : stages.map(figure).join('');
    document.querySelector('#process-state').textContent = `Prototype · ${names[variant]}`;
    const url = new URL(location.href); url.searchParams.set('variant', ['A','B','C'][variant]);
    history.replaceState(history.state, '', url);
  }
  function cycle(step) { variant = (variant + step + 3) % 3; render(); }
  document.addEventListener('click', event => {
    const step = event.target.closest('[data-step]');
    if (step) cycle(Number(step.dataset.step));
    const version = event.target.closest('[data-version]');
    if (version) { selected = Number(version.dataset.version); render(); }
    const capture = event.target.closest('[data-capture]');
    if (capture) document.querySelector('#development-process').hidden = capture.dataset.capture !== 'website';
  });
  document.addEventListener('keydown', event => {
    if (event.target.closest('input,textarea,select,button,a,[contenteditable], [role="slider"]') || event.altKey || event.ctrlKey || event.metaKey) return;
    if (['ArrowLeft','ArrowRight'].includes(event.key)) { event.preventDefault(); cycle(event.key === 'ArrowRight' ? 1 : -1); }
  });
  render();
})();
