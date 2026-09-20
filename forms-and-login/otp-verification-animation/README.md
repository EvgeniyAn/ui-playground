# OTP verification animation

Open `index.html` directly in your browser. No server, dependencies, build step or network connection is needed.

Enter any four digits (for example `4545`) to run the animation. Pasting a full code works too. Arrow keys navigate, Backspace returns to the previous empty slot, and Replay resets the animation at any point. Resend clears the demo inputs; it does not send a message.

This is a visual recreation, not a real authentication system. All codes succeed locally. The small demo controls below the card are additions for replay and clarity.

## Reference

Source bundle: `../../video-reference-tool/downloads/2026-09-08-code.xr-OTP-Verification-but-Version-7/` (complete, 24 frames, 5.268 seconds). The supplied timestamp matches this renamed bundle. Original media was preserved.

The card reproduces the dark panel, orange input outlines, four-digit row becoming a connected square, merge, green check and particle burst. Video titles, promotional captions and the editor panel are excluded. Timing, easing and font are independent approximations from the frames, not recovered source code.

## Verification

JavaScript syntax and static local asset references checked. Browser navigation to the local file was rejected by the browser security policy, so screenshot comparisons, rendered intermediate frames, keyboard/paste/replay behavior, narrow viewport and reduced-motion behavior have **not been browser-verified**. No preview server was started.

The implementation includes a `prefers-reduced-motion` path that skips particles and reduces phase durations. Verify it in your browser before production use.
