"""v149 · El micrófono del Asistente ya no se «destilda» solo + el Asistente más rápido.
 · Causa del corte: el reconocedor de voz de Android (y el del navegador con continuous=false) termina solo al primer
   silencio (1–2 s) o a los 5–10 s, y la app tomaba ese final como «terminé de dictar»: apagaba el 🎤 y la onda.
 · Dictar (🎤): queda prendido escribiendo en vivo hasta que la persona lo toca de nuevo, envía, cierra el panel o sale de la
   app. Cada corte del motor se vuelve a prender solo (sesiones encadenadas) y el texto se junta sin repetir. En la app 1.4
   el plugin además se encadena adentro (continuousPTT + muteRecognizerBeep: sin el pitido). Tope por batería: 5 minutos
   sin ninguna palabra, con aviso (a confirmar con Ángel).
 · Charla (🗣): el turno termina con ~1,5 s de silencio después de lo último que se escuchó, no cuando el motor corta.
 · Velocidad: «💭 Pensando…» al instante; respuesta que se va escribiendo mientras llega (solo con el Worker ema-ia v4-ia,
   /salud con stream:true; con el Worker de antes, como hoy); en charla y en preguntas cortas que no piden cambios, effort
   «low»; leer en voz alta desde la primera frase; tiempos de cada pregunta en window.__iaMedidas.
 · Las versiones del Worker se comparan por número (v3-ia o más), no «igual a v3-ia».
Sin reglas nuevas. Sin APK nuevo. Pruebas viejas: __v149No (lo pone el arnés salvo v149:true).
Uso: python3 patch_v149.py ORIGINAL_148.html SALIDA.html [--otra-base]"""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = open(os.path.join(SRC, 'BASE_SHA')).read().strip()   # ORIGINAL 148
args = [a for a in sys.argv[1:] if not a.startswith('--')]
ent, sal = args[0], args[1]
t = open(ent, encoding='utf-8').read()
if '--otra-base' not in sys.argv:
    assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de la 148 (usá --otra-base si sabés lo que hacés)'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
leer = lambda f: open(os.path.join(SRC, f), encoding='utf-8').read().rstrip('\n')
assert t.count('v149') == 0, 'ya tiene la v149'

# ============================================================== 0) versiones del Worker por número (v4-ia también vale)
R('if (j && j.ok && j.version === "v3-ia") {', 'if (j && j.ok && /^v([3-9]|\\d{2,})-ia/.test(String(j.version || ""))) { /* v149: v3-ia o más nuevo */')
R('if (window.__iaCompat || !ema || ema.version === "v3-ia") return;', 'if (window.__iaCompat || !ema || /^v([3-9]|\\d{2,})-ia/.test(String(ema.version || ""))) return;   // v149: v3-ia o más nuevo')

# ============================================================== 1) VOZ: micrófono largo (sesiones encadenadas) y voz desde la primera frase
R('''    return { hayDictado, hayHabla, escuchar, pararEscucha, cortar, sesion: () => ses, hablar, callar, paraVoz, hablando: () => hablando, nativo: () => ({ dictado: !!nSR(), habla: !!nTTS() }) };
  })();''', leer('voz149.js') + '''
    return { hayDictado, hayHabla, escuchar, escucharLargo, pararEscucha, cortar, sesion: () => ses, hablar, hablante, callar, paraVoz, juntar, largo: () => (largo ? largo.estado() : null), hablando: () => hablando, nativo: () => ({ dictado: !!nSR(), habla: !!nTTS() }) };
  })();''')
R('''    function pararEscucha() { if (cortarEsc) cortarEsc(); }
    function cortar() { ses++; const f = cortarEsc; if (f) f(true); }''', '''    function pararEscucha() { if (largo) { largo.parar(); return; } if (cortarEsc) cortarEsc(); }   // v149: el micrófono largo se apaga prolijo (guarda lo último)
    function cortar() { ses++; if (largo) { largo.cortar(); return; } const f = cortarEsc; if (f) f(true); }''')

# ============================================================== 2) 🎤 dictar: prendido hasta que la persona lo apaga
R('''    dictando = true; b && b.classList.add("on"); ayudaMic(""); ONDA.on("dicta"); base0 = t.value ? t.value.replace(/\\s*$/, " ") : "";
    const r = await VOZ.escuchar((s) => { t.value = base0 + s; enVivoCaja(t); ONDA.pulso(s); });
    dictando = false; b && b.classList.remove("on"); ONDA.off();
    if (r.cortado) return;   // v140: se envió mientras dictaba: no se vuelve a escribir nada en la caja
    if (r.err && r.err !== "sin-dictado") ayudaMic("🎤 " + r.err.charAt(0).toUpperCase() + r.err.slice(1) + ". Si no, usá el micrófono del teclado.");
    else if (r.texto) t.value = base0 + r.texto;
  }''', '''    dictando = true; b && b.classList.add("on"); b && b.setAttribute("aria-pressed", "true"); ayudaMic(""); ONDA.on("dicta"); base0 = t.value ? t.value.replace(/\\s*$/, " ") : "";
    const cb = (s) => { t.value = base0 + s; enVivoCaja(t); ONDA.pulso(s); };
    // v149: el micrófono queda prendido hasta que la persona lo toca de nuevo, envía, cierra el panel o sale de la app
    const r = micLargo() ? await VOZ.escucharLargo(cb, { topeSinPalabras: window.__micTope || MIC_TOPE }) : await VOZ.escuchar(cb);
    dictando = false; b && b.classList.remove("on"); b && b.setAttribute("aria-pressed", "false"); ONDA.off();
    if (r.cortado) return;   // v140: se envió mientras dictaba: no se vuelve a escribir nada en la caja
    if (r.err && r.err !== "sin-dictado") ayudaMic("🎤 " + r.err.charAt(0).toUpperCase() + r.err.slice(1) + ". Si no, usá el micrófono del teclado.");
    else {
      if (r.texto) t.value = base0 + r.texto;
      if (r.silencio) ayudaMic(r.texto ? "🎤 Apagué el micrófono porque no escuché nada más. Tocalo para seguir." : "🎤 Apagué el micrófono porque no escuché nada.");
    }
  }
  // v149 · el micrófono largo (pruebas viejas: __v149No / __micViejo → el de antes, que termina con el motor)
  const MIC_TOPE = 5 * 60000;   // tope por batería: 5 minutos sin ninguna palabra (a confirmar con Ángel)
  const micLargo = () => !window.__v149No && !window.__micViejo;''')

# ============================================================== 3) 🗣 charla: fin de turno por silencio propio, voz desde la primera frase
R('''      const r = await VOZ.escuchar((s) => { const t = $("iaTxt"); if (t) { t.value = s; enVivoCaja(t); } ONDA.pulso(s); barraCharla("🎤 " + s.slice(-70), "escucha"); });
      ONDA.off();''', '''      const cbc = (s) => { const t = $("iaTxt"); if (t) { t.value = s; enVivoCaja(t); } ONDA.pulso(s); barraCharla("🎤 " + s.slice(-70), "escucha"); };
      // v149: el motor puede cortar a mitad de frase: se vuelve a prender y el turno termina con ~1,5 s de silencio
      const r = micLargo() ? await VOZ.escucharLargo(cbc, { finSilencio: window.__charlaFin || CHARLA_FIN, topeSinPalabras: CHARLA_SILENCIO }) : await VOZ.escuchar(cbc);
      ONDA.off();''')
R('''        if (Date.now() - charla.ult > CHARLA_SILENCIO) { salirCharla("🗣 Pausé la charla: 2 minutos sin hablar. Tocá 🗣 para seguir."); break; }''',
  '''        if (r.silencio || Date.now() - charla.ult > CHARLA_SILENCIO) { salirCharla("🗣 Pausé la charla: 2 minutos sin hablar. Tocá 🗣 para seguir."); break; }''')
R('''      let resp = "";
      const Pp = ultimaPendiente();''', '''      let resp = "", hv = null;
      const Pp = ultimaPendiente();''')
R('''        try { await resumirCharla(); } catch (e) { }
        resp = await enviar(txt, true);''', '''        try { await resumirCharla(); } catch (e) { }
        hv = micLargo() ? VOZ.hablante({ alEmpezar: () => { if (charla.on) barraCharla("🔊 Hablando…", "habla"); } }) : null;   // v149: habla desde la primera frase
        resp = await enviar(txt, true, hv ? { hablante: hv } : undefined);''')
R('''      if (!charla.on) break;
      if (resp) { barraCharla("🔊 Hablando…", "habla"); await VOZ.hablar(resp); }''', '''      if (!charla.on) { if (hv) hv.cortar(); break; }
      if (resp) { barraCharla("🔊 Hablando…", "habla"); if (hv) await hv.fin(resp); else await VOZ.hablar(resp); }''')
R('''  const CHARLA_SILENCIO = 120000;''', '''  const CHARLA_SILENCIO = 120000;
  const CHARLA_FIN = 1500;   // v149: silencio después de lo último que se escuchó para dar el turno por terminado''')

# salir de la app apaga el micrófono (guarda lo dictado)
R('''  document.addEventListener("visibilitychange", () => { if (document.hidden && charla.on) salirCharla("🗣 La charla se cortó porque saliste de la app."); });''',
  '''  document.addEventListener("visibilitychange", () => { if (document.hidden && charla.on) salirCharla("🗣 La charla se cortó porque saliste de la app."); if (document.hidden && dictando && micLargo()) pararMic(); });   // v149: salir de la app apaga el 🎤''')

# ============================================================== 4) velocidad: stream, «pensando» al instante, effort, medidas
R('''    let ctl = null, tm = null; try { ctl = new AbortController(); tm = setTimeout(() => ctl.abort(), modelo === OPUS || modelo === FABLE ? 240000 : 90000); } catch (e) { ctl = null; }
    let r = null;
    try { r = await fetch(URL_IA, { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + tok }, body: JSON.stringify(cuerpo(msgs, modelo, sinHerr, op)), signal: ctl ? ctl.signal : undefined }); }
    catch (e) { throw errIa(navigator.onLine === false ? SIN_SENAL : (e && e.name === "AbortError" ? "El asistente tardó demasiado. Probá de nuevo." : "No pude hablar con el asistente (¿hay señal?). Probá de nuevo en un rato."), "red"); }
    finally { clearTimeout(tm); }
    let j = null; try { j = await r.json(); } catch (e) { j = null; }''', '''    let ctl = null, tm = null; try { ctl = new AbortController(); tm = setTimeout(() => ctl.abort(), modelo === OPUS || modelo === FABLE ? 240000 : 90000); } catch (e) { ctl = null; }
    let r = null;
    const M = op.medir || null, ta = ahoraMs();
    const st = !!(op.onTexto && !sinHerr && streamOk());   // v149: la respuesta se va mostrando mientras llega (Worker v4-ia)
    const cu = cuerpo(msgs, modelo, sinHerr, op); if (st) cu.stream = true;
    const bodyTx = JSON.stringify(cu);
    if (M) { M.armar += ahoraMs() - ta; M.bytes += bodyTx.length; M.stream = M.stream || st; }
    const tr = ahoraMs();
    try { r = await fetch(URL_IA, { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + tok }, body: bodyTx, signal: ctl ? ctl.signal : undefined }); }
    catch (e) { throw errIa(navigator.onLine === false ? SIN_SENAL : (e && e.name === "AbortError" ? "El asistente tardó demasiado. Probá de nuevo." : "No pude hablar con el asistente (¿hay señal?). Probá de nuevo en un rato."), "red"); }
    finally { clearTimeout(tm); }
    let j = null;
    const ct = (r.headers && r.headers.get && r.headers.get("Content-Type")) || "";
    if (r.ok && /event-stream/i.test(ct)) { try { j = await leerSSE(r, op.onTexto); } catch (e) { throw errIa("Se cortó la respuesta del asistente. Probá de nuevo.", "red"); } }
    else { try { j = await r.json(); } catch (e) { j = null; } }
    if (M) M.red += ahoraMs() - tr;''')
R('''    try { avisoWorkerV3(j.ema); } catch (e) { }
    return j;
  }''', '''    try { avisoWorkerV3(j.ema); } catch (e) { }
    try { marcarVersion(j.ema && j.ema.version); } catch (e) { }   // v149: ¿el Worker ya transmite?
    return j;
  }
''' + leer('stream149.js'))

# turno: cada vuelta avisa el texto que llega y cuándo pide herramientas; mide las herramientas
R('''      const resp = await pedir(msgs, modelo, false, op);
      if (resp.__modelo) modelo = resp.__modelo;''', '''      const opV = op.onTexto ? Object.assign({}, op, { onTexto: ((vv) => (tx) => op.onTexto(tx, vv))(v) }) : op;   // v149
      const resp = await pedir(msgs, modelo, false, opV);
      if (resp.__modelo) modelo = resp.__modelo;''')
R('''      usos.forEach((u) => { if (vistos.indexOf(u.name) < 0) vistos.push(u.name); });
      textos.length && estado(textos.join("\\n").slice(0, 160));''', '''      usos.forEach((u) => { if (vistos.indexOf(u.name) < 0) vistos.push(u.name); });
      try { op.alUsar && op.alUsar(); } catch (e) { }   // v149: el texto que se venía mostrando pasa a la línea de estado
      textos.length && estado(textos.join("\\n").slice(0, 160));''')
R('''        estado(ESTADOS[u.name] || "…");
        const out = await ejecutar(u.name, u.input);''', '''        estado(ESTADOS[u.name] || "…");
        const th = ahoraMs();
        const out = await ejecutar(u.name, u.input);
        if (op.medir) { op.medir.herr += ahoraMs() - th; op.medir.nHerr++; }''')

# enviar: «pensando» al instante, effort más liviano para charla y preguntas cortas, burbuja en vivo, voz desde la primera frase
R('''    ocupado = true; pintarPie();
    // v136: charla larga → conversación nueva desde un resumen (la historia nunca se recorta ni se edita)''', '''    ocupado = true; pintarPie();
    const v149 = !window.__v149No, med = v149 ? { t0: ahoraMs(), armar: 0, red: 0, herr: 0, nHerr: 0, bytes: 0, vueltas: 0, primero: 0, pintar: 0, stream: false, effort: "" } : null;
    if (v149) estado("💭 Pensando…");   // v149: que se vea al instante que la pregunta salió
    let hv = op.hablante || null, vivoEl = null, vivoV = -1;
    const quitarVivo = () => { if (vivoEl) { try { vivoEl.remove(); } catch (e) { } vivoEl = null; } };
    const onTexto = (tx, v) => {   // v149: lo que va llegando (Worker v4-ia)
      if (!tx || !String(tx).trim()) return;
      if (med && !med.primero) med.primero = ahoraMs() - med.t0;
      if (v !== vivoV) { vivoV = v; if (hv) hv.parte(); }
      const c = chat(); if (!c) return;
      if (!vivoEl || !vivoEl.isConnected) { estado(""); vivoEl = document.createElement("div"); vivoEl.className = "ia-b ia ia-vivo"; vivoEl.id = "iaVivo"; c.appendChild(vivoEl); }
      vivoEl.innerHTML = `<div class="ia-quien"><span class="ia-ava">✨</span><b>EMA</b> · ${horaYa()}</div>` + md(tx); bajar();
      if (!hv && !deVoz && leerSiempre()) hv = VOZ.hablante();
      if (hv) hv.poner(tx);
    };
    // v136: charla larga → conversación nueva desde un resumen (la historia nunca se recorta ni se edita)''')
R('''      const ef = op.effort || effortPara(texto), rap = !op.effort && !window.__iaCompat && ef === "low" && datoSimple(texto);   // v137: dato simple → rápido
      const opT = ef ? { effort: ef, rapido: rap } : {}; if (op.tipo) opT.tipo = op.tipo;   // v141''', '''      let ef = op.effort || effortPara(texto); const liv = !op.effort && v149 && !window.__iaCompat && !ef && ligera(texto, deVoz);
      if (liv) ef = "low";   // v149: charla por voz y preguntas cortas que no piden cambios → effort «low» (lo que revisa o propone, igual que antes)
      const rap = !op.effort && !window.__iaCompat && ef === "low" && (datoSimple(texto) || liv);   // v137: dato simple → rápido
      const opT = ef ? { effort: ef, rapido: rap } : {}; if (op.tipo) opT.tipo = op.tipo;   // v141
      if (v149) { opT.onTexto = onTexto; opT.alUsar = quitarVivo; opT.medir = med; med.effort = ef || "medium"; med.modelo = modelo; }''')
R('''      if (r.escalar) { modelo = SONNET; r = await turno(base, userMsg, SONNET, opT); }
      estado("");''', '''      if (r.escalar) { quitarVivo(); modelo = SONNET; r = await turno(base, userMsg, SONNET, opT); }
      estado(""); quitarVivo();
      if (hv && (r.rechazo || r.error || r.escalar)) hv.parte();   // v149: el error se lee entero''')
R('''      ultimo = { texto: resp, modelo: r.modelo || modelo, props: r.props.length };
      agregarBurbuja("ia", resp, r.vistos);''', '''      ultimo = { texto: resp, modelo: r.modelo || modelo, props: r.props.length };
      const tp = ahoraMs();
      agregarBurbuja("ia", resp, r.vistos);
      if (med) { med.pintar = ahoraMs() - tp; if (!med.primero) med.primero = ahoraMs() - med.t0; med.total = ahoraMs() - med.t0; med.texto = texto.slice(0, 60); guardarMedida(med); }''')
R('''      if (!deVoz && leerSiempre()) VOZ.hablar(resp);   // v134: «🔊 leer siempre en voz alta»''', '''      if (hv && !op.hablante) hv.fin(resp);   // v149: ya venía leyendo desde la primera frase
      else if (!deVoz && leerSiempre() && !hv) VOZ.hablar(resp);   // v134: «🔊 leer siempre en voz alta»''')
R('''    } catch (e) {
      estado(""); notas = nota.concat(notas);''', '''    } catch (e) {
      estado(""); quitarVivo(); notas = nota.concat(notas); if (hv) hv.parte();''')
R('''  function datoSimple(t) { t = String(t || ""); return !window.__iaCompat && t.length <= 140 && SIMPLE.test(t) && !COMPLEJO.test(t); }''', '''  function datoSimple(t) { t = String(t || ""); return !window.__iaCompat && t.length <= 140 && SIMPLE.test(t) && !COMPLEJO.test(t); }
  // v149: más liviano (effort «low») = charla por voz o pregunta corta, sin nada que revise, cierre, arme o cambie
  function ligera(t, deVoz) { t = String(t || ""); return !COMPLEJO.test(t) && !quiereCierre(t) && !quiereRevision(t) && !quiereSonnet(t) && (deVoz || charla.on || t.length <= 80); }''')

# al abrir el panel se pregunta (cada 6 h) si el Worker ya transmite
R('''    pintarQueda(); try { window.__iaUso && window.__iaUso.mio(); } catch (e) { }   // v141: «Te quedan N preguntas hoy»
  }''', '''    pintarQueda(); try { window.__iaUso && window.__iaUso.mio(); } catch (e) { }   // v141: «Te quedan N preguntas hoy»
    try { revisarSalud(); } catch (e) { }   // v149: ¿el Worker es v4-ia (respuesta en vivo)?
  }''')
R('''charla: () => ({ on: charla.on, idas: charla.idas }), entrarCharla,''', '''charla: () => ({ on: charla.on, idas: charla.idas }), streamOk, revisarSalud, medidas: () => MEDIDAS.slice(), ligera, entrarCharla,''')

# CSS: la burbuja que se va escribiendo
R('''#iaPanel .ia-est{''', '''#iaPanel .ia-b.ia-vivo::after{content:"";display:inline-block;width:7px;height:15px;margin-left:3px;vertical-align:-2px;background:var(--navy-2,#1F5F86);border-radius:2px;animation:iaCaret 1s steps(2,start) infinite}   /* v149 */
@keyframes iaCaret{to{visibility:hidden}}
@media (prefers-reduced-motion:reduce){#iaPanel .ia-b.ia-vivo::after{animation:none}}
#iaPanel .ia-est{''')

# sello de versión (las dos marcas)
ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1), 'las dos marcas de versión no coinciden'
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
