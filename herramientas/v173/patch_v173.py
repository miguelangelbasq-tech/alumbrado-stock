"""v173 · La orden por PERSONA y por TIEMPO (Ángel 18/11).
 «Hay que hacer dos cosas, para la IA y para la orden de trabajo… tiene que ser por personas que van a hacer cada tarea… y por
 tiempo: si digo Pablo y Pedro van a estar hasta las 2 en esa plaza y los otros van a seguir trabajando hasta las 16, tiene que
 ser así… que ellos cobren hasta ahí y lo que hicieron, y luego los otros siguen y van a cobrar más por todas las horas» ·
 «si le doy la misma tarea "armar luminaria" a dos personas, 10, 5 cada uno: que a cada uno le aparezcan 5 nomás».
 · Llenar orden › paso 2: «🕐 ¿Hasta qué hora está cada uno?» → ot.horario {"Nombre": {desde, hasta}}; resumen, «Quién hace
   qué», hoja impresa (Entrada/Salida), celu de cada uno, «📸 Avance», cierre (precarga las horas de cada uno con su horario →
   puntos por rol × horas como siempre), auditor de puntos.
 · Tarea repartida (✂) = cada uno lo suyo: sus columnas (las elegidas, en orden, o las que siguen), sus fotos, su «N de 5», su
   «Voy a iniciar» y su envío; la oficina ve «Pablo 5 de 5 · 42 min · Pedro 3 de 5»; el cierre precarga lo de cada uno;
   «➗ Dividir en partes iguales».
 · Asistente: proponer_orden / proponer_editar_orden con quienes, reparto, columnas y horario; proponer_cierre_dia con «hasta».
Pruebas viejas: __v173No (lo pone el arnés salvo v173:true) → todo como antes. Sin reglas nuevas.
Uso: python3 patch_v173.py ORIGINAL_172.html SALIDA.html [--otra-base]"""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = open(os.path.join(SRC, 'BASE_SHA')).read().strip()   # ORIGINAL 172
args = [a for a in sys.argv[1:] if not a.startswith('--')]
ent, sal = args[0], args[1]
t = open(ent, encoding='utf-8').read()
if '--otra-base' not in sys.argv:
    assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de la 172 (usá --otra-base si sabés lo que hacés)'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
JS = open(os.path.join(SRC, 'porPersona.js'), encoding='utf-8').read()
CSS = open(os.path.join(SRC, 'porPersona.css'), encoding='utf-8').read()
IA = open(os.path.join(SRC, 'ia173.js'), encoding='utf-8').read()

# ============================================================== reparto (v079): «➗ Dividir en partes iguales» y las columnas de cada uno
R('''      const firma = JSON.stringify([personas, e, total]);
      if (caja && caja.dataset.firma === firma) return;
      if (!caja) { caja = document.createElement("div"); caja.className = "rp-caja"; t.appendChild(caja); }''',
  '''      const cols173 = window.__rp173 && !window.__v173No ? window.__rp173.formColsTxt(k, personas, e) : "";   // v173
      const firma = JSON.stringify([personas, e, total, cols173]);
      if (caja && caja.dataset.firma === firma) return;
      if (!caja) { caja = document.createElement("div"); caja.className = "rp-caja"; t.appendChild(caja); }''')
R('''' <small>cargá primero el previsto de la tarea</small>'}</div>
${personas.length ? personas.map((n) =>''', '''' <small>cargá primero el previsto de la tarea</small>'}</div>${!window.__v173No && personas.length > 1 && total > 0 ? `<button type="button" class="rp-iguales" data-rp173="iguales" data-k="${esc(k)}">➗ Dividir en partes iguales</button>` : ""}
${personas.length ? personas.map((n) =>''')
R('''` · ⚠ repartiste ${esc(fmtN(r2(suma - total)))} de más` : " · ✓ justo" : ""}</div>`;''',
  '''` · ⚠ repartiste ${esc(fmtN(r2(suma - total)))} de más` : " · ✓ justo" : ""}</div>${cols173}`;''')
R('''    return out.filter((x) => x.cant > 0);
  }
  // textos''', '''    return (window.__rp173 && !window.__v173No ? window.__rp173.mezclarHecho(ot, k, out) : out).filter((x) => x.cant > 0);   // v173: lo de sus columnas y fotos
  }
  // textos''')
# ============================================================== Modo obra (cuadrillaDia): cada uno sus unidades, sus fotos y su envío
R('''    const cat = catDe(p), fs = fotosDe(o, p.k), con = fotosConNombre(fs);
    if (pideNum(cat) && !porMetro(p)) {''', '''    const __rp = window.__rp173 && !window.__v173No ? window.__rp173.mias(o, p.k, per()) : null;   // v173: tarea repartida → lo suyo
    const cat = catDe(p), fs = __rp ? window.__rp173.filtrarFotos(o, p.k, fotosDe(o, p.k), per()) : fotosDe(o, p.k), con = fotosConNombre(fs);
    if (pideNum(cat) && !porMetro(p)) {''')
R('''      const colsOt = !window.__v165No ? arr(obj(o.columnas)[p.k]).map(String).filter(Boolean) : [];''',
  '''      const colsOt = __rp && __rp.nombres.length ? __rp.nombres.slice() : !window.__v165No ? arr(obj(o.columnas)[p.k]).map(String).filter(Boolean) : [];''')
R('''Object.keys(pasosDe(o, p.k)).forEach((q) => { const x = pasosDe(o, p.k)[q]; if (x && x.num && !usados.has(nk(x.num))) {''',
  '''Object.keys(pasosDe(o, p.k)).forEach((q) => { const x = pasosDe(o, p.k)[q]; if (x && x.num && !usados.has(nk(x.num)) && (!__rp || window.__rp173.pasoMio(o, p.k, x, per()))) {''')
R('''  const envDe = (o, k) => { const x = obj(campo(o).tareaEnv)[Lk(k)]; const l = Object.keys(obj(x)).map((q) => x[q]).filter((v) => v && v.estado);''',
  '''  const envDe = (o, k) => { const x = obj(campo(o).tareaEnv)[Lk(k)]; const l = Object.keys(obj(x)).map((q) => x[q]).filter((v) => v && v.estado && (!window.__rp173 || window.__v173No || window.__rp173.envMio(o, k, v)));''', 2)
# ============================================================== Mis tareas (envioTarea): el envío propio en una tarea repartida
R('''const l = Object.values(x).filter((v) => v && v.estado); return l.length''',
  '''const l = Object.values(x).filter((v) => v && v.estado && (!window.__rp173 || window.__v173No || window.__rp173.envMio(o, k, v))); return l.length''')
# ============================================================== «Voy a iniciar» (v165): en una tarea repartida, el inicio es de cada uno
R('''    const m = sinMem ? null : S.mem[o.id + "|" + Lk(k)]; if (m && diaDe(m.ts) === hoy) l.push(m);
    if (!l.length) return null;''', '''    const m = sinMem ? null : S.mem[o.id + "|" + Lk(k)]; if (m && diaDe(m.ts) === hoy) l.push(m);
    if (window.__rp173 && !window.__v173No && window.__rp173.mias(o, k)) { const yn = nk(window.__rp173.yo()); for (let i = l.length - 1; i >= 0; i--) if (nk(l[i].por) !== yn) l.splice(i, 1); }   // v173
    if (!l.length) return null;''')
R('''  window.__colsElegidas = (obra, k) =>''', '''  window.__colsPoner = (k, l) => { if (off()) return; ST.obra = obraForm(); ST.cargado = true; ST.sel[k] = arr(l).slice(); pintarForm(); };   // v173: el asistente elige las columnas
  window.__colsElegidas = (obra, k) =>''')
# ============================================================== verificación (v150): por persona
R('''return { k, label: labelDe(k), un: unDe(k), pedidas: ped, hechas, sinDet, si, no, noN, motivo: motivoT, dudas, est, mandada: env, conDetalle: us.length > 0, texto: partes.join(" · ") };''',
  '''return { k, label: labelDe(k), un: unDe(k), pedidas: ped, hechas, sinDet, si, no, noN, motivo: motivoT, dudas, est, mandada: env, conDetalle: us.length > 0, texto: partes.join(" · ") + (window.__rp173 ? window.__rp173.verTxt(o, k) : "") };''')
# ============================================================== «📋 Quién hace qué» con el horario de cada uno
R('''personas.map((n) => '<div class="eq-r-fila"><b>👤 ' + esc(n) + "</b><span>"''',
  '''personas.map((n) => '<div class="eq-r-fila"><b>👤 ' + esc(n) + (window.__hor173 ? esc(window.__hor173.formTxt(n)) : "") + "</b><span>"''')
# ============================================================== resumen de «Llenar orden»
R('''per.map((p) => esc(String(p.nombre).split(" ")[0])).join(", ") + (veh''', '''per.map((p) => esc(String(p.nombre).split(" ")[0])).join(", ") + (window.__hor173 ? esc(window.__hor173.resumenTxt(d)) : "") + (veh''')
# ============================================================== hoja impresa: Entrada / Salida
R('''    s += `<tr><td>${escHtml(h.nombre)}</td><td>${escHtml(h.rol)}</td><td>&nbsp;</td><td>&nbsp;</td><td>${b > 0''',
  '''    s += `<tr><td>${escHtml(h.nombre)}</td><td>${escHtml(h.rol)}</td><td>${window.__hor173 ? window.__hor173.imp(e, h.nombre, 0) : "&nbsp;"}</td><td>${window.__hor173 ? window.__hor173.imp(e, h.nombre, 1) : "&nbsp;"}</td><td>${b > 0''')
# ============================================================== la cuadrilla: su horario en «La orden»
R('''<b>Salen ${esc(o.horaInicio)}${o.horaFin ? " · hasta " + esc(o.horaFin) : ""}</b>''',
  '''<b>Salen ${esc(o.horaInicio)}${o.horaFin ? " · hasta " + esc(o.horaFin) : ""}${window.__hor173 ? esc(window.__hor173.miTxt(o, per())) : ""}</b>''')
# ============================================================== auditor de puntos (v154): «trabajó de 08:00 a 14:00 (horario de la orden)»
R('''      const add = (j, p, regla, como, yo) => { pp[j].pts += p; pp[j].partes.push({ k: r.k, label: r.label, pts: p, regla, como, yo: yo || como }); };''',
  '''      const add = (j, p, regla, como, yo) => { const hT = window.__hor173 && !window.__v173No ? window.__hor173.auditTxt(o, pp[j].nombre) : ""; pp[j].pts += p; pp[j].partes.push({ k: r.k, label: r.label, pts: p, regla, como: como + hT, yo: (yo || como) + hT }); };''')
# ============================================================== asistente (código dormido)
R('''    const quien = {}; d.tareas.forEach((t) => { if (t.quien) quien[t.k] = t.quien; });
    try { window.__restaurarQuien && window.__restaurarQuien(quien); } catch (e) { }''', '''    const quien = {}; d.tareas.forEach((t) => { if (t.quien) quien[t.k] = t.quien; });
    try { window.__ia173 && window.__ia173.quienes(d, quien); } catch (e) { }   // v173: varios juntos / cada uno su parte
    try { window.__restaurarQuien && window.__restaurarQuien(quien); } catch (e) { }
    try { window.__ia173 && window.__ia173.cargar(d); } catch (e) { }   // v173: horario y columnas''')
R('''${esc(fN(x.cant))} ${esc(pl(x.cant, x.un))}${x.quien ? " · 👤 " + esc(x.quien.split(" ")[0]) : ""}`, x.total ? `quedan ${esc(fN(Math.max(0, x.quedan)))} de ${esc(fN(x.total))}` : "")).join("");''',
  '''${esc(fN(x.cant))} ${esc(pl(x.cant, x.un))}${window.__ia173 ? window.__ia173.quien(x) : x.quien ? " · 👤 " + esc(x.quien.split(" ")[0]) : ""}`, (x.total ? `quedan ${esc(fN(Math.max(0, x.quedan)))} de ${esc(fN(x.total))}` : "") + (x.columnas && x.columnas.length && window.__rp173 ? (x.total ? " · " : "") + esc(window.__rp173.rangoCols(x.columnas)) : ""))).join("");
      if (window.__ia173 && window.__ia173.hor(d)) h += f("🕐", esc(window.__ia173.hor(d)), d.horaFin ? "la orden: " + esc(d.horaInicio || "") + " a " + esc(d.horaFin) : "");''')
R('''    "- Cada propuesta muestra antes → después. Si la persona dice «sí, hacelo» por voz,''', '''    ...(window.__v173No ? [] : ["- QUIÉN HACE QUÉ Y HORARIO (v173): cuando la persona dice quién hace cada cosa («Pablo hace el pozo de Col 3 y 4, Pedro y Juan el izaje»), asigná POR TAREA: «quien» si es uno, «quienes» si la hacen varios juntos, «reparto» si cada uno hace su parte («10 luminarias, 5 Pablo y 5 Pedro» → reparto [{persona:Pablo, cantidad:5}, {persona:Pedro, cantidad:5}]) y «columnas» si dice cuáles. NUNCA pongas a todos en todo si dijo quién hace qué; los que no nombró para una tarea no la hacen. Cuando dice que alguien se va antes o se queda («Pablo y Pedro hasta las 2, los demás hasta las 16»), poné «horario» (hasta 14:00 para ellos) y hora_fin 16:00: sus puntos se cuentan por sus horas. En el cierre por voz, «hasta las 2» va en «hasta» de proponer_cierre_dia."]),
    "- Cada propuesta muestra antes → después. Si la persona dice «sí, hacelo» por voz,''')
R('''  window.__asistente = { resumenSemana, informeMaterial,''', IA + '''  window.__asistente = { resumenSemana, informeMaterial,''')

# ============================================================== el módulo
MOD = '<style id="porPersonaCss">\n' + CSS + '</style>\n<script id="porPersona">\n' + JS + '</script>\n'
R('<script id="revisarAppDiag">', MOD + '<script id="revisarAppDiag">')

# sello de versión (las dos marcas)
ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1)
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
