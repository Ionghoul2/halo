import {
  BASE, catalog, gsap, ScrollTrigger, reduceMotion, money, priceRange, statusLabel, productUrl, pageUrl, video,
  setState, renderChrome, initMotion, initReveals, playIfAllowed, isPaused, onMotionChange,
} from './shared.js';

renderChrome('kits');
document.querySelectorAll('[data-video]').forEach((el) => {
  el.outerHTML = video(el.dataset.video, el.dataset.class || '');
});

const UG = catalog.underglow;
const from = (k) => money(priceRange(k)[0]);

/* ---------- hero: one film at a time, each matched to what that product can actually do ---------- */
const LOOKS = [
  { media: 'look-static', name: 'Static', note: 'Classic multicolor lights · reference footage' },
  // RGB kits light the whole car in one color at a time. The only one-color footage is red, so the color change is simulated.
  { media: 'dense-red', wide: 'dense-red-wide', name: 'RGB', note: 'One color at a time · color change simulated on reference footage', cls: 'rgb-cycle' },
  { media: 'look-mapping', name: 'Mapping', note: 'Planned · reference footage of mapped graphics' },
  { media: 'look-underglow', name: 'Underglow', note: 'Underglow shown with other body lighting · reference footage' },
];
const LOOK_SECONDS = 7;
const looksEl = document.querySelector('[data-looks]');
const tabsEl = document.querySelector('[data-look-tabs]');
const noteEl = document.querySelector('[data-look-note]');
// Wide screens get a 16:9 cut (car on a blurred copy of the same shot); phones get the 9:16 cut.
const wide = matchMedia('(min-width: 861px)');
const lookMedia = (l) => (wide.matches ? l.wide || `${l.media}-wide` : l.media);
looksEl.innerHTML = LOOKS.map((l, i) => `<div class="look ${l.cls || ''}" data-look="${i}">${video(lookMedia(l))}</div>`).join('');
tabsEl.innerHTML = LOOKS.map((l, i) => `
  <button type="button" class="look-tab" role="tab" aria-selected="false" data-tab="${i}">
    <span class="tab-bar"><i></i></span><span class="tab-name">${l.name}</span>
  </button>`).join('');
const lookEls = [...looksEl.children];
const tabEls = [...tabsEl.children];

/* ---------- overview: the four options and their starting prices ---------- */
const OPTIONS = [
  { key: 'static', img: 'posters/film-static.jpg', pos: '50% 12%', what: 'Fixed-color lights. The classic lit-up look.', price: `From ${from('static')}` },
  { key: 'rgb', img: 'posters/dense-red.jpg', pos: '50% 50%', what: 'Pick a color or a preset effect. The whole car changes together.', price: `From ${from('rgb')}` },
  { key: 'mapping', img: 'posters/holiday-graphics.jpg', pos: '30% 50%', what: 'Custom pictures and animations. Pending hardware confirmation.', price: `Planned from ${from('mapping')}` },
  { key: 'underglow', img: 'underglow/charger-magenta.jpg', pos: '50% 50%', what: 'Lighting beneath the car. Add it to any kit.', price: `+${money(UG.S.upcharge)} add-on` },
];
const nameOf = (k) => (k === 'underglow' ? 'Underglow' : catalog.products[k].name);
const statusOf = (k) => (k === 'underglow' ? 'early-access' : catalog.products[k].status);
document.querySelector('[data-options]').innerHTML = OPTIONS.map((o) => `
  <li class="option" data-option="${o.key}">
    <a class="option-link" href="#kit-${o.key}">
      <span class="option-media"><img src="${BASE}media/${o.img}" alt="" loading="lazy" style="object-position:${o.pos}"></span>
      <span class="status s-${statusOf(o.key)}">${statusLabel(statusOf(o.key))}</span>
      <span class="option-name">${nameOf(o.key)}</span>
      <span class="option-what">${o.what}</span>
      <span class="option-price">${o.price}</span>
    </a>
  </li>`).join('');

/* ---------- showcase: one big demonstration beside a short explanation, price and button ---------- */
const SWATCHES = [
  ['Red', 'none', '#ff4a3d'], ['Amber', 'hue-rotate(38deg)', '#ffb23d'], ['Green', 'hue-rotate(125deg)', '#3dff7a'],
  ['Ice', 'hue-rotate(185deg)', '#5ee6ff'], ['Blue', 'hue-rotate(228deg)', '#4a6bff'], ['Purple', 'hue-rotate(278deg)', '#c04aff'],
  ['White', 'saturate(0) brightness(1.15)', '#f4f1fa'],
];
const SHOWS = [
  {
    key: 'static', media: 'film-static', pos: '50% 4%', zoom: 1.16, origin: '50% 38%',
    text: 'Thousands of fixed-color lights across the panels you choose. The classic holiday look, sized to your car.',
    price: `From <strong>${from('static')}</strong> · Small, Medium or Large`,
    ref: 'Reference footage of classic string lights. Not Car Glow hardware.',
    cta: 'Build this kit',
  },
  {
    key: 'rgb', media: 'dense-red', pos: '50% 72%', zoom: 1.08, origin: '50% 60%', swatches: true,
    text: 'The same full-body look, one color at a time. Switch colors and preset effects from the remote or app.',
    price: `From <strong>${from('rgb')}</strong> · Small, Medium or Large`,
    ref: 'Reference footage in red. Other colors are a simulated preview.',
    extra: 'Gradients, chasing and two-tone patterns need individually controlled lights. That is Graphic Mapping.',
    cta: 'Build this kit',
  },
  {
    key: 'mapping', media: 'holiday-graphics', pos: '50% 50%',
    text: 'Every light is controlled on its own, so the car can show pictures and animations, like Santa or falling snow.',
    price: `Planned from <strong>${from('mapping')}</strong>`,
    ref: 'Reference footage from another installer. Not Car Glow hardware.',
    extra: 'Coming soon. Not for sale until custom graphics are proven on the hardware we ship.',
    cta: 'Join the waitlist',
  },
  {
    key: 'underglow', img: 'underglow/charger-magenta.jpg', pos: '50% 60%',
    text: 'Light beneath the car on its own controller. Standard 4-piece for Small and Medium cars, 6-piece XL for Large.',
    price: `<strong>+${money(UG.S.upcharge)}</strong> Standard · <strong>+${money(UG.L.upcharge)}</strong> XL, with any kit`,
    ref: 'Reference photo. Not Car Glow hardware.',
    cta: 'Add to a kit',
  },
];
const showEl = document.querySelector('[data-showcase]');
showEl.innerHTML = SHOWS.map((s, i) => {
  const media = s.img
    ? `<img src="${BASE}media/${s.img}" alt="White Dodge Charger with magenta underglow lighting the driveway beneath it" loading="lazy" style="object-position:${s.pos}">`
    : video(s.media).replace('<video ', `<video style="object-position:${s.pos};${s.zoom ? `transform:scale(${s.zoom});transform-origin:${s.origin}` : ''}" `);
  const swatches = s.swatches ? `
      <div class="swatches" role="group" aria-label="Preview a color" data-swatches>
        ${SWATCHES.map(([n, , c], k) => `<button type="button" class="swatch" style="--c:${c}" data-swatch="${k}" aria-pressed="${k === 0}" aria-label="Preview ${n}"></button>`).join('')}
        <span class="swatch-name" data-swatch-name aria-live="polite">Red</span>
      </div>` : '';
  return `
  <article class="show${i % 2 ? ' is-flipped' : ''}" id="kit-${s.key}" data-show="${s.key}" aria-labelledby="show-${s.key}">
    <div class="wrap show-grid">
      <figure class="show-media">
        <div class="show-frame">${media}</div>
        <figcaption class="ref-note">${s.ref}</figcaption>
      </figure>
      <div class="show-copy" data-reveal>
        <span class="status s-${statusOf(s.key)}">${statusLabel(statusOf(s.key))}</span>
        <h2 class="h2" id="show-${s.key}">${nameOf(s.key)}</h2>
        <p class="lede">${s.text}</p>
        ${swatches}
        <p class="show-price">${s.price}</p>
        ${s.extra ? `<p class="hint">${s.extra}</p>` : ''}
        <div class="cta-row">
          <button type="button" class="btn btn-glow" data-pick="${s.key}">${s.cta}</button>
          <a class="text-link" href="${productUrl(s.key)}">Details</a>
        </div>
      </div>
    </div>
  </article>`;
}).join('');

showEl.querySelectorAll('[data-pick]').forEach((b) => b.addEventListener('click', () => {
  const k = b.dataset.pick;
  setState(k === 'underglow' ? { ug: true } : { tech: k });
  location.href = pageUrl('build');
}));

// RGB color preview: hue-shifts the red reference clip. Cycles on its own until the visitor picks a color.
const rgbShow = showEl.querySelector('[data-show="rgb"]');
const rgbVideo = rgbShow.querySelector('video');
const swEl = rgbShow.querySelector('[data-swatches]');
let swatch = 0;
let swatchTouched = false;
function setSwatch(k) {
  swatch = (k + SWATCHES.length) % SWATCHES.length;
  const [n, f] = SWATCHES[swatch];
  rgbVideo.style.filter = f === 'none' ? '' : f;
  swEl.querySelectorAll('[data-swatch]').forEach((x, i) => x.setAttribute('aria-pressed', String(i === swatch)));
  swEl.querySelector('[data-swatch-name]').textContent = `${n} · simulated`;
}
swEl.addEventListener('click', (e) => {
  const b = e.target.closest('[data-swatch]');
  if (!b) return;
  swatchTouched = true;
  setSwatch(+b.dataset.swatch);
});

// Only the showcase film that fills most of the screen plays.
const showVideos = [...showEl.querySelectorAll('video')];
showVideos.forEach((v) => { v.dataset.active = '0'; });
const ratios = new Map();
let activeShow = null;
const showIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => ratios.set(e.target, e.intersectionRatio));
  let best = null;
  let bestR = 0.3;
  ratios.forEach((r, el) => { if (r > bestR) { best = el; bestR = r; } });
  if (best === activeShow) return;
  activeShow = best;
  showVideos.forEach((v) => {
    const on = !!best && best.contains(v);
    v.dataset.active = on ? '1' : '0';
    if (on) playIfAllowed(v); else v.pause();
  });
}, { threshold: [0, 0.2, 0.3, 0.45, 0.6, 0.8, 1] });
showEl.querySelectorAll('.show-frame').forEach((el) => showIO.observe(el));

/* ---------- motion ---------- */
initMotion();

let look = 0;
let heroVisible = true;
let lookTween = null;
function syncLookVideos() {
  lookEls.forEach((el, i) => {
    const v = el.querySelector('video');
    const on = heroVisible && i === look;
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
  noteEl.textContent = LOOKS[look].note;
  syncLookVideos();
  lookTween?.kill();
  const bar = tabEls[look].querySelector('i');
  if (reduceMotion) { gsap.set(bar, { scaleX: 1 }); return; }
  lookTween = gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: LOOK_SECONDS, ease: 'none', onComplete: () => setLook(look + 1) });
  if (isPaused() || !heroVisible) lookTween.pause();
}
tabEls.forEach((el, i) => el.addEventListener('click', () => setLook(i)));
lookEls.forEach((el, i) => el.addEventListener('click', () => setLook(i)));
wide.addEventListener('change', () => {
  lookEls.forEach((el, i) => { el.innerHTML = video(lookMedia(LOOKS[i])); });
  syncLookVideos();
});
let swatchTimer = null;
const runSwatches = () => {
  clearInterval(swatchTimer);
  if (reduceMotion || isPaused()) return;
  swatchTimer = setInterval(() => { if (!swatchTouched && activeShow?.closest('[data-show="rgb"]')) setSwatch(swatch + 1); }, 2600);
};
onMotionChange((p) => {
  if (p) lookTween?.pause(); else if (heroVisible) lookTween?.resume();
  runSwatches();
});
setLook(0);
setSwatch(0);
runSwatches();
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
  gsap.from('.hero-copy > *, .hero-foot', { y: 28, autoAlpha: 0, duration: 1, ease: 'power3.out', stagger: 0.08, delay: 0.15 });
  gsap.to('.looks', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.fromTo('.how-media', { scale: 1.08 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '#how', start: 'top bottom', end: 'center center', scrub: true } });
}

initReveals();
document.fonts?.ready.then(() => ScrollTrigger.refresh());
