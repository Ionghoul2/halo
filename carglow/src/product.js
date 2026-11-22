import {
  BASE, SIZES, catalog, money, num, state, setState, subscribe, variantFor, priceRange, ledRange, statusLabel,
  video, renderChrome, initMotion, initReveals, mountBuilder,
} from './shared.js';

const key = document.documentElement.dataset.product;
const main = document.querySelector('#main');
renderChrome(key, { buybar: key !== 'underglow' });

const GALLERY = {
  static: [['classic-string-lambos', 'Multicolor string lights, full body'], ['clip-mount-bmw', 'Dense multicolor on a sedan'], ['lights-on-reveal', 'Switching on']],
  rgb: [['dense-red', 'One color across the whole car: red'], ['white-mclaren', 'One color across the whole car: white']],
  mapping: [['holiday-graphics', 'Holiday graphics across the body'], ['lambo-convoy', 'Faces and stripes on hoods']],
};

const install = `
  <section class="section" aria-labelledby="inst-title">
    <div class="wrap">
      <header class="section-head" data-reveal><p class="eyebrow">Install and delivery</p><h2 class="h2" id="inst-title">What to expect.</h2></header>
      <div class="info-grid">
        <div><h3>Installation</h3><p>Prep, mount, route power, set up the controller. Plan on real time for thousands of lights. We'll publish measured install times after test installs.</p>
          <p><a href="${BASE}install/index.html">See the install steps</a></p></div>
        <div><h3>Power</h3><p>Each kit gets a fused automotive power system sized to its real load. No high-current cigarette-lighter setups.</p></div>
        <div><h3>Shipping</h3><p>Cost, delivery time and whether everything arrives in one box are set once a supplier is confirmed.</p></div>
        <div><h3>Where to use it</h3><p>Parked displays, photos and private-property events. Check local laws before driving with exterior lights on.</p></div>
      </div>
    </div>
  </section>`;

function sizeTable(tech) {
  return `<div class="table-scroll"><table class="price-table">
    <caption class="sr-only">Sizes and planned prices</caption>
    <thead><tr><th scope="col">Size</th><th scope="col">Length</th><th scope="col">Typical vehicles</th><th scope="col">Planned LEDs</th><th scope="col">Kit</th><th scope="col">+ Underglow</th></tr></thead>
    <tbody>${SIZES.map((s) => {
      const z = catalog.sizes[s];
      return `<tr><th scope="row">${z.name}</th><td>${z.lengthFt} ft</td><td>${z.examples}</td>
        <td>~${num(variantFor(tech, s, false).plannedLEDCount)}</td>
        <td>${money(variantFor(tech, s, false).ownerTargetPrice)}</td><td>${money(variantFor(tech, s, true).ownerTargetPrice)}</td></tr>`;
    }).join('')}
    <tr><th scope="row">Custom</th><td>over 20 ft</td><td>${catalog.sizes.CUSTOM.examples}</td><td colspan="3">Fitment check required</td></tr>
    </tbody></table></div>`;
}

if (key === 'underglow') {
  document.title = 'RGBIC Underglow · Car Glow';
  main.innerHTML = `
  <section class="p-hero wrap">
    <div class="p-hero-grid">
      <div class="p-hero-copy">
        <p class="eyebrow">Car Glow · Underglow</p>
        <h1 class="display">RGBIC <span class="glow-text">underglow.</span></h1>
        <span class="status s-early-access">Available now</span>
        <p class="lede">Flowing multi-color light under the car. Add it to any body kit, or buy it on its own once verified.</p>
        <p class="p-price">Add-on <strong>+$45</strong> Small/Medium · <strong>+$58</strong> Large · Standalone price not set</p>
        <div class="cta-row"><button type="button" class="btn btn-glow" data-ug-toggle></button><a class="btn btn-ghost" href="${BASE}build/index.html">Build a full kit</a></div>
        <p class="hint" data-ug-now aria-live="polite"></p>
        <div class="swatches" role="group" aria-label="Preview a glow color" data-swatches></div>
      </div>
      <figure class="p-hero-media" style="margin:0"><img data-ug-photo src="${BASE}media/underglow/charger-magenta.jpg" alt="White Charger with magenta underglow and headlight halos" width="1020" height="1052" style="border-radius:22px;width:100%;height:auto"></figure>
    </div>
  </section>
  <section class="section"><div class="wrap">
    <header class="section-head" data-reveal><p class="eyebrow">Two sizes</p><h2 class="h2">Matched to your car's length.</h2></header>
    <div class="ug-cards">
      <div class="info-grid" style="display:grid"><div><h3>Standard · 4 pieces</h3><p>For Small and Medium vehicles. Front, rear and two side bars.</p><p><strong>+$45</strong> with any kit</p></div></div>
      <div class="info-grid" style="display:grid"><div><h3>Extended XL · 6 pieces</h3><p>For Large vehicles. Extra side coverage for longer wheelbases.</p><p><strong>+$58</strong> with any kit</p></div></div>
    </div>
    <p class="hint" style="margin-top:18px">Bar lengths, mounts, controller and power are pending supplier verification. Underglow runs on its own controller; we won't claim sync with body lights until we've tested it.</p>
  </div></section>
  <section class="section" style="padding-top:0"><div class="wrap gallery">
    <figure>${video('aventador-underglow')}<figcaption>Rainbow and red underglow with body lighting. Reference footage.</figcaption></figure>
    <figure>${video('classic-string-lambos')}<figcaption>Blue and pink underglow under string lights. Reference footage.</figcaption></figure>
  </div></section>
  ${install}`;
  // Color preview: hue-shifts the reference photo. Simulated, labeled as such.
  const SWATCHES = [['Magenta', 0, '#e14bff'], ['Ice blue', -105, '#6fd8ff'], ['Green', -160, '#3dffa8'], ['Red', 60, '#ff3b4a'], ['Amber', 95, '#ffa53b']];
  const sw = main.querySelector('[data-swatches]');
  sw.innerHTML = SWATCHES.map(([n, , hex], i) => `<button type="button" class="swatch" style="--c:${hex}" data-swatch="${i}" aria-label="Preview ${n}" aria-pressed="${i === 0}"></button>`).join('')
    + '<span class="swatch-name" data-swatch-name aria-live="polite">Magenta · simulated preview</span>';
  sw.addEventListener('click', (e) => {
    const b = e.target.closest('[data-swatch]');
    if (!b) return;
    const [n, deg] = SWATCHES[+b.dataset.swatch];
    sw.querySelectorAll('[data-swatch]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    sw.querySelector('[data-swatch-name]').textContent = `${n} · simulated preview`;
    main.querySelector('[data-ug-photo]').style.filter = `hue-rotate(${deg}deg)`;
  });
  const btn = main.querySelector('[data-ug-toggle]');
  btn.addEventListener('click', () => setState({ ug: !state.ug }));
  subscribe((s) => {
    const v = variantFor(s.tech, s.size, s.ug);
    btn.textContent = s.ug ? 'Remove from my build' : 'Add to my build';
    main.querySelector('[data-ug-now]').textContent =
      `Your build: ${catalog.products[s.tech].name} · ${catalog.sizes[s.size].name}${s.ug ? ' + underglow' : ''}, ${money(v.ownerTargetPrice)} planned.`;
  });
  
} else {
  const p = catalog.products[key];
  const [lo, hi] = priceRange(key);
  const [l1, l2] = ledRange(key);
  document.title = `${p.name} · Car Glow`;
  main.innerHTML = `
  <section class="p-hero wrap">
    <div class="p-hero-grid">
      <div class="p-hero-copy">
        <p class="eyebrow">Car Glow · ${p.name}</p>
        <h1 class="display">${p.name.replace(' ', '<br>')}</h1>
        <span class="status s-${p.status}">${statusLabel(p.status)}</span>
        <p class="tagline glow-text">${p.tagline}</p>
        <p class="lede">${p.summary}</p>
        <p class="p-price">Planned <strong>${money(lo)} – ${money(hi)}</strong> · ~${num(l1)}–${num(l2)} ${key === 'mapping' ? 'pixels' : 'LEDs'}</p>
        ${p.status === 'concept' ? '<p class="notice">Animation options depend on the included controller and app. Contact us before ordering a custom design.</p>' : ''}
        <div class="cta-row"><a class="btn btn-glow" href="#configure">Configure</a><a class="btn btn-ghost" href="${BASE}index.html#options">Compare all three</a></div>
      </div>
      <div class="p-hero-media">${video(p.media)}<p class="ref-note">Reference footage. Not Car Glow hardware.</p></div>
    </div>
  </section>

  <section class="section" aria-labelledby="does-title"><div class="wrap">
    <header class="section-head" data-reveal><p class="eyebrow">Capabilities</p><h2 class="h2" id="does-title">What it does. What it doesn't.</h2></header>
    <div class="does does-lg">
      <ul class="yes"><h3>Planned</h3>${p.planned.map((x) => `<li>${x}</li>`).join('')}</ul>
      <ul class="no"><h3>Not promised</h3>${p.notPromised.map((x) => `<li>${x}</li>`).join('')}</ul>
    </div>
    <p class="hint" style="margin-top:16px">Final features depend on the strands and controller we source. We'll update this list as hardware is confirmed.</p>
  </div></section>

  <section class="section" style="padding-top:0"><div class="wrap">
    <header class="section-head" data-reveal><p class="eyebrow">The look</p><h2 class="h2">Seen on the street.</h2>
      <p class="lede">Reference clips that show the style. They are not Car Glow installs.</p></header>
    <div class="gallery">${GALLERY[key].map(([id, cap]) => `<figure>${video(id)}<figcaption>${cap}</figcaption></figure>`).join('')}</div>
    ${key === 'rgb' ? '<p class="hint" style="margin-top:16px">Gradients, chasing and two-tone patterns seen in some light-up car videos need individually controlled lights. That is Graphic Mapping, not this kit.</p>' : ''}
  </div></section>

  <section class="section build" id="configure" aria-labelledby="cfg-title"><div class="wrap">
    <header class="section-head" data-reveal><p class="eyebrow">Configure</p><h2 class="h2" id="cfg-title">Size it to your car.</h2></header>
    <div data-builder></div>
  </div></section>

  <section class="section" style="padding-top:0" aria-labelledby="sizes-title"><div class="wrap">
    <header class="section-head" data-reveal><p class="eyebrow">Compatibility</p><h2 class="h2" id="sizes-title">Sizes and prices.</h2>
      <p class="lede">Length is the first guide. Width, height and body shape matter too. Windows, wheels, lights, sensors, plates and vents are never covered.</p></header>
    ${sizeTable(key)}
  </div></section>
  ${install}`;
  mountBuilder(main.querySelector('[data-builder]'), { lockTech: key });
}

initMotion();
initReveals();
