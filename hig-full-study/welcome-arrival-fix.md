# Welcome arrival continuity fix

Date: 2026-10-28. Scope: isolated `hig-site/` preview, local only.

## Problem and change

At the final handoff from Welcome to a content page, the fixed arrival container reserved a second scrollbar gutter. The content also acquired its `.site-page` styles, final page wrapper, and navigation indicator only after becoming visible. The flying label targeted the anchor's border rather than its rendered text.

The arrival container now uses the destination's body classes and the same page-stack structure before reveal, while the root alone reserves scrollbar width. Navigation and Workspace controls are prepared before entering. The temporary container supports programmatic scrolling without a second visible scrollbar. Final adoption moves the same prepared nodes into the document and transfers the exact scroll offset.

The flying label uses text Range bounds, then blends into the actual navigation label over160ms. Contact Me first joins the About control, then scrolls during the remaining reveal; no new scroll starts after adoption. Logo timing and the existing four-times zoom remain unchanged. Changed resources have a new `hig-arrival2` query version.

## Validation

Passive requestAnimationFrame observer injected by a temporary loopback-only server into the real HTML routes; no production code instrumentation. Compare the last frame in `.site-arrival` against the first frame after adoption. Fail when header/main position or main height differs by more than1 CSS px, or selected glass is absent before adoption.

- Baseline desktop1440×900: all four entrances jumped horizontally7.667px. Portfolio, Workspace and About also changed content height. Mobile390×844 Home heading shifted3.198px and its main height changed88.156px.
- After repair: desktop Home, Portfolio and Workspace retain header x137.333px and identical main heights across adoption. Remaining measured vertical difference is0–0.002px from the final reveal interpolation. Navigation glass exists on both sides.
- Mobile390×844: Home, Workspace and Contact Me pass the same geometry check. Contact transfers stage scroll837.333px to window scroll837.333px.
- Desktop Contact: height and viewport positions remain stable across adoption; scroll505.333px is transferred exactly. Mobile Contact additionally checked after coordinating the scroll with the reveal.
- Short viewport390×500: Portfolio adoption passes with zero position/height delta, one final content layer and no horizontal overflow.
- Workspace version selection, image dialog, Escape close and focus restoration verified after entering from Welcome.
- Normal Portfolio → Workspace navigation, Back and Forward verified after the wrapper change.
- Reduced-motion behavior simulated at the HTML-response level: native Welcome Home link opens Home; no arrival or flight layer remains. This is a simulation, not a physical-device or OS-preference test.
- Existing entry regression script:7/7 tests pass. Changed JavaScript syntax checks and `git diff --check` pass.

Browser viewport tests are simulations. Physical mobile Safari and a native OS reduced-motion preference were not tested. No guarantee is inferred about all hardware frame rates from geometry measurements.

No changes to production root pages, content-studio drafts or deployment settings. No push. Existing version tags remain unchanged.
