// v159 · Crear tareas nuevas con el asistente (y a mano), con los puntos de la fórmula (HH × D) y comparadas con las parecidas.
//  0) asistente: «quiero una tarea nueva: pintar las bases de las columnas, más o menos media hora por columna entre dos» →
//     tarjeta con HH 1 (0,5 h × 2), factores, D, la cuenta, parecidas, pasos, fotos, ítem y avance, «Sí, crearla» / «Cambiar
//     algo» / «No»; nada se escribe antes del «Sí»; con el «Sí» queda en el baremo con su historial y auditoría.
//  1) la tarea creada aparece en Llenar orden, en la sugerida (rendimiento y «quedan N»), en Modo obra (columna por columna) y
//     en el avance nuevo; una orden cerrada da los puntos calculados (puntosDeOrden) y el auditor v154 dice de dónde salen.
//  2) a mano en Producción: la calculadora (HH, minutos × personas, los 4 factores, D, puntos, parecidas), el aviso de «no es
//     justa» con un valor muy distinto, crear con motivo y «Sí».
//  3) editar con motivo e historial; dar de baja (no aparece más en Llenar orden ni en la sugerida) y reactivar.
//  4) permisos: cuadrilla, pañol, «solo mirar» y Dirección no crean (ni la herramienta del asistente).
const { abrir, prueba, DOM } = require('./h');
const { datos158 } = require('./datos158');
const cel = process.argv[2] === 'cel';
const CAP = process.env.CAP || '';
const SOLO = (x) => !process.env.SOLO || process.env.SOLO.indexOf(x) >= 0;
const W = 'https://ema-ia.mdiaz-60f.workers.dev';
function datos159(op = {}) {
  const d = datos158({ juanNueva: !!op.juan });
  d.cuentas['pan@' + DOM] = { pass: 'clave123', uid: 'uPan' };
  d.db.usuarios.uPan = { email: 'pan@' + DOM, usuario: 'pan', nombre: 'Pablo Pañol', rol: 'panol', activo: true };
  if (op.baremo) d.db.configEquipo.baremo = Object.assign({}, d.db.configEquipo.baremo || {}, JSON.parse(JSON.stringify(op.baremo)));
  if (op.k) {
    const k = op.k;
    if (d.db.ordenesTrabajo.o309) { d.db.ordenesTrabajo.o309.actividades = [k]; d.db.ordenesTrabajo.o309.previsto = { [k]: 3 }; }
    const f = d.db.ordenesTrabajo.o302.fecha;
    d.db.ordenesTrabajo.o311 = Object.assign(JSON.parse(JSON.stringify(d.db.ordenesTrabajo.o302)), { numero: 'OT-2026-311', actividades: [k], previsto: { [k]: 3 }, campo: {}, cierre: { cerradoTs: Date.now() - 3600e3, fecha: f, cantidades: { [k]: 3 }, puntos: { total: 3, ts: Date.now() - 3600e3, renglones: [{ k, tarea: 'Pintura de bases de columna', cant: 3, un: 'columna', ptsUnit: 1, pts: 3 }], porPersona: [{ nombre: 'Juan Pérez', rol: 'Oficial', pts: 1.88 }, { nombre: 'Pedro Gómez', rol: 'Ayudante', pts: 1.12 }] }, horas: 8, avanceItems: [] } });
  }
  return d;
}
(async () => {
  const c = prueba('v159' + (cel ? ' cel' : ''));
  const MOD = { cel, espera: 5000, crew: true, nav: true, mtNuevo: true, tarjetas: true, ofPasos: true, porPartes: true, https: true, inicio: true, sugerida: true, iaPro: true, v145: true, v146: true, v147: true, v150: true, v151: true, v152: true, v153: true, v154: true, v155: true, v156: true, v157: true, v158: true, v159: true, reglas: !!process.env.REGLAS, antes: () => { window.__pmPausa = true; window.__hvPausa = true; window.__isNoAuto = true; window.__aaPausa = true; window.__cvSinMic = true; } };
  let browser = null;
  const sesion = async (quien, op, dop) => { const A = await abrir(Object.assign({ sesion: quien, datos: datos159(dop || {}), browser }, MOD, op || {})); browser = A.browser; A.page.on('dialog', (x) => x.accept()); await A.page.waitForTimeout(1200); return A; };
  const db = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('stub.db') || '{}'));
  const scrollX = (p) => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const foto = async (p, nombre, sel) => { if (!CAP) return; await p.evaluate((s) => { if (s) { const e = document.querySelector(s); e && e.scrollIntoView({ block: 'start' }); } }, sel); await p.waitForTimeout(350); await p.screenshot({ path: CAP + '/' + nombre + '_' + (cel ? 'cel' : 'pc') + '.png' }); };
  const errsJs = (A) => (A.errores || []).filter((e) => !/Missing or insufficient permissions|permission-denied|ERR_|Failed to fetch|aborted|fetching the script|prueba|sin permiso|Sin permiso/i.test(e));
  const tx = (p, s) => p.evaluate((x) => { const e = document.querySelector(x); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; }, s);
  const esperar = async (p, fn, arg, ms) => { for (let i = 0; i < (ms || 40); i++) { if (await p.evaluate(fn, arg)) return true; await p.waitForTimeout(250); } return false; };
  let n = 0;
  const usa = (name, input) => ({ id: 'msg_' + (++n), type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text: 'Miro.' }, { type: 'tool_use', id: 'tu_' + n, name, input }], stop_reason: 'tool_use', usage: { input_tokens: 900, output_tokens: 40 }, ema: { costoUsd: 0.01, version: 'v5-ia' } });
  const fin = (text) => ({ id: 'msg_' + (++n), type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text }], stop_reason: 'end_turn', usage: { input_tokens: 1000, output_tokens: 60 }, ema: { costoUsd: 0.02, version: 'v5-ia' } });
  async function worker(p) {
    const st = { pedidos: [], cola: [] };
    await p.route(W + '/ia', async (rt) => { let b = null; try { b = JSON.parse(rt.request().postData() || 'null'); } catch (e) { } st.pedidos.push(b); const f = st.cola.shift(); const x = typeof f === 'function' ? f(b) : f; return rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(x || fin('Listo.')) }); });
    await p.route(W + '/mio', (rt) => rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, version: 'v5-ia', habilitado: true, quedanPreguntas: 30, topePreguntas: 30 }) }));
    await p.route(W + '/uso', (rt) => rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, version: 'v5-ia', gastoMes: 12.4, tope: 100, partes: {} }) }));
    await p.route(W + '/salud', (rt) => rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, version: 'v5-ia' }) }));
    return st;
  }
  const esperarIa = async (p) => { for (let i = 0; i < 120; i++) { await p.waitForTimeout(150); if (await p.evaluate(() => { const b = document.getElementById('iaEnviar'); return !!b && !b.disabled; })) return; } };
  const decir = async (p, sw, frase, guion) => { sw.cola.push(...guion); const n0 = sw.pedidos.length; await p.fill('#iaTxt', frase); await p.click('#iaEnviar'); await p.waitForTimeout(300); await esperarIa(p); await p.waitForTimeout(400); return sw.pedidos.slice(n0); };
  const resultado = (ped, i) => { const m = (ped[i] || {}).messages || []; const u = m[m.length - 1] || {}; const b = (u.content || []).find((x) => x.type === 'tool_result'); if (!b) return ''; const x = b.content; return typeof x === 'string' ? x : Array.isArray(x) ? x.map((y) => (y && y.type === 'text' ? y.text : JSON.stringify(y))).join(' ') : JSON.stringify(x); };
  const herramientas = (ped) => ((ped[0] || {}).tools || []).map((t) => t.name);
  const produccion = async (p) => { await p.evaluate(() => mostrarVista('produccion')); await p.waitForTimeout(600); await p.evaluate(() => { const b = [...document.querySelectorAll('#subtabsProd .subtab')].find((x) => /vale/i.test(x.textContent)); b && b.click(); }); await p.waitForTimeout(1600); };
  const FRASE = 'quiero una tarea nueva: pintar las bases de las columnas, más o menos media hora por columna entre dos';
  const ENTRADA = { nombre: 'Pintura de bases de columna', descripcion: 'pintar las bases de las columnas con esmalte', unidad: 'columna', minutos_por_unidad: 30, personas: 2 };
  let BAREMO = null, K = '';

  // ================================================================= 0) el asistente arma la tarea y con «Sí» la crea
  {
    const A = await sesion('lucia'); const p = A.page;
    await p.waitForTimeout(2000);
    await esperar(p, () => typeof window.__asistenteAbrir === 'function', null, 80); const sw = await worker(p); await p.evaluate(() => window.__asistenteAbrir()); await p.waitForTimeout(700);
    const ped = await decir(p, sw, FRASE, [usa('proponer_tarea_nueva', ENTRADA), fin('Te armé la tarea: 1 HH × 1,00 = 1 pts por columna.')]);
    const r1 = resultado(ped, 1);
    c(herramientas(ped).indexOf('proponer_tarea_nueva') >= 0 && herramientas(ped).indexOf('proponer_editar_tarea') >= 0, 'la oficina tiene proponer_tarea_nueva y proponer_editar_tarea');
    c(/TAREAS NUEVAS \(v159\)/.test(JSON.stringify((ped[0] || {}).system || '')), 'el SISTEMA le dice que puede crear tareas con HH × D y compararlas con las parecidas');
    c(/pendiente_de_confirmacion/.test(r1) && /1 HH × 1,00 = 1 pts por columna/.test(r1) && /Pintura de columna/.test(r1), 'proponer_tarea_nueva arma la tarea (no guarda): la cuenta y las parecidas · ' + r1.slice(0, 260));
    const card = await tx(p, '#iaChat .ia-conf:last-of-type');
    c(/0,5 h × 2 personas = 1 HH/.test(card) && /D = 1 \+ 0,2 × 0 = 1/.test(card) && /1 HH × 1,00 = 1 pts por columna/.test(card), 'la tarjeta: HH 1 (0,5 h × 2), D y la cuenta de los puntos a la vista · ' + card.slice(0, 260));
    c(/Altura/.test(card) && /Pesado/.test(card) && /Riesgo eléctrico/.test(card) && /Oficio/.test(card) && /estimado · a confirmar/.test(card), 'los 4 factores con lo estimado marcado «estimado · a confirmar»');
    c(/Pintura de columna/.test(card) && /pts\/h/.test(card) && /está pareja|parecidas/.test(card), 'las parecidas con sus pts por hora y si es justa');
    c(/Pasos/.test(card) && /Fotos que pide/.test(card) && /Itemizado/.test(card) && /No mueve el itemizado/.test(card) && /Avance de obra/.test(card) && /Columnas/.test(card) && /Orden sugerida/.test(card) && /16 columna por día con 2/.test(card), 'pasos, fotos, ítem (no mueve lo que se cobra), avance (una cosa en Columnas) y rendimiento (16 por día con 2)');
    const bot = await p.evaluate(() => { const c = [...document.querySelectorAll('#iaChat .ia-conf')].pop(); return [...c.querySelectorAll('button')].map((b) => b.textContent.trim()); });
    c(bot.indexOf('Sí, crearla') >= 0 && bot.indexOf('Cambiar algo') >= 0 && bot.indexOf('No') >= 0, '«Sí, crearla» / «Cambiar algo» / «No» · ' + bot.join(' | '));
    await foto(p, 'tarjeta_asistente', '#iaChat .ia-conf:last-of-type');
    let d = await db(p);
    c(!((d.configEquipo.baremo || {}).tareasPropias || []).length, 'antes del «Sí» no se escribe nada');
    await p.click('#iaChat .ia-conf:last-of-type [data-tn2cambiar]'); await p.waitForTimeout(200);
    c(/Decime qué cambio/.test(await tx(p, '#iaChat .ia-conf:last-of-type .ia-conf-msg')), '«Cambiar algo» pide qué cambiar (no guarda)');
    await p.click('#iaChat .ia-conf:last-of-type [data-iasi]'); await p.waitForTimeout(2000);
    d = await db(p);
    const b = d.configEquipo.baremo || {}, s = (b.tareasPropias || []).find((x) => x.label === 'Pintura de bases de columna') || {};
    K = s.id || ''; BAREMO = b;
    const h = (b.hist || []).find((x) => x.k === K) || {};
    c(K && s.pts === 1 && s.hh === 1 && s.un === 'columna' && s.t159 && s.t159.cuenta === '1 HH × 1,00 = 1 pts por columna' && s.t159.creado && s.t159.creado.porAsistente, 'con «Sí»: la tarea queda en el baremo (1 HH, 1 pt por columna, la cuenta y que la hizo el asistente) · ' + JSON.stringify({ id: s.id, pts: s.pts, hh: s.hh, un: s.un, cuenta: s.t159 && s.t159.cuenta }));
    c(b.baremo && b.baremo[K] && b.baremo[K].pts === 1 && h.tipo === 'nueva' && h.despues === 1 && /asistente/.test(h.motivo || '') && h.porAsistente, 'el valor en «Cuánto vale cada tarea» y el historial del baremo con el motivo · ' + JSON.stringify(h).slice(0, 200));
    c(Object.values(d.auditoria || {}).some((x) => x.tipo === 'tarea_nueva' || x.accion === 'tarea_nueva' || /tarea_nueva/.test(JSON.stringify(x))), 'auditoría «tarea_nueva»');
    const dupl = await p.evaluate((e) => window.__tareaNueva2.proponer(e), ENTRADA);
    c(dupl.err && /Ya hay una tarea/.test(dupl.err), 'si ya existe con ese nombre, no la duplica · ' + dupl.err);
    c((await scrollX(p)) <= 0, 'sin scroll de costado');
    c(!errsJs(A).length, 'sin errores de JS ' + JSON.stringify(errsJs(A).slice(0, 3)));
    await A.ctx.close();
  }

  // ================================================================= 1) aparece en todos lados y da los puntos de la fórmula
  if (SOLO('1') && K) {
    const A = await sesion('lucia', {}, { baremo: BAREMO, k: K }); const p = A.page;
    await p.waitForTimeout(1500);
    await p.evaluate(() => mostrarVista('parte')); await p.waitForTimeout(900);
    c(await p.evaluate((k) => !!document.querySelector('#otActividades .ot-act-check[value="' + k + '"]'), K), 'aparece en «Llenar orden»');
    const sg = await p.evaluate((k) => { const r = window.__sugerida.rend(k, { rend: {}, jornada: 8, angel: {} }, { gente: 2 }); const o = avanceObras.find((x) => x.id === 'b1'); const T = window.__tn2T(o, window.saldoObra('b1').tareas)[k]; const f = new Date(); f.setDate(f.getDate() + 2); if (f.getDay() === 0) f.setDate(f.getDate() + 1); const iso = f.getFullYear() + '-' + String(f.getMonth() + 1).padStart(2, '0') + '-' + String(f.getDate()).padStart(2, '0'); const d = window.__sugerida.armar(iso); const ob = d.ordenes.find((x) => x.obraId === 'b1'); return { rend: r && r.porHH, txt: r && r.txt, T, en: !!ob && (ob.tareas.some((t) => t.k === k) || (ob.pendientes || []).indexOf(k) >= 0), ids: window.__tn2Ids() }; }, K);
    c(sg.rend === 1 && /Diccionario: 1 HH por columna/.test(sg.txt || '') && sg.T && sg.T.total === 12 && sg.T.queda === 9 && sg.en, 'en la orden sugerida: rendimiento de la fórmula (1 HH por columna) y «quedan 9 de 12» por el avance de la obra · ' + JSON.stringify(sg).slice(0, 220));
    const av = await p.evaluate((k) => { const E = window.__av2.estado('b1'); const x = E.L.cosas.find((y) => y.id === 't_' + k); return x ? { r: x.r, tot: x.tot, h: E.RC[x.id].h, label: x.label } : null; }, K);
    c(av && av.r === 'columnas' && av.tot === 12 && av.h === 3, 'en el avance nuevo: una cosa en «Columnas», una por columna (12), con las 3 de la orden cerrada · ' + JSON.stringify(av));
    const pts = await p.evaluate(() => { const z = window.puntosDeOrden(ordenesTrabajo.find((x) => x.id === 'o311'), true); return { t: z.total, por: z.porPersona.map((x) => x.nombre.split(' ')[0] + ' ' + Math.round(x.pts * 100) / 100).join() }; });
    c(Math.abs(pts.t - 3) < 0.01, 'una orden cerrada con 3 columnas da 3 × 1 = 3 puntos (puntosDeOrden) · ' + JSON.stringify(pts));
    const ex = await p.evaluate((k) => { const E = window.__auditPuntos.explicarOrden('o311', { tarea: k }); const t = (E.tareas || []).find((x) => x.k === k) || {}; return { cuenta: t.cuenta, de: t.deDondeSaleElValor || '', err: E.err }; }, K);
    c(/3 columnas × 1 = 3 pts/.test(ex.cuenta || '') && /fórmula de siempre \(puntos = HH × D\)/.test(ex.de) && /1 HH × 1,00 = 1 pts por columna/.test(ex.de) && /0,5 h × 2 personas/.test(ex.de) && /con el asistente/.test(ex.de), 'el auditor v154 explica de dónde salen (la fórmula, las horas y quién la creó) · ' + JSON.stringify(ex).slice(0, 300));
    c(!errsJs(A).length, 'sin errores de JS ' + JSON.stringify(errsJs(A).slice(0, 3)));
    await A.ctx.close();
    const B = await sesion('juan', { cel: true }, { baremo: BAREMO, k: K, juan: true }); const q = B.page;
    await q.evaluate(() => mostrarVista('inicio')); await q.waitForTimeout(600); await q.evaluate(() => window.__cuadrillaDia.ir('obra')); await q.waitForTimeout(900);
    const mo = await tx(q, '#cdApp');
    c(/Pintura de bases de columna/.test(mo) && /Col \d+/.test(mo), 'Modo obra de la cuadrilla con la tarea nueva, columna por columna · ' + mo.slice(0, 160));
    await B.ctx.close();
  }

  // ================================================================= 2) a mano en Producción: la calculadora
  if (SOLO('2')) {
    const A = await sesion('lucia'); const p = A.page;
    await produccion(p);
    c(await p.evaluate(() => !!document.querySelector('#tnCard [data-tn2]')), 'Producción › «＋ Crear tarea» con la calculadora');
    await p.fill('#tn2Nom', 'Limpieza de cajas de columna'); await p.fill('#tn2Desc', 'limpiar por dentro la caja bornera de cada columna'); await p.fill('#tn2Un', 'caja');
    await p.fill('#tn2Min', '20'); await p.fill('#tn2Per', '2');
    await p.click('#tnCard [data-tn2f="rie"]'); await p.waitForTimeout(500);
    let res = await tx(p, '#tn2Res'), par = await tx(p, '#tn2Par');
    c(/0,67 HH × 1,20 = 0,8 pts por caja/.test(res) && /0,33 h × 2 personas = 0,67 HH/.test(res) && /D = 1 \+ 0,2 × 1 = 1,2/.test(res), 'HH de minutos × personas, D y los puntos se recalculan solos · ' + res);
    c(/Fusibles, portafusibles y borneras/.test(par) && /pts\/h/.test(par) && /Itemizado/.test(par) && /Avance de obra/.test(par), 'las parecidas al lado (con pts por hora), el ítem y el avance · ' + par.slice(0, 200));
    await foto(p, 'calculadora_mano', '#tn2Res');
    await p.fill('#tn2Pts', '3'); await p.waitForTimeout(500);
    const av = await tx(p, '#tn2Avisos');
    c(/muy por encima, revisá/.test(av) && /a mano/.test(av), 'puntos muy distintos de las parecidas → «no es justa: revisá» · ' + av);
    await p.fill('#tn2Pts', ''); await p.waitForTimeout(300);
    await p.click('#tn2Crear'); await p.waitForTimeout(300);
    c(/motivo/.test(await tx(p, '#tn2Msg')) && !(await p.$('#tn2Ov')), 'sin motivo no deja crear');
    await p.fill('#tn2Mot', 'La pide la inspección'); await p.click('#tn2Crear'); await p.waitForTimeout(400);
    c(!!(await p.$('#tn2Ov.v7-ov[role="dialog"] .v7-x[aria-label="Cerrar"]')) && /Sí, crearla/.test(await tx(p, '#tn2Ov')), 'la hoja de confirmar (.v7-ov con ✕) con «Sí, crearla»');
    await p.click('#tn2Ov [data-tn2="si"]'); await p.waitForTimeout(1800);
    const d = await db(p), s = ((d.configEquipo.baremo || {}).tareasPropias || []).find((x) => x.label === 'Limpieza de cajas de columna') || {};
    c(s.pts === 0.8 && s.hh === 0.67 && s.f && s.f.rie && s.t159 && s.t159.creado.motivo === 'La pide la inspección' && !s.t159.creado.porAsistente, 'creada a mano por el mismo camino: 0,67 HH × 1,2 = 0,8 pts, con el motivo · ' + JSON.stringify({ pts: s.pts, hh: s.hh }));
    c(/Creada/.test(await tx(p, '#tn2Msg')) && /Limpieza de cajas de columna/.test(await tx(p, '#tn2Lista')), 'el aviso y la lista de las creadas con la calculadora');
    c((await scrollX(p)) <= 0, 'sin scroll de costado');
    c(!errsJs(A).length, 'sin errores de JS ' + JSON.stringify(errsJs(A).slice(0, 3)));
    await A.ctx.close();
  }

  // ================================================================= 3) editar con motivo e historial; dar de baja
  if (SOLO('3') && K) {
    const A = await sesion('lucia', {}, { baremo: BAREMO, k: K }); const p = A.page;
    await produccion(p);
    await p.click('#tn2Lista [data-tn2edit="' + K + '"]'); await p.waitForTimeout(400);
    c(/Estás cambiando/.test(await tx(p, '#tn2Modo')) && (await p.inputValue('#tn2Hh')) === '1', '«✏ Editar» carga la tarea en la calculadora');
    await p.fill('#tn2Hh', '1.5'); await p.waitForTimeout(400);
    await p.click('#tn2Crear'); await p.waitForTimeout(300);
    c(/motivo/.test(await tx(p, '#tn2Msg')), 'cambiar sin motivo no deja');
    await p.fill('#tn2Mot', 'Medimos y tardan más'); await p.click('#tn2Crear'); await p.waitForTimeout(400);
    const hoja = await tx(p, '#tn2Ov');
    c(/Horas-hombre/.test(hoja) && /Puntos por unidad/.test(hoja) && /Sí, cambiarla/.test(hoja), 'la hoja muestra antes → después · ' + hoja.slice(0, 160));
    await p.click('#tn2Ov [data-tn2="si"]'); await p.waitForTimeout(1800);
    let d = await db(p), b = d.configEquipo.baremo, s = b.tareasPropias.find((x) => x.id === K), h = (b.hist || []).filter((x) => x.k === K);
    c(s.pts === 1.5 && s.hh === 1.5 && b.baremo[K].pts === 1.5 && h.some((x) => x.tipo === 'editar' && x.antes === 1 && x.despues === 1.5 && x.motivo === 'Medimos y tardan más'), 'queda 1,5 HH × 1 = 1,5 pts con el historial (antes 1 → 1,5, motivo) · ' + JSON.stringify(h.map((x) => [x.tipo, x.antes, x.despues])));
    const rv = await p.evaluate(() => { const z = window.puntosDeOrden(ordenesTrabajo.find((x) => x.id === 'o311')); return z.total; });
    c(Math.abs(rv - 3) < 0.01, 'la orden ya cerrada guarda sus puntos (3) · ' + rv);
    await p.click('#tn2Lista [data-tn2baja="' + K + '"]'); await p.waitForTimeout(300);
    await p.fill('#tn2MotB', 'Ya no se pinta'); await p.click('#tn2Ov [data-tn2="motok"]'); await p.waitForTimeout(1800);
    d = await db(p); s = d.configEquipo.baremo.tareasPropias.find((x) => x.id === K);
    c(s.t159.baja === true && d.configEquipo.baremo.hist.some((x) => x.k === K && x.tipo === 'baja'), 'dar de baja: queda marcada (no se borra) y en el historial');
    await p.evaluate(() => mostrarVista('parte')); await p.waitForTimeout(1500);
    const vis = await p.evaluate((k) => { const c = document.querySelector('#otActividades .ot-act-check[value="' + k + '"]'); const t = c && c.closest('.ot-tarea'); return t ? getComputedStyle(t).display : 'no'; }, K);
    c(vis === 'none' && (await p.evaluate((k) => window.__tn2Ids().indexOf(k) < 0, K)), 'dada de baja no aparece en Llenar orden ni en la sugerida · ' + vis);
    c(await p.evaluate(() => { const z = window.puntosDeOrden(ordenesTrabajo.find((x) => x.id === 'o311')); return Math.abs(z.total - 3) < 0.01; }), 'las órdenes viejas siguen andando');
    const re = await p.evaluate(async (k) => window.__tareaNueva2.baja(k, 'Volvemos a pintar', { reactivar: true }), K);
    c(re.ok && (await p.evaluate((k) => window.__tn2Ids().indexOf(k) >= 0, K)), 'reactivar con motivo · ' + re.txt);
    const ia = await p.evaluate(async (k) => { const r = window.__tareaNueva2.planEditar(k, { personas: 3, minutos: 30 }, ''); return r.err || ''; }, K);
    c(/motivo/.test(ia), 'editar desde el motor también pide el motivo');
    c(!errsJs(A).length, 'sin errores de JS ' + JSON.stringify(errsJs(A).slice(0, 3)));
    await A.ctx.close();
  }

  // ================================================================= 4) permisos
  if (SOLO('4')) {
    for (const [quien, nom] of [['juan', 'cuadrilla'], ['pan', 'pañol'], ['mir', 'solo mirar'], ['dir', 'Dirección']]) {
      const A = await sesion(quien, quien === 'juan' ? { cel: true } : {}); const p = A.page;
      await p.waitForTimeout(1500);
      const r = await p.evaluate(async (e) => { const T = window.__tareaNueva2; const x = await T.crear(e, 'prueba'); return { puede: T.puede(), ok: x.ok, txt: x.txt }; }, ENTRADA);
      let tools = null;
      if (quien !== 'juan') { await esperar(p, () => typeof window.__asistenteAbrir === 'function', null, 60); const sw = await worker(p); await p.evaluate(() => window.__asistenteAbrir && window.__asistenteAbrir()); await p.waitForTimeout(700); if (await p.$('#iaTxt')) { const ped = await decir(p, sw, 'creá una tarea nueva', [fin('No puedo.')]); tools = herramientas(ped); } }
      const d = await db(p);
      c(!r.puede && !r.ok && !((d.configEquipo.baremo || {}).tareasPropias || []).length && (!tools || tools.indexOf('proponer_tarea_nueva') < 0), nom + ': no crea tareas' + (tools ? ' ni recibe proponer_tarea_nueva' : '') + ' · ' + r.txt);
      await A.ctx.close();
    }
  }
  c.fin ? c.fin() : null;
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
