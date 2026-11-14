// QA: run `npm run build && npx vite preview --port 4173` first, then `npm run qa`.
import { createRequire } from 'node:module';
import { readFileSync, mkdirSync } from 'node:fs';

const { chromium, devices } = createRequire(import.meta.url)('playwright');
const BASE = process.env.QA_URL || 'http://localhost:4173/';
const SHOTS = process.env.QA_SHOTS || 'qa-shots';
const catalog = JSON.parse(readFileSync(new URL('../src/data/catalog.json', import.meta.url)));
mkdirSync(SHOTS, { recursive: true });

const failures = [];
const check = (ok, msg) => { if (!ok) failures.push(msg); };
const pages = ['index.html', 'build/index.html', 'pricing/index.html', 'install/index.html',
  ...['static-classic', 'color-changing-rgb', 'graphic-mapping', 'rgbic-underglow'].map((p) => `products/${p}/index.html`)];

const browser = await chromium.launch();

{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });

  // 1. Home: four sections, one hero film at a time, three priced kits that start a build.
  await page.goto(BASE + 'index.html');
  const sections = await page.$$eval('main > section', (els) => els.map((e) => e.id));
  check(sections.join(',') === 'hero,collection,how,final', `home sections: ${sections}`);
  for (let i = 0; i < 4; i++) {
    await page.click(`[data-tab="${i}"]`);
    check(await page.getAttribute(`[data-look="${i}"]`, 'class') === 'look is-active', `hero tab ${i} did not activate its look`);
  }
  check((await page.getAttribute('[data-look="0"] video', 'data-src')).includes('look-static-wide'), 'desktop hero should use the wide cut');
  check(await page.evaluate(() => !!document.querySelector('canvas.ambient')), 'ambient background canvas missing');
  check(await page.evaluate(() => document.querySelectorAll('.track-bg .bulb').length > 20), 'scroll light string missing');
  check(await page.evaluate(() => document.querySelectorAll('.garland .g-bulb').length >= 12), 'menu garland missing');
  for (const [i, price] of [[0, '$45'], [1, '$56'], [2, '$449']]) {
    if (i > 0) await page.click('[data-deck-next]');
    check(await page.textContent('[data-deck-n]') === `0${i + 1}`, `deck counter wrong at ${i}`);
    check((await page.textContent('[data-deck-meta]')).includes(price), `deck ${i} should show from ${price}`);
  }
  await page.click('[data-deck-choose]');
  await page.waitForURL(/build\/index\.html/);
  check((await page.textContent('[data-sum-sku]')).startsWith('MAP-'), 'Choose on the deck did not carry Mapping into the build');
  console.log('home check done');

  // 2. All 18 combinations on the build page.
  let tested = 0;
  for (const v of catalog.variants) {
    await page.click(`[data-builder] [data-tech="${v.technology}"]`);
    await page.click(`[data-builder] [data-size="${v.size}"]`);
    await page.click(`[data-builder] [data-ug="${v.underglow ? 1 : 0}"]`);
    const sku = await page.textContent('[data-sum-sku]');
    const price = await page.textContent('[data-sum-price]');
    const leds = await page.textContent('[data-sum-leds]');
    const want = `$${v.ownerTargetPrice}`;
    check(sku === v.sku, `SKU ${v.sku}: got ${sku}`);
    check(price === want, `${v.sku} price: want ${want}, got ${price}`);
    check(leds === `~${v.plannedLEDCount.toLocaleString('en-US')}`, `${v.sku} LEDs: got ${leds}`);
    tested++;
  }
  console.log(`18-variant check: ${tested} tested`);

  // 3. Vehicle sizing.
  const cases = [['sedan', '', 'Medium'], ['fullsuv', '', 'Large'], ['sports', '', 'Small'], ['sedan', '192 in', 'Medium'], ['pickup', '21', 'Fitment check required'], ['van', '', 'Fitment check required'], ['crossover', '14.5', 'Small']];
  for (const [body, len, want] of cases) {
    await page.click(`[data-body="${body}"]`);
    await page.fill('#veh-length', len);
    const got = (await page.textContent('[data-rec] .rec-size'))?.trim();
    check(got === want, `sizing ${body} ${len || '(no length)'}: want ${want}, got ${got}`);
  }
  await page.fill('#veh-length', '');
  console.log(`sizing check: ${cases.length} cases`);

  // 4. Pricing page: 18 prices, and tapping one opens that build.
  await page.goto(BASE + 'pricing/index.html');
  check((await page.$$('[data-cell]')).length === 18, 'pricing table should have 18 prices');
  await page.click('[data-cell="RGB-L-UG"]');
  await page.waitForURL(/build\/index\.html/);
  check(await page.textContent('[data-sum-sku]') === 'RGB-L-UG', 'pricing cell did not open that build');

  // 5. Persistence across pages, and the underglow color preview.
  await page.goto(BASE + 'products/color-changing-rgb/index.html');
  check(await page.textContent('[data-sum-sku]') === 'RGB-L-UG', 'build did not persist to RGB product page');
  check(await page.textContent('[data-sum-price]') === '$167', 'persisted price wrong on RGB page');
  await page.goto(BASE + 'products/graphic-mapping/index.html');
  check(await page.textContent('[data-sum-sku]') === 'MAP-L-UG', 'mapping page did not lock technology');
  check((await page.textContent('[data-sum-cta]')).includes('concept'), 'mapping CTA should be concept waitlist');
  await page.goto(BASE + 'products/rgbic-underglow/index.html');
  await page.click('[data-swatch="1"]');
  check(((await page.getAttribute('[data-ug-photo]', 'style')) || '').includes('hue-rotate'), 'underglow color preview did not apply');
  console.log('pricing / persistence / underglow check done');
  await page.close();
}

// 6. Videos start on their own on a fresh visit; a pause lasts only for that visit.
{
  const ctx = await browser.newContext({ ...devices['iPhone 13'] });
  const page = await ctx.newPage();
  await page.goto(BASE + 'index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const playing = await page.evaluate(() => [...document.querySelectorAll('.look video')].filter((v) => !v.paused).length);
  check(playing === 1, `phone hero should play exactly one film without a tap, got ${playing}`);
  await page.click('[data-motion-toggle]');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  check(await page.getAttribute('[data-motion-toggle]', 'aria-pressed') === 'true', 'pause should last for the visit');
  await ctx.close();
  const fresh = await browser.newContext({ ...devices['iPhone 13'] });
  const p2 = await fresh.newPage();
  await p2.goto(BASE + 'index.html', { waitUntil: 'networkidle' });
  check(await p2.getAttribute('[data-motion-toggle]', 'aria-pressed') === 'false', 'a new visit should start playing');
  await fresh.close();
  console.log('autoplay check done');
}

// 4. Every page: no horizontal overflow, no console errors, no purchase buttons.
for (const vp of [{ name: 'mobile', ...devices['iPhone 13'] }, { name: 'desktop', viewport: { width: 1440, height: 900 } }]) {
  const ctx = await browser.newContext({ ...vp, name: undefined });
  for (const p of pages) {
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error' && !/vpic|fonts\.g|ERR_TUNNEL|403/.test(m.text())) errors.push(m.text()); });
    // Media range requests are routinely cancelled (ERR_ABORTED) when a video pauses; that is not a failure.
    page.on('requestfailed', (r) => { if (!/vpic|fonts\.g/.test(r.url()) && r.failure()?.errorText !== 'net::ERR_ABORTED') errors.push(`failed: ${r.url()}`); });
    await page.goto(BASE + p, { waitUntil: 'networkidle' });
    for (let y = 0; y < 30; y++) { await page.mouse.wheel(0, 900); await page.waitForTimeout(60); }
    await page.waitForTimeout(400);
    const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    check(sw <= cw, `${vp.name} ${p}: horizontal overflow ${sw} > ${cw}`);
    const buy = await page.$$eval('button, a', (els) => els.map((e) => e.textContent.trim()).filter((t) => /add to cart|buy now|checkout/i.test(t)));
    check(buy.length === 0, `${vp.name} ${p}: purchase controls present: ${buy}`);
    check(errors.length === 0, `${vp.name} ${p}: errors ${errors.join(' | ')}`);
    await page.close();
  }
  await ctx.close();
}
console.log('overflow / errors / purchase-control check done');

// 5. Screenshots.
async function shots(name, opts, steps) {
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  await page.goto(BASE + 'index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  for (const [label, action] of steps) {
    await action(page);
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${SHOTS}/${name}-${label}.png` });
  }
  await ctx.close();
}
const wheelTo = (sel, extra = 0) => async (page) => {
  const y = await page.evaluate(([s, e]) => document.querySelector(s).getBoundingClientRect().top + scrollY + e, [sel, extra]);
  const cur = await page.evaluate(() => scrollY);
  for (let d = cur; Math.abs(y - d) > 10; d += Math.sign(y - d) * Math.min(800, Math.abs(y - d))) {
    await page.mouse.wheel(0, Math.sign(y - d) * Math.min(800, Math.abs(y - d)));
    await page.waitForTimeout(50);
  }
};
const wheelBy = (px) => async (page) => { for (let d = 0; d < px; d += 100) { await page.mouse.wheel(0, 100); await page.waitForTimeout(40); } };
const heroSteps = [
  ['01-hero', async () => {}],
  ['02-hero-mapping', async (page) => { await page.click('[data-tab="2"]'); }],
  ['03-deck-1', wheelTo('#collection', 30)],
  ['04-deck-2', async (page) => { await wheelBy(Math.round(page.viewportSize().height * 0.6))(page); }],
  ['05-how', wheelTo('#how', 0)],
  ['06-how-steps', wheelTo('.how-inner', -120)],
  ['07-final', wheelTo('#final', 0)],
];
await shots('desktop', { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }, heroSteps);
await shots('mobile', { ...devices['iPhone 13'], deviceScaleFactor: 1 }, heroSteps);
await browser.close();

if (failures.length) { console.log(`\nFAILED (${failures.length}):\n- ${failures.join('\n- ')}`); process.exit(1); }
console.log('\nALL CHECKS PASSED');
