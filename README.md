# Mars Lin — personal website

Static personal website: https://marslinof24.github.io/marslin/

Start locally with `python -m http.server 4173 --bind 127.0.0.1`, then open `http://127.0.0.1:4173/`.

GitHub Pages publishes the repository root on `main`. HTML, CSS and native JavaScript use relative paths, including fonts, cursor and development screenshots. No build or package installation is required.

Welcome opens at `index.html`; the four content pages are `home.html`, `workspace.html`, `portfolio.html` and `about.html`. Fresh external Home visits enter through Welcome. Existing `articles.html` and `links.html` URLs redirect to Workspace and About contact.

See `RELEASES.md` for version milestones. Research prototypes, local content-studio drafts and private source documents are maintained separately from the production branch.

## Content changes

Text, image and link updates are made directly on `main` without a new branch. Text literals stored in JavaScript are content edits when interaction logic stays unchanged. Code logic changes and feature development use branches. Preview and review content locally before publishing; every push or deployment requires a separate explicit instruction from the owner.
