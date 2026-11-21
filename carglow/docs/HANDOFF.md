# Car Glow — handoff log

Read this first when picking the project back up. Newest entries at the top.

## Where things stand (2026-11-14, v5)

- **Live previews** (Claude artifacts, each a separate link so versions can be compared):
  - v5 minimal (current): https://claude.ai/artifact/S2iYzMCqssUapZ9X9i2K6M
  - v3/v4 (Christmas, aurora, scroll car, full-screen scenes): https://claude.ai/artifact/MxZMWiZCS8YAQA3KP8RNN2 (set to "anyone with the link")
  - v2: https://claude.ai/artifact/3eoeeMoJnUbyy1kEW7rAtd
  - v1: https://claude.ai/artifact/WU68majaoTfcJtigNCryJP
- **Code:** `Ionghoul2/halo`, branch `ccr-f7d76542-o7kgyt`, folder `carglow/`. Vite + GSAP ScrollTrigger + Lenis, no framework.
- **Run:** `npm install`, `npm run build`, `npx vite preview --port 4173`, then `npm run qa` (checks all 18 prices, sizing, persistence, autoplay, overflow, errors; saves screenshots).
- **Publish a preview:** copy `dist/` to a folder, strip `<!doctype>`, `<html>`, `<head>`, `<body>` tags from its `index.html` only, publish that file with the Artifact tool and pass every other file in `files`. Use a new folder for a new link; reuse the folder to update the same link.

## What the owner wants (latest first)

1. **Minimal, spacious, classy, high conversion.** Homepage has 4 sections only: hero, collection with prices and a "Choose this kit" button, how it works in 3 steps, closing film. Everything else lives behind buttons: Build, Pricing, Install, and the product pages.
2. **One video at a time** on every screen size (phones and laptops). No wall of four videos.
3. **Videos always play** when the site opens. Only the pause button stops them, and a pause lasts just that visit.
4. **Collection carousel:** spaced cards with room between them, like the real-estate reference. Not cards filling the page.
5. **Words:** classy. Serif headlines (Instrument Serif) with italic accents, ivory buttons, little glow.
6. Keep: the Christmas headline "Make your car impossible to ignore this Christmas.", the green aurora background, the light garland under the menu, and the little car driving a string of lights on scroll (now quieter).
7. Underglow is an add-on line plus its own product page with the color preview, not a homepage section.
8. Design references: Veltrix (minimal luxury car site, 11-10 22-28-51 recording), the real-estate 3D card carousel (21-42-16), textura "Motion instead of chrome" (green aurora, 21-31-29). Full list in `public/media/media-manifest.json`.

## Business facts that block real sales

- **Prices vs LED counts don't work.** At the owner's target margins every kit's hardware must cost under about 1¢ per LED. Mapping Small has $36.68 for 8,000 pixels. See `docs/launch-readiness.md`.
- **Competitor box:** "Xmas Car LED Light System, 32M/105FT, 320 LEDs, 160 clips." The $45–$82 Static prices fit a kit like that, not 4,400–8,200 LEDs. Owner decision pending: string kit vs dense grid.
- **Footage** is all third-party social video. The owner has said they have permission; written creator permission is still worth having before public launch. Two third-party signs are blurred.
- **Early-access form** saves only in the visitor's browser. Needs Klaviyo, Shopify customers or a form service.
- **Shopify** not connected. Existing stores `cdee2r-yy` and `whipef-3h` (theme 166159253761) untouched.
- Georgia note from the owner's memory: static blue road lighting is illegal there; kits are marketed for parked displays and private property.

## Add-ons sourcing (2026-11-21)

- Report: `docs/sourcing/addons-sourcing-report.md`. Shopify draft import: `docs/sourcing/shopify-addons-draft.csv` (10 variants, all draft). Supplier mapping: `docs/sourcing/fulfillment-mapping.csv`. Regenerate with `python3 scripts/addons_build.py`.
- Selected (lowest delivered US price): eyes Alibaba Houyi `(59*12)*2` $21.27 · underglow Alibaba LumenX $17.65 (RGBIC unconfirmed; backup AliExpress Unionlux ~$41.49) · interior Alibaba Flydee 18-in-1 symphony $15.00 (dashboard strip unconfirmed).
- Shopify is NOT connected from Claude. The store connection (My Store 3, `whipef-3h`) lives in ChatGPT. Nothing was created in Shopify.

## Ideas queued for next session

- Owner wants "one more design" rendition after reviewing v5.
- Own footage: one night shoot of a real install would replace every reference clip.
- AI-generated hero film (start/end image → Veo/Kling/Seedance) is an option the owner saved.
- Simplify the Build page further (fewer steps visible at once) for conversion.

## Change log

- **v5 (2026-11-14):** 4-section homepage, single hero film on all screens (new wide cuts with blurred surroundings), priced collection deck with Choose button, How it works over a new black-backdrop McLaren clip, Build/Pricing/Install pages, phone menu, serif type, always-on video, quieter background string.
- **v4 (2026-11-13):** Christmas headline and garland, green aurora, scroll car on a light string, 3D coverage deck, iPhone margin fix.
- **v3:** full-screen scenes for phones, scroll-stepped product films.
- **v2:** four-look video hero, WebGL background, animated options, color picker.
- **v1:** first cinematic build, 18-variant catalog, media manifest, QA script.
