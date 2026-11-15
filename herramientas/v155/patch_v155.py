"""v155 · Rol «Dirección» + su Inicio (gráficos del día, programación de obras, plata) + 2 detalles de la v154.
Ángel (14/11): «Hagamos A en el celu y C en la compu. Y sumar lo de la B, calendarios»; la foto del día de cada obra y el
pronóstico del clima contra lo planeado. Rol «Dirección»: «pueden mirar todo, consultar todo, pero no pueden cambiar nada».
«Esa pantalla también mostrarla en oficina».
 · usuariosPermisos: rol direccion (todas las hojas en «ver»; Mi tablero y Mis tareas ocultos). Lo demás ya lo cortan las fb*
   (nivel «ver») y las reglas v155. fbSaludGuardar no escribe con Dirección.
 · Módulo inicioDir (antes de revisarAppDiag): #iniDir en el Inicio de Dirección y hoja #dirOv («📊 Dirección») para
   Administración y Oficina (Inicio Ejecutivo, menú, Tablero del dueño). Fecha del acta de inicio y plazo en «Nuestra zona».
 · Inicio (inicioPro), barra de abajo (navBarra: Inicio · Obras · Mapa · Informes · Perfil), certificación y personal en vivo
   (solo mirar) para Dirección.
 · Asistente (dormido): nivel «direccion» = todo lo de leer de la oficina (con plata), sin ninguna proponer_*; anotar_para_oficina
   (aviso a Administración y Oficina con «Sí») y como_vamos; ⚙ Límites con Dirección; aviso del Worker v5-ia.
 · «📨 Para resolver» (paraResolver): la cuadrilla (y el pañol y «solo mirar») le avisa a la oficina por el asistente
   (avisar_oficina → «Sí, mandalo» → avisosCuadrilla + push a Administración y al supervisor); bandeja con visto / resuelto /
   respuesta; Inicio Ejecutivo, menú, Supervisor; ⚙ del asistente: a quién le llega.
 · v154: el botón del período de «🔎 Puntos» marcado; sin nombres de herramientas en los avisos de la tarjeta.
Pruebas viejas: __v155No (salvo v155:true). Reglas nuevas: Reglas_Firestore_v155. Se reaplica con --otra-base.
Uso: python3 patch_v155.py ORIGINAL_154.html SALIDA.html [--otra-base]"""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = open(os.path.join(SRC, 'BASE_SHA')).read().strip()   # ORIGINAL 154
args = [a for a in sys.argv[1:] if not a.startswith('--')]
ent, sal = args[0], args[1]
t = open(ent, encoding='utf-8').read()
if '--otra-base' not in sys.argv:
    assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de la 154 (usá --otra-base si sabés lo que hacés)'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
leer = lambda f: open(os.path.join(SRC, f), encoding='utf-8').read().rstrip('\n')
assert t.count('id="inicioDir"') == 0, 'ya tiene la v155'
DIR = '(!window.__v155No && b() && b().rol === "direccion")'

# 1) el rol (Usuarios y permisos)
R('oficina: { nombre: "Oficina", txt: "Carga y cambia todo", hojas: C("editar") }, ',
  'oficina: { nombre: "Oficina", txt: "Carga y cambia todo", hojas: C("editar") }, ...(window.__v155No ? {} : { direccion: { nombre: "Dirección", txt: "Mira todo (también la plata y los puntos), no cambia nada", hojas: C("ver") } }), ')
R('if (a === "tablero") return "editar";', 'if (a === "tablero") return ' + DIR + ' ? "oculto" : "editar";   // v155: Dirección no escribe')
R('if (a === "mistareas") return window.__modoEmergencia ? "ver" : "editar";', 'if (a === "mistareas") return window.__modoEmergencia ? "ver" : ' + DIR + ' ? "oculto" : "editar";')
R('t && await a.collection("configEquipo").doc("salud").set(e, { merge: true });', 't && !(window.__esDireccion && window.__esDireccion()) && await a.collection("configEquipo").doc("salud").set(e, { merge: true });   // v155')

# 2) el Inicio
R('return r === "admin" || r === "oficina" ? "eje" : r === "panol" ? "pan" : "";', 'return r === "admin" || r === "oficina" ? "eje" : r === "panol" ? "pan" : r === "direccion" && window.__inicioDir && !window.__v155No ? "dir" : "";   // v155')
R('["iniEje", "iniPan"].forEach((id) => { const e = $(id); e && (e.style.display = "none"); });', '["iniEje", "iniPan", "iniDir"].forEach((id) => { const e = $(id); e && (e.style.display = "none"); });')
R('document.body.classList.toggle("ie-hero", m === "eje" && visible && document.body.dataset.vista !== "plaza");', 'document.body.classList.toggle("ie-hero", (m === "eje" || m === "dir") && visible && document.body.dataset.vista !== "plaza");')
R('    if (!m || !visible) return;\n', '    if (!m || !visible) return;\n    if (m === "dir") { const rd = $("iniDir"); rd && (rd.style.display = ""); try { window.__inicioDir.suave(); } catch (e) { } return; }   // v155\n')
R('#viewInicio.ie-on > :not(#iniEje):not(#iniPan){display:none !important}', '#viewInicio.ie-on > :not(#iniEje):not(#iniPan):not(#iniDir){display:none !important}')
R('<div class="ie-accs">${window.__tableroDueno ? window.__tableroDueno.accesoHtml() : ""}', '<div class="ie-accs">${window.__inicioDir ? window.__inicioDir.accesoHtml() : ""}${window.__tableroDueno ? window.__tableroDueno.accesoHtml() : ""}')
# barra de abajo
R('    perfil: { t: "Perfil", i: "perfil", ir: () => V.ir("perfil"), on: (v) => v === "perfil", ve: () => true }',
  '    informes: { t: "Informes", i: "informe", ir: () => V.ir("informe"), on: (v) => v === "informe", ve: () => V.ve("informe") },   // v155\n    perfil: { t: "Perfil", i: "perfil", ir: () => V.ir("perfil"), on: (v) => v === "perfil", ve: () => true }')
R('if (V.rol() === "panol") return ["inicio", "reservas", "catalogo", "herr", "perfil"];', 'if (V.rol() === "panol") return ["inicio", "reservas", "catalogo", "herr", "perfil"];\n    if (V.rol() === "direccion" && !window.__v155No) return ["inicio", "obras", "mapa", "informes", "perfil"];   // v155')
# Tablero del dueño y «Nuestra zona»
R('<div class="td-gr">${window.__mapaControl ?', '<div class="td-gr">${window.__inicioDir ? window.__inicioDir.tdHtml() : ""}${window.__mapaControl ?')
R(' La cambia Administración."}</span></div>`;', ' La cambia Administración."}</span>${window.__inicioDir ? window.__inicioDir.cfgHtml() : ""}</div>`;')
# solo mirar: certificación y personal en vivo
R('function puedePlata() { return !window.__v145No && !!window.__fbUser && !esCrew() && (permiso("informe") === "editar" || permiso("gastos") === "editar"); }',
  'function puedePlata() { return !window.__v145No && !!window.__fbUser && !esCrew() && (permiso("informe") === "editar" || permiso("gastos") === "editar" || !!(window.__esDireccion && window.__esDireccion())); }   /* v155: Dirección mira */')
R('const veOficina = () => { const y = yo(); try { return !!y && (["admin", "oficina"].includes(y.rol)', 'const veOficina = () => { const y = yo(); try { return !!y && (["admin", "oficina"].includes(y.rol) || (y.rol === "direccion" && !window.__v155No)')

# 3) asistente (lo liviano)
R('const ROLES_TODOS = ["admin", "oficina", "panol", "cuadrilla", "operario", "mirar"];', 'const ROLES_TODOS = window.__v155No ? ["admin", "oficina", "panol", "cuadrilla", "operario", "mirar"] : ["admin", "oficina", "direccion", "panol", "cuadrilla", "operario", "mirar"];   // v155: + Dirección')
R('return rol === "admin" || window.__iaRoles().indexOf(rol) >= 0;', 'return rol === "admin" || window.__iaRoles().indexOf(rol) >= 0 || (rol === "direccion" && !window.__v155No && !(((window.__personalNube || {}).asistente || {}).rolesConDir));   // v155: listas guardadas antes de Dirección')
R('operario: { preguntas: 10, remitos: 0 }, mirar: { preguntas: 10, remitos: 0 } }, mes:', 'operario: { preguntas: 10, remitos: 0 }, mirar: { preguntas: 10, remitos: 0 }, direccion: { preguntas: 30, remitos: 40 } }, mes:')
# asistente (dormido)
R('const NIV = { admin: "admin", oficina: "oficina", panol: "panol", cuadrilla: "crew", operario: "crew", mirar: "mirar" };', 'const NIV = { admin: "admin", oficina: "oficina", panol: "panol", cuadrilla: "crew", operario: "crew", mirar: "mirar", direccion: window.__v155No ? "mirar" : "direccion" };')
R('const SOLO_LEE = /^(cuadrilla|operario|mirar)$/;', 'const SOLO_LEE = /^(cuadrilla|operario|mirar|direccion)$/;   // v155: Dirección solo consulta')
R('    const n = nivelRol(), lista = TOOLS_ROL[n] || null;', '    const n = nivelRol(), lista = window.__v155No ? TOOLS_ROL[n] || null : n === "direccion" ? TOOLS.map((t) => t.name).filter((x) => !/^proponer_/.test(x) && x !== "avisar_oficina" && x !== "mis_avisos") : TOOLS_ROL[n] ? TOOLS_ROL[n].concat(["avisar_oficina", "mis_avisos"]) : null;   // v155: Dirección = todo lo de leer, nada que proponga; cuadrilla, pañol y mirar le avisan a la oficina')
R('      }) : l),', '      }) : l.filter((t) => ["anotar_para_oficina", "avisar_oficina", "mis_avisos"].indexOf(t.name) < 0)),')
R('${P.tipo === "cierreDia" ? "Sí, cerrar" : "Sí, hacelo"}', '${P.tipo === "cierreDia" ? "Sí, cerrar" : P.tipo === "avisoCuadrilla" ? "Sí, mandalo" : "Sí, hacelo"}')
R('${admin ? cfgModelosHtml() : ""}', '${admin ? cfgModelosHtml() : ""}${admin && window.__paraResolver ? window.__paraResolver.cfgHtml() : ""}')
# «📨 Para resolver» en el Inicio Ejecutivo y el Supervisor
R('    try { (window.__sinTarea ? window.__sinTarea.atender() : []).forEach((x) => l.push(x)); } catch (e) { }   // v145', '    try { (window.__paraResolver ? window.__paraResolver.atender() : []).forEach((x) => l.push(x)); } catch (e) { }   // v155\n    try { (window.__sinTarea ? window.__sinTarea.atender() : []).forEach((x) => l.push(x)); } catch (e) { }   // v145')
R('    if (k === "ia") return window.__asistenteAbrir && window.__asistenteAbrir();', '    if (k === "ia") return window.__asistenteAbrir && window.__asistenteAbrir();\n    if (k === "pararesolver") return window.__paraResolver && window.__paraResolver.abrir();   // v155')
R('.concat(window.__auditPuntos && !window.__v154No ? window.__auditPuntos.supHallazgos() : []); }   /* v154 */', '.concat(window.__auditPuntos && !window.__v154No ? window.__auditPuntos.supHallazgos() : []).concat(window.__paraResolver ? window.__paraResolver.supHallazgos() : []); }   /* v154, v155 */')
R('    else if (x.tipo === "puntos") { try { window.__auditPuntos.abrir({ tab: "rev" }); } catch (e) { } }   // v154', '    else if (x.tipo === "puntos") { try { window.__auditPuntos.abrir({ tab: "rev" }); } catch (e) { } }   // v154\n    else if (x.tipo === "pararesolver") { try { window.__paraResolver.abrir(); } catch (e) { } }   // v155')
R('  const SIS_ROL = {', '  const SIS_ROL = {\n    direccion: "Te habla alguien de DIRECCIÓN (gerencia, presidencia o el dueño). Puede ver y consultar TODO como la oficina (plata, certificación, gastos, puntos, órdenes, obras, pañol), pero NO CAMBIA NADA: no tenés herramientas para cambiar. Si pide un cambio, contestá «Eso lo hace la oficina; ¿te lo dejo anotado para ellos?» y, si dice que sí, usá anotar_para_oficina con el pedido claro. Para «¿cómo vamos?» usá como_vamos. Contestá corto y con los números primero.",')
R('  const CHIPS_ROL = {', '  const CHIPS_ROL = {\n    direccion: [["📊 ¿Cómo vamos?", "¿Cómo vamos?", true], ["📰 Resumen de la semana", "Resumen de la semana", true], ["⚠ ¿Qué obra está más atrasada?", "¿Qué obra está más atrasada?", true], ["📑 ¿Cuánto certificamos?", "¿Cuánto certificamos?", true]],')
R('    if (n === "crew") return "• <b>«¿qué tengo hoy?»</b>', '    if (n === "direccion") return "• <b>«¿cómo vamos?»</b><br>• <b>«¿qué obra está más atrasada?»</b><br>• <b>«¿cuánto certificamos este mes?»</b><br>• <b>«¿por qué Juan tiene tantos puntos?»</b><br>Con tu usuario te contesto todo, pero no hago cambios: si querés cambiar algo, te lo dejo anotado para la oficina.";\n    if (n === "crew") return "• <b>«¿qué tengo hoy?»</b>')
R('  const LROL = [["oficina", "Oficina"], ["panol", "Pañol"],', '  const LROL = [["oficina", "Oficina"], ...(window.__v155No ? [] : [["direccion", "Dirección"]]), ["panol", "Pañol"],')
R('asistente: Object.assign(cur, { roles, limites, tsLimites: Date.now()', 'asistente: Object.assign(cur, window.__v155No ? {} : { rolesConDir: true }, { roles, limites, tsLimites: Date.now()')
R('const ROL_TXT = { admin: "Administración", oficina: "Oficina", panol: "Pañol", cuadrilla: "Cuadrilla", operario: "Operario", mirar: "Solo mirar" };', 'const ROL_TXT = { admin: "Administración", oficina: "Oficina", panol: "Pañol", cuadrilla: "Cuadrilla", operario: "Operario", mirar: "Solo mirar", direccion: "Dirección" };')
R('if (!oficinaIa() || !AP.puede()) return { err: NO_VE };', 'if (nivelRol() !== "direccion" && (!oficinaIa() || !AP.puede())) return { err: NO_VE };   // v155: Dirección también pregunta', 2)
R('    if (!edita("parte")) return { err: "Tu usuario no arma órdenes de trabajo." };\n    const S = SUG(); if (!S || !S.puede()) return { err: "La orden sugerida no está disponible para este usuario." };',
  '    const dirIa = nivelRol() === "direccion";   // v155: Dirección la lee (no la emite)\n    if (!edita("parte") && !dirIa) return { err: "Tu usuario no arma órdenes de trabajo." };\n    const S = SUG(); if (!S || (!S.puede() && !dirIa)) return { err: "La orden sugerida no está disponible para este usuario." };')
R('  function avisoWorkerV3(ema) {\n', '  function avisoWorkerV3(ema) {\n    try { if (!window.__v155No && ema && nivelRol() === "direccion" && !/^v([5-9]|\\d{2,})-ia/.test(String(ema.version || "")) && localStorage.getItem("ema.ia.avisoWorker5") !== "1") { localStorage.setItem("ema.ia.avisoWorker5", "1"); agregarBurbuja("nota", "ℹ Para preguntar más, Ángel tiene que pegar el Worker nuevo del asistente (v155). Mientras tanto anda con el tope de «solo mirar»."); } } catch (e) { }   // v155\n')
R('    agregarBurbuja(op.burbuja ? "nota" : "yo", op.burbuja || texto);\n', '    agregarBurbuja(op.burbuja ? "nota" : "yo", op.burbuja || texto);\n    if (!window.__v155No && !op.burbuja) { const Pq = ultimaPendiente(); if (Pq && Pq.tipo === "avisoCuadrilla" && (SI_RE.test(texto) || NO_RE.test(texto))) { await confirmar(Pq, SI_RE.test(texto), false); return "ok"; } }   // v155: «sí, mandalo» escrito también manda el aviso\n')
R('  window.__asistente = { resumenSemana,', leer('ia155.js') + '\n  window.__asistente = { resumenSemana,')

# 4) v154: sin nombres de herramientas en lo que ve la persona
R('Para sumar a alguien, usá proponer_corregir_cierre (quiénes hicieron cada tarea).', 'Para sumar a alguien, usá ✏ Corregir cierre (quiénes hicieron cada tarea).')
R('Si lo que cambia es lo HECHO, usá proponer_corregir_cierre.', 'Si lo que cambia es lo hecho, usá ✏ Corregir cierre.')
R('texto: "anotar el motivo (proponer_nota_puntos)"', 'texto: "anotar el motivo (📒 Anotar el porqué)"', 3)
# el botón del período elegido en «🔎 Puntos», bien marcado (le ganaba el estilo general de .btn-ghost)
R('.qp-per .btn-ghost.on{background:var(--grad-accion,var(--navy,#28285E));color:#fff;border-color:transparent}',
  '.qp-per .btn-ghost.on,#qpOv .qp-per .btn-ghost.on{background:var(--grad-accion,linear-gradient(135deg,#28285E,#1F5F86)) !important;color:#fff !important;border-color:transparent !important;box-shadow:0 8px 18px -10px rgba(40,40,94,.8) !important}')

# 5) el módulo nuevo (antes del último script)
R('<script id="revisarAppDiag">', '<style id="inicioDirCss">\n' + leer('inicioDir.css') + '\n</style>\n<script id="inicioDir">\n' + leer('inicioDir.js') + '\n</script>\n<style id="paraResolverCss">\n' + leer('paraResolver.css') + '\n</style>\n<script id="paraResolver">\n' + leer('paraResolver.js') + '\n</script>\n<script id="revisarAppDiag">')

# sello de versión (las dos marcas)
ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1), 'las dos marcas de versión no coinciden'
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
