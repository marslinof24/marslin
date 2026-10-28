# Complete HIG prototype — 2026-10-28

Branch: `prototype/hig-full-site`. Source: `hig-site/`. Review status: functional local beta, awaiting the owner's visual review. Nothing was pushed or merged into `main` or `develop`.

## Start

From the repository root, run `python -m http.server 4173 --bind 127.0.0.1` and open http://127.0.0.1:4173/hig-site/index.html . All four content pages, Welcome, cursor, fonts and screenshots are isolated in that directory. Portfolio/About retain their approved content order. There is no A/B/C switcher in this integrated preview.

## Design decisions

- B provides the reading structure and workspace index; A provides the metal M and restrained metal identity; C contributes large image viewing.
- Home has two contextual project entries: the hero CTA and one linked project card. Duplicate card-level buttons were removed. Main navigation still links to the portfolio overview.
- Workspace prioritizes screenshots, with compact HackMD/GitHub resource links. Three actual development screenshots share a 16:10 contain frame. Missing Linux/Data captures remain labeled placeholders.
- One persistent header, glass selection surface and cursor serve the four pages. Mobile navigation floats above the safe area, with content padding derived from its real height.
- Welcome retains the 2-second, fourfold logo zoom and the 2/3/4-second text sequence, skip control and flying-label arrival. On mobile the label docks into the actual visible bottom navigation. Enlarged text can grow the Welcome page and scroll rather than clip.
- Main text is darker; glass stays in the functional controls. Text and inputs use an appropriate text cursor. Font and cursor assets remain self-hosted.

## Git milestones

| Node | Meaning |
| --- | --- |
| `9ec5b73` | `feat(prototype): add complete isolated HIG site preview` |
| `cc3357d` | `fix(navigation): coordinate transitions and restore scroll safely` |
| `hig-full-v0.1.0-alpha.1` | First complete navigable alpha, before later validation fixes |
| `8c463b6` | `style(ui): unify readable surfaces and responsive controls` |
| `d9b2ca0` | `fix(gallery): prepare version controls before page entry` |
| `ea9642e` | `fix(navigation): keep workspace anchors consistent` |
| `35c6829` | `fix(navigation): preserve outgoing layout and SVG references` |
| `0af99d8` | `fix(cursor): reuse the preloaded glass cursor across all pages` |
| `hig-full-v0.1.0-beta.1` | Completed validation record and local review checkpoint |

Conventional Commits describe changes; branch names describe the work; annotated version tags identify milestones. Existing commits and tags were not rewritten. Publishing either the branch or its tags still requires a separate explicit instruction.

## Transition implementation and measured regression

HTML requests are prefetched and shared in memory. Necessary images decode before content entry. Failed or six-second-expired requests fall back to native navigation. Stale requests/animations are canceled so the final choice wins.

Outgoing content stays at its viewport position while the incoming page remains in document flow. Scroll/anchor placement happens before animation. Exit is 160ms; entry is 220ms with a 60ms delay; motion is at most 8px. Reduced motion switches directly. Metadata, selection, keyboard focus and history remain synchronized.

A passive frame observer found a real retirement bug: removing old identifiers also removed the `#main` layout styles. The old content widened from 1256px to about 1425px and jumped left on its first exit frame. Renaming identifiers now preserves the old main's measured width/spacing and rewrites SVG gradient and accessibility references.

The same observer then reported `outgoingLayoutJump: false`, the original 1256px width, valid SVG references, an incoming opacity of zero before reveal, one stable header and cursor, and one content layer after completion. The sampled exit moved exactly 8px. `transition-after.json` contains the actual recorded sample; this is evidence from this browser/session, not a universal frame-rate guarantee.

## Validation

- Existing Home entry regression tests were run against the isolated files: 7 passed. All preview JavaScript passed Node syntax checks.
- All five HTML documents were checked for existing local assets and links that remain inside `hig-site/`.
- Welcome's Home, Portfolio, Workspace and Contact Me routes were exercised. Contact Me focuses About's contact section. Back restores Welcome without replay; forward restores the content page.
- All four pages were checked at 1440×900, 1920×1080 and 390×844 with no horizontal overflow. Welcome fits the regular desktop/mobile viewport; the large desktop sample preserved a nav ratio of approximately 1:1.618. Short 390×500 windows use ordinary scrolling.
- Reload, direct Home entry, main navigation, project/contact anchors, back/forward, nonzero scroll restoration, rapid sequential selections and canceled transition cleanup were exercised.
- A local QA server delayed HTML fetches by 800ms, returned HTTP 503 to fetches, and delayed fetches beyond six seconds. The old page remained visible while waiting; failure and timeout reached a valid destination through native navigation without leftover transition layers.
- Image version selection, enlarged viewing, Escape and focus restoration were checked, including the mobile viewport. Workspace's selected item updates the URL hash and page-level navigation can return to the website view.
- Temporary QA fixtures exercised 200% root text, reduced-motion JavaScript branches and solid material fallbacks. Enlarged Welcome labels reached 46px; mobile Welcome grew vertically with its footer in flow instead of clipping. Other enlarged content pages retained enough bottom padding for the taller mobile nav.
- Production-source and content-studio-draft SHA-256 fingerprints were unchanged after implementation.

Testing used the desktop in-app browser with viewport overrides. Text enlargement and accessibility/material modes were controlled simulations, not physical iPhone/Safari tests or a full accessibility certification. No formal test framework or third-party runtime was added.

## Reproduce the transition observation

Run `python hig-full-study/qa/server.py` from the repository root. It serves loopback port 4176 using the real preview files, adding only passive observation to HTML responses.

Open `http://127.0.0.1:4176/hig-site/about.html?_qa=normal`, use the primary navigation, and inspect the hidden `#full-probe-result` output after a transition. `outgoingLayoutJump` is the regression signal. Query modes `slow`, `fail` and `timeout` simulate the corresponding fetch conditions while allowing native document navigation to complete. QA files are outside the preview site and are not required to run it.

## Review artifacts and next step

Adjacent PNG files show Welcome, the four content pages and the mobile Workspace. The complete beta is for visual review; the owner can request adjustments before deciding how to integrate it into the production site. A visual selection never implicitly authorizes a push.
