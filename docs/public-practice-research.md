# Public practice research

Reviewed on 17 November 2026 (Asia/Taipei). This note records the two public GitHub implementations assigned for detailed source review. HackMD and the birthday project are being assessed separately.

## Scope and evidence standard

- GitHub's public repository search returned `marslin`, `happybirthday`, `cybersecurity-demo`, and `lifE-demo-code` for [user:marslinof24 is:public](https://github.com/search?q=user%3Amarslinof24+is%3Apublic&type=repositories). The two implementations below both report `private: false`, `fork: false`, and `is_template: false` in their repository metadata. This establishes that GitHub does not mark them as forks/templates; it does **not** establish exclusive authorship, absence of AI assistance, or a particular course assignment. [Cybersecurity metadata](https://api.github.com/repos/marslinof24/cybersecurity-demo), [lifE metadata](https://api.github.com/repos/marslinof24/lifE-demo-code).
- Read the full public implementation files and READMEs through the GitHub connector. No private repositories, local private application source, database contents, or Perfect Solution implementation were inspected. No source files are copied into the website by this research.
- These are source-verified implementations, not executed or deployment-verified applications. No measured performance, users, accuracy, security certification, or production outcomes can be inferred.

## 1. Cybersecurity risk assessment demo

**Recommendation:** strongest new Workspace practice item. Present as a browser-based, rule-based learning demo with a questionnaire and a report, rather than a commercial security assessment service or an AI system.

**Public repository:** [cybersecurity-demo](https://github.com/marslinof24/cybersecurity-demo). Reviewed source at commit [`a238e01`](https://github.com/marslinof24/cybersecurity-demo/commit/a238e01fdd9eea2d7699859ae22c911af0b89c64) (30 September 2026 UTC). The [README](https://github.com/marslinof24/cybersecurity-demo/blob/a238e01fdd9eea2d7699859ae22c911af0b89c64/README.md) contains only the repository heading, but the implementation itself is substantial, not an empty scaffold.

### What the source actually demonstrates

| Claim suitable for display | Evidence |
| --- | --- |
| A ten-question interface collects organization, assets, threats, controls, and an assessment scenario. | [`Q`, form generation, progress, example inputs; lines 133–147](https://github.com/marslinof24/cybersecurity-demo/blob/a238e01fdd9eea2d7699859ae22c911af0b89c64/index.html#L133-L147). |
| JavaScript keyword rules estimate likelihood and confidentiality/integrity/availability impacts. | [`K`, `hits`, `analyze`; lines 149–200](https://github.com/marslinof24/cybersecurity-demo/blob/a238e01fdd9eea2d7699859ae22c911af0b89c64/index.html#L149-L200). |
| The report shows a 5×5 risk matrix, factor breakdown, threat/vulnerability/risk/owner chain, and suggested treatments. | [Report structure, lines 86–130](https://github.com/marslinof24/cybersecurity-demo/blob/a238e01fdd9eea2d7699859ae22c911af0b89c64/index.html#L86-L130); [report rendering, lines 202–230](https://github.com/marslinof24/cybersecurity-demo/blob/a238e01fdd9eea2d7699859ae22c911af0b89c64/index.html#L202-L230). |
| A browser print control supports a printable report. | [`window.print()`, line 77](https://github.com/marslinof24/cybersecurity-demo/blob/a238e01fdd9eea2d7699859ae22c911af0b89c64/index.html#L77). |
| The source identifies the output as a preliminary keyword-rule estimate. | [Explicit explanation, line 130](https://github.com/marslinof24/cybersecurity-demo/blob/a238e01fdd9eea2d7699859ae22c911af0b89c64/index.html#L130). |

### Suggested website copy

**Title:** Cybersecurity risk assessment demo  
**Category:** JavaScript · Interactive reporting  
**Description:** A browser-based practice project that turns a ten-question security scenario into a rule-based risk report, with a likelihood–impact matrix and a breakdown of the scoring factors.  
**Context:** Learning demo. Results are illustrative, not a professional security assessment.  
**Primary link:** [View project](https://github.com/marslinof24/cybersecurity-demo)

### Limits and selection notes

- It is a full HTML/CSS/JavaScript implementation in one `index.html`, with Tailwind, Font Awesome, and a Google font loaded from external CDNs ([head, lines 1–15](https://github.com/marslinof24/cybersecurity-demo/blob/a238e01fdd9eea2d7699859ae22c911af0b89c64/index.html#L1-L15)). That makes it an appropriate frontend learning example. Do not claim offline support.
- ISO/IEC 27005 references are the demo author's stated framing, not independently verified conformance. Say “risk assessment demo,” not “ISO-certified tool.” The present task did not audit the standard.
- The rules use text matches, fixed weights, and a fixed residual-risk reduction. They do not connect to an LLM or evaluate real infrastructure. The animated analysis screen includes a fixed delay ([submit handler, lines 232–245](https://github.com/marslinof24/cybersecurity-demo/blob/a238e01fdd9eea2d7699859ae22c911af0b89c64/index.html#L232-L245)); do not describe this as measured computation progress.
- No course provenance, user testing, deployment success, or independent authorship evidence appears in the small README. Label “practice project” without inventing a course or team role.
- A Pages URL is a plausible follow-up, but this research did not verify it in a browser. The repository link above is the verified display target.

## 2. lifE — PHP & MariaDB practice

**Recommendation:** useful, concrete evidence of relational database and server-side form work. Present the data flow and implementation practice. Avoid featuring the numerical health predictions as validated outcomes.

**Public repository:** [lifE-demo-code](https://github.com/marslinof24/lifE-demo-code). Reviewed source at commit [`3bad320`](https://github.com/marslinof24/lifE-demo-code/commit/3bad320f5d33876732e5741ccbe0aa3801d3c10c) (2 October 2026 UTC). The [README](https://github.com/marslinof24/lifE-demo-code/blob/3bad320f5d33876732e5741ccbe0aa3801d3c10c/README.md) explicitly describes PHP connected to MariaDB and instructs saving the supplied file as `index.php` for a local setup.

### What the source actually demonstrates

| Claim suitable for display | Evidence |
| --- | --- |
| PHP creates and accesses a MariaDB table for questionnaire records. | [`db()` and schema, lines 34–76](https://github.com/marslinof24/lifE-demo-code/blob/3bad320f5d33876732e5741ccbe0aa3801d3c10c/lifE-demo%20code#L34-L76). |
| Server-side submission handling validates bounded inputs and writes through a prepared INSERT statement. | [POST processing, lines 215–259](https://github.com/marslinof24/lifE-demo-code/blob/3bad320f5d33876732e5741ccbe0aa3801d3c10c/lifE-demo%20code#L215-L259). |
| A token identifies a saved record; report generation reads it and updates derived fields. | [SELECT and report processing, lines 261–310](https://github.com/marslinof24/lifE-demo-code/blob/3bad320f5d33876732e5741ccbe0aa3801d3c10c/lifE-demo%20code#L261-L310). |
| The interface is a six-step questionnaire followed by a generated report and print action. | [Form and progress, lines 373–475](https://github.com/marslinof24/lifE-demo-code/blob/3bad320f5d33876732e5741ccbe0aa3801d3c10c/lifE-demo%20code#L373-L475); [step navigation, lines 477–500](https://github.com/marslinof24/lifE-demo-code/blob/3bad320f5d33876732e5741ccbe0aa3801d3c10c/lifE-demo%20code#L477-L500); [report and print, lines 524–570](https://github.com/marslinof24/lifE-demo-code/blob/3bad320f5d33876732e5741ccbe0aa3801d3c10c/lifE-demo%20code#L524-L570). |
| The application explicitly describes its model as an educational simplification. | [Source introduction, lines 3–17](https://github.com/marslinof24/lifE-demo-code/blob/3bad320f5d33876732e5741ccbe0aa3801d3c10c/lifE-demo%20code#L3-L17); [model explanation, lines 614–618](https://github.com/marslinof24/lifE-demo-code/blob/3bad320f5d33876732e5741ccbe0aa3801d3c10c/lifE-demo%20code#L614-L618). |

### Suggested website copy

**Title:** lifE — PHP & MariaDB practice  
**Category:** PHP · SQL · Form workflows  
**Description:** A server-side practice project that connects a multi-step lifestyle questionnaire to MariaDB, saves submitted records, and generates a printable report.  
**Context:** Educational prototype with illustrative health estimates. Requires a PHP and MariaDB environment.  
**Primary link:** [View project](https://github.com/marslinof24/lifE-demo-code)

### Limits and selection notes

- This is not a runnable static GitHub Pages demo. The repository contains the PHP implementation as a file without the `.php` extension, and its README instructs a local PHP/MariaDB setup. The portfolio should link to the repository; a future visual preview requires the user's actual recording or a deliberately labeled illustrative diagram.
- The source contains computation and optional report parsing, but there is no clinical evaluation, predictive accuracy evidence, or validated personalized health result. The current display should focus on PHP/database integration and form-to-report flow.
- No Python implementation or Linux administration lab is established by these two repositories. PHP/SQL work is confirmed; do not relabel it “Python,” “data science,” or a completed Linux deployment simply to fill a category.
- The README does not establish whether this was coursework, an assisted exercise, or an independent project. Use “practice project.” Do not claim fully original code, a team role, a production launch, or measured impact.
- No screenshots, database records, or private personal inputs were acquired. Any later visual should use a recorded demo with synthetic data and be clearly labeled.

## Selection for the website

1. Add the cybersecurity demo as an interactive frontend/reporting example, linked to its public repository.
2. Add lifE as the concrete PHP/SQL example, linked to its public repository with its runtime requirement visible.
3. Pair these with a separately verified HackMD note or the birthday interface. Do not fill Linux/Python slots unless those sources supply real evidence.

This research changes no website files, Git branch, commits, tags, deployment, or third-party content.

## 3. Verified HackMD implementations and integration

The following additional sources were read from the owner's public HackMD profile
on 17 November 2026. They are learning exercises, not inferred professional work.
Their code was inspected in the published note but not executed in this task.

### Python scraping and MariaDB

[Python 爬蟲與資料庫實作驗收](https://hackmd.io/@MarsLin01/r1M9Tq_0Mg)
explicitly names Mars Lin as author. It documents reading a bookstore ranking
page with Requests and BeautifulSoup, collecting rank/title/author/publisher/URL,
using MariaDB parameterized writes, and querying the current day's count and top
ten. The note and code show a robots.txt check, relative-URL resolution, and
INSERT IGNORE after duplicate-entry errors. These are implementation observations,
not an independent assessment of crawler correctness or general robots compliance.

The author describes four problems: locating the shared product DOM container;
distinguishing class selectors and links; confusing select() with select_one();
passing an HTML object instead of a URL to SQL, and addressing repeat inserts.
The current implementation handles one ranking page. Pagination, missing-field
handling and exceptions are stated next steps. Do not claim all 100 titles are
collected, reliable production ingestion, or exhaustive error handling.

Display: Workspace's Python & databases selection, with an original text workflow
diagram. No terminal output or database records are invented. The note's linked
result image was not relied on as independent proof of execution.

### Linux Dialog networking quiz

[Dialog_in_Linux_Project_Mars](https://hackmd.io/@MarsLin01/B1xC92N6Me)
names MarsLin as creator and explains that reviewing a networking lesson motivated
the exercise. Its Bash source uses Dialog inputbox/menu/yesno/checklist/form
controls for five questions, increments a score and accumulates incorrect answers
for a final review. The note includes nine actual UI captures.

Display: Workspace's Linux & Bash selection, with the actual welcome capture
downloaded from [the published note asset](https://hackmd.io/_uploads/HkfdAh46Gg.png)
to `assets/practice/linux-quiz-welcome.png` (1010 × 588). The unedited image was
visually inspected and contains the quiz welcome UI, not a source/editor window.
Its source is attributed in the page and here. No Linux distribution/version or
network-topology certification claim is made; neither the answer key nor handling
of cancellation/edge cases has been validated as universally correct.

### Supplemental learning notes

- [Python函式基礎驗收](https://hackmd.io/@MarsLin01/HyjzWaNpMg): an expense
  reporting exercise that trims text, fills missing fields, converts/sorts
  amounts and prints budget/summary output. The current validation implementation
  is incomplete (the report retains the last validation result and numeric/empty
  input cases are not robustly handled). The website says input validation is an
  area to improve; it does not advertise a completed financial application.
- [Error_Log](https://hackmd.io/@MarsLin01/S1tHMe93zl): actual notes on MariaDB
  server setup/connections, missing drivers and mismatched Python environments.
  Link as a troubleshooting journal. Its commands are not republished as vetted
  installation/security advice, and private configuration is not copied.
- [Git Note](https://hackmd.io/@MarsLin01/rJp4iupnGx): headings cover snapshots,
  file states, staging/commits, branches, merge, HEAD, remotes, Conventional Commits
  and tags. Link as the owner's working reference rather than an audited Git guide.

### Remaining public repository

[happybirthday](https://github.com/marslinof24/happybirthday) contains a real
responsive HTML/CSS greeting page, inline SVG artwork, IntersectionObserver
reveals, cycling messages, confetti, and a reduced-motion branch. It was reviewed
but not selected for this professional showcase: the Linux/data/reporting work is
more directly relevant, and the personal message does not need to be republished.
Metadata marks it public/non-fork/non-template; that alone does not prove exclusive
authorship. Public source was read; no private files were acquired.

### Integration outcome

The owner requested adding valuable work to the website. Local branch
`codex/feature/public-practice-showcase` builds on the unpushed Coming soon demo
branch; that earlier work remains intact. Existing Linux/Data placeholders now
render static, source-backed templates. Workspace adds two public repository
summaries and two reference notes; Portfolio adds short Linux/Python entry points
after the existing cases, preserving their order. No backend, embedded PHP,
unverified live demo, new dependency or screenshot recreation is introduced.
All copy is English; original external notes may be Chinese.

This follow-up integrates the research into a local review only. It does not
authorize push, change external content, or open-source Perfect Solution.

### Local verification

- Actual browser navigation from Portfolio's Python entry selected the Data panel
  and restored the corresponding anchor; direct Linux selection also rendered its
  source-backed content.
- Switching back to Personal website and selecting its third screenshot still
  displayed Revised layout. Linux screenshot enlargement and Escape closure worked.
- 390 × 844 and 1440 × 844 frames reported no horizontal overflow for both learning
  panels. These are browser simulations, not physical-device results.
- JavaScript syntax and Git whitespace checks pass; the local resource validator
  resolves 124 references. No new test framework was introduced.
