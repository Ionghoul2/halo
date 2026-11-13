import {
  BASE, TECHS, SIZES, catalog, gsap, ScrollTrigger, reduceMotion, money, num, state, setState, subscribe,
  variantFor, priceRange, ledRange, statusLabel, productUrl, video, kitContents, renderChrome, initMotion,
  initReveals, playIfAllowed, isPaused, onMotionChange, tintTo, mountBuilder,
} from './shared.js';

renderChrome();
document.querySelectorAll('[data-video]').forEach((el) => {
  el.outerHTML = video(el.dataset.video, el.dataset.class || '');
});

/* ---------- lineup carousel ---------- */
const flow = document.querySelector('[data-flow]');
flow.innerHTML = TECHS.map((t, i) => `
  <article class="flow-card" data-i="${i}" role="group" aria-roledescription="slide" aria-label="${i + 1} of 3: ${catalog.products[t].name}">
    ${video(catalog.products[t].media).replace('<video', '<video data-manual="1"')}
    <div class="card-label"><span class="status s-${catalog.products[t].status}">${statusLabel(catalog.products[t].status)}</span>
    <strong>${catalog.products[t].name}</strong></div>
  </article>`).join('');
flow.tabIndex = 0;
const cards = [...flow.children];
const bgs = [...document.querySelectorAll('[data-bg]')];
let active = Math.max(0, TECHS.indexOf(state.tech));
let bgFlip = 0;

function renderDetail(t) {
  const p = catalog.products[t];
  const [lo, hi] = priceRange(t);
  const [l1, l2] = ledRange(t);
  document.querySelector('[data-lineup-detail]').innerHTML = `
    <span class="status s-${p.status}">${statusLabel(p.status)}</span>
    <h3 class="h3">${p.name}</h3>
    <p class="tagline">${p.tagline}</p>
    <p>${p.summary}</p>
    <dl class="spec spec-row">
      <div><dt>Planned price</dt><dd>${money(lo)} – ${money(hi)}</dd></div>
      <div><dt>Planned LEDs</dt><dd>${num(l1)} – ${num(l2)}</dd></div>
    </dl>
    <div class="does">
      <ul class="yes">${p.planned.map((x) => `<li>${x}</li>`).join('')}</ul>
      <ul class="no" aria-label="Not promised">${p.notPromised.map((x) => `<li>${x}</li>`).join('')}</ul>
    </div>
    <div class="cta-row">
      <a class="btn btn-ghost" href="${productUrl(t)}">See ${p.name}</a>
      <button type="button" class="btn btn-glow" data-pick="${t}">Build with ${p.name}</button>
    </div>`;
  document.querySelector('[data-pick]').addEventListener('click', () => {
    setState({ tech: t });
    scrollToEl(document.querySelector('#build'));
  });
}

function setActive(i) {
  active = (i + cards.length) % cards.length;
  cards.forEach((card, idx) => {
    let o = (((idx - active) % 3) + 3) % 3;
    if (o === 2) o = -1;
    card.style.setProperty('--o', o);
    card.classList.toggle('is-active', o === 0);
    card.setAttribute('aria-hidden', String(o !== 0));
    const v = card.querySelector('video');
    v.dataset.active = o === 0 ? '1' : '0';
    if (o === 0) playIfAllowed(v); else v.pause();
  });
  const t = TECHS[active];
  const next = bgs[bgFlip ^= 1];
  next.src = `${BASE}media/posters/${catalog.products[t].media}.jpg`;
  bgs.forEach((b) => b.classList.toggle('on', b === next));
  document.querySelector('[data-flow-count]').textContent = `${active + 1} / 3`;
  renderDetail(t);
}
document.querySelector('[data-flow-prev]').addEventListener('click', () => setActive(active - 1));
document.querySelector('[data-flow-next]').addEventListener('click', () => setActive(active + 1));
cards.forEach((c) => c.addEventListener('click', () => setActive(+c.dataset.i)));
flow.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') setActive(active - 1);
  if (e.key === 'ArrowRight') setActive(active + 1);
});
let downX = null;
flow.addEventListener('pointerdown', (e) => { downX = e.clientX; });
flow.addEventListener('pointerup', (e) => {
  if (downX !== null && Math.abs(e.clientX - downX) > 40) setActive(active + (e.clientX < downX ? 1 : -1));
  downX = null;
});

/* ---------- kit contents, underglow, price table ---------- */
const kitGrid = document.querySelector('[data-kit-grid]');
const ugBtn = document.querySelector('[data-ug-add]');
ugBtn.addEventListener('click', () => setState({ ug: !state.ug }));

// Underglow color preview: hue-shifts the reference photo and the page's ambient light.
const SWATCHES = [['Magenta', 0, 'magenta', '#e14bff'], ['Ice blue', -105, 'ice', '#6fd8ff'], ['Green', -160, 'rgb', '#3dffa8'], ['Red', 60, 'red', '#ff3b4a'], ['Amber', 95, 'warm', '#ffa53b']];
const swatchEl = document.querySelector('[data-swatches]');
swatchEl.innerHTML = SWATCHES.map(([name, , , hex], i) =>
  `<button type="button" class="swatch" style="--c:${hex}" data-swatch="${i}" aria-label="${name}" aria-pressed="${i === 0}"></button>`).join('')
  + '<span class="swatch-name" data-swatch-name aria-live="polite">Magenta</span>';
swatchEl.addEventListener('click', (e) => {
  const b = e.target.closest('[data-swatch]');
  if (!b) return;
  const [name, deg, tint] = SWATCHES[+b.dataset.swatch];
  swatchEl.querySelectorAll('[data-swatch]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  swatchEl.querySelector('[data-swatch-name]').textContent = name;
  document.querySelector('.ug-photo img').style.filter = `hue-rotate(${deg}deg)`;
  document.querySelector('#underglow').dataset.tint = tint;
  tintTo(tint);
});

const table = document.querySelector('[data-price-table]');
table.innerHTML = `<caption class="sr-only">Planned prices for all 18 kits</caption>
  <thead><tr><th scope="col">Technology</th>${SIZES.map((s) => `<th scope="col">${catalog.sizes[s].name}</th><th scope="col">+ Underglow</th>`).join('')}</tr></thead>
  <tbody>${TECHS.map((t) => `<tr><th scope="row">${catalog.products[t].name}</th>${SIZES.map((s) => [false, true].map((ug) => {
    const v = variantFor(t, s, ug);
    return `<td><button type="button" class="price-cell" data-cell="${v.sku}" data-t="${t}" data-s="${s}" data-u="${ug ? 1 : 0}" aria-pressed="false">${money(v.ownerTargetPrice)}</button></td>`;
  }).join('')).join('')}</tr>`).join('')}</tbody>`;
table.addEventListener('click', (e) => {
  const b = e.target.closest('[data-cell]');
  if (!b) return;
  setState({ tech: b.dataset.t, size: b.dataset.s, ug: b.dataset.u === '1' });
  scrollToEl(document.querySelector('#build'));
});

subscribe((s) => {
  const v = variantFor(s.tech, s.size, s.ug);
  kitGrid.innerHTML = kitContents(v).map(([a, b]) => `<li><span class="kit-chip">Planned</span><strong>${a}</strong><p>${b}</p></li>`).join('');
  ugBtn.textContent = s.ug ? 'Remove underglow' : 'Add underglow to my build';
  ugBtn.setAttribute('aria-pressed', String(s.ug));
  document.querySelector('[data-ug-total]').textContent =
    `${catalog.products[s.tech].name} · ${catalog.sizes[s.size].name}${s.ug ? ' + underglow' : ''}: ${money(v.ownerTargetPrice)}`;
  table.querySelectorAll('[data-cell]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cell === v.sku)));
});

mountBuilder(document.querySelector('[data-builder]'));
setActive(active);

/* ---------- motion ---------- */
const lenis = initMotion();
function scrollToEl(el) {
  if (lenis) lenis.scrollTo(el, { offset: -70 });
  else el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
}

// Hero: one short film per look. Desktop shows all four side by side with the active one widened;
// phones crossfade between them. Tabs pick a look and show how long until the next one.
const LOOKS = [
  { id: 'static', media: 'look-static', name: 'Static Classic', short: 'Static', sub: `from ${money(priceRange('static')[0])}` },
  { id: 'rgb', media: 'look-rgb', name: 'Color-Changing RGB', short: 'RGB', sub: `from ${money(priceRange('rgb')[0])}` },
  { id: 'mapping', media: 'look-mapping', name: 'Graphic Mapping', short: 'Mapping', sub: `from ${money(priceRange('mapping')[0])} · concept` },
  { id: 'underglow', media: 'look-underglow', name: 'RGBIC Underglow', short: 'Underglow', sub: `add-on +${money(catalog.underglow.S.upcharge)}` },
];
const LOOK_SECONDS = 6;
const looksEl = document.querySelector('[data-looks]');
const tabsEl = document.querySelector('[data-look-tabs]');
looksEl.innerHTML = LOOKS.map((l, i) => `<div class="look" data-look="${i}">${video(l.media)}<span class="look-name">${l.name}</span></div>`).join('');
tabsEl.innerHTML = LOOKS.map((l, i) => `
  <button type="button" class="look-tab" role="tab" aria-selected="false" data-tab="${i}">
    <span class="tab-bar"><i></i></span>
    <span class="tab-name"><span class="long">${l.name}</span><span class="short">${l.short}</span></span>
    <span class="tab-sub">${l.sub}</span>
  </button>`).join('');
const lookEls = [...looksEl.children];
const tabEls = [...tabsEl.children];
const wide = matchMedia('(min-width: 861px)');
let look = 0;
let heroVisible = true;
let lookTween = null;

function syncLookVideos() {
  lookEls.forEach((el, i) => {
    const v = el.querySelector('video');
    const on = heroVisible && (wide.matches || i === look);
    v.dataset.visible = heroVisible ? '1' : '0';
    v.dataset.active = on ? '1' : '0';
    if (on) playIfAllowed(v); else v.pause();
  });
}
function setLook(i) {
  look = (i + LOOKS.length) % LOOKS.length;
  lookEls.forEach((el, k) => el.classList.toggle('is-active', k === look));
  tabEls.forEach((el, k) => {
    el.setAttribute('aria-selected', String(k === look));
    if (k !== look) gsap.set(el.querySelector('i'), { scaleX: 0 });
  });
  syncLookVideos();
  lookTween?.kill();
  const bar = tabEls[look].querySelector('i');
  if (reduceMotion) { gsap.set(bar, { scaleX: 1 }); return; }
  lookTween = gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: LOOK_SECONDS, ease: 'none', onComplete: () => setLook(look + 1) });
  if (isPaused() || !heroVisible) lookTween.pause();
}
tabEls.forEach((el, i) => el.addEventListener('click', () => setLook(i)));
lookEls.forEach((el, i) => el.addEventListener('click', () => setLook(i)));
wide.addEventListener('change', syncLookVideos);
onMotionChange((p) => { if (p) lookTween?.pause(); else if (heroVisible) lookTween?.resume(); });
document.querySelector('[data-hero-build]').addEventListener('click', () => {
  const id = LOOKS[look].id;
  setState(id === 'underglow' ? { ug: true } : { tech: id });
  scrollToEl(document.querySelector('#build'));
});
setLook(0);
ScrollTrigger.create({
  trigger: '#hero', start: 'top bottom', end: 'bottom top',
  onToggle: (self) => {
    heroVisible = self.isActive;
    syncLookVideos();
    if (heroVisible && !isPaused()) lookTween?.resume(); else lookTween?.pause();
  },
});

if (!reduceMotion) {
  gsap.from('.hero-copy > *, .look-tab', { y: 28, autoAlpha: 0, duration: 0.9, ease: 'power3.out', stagger: 0.07, delay: 0.15 });
  gsap.to('.looks', { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });

  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', () => {
    const track = document.querySelector('[data-track]');
    const dist = () => track.scrollWidth - document.documentElement.clientWidth + 48;
    gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: '.coverage-pin', start: 'top top', end: () => `+=${dist()}`, pin: true, scrub: 0.5, invalidateOnRefresh: true },
    });
  });
}

const buybar = document.querySelector('[data-buybar]');
ScrollTrigger.create({
  trigger: '#hero', start: 'bottom top',
  onEnter: () => { buybar.hidden = false; }, onLeaveBack: () => { buybar.hidden = true; },
});
initReveals();
document.fonts?.ready.then(() => ScrollTrigger.refresh());
