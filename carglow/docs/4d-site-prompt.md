# 4D website prompt

## What these sites are called

Your word for them is **4D website**: 3D depth plus time, meaning motion driven by scrolling and the cursor so the page plays like a film. Designers and agencies use these terms for the same thing, which helps when you search for references or pitch clients:

- **Immersive website** or **cinematic website** (the general style)
- **Scrollytelling** or **scroll-driven storytelling** (scrolling moves the story forward)
- **WebGL / 3D interactive website** (the particle, shader and 3D-object effects)
- **Awwwards-style site** (after the awards site where this work is showcased)

The reference reels break down into five building blocks:

| Block | Seen in | What it is |
|---|---|---|
| Video-first hero | Dubai car rental, Car Glow closing section | Full-screen film with big type and one or two buttons |
| Scroll scrub | Luxury car, burger | Scrolling plays a pre-made video frame by frame |
| 3D carousel | Real estate cards, hoodies on a rail | Tilted cards or objects you drag through |
| Shader / particle background | textura "Relay" and "Motion instead of chrome" | Light ribbons, particles that react to scroll and cursor |
| Live configurator | 3D sneaker | Pick a swatch and the product and page recolor |

## The prompt

Fill in the brackets. Send it with the footage and reference recordings attached.

```text
Build a 4D website for [BUSINESS], which sells [PRODUCT/SERVICE] to [AUDIENCE].
The one action a visitor should take is [ACTION: buy / book / join waitlist].

STYLE
A cinematic, immersive site that plays like a film. Dark stage, one accent
color ([COLOR]), big wide uppercase headlines, short punchy lines, generous
empty space. No template look, no stock photos, no emoji, no fake reviews or
discounts. References attached: [LIST REELS / RECORDINGS].

HERO
Full-screen video, not a still. Show the full range of what we sell, not one
item: [LIST THE 3-4 PRODUCTS OR LOOKS]. Each gets its own short film cut from
the attached footage, with crossfades. Whole subject in frame, never cropped
tight. Headline "[HEADLINE]" with two buttons: "[PRIMARY]" and "[SECONDARY]".
Tabs let the visitor switch looks and show a timer until the next one.

SCENES (in scroll order)
1. Hero (above)
2. Reveal: [ONE-LINE STORY OF THE TRANSFORMATION]
3. Collection: 3D card carousel, one card per product, each stating what it
   does and what it does not do
4. Configurator: [INPUTS, e.g. vehicle, size, add-on] with a live price
5. Proof / range: sideways-scrolling reel of footage
6. What's included
7. Add-on with a live color picker
8. How it works / install
9. All prices in one table
10. FAQ, then a full-screen video call to action

MOTION
Every section has something moving behind it: a WebGL light background whose
color changes per section. Selected options animate (a light chases the
border, price counts up). Headlines rise in line by line. Smooth scrolling.
Honor "reduce motion" with a still version and give a pause button.

TECH
Vite, GSAP + ScrollTrigger, Lenis smooth scroll, plain WebGL for the
background (add three.js only for real 3D objects). Videos: H.264 MP4, muted,
playsinline, lazy-loaded, with poster images. Mobile first.

DATA
One editable catalog file holds every product, price and spec. Unknown values
stay empty; never invent them. Prices: [TABLE]. Nothing is purchasable until
I confirm suppliers; use "Join early access" instead of a buy button.

HONESTY
Sort every clip by what it actually shows. Label third-party clips as
reference footage. Blur other businesses' logos. Do not claim features the
product has not proven.

DELIVERY
Work scene by scene and get the hero right first. Test every product
combination, phone and desktop layouts, and reduced motion. Show me phone and
desktop previews, then list only what still blocks taking real orders.
```

## How Car Glow uses it

| Slot | Car Glow |
|---|---|
| Business / product | Car Glow, exterior LED lighting kits |
| Action | Join early access (no checkout until kits are verified) |
| Accent color | Magenta glow, ice blue secondary |
| Hero range | Static Classic, Color-Changing RGB, Graphic Mapping, RGBIC Underglow |
| Configurator | Vehicle → size → lighting → underglow, 18 combinations |
| Color picker | Underglow section: magenta, ice blue, green, red, amber |

## To push it further

- **AI-generated hero film.** The tutorial reel you saved shows the method: make a start image and an end image, have a video model (Veo, Kling, Seedance) animate between them, then cut the clips together. That would give Car Glow footage you own, for example a dark car lighting up panel by panel.
- **Real 3D car.** A 3D model the visitor can spin, with the lights drawn on. This needs a model file per body style.
- **Your own footage.** One night shoot of a real Car Glow install replaces every reference clip and removes the rights problem.
