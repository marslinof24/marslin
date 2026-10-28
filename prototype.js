// THROWAWAY UI PROTOTYPE. Compare each page's reading hierarchy independently.
// Home A, Portfolio C, Workspace B, and About A are approved. No publishing.
(() => {
  const variantsByView = {
    home: { A: 'Position first', B: 'Project first', C: 'Personal index' },
    portfolio: { A: 'Editorial story', B: 'Outcome first', C: 'Project dossier' },
    workspace: { A: 'Screen gallery', B: 'Workbench', C: 'Capture journal' },
    about: { A: 'Quiet editorial', B: 'Personal corner', C: 'Open journal' },
  };
  const approvedVariants = { home: 'A', portfolio: 'C', workspace: 'B', about: 'A' };
  const pageVariants = { home: 'A', portfolio: 'C', workspace: 'B', about: 'A' };
  const viewNames = { home: 'Home', portfolio: 'Portfolio', workspace: 'Workspace', about: 'About' };
  const main = document.querySelector('#main');
  const nav = document.querySelector('#site-nav');
  const indicator = nav.querySelector('.nav-indicator');
  const menu = document.querySelector('.menu-toggle');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let variant = 'A';
  let view = 'home';
  let renderTicket = 0;
  let materialCleanup = () => {};
  let markNumber = 0;
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname) || location.protocol === 'file:';
  document.body.classList.toggle('is-local-prototype', local);
  history.scrollRestoration = 'manual';

  function urlFor(nextView, hash = '') {
    const nextVariant = nextView === view ? variant : approvedVariants[nextView] || pageVariants[nextView];
    return `prototype.html?view=${nextView}&variant=${nextVariant}${hash}`;
  }
  function link(nextView, text, className = 'text-link', hash = '') {
    const label = text.includes('class="project-poster"') ? ' aria-label="View research project"' : '';
    return `<a class="${className}" href="${urlFor(nextView, hash)}" data-view="${nextView}"${label}>${text}</a>`;
  }
  function metalMark(extraClass = '') {
    const id = `prototype-metal-${++markNumber}`;
    const path = 'M32 68L43 35C46 27 51 28 49 37L44 60C43 65 45 66 48 60L64 36C69 28 75 29 72 39L65 60C63 67 67 70 73 65L81 58';
    return `<div class="metal-scene ${extraClass}" data-metal>
      <div class="metal-object"><svg viewBox="22 16 66 65" fill="none" role="img" aria-labelledby="${id}-title">
        <title id="${id}-title">Mars Lin's handwritten M in brushed metal</title>
        <defs><linearGradient id="${id}" x1="31" y1="26" x2="76" y2="73" gradientUnits="userSpaceOnUse">
          <stop stop-color="#b2c0c9"/><stop offset=".16" stop-color="#f2f5f6"/><stop offset=".34" stop-color="#a8b8c2"/>
          <stop offset=".52" stop-color="#718591"/><stop offset=".68" stop-color="#d6e0e5"/><stop offset="1" stop-color="#657c8c"/>
        </linearGradient></defs>
        <g stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
          <path class="m-depth" d="${path}"/><path class="m-edge" d="${path}"/><path d="${path}" stroke="url(#${id})"/>
        </g>
      </svg></div>
    </div>`;
  }
  function poster() {
    return `<div class="project-poster" aria-hidden="true"><div class="poster-lines"></div>
      <div class="poster-type"><span>Games.</span><span>People.</span><span>Perspectives.</span></div><div class="poster-dot"></div></div>`;
  }
  const topics = [
    ['Web development', 'Foundational HTML and CSS, alongside PHP and Apache environment setup.', 'web'],
    ['Data & programming', 'Basic Python, SQL CRUD operations, and MariaDB connections.', 'data'],
    ['Linux', 'Installation, configuration, and setting up a working environment.', 'linux'],
  ];
  function topicLinks(withDetails = false) {
    return `<div class="topic-links">${topics.map(([name, description, id]) => link('workspace',
      `${name}${withDetails ? `<p>${description}</p>` : ''}`, '', `#${id}`)).join('')}</div>`;
  }
  function workspaceStrip() {
    return `<section class="workspace-strip" aria-labelledby="learning-heading"><div><h2 id="learning-heading">A work in progress.</h2>
      <p>Technical practice, notes, and things I'm learning along the way.</p></div>${topicLinks()}</section>`;
  }
  function featuredProject() {
    return `<section class="featured-section" aria-labelledby="selected-heading">
      <div class="section-heading"><h2 id="selected-heading">Selected project</h2>${link('portfolio', 'View portfolio', '')}</div>
      <div class="featured-project">${link('portfolio', poster(), 'feature-visual')}
        <div class="feature-copy"><p class="work-type">Graduation research · NCCU</p>
          <h3>Ethnic representation,<br>through players' eyes.</h3>
          <p>A research project on games and ethnic representation. My role: align the team, clarify deliverables, and coordinate the work.</p>
          ${link('portfolio', 'Explore the project')}</div>
      </div></section>`;
  }
  function VariantA() {
    return `<div class="home-a"><section class="intro-grid" aria-labelledby="intro-title"><div>
      <p class="role-line">Mars Lin · Project coordination</p>
      <h1 id="intro-title">People aligned.<br>Projects moving.</h1>
      <p class="lead">I bring a human perspective to project work—connecting people, clarifying what needs to happen, and keeping things moving.</p>
      <div class="actions">${link('portfolio', 'View selected project', 'button-primary')}${link('about', 'A little about me')}</div>
      </div>${metalMark('intro-art')}</section>${featuredProject()}${workspaceStrip()}</div>`;
  }
  function VariantB() {
    return `<div class="home-b"><section aria-labelledby="b-title">
      <div class="b-introduction"><h1 id="b-title">Mars Lin.<br>People aligned. Projects moving.</h1><p>Project coordination, informed by a background in ethnology and a growing technical foundation.</p></div>
      ${link('portfolio', poster(), 'feature-visual b-project')}
      <div class="b-caption"><div><p class="work-type">Graduation research · NCCU</p><h2>Ethnic representation,<br>through players' eyes.</h2></div>${link('portfolio', 'View selected project', 'button-primary')}</div>
      </section><section class="b-notes" aria-label="Project overview"><div><h3>Bringing the work together.</h3><p>I coordinated the advisor and team, clarified documentary and report requirements, and managed the schedule.</p></div>
      <div><h3>A result that found an audience.</h3><p>The department adopted the project results and requested permission to use them in evaluation displays and recruitment.</p>${link('portfolio', 'Read the case study')}</div></section>
      ${workspaceStrip()}</div>`;
  }
  function VariantC() {
    return `<div class="home-c"><section class="c-profile" aria-labelledby="c-title">${metalMark()}
      <p class="role-line">Mars Lin · Project coordination</p><h1 id="c-title">People aligned.<br>Projects moving.</h1>
      <p>I connect people, clarify deliverables, and coordinate the work. My starting point is a human perspective.</p>
      <div class="actions">${link('portfolio', 'View selected project', 'button-primary')}${link('about', 'About me')}</div></section>
      <div class="c-index"><section aria-labelledby="c-project-heading"><p class="c-section-title">Selected project</p>
        ${link('portfolio', `<h2 id="c-project-heading">Ethnic representation,<br>through players' eyes.</h2><p>Research on games and ethnic representation, brought together through project coordination.</p>`, 'c-project-title')}
        ${link('portfolio', poster(), 'feature-visual')}<p class="work-type">Graduation research · NCCU</p></section>
        <section aria-labelledby="c-workspace-heading"><h2 class="c-section-title" id="c-workspace-heading">Workspace</h2>${topicLinks(true)}</section>
        ${link('workspace', 'Visit my workspace')}</div></div>`;
  }
  function PortfolioA() {
    return `<article class="portfolio-page"><header class="page-intro case-intro"><div><p class="role-line">Graduation research · National Chengchi University</p>
      <h1>Ethnic representation,<br>through players' eyes.</h1></div><div class="case-facts"><strong>Project lead</strong><p>September 2025 – January 2026</p></div></header>
      <div class="case-cover">${poster()}</div><div class="case-body">
      <section class="case-section"><h2>The goal</h2><p>Explore players' impressions of ethnic groups through video games, and bring the research together in a documentary and written report.</p></section>
      <section class="case-section"><h2>My role</h2><p>I coordinated the advisor and team, clarified requirements for the documentary and written report, and managed the project schedule.</p></section>
      <section class="case-section"><h2>The workflow</h2><div><p>The coordination work connected people, requirements, and delivery.</p>
        <div class="process-flow" aria-label="Project coordination workflow">
          <div class="process-step"><h3>Align</h3><p>Clarify the deliverables with the advisor and team.</p></div>
          <div class="process-step"><h3>Coordinate</h3><p>Keep the team and project schedule connected.</p></div>
          <div class="process-step"><h3>Deliver</h3><p>Bring the documentary and written report together.</p></div>
        </div></div></section>
      <section class="case-section"><h2>The result</h2><p class="outcome">The department adopted the project results and requested permission to use them in evaluation displays and recruitment.</p></section></div>
      <section class="case-end"><h2>A human perspective.<br>A practical way forward.</h2>${link('about', "Let's connect", 'button-primary', '#links')}</section></article>`;
  }
  const caseContent = {
    goal: "Explore players' impressions of ethnic groups through video games, and bring the research together in a documentary and written report.",
    role: 'I coordinated the advisor and team, clarified requirements for the documentary and written report, and managed the project schedule.',
    result: 'The department adopted the project results and requested permission to use them in evaluation displays and recruitment.',
    steps: [
      ['Align', 'Clarify the deliverables with the advisor and team.'],
      ['Coordinate', 'Keep the team and project schedule connected.'],
      ['Deliver', 'Bring the documentary and written report together.'],
    ],
  };
  function workflow(className) {
    return `<div class="${className}" aria-label="Project coordination workflow">${caseContent.steps.map(([title, text]) =>
      `<div class="workflow-item"><h3>${title}</h3><p>${text}</p></div>`).join('')}</div>`;
  }
  function PortfolioB() {
    return `<article class="portfolio-impact"><header class="impact-intro"><p class="role-line">Graduation research · National Chengchi University</p>
      <h1>Ethnic representation,<br>through players' eyes.</h1><div class="impact-facts"><span>Project lead</span><span>September 2025 – January 2026</span></div></header>
      <section class="impact-result" aria-labelledby="impact-heading"><div><h2 id="impact-heading">Adopted by<br>the department.</h2>
        <p>The department requested permission to use the project results in evaluation displays and recruitment.</p></div>
        <div class="impact-deliverables"><h3>Project deliverables</h3><p>Documentary</p><p>Written report</p></div></section>
      <div class="impact-overview"><section><h2>The goal</h2><p>${caseContent.goal}</p></section><section><h2>My role</h2><p>${caseContent.role}</p></section></div>
      <section class="impact-process" aria-labelledby="impact-process-heading"><div class="impact-art">${poster()}</div><div><h2 id="impact-process-heading">Bringing the work together.</h2>
        <p>The coordination work connected people, requirements, and delivery.</p>${workflow('impact-workflow')}</div></section>
      <section class="case-end"><h2>A human perspective.<br>A practical way forward.</h2>${link('about', "Let's connect", 'button-primary', '#links')}</section></article>`;
  }
  function PortfolioC() {
    return `${portfolioProfile()}<article class="portfolio-dossier" id="portfolio-project"><aside class="dossier-summary"><p class="role-line">Graduation research · NCCU</p><h1>Ethnic representation,<br>through players' eyes.</h1>
      <div class="dossier-facts"><strong>Project lead</strong><p>September 2025 – January 2026</p></div>
      <nav class="dossier-nav" aria-label="Case study sections"><a href="#case-goal">The goal</a><a href="#case-role">My role</a><a href="#case-workflow">The workflow</a><a href="#case-result">The result</a></nav>
      <div class="dossier-art">${poster()}</div></aside>
      <div class="dossier-body"><section class="dossier-section" id="case-goal"><h2>The goal</h2><p>${caseContent.goal}</p></section>
      <section class="dossier-section" id="case-role"><h2>My role</h2><p>${caseContent.role}</p><ul class="role-list"><li>Advisor & team coordination</li><li>Requirements for documentary & report</li><li>Project schedule management</li></ul></section>
      <section class="dossier-section" id="case-workflow"><h2>The workflow</h2><p>The coordination work connected people, requirements, and delivery.</p>${workflow('dossier-workflow')}</section>
      <section class="dossier-section dossier-result" id="case-result"><h2>The result</h2><p>${caseContent.result}</p></section>
      <section class="dossier-contact"><h2>Let's keep in touch.</h2>${link('about', "Find me elsewhere", 'text-link', '#links')}</section></div></article>`;
  }
  const captures = [
    { id: 'website', title: 'Personal website', image: 'assets/prototype/website-preview.png', description: 'An actual local capture of the selected homepage prototype. Built with HTML, CSS, and JavaScript.', status: 'Local prototype capture' },
    { id: 'linux', title: 'Linux environment', description: 'A place for an environment screenshot, with its setup notes alongside.', status: 'Screenshot to add' },
    { id: 'data', title: 'Data & queries', description: 'A place for database practice, query results, and the notes behind them.', status: 'Screenshot to add' },
  ];
  function captureFrame(item) {
    return `<div class="capture-frame${item.image ? '' : ' is-placeholder'}">${item.image
      ? `<img src="${item.image}" alt="Actual local screenshot of the selected personal website homepage A" width="1425" height="790">`
      : '<div class="capture-empty"><span class="empty-image" aria-hidden="true"></span><span>Screenshot to add</span></div>'}</div>`;
  }
  function captureLinks(item) {
    return item.image ? '<a class="text-link" href="https://github.com/marslinof24/marslin">View repository</a>' : '<span class="capture-pending">Related notes to add</span>';
  }
  function captureCaption(item) {
    return `<div class="capture-caption"><p class="capture-status">${item.status}</p><h2>${item.title}</h2><p>${item.description}</p>${captureLinks(item)}</div>`;
  }
  function stations() {
    return `<section class="workstations" aria-labelledby="stations-heading"><h2 id="stations-heading">Workstations</h2><div class="station-items"><div class="station-card station-pending"><strong>HackMD</strong><span>Personal link to add</span></div><a class="station-card" href="https://github.com/marslinof24"><strong>GitHub</strong><span>Code & repositories</span></a></div></section>`;
  }
  function workspaceIntro(title) {
    return `<header class="page-intro ws-intro"><h1>${title}</h1><p>Screens from my practice. Notes and workstations behind the work.</p></header>`;
  }
  function WorkspaceA() {
    return `<div class="ws-page ws-a">${workspaceIntro('Inside my<br>workspace.')}<div class="ws-gallery-layout"><section class="ws-gallery" aria-label="Screen captures">${captures.map(item => `<article class="capture-card" id="${item.id}">${captureFrame(item)}${captureCaption(item)}</article>`).join('')}</section><aside>${stations()}</aside></div></div>`;
  }
  function WorkspaceB() {
    return `<div class="ws-page ws-b">${workspaceIntro('An open workbench.')}${stations()}<div class="ws-workbench"><section id="capture-viewer" class="capture-viewer" aria-live="polite" aria-atomic="true">${captureFrame(captures[0])}${captureCaption(captures[0])}</section><div class="capture-picker" role="group" aria-label="Choose a screen capture">${captures.map((item, i) => `<button type="button" data-capture="${item.id}" aria-pressed="${i === 0}">${captureFrame(item)}<strong>${item.title}</strong><span>${item.status}</span></button>`).join('')}</div></div></div>`;
  }
  function WorkspaceC() {
    return `<div class="ws-page ws-c"><div class="ws-journal-heading">${workspaceIntro('Screens &<br>side notes.')}${stations()}</div><section class="capture-journal" aria-label="Screens and their notes">${captures.map(item => `<article class="journal-entry" id="${item.id}">${captureFrame(item)}${captureCaption(item)}</article>`).join('')}</section></div>`;
  }
  const aboutFacts = {
    intro: "I'm Mars Lin, a 2026 Ethnology graduate from National Chengchi University, exploring IT project management and design-related work.",
    research: 'Leading a graduation research project taught me to align people, clarify deliverables, and manage schedules.',
    teaching: 'Teaching English from 2023 to 2026 strengthened my ability to make unfamiliar ideas easier to understand.',
    learning: "I'm developing skills in web development, Python, SQL, MariaDB, and Linux. My interests bring together people, digital games, and technology.",
  };
  function aboutContact() {
    return `<section class="about-connect" id="links" aria-labelledby="about-connect-title"><div><h2 id="about-connect-title">Let's connect.</h2><p>Find me and my work here.</p></div><div class="about-social"><a href="https://www.linkedin.com/in/mars-lin-han">LinkedIn</a><a href="https://github.com/marslinof24">GitHub</a></div></section>`;
  }
  function portfolioProfile() {
    return `<section class="about-c portfolio-profile" id="portfolio-profile" aria-labelledby="profile-heading"><aside class="about-profile"><p class="role-line">Background & experience</p><h2 id="profile-heading">Mars Lin.</h2><p>${aboutFacts.intro}</p><nav aria-label="Background sections"><a href="#background">Background</a><a href="#experience">Experience</a><a href="#practice">Technical practice</a><a href="#links">Contact</a></nav></aside><div class="about-resume"><section id="background"><h2>Background</h2><h3>Ethnology</h3><p>National Chengchi University · 2026 graduate</p></section><section id="experience"><h2>Experience</h2><div class="resume-entry"><h3>Graduation research</h3><p>${aboutFacts.research}</p><a class="text-link" href="#case-goal">View project</a></div><div class="resume-entry"><h3>English teaching</h3><p class="resume-date">2023–2026</p><p>${aboutFacts.teaching}</p></div></section><section id="practice"><h2>Technical practice</h2><p>${aboutFacts.learning}</p>${link('workspace', 'Open workspace')}</section>${aboutContact()}</div></section>`;
  }
  const personalCopy = {
    lead: 'Lately, my curiosity has been taking me between AI, interfaces, and the people using them.',
    ai: "I'm exploring embeddings and RAG, especially how to improve the workflow and understand the technologies behind it.",
    ui: 'I keep coming back to the relationship between UI and the people using it: how an interface responds, how an interaction feels, and how the two fit together.',
  };
  function personalInterests() {
    return `<section><h2>Looking closer at AI.</h2><p>${personalCopy.ai}</p></section><section><h2>The feeling of an interface.</h2><p>${personalCopy.ui}</p></section>`;
  }
  function personalSocial() {
    return `<section class="personal-social" id="links" aria-labelledby="personal-social-heading"><div><h2 id="personal-social-heading">Find me elsewhere.</h2><p>A few ways to stay in touch.</p></div><div class="personal-social-list"><div class="personal-social-pending"><span>Instagram</span><span>Profile link to add</span></div><div class="personal-social-pending"><span>X</span><span>Profile link to add</span></div><a href="https://www.linkedin.com/in/mars-lin-han"><span>LinkedIn</span><span>Let's connect</span></a><a href="https://github.com/marslinof24"><span>GitHub</span><span>Code & practice</span></a></div></section>`;
  }
  function personalOpening() {
    return `<header class="personal-opening"><p class="role-line">Hi, I'm Mars.</p><h1>A little<br>more me.</h1><p class="personal-lead">${personalCopy.lead}</p></header>`;
  }
  function AboutA() {
    return `<article class="about-personal personal-editorial">${personalOpening()}<div class="personal-body"><aside class="personal-aside"><p>What has my attention lately.</p>${link('workspace', 'Explore my workspace')}</aside><div class="personal-interests">${personalInterests()}</div></div>${personalSocial()}</article>`;
  }
  function AboutB() {
    return `<article class="personal-corner"><aside class="corner-profile">${personalOpening()}${personalSocial()}</aside><div class="corner-notes"><div class="corner-note-heading"><h2>On my mind lately.</h2>${link('workspace', 'Explore my workspace')}</div><div class="personal-interests">${personalInterests()}</div></div></article>`;
  }
  function AboutC() {
    return `<article class="personal-journal">${personalOpening()}${personalSocial()}<div class="journal-interests"><h2>What has my attention lately.</h2><div class="personal-interests">${personalInterests()}</div>${link('workspace', 'Explore my workspace')}</div></article>`;
  }
  function positionIndicator(animate = false) {
    const selected = nav.querySelector('[aria-current="page"]');
    if (!selected || !nav.offsetWidth) return;
    if (!animate) indicator.style.transition = 'none';
    indicator.style.width = `${selected.offsetWidth}px`;
    indicator.style.height = `${selected.offsetHeight}px`;
    indicator.style.transform = `translate3d(${selected.offsetLeft}px,${selected.offsetTop}px,0)`;
    indicator.style.opacity = '1';
    if (!animate) { indicator.getBoundingClientRect(); indicator.style.transition = ''; }
    nav.classList.add('indicator-ready');
  }
  function closeMenu() {
    nav.classList.remove('is-open');
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Open navigation');
  }
  function bindMaterial() {
    materialCleanup();
    const controller = new AbortController();
    const scenes = [...main.querySelectorAll('[data-metal]')];
    let frame;
    function reset() {
      cancelAnimationFrame(frame);
      scenes.forEach(scene => {
        scene.classList.remove('is-reacting');
        ['--rx', '--ry', '--light-x', '--light-y'].forEach(prop => scene.style.removeProperty(prop));
      });
    }
    scenes.forEach(scene => {
      scene.addEventListener('pointermove', event => {
        if (!finePointer.matches || reducedMotion.matches || event.pointerType === 'touch') return;
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
    main.querySelector('#light-position')?.addEventListener('input', event => {
      if (reducedMotion.matches || !finePointer.matches) return;
      scenes[0]?.style.setProperty('--light-x', `${event.target.value}%`);
    }, { signal: controller.signal });
    reducedMotion.addEventListener('change', reset, { signal: controller.signal });
    finePointer.addEventListener('change', reset, { signal: controller.signal });
    materialCleanup = () => { controller.abort(); reset(); };
  }
  async function render({ animate = false, focus = false } = {}) {
    const ticket = ++renderTicket;
    const params = new URLSearchParams(location.search);
    view = Object.hasOwn(viewNames, params.get('view')) ? params.get('view') : 'home';
    const variantNames = variantsByView[view];
    variant = Object.hasOwn(variantNames, params.get('variant')) ? params.get('variant') : pageVariants[view];
    pageVariants[view] = variant;
    document.title = `${viewNames[view]} — Mars Lin · Prototype ${variant}`;
    document.querySelector('#prototype-variant').textContent = `${variant} — ${variantNames[variant]}`;
    document.querySelector('#prototype-context').textContent = `Prototype · ${viewNames[view]}${approvedVariants[view] ? ` · Selected ${approvedVariants[view]}` : ''}`;
    document.querySelectorAll('[data-cycle]').forEach(button => { button.disabled = Object.keys(variantNames).length < 2; });
    document.querySelector('.mobile-page-label').textContent = viewNames[view];
    document.querySelectorAll('a[data-view]').forEach(anchor => {
      const target = anchor.dataset.view;
      const hash = new URL(anchor.href).hash;
      anchor.href = urlFor(target, hash);
      if (nav.contains(anchor)) {
        if (target === view) anchor.setAttribute('aria-current', 'page');
        else anchor.removeAttribute('aria-current');
      }
    });
    positionIndicator(animate && !reducedMotion.matches);
    closeMenu();
    const markup = view === 'about' ? ({ A: AboutA, B: AboutB, C: AboutC }[variant])()
      : view === 'home' ? ({ A: VariantA, B: VariantB, C: VariantC }[variant])()
      : view === 'portfolio' ? ({ A: PortfolioA, B: PortfolioB, C: PortfolioC }[variant])()
      : ({ A: WorkspaceA, B: WorkspaceB, C: WorkspaceC }[variant])();
    if (ticket !== renderTicket) return;
    materialCleanup();
    main.getAnimations().forEach(animation => animation.cancel());
    main.innerHTML = markup;
    main.querySelectorAll('a[href="workspace.html"]').forEach(anchor => {
      anchor.href = urlFor('workspace'); anchor.dataset.view = 'workspace';
    });
    bindMaterial();
    if (animate && !reducedMotion.matches && main.animate) {
      main.animate([{ opacity: .6, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }],
        { duration: 280, easing: 'cubic-bezier(.2,.65,.25,1)' });
    }
    const target = location.hash ? document.getElementById(location.hash.slice(1)) : null;
    if (target?.matches('details')) target.open = true;
    if (focus) { (target || main).setAttribute('tabindex', '-1'); (target || main).focus({ preventScroll: true }); }
    requestAnimationFrame(() => {
      if (ticket !== renderTicket) return;
      if (target) target.scrollIntoView({ block: 'start' });
      else window.scrollTo(0, 0);
    });
  }
  function go(nextView, { replace = false, hash = '' } = {}) {
    history[replace ? 'replaceState' : 'pushState']({}, '', urlFor(nextView, hash));
    render({ animate: true, focus: true });
  }
  function cycle(direction) {
    const keys = Object.keys(variantsByView[view]);
    if (keys.length < 2) return;
    variant = keys[(keys.indexOf(variant) + direction + keys.length) % keys.length];
    pageVariants[view] = variant;
    go(view, { replace: true });
  }
  document.addEventListener('click', event => {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const cycleButton = event.target.closest('[data-cycle]');
    if (cycleButton && local) { cycle(Number(cycleButton.dataset.cycle)); return; }
    const captureButton = event.target.closest('[data-capture]');
    if (captureButton) {
      const item = captures.find(item => item.id === captureButton.dataset.capture);
      const viewer = main.querySelector('#capture-viewer');
      if (item && viewer) {
        viewer.innerHTML = captureFrame(item) + captureCaption(item);
        main.querySelectorAll('[data-capture]').forEach(button => button.setAttribute('aria-pressed', String(button === captureButton)));
      }
      return;
    }
    const anchor = event.target.closest('a[data-view]');
    if (!anchor) { if (!event.target.closest('.site-header')) closeMenu(); return; }
    event.preventDefault(); go(anchor.dataset.view, { hash: new URL(anchor.href).hash });
  });
  menu.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    if (open) positionIndicator();
  });
  nav.addEventListener('keydown', event => {
    const links = [...nav.querySelectorAll('a')];
    const index = links.indexOf(event.target);
    if (index < 0) return;
    let next;
    if (['ArrowRight', 'ArrowDown'].includes(event.key)) next = (index + 1) % links.length;
    if (['ArrowLeft', 'ArrowUp'].includes(event.key)) next = (index + links.length - 1) % links.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = links.length - 1;
    if (next !== undefined) { event.preventDefault(); event.stopPropagation(); links[next].focus(); }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) { closeMenu(); menu.focus(); return; }
    if (!local || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.target.closest('nav, input, textarea, select, [contenteditable], .menu-toggle, .capture-picker')) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); cycle(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  window.addEventListener('popstate', () => render({ focus: true }));
  const resizeObserver = new ResizeObserver(() => positionIndicator());
  resizeObserver.observe(nav);
  nav.querySelectorAll('a').forEach(anchor => resizeObserver.observe(anchor));
  document.fonts.ready.then(() => positionIndicator());
  matchMedia('(max-width:600px)').addEventListener('change', () => { closeMenu(); positionIndicator(); });
  render();
})();
