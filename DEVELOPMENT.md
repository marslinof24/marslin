# Local development and Git

Open `C:\Users\user\personalwebsite` in your IDE. The project root is now a Git repository, preserving the existing website commit history.

## Branches

| Branch | Purpose |
| --- | --- |
| `main` | Last published website revision |
| `develop` | Local development baseline, including the content studio and prototypes |
| `feature/welcome` | Welcome layout, logo animation and entry behavior |
| `feature/navigation` | Shared navigation, glass selection, page transitions and cursor |
| `feature/home` | Home content and layout |
| `feature/portfolio` | Profile, projects and research outputs |
| `feature/workspace` | Workstations, screenshots and development history |
| `feature/about` | Interests, social profiles and contact |
| `feature/content-studio` | Local visual editor and draft workflow |

The feature branches initially point to the same development baseline. They are starting points for future changes, rather than a retrospective split of earlier commits. A branch contains the whole project; its name describes the work planned there.

In VS Code, open Source Control to inspect changes, use the branch name in the bottom left to switch branches, and open Source Control Graph to inspect commits. Commit or stash unfinished changes before switching branches.

## Working and publishing

1. Switch to the relevant feature branch before changing a feature.
2. Review the local preview and commit the accepted change.
3. Merge accepted work into `develop`.
4. Publish only after the owner explicitly requests a push. Prepare only public website files in `.cache/publish`, which remains the separate release checkout. Do not push the development branch as the Pages site.
5. After publishing, fetch the release commit into the root repository and update `main` to match it. Merge that release history into `develop` when appropriate; do not force-push or reset local work.

Local editor source is versioned on `develop`. Drafts, uploaded local media, the resume PDF, service logs, temporary output and the release checkout are ignored. Saving a draft never commits or publishes it.

Static preview: `python -m http.server 4173 --bind 127.0.0.1`

Content studio: double-click `開啟內容工作室.cmd`.
