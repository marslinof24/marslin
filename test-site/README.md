# Local integrated website test

Open http://127.0.0.1:4173/test-site/index.html from the repository's static server.
From the repository root, the single server command is:

    python -m http.server 4173 --bind 127.0.0.1

Selected layouts: Home A, Portfolio C (profile before project), Workspace B,
About A. All pages contain their own static markup. The shared navigation keeps
the header and cursor in the same document, prefetches destinations, and retains
normal .html links, timeout fallback and browser history handling.

Welcome keeps the existing 2-second fourfold logo animation, 2/3/4-second text
sequence, golden navigation and word-to-header transition. Cursor, reduced motion,
mobile menu and forced-colors fallback remain. New restrained effects: lower-page
section reveals, M light/tilt (±4 degrees), link responses, and a short Workspace
viewer transition. Reduced motion skips animated enhancements.

The actual screenshot currently demonstrates the local Home A prototype.
Linux/data screenshots and personal Instagram/X/HackMD URLs are still pending.
This folder is a local review build, not a publication. No push/deploy is implied.
The root production pages and A/B/C comparison prototype remain available.

## Motion references and verification

Revisited the creators' own sites on 2026-10-23:
- https://dennissnellenberg.com/ — role / recent work / contact sequencing.
- https://immersive-g.com/ — experience-led projects and restrained material focus,
  informed by the earlier visual study in ../awwwards-research.md.
The added reveal, viewer and light-response animations are our design inference,
not claims that the source sites use this exact implementation. No external
source code, artwork, paid libraries, shaders or tracking services were added.

Verified in the browser:
- Welcome fit at 1920x1080, 1920x900, 1366x768 and 390x844, no overflow;
  measured navigation height/width approximately 1.618.
- Logo 2s; HI/I am Mars/rest delays 2s/3s/4s; Home and Contact word-to-header
  arrivals; contact anchor; Back to restored Welcome.
- Persistent header and one indicator across page switches, rapid selection,
  Back/Forward, standalone reload, Workspace selection, four mobile routes.
- M pointer response observed within the configured +/-4 degree bounds.
- Local HTML asset/link paths and JS syntax passed; no browser errors/warnings
  during the checked routes. Root production files unchanged (9/9).
- Reduced-motion, touch and forced-colors guards inspected in source. OS-level
  reduced-motion/forced-colors and throttled-network emulation were not exercised.

Cursor material trial: the integrated build now preloads a local 24x24 SVG glass
triangle, retaining the -10-degree rotation and 10,3 hotspot. Translucent gradient,
bright inset edge and dark outline simulate glass without a tracking overlay.
Native SVG cursor cannot refract the live page underneath. Fine-pointer and
forced-colors fallbacks remain. Verified computed styles before/after navigation.
Only test-site changed; no push/deployment.
