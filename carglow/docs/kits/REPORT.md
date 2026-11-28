# Car Glow — Product reverse engineering, video analysis and sourcing (2026-11-28)

No live prices were changed. No kits were published. No purchases were made.

Files in this folder:
- `REPORT.md` — this report.
- `vehicle-kit-matrix.csv` and `vehicle-kit-matrix.json` — 81 rows: 9 categories × 3 coverage levels × each lighting system.
- `sourcing-master.csv` — every component with its source, price and evidence.
- `install-guide.md` — the install guide.
- `diagrams/` — three SVG diagrams.
- `build_kits.py` — regenerates the matrix.

## 1. What I could and could not watch

| Video | Vehicle | How analyzed | Hardware found | Confidence |
|---|---|---|---|---|
| 3_s2zLoXdKg | Nissan Sentra | Full watch (vidIQ) + description | Twinkly Dots 400 ×8, clear wire; red inverter in center socket; 15 A fuse; car-wrap vinyl under tape; painter's tape for planning; FX Wizard draw/GIF import | Confirmed from footage |
| mUbKFKa32P8 / V6DMPQ_eS7A | Lamborghini Huracan STO | Full watch (vidIQ) | Twinkly Dots Gen II 400 ×5 = 2,000 LEDs, black wire; camera mapping only worked as a "Join" group; Tripp-Lite 375 W, then 500 W (description links a BESTEK); clear tape over full PPF; phone hotspot fixed a dropped strand | Confirmed from footage (inverter brand: discrepancy) |
| PxjhRP3pH30 | 4 cars, 13,000 lights | Full watch (vidIQ) | ~3,000 static multicolor mini lights per car ("500 MULTICOLOR MINI LIGHTS" boxes, green wire); blue tape squares; 48 crew-hours | Confirmed from footage (power gear not shown) |
| imKJ6Fso0Tk | Tesla | Partial watch + description | Twinkly (description); mapped patterns | Confirmed from creator documentation |
| 3kWlAOJqlNU | Detail shop | Short watch | Black wire, small round bulbs, clear tape, adapter | Probable identification (brand unknown) |
| oockPv3PxO0 | Legends Auto Parts kit | Short watch + description | 65 ft RGB strips ×4/×6, remote + app, residue-free tabs, AA battery boxes | Confirmed from creator documentation |
| wkQIxmCc044 | Mustang (Middleton) | Transcript only | 2,400 lights, 33 ft rolls from Menards; tape every foot; inverter; doubled hard edges | Confirmed from creator documentation |
| PVeMUxP6zrI | Hummer H3 | Transcript only | Christmas Light Source 12V DC strings (20 bulbs/10 ft); sPOD switch panel; no inverter | Confirmed from creator documentation |
| aUAj9vuqbBk | BMW M340i | Transcript only | Hezbjiti 1,000-LED ×2 (B098JJ2FZR); inverter B08YTH66FN + strip; 7 h; zig-zag | Confirmed from creator documentation |
| oznh-whKAAg | Duramax truck | Transcript only | 2,400 Walmart lights; vinyl B078X3TFT1; 120 W inverter; battery died with the engine off | Confirmed from creator documentation |
| BhvlDzcrH2I | Porsche (ACI) | Transcript only | Twinkly Dots ×4 (said ~10 needed for full car); over Xpel PPF | Confirmed from creator documentation |
| qxCzyr_bSyE | Nissan GT-R | Transcript only | 300-LED zigzag sets ×6; Ridgid tool battery + inverter; painter's tape failed, gaffer tape worked | Confirmed from creator documentation |
| r6VSyqkWfCY | Toyota truck | Transcript only | 1,400-LED 552 ft clear wire (B0D7SGZ4WD); inverter with switch | Confirmed from creator documentation |
| MscXVzQvsog | Camaro | Transcript (auto-translated) + description | Ollny 1,000 (B09YHPZ28V); BESTEK 300 W (B004MDXS0U); ScotchBlue; drove ~50 mph; battery warning | Confirmed from creator documentation |
| gKx3fq67SAc | Ford F-150 (BuiltRight) | Description + 2024 blog | ~4,000 Twinkly Strings woven through cargo webbing; Ford Pro Power Onboard | Confirmed from creator documentation |
| dovfVF8v4X0 | MINI Electric (Festive Lights) | Full watch (Watch Any Video, 2:11) + blog | "Twinkly PRO" logo on screen (0:03); dark green wire, round bulb caps (0:14); a power/control unit labelled "gridto go 400-50" placed in the boot (0:14–0:21), with leads running through the boot opening (0:46); strings laid in parallel rows; crew of 4 (time-lapse 0:27–0:42); the app shows text and 3D effects mapped to the car outline (0:53–1:35). Blog: 2,000 LEDs, 2 controllers, matte vinyl under everything | Confirmed from footage (exact power unit: Unverified) |
| 5IQn0d_lm4g | Camry (Echo Speed), 9:57 | TinyFish frame check at 5 points; no captions on the video | Small bulbs on white wire; blue painter's tape throughout; grid/mesh layout over roof, hood, doors and trunk. Description: Ollny lights $32, inverter $22. Inverter not seen in the checked frames | Probable identification (frames) + Confirmed from creator documentation (parts) |
| JkGFQWySq4Y | Camry (Echo Speed), 8:23 | TinyFish frame check; no captions | Multicolor minis, blue painter's tape, criss-cross on the hood and wrap around the body; windows and wheel wells left unlit. Description: lights $30, inverter $22. The agent's frame notes were vague ("green or brown wire") | Unverified (frames) + Confirmed from creator documentation (parts) |
| gP-99CbORiw | Civic Type R, 4:28 | Full watch (Watch Any Video) | Box: "LED Christmas Lights Multicolor, Weather Resistant, Timer + Memory Function" (0:11–0:27); black wire on screen (1:40), though the listing says dark green; Pisfau 200 W inverter, model MT-PC200, in the 12 V socket, with built-in outlets and no power strip (0:35, 1:05–1:56); green automotive masking tape, "as much tape as possible" (2:56); parallel rows on the hood and roof, zig-zag on the doors and fenders (2:30–3:25); slack through the door jambs; avoided windows and grille; had to tie down extra cord (3:27) | Confirmed from footage |
| ul5q9zqskzk | Twinkly Dots review (ModernDayTech), 6:06 | TinyFish frame check at 5 points + chapter list | Round dots about 1.2 cm across on clear wire; small controller box with USB power; diffuser caps; sold in 60, 200 and 400 sizes; the app's mapping canvas is shown (4:26 "Door Mapping"); music sync (5:20); adhesive dots and hooks included | Probable identification |

**How each video was covered (updated).**
- **Watched in full:** the MINI and the Civic, with the last free Watch Any Video minutes. 9 of the 10 free minutes are now used.
- **Frame checks:** both Camry videos and the Twinkly review, by TinyFish's cloud browser checking 5 points in each. Cost: $1.41 from your existing TinyFish balance ($2.38 left).
- **Dead ends:** Sandcastles needs a paid plan. The container's network blocks direct YouTube downloads.
- **How to read the labels:** frame checks are less reliable than full watches, so they're labelled "Probable" or "Unverified". Rows marked "transcript only" or "description only" are what the creators said or wrote, not what was seen on screen.

## 2. What the evidence says about hardware

1. **Most of the 21 videos (12) use cheap two-wire "8-mode" fairy strings:**
   - Brands: Ollny, Hezbjiti, and store brands from Menards and Walmart.
   - Power: a 29 V adapter.
   - Price: about $27–32 per 1,000 LEDs.
   - Limit: they are not individually addressable. Every LED does the same thing at once.
2. **The "wow" mapped videos (logos, scrolling text, faces) all use Twinkly**, either Dots or Strings:
   - Twinkly is the only off-the-shelf system in the footage that does camera mapping.
   - It costs about $0.33–0.40 per LED at retail.
3. **Nobody in the footage used magnets, clips, or anything permanent.** They used:
   - painter's tape;
   - clear tape over paint protection film (PPF);
   - gaffer tape;
   - removable vinyl film under the tape;
   - zip ties on truck racks.
4. **Power was always an inverter** in the 12 V socket or on a tool battery, plus a power strip. Exceptions:
   - The MINI ran from a separate power unit in the boot ("gridto go 400-50"), not the car's socket.
   - The H3 used native 12 V strings.
   - The F-150 used Ford's onboard outlet.
   - The Duramax battery died with the engine off.
   - The Camaro's car warned its battery was weakening.
5. **LED counts are lower than our pricing model assumed:**
   - Full-body installs used about 2,000 LEDs on the MINI and the Huracan, about 2,400–3,000 on the Mustang and Camaro, and about 4,000 on the F-150.
   - Our pricing model priced RGB-S at 4,000 pixels and MAP-S at 8,000.

## 3. Can one set of hardware serve Classic, RGB and Mapping?

**Yes, if the hardware is addressable pixels on a WLED controller.**
- **Strings.** The same WS2811 seed-pixel strings can:
  - show a static warm white or multicolor "Classic" look;
  - run RGB effects;
  - with a position map (`ledmap.json` / 2D matrix) and GIF upload, show graphics.
- **Tiers.** The tiers then differ by:
  - density (pixels per m²);
  - controller and firmware;
  - our layout file.
- **Cheaper Classic.** Classic is cheaper with fairy strings ($30 per 1,000 vs $80 per 1,000). Those strings can never be upgraded.

Rules I kept to:
- **Addressable ≠ mapped.** An RGBIC/WS2811 app box runs effects. It has no idea where each pixel sits on the car, so it can't draw a logo.
- **Camera mapping:**
  - **Confirmed in footage:** only Twinkly.
  - **Govee Christmas Lights 2:** advertises "Shape Mapping". Compatible alternative, unverified on a car.
  - **WLED:** mapping is manual, either a file we build per vehicle or a 2D-matrix layout.
- **Controller limits:**
  - Twinkly groups: about 4,000 LEDs or 10 devices on good Wi-Fi.
  - Twinkly Pro controller: 1,000 LEDs each, 5,000 per group.
  - WLED (ESP32): about 1,000 pixels per controller for smooth frame rates (planning figure; not tested by us).

## 4. Rebuilt product line

| Tier | Hardware | What the buyer gets | Evidence base |
|---|---|---|---|
| **Classic** | Fairy strings (Ollny-class), 300 W socket inverter, tape + vinyl film | Fixed multicolor or warm white, 8 modes | Most of the creator installs |
| **RGB Effects** | WS2811 12 V seed pixels + app controller | Color-changing effects, music | Supplier quote; not in footage |
| **Graphic Pro** | Same pixels + ESP32 WLED controllers + our map file | Logos, text, GIF upload | WLED docs; not in footage |
| **Graphic Elite** | Twinkly Dots 400 sets | Camera mapping from the phone app | Sentra, Huracan, Porsche, Tesla footage |

## 5–6. Vehicle kits

All 81 combinations are in `vehicle-kit-matrix.csv`. Each row gives:
- LED count, rounded to whole packs;
- packs and wire length;
- controller count and max and running watts;
- amps at 12 V;
- power system;
- tape rolls, tabs and vinyl film;
- light cost, kit cost, retail at 40% margin, profit and margin;
- install hours and difficulty.

Coverage levels are 120, 220 and 400 LEDs per m² of paintable surface. The model is calibrated on the MINI, Huracan, F-150 and Camaro installs.

Full-body coverage, kit cost (retail at 40% margin):

| Category | Example | LEDs | Classic | RGB Effects | Graphic Pro | Graphic Elite (Twinkly) |
|---|---|---:|---:|---:|---:|---:|
| Compact car | MINI Cooper | 3,000 | $237 ($417) | $462 ($810) | $492 ($862) | $1,070 ($1,876) |
| Coupe | Mustang | 3,000 | $240 ($422) | $465 ($815) | $495 ($868) | $1,239 ($2,171) |
| Sports car | Huracan | 3,000 | $238 ($418) | $463 ($811) | $493 ($864) | $1,071 ($1,877) |
| Sedan | Camry | 3,000 | $241 ($423) | $466 ($816) | $496 ($869) | $1,240 ($2,173) |
| Hatchback | Golf | 3,000 | $239 ($419) | $463 ($812) | $493 ($865) | $1,072 ($1,878) |
| Compact SUV | Model Y | 3,000 | $243 ($426) | $467 ($819) | $497 ($872) | $1,408 ($2,466) |
| Large SUV | Tahoe | 4,000 | $303 ($531) | $624 ($1,093) | $664 ($1,164) | $1,740 ($3,048) |
| Pickup | F-150 | 4,000 | $304 ($533) | $625 ($1,096) | $665 ($1,166) | $1,741 ($3,050) |
| Extended pickup | F-250 8 ft | 5,000 | $364 ($639) | $758 ($1,328) | $808 ($1,416) | $2,079 ($3,642) |

Twinkly packs are 400 LEDs, so Twinkly counts come out at 2,400–4,800.

**Our live prices vs the evidence-based cost.** Profit is after Shopify fees. The live prices are on whipef-3h.

| Live kit | Live price | Closest evidence kit | Kit cost | Profit | Target |
|---|---:|---|---:|---:|---:|
| RGB-S | $881 | Compact, full-body | $462 | $393 | $350 ✅ |
| RGB-M | $995 | Sedan, full-body | $466 | $500 | $350 ✅ |
| RGB-L | $1,113 | Pickup, full-body | $625 | $455 | $350 ✅ |
| MAP-S | $1,602 | Compact, high-density, Graphic Pro | $652 | $903 | $525 ✅ (+$378) |
| MAP-M | $1,741 | Sedan, high-density, Graphic Pro | $795 | $896 | $525 ✅ (+$371) |
| MAP-L | $1,994 | Pickup, high-density, Graphic Pro | $1,369 | $567 | $525 ✅ |

The current prices clear every target. If the evidence counts hold up in a test install, Mapping S and M could drop about $350 and still keep $525. That's your call. I changed nothing.

## 7. Sourcing

See `sourcing-master.csv`: 26 lines, each with an Amazon ASIN, supplier or quote, a price status and a confidence label.

Cheapest verified path:

| Tier | Source |
|---|---|
| Classic | Ollny or Hezbjiti packs (creator-verified) |
| RGB and Graphic Pro | KTRLIGHT WS2811 at $0.08/px (quoted) plus GLEDOPTO WLED |
| Elite | Twinkly retail; no wholesale quote yet |

**Before ordering pixels, KTRLIGHT must confirm in writing:**
- 12 V or 5 V;
- IP rating;
- connector type;
- pixel spacing.

## 8. Power and safety

**Socket.**
- A 12 V socket on a 15 A fuse (the Sentra's) is good for about 120 W continuous through an inverter.
- Every Classic kit and every full-body RGB kit on a car up to SUV size fits, with brightness capped at 35%.

**Big pixel kits.**
- These are Large SUV and pickup RGB/Graphic kits, and every high-density pixel kit: over 12 A, about 120 W.
- Use a clamp-on inverter fused at the battery, engine running, or a portable power station.
- Over 25 A, use only the power station.

**Battery.**
- Documented failures: the Duramax died with the engine off; the Camaro gave a battery warning.
- The guide says: engine running, or a separate power station, for any display over 30 minutes.

**EVs.**
- Use only the 12 V accessory socket or Ford Pro Power-style factory outlets.
- Never touch the high-voltage traction battery.

**Driving.**
- The Camaro drove at about 50 mph with the tape holding, and the Toyota did a rain test.
- A friend's TRX got its paint scratched by lights slapping at highway speed.
- A Florida officer told the GT-R owner it was OK if not blinking.
- What we can promise: parked display only. No promise of highway use, waterproofing, zero paint damage or zero battery drain.

**Legal.** Colored or flashing exterior lights on moving vehicles are restricted in many US states. Keep the FAQ wording as it is.

## 9. Final recommendation

1. **Relaunch Classic now** on Ollny-class strings, sold at Standard coverage (2,000–3,000 LEDs).
   - Standard-coverage kit cost is $181–254, so the current Static prices still clear your 35% rule:

     | Kit | Price | Profit | Margin |
     |---|---:|---:|---:|
     | S | $299 | $109 | 36% |
     | M | $399 | $202 | 51% |
     | L | $499 | $234 | 47% |

   - Full-body Classic needs about $417 for a compact car; sell it as an upgrade.
   - **Your go-ahead is needed to un-hide Static. It stays hidden until then.**
2. **Make RGB and Mapping one hardware platform:** WS2811 12 V seed pixels plus a WLED controller.
   - Mapping costs only $30–50 more in hardware than RGB plus our layout file, so the price gap is mostly service and margin.
3. **Offer Twinkly "Elite" only as a quoted custom order.** Retail Twinkly costs $1,070–2,080 per car, leaving too little margin at our current prices.
4. **Run one real test install** (compact car, 3,000 pixels) before shipping any pixel kit, to confirm:
   - the LED count;
   - the 12 V current draw;
   - WLED mapping time;
   - tape removal.
5. **Open items needing you:**
   - Approve Classic pricing.
   - Get KTRLIGHT to confirm the specs above.
