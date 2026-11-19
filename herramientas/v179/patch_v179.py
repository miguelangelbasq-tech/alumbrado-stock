"""v179 · Producción › Personal del equipo con subíndices por sector: Todos · Alumbrado · Civil · Ilícitos · Contratista · Oficina
· Dirección · Pañol (con la cantidad; filtra la tabla; «＋ Agregar persona» trae el sector de la pestaña). El sector de la nómina
suma civil/contratista/oficina/direccion/panol (alumbrado e ilicitos igual). Gente sin tarea y la orden sugerida: solo Alumbrado,
Civil e Ilícitos (Civil cuenta como equipo civil). El asistente (v175) entiende y pone los sectores nuevos y filtra por sector.
Módulo `sectores179` + reemplazos chicos. Bandera __v179No.
Uso: python3 patch_v179.py ORIGINAL_178.html SALIDA.html [--otra-base]"""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = open(os.path.join(SRC, 'BASE_SHA')).read().strip() if os.path.exists(os.path.join(SRC, 'BASE_SHA')) else ''
args = [a for a in sys.argv[1:] if not a.startswith('--')]
ent, sal = args[0], args[1]
t = open(ent, encoding='utf-8').read()
if '--otra-base' not in sys.argv:
    assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de la 178 (usá --otra-base si sabés lo que hacés)'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
S = 'window.__sec179'
# ---------- la tabla de Personal del equipo (z / W / Q de la base)
OLD_SEL = '''<td><select class="per-sector${o.sector === "ilicitos" ? " ilicitos" : ""}" onchange="this.classList.toggle('ilicitos', this.value === 'ilicitos')"><option value="alumbrado" ${o.sector !== "ilicitos" ? "selected" : ""}>💡 Alumbrado</option><option value="ilicitos" ${o.sector === "ilicitos" ? "selected" : ""}>🚨 Ilícitos</option></select></td>'''
R(OLD_SEL, '<td>${' + S + ' ? ' + S + '.select(o) + ' + S + '.badge(o) : `' + OLD_SEL[4:-5] + '`}</td>')
R('c += `<div class="hint" style="margin:0 0 8px;">💡 <b>${g}</b> de Alumbrado', 'c += ' + S + ' ? ' + S + '.hint(A) : `<div class="hint" style="margin:0 0 8px;">💡 <b>${g}</b> de Alumbrado')
R('t.innerHTML = c;\n    }\n  }\n  window.renderPersonalEquipo = z;', 't.innerHTML = c;\n    }\n    try { ' + S + ' && ' + S + '.pintar(); } catch (e9) { }   // v179: pestañas por sector\n  }\n  window.renderPersonalEquipo = z;')
R('.map((a) => ({ legajo: (a.querySelector(".per-legajo").value', '.map((a) => Object.assign(' + S + ' ? ' + S + '.extra(A, a) : {}, { legajo: (a.querySelector(".per-legajo").value')
R('sector: (a.querySelector(".per-sector") || {}).value === "ilicitos" ? "ilicitos" : "alumbrado",', 'sector: ' + S + ' ? ' + S + '.leer(a) : (a.querySelector(".per-sector") || {}).value === "ilicitos" ? "ilicitos" : "alumbrado",')
R('A = W(), A.push({ legajo: "", nombre: "", sector: "alumbrado"', 'A = W(), A.push({ legajo: "", nombre: "", sector: ' + S + ' ? ' + S + '.nuevo() : "alumbrado"')
R('${a.sector === "ilicitos" ? " · 🚨 Ilícitos" : ""}</option>', '${' + S + ' ? ' + S + '.datalistTxt(a) : a.sector === "ilicitos" ? " · 🚨 Ilícitos" : ""}</option>')
# ---------- Llenar orden: el sector al lado del nombre (gente rápida)
R('${x.rol ? " · " + esc(x.rol) : ""}</button>', '${x.rol ? " · " + esc(x.rol) : ""}${' + S + ' ? ' + S + '.chip(x) : ""}</button>')
# ---------- orden sugerida: solo los sectores de obra; Civil cuenta como equipo civil
R('const nomina = () => { const p = pNube(); let l = Array.isArray(p.nomina) && p.nomina.length ? p.nomina : Array.isArray(p.lista) ? p.lista : []; if (!l.length) l = intentar(() => window.nominaEquipo() || [], []); return l.filter((x) => x && String(x.nombre || "").trim() && x.activo !== false); };',
  'const nomina = () => { const p = pNube(); let l = Array.isArray(p.nomina) && p.nomina.length ? p.nomina : Array.isArray(p.lista) ? p.lista : []; if (!l.length) l = intentar(() => window.nominaEquipo() || [], []); return l.filter((x) => x && String(x.nombre || "").trim() && x.activo !== false && (!' + S + ' || ' + S + '.obra(x))); };   // v179: Contratista, Oficina, Dirección y Pañol no van a la orden sugerida')
R('return !!(p && p.equipoCivil); };', 'return !!(p && (' + S + ' ? ' + S + '.civil(p) : p.equipoCivil)); };')
R('nom.filter((p) => p.equipoCivil).map', 'nom.filter((p) => (' + S + ' ? ' + S + '.civil(p) : p.equipoCivil)).map')
R('civil: !!p.equipoCivil }); });', 'civil: !!(' + S + ' ? ' + S + '.civil(p) : p.equipoCivil) }); });')
# ---------- gente sin tarea (v145): solo Alumbrado, Civil e Ilícitos
R('return nomina().filter((p) => p.equipoCivil || !fuera[nk(p.nombre)]).map((p) => ({ nombre: String(p.nombre).trim(), rol: p.rol || "", civil: !!p.equipoCivil }));',
  'const S9 = ' + S + ';   // v179: Contratista, Oficina, Dirección y Pañol no tienen que tener tarea; Civil como equipo civil\n'
  '    return nomina().filter((p) => (!S9 || S9.obra(p)) && ((S9 ? S9.civil(p) : p.equipoCivil) || !fuera[nk(p.nombre)])).map((p) => ({ nombre: String(p.nombre).trim(), rol: p.rol || "", civil: !!(S9 ? S9.civil(p) : p.equipoCivil) }));')
# ---------- Pañol › Por sector: qué sector lleva cada persona
R('<div class="hint">Salidas del mes menos lo que se devolvió, por sector (el sector se pone al registrar la salida). No cuenta lo anulado.</div>',
  '<div class="hint">Salidas del mes menos lo que se devolvió, por sector (el sector se pone al registrar la salida). No cuenta lo anulado.${' + S + ' ? " Las salidas de la gente de Civil, Contratista, Oficina, Dirección y Pañol van como Alumbrado; las de Ilícitos, como Ilícitos." : ""}</div>')
# ---------- asistente v175 (dormido, ES5): sectores nuevos y filtro por sector
R('function sectorDe(t) { var q = nk(t); if (!q) return ""; if (/ilici/.test(q)) return "ilicitos"; if (/alumbr/.test(q)) return "alumbrado"; return ""; }',
  'function sectorDe(t) { if (window.__sec179) return window.__sec179.clave(t); var q = nk(t); if (!q) return ""; if (/ilici/.test(q)) return "ilicitos"; if (/alumbr/.test(q)) return "alumbrado"; return ""; }   // v179: + civil, contratista, oficina, direccion, panol')
R('sector: TXT("alumbrado (de entrada) o ilícitos")', 'sector: TXT(window.__sec179 ? "alumbrado (de entrada), civil, ilicitos, contratista, oficina, direccion o panol" : "alumbrado (de entrada) o ilícitos")')
R('if (q) l = l.filter(function (p) { return nk(p.nombre).indexOf(q) >= 0 || parecido(p.nombre, q) || String(p.legajo || "") === q; });',
  'if (q) l = l.filter(function (p) { return nk(p.nombre).indexOf(q) >= 0 || parecido(p.nombre, q) || String(p.legajo || "") === q; });\n'
  '      var S9 = window.__sec179, sf = S9 && a && a.sector ? S9.clave(a.sector) : "";   // v179: filtrar por sector (Civil = sector Civil + equipo civil de Alumbrado)\n'
  '      if (S9 && a && a.sector && !sf) return { err: "No conozco el sector «" + a.sector + "». Son: alumbrado, civil, ilicitos, contratista, oficina, direccion o panol." };\n'
  '      if (sf) l = l.filter(function (p) { return S9.enTab(sf, S9.de(p), p.equipoCivil); });')
R('input_schema: S({ texto: TXT("nombre o legajo para buscar a alguien (opcional; sin texto = toda la nómina + lo que falta)") }) });',
  'input_schema: S(window.__sec179 ? { texto: TXT("nombre o legajo para buscar a alguien (opcional; sin texto = toda la nómina + lo que falta)"), sector: TXT("filtrar por sector (opcional): alumbrado, civil, ilicitos, contratista, oficina, direccion o panol") } : { texto: TXT("nombre o legajo para buscar a alguien (opcional; sin texto = toda la nómina + lo que falta)") }) });')
R('      if (!q) {\n        var A = await analisis();', '      if (S9) { r.porSector = {}; nomBase().forEach(function (p) { if (p && String(p.nombre || "").trim()) { var k = S9.texto(S9.de(p)); r.porSector[k] = (r.porSector[k] || 0) + 1; } }); if (sf) r.filtro = "sector " + S9.texto(sf) + (sf === "civil" ? " (con los de Alumbrado marcados equipo civil)" : ""); }\n      if (!q && !sf) {\n        var A = await analisis();')
R('if (p.sector && p.sector !== "alumbrado") s.push("sector " + p.sector);', 'if (p.sector && p.sector !== "alumbrado") s.push("sector " + (window.__sec179 ? window.__sec179.texto(window.__sec179.de(p)) : p.sector));')
# ---------- el módulo, antes de revisarAppDiag
CSS = open(os.path.join(SRC, 'sectores179.css'), encoding='utf-8').read()
JS = open(os.path.join(SRC, 'sectores179.js'), encoding='utf-8').read()
R('<script id="revisarAppDiag">', '<style id="sectores179Css">\n' + CSS + '</style>\n<script id="sectores179">\n' + JS + '</script>\n<script id="revisarAppDiag">')
ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
if os.environ.get('SELLO'): ahora = os.environ['SELLO']
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1)
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
