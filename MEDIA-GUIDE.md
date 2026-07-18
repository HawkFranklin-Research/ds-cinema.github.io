# DS Cinema media guide

The current investor deck intentionally uses lightweight CSS illustrations so it works without external assets. Future media slots are marked with `data-media-slot` in `app/ScrollDeck.tsx`.

## Recommended assets

| Slot | Suggested file | Format and crop | Creative direction |
| --- | --- | --- | --- |
| `cover-video` | `public/media/ds-cover-loop.mp4` | MP4 (H.264), 1920×1080 and an optional 1080×1920 mobile cut, 8–12 seconds, under 8 MB | A solo creator in a warm, minimal room; tripod visible in the background; protected microdrone entering frame. Use a slow, seamless loop with negative space on the left for the headline. Avoid explicit content. |
| `problem-image` | `public/media/creator-tripod.webp` | WebP, 1600×1200, under 500 KB | Creator repeatedly adjusting a phone tripod. Editorial lighting, slightly awkward framing, warm-neutral palette. |
| `why-now-split-image` | `public/media/solo-vs-studio.webp` | WebP, 1800×1200, under 600 KB | Diptych: simple solo phone setup versus a professional moving-camera setup. Keep the division visually obvious. |
| `product-ecosystem-mockup` | `public/media/ds-ecosystem.webp` | Transparent WebP or PNG, 1800×1400 | Product family render showing a protected drone, mobile controller, and Mac local-AI interface. No supplier branding. |

## Cover video integration

Place the video inside `.deck-cover-stage`, before `.deck-room-lines`:

```tsx
<video className="deck-cover-video" autoPlay muted loop playsInline poster="/media/ds-cover-poster.webp">
  <source src="/media/ds-cover-loop.mp4" type="video/mp4" />
</video>
```

Then add:

```css
.deck-cover-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(.78) contrast(1.08) brightness(.72);
}
```

Keep videos muted by default, include a poster image, and preserve the CSS illustration as a fallback until final product footage exists.

## Visual guardrails

- Show protected or enclosed propellers only.
- Keep all public-facing creator scenes non-explicit and consent-forward.
- Favor authentic rooms over glossy science-fiction environments.
- Preserve the deck palette: projector cream, signal orange, electric lime, muted lilac, and matte black.
- Do not use recognizable DJI or HOVERAir product photography without permission; the current comparison uses neutral illustrations.
