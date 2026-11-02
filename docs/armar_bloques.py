# Paso 2: de todo.json (armar_catastro.py) + Plazas_CBA_*.geojson → carpeta catastro/v6 de la app.
# Uso: python armar_bloques.py todo.json carpeta_con_plazas_geojson salida/catastro/v6
import sys, json, collections, glob, os
from pyproj import Transformer
from shapely.geometry import Polygon
todo, plazas_dir, out = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(out, exist_ok=True)
t = json.load(open(todo))
B = 16   # 16 pedacitos de 250 m = bloque de 4 km
bloques = collections.defaultdict(dict)
for k, v in t.items():
    k = int(k); i, j = k // 100000, k % 100000
    bloques[(i // B, j // B)][str(i) + '_' + str(j)] = v
for (bi, bj), v in bloques.items():
    json.dump(v, open(os.path.join(out, 'b_%d_%d.json' % (bi, bj)), 'w'), separators=(',', ':'), ensure_ascii=False)
T = Transformer.from_crs(4326, 22174, always_xy=True)   # el GeoJSON de plazas está en geográficas POSGAR 94
pl = []
for f in sorted(glob.glob(os.path.join(plazas_dir, 'Plazas_CBA_*.geojson'))):
    for x in json.load(open(f))['features']:
        g = x['geometry']; polys = [g['coordinates']] if g['type'] == 'Polygon' else g['coordinates']
        for rings in polys:
            P = Polygon([T.transform(*c[:2]) for c in rings[0]]).simplify(0.2, preserve_topology=True)
            if P.is_empty or P.geom_type != 'Polygon': continue
            c = []
            for (a, b) in list(P.exterior.coords)[:-1]: c += [round((a + 0.162) * 100), round((b + 0.610) * 100)]   # → POSGAR 2007
            pr = x['properties']
            pl.append({'id': pr.get('id'), 'n': pr.get('nombre') or '', 'e': 'x' if 'edificado' in (pr.get('estado') or '') else 'a' if pr.get('capa_dxf') == 'VERDE-PLAZA-APROX' else 'v', 'c': c})
json.dump({'v': 6, 'plazas': pl}, open(os.path.join(out, 'plazas.json'), 'w'), separators=(',', ':'), ensure_ascii=False)
json.dump({'version': 6, 'tam': 250, 'bloque': 4000, 'faja': 4, 'datum': 'POSGAR 2007 (convertido de POSGAR 94: +0,162 m E, +0,610 m N)', 'fuente': 'Catastro Córdoba v6 (DXF de Ángel, 02/11/2026)', 'bloques': sorted('%d_%d' % k for k in bloques)}, open(os.path.join(out, 'indice.json'), 'w'), separators=(',', ':'), ensure_ascii=False)
print(len(bloques), 'bloques ·', len(pl), 'plazas')
