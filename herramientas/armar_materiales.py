#!/usr/bin/env python3
"""v131 · Arma la carpeta materiales/ que va en GitHub junto al index (hojas de material para el carrusel del pañol).

Uso:
  python3 armar_materiales.py <carpeta_de_hojas> <carpeta_salida> [--catalogo catalogo.json] [--todo]

- Toma las hojas vigentes mat_*.png (2520×1782) de la carpeta de hojas; ignora las viejas *_v1.*, *_vB.*, *_vC.* (cualquier _v<versión>).
- Por cada hoja escribe en <carpeta_salida>:
    <hoja>_plano.webp  mitad izquierda (el plano), ancho máx. 1400
    <hoja>_3d.webp     mitad derecha (el 3D) sin el rótulo de abajo, ancho máx. 1400
    <hoja>_hoja.webp   la hoja completa, ancho máx. 2000
  (calidad ≈ 80). Si el .webp ya está y es más nuevo que el .png, no lo rehace (salvo --todo).
- Arma <carpeta_salida>/indice.json:
    {"v": fecha, "codigos": {"2009": ["mat_borneras_1", …]}, "herramientas": [{"hoja": …, "palabras": […]}], "titulos": {hoja: título}}
  Los códigos salen del .svg de cada hoja (celdas de tabla con 4 cifras); el título, del rótulo «PIEZA».
- Avisa qué códigos del catálogo no tienen hoja (con --catalogo: lista [[codigo, desc, un], …] o [{codigo, desc}, …]).
Se puede volver a correr cada vez que haya hojas nuevas.
"""
import sys, os, re, json, glob, datetime, unicodedata

try:
    from PIL import Image
except ImportError:  # Pillow hace falta para los WebP
    os.system(f'{sys.executable} -m pip install -q Pillow')
    from PIL import Image

# Cortes en píxeles de la hoja de 2520×1782 (las hojas se dibujan en 1680×1188 y se exportan ×1,5)
ANCHO_REF, ALTO_REF = 2520, 1782
CORTE_PLANO = (20, 20, 1290, 1762)     # x 0–1290: el plano
CORTE_3D = (1304, 20, 2500, 1545)      # x 1290–2520 sin el rótulo de abajo (empieza en y ≈ 1550)
CALIDAD = 80
MAX_MITAD, MAX_HOJA = 1400, 2000

# Palabras para reconocer las herramientas del pañol (H-xxx) por su nombre, además de las del título de la hoja.
# En singular: la app las compara como comienzo de palabra («pinza» reconoce «Pinzas»). Gana la más específica
# («pinza amperometrica» le gana a «pinza»). Sacadas de los productos de cada hoja; sumá acá las hojas nuevas.
PALABRAS_HOJA = {
    'mat_epp_1': ['guante dielectrico', 'alfombra', 'cobertor'],
    'mat_epp_2': ['guante', 'anteojo', 'tapon', 'protector auditivo'],
    'mat_epp_3': ['arnes', 'cabo de vida', 'cinturon', 'cola de amarre', 'altura'],
    'mat_herramientas_1': ['pinza', 'alicate', 'cuchillo'],
    'mat_herramientas_2': ['corta cable', 'cortacable', 'crimpeadora', 'pinza alicate corta'],
    'mat_herramientas_3': ['destornillador'],
    'mat_herramientas_4': ['llave', 'francesa', 'allen', 'combinada'],
    'mat_herramientas_5': ['martillo', 'maza', 'puntero', 'punta de hierro'],
    'mat_herramientas_6': ['fratacho', 'hacha'],
    'mat_herramientas_7': ['disco'],
    'mat_herramientas_8': ['mecha', 'cepillo'],
    'mat_herramientas_9': ['caja de herramienta', 'organizador', 'estuche'],
    'mat_herramientas_10': ['pasacable', 'pistola', 'cinta de papel'],
    'mat_herramientas_11': ['pila', 'caloventor', 'electrodo'],
    'mat_instrumentos_1': ['pinza amperometrica', 'detector de tension'],
    'mat_instrumentos_2': ['probador de tension', 'busca polo', 'buscapolo'],
}
STOP = set('para con sin por del los las una uno que tipo y de la el en a o al x mm cm m'.split())
# palabras del título que no sirven para reconocer una herramienta (son de muchas)
GENERICAS = set('trabajo equipo equipos juego juegos aislados aislado aislante cable cables corta varios tipos medida mano corte desbaste tension cabo alambre papel herramientas cajas criquet francesas combinada'.split())


def singular(w):
    return w[:-2] if re.search(r'(or|on)es$', w) else w[:-1] if w.endswith('s') and not w.endswith('ss') else w


def norm(s):
    s = unicodedata.normalize('NFD', str(s or '')).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', ' ', s).strip()


def a_webp(im, caja, ancho_max, destino):
    sx, sy = im.width / ANCHO_REF, im.height / ALTO_REF
    if caja:
        im = im.crop((round(caja[0] * sx), round(caja[1] * sy), round(caja[2] * sx), round(caja[3] * sy)))
    if im.width > ancho_max:
        im = im.resize((ancho_max, round(im.height * ancho_max / im.width)), Image.LANCZOS)
    im.save(destino, 'WEBP', quality=CALIDAD, method=6)


def leer_svg(ruta):
    """Devuelve (códigos, título) leídos del SVG de la hoja."""
    if not os.path.exists(ruta):
        return [], ''
    t = open(ruta, encoding='utf-8').read()
    textos = [(float(m.group(1)), float(m.group(2)), int(float(m.group(3))), m.group(4)) for m in
              re.finditer(r'<text x="([\d.]+)" y="([\d.]+)" font-size="([\d.]+)"[^>]*>([^<]*)</text>', t)]
    cuatro = [(x, s) for (x, y, f, s) in textos if re.fullmatch(r'[1-9]\d{3}', s.strip()) and int(s) % 1000]
    porx = {}
    for x, s in cuatro:
        porx.setdefault(round(x), []).append(s.strip())
    cods = []
    for x, s in cuatro:   # celda de tabla = varios códigos en la misma columna (o uno solo si es la única tabla)
        if len(porx[round(x)]) >= 2 or len(cuatro) == 1:
            if s.strip() not in cods:
                cods.append(s.strip())
    tit = [(y, s) for (x, y, f, s) in textos if 1060 < x < 1400 and y > 1040 and f >= 18]
    titulo = ' '.join(s.strip() for y, s in sorted(tit))
    return cods, titulo


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if len(args) < 2:
        print(__doc__); sys.exit(1)
    hojas, salida = args[0], args[1]
    todo = '--todo' in sys.argv
    cat = None
    if '--catalogo' in sys.argv:
        cat = json.load(open(sys.argv[sys.argv.index('--catalogo') + 1], encoding='utf-8'))
    os.makedirs(salida, exist_ok=True)
    pngs = sorted(p for p in glob.glob(os.path.join(hojas, 'mat_*.png'))
                  if not re.search(r'_v[0-9A-Z]\w*\.png$', os.path.basename(p)))
    codigos, titulos, herr, hechas = {}, {}, [], 0
    for png in pngs:
        h = os.path.basename(png)[:-4]
        outs = [(CORTE_PLANO, MAX_MITAD, f'{h}_plano.webp'), (CORTE_3D, MAX_MITAD, f'{h}_3d.webp'), (None, MAX_HOJA, f'{h}_hoja.webp')]
        im = None
        for caja, mx, nom in outs:
            dest = os.path.join(salida, nom)
            if not todo and os.path.exists(dest) and os.path.getmtime(dest) >= os.path.getmtime(png):
                continue
            if im is None:
                im = Image.open(png).convert('RGB')
            a_webp(im, caja, mx, dest); hechas += 1
        cods, tit = leer_svg(png[:-4] + '.svg')
        titulos[h] = tit or h.replace('mat_', '').replace('_', ' ')
        for c in cods:
            codigos.setdefault(c, []).append(h)
        fam = re.match(r'mat_(herramientas|epp|instrumentos)_', h)
        if fam:
            pal = list(PALABRAS_HOJA.get(h, []))
            for w in norm(tit).split():
                if len(w) >= 4 and w not in STOP and w not in GENERICAS and not w.isdigit() and not re.search(r'\d', w):
                    w = singular(w)
                    if w not in pal and not any(w == x.split()[0] for x in pal):
                        pal.append(w)
            herr.append({'hoja': h, 'palabras': pal or [norm(tit)]})
    vig = {os.path.basename(p)[:-4] for p in pngs}
    for f in glob.glob(os.path.join(salida, 'mat_*.webp')):   # lo de hojas que ya no están (o versiones viejas) se borra
        if re.sub(r'_(plano|3d|hoja)\.webp$', '', os.path.basename(f)) not in vig:
            os.remove(f); print('borrado (ya no es vigente):', os.path.basename(f))
    ind = {'v': datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M'),
           'codigos': dict(sorted(codigos.items())), 'herramientas': herr, 'titulos': titulos}
    json.dump(ind, open(os.path.join(salida, 'indice.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print(f'{len(pngs)} hojas · {hechas} WebP nuevos · {len(codigos)} códigos con hoja · {len(herr)} hojas de herramientas')
    if cat is not None:
        filas = [(str(x[0]), x[1]) if isinstance(x, list) else (str(x.get('codigo')), x.get('desc', '')) for x in cat]
        sin = [(c, d) for c, d in filas if c not in codigos]
        print(f'Códigos del catálogo SIN hoja ({len(sin)} de {len(filas)}):')
        for c, d in sin:
            print(f'  {c}  {d}')
        otros = sorted(set(codigos) - {c for c, _ in filas})
        if otros:
            print('Ojo: códigos en las hojas que no están en el catálogo:', ' '.join(otros))


if __name__ == '__main__':
    main()
