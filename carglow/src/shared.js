import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import catalog from './data/catalog.json';
import bridge from './data/shopify-bridge.json';
import './styles.css';

gsap.registerPlugin(ScrollTrigger, SplitText);
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

// Shopify checkout link for one kit SKU, or null. Stays null until the store owner
// sets canPurchase and that variant's availableForSale to true in shopify-bridge.json.
const cartLink = (v) => (v?.availableForSale === true && /^\d+$/.test(v.variantNumericId ?? '') ? `https://${bridge.shopDomain}/cart/${v.variantNumericId}:1` : null);
export function checkoutUrl(sku) {
  if (bridge.canPurchase !== true) return null;
  for (const p of Object.values(bridge.products)) if (p.variants?.[sku]) return cartLink(p.variants[sku]);
  return null;
}

// Add-ons sold on their own (fiber dash, eyes, underglow, interior). Only entries with a real Shopify variant are returned.
export function buyableAddons() {
  if (bridge.addonsCanPurchase !== true) return [];
  return Object.values(bridge.addons || {})
    .map((a) => ({ ...a, options: Object.entries(a.variants).map(([sku, v]) => ({ sku, ...v, url: cartLink(v) })).filter((o) => o.url) }))
    .filter((a) => a.options.length);
}
export const pageUrl = (page) => `${BASE}${page}/index.html`;
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
export const statusLabel = (s) => (s === 'concept' ? 'Advanced kit' : 'Available now');

export const MEDIA = {
  'look-static': { dir: 'hero', alt: 'Lamborghinis and a BMW wrapped in classic multicolor string lights' },
  'look-rgb': { dir: 'hero', alt: 'McLarens and Porsches in shifting turquoise, purple, green and blue light' },
  'look-mapping': { dir: 'hero', alt: 'Cars showing mapped LED graphics: gingerbread man, faces, stripes' },
  'look-underglow': { dir: 'hero', alt: 'Row of Lamborghinis with rainbow and red underglow' },
  'film-static': { dir: 'static', alt: 'A BMW covered in multicolor lights rolls out of a garage, then a street of lit cars' },
  'film-rgb': { dir: 'rgb', alt: 'McLaren and Porsches in white, blue and red light at a warehouse lot' },
  'film-mapping': { dir: 'mapping', alt: 'Lamborghinis showing mapped LED faces and stripes in a garage and on the street' },
  'final-film': { dir: 'hero', alt: 'Gold Lamborghini with mapped LED graphics rolling down a road at night' },
  'look-static-wide': { dir: 'hero', alt: 'Lamborghinis wrapped in classic multicolor string lights' },
  'look-rgb-wide': { dir: 'hero', alt: 'McLaren in shifting turquoise, purple and green light' },
  'look-mapping-wide': { dir: 'hero', alt: 'Audi R8 showing mapped LED holiday graphics' },
  'look-underglow-wide': { dir: 'hero', alt: 'Row of Lamborghinis with rainbow and red underglow' },
  'white-mclaren': { dir: 'hero', alt: 'McLaren covered in dense white LEDs against a black backdrop' },
  'white-mclaren-wide': { dir: 'hero', alt: 'McLaren covered in dense white LEDs against a black backdrop' },
  'two-tone-pixels': { dir: 'rgb', alt: 'McLaren and Porsche in white, blue and red pixel light, with smoke' },
  'pixel-install-lambo': { dir: 'installation', alt: 'Pixel strands taped in rows across a yellow Lamborghini hood' },
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
  return `<video class="${cls}" muted loop playsinline autoplay preload="none" poster="${BASE}media/posters/${id}.jpg"
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
  Object.assign(state, patch, { touched: true });
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

/* ---------- Christmas light garland under the menu (seasonal: remove the svg in renderChrome to turn off) ---------- */
const GARLAND = ['#ff3b4a', '#3dff8a', '#ffc94a', '#5aa8ff', '#ff6ad5'];
let garlandW = 0;
function buildGarland() {
  const svg = document.querySelector('[data-garland]');
  const W = innerWidth;
  if (!svg || W === garlandW) return;
  garlandW = W;
  const swags = Math.max(3, Math.round(W / 118));
  const span = W / swags;
  const SAG = 13;
  let wire = 'M 0 2';
  let bulbs = '';
  for (let i = 0; i < swags; i++) {
    const x0 = i * span;
    wire += ` Q ${(x0 + span / 2).toFixed(1)} ${2 + SAG * 2} ${(x0 + span).toFixed(1)} 2`;
    [0.2, 0.4, 0.6, 0.8].forEach((t, k) => {
      const x = x0 + t * span;
      const y = 2 + SAG * 4 * t * (1 - t);
      const n = i * 4 + k;
      const c = GARLAND[n % GARLAND.length];
      bulbs += `<g class="g-bulb" style="animation-delay:-${((n * 0.37) % 2.6).toFixed(2)}s" fill="${c}"><circle class="halo" cx="${x.toFixed(1)}" cy="${(y + 6).toFixed(1)}" r="8"/><rect x="${(x - 1.2).toFixed(1)}" y="${y.toFixed(1)}" width="2.4" height="2.6" fill="#2a2536"/><ellipse cx="${x.toFixed(1)}" cy="${(y + 6.4).toFixed(1)}" rx="2.7" ry="4"/></g>`;
    });
  }
  svg.setAttribute('viewBox', `0 0 ${W} 36`);
  svg.innerHTML = `<path d="${wire}" fill="none" stroke="rgba(229,220,255,0.35)" stroke-width="1"/>${bulbs}`;
}

/* ---------- page chrome ---------- */
export function renderChrome(active = '', { buybar = false } = {}) {
  const cur = (k) => (active === k ? 'aria-current="page"' : '');
  const pages = [['collection', 'Collection', `${BASE}index.html#collection`], ['build', 'Build', pageUrl('build')],
    ['pricing', 'Pricing', pageUrl('pricing')], ['install', 'Install', pageUrl('install')]];
  const products = [['static', 'Static Classic'], ['rgb', 'Color-Changing RGB'], ['mapping', 'Graphic Mapping'], ['underglow', 'RGBIC Underglow']];
  document.body.insertAdjacentHTML('afterbegin', `
  <a class="skip" href="#main">Skip to content</a>
  <header class="nav">
    <a class="wordmark" href="${BASE}index.html" aria-label="Car Glow home">CAR<span class="dot" aria-hidden="true"></span>GLOW</a>
    <nav aria-label="Main">${pages.map(([k, l, h]) => `<a href="${h}" ${cur(k)}>${l}</a>`).join('')}</nav>
    <button class="motion-toggle" type="button" aria-pressed="false" data-motion-toggle><span class="motion-icon" aria-hidden="true"></span><span class="long" data-motion-label>Pause motion</span></button>
    <a class="btn btn-glow nav-cta" href="${pageUrl('build')}">Find my lights</a>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu" data-menu-open>Menu</button>
    <svg class="garland" data-garland aria-hidden="true"></svg>
  </header>
  <div class="menu" id="menu" data-menu hidden>
    <button class="menu-close" type="button" data-menu-close>Close</button>
    <nav aria-label="Menu">
      ${pages.map(([k, l, h]) => `<a class="menu-big" href="${h}" ${cur(k)}>${l}</a>`).join('')}
      <p class="eyebrow">Kits</p>
      ${products.map(([k, l]) => `<a class="menu-small" href="${productUrl(k)}" ${cur(k)}>${l}</a>`).join('')}
    </nav>
  </div>`);
  buildGarland();
  addEventListener('resize', buildGarland);
  const menu = document.querySelector('[data-menu]');
  const openBtn = document.querySelector('[data-menu-open]');
  const setMenu = (open) => {
    menu.hidden = !open;
    openBtn.setAttribute('aria-expanded', String(open));
    document.documentElement.classList.toggle('menu-open', open);
    if (open) menu.querySelector('a').focus(); else openBtn.focus();
  };
  openBtn.addEventListener('click', () => setMenu(true));
  menu.querySelector('[data-menu-close]').addEventListener('click', () => setMenu(false));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });

  document.body.insertAdjacentHTML('beforeend', `
  <footer class="footer">
    <div class="footer-inner">
      <a class="wordmark" href="${BASE}index.html">CAR<span class="dot" aria-hidden="true"></span>GLOW</a>
      <nav aria-label="Footer">${pages.map(([, l, h]) => `<a href="${h}">${l}</a>`).join('')}${products.map(([k, l]) => `<a href="${productUrl(k)}">${l}</a>`).join('')}</nav>
      <p class="fine">Secure checkout by Shopify. Ships in 7 to 15 business days. Standard shipping $12, free on orders of $70 or more.
      All footage is third-party reference footage showing the look, not Car Glow hardware.
      Decorative lighting is for parked display and private property. Check your local vehicle lighting laws.</p>
    </div>
  </footer>`);
  if (!buybar) return;
  document.body.insertAdjacentHTML('beforeend', `
  <div class="buybar" data-buybar hidden>
    <div><span class="buybar-label" data-buybar-label></span><strong class="buybar-price" data-buybar-price></strong></div>
    <a class="btn btn-glow" href="#summary" data-buybar-cta>See my kit</a>
  </div>`);
  const bar = document.querySelector('[data-buybar]');
  subscribe((s) => {
    const v = variantFor(s.tech, s.size, s.ug);
    document.querySelector('[data-buybar-label]').textContent =
      `${catalog.products[s.tech].name} · ${catalog.sizes[s.size].name}${s.ug ? ' + underglow' : ''}`;
    document.querySelector('[data-buybar-price]').textContent = money(v.ownerTargetPrice);
    bar.dataset.touched = s.touched ? '1' : '0';
  });
  ScrollTrigger.create({ start: 280, onEnter: () => { bar.hidden = false; }, onLeaveBack: () => { bar.hidden = true; } });
}

/* ---------- motion ---------- */
// Videos always start playing. A pause lasts for this visit only (sessionStorage), so the site opens moving again.
const readSession = (k) => { try { return sessionStorage.getItem(k) === '1'; } catch { return false; } };
const writeSession = (k, v) => { try { sessionStorage.setItem(k, v ? '1' : '0'); } catch { /* storage blocked */ } };
let paused = readSession('carglow:paused');
const videos = new Set();
const motionListeners = new Set();
export const isPaused = () => paused;
export const onMotionChange = (f) => motionListeners.add(f);
export function playIfAllowed(v) {
  videos.add(v);
  if (!v.getAttribute('src')) v.src = v.dataset.src;
  if (!paused) v.play().catch(() => {});
}

/* Ambient background: an LED grid with bands of light drifting across it. One fixed WebGL canvas for the whole page. */
// Every tint keeps the green "essence" and changes the second color.
const GREEN = [0.1, 0.92, 0.6];
const TINTS = {
  essence: [GREEN, [0.1, 0.72, 0.95]],
  magenta: [GREEN, [0.88, 0.29, 1.0]],
  ice: [[0.1, 0.9, 0.78], [0.42, 0.58, 1.0]],
  rgb: [GREEN, [0.66, 0.32, 1.0]],
  warm: [GREEN, [1.0, 0.72, 0.25]],
  red: [GREEN, [1.0, 0.22, 0.28]],
};
const FRAG = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 u_res; uniform float u_t; uniform float u_s; uniform float u_cell; uniform vec3 u_a; uniform vec3 u_b;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
void main(){
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  // Rotate so the light runs corner to corner, and let scrolling push it along.
  vec2 q = vec2(p.x * 0.82 + p.y * 0.57, -p.x * 0.57 + p.y * 0.82);
  float flow = u_t * 0.05 + u_s;
  vec3 acc = vec3(0.0); float lit = 0.0;
  for (int i = 0; i < 2; i++) {
    float fi = float(i);
    float n = noise(vec2(q.x * 1.25 + flow * (1.0 + fi * 0.6) + fi * 7.3, fi * 3.1 + u_t * 0.03));
    float y = q.y + (fi - 0.5) * 0.78 + (n - 0.5) * 0.6;
    float w = 0.15 + 0.11 * noise(vec2(q.x * 0.8 - flow + fi * 4.0, 2.0));
    float band = exp(-y * y / (w * w));
    float core = exp(-y * y / (w * w * 0.04));
    float mixv = clamp(0.5 + 1.1 * (noise(vec2(q.x * 0.9 + flow * 0.7, fi + 5.0)) - 0.5), 0.0, 1.0);
    acc += mix(u_a, u_b, mixv) * (band * 0.2 + core * 0.09);
    lit += band;
  }
  // Dust: small sparks drifting along the light.
  vec2 g = gl_FragCoord.xy / u_cell; g.x += flow * 5.0; g.y -= flow * 2.0;
  vec2 cell = floor(g); vec2 f = fract(g) - 0.5;
  float h = hash(cell);
  vec2 off = (vec2(hash(cell + 3.1), hash(cell + 9.7)) - 0.5) * 0.6;
  float spark = smoothstep(0.11, 0.0, length(f - off)) * step(0.7, h);
  float tw = 0.45 + 0.55 * sin(u_t * (1.0 + h * 2.0) + h * 40.0);
  acc += mix(u_a, u_b, h) * spark * tw * (0.22 + 1.1 * min(lit, 1.0));
  gl_FragColor = vec4(vec3(0.027, 0.024, 0.043) + acc, 1.0);
}`;
function initAmbient() {
  const canvas = Object.assign(document.createElement('canvas'), { className: 'ambient' });
  canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!gl) return;
  const shader = (type, src) => { const sh = gl.createShader(type); gl.shaderSource(sh, src); gl.compileShader(sh); return sh; };
  const prog = gl.createProgram();
  gl.attachShader(prog, shader(gl.VERTEX_SHADER, 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }'));
  gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = Object.fromEntries(['u_res', 'u_t', 'u_s', 'u_cell', 'u_a', 'u_b'].map((n) => [n, gl.getUniformLocation(prog, n)]));
  document.body.prepend(canvas);
  document.documentElement.classList.add('has-ambient');

  const cur = TINTS.essence.map((c) => [...c]);
  let target = TINTS.essence;
  let ratio = 0.5;
  const resize = () => {
    ratio = Math.min(devicePixelRatio || 1, 2) * 0.5;
    canvas.width = Math.round(innerWidth * ratio);
    canvas.height = Math.round(innerHeight * ratio);
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  const draw = (ms) => {
    cur.forEach((c, i) => c.forEach((_, k) => { c[k] += (target[i][k] - c[k]) * 0.05; }));
    gl.uniform2f(U.u_res, canvas.width, canvas.height);
    gl.uniform1f(U.u_t, ms / 1000);
    gl.uniform1f(U.u_s, scrollY * 0.0012);
    gl.uniform1f(U.u_cell, 30 * ratio);
    gl.uniform3fv(U.u_a, cur[0]);
    gl.uniform3fv(U.u_b, cur[1]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  let frame = 0;
  const loop = (ms) => {
    if (!paused && !document.hidden && frame++ % 2 === 0) draw(ms);
    requestAnimationFrame(loop);
  };
  addEventListener('resize', () => { resize(); draw(performance.now()); });
  resize();
  draw(4000);
  requestAnimationFrame(loop);

  setTint = (name) => { target = TINTS[name]; };
}
let setTint = null;
export const tintTo = (name) => setTint?.(name);

/* A winding string of Christmas lights fixed behind the page. A small car drives along it as the page
   scrolls and lights the bulbs it has just passed. */
const BULBS = ['#ff3b4a', '#3dff8a', '#ffc94a', '#5aa8ff', '#ff6ad5'];
const NS = 'http://www.w3.org/2000/svg';
function initTrack() {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'track-bg');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = `<defs><linearGradient id="beam" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff6d8" stop-opacity="0.55"/><stop offset="1" stop-color="#fff6d8" stop-opacity="0"/></linearGradient></defs>
    <path class="wire" fill="none"/><g class="bulbs"></g>
    <g class="car"><ellipse class="car-glow" rx="15" ry="22"/><path d="M-6 -15 L-15 -52 L15 -52 L6 -15Z" fill="url(#beam)"/>
      <rect class="car-body" x="-7.5" y="-15" width="15" height="30" rx="5.5"/><rect class="car-cabin" x="-5.5" y="-7" width="11" height="13" rx="3"/>
      <rect class="car-hl" x="-6.5" y="-15.5" width="4" height="2.4" rx="1"/><rect class="car-hl" x="2.5" y="-15.5" width="4" height="2.4" rx="1"/>
      <rect class="car-tl" x="-6.5" y="13.2" width="4" height="2" rx="1"/><rect class="car-tl" x="2.5" y="13.2" width="4" height="2" rx="1"/></g>`;
  const canvas = document.querySelector('canvas.ambient');
  if (canvas) canvas.after(svg); else document.body.prepend(svg);
  const wire = svg.querySelector('.wire');
  const bulbG = svg.querySelector('.bulbs');
  const car = svg.querySelector('.car');
  const GAP = 30;
  let L = 0;
  let bulbs = [];
  let lastY = scrollY;
  let dir = 1;
  let lastIdx = -99;
  function layout() {
    const W = innerWidth;
    const H = innerHeight;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    // Phones: run down the right edge, cross once, then down the left edge, so the car stays out of the text.
    wire.setAttribute('d', W < 700
      ? `M ${W - 9} -70 L ${W - 9} ${0.3 * H} C ${W - 9} ${0.47 * H}, 9 ${0.47 * H}, 9 ${0.64 * H} L 9 ${H + 70}`
      : `M ${0.8 * W} -70 C ${0.98 * W} ${0.2 * H}, ${0.02 * W} ${0.28 * H}, ${0.18 * W} ${0.52 * H} S ${0.94 * W} ${0.8 * H}, ${0.66 * W} ${H + 70}`);
    L = wire.getTotalLength();
    const n = Math.floor(L / GAP);
    bulbG.innerHTML = Array.from({ length: n }, (_, i) => {
      const pt = wire.getPointAtLength((i + 0.5) * GAP);
      const c = BULBS[i % BULBS.length];
      return `<g class="bulb" fill="${c}"><circle class="halo" cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="9"/><circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="2.6"/></g>`;
    }).join('');
    bulbs = [...bulbG.children];
    lastIdx = -99;
    update();
  }
  function update() {
    const y = scrollY;
    if (y !== lastY) dir = y > lastY ? 1 : -1;
    lastY = y;
    const p = (y / (innerHeight * 2.4)) % 1;
    const l = p * L;
    const a = wire.getPointAtLength(l);
    const b = wire.getPointAtLength(Math.min(L, l + 2));
    const deg = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI + 90 + (dir < 0 ? 180 : 0);
    car.setAttribute('transform', `translate(${a.x.toFixed(1)} ${a.y.toFixed(1)}) rotate(${deg.toFixed(1)})`);
    const idx = Math.floor(l / GAP);
    if (idx !== lastIdx) {
      bulbs.forEach((el, i) => { const d = (idx - i) * dir; el.classList.toggle('lit', d >= 0 && d < 9); });
      lastIdx = idx;
    }
  }
  let queued = false;
  addEventListener('scroll', () => {
    if (queued || paused) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; update(); });
  }, { passive: true });
  addEventListener('resize', layout);
  if (reduceMotion) svg.classList.add('still');
  layout();
}

export function initMotion() {
  const toggle = document.querySelector('[data-motion-toggle]');
  const sync = () => {
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.querySelector('[data-motion-label]').textContent = paused ? 'Play motion' : 'Pause motion';
    toggle.setAttribute('aria-label', paused ? 'Play motion' : 'Pause motion');
    document.documentElement.classList.toggle('motion-paused', paused);
    videos.forEach((v) => {
      if (paused) v.pause();
      else if (v.dataset.visible === '1' && v.dataset.active !== '0') v.play().catch(() => {});
    });
    motionListeners.forEach((f) => f(paused));
  };
  toggle.addEventListener('click', () => { paused = !paused; writeSession('carglow:paused', paused); sync(); });

  const io = new IntersectionObserver((entries) => entries.forEach(({ target: v, isIntersecting }) => {
    v.dataset.visible = isIntersecting ? '1' : '0';
    if (!isIntersecting) v.pause();
    else if (v.dataset.active !== '0') playIfAllowed(v);
  }), { rootMargin: '200px 0px' });
  document.querySelectorAll('video[data-src]').forEach((v) => { videos.add(v); io.observe(v); });
  sync();
  // iPhone Low Power Mode blocks autoplay until the visitor touches the page; any tap restarts what should be playing.
  const resume = () => {
    if (paused) return;
    videos.forEach((v) => { if (v.paused && v.dataset.visible === '1' && v.dataset.active !== '0') playIfAllowed(v); });
  };
  ['touchend', 'click', 'keydown'].forEach((e) => addEventListener(e, resume, { passive: true }));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) resume(); });
  initAmbient();
  initTrack();

  if (reduceMotion) return null;
  const lenis = new Lenis({ anchors: { offset: -70 }, lerp: 0.12 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}
// Call after any pinned sections are created so trigger positions include pin spacing.
export function initReveals() {
  if (setTint) document.querySelectorAll('[data-tint]').forEach((el) => ScrollTrigger.create({
    trigger: el, start: 'top 55%', end: 'bottom 55%',
    onToggle: (self) => { if (self.isActive) setTint(el.dataset.tint); },
  }));
  if (reduceMotion) return;
  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    gsap.from(el, { y: 40, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
  });
  addEventListener('focusin', (e) => {
    const el = e.target.closest?.('[data-reveal]');
    if (el) gsap.set(el, { opacity: 1, y: 0 });
  });
  gsap.utils.toArray('[data-parallax]').forEach((el) => {
    gsap.fromTo(el, { yPercent: -el.dataset.parallax }, {
      yPercent: +el.dataset.parallax, ease: 'none',
      scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
  document.fonts.ready.then(() => {
    gsap.utils.toArray('.h2').forEach((el) => SplitText.create(el, {
      type: 'lines', autoSplit: true,
      onSplit: (self) => gsap.from(self.lines, {
        yPercent: 60, autoAlpha: 0, duration: 0.9, ease: 'power4.out', stagger: 0.09,
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
      }),
    }));
  });
}

/* ---------- the configurator ---------- */
export function mountBuilder(root, { lockTech = null } = {}) {
  if (lockTech && state.tech !== lockTech) setState({ tech: lockTech });
  const years = Array.from({ length: 38 }, (_, i) => 2027 - i);
  const sizeBtn = (k) => `<button type="button" class="opt" data-size="${k}" aria-pressed="false">
      <span class="opt-title">${catalog.sizes[k].name}</span><span class="opt-sub">${catalog.sizes[k].lengthFt} ft</span>
      <span class="badge-rec" hidden>Recommended</span></button>`;
  const techBtn = (k) => `<button type="button" class="opt opt-tech" data-tech="${k}" aria-pressed="false">
      ${video(catalog.products[k].media, 'opt-video')}
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
      <a class="btn btn-glow summary-buy" data-sum-buy target="_blank" rel="noopener" hidden></a>
      <form class="waitlist" data-waitlist novalidate>
        <label for="wl-email" class="sr-only">Email</label>
        <input id="wl-email" name="email" type="email" autocomplete="email" placeholder="you@example.com…" required spellcheck="false">
        <button class="btn btn-glow" type="submit" data-sum-cta>Join early access</button>
        <p class="hint" data-wl-msg aria-live="polite"></p>
      </form>
      <p class="fine" data-sum-fine>Not purchasable yet. LED counts are estimates until a supplier confirms the kit.</p>
    </aside>
  </div>`;

  const $ = (sel) => root.querySelector(sel);
  const $$ = (sel) => root.querySelectorAll(sel);
  $('#veh-year').value = state.year;
  $('#veh-make').value = state.make;
  $('#veh-model').value = state.model;
  $('#veh-length').value = state.lengthFt;

  const shown = { v: null };
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
    $$('[data-tech]').forEach((b) => {
      const on = b.dataset.tech === s.tech;
      b.setAttribute('aria-pressed', String(on));
      const vid = b.querySelector('video');
      vid.dataset.active = on ? '1' : '0';
      if (on && vid.dataset.visible === '1') playIfAllowed(vid); else vid.pause();
    });
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
    const priceEl = $('[data-sum-price]');
    if (reduceMotion || shown.v === null) { shown.v = v.ownerTargetPrice; priceEl.textContent = money(shown.v); }
    else gsap.to(shown, { v: v.ownerTargetPrice, duration: 0.5, ease: 'power2.out', overwrite: true, onUpdate: () => { priceEl.textContent = money(Math.round(shown.v)); } });
    $('[data-sum-contents]').innerHTML = kitContents(v).map(([a, b]) => `<li><strong>${a}</strong><span>${b}</span><em>Included</em></li>`).join('');
    const custom = rec?.size === 'CUSTOM';
    const fit = $('[data-sum-fit]');
    fit.hidden = !custom;
    fit.textContent = custom ? 'Your vehicle needs a fitment check before we can match a kit.' : '';
    $('[data-sum-cta]').textContent = custom ? 'Request fitment check' : v.status === 'concept' ? 'Join the concept waitlist' : 'Join early access';
    const buyUrl = custom ? null : checkoutUrl(v.sku);
    const buy = $('[data-sum-buy]');
    buy.hidden = !buyUrl;
    buy.textContent = buyUrl ? `Checkout · ${money(v.ownerTargetPrice)}` : '';
    if (buyUrl) buy.href = buyUrl; else buy.removeAttribute('href');
    $('[data-waitlist]').hidden = Boolean(buyUrl);
    $('[data-sum-fine]').hidden = Boolean(buyUrl);
  });
}
