# KTRLIGHT check for the Shopify drafts (2026-11-22)

Supplier: Shenzhen Keterine Technology Co., Ltd. (KTRLIGHT). 11 yrs, brand holder, 4.8/5 store rating (332), 100% on-time dispatch, ≤2h response.
No supplier contacted. No order placed. Website not changed.

## Status of the requested actions

| Action | Result |
|---|---|
| DSers: find products, read variants, map to drafts | **Blocked.** Every DSers call returns `PLAN_RESTRICTION` (MCP access needs the DSers Advanced plan or higher). Retried today. |
| Shopify: read drafts 15441314742576 / 15441315037488 | **Blocked.** No Shopify connector in this session (the official Shopify connector is in the claude.ai directory, not installed). The store host is also refused by this session's network. |
| Connect eligible products to checkout | **Not done. No product is eligible yet** (reasons below). |
| Test purchase flow | **Not run.** Needs an active, published product with a fulfillment link. |
| Website | Untouched. All 18 kits stay `purchasable: false`. |

## 1. KTRLIGHT RGB Strings → listing 1601636668760

URL: https://www.alibaba.com/product-detail/WS2811-Pebble-Seed-Plastic-IP65-Waterproof_1601636668760.html
Read on 2026-11-22 (page + browser run).

| Item | What the listing says |
|---|---|
| Model | KTR-PIXEL-WS2811-STRING, WS2811 pebble seed, 3-pin, IP65 |
| Variants | Wire: Clear / Black. Voltage: **DC5V $40** / **DC12V $45** per piece |
| What a "piece" is | 1 string. 5 cm pitch = 20 pixels/m. **Pixels per piece not stated** ("custom length") |
| MOQ | 1 piece (single-order OK) |
| Stock | Marked ready to ship. **No stock count shown.** 38 sold, 4.7/5 (5 reviews) |
| US shipping | Free, Alibaba.com Logistics Standard, import charges included, guaranteed **Dec 01–24** |
| Dropship | "Dropship this product to your store" shown (Alibaba dropshipping). DSers support not verified: DSers is blocked |
| Controller | **Not included.** Works with WS2811 SPI controllers (T-1000S, K-1000C, Bluetooth/Wi-Fi app controllers) |
| Power | No watts per pixel on the listing |
| Package | 20 × 18 × 6 cm, 0.72 kg |

Your direct quote: **$80 / 1,000** and **$160 / 2,000** 5V pixels, lights only (= $0.08 per pixel).
$40 per 5V piece matches the quote only if a piece is 500 pixels (25 m). **That is my inference, not confirmed.** Until the pixel count per piece is confirmed, a Shopify variant called "1,000 pixels" cannot be mapped honestly to this listing.

### Selling price at your RGB margin (45–50%), lights only

| Pack | Cost | 45% margin | 50% margin | Coverage at 2 in grid |
|---|---:|---:|---:|---:|
| 1,000 px 5V | $80 | $145.45 | $160.00 | ~28 sq ft |
| 2,000 px 5V | $160 | $290.91 | $320.00 | ~56 sq ft |
| 1,000 px 12V (if same px/piece as 5V) | $90 | $163.64 | $180.00 | ~28 sq ft |

Controller, power converter, mounting and packaging are **not** in these costs.

**Price inconsistency (flagged, not changed):** the website plans RGB Small at 4,400 pixels for $56. 4,400 × $0.08 = **$352 for the lights alone**, which needs about $640–704 at 45–50% margin. The planned RGB prices ($56 / $75 / $109) are below lights-only cost.

### Power (estimate, listing gives no watts)

WS2811 seed pixels are typically 0.1–0.3 W each at full white. A similar WS2811 net listing (Topsung) states 0.1 W/LED.

| Pack | Load | Current from the car's 12V (through a 12V→5V converter, ~90%) |
|---|---:|---:|
| 1,000 px | 100–300 W | ~9–28 A |
| 2,000 px | 200–600 W | ~19–56 A |

Cigarette-lighter sockets are typically fused at 10–15 A. So:
- 1,000 px fits a socket only with a brightness cap, or if the pixels are near 0.1 W.
- 2,000 px needs a fused battery connection. That breaks your rule that the lights must plug into the cigarette lighter.

A 5V string over 25–50 m also needs power fed in every ~50–100 pixels. **The 12V version ($45) is the better fit for a car.** Choosing 12V is your call: it's the same supplier and listing, but a different variant from the quote.

### Graphic mapping

The strings are loose addressable pixels. **They include no mapping software and no controller.** Graphics need a pixel-mapping controller plus software (e.g. WLED, xLights, LEDEdit with a T-1000S) and a programmed layout for each car. Do not sell the strings as "Graphic Mapping".

## 2. KTRLIGHT P25 Graphic Mesh

There is no single-piece P25 listing. The KTRLIGHT mesh listing is **P20**. Its URL still reads "25mm pixel pitch", but the current specs say 20 mm, and other pitches are custom.
URL: https://www.alibaba.com/product-detail/WS2815-25mm-Pixel-Pitch-DC12V-Full_1601432419561.html

| Item | Listing |
|---|---|
| Pitch / density | P20, 2,500 dots/m². P25 = custom pitch (needs supplier contact, not done) |
| Price | **$289 per m²** (1–9,999 m²), $90/m² at ≥10,000 m² |
| Voltage / power | 12V DC, **150 W/m²** (≈12.5 A per m² at 12V) |
| Lead time | 7 days for 1–10 m² (made to order, **not stock**) |
| Control | DMX512 / SPI / Art-Net. Works with WS2811 systems (WLED, xLights, Falcon, SanDevices, Colorlight, NovaStar, Huacanxing) |
| Included | Screen only. **Power supply and controller not included and not waterproof** (enclosure needed) |
| US shipping | Not read |
| Rating | 5.0 (16 reviews), 33 sold |

**Not eligible for checkout:** the P25 pitch is custom, the mesh is made to order, US shipping wasn't read, and it has no controller or power.

**Price check against your Mapping rule ($399 profit per kit):** Mapping Small is planned at $449, which leaves $50 for all costs. One m² of mesh is $289, and a hood is roughly 1.5 m² (≈$434, ~225 W, ~19 A). The planned Mapping prices can't carry $399 profit with this mesh.

## 3. Mapping eligibility (needs DSers + Shopify access to finish)

For each draft, DSers mapping needs:
1. The KTRLIGHT item to appear in DSers' Alibaba.com supplier search, with its variant IDs (Clear/Black × 5V/12V).
2. The Shopify draft imported into DSers.
3. Shopify variants that match a real supplier variant and quantity. For example, "1,000 px" = N pieces, once pixels per piece are confirmed.

Strings: likely mappable once pixels per piece are confirmed.
Mesh: not mappable as a fixed product (custom size and pitch).

## 4. What unblocks the rest

1. **DSers Advanced plan** ($19.90/mo). This is your decision; it conflicts with your no-subscriptions rule.
2. **Shopify connector**: add the official Shopify connector at claude.ai/customize/connectors, then start a new session.
3. **Pixels per piece** on listing 1601636668760 (5V and 12V), from KTRLIGHT. You send it; question below.
4. **Price decision**: RGB and Mapping planned prices vs the costs above.
5. **Shopify plan**: the store is on a trial. Real checkout needs a paid plan; until then, test only with Shopify's test payment gateway.

Question for KTRLIGHT (copy and send yourself):

> Hello, for listing 1601636668760 (KTR-PIXEL-WS2811-STRING, 5 cm pitch): how many pixels are in one piece at the $40 DC5V price and at the $45 DC12V price? What is the maximum wattage per pixel at full white? Can you ship 1 piece to a US customer address by Alibaba dropshipping? Thank you.
