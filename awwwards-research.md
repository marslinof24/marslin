# Local prototype: project coordination and editorial metal

Status: Variant A selected by Mars; local prototype only. No push or deployment without a new,
explicit instruction from Mars. None of the references below licenses copying its
artwork, source code, or branding. This prototype creates its own SVG/CSS artwork.

## Research question

How can a personal website communicate project coordination clearly enough for
recruiters, while showing design taste through the experience itself?

## Primary sources and observations

The supplied [Awwwards winner list](https://www.awwwards.com/winner-list/) is a
**Most Awarded Profiles** leaderboard, rather than a list of individual winning
sites. Research followed those teams to their own sites and project descriptions.
Current sites may differ from their award-winning editions. Award status alone
does not establish current usability or performance.

| Reference | Evidence | Proposed application |
| --- | --- | --- |
| [Dennis Snellenberg](https://dennissnellenberg.com/) / [award page](https://www.awwwards.com/sites/dennis-snellenberg) | The current homepage states his profession, introduces his approach, lists recent work, and ends with contact. The homepage was also visually inspected in-browser: a portrait and large name carry the first impression. | State Mars's role clearly, then offer a real project. Borrow the content sequence, not the portrait, marquee, loader, or source code. |
| [Locomotive](https://locomotive.ca/en) | The current site was inspected in-browser. Large project names, thin dividers, generous whitespace, and simple top navigation structure the featured-work list. | Use editorial hierarchy and confident project titles. Retain Nunito instead of adopting the reference's different typefaces. |
| [Neutra VDL](https://neutra-vdl.org/) / [Awwwards official 2023 book](https://assets.awwwards.com/awards/gallery/2023/07/HOT-RIGHT-NOW-BOOK-2023.pdf) | The live text has clear content categories and a Contents structure. The official book discusses its editorial/grid approach (printed page 115). Its animation was not tested in this research. | Apply clear alignment and section hierarchy to learning notes and case studies. Do not reproduce its many numbers or dense secondary navigation. |
| [Obys: Grids](https://obys.agency/work/grids) | The creator labels the project Education / Side Project. The current Obys agency homepage was separately inspected in-browser, including its vertical and grid presentation modes; that observation is not a claim to have tested the Grids project's animations. | Treat learning experiments as actual artifacts. A material experiment made for this prototype is labeled as such, not as a historic project. |
| [Immersive Garden](https://immersive-g.com/) / [David Whyte case study](https://immersive-g.com/projects/david-whyte-experience) | The agency homepage was inspected in-browser: nearly monochrome relief, light, and whitespace create the visual mood. The David Whyte case study explicitly describes WebGL, watercolor and sound; those project interactions were not personally tested. | Use M as a single material focus. CSS gradients, SVG shading and a subtle local pointer response are our proposed implementation, not an assertion about the agency's implementation. |

## Decisions confirmed with Mars

- Recruiting first; project coordination is the content focus. Design taste should
  be expressed by the website rather than extra design-philosophy copy.
- English throughout. Keep Nunito, M, grey metal, glass navigation, and black cursor.
- Primary action: view the selected project.
- Compare three structurally different homepages: A positioning first, B project
  first, C personal index. Share Portfolio and Workspace; reuse existing About copy.
- Case study: goal, role, workflow, result. No fabricated metrics or screenshots.
- Add local light/tilt interaction to M. Touch and reduced-motion use a static surface.
- Existing Welcome remains unchanged. Prototype comparisons start directly at Home.
- Original production files and the live site stay unchanged.

## Running and comparing

From this folder, run `python -m http.server 4173 --bind 127.0.0.1` (use another
unused port if needed). Open:

- `http://127.0.0.1:4173/prototype.html?view=home&variant=A`
- Change `variant` to `B` or `C`, or use the floating comparison bar.
- `view=portfolio&variant=A|B|C` compares that page independently. Navigation back
  to Home defaults to approved A and to Portfolio defaults to approved C.
- `view=workspace&variant=A|B|C` compares the learning page independently.
- About currently has one layout, so its variant arrows stay disabled until review.

The floating comparison bar is local-only. URL query parameters keep comparisons
reload-stable; no local storage, cookies, backend, plugins or paid assets are used.
Use a local HTTP server so the unchanged About content can be read from `about.html`.

## How to judge the demo

Can a recruiter identify the role, understand a real contribution, and find the
case study quickly? Which homepage gives that content the clearest hierarchy?
Does the M interaction add character without distracting from reading? Check
desktop and 390 × 844 mobile, keyboard navigation, variant switching and page return.

Mars selected **A — Position first** after reviewing the three homepage directions.
Future refinements should use A as the baseline: positioning on the left, metal M
on the right, followed by the selected project and Workspace. B and C remain local
comparison references. This selection does not authorize production integration,
push, or deployment. Do not promote prototype code directly to production; rewrite
the selected design for production only after that next step is confirmed.

## Page-by-page selection workflow

Mars confirmed that every subsequent page can be reconsidered with three A/B/C
layouts. The homepage selection stays A while another page is being compared;
variant letters are scoped to the page, not a single global style choice.

- Keep the confirmed identity, real content and functional requirements consistent
  across the three options for each page.
- Record the chosen layout and any elements to borrow from the other options.
- Preserve all comparisons locally until the review is complete. A selection is
  a design decision, not an instruction to merge, push or deploy.
- Combine the approved page designs into a coherent final version only after
  the page reviews. Reconcile typography, spacing, materials and interactions
  across pages rather than simply stitching unrelated layouts together.
- Push and deployment still require Mars's separate explicit instruction.

## Portfolio comparison — C selected

| Page | Review status |
| --- | --- |
| Home | A — Position first, selected by Mars |
| Portfolio | C — Project dossier, selected by Mars |
| Workspace | B selected — Workbench |
| About | A selected — Quiet editorial (A little more me) |

Portfolio variants use the same confirmed project, role, date range, deliverables,
coordination workflow and result. The differences are layout and reading sequence:

- **A — Editorial story:** a large project cover followed by goal, role, workflow,
  and result in a linear case-study structure.
- **B — Outcome first:** a prominent result and deliverables panel, then a two-column
  goal/role summary and a separate workflow section.
- **C — Project dossier:** a sticky summary and chapter links on desktop, beside a
  compact case file with a vertical workflow. Mobile stacks the summary and content.

The comparison arrows now change the current page, rather than always returning to
Home. Header navigation returns to Home A and Portfolio C, keeping page choices
separate. Verified A/B/C at 390 × 844 and 611 × 884 without horizontal overflow,
checked the larger desktop composition, chapter jumps, reload and console output.
Only prototype files and this local record were changed; no push or deployment.

## Local review completed

- Compared A/B/C in the browser and checked all three at 390 × 844.
- Adjusted mobile typography so headings and poster words fit without horizontal
  overflow; original production files match the last published checkout.
- Navigated the shared case study, Workspace and unchanged About content, and
  verified browser Back and URL reload retain the selected comparison state.
- Confirmed header arrow keys move focus without switching variants, and the
  material range's arrow keys change light position without switching variants.
- Exercised pointer-responsive M light/tilt; observed rotation values stayed below
  the configured ±4° limit. Touch and reduced-motion static behavior is guarded
  in CSS and JavaScript, but OS-level reduced-motion emulation was not performed.
- No console errors or warnings were observed. No formal test framework was added.
- No push, deployment, issue creation or production integration was performed.

## Workspace comparison — awaiting selection

Mars selected Portfolio C. Homepage A and Portfolio C are now the approved default
entries from other prototype pages. Historical alternatives remain available for
comparison; selecting a page never authorizes a push or deployment.

- **A — Learning index:** a readable subject list followed by the material study.
- **B — Working notebook:** a subject navigation and expandable notes, followed by
  the same material study. No dates or completed tutorials have been invented.
- **C — Experiment first:** the actual prototype material experiment leads, with
  a compact learning toolkit below it.

All variants use the same existing learning descriptions. The CSS material study
is labeled as created for this prototype. Checked desktop and 390 × 844 mobile,
subject anchors, independent page defaults, and variant switching. Disabled native
scroll restoration and scroll anchoring for the comparison route so changing a
layout starts at its heading rather than retaining an unrelated section offset.

Only local prototype files and this record changed. About is the next unreviewed
content page. No production integration, push or deployment has occurred.

## Workspace redesign — screens and workstations (2026-10-23)

The earlier learning-index / notebook / material-experiment alternatives above
are superseded for this review. Mars requested real screen captures and links to
workstations such as HackMD. This prototype explores how to browse that material:

- **A — Screen gallery:** one featured capture, smaller capture cards below, and
  a workstation sidebar. On mobile the links sit above the gallery.
- **B — Workbench:** a single large viewer with three selectable capture buttons
  and a workstation dock. Selection stays in memory; keyboard activation works.
- **C — Capture journal:** each screen sits beside its context and related link,
  with workstation links beside the introduction. Mobile rows stack vertically.

All three share the same content. `assets/prototype/website-preview.png` is an
actual local browser capture of approved Home A, captured at 1425 x 790 without
the comparison toolbar. It is labeled as a local prototype capture. Linux and
data captures are honest empty slots, not fabricated terminals or results. The
HackMD personal URL has not been supplied, so that card has no active link.
GitHub links use the existing profile and personal website repository.

Verified syntax, desktop presentation at 1440 x 900, and all three layouts at
390 x 844 and 611 x 884 without horizontal overflow. Verified the viewer with
pointer and Enter activation, image loading, comparison controls and independent
Home A / Portfolio C defaults. No new console warnings or errors observed.
Only local prototype files, the prototype screenshot and this record changed.
No production integration, push or deployment. Workspace B was subsequently selected.

## Workspace decision — B selected

Mars selected B (Workbench). Prototype navigation and URLs without a Workspace
variant now default to B. A and C remain available for comparison. Approved page
choices are Home A, Portfolio C, and Workspace B; About is next for review.
This decision does not authorize production integration, push, or deployment.

## About comparison — awaiting selection (2026-10-23)

Following approval of Home A, Portfolio C, and Workspace B, About now has three
local alternatives. This supersedes the initial plan to reuse About unchanged
inside the demo; the actual production About file remains unchanged.

- A — Personal introduction: large name and biography, followed by two short
  editorial columns and a contact row.
- B — Collaboration first: introduction followed by three evidence-led horizontal
  sections (team alignment, explaining ideas, technical learning), then contact.
- C — Resume index: sticky personal summary and section links beside background,
  experience, technical practice, and contact. Mobile stacks into a reading flow.

All variants use the same confirmed facts from the existing About page: NCCU
Ethnology, 2026 graduation, research coordination, English teaching in 2023–2026,
and developing technical skills. No portrait, metrics, email address or additional
experience was invented. Existing LinkedIn and GitHub URLs remain the contacts.

Checked JavaScript syntax, desktop appearance and all three variants at 390 x 844
and 611 x 884 with no horizontal overflow. Verified contact anchor navigation,
contact visibility, direct reload with variant and hash, correct project/workspace
links (Portfolio C / Workspace B), and no new console errors or warnings. No test
framework added. No production edits, integration, push or deployment.

## Content placement revision — About C to Portfolio

Mars requested moving About C's current content into Portfolio before discussing
new About C copy. The complete background/experience/technical-practice/contact
index now follows the selected Portfolio C case study. A project-end anchor opens
that section; its project link returns to the case goal on the same page.
About C now displays an explicitly marked content draft with no invented personal
story, plus existing contact links. About A/B remain comparison alternatives.
Checked desktop and 390px mobile overflow, unique IDs, profile anchor and the
About C draft. New About C writing awaits discussion. No production edits or push.

## About C personal direction — first local draft

Mars requested a quiet, understated, warm personal page, with Instagram / X and
current interests in embedding and RAG optimization, plus UI–user interaction.
About C now uses a short first-person introduction, two interest paragraphs and
a social section. A subtly warm translucent panel sits within the existing gray
metal palette; Nunito and shared navigation remain. This describes interests,
not completed AI projects or expertise. No lifestyle details were invented.
Instagram / X have non-clickable pending rows until personal URLs are supplied.
Existing LinkedIn and GitHub remain working links. Verified syntax, desktop and
390 x 844 appearance, no horizontal overflow, and correct Workspace B link.
This remains a copy/layout draft awaiting feedback, not final approval of C.
No production integration, push or deployment.

## Portfolio order and personal About comparison (2026-10-23)

At Mars's request, selected Portfolio C now opens with background and experience;
the research project follows. Content was reordered, with the profile's project
anchor retained and the project ending linking to About contact.

About A/B/C now all use the same “A little more me” content, superseding the older
biography/collaboration alternatives. A (Quiet editorial) retains the spacious
introduction and warm interest panel, with social links below. B (Personal corner)
puts introduction/socials in a sticky left column and two interest cards at right.
C (Open journal) puts a social strip near the top, then open editorial interest
rows without cards. All use the same Embedding/RAG and UI-interaction copy and the
same working LinkedIn/GitHub links; Instagram/X still await personal URLs.

Verified JavaScript syntax, actual Portfolio DOM order and project anchor,
desktop screenshots and all three About variants at 390 x 844 with no horizontal
overflow. Existing approved Home A / Workspace B remain. About selection pending.
No production integration, push or deployment.

## About decision — A selected

Mars selected the personal About A (Quiet editorial), based on “A little more me”.
Approved defaults are now Home A, Portfolio C (profile before project), Workspace B,
and About A. Explicit alternative URLs remain available for comparison. About
navigation from another page returns to A, and the switcher labels it Selected A.
Instagram/X personal URLs remain pending. No integration, push, or deployment.

## Integrated local test build

Created test-site/ after approval to integrate the four selected page layouts.
Welcome and navigation behavior were carried forward into a separate local build;
the comparison prototype and root production remain unchanged. Portfolio opens
with personal background, followed by the project; About uses personal A.
New effects and detailed browser checks are documented in test-site/README.md.
No deployment or push. Pending real screenshots/social URLs remain marked.

## Publish and local editing handoff (2026-10-23)

User explicitly authorized replacing the production site and pushing main. Pushed
commit de294aa with the selected four pages, original Welcome/navigation motion,
current rounded smoked-glass cursor, Instagram mmars__n19 and HackMD @marsoulin.
GitHub Pages About returned HTTP 200 with the new layout and Instagram confirmed.

Created a separate loopback-only visual editor at http://127.0.0.1:4175/.
It uses the actual page templates, stable content fields, live selection/inline
text edits, image upload, project/workspace item creation/removal, device preview
and explicit draft saves. Draft data/media stay under _local and were not pushed.
The editor never calls Git or applies public files; the user asks to apply a
saved draft, reviews locally, then independently authorizes future pushes.
Five disposable-data integration tests passed (save/reload, conflict protection,
upload validation, collections, explicit static apply). Browser exercised text,
inline edits, images, collections, social URLs and 390px preview, with no console
errors. All QA visible edits were restored before handoff. See _local/README.md.
