"""v140 · Pedidos de Ángel (10/11/2026):
 1) Remito «inteligente»: al leer un remito o factura, la app se fija si ya se cargó (con la IA o a mano en «Registrar
    movimiento»: entradas de `movimientos` con el mismo proveedor y número normalizados, y resúmenes `remitoRes`), renglón
    por renglón (✅ ya cargado · 🟠 a medias · 💲 sin precio · 🆕 no se cargó · 🔴 sin código), y propone: «➕ Cargar solo lo
    que falta», «Solo los precios que faltan», «Revisar renglón por renglón», «Ver lo cargado» / «Cargar igual» / «Cancelar».
    El bloque nuevo (remito140.js / remito140.css) va DENTRO del módulo remitoFoto, con ganchos chicos en su código.
 2) Asistente (asistenteIaCod, dictado en vivo de la v137): después de enviar, el texto dictado volvía a aparecer en la caja
    (resultados del reconocimiento que llegaban tarde). Ahora cada dictado es una «sesión»: al enviar se corta (abort /
    removeAllListeners del plugin) y lo que llegue de una sesión vieja se descarta; tampoco se pega el texto repetido.
Base: ORIGINAL 139 (la publicada). No hacen falta reglas nuevas (adjuntos/movimientos/catalogoProductos: edita stock)."""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = '0b9dbaba7e4d4a415ee80d3b7ca610dbd9099a13786b5cef14e2c7e5d621eb66'   # ORIGINAL 139 (la publicada)
ent, sal = sys.argv[1], sys.argv[2]
t = open(ent, encoding='utf-8').read()
assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de la 139'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
leer = lambda f: open(os.path.join(SRC, f), encoding='utf-8').read().rstrip() + '\n'
assert t.count('function revisarCargado') == 0

# ======================================================================== 1) remito inteligente
css = leer('remito140.css'); js = leer('remito140.js')
assert ':has(' not in css and ':has(' not in js
R('''@media (max-width:640px){.rf-datos{grid-template-columns:1fr}.rf-fila{grid-template-columns:1fr 1fr}.rf-fila .rf-un{grid-column:1 / -1;padding:0}}
</style>''', '''@media (max-width:640px){.rf-datos{grid-template-columns:1fr}.rf-fila{grid-template-columns:1fr 1fr}.rf-fila .rf-un{grid-column:1 / -1;padding:0}}
''' + css + '''</style>''')
R('''  window.__remitoFoto = { abrir, cerrar,''', js + '''  window.__remitoFoto = { cargado: () => (S && S.prev) || null, numN, provN, mismoProv, movsDelRemito, abrir, cerrar,''')
# al leer: primero «¿ya se cargó?» (entrada); si no, el aviso de repetido de la v138
R('''    pintar();
    revisarRepetido(true);
  }''', '''    if (revisarCargado()) return;   // v140
    pintar();
    revisarRepetido(true);
  }''')
# tarjeta: cartel chico arriba y estado en cada renglón
R('''    hoja(`<div class="rf-sum" id="rfSum">${sumario()}</div><div class="rf-foto">${miniaturas()}<p>Revisá cada renglón''',
  '''    hoja(`${S.prev ? cartelHtml(false) : ""}<div class="rf-sum" id="rfSum">${sumario()}</div><div class="rf-foto">${miniaturas()}<p>Revisá cada renglón''')
R('''    hoja(`<div class="rf-sum" id="rfSum">${sumario()}</div><div class="rf-foto">${miniaturas()}<p><b>💲 Solo precios:</b>''',
  '''    hoja(`${S.prev ? cartelHtml(false) : ""}<div class="rf-sum" id="rfSum">${sumario()}</div><div class="rf-foto">${miniaturas()}<p><b>💲 Solo precios:</b>''')
R('''<span class="rf-grado ${gr}">${et}</span></div>
${x.fuera ?''', '''<span class="rf-grado ${gr}">${et}</span></div>${estFila(x, i)}
${x.fuera ?''')
R('''<span class="rf-grado ${gr}">${et}</span></div>
<div class="rf-flecha">''', '''<span class="rf-grado ${gr}">${et}</span></div>${estFila(x, i, true)}
<div class="rf-flecha">''')
R('''<div class="v7-acc"><button type="button" class="btn-primary" data-rf="si">Sí, cargar entrada</button>''',
  '''<div class="v7-acc">${S.prev && S.prev.revisar ? '<button type="button" class="btn-primary" data-rf="sic">Sí, cargar lo tildado</button>' : '<button type="button" class="btn-primary" data-rf="si">Sí, cargar entrada</button>'}''')
R('''  function resumen() {
''', '''  function resumen() {
    if (S.prev && S.prev.revisar) return resumenCompletar();   // v140
''')
R('''    if (S.modo === "precios") x.usa = usaPorDefecto(x);
    repintarFila(i);''', '''    if (S.prev) reEstados(i);   // v140
    if (S.modo === "precios") x.usa = usaPorDefecto(x);
    repintarFila(i);''')
R('''    if (k === "si") return guardar(b);
''', '''    if (k === "si") return guardar(b);
    if (accionPrev(k, b)) return;   // v140
''')
R('''    if (k === "usa") { S.filas[i].usa = t.checked; refrescarPrecios(); return; }''',
  '''    if (k === "usa") { S.filas[i].usa = t.checked; refrescarPrecios(); return; }
    if (k === "tilde" || k === "psi") { cambioPrev(k, i, t.checked); return; }   // v140''')
# resumen: también numN / provN (para encontrarlo aunque el número o el proveedor vengan escritos distinto); «Solo los
# precios que faltan» actualiza el resumen que ya existe
R('''    const doc = { tipo: "remitoRes", mes: mesDe(ts), clave: claveDe(D.proveedor, D.numero), modo,''',
  '''    if (S && S.prev && S.prev.completando) return actualizarResumen(modo, D, renglones, movIds, fotoIds);   // v140
    const doc = { tipo: "remitoRes", mes: mesDe(ts), clave: claveDe(D.proveedor, D.numero), numN: numN(D.numero), provN: provN(D.proveedor), modo,''')

# ======================================================================== 2) dictado: sesiones (nada vuelve a la caja después de enviar)
R('''          cortarEsc = () => { try { SR.stop(); } catch (e) { } setTimeout(() => fin(""), 800); };''',
  '''          cortarEsc = (ya) => { try { SR.stop(); } catch (e) { } if (ya) { try { const q = SR.removeAllListeners && SR.removeAllListeners(); q && q.catch && q.catch(() => { }); } catch (e) { } fin(""); } else setTimeout(() => fin(""), 800); };   // v140: ya = cortar en seco (al enviar)''')
R('''        cortarEsc = () => { try { r.stop(); } catch (e) { } };
        try { r.start(); }''', '''        cortarEsc = (ya) => {   // v140: ya = cortar en seco (al enviar): sin resultados tardíos
          if (ya) { r.onresult = null; try { if (r.abort) r.abort(); else r.stop(); } catch (e) { } cortarEsc = null; ok({ texto: "", err: "" }); return; }
          try { r.stop(); } catch (e) { }
        };
        try { r.start(); }''')
R('''    function escuchar(enVivo) { const n = nSR(); if (n) return escNativo(n, enVivo); const w = wSR(); if (w) return escWeb(w, enVivo); return Promise.resolve({ texto: "", err: "sin-dictado" }); }
    function pararEscucha() { if (cortarEsc) cortarEsc(); }''',
  '''    // v140: cada dictado es una «sesión». Lo que llega de una sesión vieja (parciales o el final, que a veces llegan tarde,
    // después de enviar) se descarta: no vuelve a escribir en la caja. Y si el reconocedor pega el texto dos veces, queda uno.
    let ses = 0;
    const sinEco = (s) => { s = String(s || ""); const m = /^\\s*(\\S.{2,}?)\\s+\\1\\s*$/.exec(s); return m ? m[1] : s; };
    function escuchar(enVivo) {
      const yo = ++ses;
      const ev = (s) => { if (yo === ses && enVivo) enVivo(sinEco(s)); };
      const n = nSR(), w = n ? null : wSR();
      const pr = n ? escNativo(n, ev) : w ? escWeb(w, ev) : Promise.resolve({ texto: "", err: "sin-dictado" });
      return pr.then((r) => { if (yo !== ses) return { texto: "", err: "", cortado: true }; ses++; return { texto: sinEco(r.texto).trim(), err: r.err }; });
    }
    function pararEscucha() { if (cortarEsc) cortarEsc(); }
    function cortar() { ses++; const f = cortarEsc; if (f) f(true); }''')
R('''    return { hayDictado, hayHabla, escuchar, pararEscucha, hablar,''', '''    return { hayDictado, hayHabla, escuchar, pararEscucha, cortar, sesion: () => ses, hablar,''')
R('''  function pararMic() { if (dictando) VOZ.pararEscucha(); }''',
  '''  function pararMic() { if (dictando) VOZ.pararEscucha(); }
  function cortarMic() { if (dictando || charla.on) VOZ.cortar(); }   // v140: al enviar, el dictado se corta en seco''')
R('''    dictando = false; b && b.classList.remove("on"); ONDA.off();
    if (r.err''', '''    dictando = false; b && b.classList.remove("on"); ONDA.off();
    if (r.cortado) return;   // v140: se envió mientras dictaba: no se vuelve a escribir nada en la caja
    if (r.err''')
R('''    e.preventDefault(); pararMic(); const t = $("iaTxt"); const v = t.value; t.value = ""; t.style.height = ""; enviar(v);''',
  '''    e.preventDefault(); cortarMic(); const t = $("iaTxt"); const v = t.value; t.value = ""; t.style.height = ""; enviar(v);''')

# sello de versión (las dos marcas)
ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1), 'las dos marcas de versión no coinciden'
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
