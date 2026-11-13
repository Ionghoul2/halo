# Car Glow

Cinematic storefront for Car Glow exterior LED lighting kits. Independent site (no Shopify yet), built with Vite, GSAP ScrollTrigger and Lenis.

```bash
npm install
npm run dev        # local dev server
npm run build      # production build in dist/
npx vite preview --port 4173 & npm run qa   # 18-variant, sizing, persistence, overflow and error checks + screenshots
```

## Where things live

| What | File |
|------|------|
| Prices, LED estimates, every variant field, cost ceilings | `src/data/catalog.json` |
| Configurator, vehicle sizing, shared state, motion | `src/shared.js` |
| Homepage scenes (four-look video hero, carousel, coverage reel, color picker) | `index.html`, `src/home.js` |
| Moving WebGL background, section tints | `src/shared.js` (`initAmbient`) |
| Site-type name and reusable build prompt | `docs/4d-site-prompt.md` |
| Product pages | `products/*/index.html` (render from `src/product.js`) |
| Footage + manifest | `public/media/`, `public/media/media-manifest.json` |
| What blocks real orders | `docs/launch-readiness.md` |

Edit a price or LED count in `catalog.json` and every page updates. Nothing is purchasable until a variant's `purchasable` is set to `true` after supplier verification.

Vehicle model lookup uses the free NHTSA vPIC API from the visitor's browser and falls back to typing the model in. Size comes from body style or the length the visitor enters.
