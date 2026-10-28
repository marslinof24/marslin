# Welcome entry regression — 2026-10-23

Reported URL: https://marslinof24.github.io/marslin/home.html

Reproduced in the browser: direct Home URL rendered `.home-a` and no `.welcome`;
the site root rendered Welcome. The live URL also stayed at home.html with Home
visible, ruling out an extra server redirect. Home had no entry-routing script;
no persistent Welcome-skip flag was present. This was a missing entry policy,
not a fault in the two-second logo animation.

Regression command:

    node --test tests/entry.test.cjs

It executes the actual synchronous scripts from the Home head. Before the fix:
2 passed, 5 failed, including the direct external Home URL. After adding entry.js:
7 passed. It checks GitHub Pages subpaths, fresh/external visits, stale history,
internal fallback links, reload/back, iframe editing and file preview.

The new synchronous Home entry guard sends fresh top-level external visits to
relative index.html, before Home paints. It preserves query parameters. Verified
reload/back entries and native same-site links keep Home; SPA navigation never
executes fetched head scripts. Direct Portfolio/Workspace/About links are unchanged.
Editor iframe previews bypass the gate. Existing animations/cursor stay untouched.

Browser checks: fresh localhost Home -> Welcome -> animated Home arrival;
Home reload stays Home; Workspace -> Home stays content; Back restored Welcome,
Forward returned Home. Old 127.0.0.1 Home HTML remained in the browser cache, so the
fresh-host localhost URL was used to verify the new document without test params.
Editor templates and the baseline hash were migrated without touching draft fields;
the 5 disposable editor integration tests pass. No diagnostic logging was added.

This fix is local only. Production still requires a separately authorized push.
