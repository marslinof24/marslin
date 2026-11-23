# Workspace motion prototype

Local-only direction study, 2026-11-17. Branch:
`codex/prototype/workspace-motion`. No production file changes, no push.

## Question and scope

Can the approved compact Workspace gain an engaging, centered exercise carousel
and a restrained studio-inspired motion language without losing the metal brand
or adding dependencies? The owner requested one preview of this direction, so
there is one integrated variant, not an additional A/B/C comparison interface.

Entry: `workspace-motion-prototype.html?exercise=linux#coursework`.
Serve this checkout with Python's static server, for example:
`python -m http.server 4182 --bind 127.0.0.1`.

## Design and behavior

- Larger Workspace typography; original M with CSS metallic shading and shallow
  pointer-driven perspective. This is CSS layering, not a WebGL scene.
- One-time content reveals. No scroll hijacking, autoplay, or continuous render
  loop. Reduced-motion CSS removes movement and transitions.
- Web scraping, Git, Dialog in Linux. One centered current slide with adjacent
  previews, arrows, pagination, local arrow-key handling, and pointer swipes.
- Only the current slide is interactive and exposed to assistive technology.
  An accessible live status announces selection. Each preview opens its own note.
- Selection lives in `?exercise=`; the anchor stays `#coursework`. This avoids
  native fragment scrolling into an offscreen slide after reload.
- Existing website version controls and image viewer are reused. Prototype links
  to other pages lead to existing local pages; it is a Workspace design study,
  not a replacement for the complete website or Welcome.

## Reference and deployment evidence

https://mowa.studio/ was read and visually inspected. Its browser-rendered 3D
hero, large typography, project imagery, and reveal rhythm informed this study.
No source, models, textures, screenshots, or proprietary effects were copied.
Its own description identifies Three.js/WebGL; this study uses neither.

https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
states that Pages hosts static HTML, CSS, and JavaScript. The prototype consists
only of these and local images/SVG/fonts, with relative paths. It needs no server
runtime, database, paid tool, build step, or external animation library.
Browser-side WebGL can also be served statically, but device/GPU support and asset
size remain separate performance questions. No Pages deployment was performed.

## Local verification

- Actual browser: next/previous selection, Linux inclusion, keyboard selection,
  native pointer drag, pagination, and query-selected reload.
- 390 × 844 and 1440 × 844 iframe simulations: no horizontal document overflow;
  one interactive slide; final center error below one CSS pixel.
- Rapid requests update one track transform; CSS transitions retarget rather
  than retaining outgoing cloned content. No body/page replacement is used.
- The same relative resources load under the nested `/candidate/` test path,
  simulating project-site hosting beneath a path such as `/marslin/`.
- JavaScript syntax and local media/link references checked. Reduced-motion
  rules inspected; no physical-device, GPU trace, or full OS accessibility audit
  was performed. Native pointer dragging in a narrow frame is not proof of a
  physical touch-device test.

This is a throwaway study. Production integration and deployment require a later
decision; do not silently promote the prototype into the normal Workspace route.

## Removed from the public site — 2026-11-23

The owner confirmed this study was not meant to be public. Its three files were
removed from `main`; the study remains intact on
`codex/prototype/workspace-motion` (local and remote) for later reference.
