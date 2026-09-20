# Runaway Login

Open `index.html` directly in your browser. No server, build step, dependencies or network connection is needed.

Move your mouse toward **Log in** with the fields empty. Fill a valid email and the button travels half as far; enter a password of at least 8 characters and it returns home and stays there until **Replay**. Click it to see the spinner and success check. Try `ada@example.com` and `demo12345` — use made-up details.

Tab reaches the button and stops the chase. Enter submits with inline validation. Touch and reduced-motion users get a stationary button; reduced motion skips the spinner. The eye toggles password visibility. Replay resets the demo, including an in-progress submission. “Forgot?” and “Create one” explain the local demo rather than navigating away.

This is a visual recreation, not authentication. Details are neither stored nor sent. All valid-looking demo details succeed locally.

See `reference/observations.md` for source timing, geometry and inferred details. Verification results are recorded in `reference/verification.md`.
