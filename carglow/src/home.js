import {
  BASE, catalog, gsap, ScrollTrigger, reduceMotion, money, priceRange, statusLabel, productUrl, pageUrl, video,
  setState, renderChrome, initMotion, initReveals, playIfAllowed, isPaused, onMotionChange,
} from './shared.js';

renderChrome();
document.querySelectorAll('[data-video]').forEach((el) => {
  el.outerHTML = video(el.dataset.video, el.dataset.class || '');
});

/* ---------- hero: one short film per look ---------- */
const LOOKS = [
  { media: 'look-static', name: 'Static' },
  { media: 'look-rgb', name: 'RGB' },
  { media: 'look-mapping', name: 'Mapping' },
  { media: 'look-underglow', name: 'Underglow' },
];
const LOOK_SECONDS = 6;
const looksEl = document.querySelector('[data-looks]');
const tabsEl = document.querySelector('[data-look-tabs]');
// Wide screens get a 16:9 cut (car on a blurred copy of the same shot); phones get the 9:16 cut.
const wide = matchMedia('(min-width: 861px)');
const lookMedia = (l) => (wide.matches ? `${l.media}-wide` : l.media);
looksEl.innerHTML = LOOKS.map((l, i) => `<div class="look" data-look="${i}">${video(lookMedia(l))}</div>`).join('');
tabsEl.innerHTML = LOOKS.map((l, i) => `
  <button type="button" class="look-tab" role="tab" aria-selected="false" data-tab="${i}">
    <span class="tab-bar"><i></i></span><span class="tab-name">${l.name}</span>
  </button>`).join('');
const lookEls = [...looksEl.children];
const tabEls = [...tabsEl.children];

/* ---------- collection: spaced 3D cards that turn as the page scrolls ---------- */
const KITS = [
  { key: 'static', media: 'film-static' },
  { key: 'rgb', media: 'film-rgb' },
  { key: 'mapping', media: 'film-mapping' },
].map((k) => {
  const p = catalog.products[k.key];
  return { ...k, name: p.name, meta: `From ${money(priceRange(k.key)[0])} · ${statusLabel(p.status)}`, text: p.tagline };
});
const deckEl = document.querySelector('#collection');
const two = (n) => String(n).padStart(2, '0');
deckEl.querySelector('[data-deck]').innerHTML = KITS.map((k, i) => `
  <article class="deck-card" data-card="${i}">${video(k.media)}<span class="deck-label">${k.name}</span></article>`).join('');
deckEl.querySelector('[data-deck-bg]').innerHTML = KITS.map((k) => `<img alt="" loading="lazy" src="${BASE}media/posters/${k.media}.jpg">`).join('');
const deckCards = [...deckEl.querySelectorAll('.deck-card')];
const deckBgs = [...deckEl.querySelectorAll('[data-deck-bg] img')];
const deck = { p: 0 };
let deckActive = -1;
let deckST = null;
function renderDeck() {
  const act = Math.max(0, Math.min(KITS.length - 1, Math.round(deck.p)));
  deckCards.forEach((el, i) => {
    const o = i - deck.p;
    const a = Math.abs(o);
    el.style.setProperty('--o', o.toFixed(3));
    el.style.setProperty('--a', Math.min(a, 2.6).toFixed(3));
    el.style.zIndex = String(20 - Math.round(a * 4));
  });
  if (act === deckActive) return;
  deckActive = act;
  deckCards.forEach((el, i) => el.classList.toggle('is-active', i === act));
  deckBgs.forEach((el, i) => el.classList.toggle('is-active', i === act));
  const k = KITS[act];
  deckEl.querySelector('[data-deck-n]').textContent = two(act + 1);
  deckEl.querySelector('[data-deck-meta]').textContent = k.meta;
  deckEl.querySelector('[data-deck-title]').textContent = k.name;
  deckEl.querySelector('[data-deck-text]').textContent = k.text;
  deckEl.querySelector('[data-deck-link]').href = productUrl(k.key);
  deckEl.querySelector('[data-deck-choose]').textContent = k.key === 'mapping' ? 'Join the waitlist' : 'Choose this kit';
}
deckEl.querySelector('[data-deck-addon]').textContent =
  `Add RGBIC underglow to any kit from +${money(catalog.underglow.S.upcharge)}.`;
deckEl.querySelector('[data-deck-choose]').addEventListener('click', () => {
  setState({ tech: KITS[deckActive].key });
  location.href = pageUrl('build');
});
function goDeck(i) {
  const n = Math.max(0, Math.min(KITS.length - 1, i));
  if (!deckST) { deck.p = n; deckEl.classList.add('is-stepped'); renderDeck(); return; }
  const y = deckST.start + (n / (KITS.length - 1)) * (deckST.end - deckST.start);
  if (lenis) lenis.scrollTo(y); else scrollTo(0, y);
}
deckEl.querySelector('[data-deck-prev]').addEventListener('click', () => goDeck(deckActive - 1));
deckEl.querySelector('[data-deck-next]').addEventListener('click', () => goDeck(deckActive + 1));
deckCards.forEach((el, i) => el.addEventListener('click', () => {
  if (i === deckActive) location.href = productUrl(KITS[i].key); else goDeck(i);
}));
let deckTouch = null;
deckEl.addEventListener('touchstart', (e) => { deckTouch = [e.touches[0].clientX, e.touches[0].clientY]; }, { passive: true });
deckEl.addEventListener('touchend', (e) => {
  if (!deckTouch) return;
  const dx = e.changedTouches[0].clientX - deckTouch[0];
  const dy = e.changedTouches[0].clientY - deckTouch[1];
  deckTouch = null;
  if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) goDeck(deckActive + (dx < 0 ? 1 : -1));
}, { passive: true });
renderDeck();

/* ---------- motion ---------- */
const lenis = initMotion();

// Hero: one film at a time, crossfading on every screen size.
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
onMotionChange((p) => { if (p) lookTween?.pause(); else if (heroVisible) lookTween?.resume(); });
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
  gsap.from('.hero-copy > *, .look-tab', { y: 28, autoAlpha: 0, duration: 1, ease: 'power3.out', stagger: 0.08, delay: 0.15 });
  gsap.to('.looks', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.fromTo('.how-media', { scale: 1.08 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '#how', start: 'top bottom', end: 'center center', scrub: true } });

  // Pin the collection; scroll turns the cards and settles on the nearest one.
  deckST = gsap.to(deck, {
    p: KITS.length - 1, ease: 'none', onUpdate: renderDeck,
    scrollTrigger: {
      trigger: '#collection', start: 'top top', end: () => `+=${Math.round(innerHeight * 0.6 * (KITS.length - 1))}`, pin: true, scrub: 0.5,
      snap: { snapTo: 1 / (KITS.length - 1), duration: { min: 0.15, max: 0.45 }, delay: 0.08, ease: 'power2.out' },
    },
  }).scrollTrigger;
}

initReveals();
document.fonts?.ready.then(() => ScrollTrigger.refresh());
