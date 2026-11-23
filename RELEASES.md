# Releases

## v1.4.0 — 2026-11-23

Publishes the Natural Titanium redesign and the 2026-11-23 review follow-ups.

- Applies the Natural Titanium finish from the Figma prototype through `titanium.css`: warm titanium ground, mirror-titanium navigation, dark titanium buttons, engraved links and rules, brushed cards, a graphite band for Home's featured project, a highlighted Portfolio outcome, and side-by-side About interest cards. The metal M moves from blue-steel to warm titanium.
- Home headline now reads "From ethnology to IT project management." Portfolio's profile navigation becomes a full on-page index.
- Main navigation follows Welcome's order: Home, Portfolio, Workspace, About. Footer items share one line; About no longer links to itself.
- Screenshots and course images share one graphite mat. About aligns to the shared left content edge.
- Removes the workspace motion study from the public site (it remains on `codex/prototype/workspace-motion`) and adds a `.gitignore` for the resume, content-studio drafts, caches and agent files.
- Retains Nunito, the "ThisisMarsLin" brand, Welcome timings, the black-glass cursor, the router, and all content and links.

Validated with Welcome and 390px navigation browser regressions (390px: 157 sampled frames per route, no overlap). Desktop navigation passed with reduced frame sampling because the in-app browser tab reported itself hidden. The seven Node entry tests were not run (Node is not installed on this machine). Physical devices and Safari/iOS remain unverified.

Development branches: `fix/review-followups`, `feature/titanium-redesign`. Annotated tag: `v1.4.0`. Previous production commit: `44d868c` (tag `v1.3.0`). Publication was explicitly authorized by the owner on 2026-11-23.

## v1.3.0 — 2026-11-17

Tagged at `44d868c` ("publish demo teaser and compact coursework previews"); this entry was added afterwards. Covers the Perfect Solution coming-soon presentation, genuine practice captures, compact Workspace course previews, and the workspace motion study (later unpublished in v1.4.0). See `docs/demo-teaser.md`, `docs/practice-captures.md` and `docs/workspace-course-preview.md`.

## v1.2.0 — 2026-11-16

Publishes the reviewed quiet editorial layout and navigation-continuity fixes.

- Home uses an unboxed featured project and a quieter secondary action.
- About uses a narrower reading column without the interests card or quote rule.
- Workspace prioritizes screenshots and simplifies its project index.
- Retains Nunito, the metal M, functional glass, the black-glass cursor, existing content, and Welcome timings.
- Replaces the sequential fade's near-empty interval with an immediately readable destination and a 180ms settle. Reserves incoming height and clips translated overflow to avoid a delayed scroll clamp.
- Restricts the temporary Welcome header handler to its lifetime and defers mid-flight retargeting until the current click dispatch completes.
- Animates the navigation spring with transforms rather than changing width and height every frame.

Validated with actual-page route and Welcome browser checks, 390px layout review, seven entry tests, and 110 local resource references. Physical Brave/GPU and other browser engines remain outside the completed checks. Before/after measurements and their limitations are recorded in `docs/navigation-continuity-comparison.md`.

Release branch: `codex/release/quiet-editorial-v1.2.0`. Annotated tag: `v1.2.0`. Previous production commit: `c837ec8`. The Current/Refined comparison directory is excluded from this release and retained on its local prototype branch. Publication was explicitly authorized by the owner on 2026-11-16; earlier local-only statements in design records describe the review phase.

## v1.1.1 — 2026-11-16

Fixes the transient 1px top border when leaving Portfolio. The zero-border override now follows the stable profile class when navigation retires outgoing IDs. Updated stylesheet versioning and browser regression checks cover Portfolio → Workspace and Portfolio → About at desktop and mobile widths.

Development branch: `fix/portfolio-transition-border`. No content or interaction timing changes.

## v1.1.0 — 2026-11-15

Publishes the reviewed Apple refinement and Perfect Solution (Demo) case.

- Refines typography and responsive control layout while retaining Nunito, M, metal, and the black-glass cursor.
- Features the development demo on Home, adds a Workspace summary, and preserves the resume and research case in Portfolio.
- Includes a manually playable development recording and three UI screenshots; no private application source or executable is distributed.
- Eliminates readable old/new page overlap with a 120ms exit followed by a 180ms entry, and prevents repeated active-link clicks from snapping the transition.
- Keeps the header and cursor, interruptible navigation, entry handoff, history, contact anchor, and image viewer behavior.
- Removes local-preview footer labels. Adds a dependency-free browser navigation regression page.

Validated locally with seven entry tests and desktop/mobile-width browser checks. Physical Brave/GPU and Safari/iOS testing remain outside the completed checks. Previous production commit: `ed3c949`. Development branch: `feature/apple-refinement`. Annotated release tag: `v1.1.0`.

## v1.0.0 — 2026-10-28

Promotes the reviewed HIG website from prototype `hig-full-v0.1.0-beta.2` to the public site root.

- Full Welcome, Home, Workspace, Portfolio and About experience with self-hosted Nunito, metal identity, glass navigation and black glass cursor.
- Persistent-document navigation, prefetch, history and scroll restoration.
- Welcome arrival prepares final layout and controls before reveal, aligns label text, and coordinates Contact scrolling.
- Workspace has three real development screenshots, version controls and an accessible enlarged-image dialog.
- Removes the unused About X placeholder and local-prototype footer labels.
- Keeps existing articles/links redirect URLs and all confirmed social/project links.

No backend, external runtime or paid dependency. GitHub Pages serves static files from main at the repository root. Tests and browser viewport simulations are recorded in the development branch; physical-device Safari validation remains outstanding.

Previous production commit: `6ac75cc`. Release branch: `release/hig-v1.0.0`. Annotated tag: `v1.0.0`.
