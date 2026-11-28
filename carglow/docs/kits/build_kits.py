"""Car Glow vehicle kit calculator (2026-11-28).

Area model, calibrated on documented installs:
  top   = L*W*k_top           (hood/roof/trunk minus glass)
  sides = 2*L*(0.5*H)*0.85     (body below the beltline, minus wheel arches)
  ends  = 2*W*(0.35*H)         (bumpers/fascias)
Calibration (full-body, ~220 LEDs/m2): MINI 2,000 (Festive Lights), Huracan 2,000 (A Chick Drives It),
F-150 ~4,000 (BuiltRight), Camaro 3,000 (owner bought 3,000, finished with spare).
All costs are USD. E = estimate, V = verified this project.
"""
import csv, math, json
from pathlib import Path
OUT = Path(__file__).resolve().parent

VEHICLES = [  # category, example, L, W, H (m), k_top
 ('Compact car', 'MINI Cooper (F56)', 3.850, 1.727, 1.432, 0.45),
 ('Coupe', 'Ford Mustang (S650)', 4.811, 1.916, 1.397, 0.45),
 ('Sports car', 'Lamborghini Huracan', 4.520, 1.933, 1.165, 0.45),
 ('Sedan', 'Toyota Camry (XV80)', 4.915, 1.840, 1.445, 0.45),
 ('Hatchback', 'VW Golf Mk8', 4.284, 1.789, 1.456, 0.45),
 ('Compact SUV', 'Tesla Model Y', 4.751, 1.921, 1.624, 0.50),
 ('Large SUV', 'Chevrolet Tahoe', 5.352, 2.058, 1.927, 0.50),
 ('Pickup', 'Ford F-150 SuperCrew 5.5 ft', 5.890, 2.029, 1.961, 0.45),
 ('Large/extended pickup', 'Ford F-250 Crew 8 ft', 6.730, 2.030, 2.050, 0.45),
]
COVERAGE = {'Standard': 120, 'Full-body': 220, 'High-density graphic': 400}  # LEDs per m2

FEE = lambda p: p*0.029 + 0.30
def retail_for_margin(cost, m): return math.ceil((cost + 0.30) / (1 - 0.029 - m)) - 0.01
def retail_for_keep(cost, keep): return math.ceil((cost + keep + 0.30) / 0.971)

# Lighting systems. price per pack, LEDs per pack, spacing m, W per LED (max), pack label, status
SYSTEMS = {
 'Classic (fixed-color fairy string)': dict(pack='Ollny 1000-LED multicolor, 328 ft, 29 V adapter, 8 modes (B09YHPZ28V)', leds=1000, price=30.00, src='E (creators paid $30-32; Hezbjiti equivalent $27.19)', spacing=0.10, w=0.012, ctrl=None, mapping='No (not individually addressable)'),
 'RGB effects (WS2811 seed + app controller)': dict(pack='KTRLIGHT WS2811 seed pixels, 5 cm (direct quote $80/1,000)', leds=1000, price=80.00, src='V (KTRLIGHT quote)', spacing=0.05, w=0.10, ctrl=('Bluetooth/Wi-Fi WS2811 app controller', 1000, 15.00), mapping='Effects only'),
 'Graphic Pro (WS2811 seed + WLED)': dict(pack='KTRLIGHT WS2811 seed pixels, 5 cm (direct quote $80/1,000)', leds=1000, price=80.00, src='V (KTRLIGHT quote)', spacing=0.05, w=0.10, ctrl=('GLEDOPTO ESP32 WLED controller (manual map, GIF upload)', 1000, 25.00), mapping='Yes, manual map in WLED; GIF/image upload'),
 'Graphic Elite (Twinkly Dots 400)': dict(pack='Twinkly Dots 400 RGB Gen II, 20 m, 24 V/1 A adapter (TWD400STP)', leds=400, price=159.99, src='V (US retail list; $134.99 on promo)', spacing=0.05, w=0.06, ctrl=('built into each Dots set', 400, 0.0), mapping='Yes, camera mapping in Twinkly app; GIF import'),
}

def area(L, W, H, k):
    top = L*W*k; sides = 2*L*(0.5*H)*0.85; ends = 2*W*(0.35*H)
    return top + sides + ends

rows = []
for cat, ex, L, W, H, k in VEHICLES:
    a = area(L, W, H, k)
    for cov, dens in COVERAGE.items():
        need = a * dens
        for sysname, s in SYSTEMS.items():
            if cov == 'High-density graphic' and 'Classic' in sysname: continue
            if cov == 'Standard' and 'Graphic' in sysname: continue
            packs = math.ceil(need / s['leds']); leds = packs * s['leds']
            wire = leds * s['spacing']
            ctrls = 0 if s['ctrl'] is None else (packs if s['ctrl'][2] == 0 else math.ceil(leds / s['ctrl'][1]))
            ctrl_cost = 0 if s['ctrl'] is None else ctrls * s['ctrl'][2]
            # power: fairy strings run near full; pixel kits capped (WLED/app brightness limit) to 35% of max
            max_w = leds * s['w']; run_w = max_w if 'Classic' in sysname else max_w * 0.35
            draw12 = run_w / 0.85 / 12  # amps at 12 V through inverter/converter
            if draw12 <= 12:
                power, pcost = 'Socket inverter 300 W (BESTEK MRI3013BU class) + switched power strip', 30.0 + 10.0
            elif draw12 <= 25:
                power, pcost = 'Battery-clamp inverter 500 W with 40 A fuse (engine running) + power strip', 60.0 + 10.0
            else:
                power, pcost = 'Portable power station ~500 Wh (not the car battery)', 250.0
            if 'Graphic Elite' in sysname and power.startswith('Socket'):
                pcost += 0  # Dots use their own 24 V adapters into the inverter strip
            pieces = math.ceil(wire / 0.30)  # one tape/tab every 30 cm (Middleton: every foot)
            tape_m = pieces * 0.05 * 1.5     # 5 cm per piece, +50% for re-taping
            tape_rolls = max(1, math.ceil(tape_m / 54.8))  # 1.41 in x 60 yd painter's tape
            tabs = pieces  # residue-free tabs as alternative to tape (same count)
            film = round(a * 0.25, 1)  # m2 of removable vinyl strips under crossings/high-wear points
            mount_cost = tape_rolls * 8.0 + math.ceil(tabs / 100) * 6.0 + film * 6.0 + 4.0  # +ties
            wiring = 15.0 if 'Classic' not in sysname else 8.0  # extension leads, connectors, fuse tap/lead
            if 'Graphic Pro' in sysname or 'RGB effects' in sysname: wiring += 20.0  # 12V->5V converters/injection leads
            freight = 0.0 if 'Classic' in sysname or 'Elite' in sysname else round(leds / 1000 * 13.5, 2)
            pack_cost = packs * s['price']
            cost = round(pack_cost + ctrl_cost + pcost + mount_cost + wiring + freight + 5.0, 2)  # +box & printed guide
            r40 = retail_for_margin(cost, 0.40)
            profit = round(r40 - cost - FEE(r40), 2)
            hrs = {'Compact car': 5, 'Coupe': 6, 'Sports car': 6, 'Sedan': 7, 'Hatchback': 6, 'Compact SUV': 8, 'Large SUV': 10, 'Pickup': 10, 'Large/extended pickup': 12}[cat]
            if 'Graphic' in sysname: hrs += 2
            rows.append(dict(category=cat, example=ex, coverage=cov, system=sysname, area_m2=round(a, 1), leds=leds,
                packs=packs, pack=s['pack'], wire_m=round(wire), controllers=ctrls, max_watts=round(max_w), run_watts=round(run_w),
                amps_12v=round(draw12, 1), power_system=power, tape_rolls=tape_rolls, tabs=tabs, film_m2=film,
                mapping=s['mapping'], light_cost=round(pack_cost, 2), kit_cost=cost, retail_40pct=r40, profit=profit,
                margin_pct=round(profit / r40 * 100, 1), install_hours=hrs, difficulty='Moderate' if 'Classic' in sysname else 'High',
                light_price_source=s['src']))

with open(OUT / 'vehicle-kit-matrix.csv', 'w', newline='') as f:
    w = csv.DictWriter(f, fieldnames=list(rows[0])); w.writeheader(); w.writerows(rows)
json.dump(rows, open(OUT / 'vehicle-kit-matrix.json', 'w'), indent=1)
for r in rows:
    if r['coverage'] == 'Full-body':
        print(f"{r['category']:22} {r['system'][:30]:30} {r['leds']:>6} {r['packs']:>3}pk {r['amps_12v']:>5}A  cost ${r['kit_cost']:>8}  retail ${r['retail_40pct']:>8}  {r['power_system'][:22]}")
print(len(rows), 'rows')
