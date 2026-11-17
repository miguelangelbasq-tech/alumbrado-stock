"""v165 · La cuadrilla: «▶ Voy a iniciar esta tarea», cámara primero (opción C), otra tarea rápido y récords (Ángel 16/11:
   «al iniciar la tarea le tiene que salir un cartel grande "voy a iniciar esta tarea", cosa que nosotros podamos medir más
   exacto» · «si nosotros no ponemos la tarea exacta, ellos en otra que pongan el nombre, que sea rápido» · «cada vez que
   rompan récord darles emojis diciendo genial rompiste tu récord o estuviste bien»), con los agregados del mismo día:
 · Cartel «▶ VOY A INICIAR ESTA TAREA» en Modo obra (inicio exacto de la tarea y de su primera columna para todos los de la
   orden: campo.tareaInicio / campo.colInicio), y enseguida la cámara de esa tarea (opción C): píldora, reloj de la tarea,
   miniaturas ✓/↑, «Col 5 ▾» con la lista de columnas, «✓ Terminé la tarea» → tiempo de cada columna (− / +), «✓ Listo,
   mandar» y la que sigue con su «▶ Voy a iniciar».
 · Otra tarea: botones grandes de las comunes + «✏ Otra: escribila o decila 🎤»; lo que no estaba en la orden va a
   campo.extras y la oficina lo ve como «hecho de más» (📸 Avance, verificación, cierre) con «＋ Sumar a la orden» / «✕».
 · Récords personales (sin riesgo: ni izaje, ni hormigonado, ni altura, ni tablero, ni acometida) y felicitaciones; «🔥 Mis
   récords» en ⭐ Mis puntos; la oficina en 🧠 › ⏱.
 · Llenar orden con las columnas del cálculo (ot.columnas{tarea:[nombres]}): chips por tablero y circuito, hechas tachadas,
   fraguando, «Las que siguen», «Todo el circuito»; Modo obra, la planilla v150, el avance v158 y el aviso de trabajo repetido
   usan esos nombres; la sugerida y el asistente los llenan solos (las que siguen).
 · PAT: la medición va como DOS hitos en el avance nuevo (prueba interna e inspección final, cada una de todas las jabalinas y
   el tablero) y dos tareas nuevas en el diccionario.
Pruebas viejas: __v165No (lo pone el arnés salvo v165:true) → todo como la v164. Sin reglas nuevas (todo en «campo» de la orden
y por fbOtUpdate de la oficina).
Uso: python3 patch_v165.py ORIGINAL_164.html SALIDA.html [--otra-base]"""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = open(os.path.join(SRC, 'BASE_SHA')).read().strip()   # ORIGINAL 164
args = [a for a in sys.argv[1:] if not a.startswith('--')]
ent, sal = args[0], args[1]
t = open(ent, encoding='utf-8').read()
if '--otra-base' not in sys.argv:
    assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de la 164 (usá --otra-base si sabés lo que hacés)'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
JS = open(os.path.join(SRC, 'inicioTarea.js'), encoding='utf-8').read()
CSS = open(os.path.join(SRC, 'inicioTarea.css'), encoding='utf-8').read()

# ============================================================== Modo obra: las columnas de la orden (ot.columnas) y «Mis récords»
R('const n = Math.min(40, Math.max(1, Math.ceil(Number(base) || 0), con.size));',
  'const colsOt = !window.__v165No ? arr(obj(o.columnas)[p.k]).map(String).filter(Boolean) : [];   // v165: las columnas que eligió la oficina\n'
  '      const n = colsOt.length ? Math.min(40, Math.max(colsOt.length, con.size)) : Math.min(40, Math.max(1, Math.ceil(Number(base) || 0), con.size));')
R('const nombres = intentar(() => (typeof window.puntosDeObra == "function" && o.plazaId ? window.puntosDeObra(o.plazaId).lista || [] : []), []);',
  'const nombres = colsOt.length ? colsOt : intentar(() => (typeof window.puntosDeObra == "function" && o.plazaId ? window.puntosDeObra(o.plazaId).lista || [] : []), []);')
R('const libres = nombres.filter((x) => !usados.has(nk(x)) && ((window.__hechoForzado',
  'const libres = nombres.filter((x) => !usados.has(nk(x)) && (colsOt.length || (window.__hechoForzado')
R('let li = 0; const nT = window.__hechoTope ?',
  'let li = 0; const nT = colsOt.length ? n : window.__hechoTope ?')
R("Todavía no tenés órdenes en esta quincena.</div>'}</div></div>`;",
  "Todavía no tenés órdenes en esta quincena.</div>'}</div>${window.__inicioTarea && !window.__v165No ? window.__inicioTarea.misRecordsHtml() : \"\"}</div>`;")

# Modo obra: con la cámara C abierta (opción C) la foto no abre la hoja «Foto guardada» (la cámara sigue para la columna siguiente)
R('    hojaFoto(o, { src: s.mini || src, num, tarea: primero(p.label), gps, enEspera: enEspera, cuenta, pe: pe.id, tc });',
  '    if (!(window.__inicioTarea && window.__inicioTarea.camC())) hojaFoto(o, { src: s.mini || src, num, tarea: primero(p.label), gps, enEspera: enEspera, cuenta, pe: pe.id, tc });')
# tiempoCol: el inicio de la primera columna sale de «Voy a iniciar»
R('empece: "desde «Empecé»"', 'empece: window.__v165No ? "desde «Empecé»" : "desde «Voy a iniciar» / «Empecé»"')

# ============================================================== verificación v150: lo asignado va a las columnas elegidas; repetido; extras
R('if (resto > 0 && !e) t(k).asig.push(Object.assign({ cant: resto }, base));',
  'if (resto > 0 && !e) t(k).asig.push(Object.assign({ cant: resto, cols: window.__v165No ? [] : arr(obj(o.columnas)[k]).filter((c) => !si.some((u) => nk(u.num) === nk(c))) }, base));   // v165: las columnas elegidas')
R('cols.forEach((c) => { const x = celda[e + "|" + nk(c)]; if (n > 0 && x.est === "falta") {',
  'cols.forEach((c) => { const x = celda[e + "|" + nk(c)]; if (n > 0 && x.est === "falta" && (!arr(a.cols).length || arr(a.cols).some((y) => nk(y) === nk(c)))) {')
R('    const H = hechasDe(id, k, sinOt); if (!H.n) return null;\n',
  '    const H = hechasDe(id, k, sinOt); if (!H.n) return null;\n'
  '    const selC = !window.__v165No && window.__colsElegidas ? window.__colsElegidas(id, k) : null;   // v165: las columnas elegidas en Llenar orden\n'
  '    if (selC && selC.length) {\n'
  '      const ya = H.l.filter((u) => selC.some((c) => nk(c) === nk(u.num))); if (!ya.length) return null;\n'
  '      const unid2 = ya.map((u) => u.num).sort(ordenNum), falt2 = selC.filter((c) => !ya.some((u) => nk(u.num) === nk(c)));\n'
  '      const ots2 = [...new Set(ya.map((u) => u.ot))].filter(Boolean), sv2 = ya.some((u) => u.est === "sinver");\n'
  '      return { k, label: labelDe(k), P: num(P), hechoEn: ya.length, falta: falt2.length, unidades: unid2, faltan: falt2, ots: ots2, sinVer: sv2, texto: `${corto(k)}: elegiste ${colsTxt(selC)} y ${colsTxt(unid2)} ya está hecho ${cuando(ya[0].fecha)} en ${ots2.slice(0, 2).join(", ")}${sv2 ? ", mandado por la cuadrilla y sin cerrar" : ""}. Falta de verdad: ${falt2.length ? colsTxt(falt2) : "nada"}.` };\n'
  '    }\n')
R('      if (off() || !o || !pa || !pa.p || !o.plazaId) return "";\n      const k = pa.p.k, D = deObra(o.plazaId), propias',
  '      if (off() || !o || !pa || !pa.p || !o.plazaId) return "";\n      if (!window.__v165No && arr(obj(o.columnas)[pa.p.k]).length) return "";   // v165: la oficina eligió las columnas\n      const k = pa.p.k, D = deObra(o.plazaId), propias')
R('function texto(o) { const V = verifOt(o); if (!V) return ""; return `',
  'function texto(o) { const V = verifOt(o); if (!V) return ""; const xT = window.__inicioTarea ? window.__inicioTarea.extrasTexto(o) : ""; return (xT ? xT + " | " : "") + `')
R('+ verHtml(o) + accHtml(o, false) +',
  '+ verHtml(o) + (window.__inicioTarea ? window.__inicioTarea.extrasHtml(o) : "") + accHtml(o, false) +')

# ============================================================== avance nuevo (v158): lo asignado a las columnas elegidas · PAT en dos hitos
R('arr(D.T[k].asig).forEach((a) => { let n = Math.round(a.cant); L.cols.forEach((c, i) => { const r = R[tg[0] + "|" + i]; if (n > 0 && r && r.e === "falta" && !r.asig) {',
  'arr(D.T[k].asig).forEach((a) => { let n = Math.round(a.cant); const aC = arr(a.cols); L.cols.forEach((c, i) => { const r = R[tg[0] + "|" + i]; if (n > 0 && r && r.e === "falta" && !r.asig && (!aC.length || aC.some((x) => nk(x) === nk(c.num)))) {')
R('medicion_pat: ["c:med_pat"],',
  'medicion_pat: [window.__v165No ? "c:med_pat" : "c:med_pat_int"], medicion_pat_int: ["c:med_pat_int"], medicion_pat_fin: ["c:med_pat_fin"],')
R('    add("med_pat", "pat", "Medición de puesta a tierra", "medición", Math.max(num(I["81"]), nJab), hhDe("medicion_pat", 0.3));\n',
  '    if (window.__v165No) add("med_pat", "pat", "Medición de puesta a tierra", "medición", Math.max(num(I["81"]), nJab), hhDe("medicion_pat", 0.3));\n'
  '    else if (Math.max(num(I["81"]), nJab) > 0) {   // v165 (Ángel): la medición de PAT son DOS instancias (prueba interna e inspección final), cada una de todas las jabalinas y el tablero\n'
  '      const hhP = r2(hhDe("medicion_pat", 0.3) * Math.max(1, nJab));\n'
  '      add("med_pat_int", "pat", "Medición de PAT · prueba interna (todas las jabalinas y el tablero)", "", 1, hhP, { bin: true });\n'
  '      add("med_pat_fin", "pat", "Medición de PAT · inspección final (todas las jabalinas y el tablero)", "", 1, hhP, { bin: true });\n'
  '    }\n')
R('mk = q.match(/^k_(.+)$/),',
  'mk = (window.__v165No ? q : q.replace(/^k_med_pat$/, "k_med_pat_int")).match(/^k_(.+)$/),')

# ============================================================== diccionario: las dos mediciones de PAT
R('  );   // v158 (con __v158No',
  '  );\n'
  '  if (!window.__v158No && !window.__v165No) L.push(\n'
  '    // v165 (Ángel 16/11): «la tierra, la final y la interna son dos distintas: las mismas mediciones de las mismas columnas, el mismo\n'
  '    //  tablero, pero son dos instancias distintas». Una por obra (todas las jabalinas y el tablero). Horas a confirmar.\n'
  '    t("medicion_pat_int", "Medición de PAT en la prueba interna (todas las jabalinas y el tablero de la obra)", PC, "obra", 2, N, N, N, S, { noAvanza: true, nueva158: true, pasos: "1. Medir cada jabalina de la obra y la del tablero con el telurímetro.\\n2. Anotar cada valor en la planilla de PAT.\\n3. Sacar la foto de cada lectura.\\n(Pasos a confirmar.)" }),\n'
  '    t("medicion_pat_fin", "Medición de PAT en la inspección final (todas las jabalinas y el tablero de la obra)", PC, "obra", 2, N, N, N, S, { noAvanza: true, nueva158: true, pasos: "1. Con la inspección, medir cada jabalina y la del tablero.\\n2. Anotar los valores en la planilla de PAT.\\n3. Sacar la foto de cada lectura.\\n(Pasos a confirmar.)" })\n'
  '  );   // v158 (con __v158No')

# ============================================================== «que no se tilde nada» (CPU ×6): la tanda 2 de appCelular (tablas del pañol
# como tarjetas y acordeón de la Calculadora) recorría TODAS las filas del catálogo del pañol con cada cambio de la página (abrir el
# cartel, la cámara, una hoja): ≈ 150 ms por vez en un celu lento. Ahora solo cuando el cambio toca el pañol o la Calculadora.
R("""  function B() {
    w || (w = true, requestAnimationFrame(k));
  }""", """  const RELEV = "#viewStock, #viewCalculadora";   // v165: solo los cambios que tocan el pañol o la Calculadora
  const toca = (m) => { const t = m.target; if (t && t.nodeType === 1 && t.closest(RELEV)) return true; for (let i = 0; i < m.addedNodes.length; i++) { const x = m.addedNodes[i]; if (x.nodeType === 1 && (x.matches(RELEV) || x.querySelector(RELEV))) return true; } return false; };
  function B(recs) {
    if (w) return;
    if (!window.__v165No && recs && recs.length && !recs.some(toca)) return;
    w = true, requestAnimationFrame(k);
  }""")

# ============================================================== el módulo
MOD = '<style id="inicioTareaCss">\n' + CSS + '</style>\n<script id="inicioTarea">\n' + JS + '</script>\n'
R('<script id="revisarAppDiag">', MOD + '<script id="revisarAppDiag">')

# sello de versión (las dos marcas)
ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1)
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
