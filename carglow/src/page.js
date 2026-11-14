import {
  TECHS, SIZES, catalog, money, state, setState, subscribe, variantFor, pageUrl, video, kitContents,
  renderChrome, initMotion, initReveals, mountBuilder,
} from './shared.js';

const page = document.documentElement.dataset.page;
const main = document.querySelector('#main');
renderChrome(page, { buybar: page === 'build' });

const head = (eyebrow, title, lede) => `
  <header class="page-head wrap">
    <p class="eyebrow">${eyebrow}</p>
    <h1 class="display">${title}</h1>
    ${lede ? `<p class="lede">${lede}</p>` : ''}
  </header>`;

const FAQ = `
  <section class="section" aria-labelledby="faq-title"><div class="wrap faq-wrap">
    <h2 class="h2" id="faq-title">Before you glow.</h2>
    <div class="faq-list">
      <details><summary>Can I drive with the lights on?</summary><p>Car Glow kits are made for parked displays, photos and private-property events. Many places restrict colored or flashing exterior lights on moving vehicles. Check your local laws before driving lit.</p></details>
      <details><summary>Will it damage my paint?</summary><p>We're choosing mounting materials panel by panel and testing removal. We won't promise zero damage on every finish. Clean surfaces, the included film and slow removal matter most.</p></details>
      <details><summary>How do you pick my size?</summary><p>Mostly by vehicle length: Small up to 15 ft, Medium up to 17 ft, Large up to 20 ft. Over 20 ft, vans and unusual shapes get a manual fitment check.</p></details>
      <details><summary>Can I upload my own graphics?</summary><p>That's the goal for Graphic Mapping. It stays a concept until we've proven the full workflow on the hardware we ship.</p></details>
      <details><summary>Does underglow sync with the body lights?</summary><p>Not by default. Underglow runs on its own controller unless we test and confirm sync.</p></details>
      <details><summary>When can I buy?</summary><p>Join early access. We open orders kit by kit once each one's parts, power system and shipping are confirmed. No payment is taken today.</p></details>
    </div>
  </div></section>`;

if (page === 'build') {
  document.title = 'Build your kit · Car Glow';
  main.innerHTML = `
  ${head('Configurator', 'Built around <span class="glow-text">your ride.</span>', "Four quick choices. We'll size the kit and show your price.")}
  <section class="section page-first" data-tint="magenta"><div class="wrap"><div data-builder></div></div></section>
  <section class="section" data-tint="ice" aria-labelledby="kit-title"><div class="wrap kit-wrap">
    <header class="section-head" data-reveal>
      <p class="eyebrow">In the box</p>
      <h2 class="h2" id="kit-title">One order. One complete install.</h2>
      <p class="lede">This is the plan for the build you picked. Each part is confirmed with the supplier before sale.</p>
    </header>
    <div class="kit-panel" data-reveal><ul class="kit-list" data-kit-list></ul></div>
  </div></section>`;
  mountBuilder(main.querySelector('[data-builder]'));
  subscribe((s) => {
    const v = variantFor(s.tech, s.size, s.ug);
    main.querySelector('[data-kit-list]').innerHTML = kitContents(v).map(([a, b]) => `<li><strong>${a}</strong><span>${b}</span></li>`).join('');
  });
}

if (page === 'pricing') {
  document.title = 'Pricing · Car Glow';
  main.innerHTML = `
  ${head('Pricing', 'Every kit, <span class="glow-text">one table.</span>', 'Planned prices. The top price is the kit; the one under it adds RGBIC underglow. Tap a price to start that build.')}
  <section class="section page-first" data-tint="rgb"><div class="wrap">
    <div class="table-scroll" data-reveal><table class="price-table" data-price-table></table></div>
    <p class="fine table-note">Prices are planned and may change once suppliers confirm each kit. No payment is taken today.</p>
  </div></section>
  ${FAQ}`;
  const table = main.querySelector('[data-price-table]');
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
    location.href = pageUrl('build');
  });
  subscribe((s) => {
    const sku = variantFor(s.tech, s.size, s.ug).sku;
    table.querySelectorAll('[data-cell]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cell === sku)));
  });
}

if (page === 'install') {
  document.title = 'Installation · Car Glow';
  main.innerHTML = `
  ${head('Installation', 'How it goes on. <span class="glow-text">And comes off.</span>', 'Five steps, start to finish. Every kit ships with a printed guide and a video.')}
  <section class="section page-first" data-tint="warm"><div class="wrap install-grid">
    <ol class="steps">
      <li data-reveal><h3>Prep the surface</h3><p>Wash and dry the panels. Wipe each mounting point with the included prep wipes.</p></li>
      <li data-reveal><h3>Mount the strands</h3><p>Clips and tape matched to your panel material, over protective film where needed. Magnets won't hold on aluminum, fiberglass or plastic.</p></li>
      <li data-reveal><h3>Route and power</h3><p>Run leads along seams to a fused power system sized for the real load.</p></li>
      <li data-reveal><h3>Set up the controller</h3><p>Pair the remote or app, pick colors or effects. Mapping kits add a layout step.</p></li>
      <li data-reveal><h3>Remove and store</h3><p>Peel slowly, clean residue, coil strands on the included reels.</p></li>
    </ol>
    <div class="install-media">
      ${video('clip-mount-bmw')}${video('pixel-install-lambo')}
      <p class="ref-note">Reference footage. Shows other installers' methods, not ours.</p>
    </div>
  </div>
  <div class="wrap"><div class="safety" data-reveal>
    <h3>Power and safety</h3>
    <p>Thousands of LEDs draw real current. Every kit's power system will be designed and fused for its actual load and reviewed before sale. Never run hundreds of watts through a cigarette-lighter socket. We'll publish install times once we've timed real installs.</p>
  </div>
  <div class="cta-row page-cta"><a class="btn btn-glow" href="${pageUrl('build')}">Start your build</a></div></div>
  </section>`;
}

initMotion();
initReveals();
void state;
