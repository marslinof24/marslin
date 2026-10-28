# Full HIG local preview

From the repository root:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Open http://127.0.0.1:4173/hig-site/index.html to start at Welcome.

This folder contains the five standalone HTML pages and all their static assets. Navigation stays within this folder; direct Home visits follow the existing Welcome entry policy. GitHub Pages subpaths are supported through relative URLs. No backend, package install, shader, or paid dependency is required.

This is a local prototype, not an instruction to publish. The production pages in the repository root and the content studio drafts are unchanged. See `../hig-full-study/README.md` for validation and Git milestones.
