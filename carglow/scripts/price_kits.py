"""Car Glow kit price calculator.

retail = ceil((delivered kit cost + target earnings + fixed fee) / (1 - fee rate))
Reads src/data/pricing-model.json and writes kit prices into catalog.json and shopify-bridge.json.
Run: python3 scripts/price_kits.py          (print table)
     python3 scripts/price_kits.py --write  (also update the data files)
"""
import json, math, sys
from pathlib import Path

D = Path(__file__).resolve().parent.parent / 'src' / 'data'
m = json.loads((D / 'pricing-model.json').read_text())
cat = json.loads((D / 'catalog.json').read_text())
rate, fixed = m['fee']['rate'], m['fee']['fixed']

def kit_cost(k):
    return k['pixels'] * m['pixelPrice'] + sum(v for n, v in k.items() if n != 'pixels')

prices = {}
rows = []
for tech, target in m['targets'].items():
    for size, k in m['kits'][tech].items():
        cost = kit_cost(k)
        retail = math.ceil((cost + target + fixed) / (1 - rate))
        keep = retail - cost - (retail * rate + fixed)
        prices[(tech, size)] = retail
        rows.append((tech, size, k['pixels'], cost, retail, keep))
for size, p in m['fixedPrices']['static'].items():
    prices[('static', size)] = p

print(f"{'kit':8}{'size':5}{'pixels':>8}{'kit cost':>10}{'retail':>9}{'you keep':>10}")
for t, s, px, c, r, k in rows:
    print(f"{t:8}{s:5}{px:>8,}{c:>10,.2f}{r:>9,}{k:>10.2f}")

final = {}
for v in cat['variants']:
    base = prices[(v['technology'], v['size'])]
    final[v['sku']] = base + (cat['underglow'][v['size']]['upcharge'] if v['underglow'] else 0)
print('\n' + '  '.join(f"{k} ${v:,}" for k, v in final.items()))

if '--write' in sys.argv:
    for v in cat['variants']:
        v['ownerTargetPrice'] = final[v['sku']]
    (D / 'catalog.json').write_text(json.dumps(cat, indent=2) + '\n')
    b = json.loads((D / 'shopify-bridge.json').read_text())
    for p in b['products'].values():
        for sku, v in p['variants'].items():
            v['plannedPriceUSD'] = final[sku]
    (D / 'shopify-bridge.json').write_text(json.dumps(b, indent=2) + '\n')
    print('wrote catalog.json and shopify-bridge.json')
