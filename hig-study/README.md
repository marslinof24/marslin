# HIG prototype study — 2026-10-28

Status: local prototype; no design winner selected and no publication authorized.
Branch: `prototype/hig-study`, based on `develop`.

## Run and compare

From the project root, run `python -m http.server 4173 --bind 127.0.0.1`.
Open http://127.0.0.1:4173/hig-prototype.html?view=home&variant=A .
Use the Prototype A/B/C bar and Home/Workspace navigation. The URL preserves page and variant on reload and browser history navigation.

- A — Metal refined: retained metal frame and split hero; workspace index below the image. Mobile Menu navigation.
- B — Balanced glass: light floating navigation, a separate project reading surface, workspace image with a side index. Mobile bottom navigation.
- C — Content immersive: compact introduction and large project art; exhibition-size screenshots with floating version controls and a separate caption. Mobile bottom navigation.

Content is a snapshot of the accepted site, not the content studio draft. All variants share the same text, links and real images. Existing Portfolio/About links leave the prototype and open the accepted local pages. Welcome is unchanged. These are browser approximations of HIG principles, not native SwiftUI components or native Liquid Glass.

## Design rationale and sources

- Keep glass in controls/navigation, with stable reading surfaces: [Materials](https://developer.apple.com/design/human-interface-guidelines/materials).
- Use a grouped selection for related screenshot versions, retaining links for top-level navigation: [Segmented controls](https://developer.apple.com/design/human-interface-guidelines/segmented-controls), [Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars).
- Keep feedback brief and avoid blocking frequent actions: [Motion](https://developer.apple.com/design/human-interface-guidelines/motion).
- Preserve readable type, text enlargement, focus visibility and contrast: [Typography](https://developer.apple.com/design/human-interface-guidelines/typography), [Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility).

44×44 CSS px is the prototype's web target, not a claim that Apple's native points and CSS pixels are interchangeable. Larger text may increase control height and enable ordinary vertical scrolling.

## Verification

- Syntax checked with Node; no dependencies or formal test framework added.
- All six page/variant combinations inspected at 1440×900 and 390×844; document width remained within the visible width.
- Mobile A Menu opens and navigates; B/C bottom navigation and Prototype controls have separate reserved space.
- Version selection swaps image and caption; keyboard Tab changes focus without changing selection. Linux/Data show honest placeholders, and returning to Personal website restores its version viewer.
- Image dialog switches versions, closes with Escape, and returns focus to the image opener. Native browser zoom is not intercepted.
- Back, forward and reload restore the page/variant URL.
- A temporary local QA fixture exercised 200% root text at desktop and 390×844 across all six combinations without horizontal overflow; bottom controls remained separated.
- The fixture explicitly disabled background blur and exercised the reduced-motion JavaScript path with matching reduced-motion CSS. Selection transitions were `none`. This was a controlled simulation, not OS-level accessibility or a separate unsupported browser engine test.
- Mobile fixed navigation initially inherited the filtered header as its containing block; removing header blur on mobile and applying blur to the nav fixed its position. Dynamic control-height spacing also fixed a small overlap at 200% text.
- No production HTML, shared production CSS/JS, Welcome files or content-studio drafts were edited. No push was performed.

## Saved views

The adjacent PNGs contain A/B/C Home and Workspace captures at desktop size, plus the B mobile workspace detail. They document this comparison rather than establish a final selection. A future selection can mix elements before integration into the accepted site.
