# Verification

Verified on 2026-09-08 with Node 24:

- `node --check runaway-login/script.js` passes.
- Static HTML inspection passes: unique IDs, resolved labels and accessible descriptions, local CSS/JS files present, named required inputs.
- The application has no network or storage calls and needs no server.
- Nine focused JavaScript checks execute the actual application source with a small simulated DOM and controllable animation promises. They cover empty-form movement, half travel, permanent lock, invalid-submit feedback, repeated submission, animation completion, reset during submission, edit during submission, reduced-motion/coarse-pointer gating, focus and replay after keyboard input. All pass after fixing a reproduced issue where Replay retained the previous keyboard mode.

These are logic checks, not a browser or accessibility audit. The simulated email validity, dimensions, focus and animation completion do not prove native browser behavior or painted motion.

## Browser verification blocked

Opening the standalone `index.html` through the supported browser API was rejected by automatic approval review: the Browser use URL policy blocks the local-file URL and forbids alternate routes around that denial. No workaround or temporary server was used.

Consequently, screenshots, normalized frame comparisons, painted intermediate motion, console inspection, real Tab/Enter behavior, 320px layout and browser media-preference emulation remain unverified. Original source frames were inspected; no implementation screenshots are claimed. Fonts and motion are independent approximations.

## Manual check

Open `../index.html` directly in a browser. Move toward the empty button, fill only an email, then enter an eight-character password. Confirm reduced travel followed by a centered teal button, spinner and checkmark. Try Tab and Enter with empty fields, toggle password visibility, press Replay during the spinner and after keyboard input, and try the page at 320px width and with reduced motion enabled. Replay starts a fresh round. No details are sent or saved.
