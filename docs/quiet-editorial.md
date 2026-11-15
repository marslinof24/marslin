# Quiet editorial integration — local review

The owner accepted Refined on 2026-11-16. The selected design is integrated into
the normal local entries on `codex/style/quiet-editorial`; publication is not
authorized by that acceptance.

`refinement.css` implements the selected hierarchy and spacing independently of
the comparison controls. Home has an unboxed featured project and a quieter
secondary action. About uses a narrower continuous reading column, without the
interests card or quote rule. Workspace gives screenshots priority and lightens
its project index. Portfolio keeps its content structure and shares the type
and link treatment. All five entry documents load the same refinement stylesheet
so normal navigation and Welcome adoption use the same final layout.

The comparison bar, its reserved footer space and lifted mobile navigation are
not included. Existing mobile navigation and safe-area spacing apply. The
stylesheet keeps the prototype selector specificity using `html:root` so the
approved paragraph sizes are not overridden by the base `.site-page p` rules.

No copy, links, assets, cursor, router or Welcome animation code changes in this
integration. It is based on the local navigation-continuity candidate. The
Current/Refined study is retained on `codex/prototype/lovefrom-refinement` and
in the local `lovefrom-prototype` directory; it is not a publication artifact.
When publishing is separately requested, promote the integration and required
navigation fixes without publishing the comparison directory.

Local checks: actual-page route regression, screenshot review, and all 110 local
resource references. The study's earlier 390px and 1440px review remains recorded
in `lovefrom-prototype/README.md`. Browser simulations do not establish physical
device or GPU performance. `main`, the remote and public Pages remain unchanged.

Publication follow-up: the owner explicitly authorized push on 2026-11-16.
Release v1.2.0 promotes the reviewed integration and navigation fixes without
the prototype directory; the local-only statements above describe review status.
