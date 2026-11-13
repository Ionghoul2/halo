import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import catalog from './data/catalog.json';
import './styles.css';

gsap.registerPlugin(ScrollTrigger);
export { gsap, ScrollTrigger, catalog };

export const BASE = document.documentElement.dataset.base || '';
export const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const money = (n) =>
  n == null ? 'Not set' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
export const num = (n) => new Intl.NumberFormat('en-US').format(n);

export const TECHS = ['static', 'rgb', 'mapping'];
export const SIZES = ['S', 'M', 'L'];
export const SLUG = { static: 'static-classic', rgb: 'color-changing-rgb', mapping: 'graphic-mapping', underglow: 'rgbic-underglow' };
export const productUrl = (key) => `${BASE}products/${SLUG[key]}/index.html`;
export const variantFor = (tech, size, ug) =>
  catalog.variants.find((v) => v.technology === tech && v.size === size && v.underglow === ug);
export const priceRange = (tech) => {
  const p = catalog.variants.filter((v) => v.technology === tech).map((v) => v.ownerTargetPrice);
  return [Math.min(...p), Math.max(...p)];
};
export const ledRange = (tech) => {
  const l = catalog.variants.filter((v) => v.technology === tech).map((v) => v.plannedLEDCount);
  return [Math.min(...l), Math.max(...l)];
};
export const statusLabel = (s) => (s === 'concept' ? 'Concept · coming soon' : 'Early access');

export const MEDIA = {
  'ice-mclaren': { dir: 'hero', alt: 'Supercar covered in dense white and ice-blue LEDs at night' },
  'lights-on-reveal': { dir: 'hero', alt: 'A sedan and a van light up with thousands of mini lights' },
  'community-night': { dir: 'hero', alt: 'A street full of cars covered in multicolor lights' },
  'lambo-convoy': { dir: 'mapping', alt: 'Lamborghinis displaying mapped LED face graphics, driving in convoy' },
  'holiday-graphics': { dir: 'mapping', alt: 'Audi R8 showing a gingerbread man, candy canes and snowflakes in LEDs' },
  'supercar-palette': { dir: 'rgb', alt: 'McLaren and Porsche in turquoise, purple and green LED lines' },
  'dense-red': { dir: 'coverage', alt: 'Porsche and McLaren covered in very dense red LEDs' },
  'aventador-underglow': { dir: 'underglow', alt: 'Lamborghinis with gradient body lights and rainbow underglow' },
  'classic-string-lambos': { dir: 'static', alt: 'Lamborghinis wrapped in classic multicolor string lights' },
  'clip-mount-bmw': { dir: 'installation', alt: 'Hands mounting a light strand with a suction clip, then a lit BMW' },
  'string-install-huracan': { dir: 'installation', alt: 'Hands taping mini string lights onto a carbon-fiber supercar' },
};
export const video = (id, cls = '') => {
  const m = MEDIA[id];
  return `<video class="${cls}" muted loop playsinline preload="none" poster="${BASE}media/posters/${id}.jpg"
    data-src="${BASE}media/${m.dir}/${id}.mp4" aria-label="${m.alt}"></video>`;
};

/* ---------- build state, shared across pages ---------- */
const KEY = 'carglow:build';
const DEFAULT = { year: '', make: '', model: '', body: '', lengthFt: '', tech: 'rgb', size: 'M', ug: false };
const read = (k, fallback) => {
  try { return JSON.parse(localStorage.getItem(k)) ?? fallback; } catch { return fallback; }
};
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage blocked */ } };
export const state = { ...DEFAULT, ...read(KEY, {}) };
const listeners = new Set();
export function setState(patch) {
  Object.assign(state, patch);
  write(KEY, state);
  listeners.forEach((f) => f(state));
}
export function subscribe(f) { listeners.add(f); f(state); }

/* ---------- vehicle sizing ---------- */
export const BODY_STYLES = [
  { id: 'sports', label: 'Sports car', ex: '911, Miata, BRZ', size: 'S' },
  { id: 'compact', label: 'Compact / hatch', ex: 'Civic hatch, Golf, Mini', size: 'S' },
  { id: 'sedan', label: 'Sedan', ex: 'Accord, Camry, 3 Series', size: 'M' },
  { id: 'crossover', label: 'Crossover', ex: 'RAV4, CR-V, Model Y', size: 'M' },
  { id: 'fullsuv', label: 'Full-size SUV', ex: 'Tahoe, Escalade, Suburban', size: 'L' },
  { id: 'pickup', label: 'Pickup', ex: 'F-150, Silverado, Ram 1500', size: 'L' },
  { id: 'van', label: 'Van / oversize', ex: 'Sprinter, Transit, long-bed crew cab', size: 'CUSTOM' },
];
export function parseLengthFt(v) {
  const n = parseFloat(String(v).replace(',', '.'));
  if (!n) return null;
  const ft = n > 40 ? n / 12 : n;
  return ft >= 8 && ft <= 30 ? Math.round(ft * 10) / 10 : null;
}
export function recommend(s) {
  const ft = parseLengthFt(s.lengthFt);
  if (ft) return { size: ft > 20 ? 'CUSTOM' : ft <= 15 ? 'S' : ft <= 17 ? 'M' : 'L', basis: 'length', ft };
  const b = BODY_STYLES.find((x) => x.id === s.body);
  return b ? { size: b.size, basis: 'body' } : null;
}
const MAKES = ['Acura', 'Alfa Romeo', 'Aston Martin', 'Audi', 'Bentley', 'BMW', 'Buick', 'Cadillac', 'Chevrolet', 'Chrysler', 'Dodge', 'Ferrari',
  'Fiat', 'Ford', 'Genesis', 'GMC', 'Honda', 'Hyundai', 'Infiniti', 'Jaguar', 'Jeep', 'Kia', 'Lamborghini', 'Land Rover', 'Lexus', 'Lincoln',
  'Lotus', 'Lucid', 'Maserati', 'Mazda', 'McLaren', 'Mercedes-Benz', 'Mini', 'Mitsubishi', 'Nissan', 'Polestar', 'Porsche', 'Ram', 'Rivian',
  'Rolls-Royce', 'Subaru', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo'];

async function fetchModels(make, year) {
  const url = `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${year}?format=json`;
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  const data = await res.json();
  return [...new Set(data.Results.map((r) => r.Model_Name))].sort();
}

/* ---------- kit contents (planned, not confirmed) ---------- */
export function kitContents(v) {
  const leds = `${num(v.plannedLEDCount)} ${v.technology === 'mapping' ? 'addressable pixels' : 'LEDs'}`;
  const controller = {
    static: 'Power switch or fixed-mode controller',
    rgb: 'RGB controller with remote or app',
    mapping: 'Multi-output pixel controllers',
  }[v.technology];
  const items = [
    [leds, 'Planning estimate. Strand count and spacing set by supplier.'],
    [controller, 'Model and quantity pending.'],
    ['Fused automotive power system', 'Sized to the real load. No cigarette-lighter shortcuts.'],
    ['Panel-matched mounting kit', 'Clips, tape and protective film. Counts pending.'],
    ['Connectors and extension leads', 'Weather-resistant. Lengths pending.'],
    ['Cable management and prep wipes', 'Ties, guides, surface prep.'],
    ['Printed guide + install video QR', 'Setup, troubleshooting, removal and storage.'],
  ];
  if (v.underglow) items.push([catalog.underglow[v.size].name + ' underglow', 'Own controller unless sync is tested.']);
  return items;
}

/* ---------- page chrome ---------- */
export function renderChrome(active = '') {
  const link = (key, label) =>
    `<a href="${productUrl(key)}" ${active === key ? 'aria-current="page"' : ''}>${label}</a>`;
  document.body.insertAdjacentHTML('afterbegin', `
  <a class="skip" href="#main">Skip to content</a>
  <header class="nav">
    <a class="wordmark" href="${BASE}index.html" aria-label="Car Glow home">CAR<span class="dot" aria-hidden="true"></span>GLOW</a>
    <nav aria-label="Products">${link('static', 'Static')}${link('rgb', 'RGB')}${link('mapping', 'Mapping')}${link('underglow', 'Underglow')}</nav>
    <button class="motion-toggle" type="button" aria-pressed="false" data-motion-toggle>Pause motion</button>
    <a class="btn btn-glow nav-cta" href="${BASE}index.html#build">Find my lights</a>
  </header>`);
  document.body.insertAdjacentHTML('beforeend', `
  <footer class="footer">
    <div class="footer-inner">
      <a class="wordmark" href="${BASE}index.html">CAR<span class="dot" aria-hidden="true"></span>GLOW</a>
      <nav aria-label="Footer">${link('static', 'Static Classic')}${link('rgb', 'Color-Changing RGB')}${link('mapping', 'Graphic Mapping')}${link('underglow', 'RGBIC Underglow')}</nav>
      <p class="fine">Preview build. No payments are taken and no kit is in stock yet. Prices shown are planned prices.
      All footage is third-party reference footage showing the look, not Car Glow hardware.
      Decorative lighting is for parked display and private property. Check your local vehicle lighting laws.</p>
    </div>
  </footer>
  <div class="buybar" data-buybar hidden>
    <div><span class="buybar-label" data-buybar-label></span><strong class="buybar-price" data-buybar-price></strong></div>
    <a class="btn btn-glow" href="#summary" data-buybar-cta>Join early access</a>
  </div>`);
  subscribe((s) => {
    const v = variantFor(s.tech, s.size, s.ug);
    document.querySelector('[data-buybar-label]').textContent =
      `${catalog.products[s.tech].name} · ${catalog.sizes[s.size].name}${s.ug ? ' + underglow' : ''}`;
    document.querySelector('[data-buybar-price]').textContent = money(v.ownerTargetPrice);
  });
}

/* ---------- motion ---------- */
let paused = read('carglow:paused', reduceMotion);
const videos = new Set();
export function playIfAllowed(v) {
  videos.add(v);
  if (!v.getAttribute('src')) v.src = v.dataset.src;
  if (!paused) v.play().catch(() => {});
}
export function initMotion() {
  const toggle = document.querySelector('[data-motion-toggle]');
  const sync = () => {
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.textContent = paused ? 'Play motion' : 'Pause motion';
    videos.forEach((v) => {
      if (paused) v.pause();
      else if (v.dataset.visible === '1' && v.dataset.active !== '0') v.play().catch(() => {});
    });
  };
  toggle.addEventListener('click', () => { paused = !paused; write('carglow:paused', paused); sync(); });

  const io = new IntersectionObserver((entries) => entries.forEach(({ target: v, isIntersecting }) => {
    v.dataset.visible = isIntersecting ? '1' : '0';
    if (!isIntersecting) v.pause();
    else if (v.dataset.active !== '0') playIfAllowed(v);
  }), { rootMargin: '200px 0px' });
  document.querySelectorAll('video[data-src]').forEach((v) => { videos.add(v); io.observe(v); });
  sync();

  if (reduceMotion) return null;
  const lenis = new Lenis({ anchors: { offset: -70 }, lerp: 0.12 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}
// Call after any pinned sections are created so trigger positions include pin spacing.
export function initReveals() {
  if (reduceMotion) return;
  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    gsap.from(el, { y: 36, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
  });
}

/* ---------- the configurator ---------- */
export function mountBuilder(root, { lockTech = null } = {}) {
  if (lockTech && state.tech !== lockTech) setState({ tech: lockTech });
  const years = Array.from({ length: 38 }, (_, i) => 2027 - i);
  const sizeBtn = (k) => `<button type="button" class="opt" data-size="${k}" aria-pressed="false">
      <span class="opt-title">${catalog.sizes[k].name}</span><span class="opt-sub">${catalog.sizes[k].lengthFt} ft</span>
      <span class="badge-rec" hidden>Recommended</span></button>`;
  const techBtn = (k) => `<button type="button" class="opt" data-tech="${k}" aria-pressed="false">
      <span class="opt-title">${catalog.products[k].name}</span><span class="opt-sub">from ${money(priceRange(k)[0])}</span></button>`;

  root.innerHTML = `
  <div class="builder">
    <div class="builder-steps">
      <fieldset class="step">
        <legend><span class="step-n">1</span> What do you drive?</legend>
        <div class="vehicle-row">
          <label class="field"><span>Year</span>
            <select id="veh-year"><option value="">Year</option>${years.map((y) => `<option>${y}</option>`).join('')}</select></label>
          <label class="field"><span>Make</span>
            <input id="veh-make" list="veh-makes" autocomplete="off" placeholder="e.g. Honda…" spellcheck="false">
            <datalist id="veh-makes">${MAKES.map((m) => `<option value="${m}">`).join('')}</datalist></label>
          <label class="field"><span>Model</span>
            <input id="veh-model" list="veh-models" autocomplete="off" placeholder="e.g. Accord…" spellcheck="false">
            <datalist id="veh-models"></datalist></label>
        </div>
        <p class="hint" data-model-hint aria-live="polite"></p>
        <div class="body-grid" role="group" aria-label="Body style">
          ${BODY_STYLES.map((b) => `<button type="button" class="chip" data-body="${b.id}" aria-pressed="false">
            <strong>${b.label}</strong><small>${b.ex}</small></button>`).join('')}
        </div>
        <label class="field field-inline"><span>Length (optional)</span>
          <input id="veh-length" inputmode="decimal" autocomplete="off" placeholder="16.0 ft or 192 in…">
        </label>
        <div class="rec" data-rec aria-live="polite"></div>
      </fieldset>

      <fieldset class="step" ${lockTech ? 'hidden' : ''}>
        <legend><span class="step-n">2</span> Choose your lighting</legend>
        <div class="opt-row">${TECHS.map(techBtn).join('')}</div>
      </fieldset>

      <fieldset class="step">
        <legend><span class="step-n">${lockTech ? 2 : 3}</span> Vehicle size</legend>
        <div class="opt-row">${SIZES.map(sizeBtn).join('')}</div>
      </fieldset>

      <fieldset class="step">
        <legend><span class="step-n">${lockTech ? 3 : 4}</span> Underglow</legend>
        <div class="opt-row opt-row-2">
          <button type="button" class="opt" data-ug="0" aria-pressed="false"><span class="opt-title">No underglow</span><span class="opt-sub">Body lights only</span></button>
          <button type="button" class="opt" data-ug="1" aria-pressed="false"><span class="opt-title">Add RGBIC underglow</span><span class="opt-sub" data-ug-sub></span></button>
        </div>
      </fieldset>
    </div>

    <aside class="summary" id="summary" aria-label="Your build">
      <p class="eyebrow">Your build</p>
      <p class="summary-vehicle" data-sum-vehicle></p>
      <h3 class="summary-title" data-sum-title></h3>
      <dl class="spec">
        <div><dt>Planned LEDs</dt><dd data-sum-leds></dd></div>
        <div><dt>Grid</dt><dd data-sum-grid></dd></div>
        <div><dt>SKU</dt><dd data-sum-sku></dd></div>
        <div><dt>Status</dt><dd data-sum-status></dd></div>
      </dl>
      <p class="summary-price"><span data-sum-price></span><small>planned price</small></p>
      <div class="fit-warn" data-sum-fit hidden></div>
      <details class="contents">
        <summary>What's planned in the kit</summary>
        <ul data-sum-contents></ul>
      </details>
      <form class="waitlist" data-waitlist novalidate>
        <label for="wl-email" class="sr-only">Email</label>
        <input id="wl-email" name="email" type="email" autocomplete="email" placeholder="you@example.com…" required spellcheck="false">
        <button class="btn btn-glow" type="submit" data-sum-cta>Join early access</button>
        <p class="hint" data-wl-msg aria-live="polite"></p>
      </form>
      <p class="fine">Not purchasable yet. LED counts are estimates until a supplier confirms the kit.</p>
    </aside>
  </div>`;

  const $ = (sel) => root.querySelector(sel);
  const $$ = (sel) => root.querySelectorAll(sel);
  $('#veh-year').value = state.year;
  $('#veh-make').value = state.make;
  $('#veh-model').value = state.model;
  $('#veh-length').value = state.lengthFt;

  let lastQuery = '';
  const loadModels = async () => {
    const q = `${state.make}|${state.year}`;
    if (!state.make || !state.year || q === lastQuery) return;
    lastQuery = q;
    const hint = $('[data-model-hint]');
    hint.textContent = 'Looking up models…';
    try {
      const models = await fetchModels(state.make, state.year);
      $('#veh-models').innerHTML = models.map((m) => `<option value="${m.replace(/"/g, '&quot;')}">`).join('');
      hint.textContent = models.length ? `${models.length} ${state.make} models found for ${state.year}.` : 'No models found. Type yours in.';
    } catch {
      hint.textContent = 'Model list unavailable right now. Type your model in.';
    }
  };
  $('#veh-year').addEventListener('change', (e) => { setState({ year: e.target.value }); loadModels(); });
  $('#veh-make').addEventListener('change', (e) => { setState({ make: e.target.value.trim() }); loadModels(); });
  $('#veh-model').addEventListener('change', (e) => setState({ model: e.target.value.trim() }));
  $('#veh-length').addEventListener('input', (e) => {
    setState({ lengthFt: e.target.value });
    const r = recommend(state);
    if (r && r.size !== 'CUSTOM') setState({ size: r.size });
  });
  $$('[data-body]').forEach((b) => b.addEventListener('click', () => {
    setState({ body: b.dataset.body });
    const r = recommend(state);
    if (r && r.size !== 'CUSTOM') setState({ size: r.size });
  }));
  $$('[data-tech]').forEach((b) => b.addEventListener('click', () => setState({ tech: b.dataset.tech })));
  $$('[data-size]').forEach((b) => b.addEventListener('click', () => setState({ size: b.dataset.size })));
  $$('[data-ug]').forEach((b) => b.addEventListener('click', () => setState({ ug: b.dataset.ug === '1' })));
  $('[data-waitlist]').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = e.target.email;
    const msg = $('[data-wl-msg]');
    if (!email.checkValidity()) { msg.textContent = 'Enter a valid email address.'; email.focus(); return; }
    const v = variantFor(state.tech, state.size, state.ug);
    write('carglow:waitlist', { email: email.value, sku: v.sku, vehicle: [state.year, state.make, state.model].filter(Boolean).join(' '), at: Date.now() });
    msg.textContent = 'Saved in this browser only. Signups are not connected to an inbox yet.';
  });
  loadModels();

  subscribe((s) => {
    const v = variantFor(s.tech, s.size, s.ug);
    const rec = recommend(s);
    $$('[data-tech]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tech === s.tech)));
    $$('[data-size]').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.size === s.size));
      b.querySelector('.badge-rec').hidden = !(rec && rec.size === b.dataset.size);
    });
    $$('[data-ug]').forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.ug === '1') === s.ug)));
    $$('[data-body]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.body === s.body)));
    $('[data-ug-sub]').textContent = `+${money(catalog.underglow[s.size].upcharge)} · ${catalog.underglow[s.size].name.replace(' RGBIC', '')}`;

    const vehicle = [s.year, s.make, s.model].filter(Boolean).join(' ');
    const recEl = $('[data-rec]');
    if (!rec) recEl.innerHTML = '<p class="hint">Pick a body style or enter a length to get a size.</p>';
    else if (rec.size === 'CUSTOM') {
      recEl.innerHTML = `<p class="rec-size rec-custom">Fitment check required</p>
        <p class="hint">${rec.basis === 'length' ? `${rec.ft} ft is over our 20 ft Large limit.` : 'Vans and oversize vehicles need a manual fit review.'}
        We don't auto-assign a kit. Request a check below.</p>`;
    } else {
      recEl.innerHTML = `<p class="rec-label">Recommended size</p><p class="rec-size">${catalog.sizes[rec.size].name}</p>
        <p class="hint">${rec.basis === 'length' ? `Based on the ${rec.ft} ft length you entered.` : 'Estimated from body style. Enter your length to confirm.'}</p>`;
    }

    $('[data-sum-vehicle]').textContent = vehicle || 'No vehicle entered';
    $('[data-sum-title]').textContent = `${catalog.products[s.tech].name} · ${catalog.sizes[s.size].name}${s.ug ? ' + RGBIC underglow' : ''}`;
    $('[data-sum-leds]').textContent = `~${num(v.plannedLEDCount)}`;
    $('[data-sum-grid]').textContent = `${v.plannedPitchIn} in`;
    $('[data-sum-sku]').textContent = v.sku;
    $('[data-sum-status]').textContent = statusLabel(v.status);
    $('[data-sum-price]').textContent = money(v.ownerTargetPrice);
    $('[data-sum-contents]').innerHTML = kitContents(v).map(([a, b]) => `<li><strong>${a}</strong><span>${b}</span><em>Planned</em></li>`).join('');
    const custom = rec?.size === 'CUSTOM';
    const fit = $('[data-sum-fit]');
    fit.hidden = !custom;
    fit.textContent = custom ? 'Your vehicle needs a fitment check before we can match a kit.' : '';
    $('[data-sum-cta]').textContent = custom ? 'Request fitment check' : v.status === 'concept' ? 'Join the concept waitlist' : 'Join early access';
  });
}
