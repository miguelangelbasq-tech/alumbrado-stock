// v154 · El asistente entiende, explica y corrige TODOS los puntos (auditor de puntos).
//  0) explicar: la quincena de Juan (3 órdenes: repartida, «Elegir quiénes», a mano con motivo) da el mismo total que
//     Producción, con la cuenta paso a paso; «¿de dónde salen los 9,25 de Pablo en la OT-177?»; SISTEMA.
//  1) revisar: los 6 errores sembrados + la cuadrilla contra el cierre; Supervisor; hoja «🔎 Puntos» (.v7-ov, ✕).
//  2) nota de criterio con «Sí» y el asistente la usa después; una nota en la orden explica lo «sin motivo».
//  3) valor de una tarea: con el asistente (historial del baremo, las cerradas no cambian) y a mano (motivo obligatorio).
//  4) varias correcciones juntas con casillas (se destilda una) + «mover» (plan).
//  5) motivo obligatorio en «⭐ Puntos» y en los puntos a mano del cierre (y el historial no se pierde al volver a cerrar).
//  6) quincena cerrada: la foto fija no se toca, la diferencia va como ajuste y la explicación lo dice.
//  7) permisos: la cuadrilla solo pregunta por lo suyo; pañol y «solo mirar» nada.
const { abrir, prueba } = require('./h');
const { datos154 } = require('./datos154');
const cel = process.argv[2] === 'cel';
const W = 'https://ema-ia.mdiaz-60f.workers.dev';
const CAP = process.env.CAP || '';
const SOLO = (x) => !process.env.SOLO || process.env.SOLO.indexOf(x) >= 0;
(async () => {
  const c = prueba('v154' + (cel ? ' cel' : ''));
  const MOD = { cel, espera: 5000, v145: true, v146: true, v147: true, v150: true, v151: true, v152: true, v153: true, v154: true, sugerida: true, inicio: true, porPartes: true, ofPasos: true, tarjetas: true, nav: true, mtNuevo: true, iaPro: true, crew: true, https: true, antes: () => { window.__pmPausa = true; window.__cvSinMic = true; window.__hvPausa = true; window.__isNoAuto = true; } };
  let browser = null, D0 = null;
  const sesion = async (quien, op) => { D0 = datos154(); const A = await abrir(Object.assign({ sesion: quien, datos: D0, browser }, MOD, op || {})); browser = A.browser; A.page.on('dialog', (x) => x.accept()); await A.page.waitForTimeout(1200); return A; };
  const db = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('stub.db') || '{}'));
  const txt = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; }, sel);
  const scrollX = (p) => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const foto = async (p, nombre, sel) => { if (!CAP) return; if (sel) await p.evaluate((s) => { const e = document.querySelector(s); e && e.scrollIntoView({ block: 'center' }); }, sel); await p.waitForTimeout(350); await p.screenshot({ path: CAP + '/' + nombre + '_' + (cel ? 'cel' : 'pc') + '.png' }); };
  const auds = async (p, acc) => Object.values((await db(p)).auditoria || {}).filter((a) => a.accion === acc);
  const pts = (o) => { const m = {}; ((o.cierre.puntos || {}).porPersona || []).forEach((x) => { m[x.nombre.split(' ')[0]] = x.pts; }); return m; };
  let n = 0;
  const usa = (name, input) => ({ id: 'msg_' + (++n), type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text: 'Miro.' }, { type: 'tool_use', id: 'tu_' + n, name, input }], stop_reason: 'tool_use', usage: { input_tokens: 900, output_tokens: 40 }, ema: { costoUsd: 0.01, version: 'v3-ia' } });
  const fin = (text) => ({ id: 'msg_' + (++n), type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text }], stop_reason: 'end_turn', usage: { input_tokens: 1000, output_tokens: 60 }, ema: { costoUsd: 0.02, version: 'v3-ia' } });
  async function worker(p) {
    const st = { pedidos: [], cola: [] };
    await p.route(W + '/ia', async (rt) => { let b = null; try { b = JSON.parse(rt.request().postData() || 'null'); } catch (e) { } st.pedidos.push(b); const f = st.cola.shift(); const x = typeof f === 'function' ? f(b) : f; return rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(x || fin('Listo.')) }); });
    await p.route(W + '/mio', (rt) => rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, version: 'v3-ia', habilitado: true, quedanPreguntas: 30, topePreguntas: 30 }) }));
    await p.route(W + '/uso', (rt) => rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, version: 'v3-ia', gastoMes: 12.4, tope: 100, partes: {} }) }));
    await p.route(W + '/salud', (rt) => rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, version: 'v3-ia' }) }));
    return st;
  }
  const esperarIa = async (p) => { for (let i = 0; i < 120; i++) { await p.waitForTimeout(150); if (await p.evaluate(() => { const b = document.getElementById('iaEnviar'); return !!b && !b.disabled; })) return; } };
  const decir = async (p, sw, frase, guion) => { sw.cola.push(...guion); const n0 = sw.pedidos.length; await p.fill('#iaTxt', frase); await p.click('#iaEnviar'); await p.waitForTimeout(300); await esperarIa(p); await p.waitForTimeout(400); return sw.pedidos.slice(n0); };
  const resultado = (ped, i) => { const m = (ped[i] || {}).messages || []; const u = m[m.length - 1] || {}; const b = (u.content || []).find((x) => x.type === 'tool_result'); if (!b) return ''; const x = b.content; return typeof x === 'string' ? x : Array.isArray(x) ? x.map((y) => (y && y.type === 'text' ? y.text : JSON.stringify(y))).join(' ') : JSON.stringify(x); };
  const herramientas = (ped) => ((ped[0] || {}).tools || []).map((t) => t.name);
  const qKey = (p) => p.evaluate(() => { const Q = window.__quincenas, f = ordenesTrabajo.find((o) => o.id === 'j160').fecha; return Q.qInfo(Q.qDe(f)).key; });
  const errsJs = (A) => (A.errores || []).filter((e) => !/Missing or insufficient permissions|permission-denied|ERR_|Failed to fetch|aborted|fetching the script|prueba/i.test(e));

  // ================================================================= 0) explicar
  if (SOLO('0')) {
    const A = await sesion('lucia'); const p = A.page;
    await p.waitForTimeout(4500);
    const key = await qKey(p);
    let r = await p.evaluate((k) => { const E = window.__auditPuntos.explicarPersona('Juan', { periodo: k }); const Q = window.__quincenas, i = Q.qInfo(Q.qDe(ordenesTrabajo.find((o) => o.id === 'j160').fecha)), j = Q.calcular(i.desde, i.hasta).personas.find((x) => /Juan/.test(x.nombre)); return { E, prod: j ? Math.round(j.pts * 100) / 100 : null }; }, key);
    c(r.E.ordenes.length === 3 && Math.abs(r.E.totalProduccion - 25.1) < 0.01 && r.E.totalProduccion === r.prod && r.E.cuadraConProduccion, 'la quincena de Juan: 3 órdenes y el mismo total que la cuenta de Producción (25,1) · ' + JSON.stringify({ t: r.E.totalProduccion, prod: r.prod, n: r.E.ordenes.length }));
    c(/OT-2026-160 8 \+ OT-2026-161 10,1 \+ OT-2026-162 7 = 25,1/.test(r.E.cuenta), 'la suma por orden · ' + r.E.cuenta);
    const o1 = r.E.ordenes.find((o) => o.numero === 'OT-2026-160'), o2 = r.E.ordenes.find((o) => o.numero === 'OT-2026-161'), o3 = r.E.ordenes.find((o) => o.numero === 'OT-2026-162');
    c(/30 metros × 0,4 = 12/.test(o1.cuenta) && /repartida/.test(o1.cuenta) && /hizo 20 de 30/.test(o1.cuenta) && /= 8/.test(o1.cuenta), 'OT-160 repartida: 30 m × 0,4 = 12 y Juan hizo 20 de 30 → 8 · ' + o1.cuenta);
    c(/Elegir quiénes/.test(o2.cuenta) && /peso 1 de 1,6/.test(o2.cuenta) && /6,25/.test(o2.cuenta) && /toda la cuadrilla/.test(o2.cuenta) && /peso 1 de 2,6/.test(o2.cuenta) && /3,85/.test(o2.cuenta), 'OT-161 «Elegir quiénes» (peso 1 de 1,6 → 6,25) + hormigonado por rol × horas (1 de 2,6 → 3,85) · ' + o2.cuenta.slice(0, 260));
    c(/a mano/.test(o3.cuenta) && /Juan izó casi todo solo/.test(o3.cuenta) && /Lucía/.test(o3.cuenta) && / 7 de 10/.test(o3.cuenta), 'OT-162 a mano: 7 de 10 con quién lo puso y el motivo · ' + o3.cuenta);
    // Producción (pantalla) dice lo mismo
    await p.evaluate(() => mostrarVista('produccion')); await p.waitForTimeout(600);
    await p.click('#subtabsProd [data-sub="quincena"]'); await p.waitForTimeout(1500);
    r = await p.evaluate(() => { const f = document.querySelector('#prodPanelQuincena .qz-fila[data-qzp="Juan Pérez"]'); return f ? [...f.children].slice(4).map((x) => x.textContent.trim()) : null; });
    c(r && r[0] === '25,1', 'Producción › Por quincena muestra 25,1 para Juan (lo mismo que la explicación) · ' + JSON.stringify(r));
    c(await p.evaluate(() => !!document.querySelector('#prodPanelQuincena .qp-btn[data-qpabrir]')), 'Producción › Quincena tiene «🔎 Revisar y explicar los puntos»');
    // el asistente
    const sw = await worker(p); await p.evaluate(() => window.__asistenteAbrir()); await p.waitForTimeout(700);
    let ped = await decir(p, sw, '¿por qué Juan tiene esos puntos esta quincena?', [usa('explicar_puntos', { persona: 'Juan', periodo: key }), fin('Juan tiene 25,1.')]);
    const tools = herramientas(ped), sist = JSON.stringify((ped[0] || {}).system || '');
    c(['explicar_puntos', 'revisar_puntos', 'proponer_nota_puntos', 'proponer_puntos_persona', 'proponer_valor_tarea', 'proponer_correcciones_puntos', 'proponer_corregir_cierre'].every((x) => tools.includes(x)), 'oficina: el asistente recibe las 6 herramientas nuevas (y la de la v153)');
    c(/SÍ PODÉS EXPLICAR, REVISAR, ANOTAR EL PORQUÉ Y CORREGIR/.test(sist) && /NUNCA inventes un motivo/.test(sist), 'el SISTEMA sabe que explica, revisa, anota y corrige, y que no inventa motivos');
    let rr = resultado(ped, 1);
    c(/"totalProduccion":25\.1/.test(rr) && /OT-2026-160 8 \+ OT-2026-161 10,1 \+ OT-2026-162 7 = 25,1/.test(rr), 'explicar_puntos (persona) devuelve el total de Producción y la suma · ' + rr.slice(0, 200));
    ped = await decir(p, sw, '¿de dónde salen los 9,25 de Pablo en la OT-177?', [usa('explicar_puntos', { otId: 'OT-2026-177', persona: 'Pablo' }), fin('De la corrección.')]);
    rr = resultado(ped, 1);
    c(/1 apoyo × 18,5 = 18,5/.test(rr) && /rol × horas/.test(rr) && /9,25 de 18,5/.test(rr) && /El apoyo lo colocaron Pablo y Ariel/.test(rr) && /Corregir cierre/.test(rr), 'OT-177: 1 apoyo × 18,5 = 18,5, repartida entre Pablo y Ariel con rol × horas (9,25 de 18,5) en la corrección, con el motivo · ' + (rr.match(/"cuentaPaso":"[^"]*"/) || [''])[0].slice(0, 300));
    c(/editado en Producción/.test(rr) && /sin motivo anotado/.test(rr), 'y de dónde sale el valor (editado en Producción, sin motivo anotado: es de antes)');
    if (cel) c((await scrollX(p)) <= 0, 'celu: sin scroll de costado');
    c(!errsJs(A).length, 'explicar: sin errores de JS ' + JSON.stringify(errsJs(A).slice(0, 3)));
    await A.page.context().close();
  }

  // ================================================================= 1) revisar
  if (SOLO('1')) {
    const A = await sesion('lucia'); const p = A.page;
    await p.waitForTimeout(4500);
    const key = await qKey(p);
    const sw = await worker(p); await p.evaluate(() => window.__asistenteAbrir()); await p.waitForTimeout(700);
    const ped = await decir(p, sw, 'revisá si los puntos de esta quincena están bien', [usa('revisar_puntos', { periodo: key }), fin('Encontré cosas.')]);
    const rr = resultado(ped, 1);
    const tiene = (tipo, num) => new RegExp('"tipo":"' + tipo + '","otId":"[^"]*","numero":"' + num + '"').test(rr);
    c(tiene('repartoNoSuma', 'OT-2026-170'), 'reparto que no suma (OT-170: 3 de 4)');
    c(tiene('ceroHoras', 'OT-2026-171'), 'persona con 0 horas y puntos (OT-171, Ana)');
    c(tiene('noSeHizoConPuntos', 'OT-2026-172'), '«no se hizo» con puntos (OT-172)');
    c(tiene('dosVeces', 'OT-2026-173') && /Col 2 se cobró en 2 órdenes: OT-2026-110 y OT-2026-173/.test(rr), 'la misma columna en dos órdenes (Col 2: OT-110 y OT-173)');
    c(tiene('aManoSinMotivo', 'OT-2026-174'), 'puntos a mano sin motivo (OT-174)');
    c(tiene('valorDistinto', 'OT-2026-175') && /12 por unidad y hoy la tarea vale 9,6/.test(rr), 'valor de la tarea distinto del baremo sin explicación (OT-175: 12 contra 9,6)');
    c(tiene('cuadrillaDiceHecho', 'OT-2026-177'), 'la cuadrilla mandó el tablero con foto y el cierre dice 0 (OT-177)');
    c(!/"numero":"OT-2026-16[012]"/.test(rr.replace(/porHora[^}]*/g, '')), 'las órdenes de Juan (bien hechas) no aparecen como error');
    c(/"propuesta":\{"tipo":"puntos_persona","otId":"e170"/.test(rr), 'cada hallazgo trae una propuesta (OT-170: volver al reparto de siempre)');
    // el Supervisor
    let r = await p.evaluate(() => (window.__supervisor.hallazgos({ ahora: true }) || []).filter((h) => h.cat === 'Puntos').map((h) => h.g + ' ' + h.t + ' · ' + h.s));
    c(r.some((x) => /^rojo Puntos para revisar: 4 cosas mal/.test(x)) && r.some((x) => /^ambar/.test(x)), 'el Supervisor tiene la línea de los puntos (4 cosas mal) · ' + r.join(' | ').slice(0, 200));
    // la hoja sin IA
    await p.evaluate(() => window.__asistente && window.__asistente.cerrar && window.__asistente.cerrar()); await p.waitForTimeout(300);
    await p.evaluate(() => window.__auditPuntos.abrir({ tab: 'rev' })); await p.waitForTimeout(600);
    r = await p.evaluate(() => { const o = document.getElementById('qpOv'); return o ? { v7: o.classList.contains('v7-ov'), dlg: o.getAttribute('role'), x: !!o.querySelector('.v7-x[aria-label="Cerrar"]'), rojos: o.querySelectorAll('.qp-h.rojo').length, cc: !!o.querySelector('.qp-h [data-ccabrir="e173"]') } : null; });
    c(r && r.v7 && r.dlg === 'dialog' && r.x && r.rojos === 4 && r.cc, 'hoja «🔎 Puntos» (.v7-ov, role=dialog, ✕) con los 4 rojos y «✏ Corregir cierre» · ' + JSON.stringify(r));
    await foto(p, 'hoja_revision', '#qpOv .qp-h.rojo');
    if (cel) c((await scrollX(p)) <= 0, 'celu: sin scroll de costado (hoja)');
    await p.click('#qpOv [data-qp="tab"][data-qpt="per"]'); await p.waitForTimeout(500);
    await p.selectOption('#qpPers', 'Juan Pérez'); await p.waitForTimeout(500);
    r = await txt(p, '#qpOv .qp-tot');
    c(/Juan Pérez/.test(r) && /25,1 pts/.test(r), '🧮 Por persona: Juan 25,1 pts (sin IA) · ' + r);
    await foto(p, 'hoja_persona', '#qpOv .qp-tot');
    await p.click('#qpOv .v7-x'); await p.waitForTimeout(300);
    c(await p.evaluate(() => !document.getElementById('qpOv')), '✕ cierra la hoja');
    c(!errsJs(A).length, 'revisar: sin errores de JS ' + JSON.stringify(errsJs(A).slice(0, 3)));
    await A.page.context().close();
  }

  // ================================================================= 2) notas y criterios
  if (SOLO('2')) {
    const A = await sesion('lucia'); const p = A.page;
    await p.waitForTimeout(1500);
    const sw = await worker(p); await p.evaluate(() => window.__asistenteAbrir()); await p.waitForTimeout(700);
    let ped = await decir(p, sw, 'anotá que desde hoy el apoyo PRFV vale más porque lleva el doble de trabajo', [usa('proponer_nota_puntos', { texto: 'Desde hoy el apoyo PRFV vale más porque lleva el doble de trabajo', tarea: 'poste_tablero', general: true }), fin('Confirmalo.')]);
    let rr = resultado(ped, 1), card = await txt(p, '#iaChat .ia-conf:last-of-type');
    c(/pendiente_de_confirmacion/.test(rr) && /Anotar el porqué/.test(card) && /doble de trabajo/.test(card), 'proponer_nota_puntos: tarjeta «📒 Anotar el porqué» · ' + card.slice(0, 160));
    c(!((await db(p)).configEquipo.baremo.criterios || []).length, 'sin «Sí» no se guarda');
    await p.click('#iaChat .ia-conf:last-of-type [data-iasi]'); await p.waitForTimeout(1500);
    let d = await db(p); const cr = (d.configEquipo.baremo.criterios || [])[0] || {};
    c(/doble de trabajo/.test(cr.texto) && cr.tarea === 'poste_tablero' && cr.por && cr.porAsistente === true, 'con «Sí»: queda en configEquipo/baremo.criterios con quién y la tarea · ' + JSON.stringify(cr).slice(0, 160));
    ped = await decir(p, sw, '¿por qué Pablo tiene 9,25 en la OT-177?', [usa('explicar_puntos', { otId: 'OT-2026-177', persona: 'Pablo', tarea: 'apoyo' }), fin('Por la corrección.')]);
    rr = resultado(ped, 1);
    c(/"criterios":\[\{"texto":"Desde hoy el apoyo PRFV vale más porque lleva el doble de trabajo"/.test(rr), 'después, explicar_puntos trae el criterio anotado');
    // nota en una orden (OT-174 sin motivo) → ya no sale como «sin motivo»
    ped = await decir(p, sw, 'en la OT-174 le dimos más a Marcos porque hizo el doble', [usa('proponer_nota_puntos', { otId: 'OT-2026-174', texto: 'A Marcos le dimos más porque selló el doble que Ana' }), fin('Confirmalo.')]);
    await p.click('#iaChat .ia-conf:last-of-type [data-iasi]'); await p.waitForTimeout(1500);
    d = await db(p); const h = (d.ordenesTrabajo.e174.cierre.puntosHist || []).slice(-1)[0] || {};
    c(h.tipo === 'nota' && /selló el doble/.test(h.texto), 'la nota queda en el historial de la OT-174 · ' + JSON.stringify(h).slice(0, 140));
    const r = await p.evaluate(() => window.__auditPuntos.revisar({ otId: 'e174' }).hallazgos.map((x) => x.tipo));
    c(!r.includes('aManoSinMotivo'), 'y revisar ya no la marca «sin motivo» · ' + JSON.stringify(r));
    c(!errsJs(A).length, 'notas: sin errores de JS ' + JSON.stringify(errsJs(A).slice(0, 3)));
    await A.page.context().close();
  }

  // ================================================================= 3) valor de una tarea
  if (SOLO('3')) {
    const A = await sesion('lucia'); const p = A.page;
    await p.waitForTimeout(1500);
    const sw = await worker(p); await p.evaluate(() => window.__asistenteAbrir()); await p.waitForTimeout(700);
    let ped = await decir(p, sw, 'subí el apoyo PRFV a 20 puntos', [usa('proponer_valor_tarea', { tarea: 'Colocación de apoyo PRFV para el tablero', puntos: 20 }), fin('¿Por qué?')]);
    let rr = resultado(ped, 1);
    c(/Falta el motivo/.test(rr), 'sin motivo no arma la tarjeta (lo pide) · ' + rr.slice(0, 120));
    ped = await decir(p, sw, 'porque lleva el doble de trabajo', [usa('proponer_valor_tarea', { tarea: 'Colocación de apoyo PRFV para el tablero', puntos: 20, motivo: 'lleva el doble de trabajo' }), fin('Confirmalo.')]);
    rr = resultado(ped, 1); const card = await txt(p, '#iaChat .ia-conf:last-of-type');
    c(/pendiente_de_confirmacion/.test(rr) && /18,5/.test(card) && /20/.test(card) && /quedan como están/.test(card), 'tarjeta 18,5 → 20 y avisa que las cerradas no cambian · ' + card.slice(0, 220));
    await foto(p, 'ia_valor', '#iaChat .ia-conf:last-of-type');
    await p.click('#iaChat .ia-conf:last-of-type [data-iasi]'); await p.waitForTimeout(1500);
    let d = await db(p); const h = (d.configEquipo.baremo.hist || []).slice(-1)[0] || {};
    c(d.configEquipo.baremo.baremo.poste_tablero.pts === 20 && h.k === 'poste_tablero' && h.antes === 18.5 && h.despues === 20 && h.motivo === 'lleva el doble de trabajo' && h.porAsistente === true, 'baremo 20 y el historial del baremo con antes, después, motivo y porAsistente · ' + JSON.stringify(h).slice(0, 180));
    c(d.ordenesTrabajo.ot177.cierre.puntos.total === 28.1 && pts(d.ordenesTrabajo.ot177).Pablo === 9.25, 'la OT-177 (cerrada) no cambia: 28,1 y Pablo 9,25');
    c((await auds(p, 'baremo_valor')).length === 1, 'auditoría baremo_valor');
    ped = await decir(p, sw, '¿por qué la OT-177 da 18,5 el apoyo si vale 20?', [usa('explicar_puntos', { otId: 'OT-2026-177', tarea: 'apoyo' }), fin('Se cerró antes.')]);
    rr = resultado(ped, 1);
    c(/cuando se cerró valía 18,5/.test(rr) && /lo cambió a 20/.test(rr) && /lleva el doble de trabajo/.test(rr), 'explicar: «cuando se cerró valía 18,5; después se cambió a 20 (motivo)» · ' + (rr.match(/"valorDistinto":"[^"]*"/) || [''])[0]);
    // a mano en Producción › Cuánto vale cada tarea
    await p.evaluate(() => window.__asistente && window.__asistente.cerrar && window.__asistente.cerrar()); await p.waitForTimeout(300);
    await p.evaluate(() => { mostrarVista('produccion'); document.querySelector('#subtabsProd [data-sub="baremo"]').click(); }); await p.waitForTimeout(2500);
    await p.evaluate(() => { const i = document.querySelector('.bar-pts[data-k="acometida"]'); i.value = '11'; i.dispatchEvent(new Event('input', { bubbles: true })); });
    await p.evaluate(() => window.guardarBaremo()); await p.waitForTimeout(600);
    let r = await p.evaluate(() => { const o = document.getElementById('qpMotOv'); return o ? { v7: o.classList.contains('v7-ov'), x: !!o.querySelector('.v7-x[aria-label="Cerrar"]'), t: o.textContent.replace(/\s+/g, ' ') } : null; });
    c(r && r.v7 && r.x && /9,6/.test(r.t) && /11/.test(r.t), '«Guardar» con un valor cambiado pide el motivo (.v7-ov con ✕, antes → después) · ' + JSON.stringify(r).slice(0, 200));
    await foto(p, 'baremo_motivo', '#qpMotOv');
    await p.click('#qpMotOv [data-qpm="si"]'); await p.waitForTimeout(300);
    c(/Escribí el motivo/.test(await txt(p, '#qpMotMsg')) && (await db(p)).configEquipo.baremo.baremo.acometida.pts === 9.6, 'sin motivo no guarda');
    await p.fill('#qpMotTx', 'la acometida subterránea lleva más horas'); await p.click('#qpMotOv [data-qpm="si"]'); await p.waitForTimeout(2000);
    d = await db(p); const h2 = (d.configEquipo.baremo.hist || []).slice(-1)[0] || {};
    c(d.configEquipo.baremo.baremo.acometida.pts === 11 && h2.k === 'acometida' && h2.antes === 9.6 && h2.despues === 11 && /más horas/.test(h2.motivo) && h2.porAsistente === false && (d.configEquipo.baremo.hist || []).length === 2, 'a mano: guarda 11 y el historial con el motivo (sin perder el del asistente) · ' + JSON.stringify(h2).slice(0, 160));
    c(!errsJs(A).length, 'valor: sin errores de JS ' + JSON.stringify(errsJs(A).slice(0, 3)));
    await A.page.context().close();
  }

  // ================================================================= 4) varias correcciones juntas
  if (SOLO('4')) {
    const A = await sesion('lucia'); const p = A.page;
    await p.waitForTimeout(1500);
    const sw = await worker(p); await p.evaluate(() => window.__asistenteAbrir()); await p.waitForTimeout(700);
    const ped = await decir(p, sw, 'corregí lo que encontraste', [usa('proponer_correcciones_puntos', { motivo: 'revisión de puntos de la quincena', correcciones: [
      { tipo: 'puntos_persona', otId: 'OT-2026-170', puntos: { Lucas: 2.5, Diego: 1.5 } },
      { tipo: 'corregir_cierre', otId: 'OT-2026-172', cambios: [{ tarea: 'bpn', hecha: false }], motivo: 'la cuadrilla dijo que no se hizo (faltó material)' },
      { tipo: 'nota', otId: 'OT-2026-174', texto: 'Marcos selló el doble' },
      { tipo: 'puntos_persona', otId: 'OT-2026-171', puntos: { Lucas: 9 } }] }), fin('Elegí cuáles.')]);
    const rr = resultado(ped, 1);
    let r = await p.evaluate(() => { const c0 = document.querySelector('#iaChat .ia-conf:last-of-type'); return { n: c0.querySelectorAll('input[data-qpsel]').length, t: c0.textContent.replace(/\s+/g, ' ') }; });
    c(r.n === 3 && /3 cambios/.test(r.t) && /Lucas 2 → 2,5/.test(r.t) && /No va: Los puntos de cada uno sumarían/.test(r.t), 'UNA tarjeta con 3 casillas (la de la OT-171 no va: no suma) · ' + r.t.slice(0, 300));
    c(/pendiente_de_confirmacion/.test(rr), 'la herramienta deja la propuesta pendiente');
    await foto(p, 'ia_varias', '#iaChat .ia-conf:last-of-type');
    await p.evaluate(() => { const i = [...document.querySelectorAll('#iaChat .ia-conf:last-of-type input[data-qpsel]')].find((x) => /Marcos selló/.test(x.closest('label').textContent)); i.click(); });
    await p.click('#iaChat .ia-conf:last-of-type [data-iasi]'); await p.waitForTimeout(3000);
    const d = await db(p);
    c(pts(d.ordenesTrabajo.e170).Lucas === 2.5 && pts(d.ordenesTrabajo.e170).Diego === 1.5, 'OT-170: Lucas 2,5 · Diego 1,5 (ahora suma 4) · ' + JSON.stringify(pts(d.ordenesTrabajo.e170)));
    const h170 = (d.ordenesTrabajo.e170.cierre.puntosHist || []).slice(-1)[0] || {};
    c(h170.tipo === 'persona' && h170.motivo === 'revisión de puntos de la quincena' && h170.porAsistente === true, 'con el motivo general en el historial');
    c(!(d.ordenesTrabajo.e172.cierre.cantidades.bpn > 0) && (d.ordenesTrabajo.e172.cierre.puntos.total || 0) === 0, 'OT-172: el BPN pasa a «no se hizo» y sin puntos');
    c(!(d.ordenesTrabajo.e174.cierre.puntosHist || []).some((x) => x.tipo === 'nota'), 'la nota destildada no se guardó');
    const av = Object.values(d.avisosPush || {}).filter((x) => /Puntos corregidos/.test(x.titulo)).map((x) => x.clave).sort();
    c(av.includes('lucas vera') && av.includes('diego luna'), 'aviso «⭐ Puntos corregidos» a los que cambian · ' + av.join());
    c((await auds(p, 'ot_puntos_persona')).length === 1 && (await auds(p, 'ot_cierre_corregido')).length === 1, 'auditoría (ot_puntos_persona y ot_cierre_corregido)');
    r = await p.evaluate(() => window.__auditPuntos.revisar({ periodo: 'actual' }).hallazgos.filter((h) => h.nivel !== 'info' && (h.otId === 'e170' || h.otId === 'e172')).map((h) => h.tipo));
    c(!r.length, 'y revisar ya no las marca · ' + JSON.stringify(r));
    // «mover» lo hecho de una orden a otra: dos correcciones con el motor de la v153
    r = await p.evaluate(() => { const x = window.__auditPuntos.planUno({ tipo: 'mover', deOt: 'OT-2026-173', aOt: 'OT-2026-110', tarea: 'montaje_prfv', cantidad: 1 }, 'se cargó en la orden equivocada'); return x.err || { n: x.specs.length, t: x.titulo, av: x.avisos.join(' ') }; });
    c(r && r.n === 2 && /1 → 0/.test(r.t) && /3 → 4/.test(r.t) && /fotos/.test(r.av), '«mover»: OT-173 1 → 0 y OT-110 3 → 4 (y avisa por las fotos) · ' + JSON.stringify(r).slice(0, 200));
    if (cel) c((await scrollX(p)) <= 0, 'celu: sin scroll de costado');
    c(!errsJs(A).length, 'varias: sin errores de JS ' + JSON.stringify(errsJs(A).slice(0, 3)));
    await A.page.context().close();
  }

  // ================================================================= 5) motivo en «⭐ Puntos» y en el cierre
  if (SOLO('5')) {
    const A = await sesion('lucia'); const p = A.page;
    await p.waitForTimeout(1500);
    await p.evaluate(() => window.__puntosEditar.abrir('e174', 'puntos')); await p.waitForTimeout(500);
    c(await p.evaluate(() => !!document.querySelector('#peOv #peMotivo')), '«⭐ Puntos» tiene el campo del motivo');
    await p.fill('#peOv [data-peg="0"]', '5'); await p.dispatchEvent('#peOv [data-peg="0"]', 'change'); await p.waitForTimeout(300);
    await p.fill('#peOv [data-peg="1"]', '3'); await p.dispatchEvent('#peOv [data-peg="1"]', 'change'); await p.waitForTimeout(300);
    await p.click('#peOv [data-pe="guardar"]'); await p.waitForTimeout(800);
    let r = await txt(p, '#peMsg'); let d = await db(p);
    c(/motivo/.test(r) && pts(d.ordenesTrabajo.e174).Marcos === 6, 'sin motivo no guarda · ' + r);
    await p.fill('#peOv #peMotivo', 'Ana selló 3 de las 8'); await p.click('#peOv [data-pe="guardar"]'); await p.waitForTimeout(1500);
    d = await db(p); const h = (d.ordenesTrabajo.e174.cierre.puntosHist || []).slice(-1)[0] || {};
    c(pts(d.ordenesTrabajo.e174).Marcos === 5 && pts(d.ordenesTrabajo.e174).Ana === 3 && h.motivo === 'Ana selló 3 de las 8' && h.tipo === 'puntos' && (h.personas || []).length === 2, 'con motivo: guarda y el historial lo tiene (antes → después por persona) · ' + JSON.stringify(h).slice(0, 180));
    await p.click('#peOv [data-pe="cerrar"]'); await p.waitForTimeout(300);
    // cierre con puntos a mano: motivo obligatorio (OT-2026-120, abierta, Juan y Pedro)
    await p.evaluate(() => window.abrirCierreOt('a120')); await p.waitForTimeout(1500);
    await p.evaluate(() => document.getElementById('cierreManual').click()); await p.waitForTimeout(300);
    await p.evaluate(() => { const ps = document.querySelectorAll('#cierreCuerpo .cierre-pers'); ps[0].readOnly = false; ps[0].value = String(Math.max(0, +String(ps[0].value).replace(',', '.') + 1)); ps[0].dispatchEvent(new Event('input', { bubbles: true })); ps[1].readOnly = false; ps[1].value = String(Math.max(0, +String(ps[1].value).replace(',', '.') - 1)); ps[1].dispatchEvent(new Event('input', { bubbles: true })); }); await p.waitForTimeout(1200);
    c(await p.evaluate(() => !!document.getElementById('qpCierreMot')), 'al pasar a mano aparece «¿Por qué los puntos a mano?»');
    await foto(p, 'cierre_motivo', '#qpCierreMotBox');
    await p.evaluate(async () => { const x = document.querySelector('input[name="coCierreResp"][value="no"]'); x && (x.checked = true); await guardarCierreOt(); }); await p.waitForTimeout(1200);
    d = await db(p);
    c(!(d.ordenesTrabajo.a120.cierre && d.ordenesTrabajo.a120.cierre.cerradoTs) && /por qué/.test(await txt(p, '#qpCierreMsg')), 'sin motivo no cierra · ' + await txt(p, '#qpCierreMsg') + ' ' + JSON.stringify(d.ordenesTrabajo.a120.cierre || null).slice(0, 300));
    await p.fill('#qpCierreMot', 'Juan hizo la Col 5 solo');
    await p.evaluate(async () => { await guardarCierreOt(); }); await p.waitForTimeout(2500);
    d = await db(p); const hc = ((d.ordenesTrabajo.a120.cierre || {}).puntosHist || []).slice(-1)[0] || {};
    c(d.ordenesTrabajo.a120.cierre && d.ordenesTrabajo.a120.cierre.cerradoTs && hc.tipo === 'cierre' && hc.motivo === 'Juan hizo la Col 5 solo' && /toda la orden/.test(hc.aMano) && hc.despues > 0 && (hc.personas || []).length === 2, 'con motivo: cierra y queda en el historial (tipo cierre) · ' + JSON.stringify(hc).slice(0, 160));
    // volver a cerrar no pierde el historial
    await p.evaluate(() => window.abrirCierreOt('a120')); await p.waitForTimeout(1500);
    await p.evaluate(async () => { const x = document.querySelector('input[name="coCierreResp"][value="no"]'); x && (x.checked = true); const m = document.getElementById('qpCierreMot'); if (m) m.value = 'igual'; await guardarCierreOt(); }); await p.waitForTimeout(2500);
    d = await db(p);
    c(((d.ordenesTrabajo.a120.cierre || {}).puntosHist || []).some((x) => x.motivo === 'Juan hizo la Col 5 solo'), 'volver a cerrar no pierde el historial de los puntos');
    c(!errsJs(A).length, 'motivos: sin errores de JS ' + JSON.stringify(errsJs(A).slice(0, 3)));
    await A.page.context().close();
  }

  // ================================================================= 6) quincena cerrada
  if (SOLO('6')) {
    const A = await sesion('lucia'); const p = A.page;
    await p.waitForTimeout(5500);
    const q0 = JSON.stringify((await db(p)).cierresQuincena), key = D0.q150.key;
    const sw = await worker(p); await p.evaluate(() => window.__asistenteAbrir()); await p.waitForTimeout(700);
    await decir(p, sw, 'en la OT-150 pasale 2 puntos de Marcos a Pablo', [usa('proponer_puntos_persona', { otId: 'OT-2026-150', puntos: { Marcos: 2.8, Pablo: 2 }, motivo: 'Pablo ayudó con la acometida' }), fin('Confirmalo.')]);
    const card = await txt(p, '#iaChat .ia-conf:last-of-type');
    c(/ya está cerrada/.test(card) && /ajuste/.test(card), 'la tarjeta avisa que la quincena está cerrada y la diferencia va como ajuste · ' + card.slice(0, 220));
    await p.click('#iaChat .ia-conf:last-of-type [data-iasi]'); await p.waitForTimeout(2000);
    const d = await db(p);
    c(JSON.stringify(d.cierresQuincena) === q0 && pts(d.ordenesTrabajo.ot150).Pablo === 2 && pts(d.ordenesTrabajo.ot150).Marcos === 2.8, 'la foto fija no se toca; la orden sí (Pablo 2, Marcos 2,8)');
    const r = await p.evaluate((k) => { const E = window.__auditPuntos.explicarPersona('Pablo', { periodo: k }); const aj = (window.__quincenas.ajustesPendientes() || []).filter((a) => /Pablo|Marcos/.test(a.nombre)).map((a) => a.nombre.split(' ')[0] + ' ' + a.pts); const R = window.__auditPuntos.revisar({ periodo: k }).hallazgos.filter((h) => h.tipo === 'quincenaCambio').map((h) => h.texto); return { cer: E.quincenaCerrada, ff: E.fotoFija, notas: E.notas.join(' '), aj, R }; }, key);
    c(r.cer && r.ff === 0 && /CERRADA/.test(r.notas) && /ajuste/.test(r.notas), 'explicar: quincena cerrada, la foto fija dice 0 para Pablo y la diferencia va como ajuste · ' + r.notas.slice(0, 200));
    c(r.aj.join() === 'Marcos -2,Pablo 2' || (r.aj.includes('Pablo 2') && r.aj.includes('Marcos -2')), 'Quincenas: ajuste +2 Pablo y −2 Marcos · ' + JSON.stringify(r.aj));
    c(r.R.length === 2, 'revisar marca la diferencia con la foto fija (Pablo y Marcos) · ' + JSON.stringify(r.R).slice(0, 200));
    await A.page.context().close();
  }

  // ================================================================= 7) permisos
  if (SOLO('7')) {
    for (const quien of ['juan', 'pan', 'mir']) {
      const A = await sesion(quien, quien === 'juan' ? { cel: true } : {}); const p = A.page;
      await p.waitForTimeout(3000);
      const sw = await worker(p);
      const r = await p.evaluate(() => ({ puede: window.__auditPuntos ? window.__auditPuntos.puede() : null, btn: !!document.querySelector('.qp-btn'), sup: window.__auditPuntos ? window.__auditPuntos.supHallazgos().length : 0 }));
      c(r.puede === false && !r.btn && r.sup === 0, `${quien}: el motor no lo deja (ni botón ni Supervisor) · ` + JSON.stringify(r));
      const g = await p.evaluate(async () => { const x = await window.__auditPuntos.aplicarPersona({ otId: 'e170', nuevo: { 'Lucas Vera': 2.5, 'Diego Luna': 1.5 }, motivo: 'x' }); return x.ok ? 'ok' : x.err; });
      c(/no puede|encontré|cerrada/.test(g), `${quien}: aplicar por el motor no anda · ` + g);
      await p.evaluate(() => window.__asistenteAbrir && window.__asistenteAbrir()); await p.waitForTimeout(900);
      if (quien === 'juan') {
        const key = await p.evaluate(() => { const Q = window.__quincenas, f = (ordenesTrabajo.find((o) => o.id === 'j160') || {}).fecha; return f ? Q.qInfo(Q.qDe(f)).key : 'actual'; });
        const ped = await decir(p, sw, '¿por qué tengo estos puntos?', [usa('explicar_puntos', { persona: 'Pedro Gómez', periodo: key }), fin('Tenés 25,1.')]);
        const tools = herramientas(ped), rr = resultado(ped, 1);
        c(tools.includes('explicar_puntos') && !tools.some((t) => /^(revisar_puntos|proponer_)/.test(t)), 'cuadrilla: recibe explicar_puntos (lo suyo) y ninguna de revisar/proponer · ' + tools.join(','));
        c(/"tusPuntos":25\.1/.test(rr) && /Juan Pérez/.test(rr) && !/Pedro|Lucas/.test(rr) && !/valorPunto|\$/.test(rr), 'cuadrilla: aunque pida otro nombre, le explica SOLO lo suyo (25,1), sin nombres de los demás ni plata · ' + rr.slice(0, 260));
      } else {
        const ped = await decir(p, sw, '¿por qué Juan tiene esos puntos?', [fin('No puedo.')]);
        const tools = herramientas(ped);
        c(tools.length > 0 && !tools.some((t) => /puntos|corregir_cierre/.test(t)), `${quien}: el asistente no recibe ninguna herramienta de puntos (${tools.length} herramientas)`);
      }
      const d = await db(p); c(pts(d.ordenesTrabajo.e170).Lucas === 2, `${quien}: la orden no cambió`);
      await A.page.context().close();
    }
  }
  await browser.close(); process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
