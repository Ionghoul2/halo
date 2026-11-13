import {
  BASE, TECHS, SIZES, catalog, gsap, ScrollTrigger, reduceMotion, money, num, state, setState, subscribe,
  variantFor, priceRange, ledRange, statusLabel, productUrl, video, kitContents, renderChrome, initMotion,
  initReveals, playIfAllowed, mountBuilder,
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

// Hero: scroll scrubs the clip and "switches on" the lights.
const FRAMES = 93;
const canvas = document.querySelector('[data-hero-canvas]');
const ctx = canvas.getContext('2d');
const tiny = Object.assign(document.createElement('canvas'), { width: 18, height: 26 });
const tctx = tiny.getContext('2d');
const frames = new Array(FRAMES);
const hero = { frame: reduceMotion ? FRAMES - 1 : 0, light: reduceMotion ? 1 : 0.24 };
const countEl = document.querySelector('[data-hero-count]');
const barEl = document.querySelector('[data-hero-bar]');

function frameAt(i) {
  for (let d = 0; d < FRAMES; d++) {
    if (frames[i - d]?.complete) return frames[i - d];
    if (frames[i + d]?.complete) return frames[i + d];
  }
  return null;
}
function drawHero() {
  const img = frameAt(hero.frame);
  const W = canvas.width;
  const H = canvas.height;
  ctx.fillStyle = '#07060b';
  ctx.fillRect(0, 0, W, H);
  if (img) {
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    tctx.drawImage(img, 0, 0, tiny.width, tiny.height);
    const bs = Math.max(W / tiny.width, H / tiny.height);
    ctx.globalAlpha = 0.55;
    ctx.drawImage(tiny, (W - tiny.width * bs) / 2, (H - tiny.height * bs) / 2, tiny.width * bs, tiny.height * bs);
    ctx.globalAlpha = 1;
    if (W / H > 1.05) {
      const h = H;
      const w = (h * iw) / ih;
      const x = Math.min(W - w, W * 0.7 - w / 2);
      ctx.drawImage(img, x, 0, w, h);
    } else {
      const s = Math.max(W / iw, H / ih);
      ctx.drawImage(img, (W - iw * s) / 2, (H - ih * s) / 2, iw * s, ih * s);
    }
  }
  ctx.fillStyle = `rgba(7,6,11,${(1 - hero.light).toFixed(3)})`;
  ctx.fillRect(0, 0, W, H);
  const lit = Math.round(((hero.light - 0.24) / 0.76) * 5600 / 10) * 10;
  countEl.textContent = num(reduceMotion ? 5600 : Math.max(0, lit));
  barEl.style.transform = `scaleX(${reduceMotion ? 1 : Math.max(0, (hero.light - 0.24) / 0.76)})`;
}
function sizeCanvas() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(canvas.clientWidth * dpr);
  canvas.height = Math.round(canvas.clientHeight * dpr);
  drawHero();
}
function loadFrame(i) {
  const img = new Image();
  img.decoding = 'async';
  img.src = `${BASE}media/hero/frames/f${String(i + 1).padStart(3, '0')}.webp`;
  frames[i] = img;
  return img.decode().catch(() => {}).then(() => { if (Math.abs(i - hero.frame) < 3) drawHero(); });
}
const firstIdx = hero.frame;
loadFrame(firstIdx).then(async () => {
  if (reduceMotion) return;
  for (let i = 0; i < FRAMES; i += 8) await Promise.all(Array.from({ length: 8 }, (_, k) => i + k).filter((k) => k < FRAMES && k !== firstIdx).map(loadFrame));
});
addEventListener('resize', sizeCanvas);
sizeCanvas();

if (!reduceMotion) {
  const p = { v: 0 };
  gsap.timeline({ scrollTrigger: { trigger: '#hero', start: 'top top', end: '+=200%', pin: true, scrub: 0.6 } })
    .to(p, {
      v: 1, duration: 1, ease: 'none',
      onUpdate() {
        hero.frame = Math.round(p.v * (FRAMES - 1));
        hero.light = 0.24 + 0.76 * Math.min(1, p.v / 0.5);
        drawHero();
      },
    }, 0)
    .to('.hero-copy', { y: -50, duration: 1, ease: 'none' }, 0)
    .to('.scroll-cue', { autoAlpha: 0, duration: 0.1 }, 0);

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
