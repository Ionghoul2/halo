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

  // 1. Home: hero, options, showcase, how, final. One hero film at a time; each look matched to its product.
  await page.goto(BASE + 'index.html');
  const sections = await page.$$eval('main > section', (els) => els.map((e) => e.id));
  check(sections.join(',') === 'hero,options,showcase,how,final', `home sections: ${sections}`);
  for (let i = 0; i < 4; i++) {
    await page.click(`[data-tab="${i}"]`);
    check((await page.getAttribute(`[data-look="${i}"]`, 'class')).includes('is-active'), `hero tab ${i} did not activate its look`);
    check((await page.textContent('[data-look-note]')).length > 10, `hero tab ${i} has no footage note`);
  }
  check((await page.getAttribute('[data-look="0"] video', 'data-src')).includes('look-static-wide'), 'desktop hero should use the wide cut');
  check((await page.getAttribute('[data-look="1"] video', 'data-src')).includes('dense-red-wide'), 'RGB hero look should use single-color footage');
  check((await page.getAttribute('[data-look="1"]', 'class')).includes('rgb-cycle'), 'RGB hero look should be marked as a simulated color change');
  check((await page.textContent('[data-look-note]')).includes('reference footage'), 'underglow look should be labelled as reference footage');
  check(await page.evaluate(() => !document.querySelector('video[data-src*="supercar-palette"], video[data-src*="film-rgb"], video[data-src*="look-rgb"]')),
    'homepage still uses addressable-pixel footage for RGB');
  check(await page.evaluate(() => !!document.querySelector('canvas.ambient')), 'ambient background canvas missing');
  check(await page.evaluate(() => document.querySelectorAll('.track-bg .bulb').length > 20), 'scroll light string missing');
  check(await page.evaluate(() => document.querySelectorAll('.garland .g-bulb').length >= 12), 'menu garland missing');
  const opts = await page.$$eval('[data-option]', (els) => els.map((e) => [e.dataset.option, e.querySelector('.option-price').textContent]));
  check(opts.map((o) => o[0]).join(',') === 'static,rgb,mapping,underglow', `options: ${opts}`);
  for (const [k, want] of [['static', '$45'], ['rgb', '$56'], ['mapping', '$449'], ['underglow', '+$45']]) {
    check((opts.find((o) => o[0] === k) || [])[1]?.includes(want), `option ${k} should show ${want}`);
  }
  const shows = await page.$$eval('[data-show]', (els) => els.map((e) => e.dataset.show));
  check(shows.join(',') === 'static,rgb,mapping,underglow', `showcase order: ${shows}`);
  check((await page.textContent('#kit-mapping .status')).toLowerCase().includes('coming soon'), 'mapping showcase must be marked coming soon');
  await page.click('[data-swatch="4"]');
  check(((await page.getAttribute('#kit-rgb video', 'style')) || '').includes('hue-rotate'), 'RGB swatch did not change the preview color');
  check((await page.textContent('[data-swatch-name]')).includes('simulated'), 'RGB preview must say it is simulated');
  await page.click('#kit-static [data-pick]');
  await page.waitForURL(/build\/index\.html/);
  check((await page.textContent('[data-sum-sku]')).startsWith('STATIC-'), 'Build this kit did not carry Static Classic into the build');
  check((await page.textContent('.step:not([hidden]) legend')).includes('Choose your lighting'), 'build should start with choosing the kit');
  await page.goto(BASE + 'index.html');
  await page.click('#kit-underglow [data-pick]');
  await page.waitForURL(/build\/index\.html/);
  check((await page.textContent('[data-sum-title]')).includes('underglow'), 'Add to a kit did not switch underglow on');
  await page.goto(BASE + 'index.html');
  await page.click('#kit-mapping [data-pick]');
  await page.waitForURL(/build\/index\.html/);
  check((await page.textContent('[data-sum-sku]')).startsWith('MAP-'), 'Join the waitlist did not carry Mapping into the build');
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
    const base = catalog.variants.find((x) => x.technology === v.technology && x.size === v.size && !x.underglow).ownerTargetPrice;
    check(await page.textContent('[data-sum-kit]') === `$${base}`, `${v.sku} kit line should be $${base}`);
    const ugLine = await page.textContent('[data-sum-ug]');
    check(v.underglow ? ugLine === `+$${v.ownerTargetPrice - base}` : ugLine === 'Not added', `${v.sku} underglow line wrong: ${ugLine}`);
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

// 7. Showcase: only the film filling the screen plays. Pause stops everything. Reduced motion stops the simulated color cycle.
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + 'index.html', { waitUntil: 'networkidle' });
  for (const k of ['static', 'rgb', 'mapping']) {
    await page.evaluate((id) => { const el = document.querySelector(`#kit-${id} .show-frame`); scrollTo(0, el.getBoundingClientRect().top + scrollY - 90); }, k);
    await page.waitForTimeout(1500);
    const playing = await page.evaluate(() => [...document.querySelectorAll('#showcase video')].filter((v) => !v.paused).map((v) => v.closest('[data-show]').dataset.show));
    check(playing.length === 1 && playing[0] === k, `showcase at ${k}: playing ${playing.join(',') || 'nothing'}`);
  }
  await page.click('[data-motion-toggle]');
  await page.waitForTimeout(300);
  check(await page.evaluate(() => [...document.querySelectorAll('video')].every((v) => v.paused)), 'pause control should stop every video');
  await page.click('[data-motion-toggle]');
  await ctx.close();
  const rctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const rp = await rctx.newPage();
  await rp.goto(BASE + 'index.html', { waitUntil: 'networkidle' });
  check(await rp.evaluate(() => getComputedStyle(document.querySelector('.rgb-cycle video')).animationName === 'none'), 'reduced motion should stop the simulated color cycle');
  check(await rp.isVisible('[data-motion-toggle]'), 'pause control missing');
  await rctx.close();
  console.log('showcase / pause / reduced-motion check done');
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
  ['03-options', wheelTo('#options', -70)],
  ['04-static', wheelTo('#kit-static', -70)],
  ['04b-rgb', wheelTo('#kit-rgb', -70)],
  ['04c-underglow', wheelTo('#kit-underglow', -70)],
  ['05-how', wheelTo('#how', 0)],
  ['06-how-steps', wheelTo('.how-inner', -120)],
  ['07-final', wheelTo('#final', 0)],
];
await shots('desktop', { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }, heroSteps);
await shots('mobile', { ...devices['iPhone 13'], deviceScaleFactor: 1 }, heroSteps);
await browser.close();

if (failures.length) { console.log(`\nFAILED (${failures.length}):\n- ${failures.join('\n- ')}`); process.exit(1); }
console.log('\nALL CHECKS PASSED');
