# Car Glow kit pricing review (2026-11-28)

Owner rules: Static Classic 35% margin. RGB keeps $350 per order. Graphic Mapping keeps $525 per order. Underglow priced separately. "Keep" = after parts, supplier freight and card fees (2.9% + $0.30), before ads, returns, overhead and tax.
Formula (fixed $): retail = (delivered kit cost + keep + 0.30) / 0.971. Formula (35%): retail = (cost + 0.30) / 0.621.
No store prices were changed. Shopify connector is signed out.

## Quantities (car calculator, owner's "6,000 RGB pixels = Large")
- RGB, 2 in grid: Large 6,000. Small and Medium are scaled by covered area (105 / 135 / 195 sq ft) and rounded up to 1,000-pixel packs: 4,000 / 5,000 / 6,000.
- Mapping, 1.5 in grid over the same area (x1.78), rounded up: 8,000 / 9,000 / 11,000 pixels.
- Static, same grid as RGB: 4,000 / 5,000 / 6,000 bulbs.
- The catalog's older model said 4,400 / 5,600 / 8,200. The owner's 6,000 Large overrides it.

## Table (E = estimate, V = verified)

| Kit | Size | Delivered | Kit cost | Original retail | Closest competitor (delivered) | Recommended retail | You keep |
|---|---|---|---:|---:|---|---:|---:|
| RGB | S | 4,000 px | $505 (E) | $999 | Twinkly 600 px $249.99, ~$1,670 per 4,000 px (Target, per ChatGPT, not re-checked) | **$879** | $350 |
| RGB | M | 5,000 px | $615 (E) | $1,299 | ~$2,080 per 5,000 px (Twinkly scale) | **$995** | $350 |
| RGB | L | 6,000 px | $730 (E) | $1,599 | ~$2,500 per 6,000 px (Twinkly scale) | **$1,115** | $350 |
| Mapping | S | 8,000 px | $1,030 (E) | $1,499 | ~$3,330 per 8,000 px (Twinkly scale) | **$1,599** | $525 |
| Mapping | M | 9,000 px | $1,165 (E) | $1,999 | ~$3,750 (Twinkly scale) | **$1,749** | $525 |
| Mapping | L | 11,000 px | $1,410 (E) | $2,499 | ~$4,580 (Twinkly scale) | **$1,995** | $525 |
| Static | S | 4,000 bulbs | $183 (E) | $249 | Honoson 1,200-LED car set $75.08; 4 sets = 4,800 LEDs for ~$300 (flapen, per ChatGPT, not re-checked) | $295 at 35%; **gap** | $103 |
| Static | M | 5,000 bulbs | $222 (E) | $329 | 5 sets ~$375 | $359 | $125 |
| Static | L | 6,000 bulbs | $262 (E) | $399 | 5 sets ~$375 (6,000 LEDs) | $422; **gap** | $148 |
| Underglow S/M | — | 4 strips | $17.65 (V, delivered) | $59 | Govee 8-strip RGBIC $54.99 (per ChatGPT) | **$41.99 + $12 ship = $53.99 delivered** | $34.47 (64%) |

Rounded recommendations: computed $880.84 / $994.13 / $1,112.56 and $1,601.75 / $1,740.78 / $1,993.10 were rounded to .99/.95 price points (a $2–4 difference in earnings).

## Kit cost build-up (estimates)
- RGB pixels: $0.08 each (owner's KTRLIGHT direct quote, verified figure; 5V). Freight E: ~$8–10/kg air, ~0.72 kg per 500 px. WS2811 app controller E $30–35. Power E $55–75 (fused battery lead + 12V→5V converters). Mounting E $35–50. Box and printed guide $10.
- Mapping: same pixel price. Phone-upload controllers E: WLED on ESP32 multi-output boards ($120–170). WLED lets the owner upload images and GIFs from a phone browser onto a matrix layout. It has no Twinkly-style camera mapping, so each car layout is set up manually.
- Static: E $0.027/bulb from the Kiara 300-LED spool ($7.50–8.50). That spool is a 29V set and needs a custom 12V version; the RFQ is not answered. Power E $20–25 (fused battery lead; ~13 A at 4,000 bulbs). Mounting E $20–30. Freight E $25–35.

## Blocking issues before any kit goes on sale at these prices
1. **Power.** 6,000 WS2811 pixels at 0.1–0.3 W each = 600–1,800 W at full white, i.e. 50–150 A at 12V. A cigarette socket (10–15 A) can't run it, and a car battery runs it for under an hour at full brightness. Kits must ship with a brightness-limited controller (about 15–20%) and a fused battery lead, or a portable power station (+$150–250 cost, about +$155–260 retail). This is the component most likely to break the $350 / $525 targets.
2. **Pixels per KTRLIGHT piece** are still unconfirmed, so the pack rounding is an estimate.
3. **Static costs** depend on the RFQ. At Honoson's ~$300 for 4,800 LEDs, a 35% Static Small must cost ≤ $185 delivered; the current estimate is $183, so it only just fits, and only if the 12V spool really costs ~$8.
4. **Install scale.** 6,000 px at 5 cm spacing is ~300 m of wire on one car (~1,500 clips). Instructions and clip counts must match this.
5. Competitor prices come from ChatGPT's research and were not re-checked here.
