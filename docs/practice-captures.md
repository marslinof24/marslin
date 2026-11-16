# Practice screenshots and copy revision

Local review, 2026-11-17. No push or deployment.

## Image provenance

The images below are genuine captures, not recreated interfaces. HackMD files
were downloaded without alteration and visually checked for personal paths,
credentials, and unrelated information.

| Local asset under assets/practice | Source | What it shows |
| --- | --- | --- |
| linux-quiz-welcome.png (existing) | https://hackmd.io/_uploads/HkfdAh46Gg.png | Quiz instructions |
| linux-quiz-checklist.png | https://hackmd.io/_uploads/HyJfxTE6Mx.png | Multiple-answer question |
| linux-quiz-review.png | https://hackmd.io/_uploads/B1wvyaEaGe.png | Missed-question review |
| book-ranking-result.png | https://hackmd.io/_uploads/rko7ridAMl.png | Published database output: 40 saved records and top ten |
| cybersecurity-questionnaire.jpg | Local execution of public source below | Questionnaire with the built-in sample |
| cybersecurity-report.jpg | The same local execution | Generated report with sample score, matrix, and CIA breakdown |

Linux source note: https://hackmd.io/@MarsLin01/B1xC92N6Me

Python source note: https://hackmd.io/@MarsLin01/r1M9Tq_0Mg

The cybersecurity source was fetched from the owner's public repository at
commit `a238e01fdd9eea2d7699859ae22c911af0b89c64`:
https://github.com/marslinof24/cybersecurity-demo/blob/a238e01fdd9eea2d7699859ae22c911af0b89c64/index.html

The unmodified source ran in a local, ignored capture fixture. Browser controls
were used to open the questionnaire, activate its built-in example, and submit
it. The app generated the report itself. The displayed score is illustrative,
not a validated assessment. Captures show a viewport of the form/report, not the
entire scrollable document. The capture browser returned JPEG bytes, retained
with the matching .jpg extension. No capture-only code or dependencies ship with
the website. No private Perfect Solution source was accessed or included.

## English revision

Workspace learning projects, repository summaries, image descriptions, captions,
links, and Portfolio practice summaries now use plain American English. Examples:

| Previous | Revised | Reason |
| --- | --- | --- |
| A bookstore-ranking exercise that connects web scraping to database writes and SQL checks | I collected a bookstore’s rankings, saved the results in MariaDB, and checked the records with SQL. | Explains the work in a natural sentence rather than stacking technical nouns. |
| What took some work | What tripped me up | A conversational heading for a personal learning account. |
| A five-question terminal interface with different input controls, scoring, and a review of incorrect answers. | I turned a lesson from Linux class into a five-question quiz, with different ways to answer and a chance to review missed questions at the end. | Gives context and describes what the user can do. |

Existing main-project facts, Welcome timing, navigation, and cursor behavior are
unchanged. The three pending Perfect Solution screenshots remain placeholders as
previously requested. The new photos concern public learning work only.

## Local checks

- Workspace images open in the existing viewer; close restores focus to the
  originating button. Python and cybersecurity report enlargement were exercised.
- Browser simulations at 390 × 844 and 1440 × 844 showed no horizontal overflow
  for the learning panel. Linux captures loaded in the mobile frame. The mobile
  cybersecurity viewer was also opened and closed; offscreen figures use lazy
  loading. These were simulations, not physical-device tests.
- Desktop browser confirmed all three visible Data/repository images load, the
  two repository captures sit side by side, and images retain their full content.
- Persistent navigation to Portfolio displays the revised entries and previews.
- Local resource validation resolves 131 references. No new test framework,
  dependency, backend, or animation behavior was introduced.

Review captures are saved outside the published site under
`.cache/transition-comparison/practice-captures-desktop.jpg` and
`.cache/transition-comparison/practice-captures-mobile.jpg`.
