import {
  BASE, TECHS, SIZES, catalog, gsap, ScrollTrigger, reduceMotion, money, num, state, setState, subscribe,
  variantFor, priceRange, ledRange, statusLabel, productUrl, video, kitContents, renderChrome, initMotion,
  initReveals, playIfAllowed, isPaused, onMotionChange, tintTo, mountBuilder,
} from './shared.js';

renderChrome();
document.querySelectorAll('[data-video]').forEach((el) => {
  el.outerHTML = video(el.dataset.video, el.dataset.class || '');
});

/* ---------- hero: one short film per look ---------- */
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

/* ---------- product film: scroll steps through the three technologies ---------- */
const FILMS = { static: 'film-static', rgb: 'film-rgb', mapping: 'film-mapping' };
const FILM_TINT = { static: 'warm', rgb: 'rgb', mapping: 'red' };
const filmEl = document.querySelector('#lineup');
filmEl.querySelector('[data-film-stage]').innerHTML = TECHS.map((t) => `<div class="film-vid">${video(FILMS[t])}</div>`).join('');
filmEl.querySelector('[data-film-bg]').innerHTML = TECHS.map((t) => `<img alt="" loading="lazy" src="${BASE}media/posters/${FILMS[t]}.jpg">`).join('');
filmEl.querySelector('[data-film-dots]').innerHTML = TECHS.map((t, i) =>
  `<button type="button" class="film-dot" data-film-dot="${i}" aria-label="Show ${catalog.products[t].name}"></button>`).join('');
filmEl.querySelector('[data-film-slides]').innerHTML = TECHS.map((t, i) => {
  const p = catalog.products[t];
  const [lo, hi] = priceRange(t);
  const [l1, l2] = ledRange(t);
  return `
  <article class="film-slide" data-slide="${i}">
    <span class="status s-${p.status}">${statusLabel(p.status)}</span>
    <h3 class="film-name">${p.name}</h3>
    <p class="tagline">${p.tagline}</p>
    <p class="film-summary">${p.summary}</p>
    <dl class="spec spec-row">
      <div><dt>Planned price</dt><dd>${money(lo)} – ${money(hi)}</dd></div>
      <div><dt>Planned LEDs</dt><dd>${num(l1)} – ${num(l2)}</dd></div>
    </dl>
    <div class="does">
      <ul class="yes">${p.planned.map((x) => `<li>${x}</li>`).join('')}</ul>
      <ul class="no" aria-label="Not promised">${p.notPromised.map((x) => `<li>${x}</li>`).join('')}</ul>
    </div>
    <div class="cta-row">
      <button type="button" class="btn btn-glow" data-pick="${t}">Build this kit</button>
      <a class="btn btn-ghost" href="${productUrl(t)}">Full details</a>
    </div>
  </article>`;
}).join('');
const filmVids = [...filmEl.querySelectorAll('.film-vid')];
const filmSlides = [...filmEl.querySelectorAll('.film-slide')];
const filmBgs = [...filmEl.querySelectorAll('[data-film-bg] img')];
const filmDots = [...filmEl.querySelectorAll('[data-film-dot]')];
let film = -1;
let filmST = null;
function setFilm(i) {
  if (i === film) return;
  film = i;
  filmVids.forEach((el, k) => {
    const on = k === i;
    el.classList.toggle('is-active', on);
    const v = el.querySelector('video');
    v.dataset.active = on ? '1' : '0';
    if (on && v.dataset.visible === '1') playIfAllowed(v); else v.pause();
  });
  filmSlides.forEach((el, k) => { el.classList.toggle('is-active', k === i); el.setAttribute('aria-hidden', String(k !== i)); });
  filmBgs.forEach((el, k) => el.classList.toggle('is-active', k === i));
  filmDots.forEach((el, k) => el.setAttribute('aria-current', String(k === i)));
  filmEl.querySelector('[data-film-count]').textContent = `${i + 1} / 3`;
  if (filmST?.isActive) tintTo(FILM_TINT[TECHS[i]]);
}
function goFilm(i) {
  const n = Math.max(0, Math.min(2, i));
  if (!filmST) { setFilm(n); return; }
  const y = filmST.start + ((n + 0.5) / 3) * (filmST.end - filmST.start);
  if (lenis) lenis.scrollTo(y); else scrollTo(0, y);
}
filmEl.querySelector('[data-film-prev]').addEventListener('click', () => goFilm(film - 1));
filmEl.querySelector('[data-film-next]').addEventListener('click', () => goFilm(film + 1));
filmDots.forEach((el, i) => el.addEventListener('click', () => goFilm(i)));
filmEl.querySelectorAll('[data-pick]').forEach((b) => b.addEventListener('click', () => {
  setState({ tech: b.dataset.pick });
  scrollToEl(document.querySelector('#build'));
}));
setFilm(0);

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
  <thead><tr><th scope="col">Lighting</th>${SIZES.map((s) => `<th scope="col">${catalog.sizes[s].name}<small>${catalog.sizes[s].lengthFt} ft</small></th>`).join('')}</tr></thead>
  <tbody>${TECHS.map((t) => `<tr><th scope="row">${catalog.products[t].name}</th>${SIZES.map((s) => `<td>${[false, true].map((ug) => {
    const v = variantFor(t, s, ug);
    const label = `${catalog.products[t].name}, ${catalog.sizes[s].name}${ug ? ', with underglow' : ''}: ${money(v.ownerTargetPrice)}`;
    return `<button type="button" class="price-cell${ug ? ' with-ug' : ''}" data-cell="${v.sku}" data-t="${t}" data-s="${s}" data-u="${ug ? 1 : 0}" aria-pressed="false" aria-label="${label}">${ug ? '<small>+ glow</small>' : ''}${money(v.ownerTargetPrice)}</button>`;
  }).join('')}</td>`).join('')}</tr>`).join('')}</tbody>`;
table.addEventListener('click', (e) => {
  const b = e.target.closest('[data-cell]');
  if (!b) return;
  setState({ tech: b.dataset.t, size: b.dataset.s, ug: b.dataset.u === '1' });
  scrollToEl(document.querySelector('#build'));
});

subscribe((s) => {
  const v = variantFor(s.tech, s.size, s.ug);
  kitGrid.innerHTML = kitContents(v).map(([a, b]) => `<li><strong>${a}</strong><span>${b}</span></li>`).join('');
  ugBtn.textContent = s.ug ? 'Remove underglow' : 'Add underglow to my build';
  ugBtn.setAttribute('aria-pressed', String(s.ug));
  document.querySelector('[data-ug-total]').textContent =
    `${catalog.products[s.tech].name} · ${catalog.sizes[s.size].name}${s.ug ? ' + underglow' : ''}: ${money(v.ownerTargetPrice)}`;
  table.querySelectorAll('[data-cell]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cell === v.sku)));
});

mountBuilder(document.querySelector('[data-builder]'));

/* ---------- motion ---------- */
const lenis = initMotion();
function scrollToEl(el) {
  if (lenis) lenis.scrollTo(el, { offset: -70 });
  else el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
}

// Hero. Desktop shows all four looks side by side with the active one widened; phones show one full-screen film.
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
ScrollTrigger.config({ ignoreMobileResize: true });
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

  // Pin the product film; each third of the scroll shows the next technology.
  filmST = ScrollTrigger.create({
    trigger: '#lineup', start: 'top top', end: () => `+=${Math.round(innerHeight * 2.1)}`, pin: true,
    onUpdate: (self) => setFilm(Math.min(2, Math.floor(self.progress * 3))),
    onToggle: (self) => { if (self.isActive) tintTo(FILM_TINT[TECHS[film]]); },
  });

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
