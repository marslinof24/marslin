# Perfect Solution — Coming soon preview

2026-11-16. Local branch: `codex/feature/demo-teaser`. No push authorized.

The owner wants one complete demo journey, from deck selection to a full practice
run, presented with the anticipation of a trailer. The complete recording is not
ready, so this version is a Coming soon presentation, not a finished trailer.

## Current page

- A charcoal teaser cover uses the existing application screenshot, Nunito, and
  the copy “Demo coming soon.” No autoplay, new dependency, or generated footage.
- The planned sequence is Select a deck → Set the scene → Play it through.
- The existing approximately 24-second half-speed recording remains available
  in a native, keyboard-operable disclosure labelled Current development clip.
  It does not pretend to show deck selection or a complete workflow.
- Three screenshot positions deliberately share `assets/perfect-solution/arrange.png`.
  The page and each caption say final captures are pending. Labels and enlarged
  image titles distinguish these placeholders from completed step screenshots.
- The existing project motivation, difficulties, current progress and next steps
  are preserved. No project source or additional private files were accessed.
- All five HTML entries load `demo-teaser.css` so the persistent document displays
  the same presentation when Portfolio is reached from another page or Welcome.

## When the recording is supplied

Record one continuous application-only run:

1. Begin at deck selection and choose the cards.
2. Move into scenario setup and place the units.
3. Show the start of practice and one complete run through its end.
4. Pause briefly on the final state so the outcome can be understood.

The edited introduction and ending can add trailer pacing; retain continuity
through the actual practice so the end-to-end flow remains understandable.
Opening/closing cards can carry Perfect Solution and Demo coming soon. Do not
add an unconfirmed launch date, download link, public availability claim, or
stock gameplay presented as this tool. Keep editor/source windows out of frame.

Replace the three placeholders with deck selection, scenario setup, and practice
captures provided by the owner, and update alt text and enlargement titles.
Remove pending captions only once distinct final captures are present.

## Checks

Local asset validation passes (116 references). Browser review confirms a
390 × 844 frame has no horizontal overflow, the clip starts collapsed, and the
three screenshot elements share exactly one image URL. Desktop disclosure
expansion and its existing video controls are available. No new test framework
or animation logic is introduced. Existing Welcome/router/cursor code is untouched.

Preview: `http://127.0.0.1:4182/portfolio.html?preview=teaser-1#demo-preview`.
