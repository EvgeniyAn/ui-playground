# Reference observations

Bundle: `../../video-reference-tool/downloads/2026-09-08-code_and_chill_-The-Log-in-button-runs-away-until-you-ve-earned-it/`.
Manifest reports complete: 1440 × 2560, 60 fps, 6.152 seconds, 24 prepared frames. The contact sheet and original frames 001, 007, 012, 015, 019, 020 and 024 were inspected. Source media is unchanged.

The component is the teal-black TETHER sign-in card: approximately x282–1158, y646–1890 in video pixels. At 420 CSS pixels wide, the reference scale is about 2.09 video pixels per CSS pixel. The source includes a large Runaway Login heading, fake browser toolbar and three source-code panels. The recreation keeps the heading and card; it excludes the toolbar, code panels and production-related footer caption. Replay and a small demo note are additions.

Card: approximately 26px radius, 34px horizontal padding, a subtly lighter upper gradient, thin pale border. A 24px ring-and-dot brand mark precedes a spaced monospace wordmark. Heading is a compact heavy sans serif; body copy is a lighter neutral sans serif. Font identity is not established. Inputs are about 350 × 50px with 14px corners, thin borders, outlined icons, teal focus ring and round validation ticks. The dock is about 350 × 90px, with a central dashed pill socket, circular anchor, curved glowing cord and 128 × 48px button. The button rotates a few degrees while moving.

Observed sequence:

- 0.000–1.851s: empty fields, mouse approaches, button dodges horizontally and slightly vertically, stretching a teal cord from its home. It eases home when the pointer leaves. Individual dodges settle in roughly 0.2–0.35s; exact easing is inferred.
- 2.115–2.644s: email is typed, becomes `ada@lumen.co`, gets a teal validation tick.
- 2.909–3.438s: “One to go — it is slowing down.” Button still dodges. Half travel is specified by the clip metadata; the frames confirm reduced behavior but do not isolate identical pointer trajectories.
- 3.702s: a short password still leaves the button gray. By 3.967s both fields are valid, the button centers, becomes a mint-to-teal gradient and the status reads “Locked in. Go on then.” The displayed placeholder implies an eight-character password threshold.
- 4.760s: pointer clicks the centered button. At 5.024–5.553s a spinner and “Signing you in…” are visible. By 5.818s the spinner is a checkmark; at 6.082s status is “Signed in.” The recreation uses a 900ms finite spinner animation and waits for its actual completion.

Metadata says mouse only, half travel with one valid field, permanent home lock after both valid fields, no disabled button, Tab stops the chase and Enter submits. Keyboard/coarse pointer/reduced-motion behavior and replay are not demonstrated in the recorded frames. These are explicitly implemented, with the lock lasting until Replay. Native form validation prevents empty details from succeeding. The UI contains no authentication or network request.

Source snippets are only partial. Legible fragments show a dock, a separate home socket, SVG path, translate3d plus rotate, pointer-media CSS, and edge-distance math. They are insufficient to recover the original program. This is an independent recreation, including inferred timings, fonts and motion math.
