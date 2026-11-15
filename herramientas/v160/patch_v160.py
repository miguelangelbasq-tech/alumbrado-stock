"""v160 · PDF y videos (comprimidos) en Cloudflare R2, junto a las fotos. Ángel (13/11): «en el lugar donde mandamos las fotos
   (Cloudflare), ¿podemos almacenar los PDF y videos?» … «sí, los videos tendría que comprimirlos» … «dale, hacelo».
 · Solo con el servidor de fotos nuevo (Worker «ema-fotos» v2-fotos, /salud). Si no, todo como hoy.
 · Módulo archivosNube (window.__archivosNube, antes de revisarAppDiag): PDF a docs/ (tope 25 MB, nunca entero a la base), videos
   achicados en el celu a videos/ (subida por partes si pasa de 95 MB), bandeja IndexedDB «ema-archivos» con reintentos,
   reproductor con rango, sección «🎥 Videos y PDF» del legajo, botón «🎥 Video» en Modo obra / Mis tareas / cámara, evidencia en la
   hoja de la columna del avance nuevo (v158).
 · Reemplazos chicos: fotosNube (un video no se baja entero; los PDF con más espera), docObra (tope del PDF y aviso «quedó en el
   celu»), remitoFoto (tope del PDF), planos de obra (el PDF original también a la nube), Modo obra (botón) y avanceObra2 (evidencia).
Pruebas viejas: __v160No (salvo v160:true). Sin reglas nuevas (adjuntos / fotosObra / planosObra / campo de la orden como las fotos).
Uso: python3 patch_v160.py ORIGINAL_159.html SALIDA.html [--otra-base]"""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = open(os.path.join(SRC, 'BASE_SHA')).read().strip()   # ORIGINAL 159
args = [a for a in sys.argv[1:] if not a.startswith('--')]
ent, sal = args[0], args[1]
t = open(ent, encoding='utf-8').read()
if '--otra-base' not in sys.argv:
    assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de la 159 (usá --otra-base si sabés lo que hacés)'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
leer = lambda f: open(os.path.join(SRC, f), encoding='utf-8').read().rstrip('\n')
assert t.count('id="archivosNube"') == 0, 'ya tiene la v160'

# 1) fotosNube: un video no se baja entero (se mira desde la nube con rango); los PDF de la nube con más tiempo para bajar
R('if (a && a.r2 && !a.dataUrl && !a.data) {', 'if (a && a.r2 && !a.dataUrl && !a.data && !(/^videos\\//.test(String(a.r2)) && !window.__v160No)) {   // v160: el video no se baja entero')
R('const r = await pedir(`${WORKER}/f/${key}`, { headers: { Authorization: "Bearer " + tk } }, ESPERA_BAJADA);',
  'const r = await pedir(`${WORKER}/f/${key}`, { headers: { Authorization: "Bearer " + tk } }, /^docs\\//.test(key) && !window.__v160No ? 120000 : ESPERA_BAJADA);   // v160: un PDF de hasta 25 MB')
# 2) docObra: el PDF hasta 25 MB con el servidor nuevo (a la nube, no a la base) y el aviso si quedó en el celu
R('if (file.size > PDF_MAX) return msg(`El PDF pesa ${Math.round(file.size / 1024)} KB y la app guarda hasta ${Math.round(PDF_MAX / 1024)} KB.',
  'const pdfMax = window.__archivosNube && !window.__v160No ? window.__archivosNube.topePdf() : PDF_MAX;   // v160\n        if (file.size > pdfMax) return msg(`El PDF pesa ${pdfMax > PDF_MAX ? (Math.round(file.size / 104857.6) / 10).toString().replace(".", ",") + " MB" : Math.round(file.size / 1024) + " KB"} y la app guarda hasta ${pdfMax > PDF_MAX ? Math.round(pdfMax / 1048576) + " MB" : Math.round(PDF_MAX / 1024) + " KB"}.')
R('El PDF, hasta ${Math.round(PDF_MAX / 1024)} KB.</div>',
  'El PDF, hasta ${window.__archivosNube && !window.__v160No && window.__archivosNube.topePdf() > PDF_MAX ? Math.round(window.__archivosNube.topePdf() / 1048576) + " MB (va a la nube, junto a las fotos)" : Math.round(PDF_MAX / 1024) + " KB"}.</div>')
R('      await guardarDoc(id, k, { fecha, adjId: String(adjId), tipoArch: esPdf ? "pdf" : "foto", nombre: file.name || "" });\n      msg("✓ Guardado.");\n      setTimeout(cerrarHoja, 700);',
  '      await guardarDoc(id, k, { fecha, adjId: String(adjId), tipoArch: esPdf ? "pdf" : "foto", nombre: file.name || "" });\n'
  '      const enCelu = esPdf && window.__archivosNube && !window.__v160No && window.__archivosNube.enEspera(String(adjId));   // v160\n'
  '      msg(enCelu ? "✓ Guardado. El PDF quedó en el celu y se sube solo a la nube cuando haya señal." : "✓ Guardado.");\n      setTimeout(cerrarHoja, enCelu ? 2500 : 700);')
# 3) remitoFoto: el PDF del remito hasta 25 MB con el servidor nuevo (a la nube)
R('if (S.pdf.bytes <= 650 * 1024 && typeof window.fbAdjuntoGuardar == "function") {',
  'if (S.pdf.bytes <= (window.__archivosNube && !window.__v160No ? window.__archivosNube.topePdf() : 650 * 1024) && typeof window.fbAdjuntoGuardar == "function") {   // v160')
# 4) planos de obra: el PDF original también a la nube (las hojas siguen como imágenes para verlas y anotar)
R('creado: Date.now() }), M = false,', 'creado: Date.now() }), (window.__anPlano && i && window.__anPlano(t, s, String(a.dataset.plaza))), M = false,')
# 5) Modo obra: «🎥 Video» junto a los links
R('<div class="cd-links"><button type="button" class="cd-link" data-cd="lista">Ver lista completa</button><button type="button" class="cd-link" data-cd="fin">Fin del día</button></div></div>`;',
  '<div class="cd-links"><button type="button" class="cd-link" data-cd="lista">Ver lista completa</button><button type="button" class="cd-link" data-cd="fin">Fin del día</button>${window.__archivosNube && !window.__v160No ? window.__archivosNube.botonObra(o, pa) : ""}</div></div>`;')
# 6) avance nuevo: la hoja de la columna muestra sus videos y PDF (evidencia, no cuenta como foto)
R('+ motivoInput() + `<div class="a2-pgs">${grupos}</div>` + (hist ?',
  '+ motivoInput() + `<div class="a2-pgs">${grupos}</div>` + (window.__archivosNube && !window.__v160No ? window.__archivosNube.evidenciaHtml(o.id, c.num) : "") + (hist ?')
# 7) el módulo nuevo (antes del último script)
R('<script id="revisarAppDiag">', '<style id="archivosNubeCss">\n' + leer('archivosNube.css') + '\n</style>\n<script id="archivosNube">\n' + leer('archivosNube.js') + '\n</script>\n<script id="revisarAppDiag">')

# sello de versión (las dos marcas)
ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1), 'las dos marcas de versión no coinciden'
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
