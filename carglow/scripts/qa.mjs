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
const pages = ['index.html', ...['static-classic', 'color-changing-rgb', 'graphic-mapping', 'rgbic-underglow'].map((p) => `products/${p}/index.html`)];

const browser = await chromium.launch();

// 1. All 18 combinations on the homepage configurator.
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await page.goto(BASE + 'index.html');
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
    const cell = await page.getAttribute(`[data-cell="${v.sku}"]`, 'aria-pressed');
    check(cell === 'true', `${v.sku} not highlighted in price table`);
    tested++;
  }
  console.log(`18-variant check: ${tested} tested`);

  // Hero: each tab selects its look, and the hero CTA carries the look into the build.
  for (let i = 0; i < 4; i++) {
    await page.click(`[data-tab="${i}"]`);
    check(await page.getAttribute(`[data-look="${i}"]`, 'class') === 'look is-active', `hero tab ${i} did not activate its look`);
  }
  await page.click('[data-tab="2"]');
  await page.click('[data-hero-build]');
  check((await page.textContent('[data-sum-sku]')).startsWith('MAP-'), 'hero CTA did not carry Mapping into the build');
  check(await page.evaluate(() => !!document.querySelector('canvas.ambient')), 'ambient background canvas missing');
  console.log('hero check done');

  // 2. Vehicle sizing.
  const cases = [['sedan', '', 'Medium'], ['fullsuv', '', 'Large'], ['sports', '', 'Small'], ['sedan', '192 in', 'Medium'], ['pickup', '21', 'Fitment check required'], ['van', '', 'Fitment check required'], ['crossover', '14.5', 'Small']];
  for (const [body, len, want] of cases) {
    await page.click(`[data-body="${body}"]`);
    await page.fill('#veh-length', len);
    const got = (await page.textContent('[data-rec] .rec-size'))?.trim();
    check(got === want, `sizing ${body} ${len || '(no length)'}: want ${want}, got ${got}`);
  }
  console.log(`sizing check: ${cases.length} cases`);

  // 3. Persistence across pages: set Large + underglow, open RGB page.
  await page.fill('#veh-length', '');
  await page.click('[data-builder] [data-tech="rgb"]');
  await page.click('[data-builder] [data-size="L"]');
  await page.click('[data-builder] [data-ug="1"]');
  await page.goto(BASE + 'products/color-changing-rgb/index.html');
  check(await page.textContent('[data-sum-sku]') === 'RGB-L-UG', 'build did not persist to RGB product page');
  check(await page.textContent('[data-sum-price]') === '$167', 'persisted price wrong on RGB page');
  await page.goto(BASE + 'products/graphic-mapping/index.html');
  check(await page.textContent('[data-sum-sku]') === 'MAP-L-UG', 'mapping page did not lock technology');
  check((await page.textContent('[data-sum-cta]')).includes('concept'), 'mapping CTA should be concept waitlist');
  console.log('persistence check done');
  await page.close();
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
const heroSteps = [
  ['01-hero', async () => {}],
  ['02-hero-mapping', async (page) => { await page.click('[data-tab="2"]'); }],
  ['03-reveal', wheelTo('#reveal', 40)],
  ['04-lineup', wheelTo('#lineup', 80)],
  ['05-build', wheelTo('#build', 60)],
  ['05b-build-options', wheelTo('#build', 620)],
  ['06-coverage', wheelTo('#kit', -1400)],
  ['07-kit', wheelTo('#kit', 20)],
  ['08-final', wheelTo('#final', 40)],
];
await shots('desktop', { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }, heroSteps);
await shots('mobile', { ...devices['iPhone 13'], deviceScaleFactor: 1 }, heroSteps);
await browser.close();

if (failures.length) { console.log(`\nFAILED (${failures.length}):\n- ${failures.join('\n- ')}`); process.exit(1); }
console.log('\nALL CHECKS PASSED');
