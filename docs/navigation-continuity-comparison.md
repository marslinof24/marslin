# Navigation continuity: before and after Apple refinement

Date: 2026-11-16. Local investigation; no publication authorized in this round.

## Compared revisions

- Before Apple refinement: `ed3c949`.
- First Apple implementation, including live Welcome retargeting: `3b7b4d7`.
- Published v1.1.1: `c837ec8`.
- Candidate: local `fix/navigation-continuity`, based on v1.1.1.

All snapshots were served from the same local HTTP server, with the same 1440 × 900 test frame. Each measurement visited Workspace, Portfolio, About, and Home three times. First-cycle loads and subsequent memory-cache visits were recorded separately. Data below uses the eight warm visits per revision. Raw observations and one-variable experimental fixtures are retained in ignored `.cache/transition-comparison`, outside the published site.

| Observation | Before Apple | First Apple | Published v1.1.1 | Candidate |
| --- | --- | --- | --- | --- |
| First sampled visible destination, after click | 66.6–70.9ms | 66.5–75.1ms | 129.2–137.6ms | 4.1–7.5ms |
| Destination fully opaque and outgoing layer removed | 288.0–292.4ms | 288.1–297.1ms | 304.9–313.6ms | 183.9–188.0ms |
| Longest interval with every content main below 0.15 opacity | 0ms | 0ms | 45.7–47.1ms | 0ms |
| Navigation-indicator inline style mutations per visit | 2 | 284–316 | 286–318 | 144–158 |

These are instrumented IAB observations, not physical display FPS measurements. Sampling reads computed opacity and geometry and adds its own overhead. Results identify repeatable differences; they do not establish a universal perceptual threshold or guarantee GPU performance on the owner's Brave configuration. No JavaScript long task or long-animation-frame entry over 50ms was observed during these comparison runs.

## Findings and controlled experiments

### 1. The previous ghosting fix introduced a visible pause

The first Apple implementation did not double warm first-visibility latency. The later ghosting correction did: it faded the old content out over 120ms, then started the new content at zero opacity. Every sampled published route contained about 46ms of nearly empty content. The previous regression rejected overlapping text but did not reject this blank interval.

Changing only the entry/exit sequence eliminated the interval. Disabling the glass backdrop, disabling the navigation spring, or changing only its geometry painting did not eliminate it.

The candidate exchanges pages in one task: outgoing content is hidden, incoming content is already 92% opaque, and it settles over 180ms with 4px travel. This intentionally reduces the dramatic fade; it preserves immediate readable content without overlapping two sets of text. The header, background, cursor, prefetch, and document remain persistent.

### 2. Retaining the outgoing document height causes a delayed scroll clamp

A separate probe moved from the long Portfolio to About, then sent four downward scroll inputs at 60/100/140/180ms after route adoption. The old implementation retained the larger of the two document heights until animation completion. Scrolling could therefore enter space that would disappear at cleanup, pulling the user backward.

- Before Apple: maximum backward displacement 749px.
- Published v1.1.1: 745px.
- Changing only the fade: still 745px.
- Reserving incoming height only: approximately 1px in the isolated experimental run; a combined first candidate still exposed 4px of translated overflow.
- Final candidate, reserving incoming height and clipping translated overflow: 0px.

This is a legacy defect, rather than evidence that Apple styling created every stutter. The much longer new Portfolio makes it easier to encounter. `overflow: clip` prevents the translated layer from extending the scroll range without introducing a new scroll container, as `overflow: hidden` would.

### 3. Welcome's temporary navigation handler survives adoption

The mid-flight navigation handler added in `d19fe30` was attached with `once`, but not removed when normal Welcome adoption completed. The adopted header retained it. Its next click attempted to adopt an already-empty staging container and cleared the document. A real Welcome → Home → Workspace browser test reproduced a body containing only the gallery dialog and no main content.

The handler now shares Welcome's AbortSignal, so normal cleanup removes it. All four Welcome destinations must support a subsequent header click, including the Contact anchor.

The additional interruption test also exposed recursive `.click()` on the same link during its own click dispatch. Browsers suppress this recursive activation, losing the requested destination. The forwarded activation is now queued as a microtask after the original dispatch completes.

### 4. The spring does unnecessary layout work

Apple refinement changed the indicator from a CSS transition to a native spring that wrote width, height, and transform every animation frame. An isolated experiment observed roughly 111–143 geometry changes per warm visit. The candidate gives the indicator a fixed basis and animates transform/scale only: zero sampled geometry changes during motion, with the same spring response and glass material.

This is a measured reduction in layout mutations, not proof that it caused the owner's GPU stutter. Removing the spring or backdrop alone did not remove the reproduced pause, so glass has been retained.

## Validation and scope

- Actual four-route regression at 1440px and 390px frame widths: no readable text overlap, content disappearance, transient Portfolio border, header movement, cursor change, or unexpected scroll displacement; rapid selection and repeated active links settle correctly.
- Downward scrolling during Portfolio → About: 0px backward movement in the final candidate.
- Seven existing Node entry tests pass. JavaScript syntax, diff whitespace, and all 105 local resource references pass.
- Welcome regression exercises four entries, post-adoption navigation, Contact positioning, and mid-flight retargeting. Final result is recorded with the local test evidence.
- `tests/navigation-browser.html` and `tests/welcome-browser.html` drive actual pages in an isolated iframe, without mocks or a new test framework.

The iframe checks are responsive browser simulations, not physical phone tests. Physical Brave/GPU rendering, Safari, operating-system reduced-motion settings, and real-network throttling have not been revalidated in this investigation. Existing accessibility branches and fetch/fallback logic are unchanged. The candidate needs the owner's visual review before any new publication decision.

The previous sequential-fade description in `apple-refinement.md` documents the published v1.1.1 history; this report supersedes that transition design for the local candidate. `main`, the remote, and public Pages remain unchanged.

Publication follow-up: the owner explicitly authorized push on 2026-11-16. The reviewed fixes are included in v1.2.0; the local-only statements above record the investigation phase. Physical-device limitations remain as stated.
