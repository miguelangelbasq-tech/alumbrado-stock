# Convierte el catastro de Córdoba (DXF v6, Gauss-Krüger POSGAR 94 faja 4) en pedacitos para la app (GK POSGAR 2007).
# Uso: python armar_catastro.py carpeta_dxf carpeta_salida TAM_M
import sys, json, os, collections, math
from ezdxf.addons import iterdxf
from shapely.geometry import LineString, box
DX, DY = 0.162, 0.610          # POSGAR 94 → 2007 (pyproj, constante en toda la ciudad al mm)
SRC, OUT, TAM = sys.argv[1], sys.argv[2], float(sys.argv[3])
CL = {  # capa del DXF → clase de la app
 'CAT-MANZANA':'m', 'CAT-PARCELA-EDIFICADO':'p', 'CAT-PARCELA-PH':'p', 'CAT-PARCELA-INTERNA':'p', 'CAT-PARCELA-SUPERPUESTA':'p', 'CAT-PARCELA-RURAL':'p',
 'CAT-PARCELA-BALDIO':'b', 'CALLE-EJE-CALLE':'e', 'CALLE-EJE-AVENIDA':'a', 'CALLE-EJE-AUTOPISTA':'a', 'CALLE-EJE-COLECTORA':'e', 'CALLE-EJE-SERVICIO':'e',
 'CALLE-EJE-PEATONAL':'e', 'CALLE-EJE-APROX':'e', 'VERDE-PLAZA':'v', 'VERDE-PLAZA-APROX':'v', 'BARRIO-LIMITE':'l', 'FFCC-VIAS':'f'}
TX = {'CALLE-TXT-NOMBRES':'c', 'CALLE-TXT-AVENIDAS':'c', 'VERDE-TXT-NOMBRES':'v', 'BARRIO-TXT-NOMBRES':'b', 'CAT-TXT-MANZANA':'m', 'COTA-ANCHO-CALLE':'a', 'CAT-TXT-PARCELA':'p'}
tiles = collections.defaultdict(lambda: collections.defaultdict(list))
cuenta = collections.Counter()
def key(x, y): return (int(math.floor(x / TAM)), int(math.floor(y / TAM)))
def poner(clase, coords):
    ls = LineString(coords)
    x0, y0, x1, y1 = ls.bounds
    for i in range(int(math.floor(x0 / TAM)), int(math.floor(x1 / TAM)) + 1):
        for j in range(int(math.floor(y0 / TAM)), int(math.floor(y1 / TAM)) + 1):
            b = box(i * TAM, j * TAM, (i + 1) * TAM, (j + 1) * TAM)
            g = ls if (x0 >= i*TAM and x1 <= (i+1)*TAM and y0 >= j*TAM and y1 <= (j+1)*TAM) else ls.intersection(b)
            if g.is_empty: continue
            partes = [g] if g.geom_type == 'LineString' else [p for p in getattr(g, 'geoms', []) if p.geom_type == 'LineString']
            for p in partes:
                if len(p.coords) < 2: continue
                ox, oy = i * TAM, j * TAM
                fl = []
                for (x, y) in p.coords: fl += [round((x - ox) * 100), round((y - oy) * 100)]
                tiles[(i, j)][clase].append(fl)
for f in sorted(os.listdir(SRC)):
    if not f.endswith('.dxf'): continue
    for e in iterdxf.modelspace(os.path.join(SRC, f)):
        L, t = e.dxf.layer, e.dxftype()
        if t == 'LWPOLYLINE' and L in CL:
            pts = [(p[0] + DX, p[1] + DY) for p in e.get_points()]
            if e.closed and pts and pts[0] != pts[-1]: pts.append(pts[0])
            if len(pts) >= 2: poner(CL[L], pts); cuenta[CL[L]] += 1
        elif t == 'TEXT' and L in TX:
            x, y = e.dxf.insert[0] + DX, e.dxf.insert[1] + DY
            s = (e.dxf.text or '').strip()
            if not s: continue
            i, j = key(x, y)
            tiles[(i, j)]['t'].append([TX[L], round((x - i*TAM) * 100), round((y - j*TAM) * 100), round(e.dxf.rotation or 0), s])
            cuenta['t' + TX[L]] += 1
    print(f, dict(cuenta), flush=True)
os.makedirs(OUT, exist_ok=True)
json.dump({k[0] * 100000 + k[1]: dict(v) for k, v in tiles.items()}, open(os.path.join(OUT, 'todo.json'), 'w'), separators=(',', ':'))
print('pedazos', len(tiles))
