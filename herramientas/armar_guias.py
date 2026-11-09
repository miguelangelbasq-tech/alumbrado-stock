#!/usr/bin/env python3
"""Arma la carpeta guias/ que va en GitHub junto al index (imágenes nuevas de la hoja «Guías»).

Uso:
  python3 armar_guias.py <hojas> <pasos> <ORIGINAL.html> <materiales/indice.json> <salida> [--todo]

  <hojas>     carpeta con las hojas de tipos constructivos (ap_*.png / tc_prfv_*.png 2520×1782 + su .svg)
  <pasos>     carpeta con los PDF «<guia>_paso_a_paso.pdf» (A4 apaisado)
  <ORIGINAL>  el ORIGINAL de la app (de ahí salen los ids: GUIAS_OBRA, TIPOS_CONST_DIB, NORMAS_FICHAS,
              FAMILIAS_MAT y LAMINAS)
  <materiales/indice.json>  el índice de la carpeta materiales/ (para «familias» y «laminas»)
  <salida>    la carpeta guias/ a publicar

Escribe en <salida>:
  tipos/<hoja>_plano.webp  mitad izquierda (el plano), ancho máx. 1400   (mismos cortes que armar_materiales.py)
  tipos/<hoja>_3d.webp     el 3D de arriba a la derecha, hasta la «LISTA DE MATERIALES», ancho máx. 1400
  tipos/<hoja>_hoja.webp   la hoja completa, ancho máx. 2000
  pasos/<guia>.pdf         copia del PDF
  pasos/<guia>_p<N>.webp   cada hoja del PDF, 1600 de ancho (pdftoppm)
  pasos/<guia>_tapa.webp   recorte 600×340 para la tarjeta (el 3D de «Así queda» o del paso 1)
  indice.json              {v, tipos:{idApp: hoja}, titulosTipos:{hoja: título}, pasos:{idGuia:{pdf, hojas, tapa, titulo}},
                            familias:{idFamilia:[mat_…]}, grupos:{clave: nombre},
                            hojasMat:[{hoja, titulo, grupo, codigos, familias (de la app), familia (id o «nueva:<x>»)}], laminas:{idLamina:{tipo:[ids], paso:[ids], mat:[hojas], parcial}}}
Sin --todo no rehace los WebP que ya están y son más nuevos que su fuente. Se puede volver a correr.
Necesita Pillow y pdftoppm (poppler-utils).
"""
import sys, os, re, json, glob, shutil, subprocess, tempfile, datetime

try:
    from PIL import Image
except ImportError:
    os.system(f'{sys.executable} -m pip install -q Pillow')
    from PIL import Image

ANCHO_REF, ALTO_REF = 2520, 1782       # las hojas se dibujan en 1680×1188 (SVG) y se exportan ×1,5
ESC_SVG = 1.5
CORTE_PLANO = (20, 20, 1290, 1762)
CORTE_3D = (1304, 20, 2500, 1545)      # el de materiales; acá el fondo se sube hasta la «LISTA DE MATERIALES»
CALIDAD, CALIDAD_PASOS = 80, 84
MAX_MITAD, MAX_HOJA, ANCHO_PASO = 1400, 2000, 1600
TAPA = (600, 340)

# Grupos de Guías › Materiales: la primera cifra del código (CLAUDE.md §11.9) + herramientas y EPP/instrumentos
GRUPOS = {'1': 'Cables', '2': 'Borneras y terminales', '3': 'Protección y comando', '4': 'Herrajes y morsetería',
          '5': 'Caños', '6': 'Columnas, vínculos y luminarias', '7': 'Puesta a tierra', '8': 'Obra civil',
          '9': 'Varios', 'herramientas': 'Herramientas', 'epp': 'EPP e instrumentos'}
GRUPOS_ORDEN = list(GRUPOS)

# Tapa de cada guía (600×340), elegida mirando cada una:
#   ('tipo', hoja, cx, cy, ancho)  recorte del 3D de esa hoja de tipo constructivo (fracciones del recuadro 3D)
#   ('pdf', hoja_del_pdf, cx, cy, ancho)  recorte de esa hoja del PDF (-1 = la última), en fracciones de la página
# El alto sale de la proporción 600×340. Si cambia la hoja o el PDF, revisalos.
TAPAS = {
    'acometida_aerea':      ('tipo', 'ap_t_019', 0.36, 0.72, 0.72),
    'caja_columna_prfv':    ('tipo', 'tc_prfv_01', 0.47, 0.45, 0.82),
    'fundacion_prfv':       ('tipo', 'ap_tc_003a', 0.52, 0.58, 0.96),
    'montaje_prfv':         ('tipo', 'ap_c_033a', 0.50, 0.58, 1.0),
    'morseto_pkd14':        ('pdf', -1, 0.175, 0.39, 0.32),
    'puesta_tierra':        ('tipo', 'ap_tc_005', 0.50, 0.62, 1.0),
    'tendido_aereo_barrio': ('tipo', 'ap_tc_024', 0.50, 0.62, 1.0),
    'unidad_aerea_barrio':  ('tipo', 'ap_tc_055', 0.50, 0.62, 1.0),
    'zanjeo_tendido':       ('tipo', 'ap_tc_001', 0.55, 0.55, 1.0),
}

# Láminas viejas (window.LAMINAS, SVG gzip+base64) → hoja nueva equivalente. parcial = cubre solo una parte.
LAMINAS = {
    'col_aerea_h1':   {'tipo': ['AP-TC-006', 'AP-C-005'], 'parcial': True},
    'col_aerea_h2':   {'paso': ['morseto_pkd14', 'unidad_aerea_barrio'], 'mat': ['mat_morseto_1'], 'parcial': True},
    'tendido':        {'paso': ['tendido_aereo_barrio'], 'mat': ['mat_morseteria_aerea_1']},
    'lum_poste':      {'tipo': ['AP-TC-055'], 'paso': ['unidad_aerea_barrio']},
    'transicion':     {'tipo': ['AP-TC-024'], 'paso': ['tendido_aereo_barrio']},
    'tablero_barrio': {'tipo': ['AP-T-019', 'AP-TC-024'], 'mat': ['mat_tablero_3'], 'parcial': True},
    'apoyo_pat':      {'tipo': ['AP-TC-004'], 'paso': ['tendido_aereo_barrio'], 'mat': ['mat_apoyos_2'], 'parcial': True},
    'prfv_fund':      {'tipo': ['AP-TC-003-A'], 'paso': ['fundacion_prfv'], 'mat': ['mat_fundacion_1']},
    'prfv_montaje':   {'tipo': ['AP-C-033-A', 'AP-C-033-B'], 'paso': ['montaje_prfv']},
    'caja_prfv':      {'tipo': ['TC-PRFV-01', 'TC-PRFV-02'], 'paso': ['caja_columna_prfv']},
    'zanja':          {'tipo': ['AP-TC-001'], 'paso': ['zanjeo_tendido']},
    'cruce':          {'tipo': ['AP-TC-002', 'AP-TC-022']},
    'tablero_plaza':  {'tipo': ['AP-T-007', 'AP-T-008', 'AP-T-012', 'AP-T-018'], 'paso': ['acometida_aerea'], 'mat': ['mat_tablero_1', 'mat_tablero_2']},
    'base_nivel':     {'tipo': ['AP-TC-007']},
    'f_morsetos':     {'mat': ['mat_morseto_1', 'mat_morseto_2'], 'paso': ['morseto_pkd14']},
    'f_herrajes':     {'mat': ['mat_morseteria_aerea_1', 'mat_morseteria_aerea_2', 'mat_herrajes_1', 'mat_herrajes_2', 'mat_herrajes_4', 'mat_fleje_1']},
    'f_pat':          {'mat': ['mat_jabalina_1', 'mat_jabalina_2', 'mat_accesorios_pat_1', 'mat_accesorios_pat_2', 'mat_accesorios_pat_3'], 'paso': ['puesta_tierra']},
    'f_columna':      {'mat': ['mat_columna_metalica_1', 'mat_vinculos_1', 'mat_vinculos_2'], 'tipo': ['AP-C-005', 'AP-C-008']},
    'f_prfv':         {'mat': ['mat_columna_prfv_1'], 'tipo': ['AP-C-033-A', 'AP-C-033-B']},
    'f_tablero1':     {'mat': ['mat_canal_riel_1', 'mat_termomagneticas_1', 'mat_comando_1', 'mat_tablero_2']},
    'f_tablero2':     {'mat': ['mat_fusibles_1', 'mat_fusibles_2', 'mat_borneras_1', 'mat_tablero_3']},
    'f_conex':        {'mat': ['mat_terminales_1', 'mat_terminales_2', 'mat_terminales_3', 'mat_prensacables_1', 'mat_empalmes_1', 'mat_empalmes_2', 'mat_empalmes_3']},
    'f_lumin':        {'mat': ['mat_luminaria_led_1', 'mat_fotocontrol_1', 'mat_fotocontrol_2']},
}


def nuevo(dest, fuente, todo):
    return todo or not os.path.exists(dest) or os.path.getmtime(dest) < os.path.getmtime(fuente)


def a_webp(im, caja, ancho_max, destino, calidad=CALIDAD):
    sx, sy = im.width / ANCHO_REF, im.height / ALTO_REF
    if caja:
        im = im.crop((round(caja[0] * sx), round(caja[1] * sy), round(caja[2] * sx), round(caja[3] * sy)))
    if im.width > ancho_max:
        im = im.resize((ancho_max, round(im.height * ancho_max / im.width)), Image.LANCZOS)
    im.save(destino, 'WEBP', quality=calidad, method=6)


def textos_svg(ruta):
    if not os.path.exists(ruta):
        return []
    t = open(ruta, encoding='utf-8').read()
    return [(float(a), float(b), float(c), d, e) for a, b, c, d, e in
            re.findall(r'<text x="([\d.]+)" y="([\d.]+)" font-size="([\d.]+)"([^>]*)>([^<]*)</text>', t)]


def leer_hoja(svg):
    """(código AP-…, título, y de la «LISTA DE MATERIALES» en px de la PNG o None)."""
    tx = textos_svg(svg)
    cod = next((s.strip() for x, y, f, a, s in tx if y > 1030 and re.fullmatch(r'(AP|TC)-[A-Z]+-\d+(-[A-Z])?', s.strip())), '')
    tit = [s.strip() for x, y, f, a, s in sorted(tx, key=lambda z: z[1])
           if y > 1040 and f >= 15 and 'Mono' not in a and x > 860 and s.strip() and s.strip() != cod]
    lista = [y for x, y, f, a, s in tx if x > 860 and y > 300 and re.match(r'(LISTA DE MATERIALES|ELEMENTOS)', s.strip().upper())]
    return cod, ' '.join(tit), (min(lista) * ESC_SVG if lista else None)


def id_de_hoja(h):
    """ap_c_033a → AP-C-033-A · tc_prfv_01 → TC-PRFV-01."""
    m = re.fullmatch(r'(ap_[a-z]+|tc_prfv)_(\d+)([a-z]?)', h)
    if not m:
        return None
    return (m.group(1).upper().replace('_', '-') + '-' + m.group(2) + ('-' + m.group(3).upper() if m.group(3) else ''))


def leer_app(ruta):
    t = open(ruta, encoding='utf-8').read()
    guias = {m.group(1): m.group(2) for m in re.finditer(r'\{ id: "([a-z0-9_]+)", titulo: "([^"]*)", tareas:', t)}
    normas = {}
    for m in re.finditer(r'\{ id: "((?:AP|TC)-[A-Z]+-[0-9]+(?:-[A-Za-z])?)",(?: alias: "([^"]*)",)? grupo: "([^"]*)", tit: "([^"]*)"', t):
        normas[m.group(1)] = {'tit': m.group(4), 'alias': m.group(2) or ''}
    dib = sorted(set(re.findall(r'\b[a-zA-Z]{1,3}\["((?:AP|TC)-[A-Z]+-[0-9]+(?:-[A-Z])?)"\] =', t)))
    fams = [(m.group(1), m.group(2), [c.strip() for c in m.group(3).split(',') if c.strip()]) for m in
            re.finditer(r'\{ id: "([^"]+)", titulo: "([^"]*)",(?: [a-z]+: [^,]*,)*? codigos: \[([^\]]*)\]', t)]
    lams = [(m.group(1), m.group(2), m.group(3)) for m in
            re.finditer(r'\{ id: "([a-z0-9_]+)", ref: "([^"]*)", tit: "([^"]*)", grupo:', t)]
    return guias, normas, dib, fams, lams


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if len(args) < 5:
        print(__doc__); sys.exit(1)
    d_hojas, d_pasos, original, mat_indice, salida = args
    todo = '--todo' in sys.argv
    guias, normas, dib, fams, lams = leer_app(original)
    ids_tipos = sorted(set(dib) | set(normas))
    mat = json.load(open(mat_indice, encoding='utf-8'))
    os.makedirs(os.path.join(salida, 'tipos'), exist_ok=True)
    os.makedirs(os.path.join(salida, 'pasos'), exist_ok=True)
    hechas = 0

    # 1) Tipos constructivos
    pngs = sorted(p for p in glob.glob(os.path.join(d_hojas, '*.png'))
                  if re.fullmatch(r'(ap_[a-z]+_\d+[a-z]?|tc_prfv_\d+)\.png', os.path.basename(p)))
    tipos, titulos, sin_tipo, avisos, cortes3d = {}, {}, [], [], {}
    for png in pngs:
        h = os.path.basename(png)[:-4]
        cod, tit, ylista = leer_hoja(png[:-4] + '.svg')
        idh = cod or id_de_hoja(h)
        if cod and cod != id_de_hoja(h):
            avisos.append(f'{h}: el rótulo dice {cod}')
        titulos[h] = tit
        c3d = CORTE_3D if not ylista else (CORTE_3D[0], CORTE_3D[1], CORTE_3D[2], int(ylista - 30))
        cortes3d[h] = (png, c3d)
        im = None
        for caja, mx, suf in ((CORTE_PLANO, MAX_MITAD, 'plano'), (c3d, MAX_MITAD, '3d'), (None, MAX_HOJA, 'hoja')):
            dest = os.path.join(salida, 'tipos', f'{h}_{suf}.webp')
            if nuevo(dest, png, todo):
                im = im or Image.open(png).convert('RGB')
                a_webp(im, caja, mx, dest); hechas += 1
        if idh in ids_tipos:
            tipos[idh] = h
        else:
            sin_tipo.append(f'{h} ({idh})')
    # alias de la app que apuntan a un tipo con hoja (AP-CC-014-A → ap_cc_014 …), sin pisar un id propio
    for i, n in normas.items():
        if i in tipos:
            for a in re.split(r'\s*·\s*', n['alias']):
                if re.fullmatch(r'(AP|TC)-[A-Z]+-[0-9]+(-[A-Z])?', a) and a not in tipos and a not in ids_tipos:
                    tipos[a] = tipos[i]

    # 2) Pasos (PDF)
    pasos, tmp = {}, tempfile.mkdtemp()
    for pdf in sorted(glob.glob(os.path.join(d_pasos, '*_paso_a_paso.pdf'))):
        g = os.path.basename(pdf)[:-len('_paso_a_paso.pdf')]
        shutil.copy2(pdf, os.path.join(salida, 'pasos', f'{g}.pdf'))
        info = subprocess.run(['pdfinfo', pdf], capture_output=True, text=True).stdout
        n = int(re.search(r'Pages:\s+(\d+)', info).group(1))
        quedan = [k for k in range(1, n + 1) if nuevo(os.path.join(salida, 'pasos', f'{g}_p{k}.webp'), pdf, todo)]
        tapa_dest = os.path.join(salida, 'pasos', f'{g}_tapa.webp')
        if quedan or nuevo(tapa_dest, pdf, todo):
            subprocess.run(['pdftoppm', '-png', '-scale-to-x', str(ANCHO_PASO), '-scale-to-y', '-1', pdf, os.path.join(tmp, g)], check=True)
            pags = sorted(glob.glob(os.path.join(tmp, g + '-*.png')), key=lambda p: int(re.search(r'-(\d+)\.png$', p).group(1)))
            for k, p in enumerate(pags, 1):
                if k in quedan:
                    Image.open(p).convert('RGB').save(os.path.join(salida, 'pasos', f'{g}_p{k}.webp'), 'WEBP', quality=CALIDAD_PASOS, method=6); hechas += 1
            fuente, ref, cx, cy, w = TAPAS.get(g, ('pdf', -1, 0.735, 0.33, 0.42))
            if fuente == 'tipo' and ref in cortes3d:
                png, c = cortes3d[ref]
                im = Image.open(png).convert('RGB').crop(c)
            else:
                subprocess.run(['pdftoppm', '-png', '-scale-to-x', '2600', '-scale-to-y', '-1', '-f', str(n if ref == -1 else ref),
                                '-l', str(n if ref == -1 else ref), pdf, os.path.join(tmp, g + '_t')], check=True)
                im = Image.open(glob.glob(os.path.join(tmp, g + '_t-*.png'))[0]).convert('RGB')
            ww = w * im.width; hh = ww * TAPA[1] / TAPA[0]
            x0 = min(max(0, cx * im.width - ww / 2), im.width - ww); y0 = min(max(0, cy * im.height - hh / 2), im.height - hh)
            im.crop((round(x0), round(y0), round(x0 + ww), round(y0 + hh))).resize(TAPA, Image.LANCZOS).save(tapa_dest, 'WEBP', quality=CALIDAD_PASOS, method=6)
            hechas += 1
        if g not in guias:
            avisos.append(f'PDF {g}: no hay guía con ese id en GUIAS_OBRA')
        pasos[g] = {'pdf': f'pasos/{g}.pdf', 'hojas': n, 'tapa': f'pasos/{g}_tapa.webp', 'titulo': guias.get(g, g)}
    shutil.rmtree(tmp, ignore_errors=True)

    # 3) Familias de materiales → hojas de materiales/
    familias = {}
    for fid, ftit, cods in fams:
        hs = []
        for c in cods:
            for h in mat['codigos'].get(c, []):
                if h not in hs:
                    hs.append(h)
        familias[fid] = hs

    # 3b) Todas las hojas de materiales/ (también herramientas, EPP, instrumentos y altas), con su grupo y códigos
    cods_de = {}
    for c, hs in mat['codigos'].items():
        for h in hs:
            cods_de.setdefault(h, []).append(c)
    fam_de_cod = {}
    for fid, ftit, cods in fams:
        for c in cods:
            fam_de_cod.setdefault(c, []).append(fid)
    hojas_mat_lista = []
    for h, tit in mat.get('titulos', {}).items():
        cs = sorted(cods_de.get(h, []))
        m = re.match(r'mat_(herramientas|epp|instrumentos)_', h)
        if m:
            g = 'herramientas' if m.group(1) == 'herramientas' else 'epp'
        else:
            cifras = [c[0] for c in cs]
            g = max(sorted(set(cifras)), key=cifras.count) if cifras else '9'
        fa = []
        for c in cs:
            for f in fam_de_cod.get(c, []):
                if f not in fa:
                    fa.append(f)
        nueva = re.sub(r'_\d+$', '', h[4:])        # mat_cable_unipolar_1 → cable_unipolar
        nueva = {'canos': 'caños'}.get(nueva, nueva)
        hojas_mat_lista.append({'hoja': h, 'titulo': tit, 'grupo': g, 'codigos': cs, 'familias': fa,
                                'familia': nueva if nueva in {f[0] for f in fams} else ('nueva:' + nueva)})
    hojas_mat_lista.sort(key=lambda x: (GRUPOS_ORDEN.index(x['grupo']), x['hoja']))

    # 4) Láminas viejas → hojas nuevas
    hojas_mat = set(mat.get('titulos', {}))
    laminas = {}
    for lid, ref, tit in lams:
        e = LAMINAS.get(lid)
        if not e:
            avisos.append(f'lámina {lid} sin equivalencia en LAMINAS'); continue
        for t in e.get('tipo', []):
            if t not in tipos: avisos.append(f'lámina {lid}: el tipo {t} no tiene hoja')
        for g in e.get('paso', []):
            if g not in pasos: avisos.append(f'lámina {lid}: la guía {g} no tiene PDF')
        for m in e.get('mat', []):
            if m not in hojas_mat: avisos.append(f'lámina {lid}: la hoja {m} no está en materiales/')
        laminas[lid] = e

    vig_t = set(tipos.values())
    for f in glob.glob(os.path.join(salida, 'tipos', '*.webp')):
        if re.sub(r'_(plano|3d|hoja)\.webp$', '', os.path.basename(f)) not in {os.path.basename(p)[:-4] for p in pngs}:
            os.remove(f); print('borrado (ya no está la hoja):', os.path.basename(f))

    ind = {'v': datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M'),
           'tipos': dict(sorted(tipos.items())), 'titulosTipos': titulos, 'pasos': pasos,
           'familias': familias, 'grupos': GRUPOS, 'hojasMat': hojas_mat_lista, 'laminas': laminas}
    json.dump(ind, open(os.path.join(salida, 'indice.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))

    print(f'{len(pngs)} hojas de tipos · {len(pasos)} guías en PDF · {hechas} archivos nuevos')
    print('Tipos de la app SIN hoja nueva:', ' '.join(i for i in ids_tipos if i not in tipos) or '—')
    print('Hojas sin tipo en la app:', ' '.join(sin_tipo) or '—')
    print('Guías de la app SIN PDF:', ' '.join(f'{g} ({t})' for g, t in guias.items() if g not in pasos) or '—')
    print('Familias sin hojas:', ' '.join(f for f, hs in familias.items() if not hs) or '—')
    print(f'Hojas de material: {len(hojas_mat_lista)} · familias nuevas:',
          ' '.join(sorted({x["familia"][6:] for x in hojas_mat_lista if x["familia"].startswith("nueva:")})) or '—')
    print('Láminas parciales:', ' '.join(l for l, e in laminas.items() if e.get('parcial')) or '—')
    for a in avisos:
        print('Ojo:', a)


if __name__ == '__main__':
    main()
