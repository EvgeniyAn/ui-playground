# Payment checkout v3 — visual specification

Source: https://www.instagram.com/reel/DcGgytAzym7/

Original bundle: `../../video-reference-tool/downloads/2026-09-10-code.xr-code.xr-Interactive-Payment-Checkout-v3/`.
Verified manifest: complete, 1440 × 2560, 30 fps, 7.753 seconds, 24 full-resolution frames.
Detail bundle: `../../video-reference-tool/downloads/2026-09-10-payment-v3-morph-detail/`, complete, 20 samples between 0.9 and 2.7 seconds, crop X=240, Y=478, WIDTH=984, HEIGHT=1346. Both preserve the complete source video.

## Observed appearance

The component occupies approximately (240,478)–(1224,1824) in source pixels. Normalize to 400 × 548 CSS pixels: radius 20, inner padding 30, almost-black violet page, dark panel, fine border. Use system sans serif; the precise source font is unknown.

Initial content: “Payment Checkout” heading and outline lock; “Pay with”; VISA badge and masked number ending 4242 in a rounded row with chevron; “Amount”; ₹1,299.00; inset “Order Summary” with subtotal; purple bottom button with lock and “Pay Now”. The button is approximately 340 × 49 CSS pixels.

Exclude the video title, orange V3 subtitle, cursor, letterboxing, source-code panel, and promotional captions. The source caption names React/Framer Motion while the displayed source panel contains Dart/Flutter snippets. Neither is complete enough to recover the original. This is an independent HTML/CSS/JS recreation.

## Observed phases (video time; approximate seek targets)

- 0.00–0.33: ready.
- 0.33–1.03: Processing… label and small spinner.
- 1.03–1.48: centered horizontal compression into a purple square.
- 1.48–1.95: square lifts toward the panel center while form content fades. Concentric ripples appear before the lift ends.
- 1.95–2.55: rings expand toward a roughly 368-pixel outer diameter. A card icon is initially visible.
- 2.45–4.68: “Verifying Payment” and percentage; card icon changes to a lock. The blue/purple progress arc becomes green near completion. Progress slows near 75%.
- 4.68–5.35: purple token becomes a green circle and a white check appears.
- 5.35–6.10: rings contract and fade; successful token rises to about 100 pixels below the panel top, growing to roughly 76 pixels wide.
- 6.10–7.75: green success ripples and falling multicolor confetti. “Payment Successful”, green ₹1,299.00, “Order Confirmed”, “Thank you for your purchase!”, and bottom “View Order Details” button.

Durations/easings and coordinates are approximated from rendered frames, not original source. Static proportions and phase ordering are the fidelity targets.

## Implementation decisions

Create an isolated sibling folder and open index.html directly. No framework, dependencies, server, network request, payment service, or storage. All payment data is fixed demonstration content.

Use inline SVG for icons/progress, CSS concentric rings, and Web Animations for transform/opacity motion. Await actual animation completion. Each component owns animations, progress scheduling, state, and reset cancellation. One visible component; the script scopes all DOM queries to its wrapper.

Addition outside the source component: an always-available Replay animation button and a small demo label. Existing source controls open local payment-method information and an order-details dialog. Native keyboard behavior, success focus, phase announcements, and reduced-motion support are required. At small widths, preserve the panel proportions and avoid horizontal overflow.
