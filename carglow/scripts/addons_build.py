"""Build Shopify draft CSV + fulfillment mapping for the three Car Glow add-ons.

Run: python3 scripts/addons_build.py   (from carglow/)
Writes docs/sourcing/shopify-addons-draft.csv and docs/sourcing/fulfillment-mapping.csv,
and prints a cost / margin table. Supplier prices were read on 2026-11-21 (ship-to US).
"""
import csv
import os

OUT = os.path.join(os.path.dirname(__file__), '..', 'docs', 'sourcing')
FEE_PCT, FEE_FIXED = 0.029, 0.30  # Shopify Payments card fee; check your plan

# Supplier lines. `est` = price from search results only, confirm at checkout.
SUP = {
    'UG_ALIBABA': dict(platform='Alibaba.com', supplier='Chengyi Technology (Shenzhen) · LumenX LX-LUL-E',
                      url='https://www.alibaba.com/product-detail/Hot-Sales-6-in-1-Car_1601575606477.html',
                      price=17.65, ship=0.00, eta='Dec 02–26 (Premium Alibaba.com Logistics, free)'),
    'EYE_ALIBABA': dict(platform='Alibaba.com', supplier='Guangzhou Houyi Optoelectronic · Lemombo',
                       url='https://www.alibaba.com/product-detail/2PCS-59512-Dynamic-Devil-Eyes-LED_1601363940177.html',
                       price=20.27, ship=1.00, eta='by Dec 09 (Alibaba.com Logistics standard, import charges included)'),
    'INT_ALIBABA': dict(platform='Alibaba.com', supplier='Guangzhou Flydee Electronic Technology',
                       url='https://www.alibaba.com/product-detail/1418-in-1-Led-Acrylic-Car_1601609886740.html',
                       price=15.00, ship=0.00, eta='Dec 01–24 standard (free) · Nov 30–Dec 20 premium (+$5.54)'),
    'FUSE_TAP': dict(platform='AliExpress', supplier='16PCS fuse tap kit (ATO/ATC, mini, low-profile mini, micro2 + fuses)',
                    url='https://www.aliexpress.com/item/1005012650805296.html',
                    price=10.26, ship=0.00, eta='est. 7–12 days', est=True),
    'T_TAP': dict(platform='AliExpress', supplier='Quick-splice T-tap connector kit, 30 sets (60 pcs)',
                 url='https://www.aliexpress.com/item/1005008987080538.html',
                 price=1.02, ship=0.00, eta='est. 7–12 days', est=True),
    'TRIM_TOOL': dict(platform='AliExpress', supplier='5-piece plastic trim removal tool kit',
                     url='https://www.aliexpress.com/item/1005012371372352.html',
                     price=1.83, ship=0.00, eta='est. 7–12 days', est=True),
    'VHB_TAPE': dict(platform='AliExpress', supplier='3M VHB double-sided automotive tape, 10 mm x 3 m',
                    url='https://www.aliexpress.com/w/wholesale-3m-vhb-tape-double-sided.html',
                    price=1.50, ship=0.00, eta='est. 7–12 days', est=True),
    'USB_ADAPTER': dict(platform='AliExpress', supplier='12–24V dual-USB 3.1A car socket adapter',
                       url='https://www.aliexpress.com/item/1005007393354459.html',
                       price=2.00, ship=0.00, eta='est. 7–12 days', est=True),
    'FIBER_KIEND': dict(platform='AliExpress', supplier='KIEND Official Store · flexible EL/fiber app kit (337 reviews, 2,000+ sold)',
                       url='https://www.aliexpress.us/item/3256808719830496.html',
                       price=16.69, ship=0.00, eta='Nov 30–Dec 04 (free shipping)'),
    'FOOTWELL_APP': dict(platform='AliExpress', supplier='4pcs footwell LED, app + cigarette plug (15,000+ sold)',
                        url='https://www.aliexpress.us/item/3256808849627738.html',
                        price=14.69, ship=0.00, eta='Nov 30–Dec 04 (free shipping)'),
}

UG_SIZE = {  # Car Glow size -> exact Alibaba "Specification" value, plus fit estimate
    'Small':  ('90CM*2+120CM*2', '4 strips: 2 x 120 cm sides, 2 x 90 cm front/rear', 'Est. 13–15 ft vehicles (compact, coupe)'),
    'Medium': ('90CM*2+150CM*2', '4 strips: 2 x 150 cm sides, 2 x 90 cm front/rear', 'Est. 15–17 ft vehicles (sedan, crossover)'),
    'Large':  ('60CM*4+150CM*2', '6 strips: 2 x 150 cm sides, 4 x 60 cm front/rear', 'Est. 17–20 ft vehicles (SUV, pickup)'),
}

# (sku, product handle, option values, retail, add-on price, lines=[(supplier key, exact variant, qty)], grams)
VARIANTS = []
for size, (spec, strips, _fit) in UG_SIZE.items():
    base = 72 if size == 'Large' else 59
    s = size[0]
    VARIANTS.append((f'CG-UG-{s}-LO', 'car-glow-app-underglow', (size, 'Lights Only'), base, base - 14,
                     [('UG_ALIBABA', f'Light Color: app · Specification: {spec}', 1)], 500))
    VARIANTS.append((f'CG-UG-{s}-CK', 'car-glow-app-underglow', (size, 'Complete Kit'), base + 15, base + 1,
                     [('UG_ALIBABA', f'Light Color: app · Specification: {spec}', 1),
                      ('FUSE_TAP', '16PCS kit', 1), ('VHB_TAPE', '10mm x 3m', 1)], 650))
VARIANTS += [
    ('CG-EYE-LO', 'car-glow-animated-eyes', ('Lights Only',), 59, 49,
     [('EYE_ALIBABA', 'Light Color: (59*12)*2', 1)], 614),
    ('CG-EYE-CK', 'car-glow-animated-eyes', ('Complete Kit',), 64, 54,
     [('EYE_ALIBABA', 'Light Color: (59*12)*2', 1), ('USB_ADAPTER', 'Dual USB 3.1A', 1)], 650),
    ('CG-INT-LO', 'car-glow-interior-kit', ('Lights Only',), 59, 45,
     [('INT_ALIBABA', 'Light Color: 18 IN 1 colorful smart light APP-SYMPHONY MODEL', 1)], 1500),
    ('CG-INT-CK', 'car-glow-interior-kit', ('Complete Kit',), 79, 65,
     [('INT_ALIBABA', 'Light Color: 18 IN 1 colorful smart light APP-SYMPHONY MODEL', 1),
      ('FUSE_TAP', '16PCS kit', 1), ('T_TAP', '30 sets', 1), ('TRIM_TOOL', '5 pcs', 1)], 1700),
    ('CG-FIB-DL', 'car-glow-fiber-dash-kit', ('Dash Lines',), 49, 39,
     [('FIBER_KIEND', 'Emitting Color: 6in1 8m Cigarette', 1)], 500),
    ('CG-FIB-FW', 'car-glow-fiber-dash-kit', ('Dash Lines + Footwell',), 79, 69,
     [('FIBER_KIEND', 'Emitting Color: 6in1 8m Cigarette', 1),
      ('FOOTWELL_APP', '4pcs 22 LEDs * 2pcs 1m (USB APP + Cigarette Lighter)', 1)], 800),
]

PRODUCTS = {
    'car-glow-app-underglow': dict(
        title='Car Glow App Underglow', type='Exterior Lighting', options=('Size', 'Package'),
        tags='car-glow, add-on, underglow, draft-needs-verification',
        seo='App-controlled underglow for your car, sized Small, Medium or Large.',
        body=('<p>[DRAFT: confirm before publishing. Supplier must confirm RGBIC flowing effect, power lead, fuse and mounting parts in writing.]</p>'
              '<p>Flowing color under your car, controlled from your phone, with music sync and scenes.</p>'
              '<h4>Sizes</h4><ul>'
              + ''.join(f'<li><strong>{k}</strong>: {v[1]}. {v[2]}.</li>' for k, v in UG_SIZE.items())
              + '</ul><h4>Lights Only</h4><p>Strips, app controller and power lead.</p>'
              '<h4>Complete Kit</h4><p>Lights Only plus an add-a-fuse tap set (fits standard, mini, low-profile mini and micro2 fuse boxes) and extra 3M automotive mounting tape.</p>'
              '<p><em>Vehicle fit is an estimate. Measure between your wheel wells before ordering. For parked display and private property. Check your local laws before using underglow on the road.</em></p>')),
    'car-glow-animated-eyes': dict(
        title='Car Glow Animated Eyes', type='Exterior Lighting', options=('Package',),
        tags='car-glow, add-on, windshield-eyes, draft-needs-verification',
        seo='Two animated LED eye panels for your windshield, app controlled.',
        body=('<p>[DRAFT: confirm before publishing. Supplier must confirm the set ships 2 panels + app/remote controller + USB cable.]</p>'
              '<p>Two flexible LED eye panels that blink, look around and scroll your own text. Control them from your phone or the remote.</p>'
              '<h4>Lights Only</h4><p>Two 59.5 x 12 cm (23.4 x 4.7 in) panels, app and remote controller, USB 5V power cable, suction-cup mounts.</p>'
              '<h4>Complete Kit</h4><p>Lights Only plus a 12V-to-dual-USB socket adapter, so it plugs into any car power outlet.</p>'
              '<p><em>Fit is an estimate: needs about 120 cm (47 in) of clear windshield width. For parked display only. Lights on a windshield can block your view and break local laws while driving.</em></p>')),
    'car-glow-interior-kit': dict(
        title='Car Glow Interior Kit', type='Interior Lighting', options=('Package',),
        tags='car-glow, add-on, interior, ambient, draft-needs-verification',
        seo='18-in-1 acrylic interior lighting: dash, door trim and footwell glow.',
        body=('<p>[DRAFT: confirm before publishing. Supplier must confirm the dashboard strip length and power leads in writing.]</p>'
              '<p>Flowing "symphony" color across your dash and door trim, with matching footwell, door-pocket and handle lights. App controlled.</p>'
              '<h4>Lights Only (18 in 1)</h4><p>Acrylic light strips including 4 x 75 cm door trim strips, 4 footwell lights, 4 door-pocket lights and 4 door-handle lights, a dashboard strip and the app controller.</p>'
              '<h4>Complete Kit</h4><p>Lights Only plus an add-a-fuse tap set, quick-splice connectors for the four door modules and a 5-piece trim tool set.</p>'
              '<p><em>Fit is an estimate: universal 12V, designed for 4-door cars. Each door module needs its own 12V feed from the door wiring. Professional install recommended.</em></p>')),
    'car-glow-fiber-dash-kit': dict(
        title='Car Glow Fiber Dash Kit', type='Interior Lighting', options=('Package',),
        tags='car-glow, add-on, interior, fiber-optic, draft-needs-verification',
        seo='Thin glowing lines around your gauges, screen and console, plus footwell glow. App controlled.',
        body=('<p>[DRAFT: confirm before publishing. Order 1 sample and check brightness; some buyers report weak light.]</p>'
              '<p>Thin, flexible light lines that tuck into the seams around your gauge cluster, screen and center console. Pick any color from your phone.</p>'
              '<h4>Dash Lines</h4><p>8 m of flexible fiber light in 6 pieces, app controller, remote and 12V car-socket plug.</p>'
              '<h4>Dash Lines + Footwell</h4><p>Everything in Dash Lines plus 4 footwell lights with their own app control and car-socket plug.</p>'
              '<p><em>Fit is an estimate: universal 12V, tucks into most dash seams. Fiber lines and footwell lights use separate apps.</em></p>')),
}


def landed(lines):
    return round(sum((SUP[k]['price'] + SUP[k]['ship']) * q for k, _, q in lines), 2)


def margin(price, cost):
    fee = price * FEE_PCT + FEE_FIXED
    return round(price - cost - fee, 2), round((price - cost - fee) / price * 100)


def main():
    os.makedirs(OUT, exist_ok=True)
    head = ['Handle', 'Title', 'Body (HTML)', 'Vendor', 'Type', 'Tags', 'Published',
            'Option1 Name', 'Option1 Value', 'Option2 Name', 'Option2 Value',
            'Variant SKU', 'Variant Grams', 'Variant Inventory Tracker', 'Variant Inventory Policy',
            'Variant Fulfillment Service', 'Variant Price', 'Variant Requires Shipping', 'Variant Taxable',
            'Variant Weight Unit', 'Cost per item', 'SEO Title', 'SEO Description', 'Status']
    rows, seen = [], set()
    for sku, handle, opts, price, _addon, lines, grams in VARIANTS:
        p = PRODUCTS[handle]
        first = handle not in seen
        seen.add(handle)
        r = dict.fromkeys(head, '')
        r.update({'Handle': handle, 'Variant SKU': sku, 'Variant Grams': grams, 'Variant Inventory Policy': 'continue',
                  'Variant Fulfillment Service': 'manual', 'Variant Price': f'{price:.2f}', 'Variant Requires Shipping': 'TRUE',
                  'Variant Taxable': 'TRUE', 'Variant Weight Unit': 'g', 'Cost per item': f'{landed(lines):.2f}',
                  'Option1 Value': opts[0], 'Option2 Value': opts[1] if len(opts) > 1 else ''})
        if first:
            r.update({'Title': p['title'], 'Body (HTML)': p['body'], 'Vendor': 'Car Glow', 'Type': p['type'],
                      'Tags': p['tags'], 'Published': 'FALSE', 'Option1 Name': p['options'][0],
                      'Option2 Name': p['options'][1] if len(p['options']) > 1 else '',
                      'SEO Title': f"{p['title']} · Car Glow", 'SEO Description': p['seo'], 'Status': 'draft'})
        rows.append(r)
    with open(os.path.join(OUT, 'shopify-addons-draft.csv'), 'w', newline='') as f:
        w = csv.DictWriter(f, fieldnames=head)
        w.writeheader()
        w.writerows(rows)

    mhead = ['Shopify SKU', 'Product', 'Package', 'Supplier platform', 'Supplier', 'Supplier link',
             'Exact supplier variant', 'Qty per order', 'Unit price', 'Shipping', 'Line cost', 'Delivery estimate', 'Price status']
    with open(os.path.join(OUT, 'fulfillment-mapping.csv'), 'w', newline='') as f:
        w = csv.writer(f)
        w.writerow(mhead)
        for sku, handle, opts, *_r, lines, _g in VARIANTS:
            for k, variant, q in lines:
                s = SUP[k]
                w.writerow([sku, PRODUCTS[handle]['title'], ' / '.join(opts), s['platform'], s['supplier'], s['url'], variant, q,
                            f"{s['price']:.2f}", f"{s['ship']:.2f}", f"{(s['price'] + s['ship']) * q:.2f}", s['eta'],
                            'estimate, confirm at checkout' if s.get('est') else 'read on listing 2026-11-21'])

    print(f"{'SKU':<11}{'cost':>8}{'price':>8}{'profit':>8}{'%':>5}{'add-on':>8}{'profit':>8}{'%':>5}")
    for sku, _h, _o, price, addon, lines, _g in VARIANTS:
        c = landed(lines)
        m, mp = margin(price, c)
        a, ap = margin(addon, c)
        print(f'{sku:<11}{c:>8.2f}{price:>8.2f}{m:>8.2f}{mp:>5}{addon:>8.2f}{a:>8.2f}{ap:>5}')


if __name__ == '__main__':
    main()
