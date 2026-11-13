# Car Glow — launch readiness

Status on 2026-11-13 (v4): the independent website preview is built and tested. v1 is saved as commit `4f90ad9` on this branch and at its own preview link. **Nothing is purchasable.** Every kit shows "Early access" (Static, RGB) or "Concept · coming soon" (Mapping).

## Not yet confirmed on a real phone

A v2 screenshot from an iPhone showed coverage text touching the left screen edge. The likely cause (a padded, centered block inside a column flexbox, which Safari sizes differently from Chrome) has been removed from the coverage section and the hero. This environment has no Safari to test with, so it needs one look on an iPhone.

## Blockers to taking real orders

| # | Blocker | Owner action |
|---|---------|--------------|
| 1 | **Prices vs. LED counts don't work** (see cost ceilings below). | Get supplier quotes, then decide: raise prices, lower LED counts, or both. |
| 2 | No supplier, BOM or landed cost for any of the 11 kit classes. | Send the RFQ below to CJdropshipping / Alibaba pixel makers; order samples. |
| 3 | Power system not designed. Thousands of LEDs need a fused automotive DC design, not a cigarette-lighter inverter. | Electrical design + qualified review per kit size. |
| 4 | Mounting method not chosen or tested on paint, plastic, aluminum, carbon. | Test install + removal on sample panels. |
| 5 | Graphic Mapping workflow unproven (camera mapping, GIF/image upload). | Working demo on the exact controller + software (WLED / xLights / other). |
| 6 | **Footage rights.** Every clip is a third-party social media video. The ENVY Autostyle sign and the main 7-Eleven logo are now blurred; small pump signage remains. | Written permission from each creator, or replace with your own footage. |
| 7 | Early-access form saves to the visitor's browser only. | Connect to Klaviyo / Shopify customer list / a form service. |
| 8 | Shipping, returns, warranty and legal pages don't exist. | Write policies; legal review of lighting-law and paint-damage language. |
| 9 | Shopify not connected. | After 1–5: create real products/variants, map SKUs, test orders. |

## Cost ceilings at your target prices

What the **complete delivered body kit** may cost (LEDs + controller + power + mounts + packaging + shipping) to hit your margin targets. Computed in `src/data/catalog.json` → `costCeiling`.

| Kit | Price | Planned LEDs | Max kit cost | Max per LED |
|-----|------:|-------------:|-------------:|------------:|
| Static S / M / L (35% margin) | $45 / $62 / $82 | 4,400 / 5,600 / 8,200 | $29.25 / $40.30 / $53.30 | ~0.7¢ |
| RGB S / M / L (50% margin) | $56 / $75 / $109 | 4,400 / 5,600 / 8,200 | $28.00 / $37.50 / $54.50 | ~0.7¢ |
| Mapping S / M / L ($399 contribution) | $449 / $599 / $799 | 8,000 / 10,000 / 15,000 | $36.68 / $182.33 / $376.53 | 0.5¢ / 1.8¢ / 2.5¢ |

Mapping ceilings are **before** ad spend and returns allowances, and assume a 2.9% + $0.30 payment fee (verify your Shopify plan).

At these numbers, every kit must deliver all hardware for under about one cent per light. Addressable pixels and controllers generally cost far more than that, so expect most targets to fail once quoted. Mapping Small has $36.68 for 8,000 pixels and is almost certainly impossible. Underglow has no margin target yet.

## What a competitor actually ships

One of your reference reels ("Send this to a BMW owner") shows the retail box behind that look: **"Xmas Car LED Light System · 32M / 105FT · 320 LEDs · 160 clips included."**

- That kit is **320 LEDs**. The Car Glow plan is 4,400 to 8,200 LEDs for Static and RGB, roughly 14 to 26 times more.
- 320 LEDs over 105 ft is one light about every 4 inches along a single string wound around the car, not a 2-inch grid over every panel.
- Your $45 to $82 Static prices are in line with a kit like that. They are not in line with 4,400+ LEDs.

Decision for you: sell a string kit like the competitor's (prices can work, look is sparser), or keep the dense grid (look matches the supercar clips, prices must rise a lot). The site can present either; the catalog just needs the real numbers.

## Supplier RFQ — ask for each of the 9 body kits + 2 underglow kits

- LED type/protocol (e.g. WS2811 12V seed pixels), nodes per strand, strand count, spacing (cm), wire gauge, IP rating
- Controller model, outputs, per-port capacity, app/remote, effect limits; mapping software workflow
- Voltage, peak current, power supply/converter, fuse ratings, harness and injection points
- Mounting clips (model, count), tape (brand, width, roll length), protective film
- Connectors, extension leads (type, length, count), cable management, prep wipes
- Printed guide availability; packaging weight and dimensions
- Unit price at MOQ 1 and 50, delivered US shipping cost, lead time, sample terms, warranty, returns
- Can all parts ship in one box, packed per kit, fulfilled per order?

Fill the answers into the matching variant in `src/data/catalog.json` (fields are already there as `null`).

## Media

`public/media/media-manifest.json` lists every clip with checksum, duration, what it actually shows, where it's used and its rights status. Missing footage: hood-only coverage, real Car Glow hardware/unboxing, isolated underglow, controller/app screens, a mapping setup demo, removal/storage. Several files named in the ChatGPT handoff were never supplied (listed in the manifest).

## Shopify path (after blockers 1–5)

1. Create 3 products (Static Classic, Color-Changing RGB, Graphic Mapping), each with Size (S/M/L) × Underglow (No/Yes) = 6 variants, SKUs matching the catalog.
2. Copy each Shopify variant ID into `shopifyVariantId` in the catalog.
3. Swap the early-access button for a Storefront API cart (`cartCreate` with the variant ID) → Shopify checkout, only for variants with `purchasable: true`.
4. Place a real test order per variant before launch. The existing stores (`cdee2r-yy`, `whipef-3h`, theme 166159253761) have not been touched.
