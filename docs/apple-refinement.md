# Apple refinement — local review

Date: 2026-11-15. Branch: `feature/apple-refinement`.
Status: local preview only; production `main` remains at `ed3c949`. No push, Pages change, or content-studio draft edit in this iteration.

## Design decisions

Keep Nunito, the handwritten M, gray metal, functional glass, and the black-glass cursor. Refine heading tracking by size; body copy uses normal tracking and comfortable leading. Content sits on stable surfaces. Translucency stays on navigation and segmented controls.

Home features Perfect Solution (Demo). Workspace adds a separate summary and screenshot above the existing website history. Portfolio retains the resume first, followed by the new case and the existing graduation project. About retains its prose, quotation, and links. Existing research and learning anchors remain available.

The new case describes a development demo, its setup and feedback challenges, its current capabilities, and the next verification work. It does not claim equivalence with the real game. The interface currently uses the development title Arena Lab; the case explains that distinction.

## Public media boundary

The only new project assets are `arrange.png`, `interact.png`, `resume.png`, and `demo.webm` under `assets/perfect-solution/`. They show the application UI only. No private application source, configuration, architecture, binaries, internal documentation, or download links were copied into the website.

The approximately 24-second silent WebM is an actual browser-view capture of a prepared scenario playing at half speed. 545 screenshots were sampled over 24 seconds and encoded at their observed timestamps with native Canvas/MediaRecorder. It is sampled UI capture, not an independently measured full-frame-rate screen recording. Playback was verified at 23.82 seconds with visible progress and no media error. No autoplay. Screenshots remain available when video playback is unsupported.

## Interaction changes

- The selected navigation pill uses a native critically damped spring; retargeting preserves its current values and velocity. Resize and history restoration place it directly. Press and loading feedback do not change selection on hover or keyboard focus.
- A new navigation request leaves the visible page alone while loading. If it interrupts a running transition, the visible composite is frozen at its current geometry and opacity before the new fade begins. The background, header, and CSS cursor stay in the same document. Retired content IDs and all main layouts are preserved until removal.
- Welcome retains the two-second, four-times logo motion and the 2/3/4-second text sequence. A later choice wins during loading. The arriving header can be activated during the handoff; the same live nodes are adopted with their current animations before the persistent router handles the new choice.
- Version selection responds immediately. The previous screenshot stays visible until the next image decodes; failed decoding preserves that image and provides a status message. Decoding completion does not reset the indicator mid-slide.
- Image viewers open and close along the same short scale path anchored to the triggering image. Escape closes them and restores focus. Videos pause when leaving their page.
- At 200% text size, mobile navigation uses two rows to keep labels readable. Short windows allow necessary scrolling.

## Verification performed

Existing entry tests: 7/7 passed. JavaScript syntax, `git diff --check`, and local-resource checks passed (105 references at the initial resource pass; media included). No new dependencies or formal testing framework.

Actual browser viewport checks on Home, Workspace, Portfolio, and About: 1920×1080, 1440×900, 390×844, and 900×500. No horizontal overflow. Navigation links met the 44px minimum height. Complete screenshots caught and corrected a cover image height issue.

Browser operations checked: all four Welcome destinations, mid-entry navigation, latest choice during simulated 800ms loading, rapid content-page navigation, native fallback after simulated 503 and >6-second fetch delay, back/forward, URL reload, contact anchor, website screenshot selection, image viewing, Escape/focus return, keyboard focus without selection changes, and manual video playback.

Passive frame observation during navigation recorded a stable header y=24px, no missing header, and one unchanged glass cursor URL. A standard Contact Me adoption recorded identical main/header/navigation geometry immediately before and after adoption. Rapid navigation settled to one main, one page layer, and the final requested selection. These observations cover the exercised paths; they are not proof that every device has no dropped frames.

## Simulations and limits

390×844 is desktop-browser viewport emulation, not an actual phone. Reduced motion was tested through a local-only media-query harness. 200% text was tested through a local-only root-font override, including natural scrolling; browser zoom and OS font settings were not exhaustively tested. Background-blur fallback and forced-color CSS were inspected, not tested in an unsupported browser/physical accessibility configuration. Safari/iOS and touch hardware remain unverified. The preview makes no claim to native SwiftUI Liquid Glass.

QA harnesses, raw captures, and review screenshots remain in ignored local cache directories and are not part of the public site.

## Preview

From the website checkout, use an installed Python interpreter:

```powershell
python -m http.server 4182 --bind 127.0.0.1
```

Open `http://127.0.0.1:4182/index.html` for Welcome, then use the real HTML links. This iteration is intentionally labeled Local preview. Publishing requires a separate user instruction and removal of that label.
