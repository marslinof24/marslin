# Mars Lin — personal website

Static personal website: https://marslinof24.github.io/marslin/

GitHub Pages publishes the repository root on `main`. HTML, CSS and native JavaScript use relative paths, including development screenshots. No build or package installation is required.

Welcome opens at `index.html` with its intro animation; repeat visits in the same session skip it. The three content pages are `home.html`, `workspace.html` and `about.html`, and deep links to them land directly. Existing `portfolio.html`, `articles.html` and `links.html` URLs redirect: Portfolio to Workspace (its profile anchors to About), Articles to Workspace, and Links to About contact. Missing URLs show `404.html`.

## File structure

```
index.html, home.html, workspace.html, about.html   pages
style.css                                           the single stylesheet
viewer.js                                           image viewer (Welcome intro script is inline in index.html)
favicon.svg, apple-touch-icon.png, og.png           icons and social preview image
404.html                                            not-found page (root-absolute paths)
portfolio.html, articles.html, links.html           redirects for older URLs
assets/                                             screenshots and the demo clip
tests/                                              browser tests
docs/                                               design and release records
```

CSS and JavaScript references carry a `?v=` version token; update it when those files change.

## Tests

Run `tests/run.ps1` in PowerShell. It drives headless Chrome and needs no other dependencies. `tests/copy-parity.ps1` compares each page's visible text with `tests/copy-baseline/`; after an approved copy change, run it with `-Update` and review the baseline diff.

See `RELEASES.md` for version milestones. Research prototypes, local content-studio drafts and private source documents are maintained separately from the production branch.

## Content changes

Text, image and link updates are made directly on `main` without a new branch. Text literals stored in JavaScript are content edits when interaction logic stays unchanged. Code logic changes and feature development use branches. Preview and review content locally before publishing; every push or deployment requires a separate explicit instruction from the owner.
