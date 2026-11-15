// v158 · Avance de obra nuevo: detallado por rubro y por columna, se mueve solo con las órdenes (PLAZA BULEVARES, datos158).
//  0) el % sale del avance nuevo y es el mismo en toda la app (Avance, legajo, docObra, Inicio, Dirección); la pantalla A con la
//     grilla C; cada celda de dónde sale (cerrada / sin cerrar / sin columna exacta / falla / fraguando / asignado); «🧾 Ver
//     itemizado» con el % de lo que se cobra; la obra sin cálculo usa el del itemizado; nada se escribe solo.
//  1) se mueve solo: la cuadrilla manda un tablerito (en revisión) → la oficina cierra (hecho); «2 izajes» sin decir cuáles.
//  2) a mano: «✅ Columna completa», destildar, «Se arruinó» (resta) y volver a marcar (vuelve); sin motivo no guarda.
//  3) «Elegir varias» Col 7–10 + izaje: avisa fraguando y sin hormigón, «Marcar igual».
//  4) revierten: mover una foto de columna, ✏ Corregir cierre, anular una orden.
//  5) «Guardar el avance armado» con «Sí».
//  6) el itemizado y la certificación siguen igual; el auditor suma lo del avance nuevo.
//  7) tareas nuevas: en el catálogo (Llenar orden, sugerida) y en Modo obra.
//  8) asistente: «¿qué le falta a la Col 4?» (avance_obra) y proponer_marcar_avance con «Sí»; Dirección solo lee.
//  9) Dirección y «solo mirar» ven sin botones; la cuadrilla no ve el avance.
const { abrir, prueba } = require('./h');
const { datos158 } = require('./datos158');
const cel = process.argv[2] === 'cel';
const CAP = process.env.CAP || '';
const SOLO = (x) => !process.env.SOLO || process.env.SOLO.indexOf(x) >= 0;
const W = 'https://ema-ia.mdiaz-60f.workers.dev';
(async () => {
  const c = prueba('v158' + (cel ? ' cel' : ''));
  const MOD = { cel, espera: 5000, crew: true, nav: true, mtNuevo: true, tarjetas: true, ofPasos: true, porPartes: true, https: true, inicio: true, sugerida: true, iaPro: true, v145: true, v146: true, v147: true, v150: true, v151: true, v152: true, v153: true, v154: true, v155: true, v156: true, v157: true, v158: true, reglas: !!process.env.REGLAS, antes: () => { window.__pmPausa = true; window.__hvPausa = true; window.__isNoAuto = true; window.__aaPausa = true; window.__cvSinMic = true; } };
  let browser = null;
  const sesion = async (quien, op, dop) => { const A = await abrir(Object.assign({ sesion: quien, datos: datos158(dop || {}), browser }, MOD, op || {})); browser = A.browser; A.page.on('dialog', (x) => x.accept()); await A.page.waitForTimeout(1200); return A; };
  const db = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('stub.db') || '{}'));
  const scrollX = (p) => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const foto = async (p, nombre, sel) => { if (!CAP) return; await p.evaluate((s) => { const h = document.querySelector('header'); if (s) { const e = document.querySelector(s); e && e.scrollIntoView({ block: 'start' }); } }, sel); await p.waitForTimeout(350); await p.screenshot({ path: CAP + '/' + nombre + '_' + (cel ? 'cel' : 'pc') + '.png' }); };
  const errsJs = (A) => (A.errores || []).filter((e) => !/Missing or insufficient permissions|permission-denied|ERR_|Failed to fetch|aborted|fetching the script|prueba|sin permiso|Sin permiso/i.test(e));
  const avance = async (p, id) => { await p.evaluate(() => mostrarVista('avance')); await p.waitForTimeout(700); await p.evaluate((x) => verAvanceDetalle(x), id || 'b1'); await p.waitForTimeout(1200); };
  const pct = (p) => p.evaluate(() => Math.round(window.__av2.estado('b1').pctX * 100) / 100);   // el % exacto (el que se muestra va redondeado)
  const cel_ = (p, paso, i) => p.evaluate(([a, b]) => { const E = window.__av2.estado('b1'); const r = E.R[a + '|' + b]; return { e: r.e, ot: r.ot || '', sinCol: !!r.sinCol, motivo: r.motivo || '', asig: !!r.asig, dup: (r.dup || []).length }; }, [paso, i]);
  const tx = (p, s) => p.evaluate((x) => { const e = document.querySelector(x); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; }, s);
  const motivo = async (p, t, sel) => { await p.fill(sel || '#a2Mot', t); };
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

  // ================================================================= 0) el % y la pantalla
  if (SOLO('0')) {
    const A = await sesion('lucia'); const p = A.page;
    await avance(p);
    const r = await p.evaluate(() => { const o = avanceObras.find((x) => x.id === 'b1'), o2 = avanceObras.find((x) => x.id === 'b2'); return { av: window.__av2.pct(o), glob: calcularAvanceEtapasPct(o), doc: window.__docObra ? window.__docObra.pct(o) : null, fin: window.__obraFin(o), itz: window.avanceItemizadoPct(o), b2: calcularAvanceEtapasPct(o2), b2itz: window.avanceItemizadoPct(o2), b2lista: !!window.__av2.estado(o2) }; });
    c(r.av > 0 && r.av === r.glob && r.av === r.doc && r.av !== r.itz, 'el % de la obra sale del avance nuevo y es el que usa toda la app (calcularAvanceEtapasPct, docObra): ' + JSON.stringify(r));
    c(!r.b2lista && r.b2 === r.b2itz, 'la obra sin cálculo ni columnas no tiene lista: usa el % del itemizado (' + r.b2 + ' %)');
    const ring = await tx(p, '#a2App .a2-ring');
    c(new RegExp('^' + r.av + '\\s*%').test(ring), 'la pantalla: el anillo con el % (' + ring + ')');
    const panel = await p.evaluate(() => { const g = document.getElementById('avancePanelGrid'); return g ? g.textContent.replace(/\s+/g, ' ') : ''; });
    c(new RegExp('\\b' + r.av + '\\s*%').test(panel), '«Cómo va cada obra» muestra el mismo % · ' + panel.slice(0, 160));
    const rub = await p.evaluate(() => [...document.querySelectorAll('#a2App .a2-rh b')].map((b) => b.textContent));
    c(rub.join('|') === 'Civil|Columnas|Cajas de columna (tableritos)|Vínculos|Artefactos|Cableado|Puesta a tierra|Tablero|Pruebas y cierre', 'los 9 rubros como la maqueta A · ' + rub.join(' | '));
    const g = await p.evaluate(() => ({ filas: document.querySelectorAll('#a2App .a2-gf:not(.a2-gtot)').length, circ: [...document.querySelectorAll('#a2App .a2-gcirc')].map((x) => x.textContent).join('|'), cab: [...document.querySelectorAll('#a2App .a2-gh span')].map((x) => x.textContent).filter(Boolean).join(' ') }));
    c(g.filas === 12 && g.circ === 'Circuito 1|Circuito 2' && /Pozo Horm\. Izaje Vínc\. Artef\. Tabl\. Sello PAT/.test(g.cab), 'Columnas: la grilla C adentro (12 columnas × 8 pasos, por circuito) · ' + JSON.stringify(g));
    const cs = { iz1: await cel_(p, 'izaje', 0), v3: await cel_(p, 'vinc', 2), a2: await cel_(p, 'artef', 1), h8: await cel_(p, 'horm', 7), t1: await cel_(p, 'tabl', 0), i6: await cel_(p, 'izaje', 5), pat6: await cel_(p, 'pat', 5), pat3: await cel_(p, 'pat', 2), p12: await cel_(p, 'pozo', 11) };
    c(cs.iz1.e === 'ver' && cs.iz1.ot === 'OT-2026-302', 'Col 1 izaje: hecho por OT-2026-302 (cerrada, Modo obra) · ' + JSON.stringify(cs.iz1));
    c(cs.v3.e === 'ver' && cs.v3.sinCol && cs.v3.ot === 'OT-2026-303', '«vínculos × 5» sin decir cuáles → Col 1–5 «sin columna exacta» · ' + JSON.stringify(cs.v3));
    c(cs.a2.e === 'falla' && /quemado/.test(cs.a2.motivo), 'Col 2 artefacto: falla «artefacto quemado» (resta) · ' + JSON.stringify(cs.a2));
    c(cs.h8.e === 'frag', 'Col 8 hormigón de ayer: fraguando · ' + JSON.stringify(cs.h8));
    c(cs.t1.e === 'sinver' && cs.t1.ot === 'OT-2026-307', 'Col 1 tablerito: en revisión (mandado, sin cerrar) · ' + JSON.stringify(cs.t1));
    c(cs.i6.asig && cs.i6.e === 'falta', 'Col 6 izaje: asignado en la orden de mañana (no cuenta) · ' + JSON.stringify(cs.i6));
    c(cs.pat6.e === 'falta' && cs.pat3.e === 'nolleva', 'PAT solo al final de cada circuito (Col 6 lleva, Col 3 no) · ' + JSON.stringify([cs.pat6, cs.pat3]));
    const fl = await tx(p, '#a2App .a2-falta'), al = await tx(p, '#a2App .a2-als');
    c(/Col 2: artefacto quemado/.test(fl) && /papeles del cierre/.test(fl) && /3 bases fraguando/.test(al) && /1 falla/.test(al), 'el «flash»: Falta (con la falla y los papeles) y las alertas · ' + fl.slice(0, 160) + ' · ' + al);
    const ti = await tx(p, '#a2App .a2-tiempo'), mat = await tx(p, '#a2App .a2-mat');
    c(/Tiempo de la obra/.test(ti) && /días trabajados/.test(ti) && /por día/.test(ti) && /Prevista/.test(ti), '«Tiempo de la obra»: inicio, hoy, prevista, proyectada, días trabajados, ritmo · ' + ti.slice(0, 160));
    c(/3 de 4 completos/.test(mat), 'material para lo que falta: 3 de 4 completos (falta el fusible) · ' + mat.slice(0, 100));
    await foto(p, 'avance_flash', '#a2App');
    // de dónde sale: hoja de la celda
    await p.evaluate(() => { document.querySelector('#a2App [data-a2="rub"][data-r="columnas"]') || null; });
    await p.click('#a2App [data-a2="cel"][data-p="izaje"][data-i="0"]'); await p.waitForTimeout(400);
    let h = await tx(p, '#a2Ov');
    c(/De dónde sale/.test(h) && /OT-2026-302/.test(h) && /foto/.test(h) && !!(await p.$('#a2Ov .v7-x[aria-label="Cerrar"]')), 'tocar una celda: de dónde sale (orden, fecha, quién, foto, minutos) con ✕ · ' + h.slice(0, 160));
    await p.click('#a2Ov [data-a2="x"]'); await p.waitForTimeout(300);
    // ver itemizado
    await p.click('#a2App [data-a2="itemizado"]'); await p.waitForTimeout(500);
    const iz = await p.evaluate(() => ({ bar: (document.getElementById('a2Bar') || {}).textContent || '', app: !!(document.getElementById('a2App') && document.getElementById('a2App').offsetParent), gauge: !!(document.querySelector('#avanceDetalleCard .avance-gauge-row') && document.querySelector('#avanceDetalleCard .avance-gauge-row').offsetParent) }));
    c(new RegExp('Itemizado \\(lo que se cobra\\): ' + r.itz + ' %').test(iz.bar) && !iz.app && iz.gauge, '«🧾 Ver itemizado»: la pantalla de siempre, con «Itemizado (lo que se cobra): ' + r.itz + ' %» · ' + JSON.stringify(iz).slice(0, 200));
    await foto(p, 'itemizado', '#avanceDetalleCard');
    await p.click('#a2Bar [data-a2="volver"]'); await p.waitForTimeout(400);
    c(!!(await p.evaluate(() => document.getElementById('a2App').offsetParent)), '«← Volver al avance de obra»');
    // ¿cómo se calcula?
    await p.click('#a2App [data-a2="como"]'); await p.waitForTimeout(300);
    h = await tx(p, '#a2Ov');
    c(/horas-hombre/.test(h) && /a confirmar/.test(h) && /Izaje de la columna/.test(h) && /% del total/.test(h), '«¿Cómo se calcula?» con la tabla de pesos · ' + h.slice(0, 120));
    await p.click('#a2Ov [data-a2="x"]');
    // legajo, Inicio y Dirección con el mismo %
    const leg = await p.evaluate(async () => { window.abrirLegajo && window.abrirLegajo('b1'); await new Promise((r) => setTimeout(r, 900)); const t = [...document.querySelectorAll('#obrasApp .lg-tile')].find((x) => /Avance/.test(x.textContent)); return t ? t.textContent.replace(/\s+/g, ' ') : ''; });
    c(new RegExp('Avance ?' + r.av + '\\s*%').test(leg), 'el legajo muestra el mismo % · ' + leg);
    const dir = await p.evaluate(() => { try { const D = window.__inicioDir.datos(true); const x = (D.obras || []).find((o) => o.id === 'b1' || (o.o && o.o.id === 'b1')); return x ? (x.avance != null ? x.avance : x.a) : 'sin'; } catch (e) { return 'err ' + e.message; } });
    c(dir === 'sin' || dir === r.av, 'Dirección (programación) usa el mismo % · ' + dir);
    await p.waitForTimeout(1500);
    const d = await db(p);
    c(!d.avanceObras.b1.av2 && !(d.avanceObras.b1.avanceHist || []).length, 'nada se escribe solo: la obra no tiene av2 ni historial después de mirar');
    c((await scrollX(p)) <= 0, 'sin scroll de costado');
    c(!errsJs(A).length, 'sin errores de JS ' + JSON.stringify(errsJs(A).slice(0, 3)));
    await A.ctx.close();
  }

  // ================================================================= 1) se mueve solo con las órdenes
  if (SOLO('1')) {
    const A = await sesion('lucia'); const p = A.page;
    await avance(p);
    const p0 = await pct(p);
    await p.evaluate(() => window.fbOtUpdate('o307', { 'campo.pasosObra.conexionado_tablerito.col 3': { num: 'Col 3', ini: '10:00', fin: '10:40', estado: 'si', por: 'Juan Pérez', ts: Date.now(), min: 40 }, 'campo.marcas.conexionado_tablerito': { hecho: true, cant: 3, por: 'Juan Pérez' } }));
    await esperar(p, () => window.__av2.estado('b1').R['tabl|2'].e === 'sinver');
    const p1 = await pct(p), c3 = await cel_(p, 'tabl', 2), pv1 = await p.evaluate(() => window.__av2.estado('b1').pctVer);
    c(c3.e === 'sinver' && p1 >= p0, 'la cuadrilla manda el tablerito de la Col 3 → en revisión (color claro) y la obra se mueve (' + p0 + ' → ' + p1 + ' %) · ' + JSON.stringify(c3));
    const cls = await p.evaluate(() => { window.__av2.pintar(); const b = document.querySelector('#a2App [data-a2="cel"][data-p="tabl"][data-i="2"]'); return b ? b.className : ''; });
    c(/sinver/.test(cls), 'en la grilla se ve distinto (en revisión) · ' + cls);
    await p.evaluate(() => window.fbOtUpdate('o307', { estado: 'Terminada', cierre: { cerradoTs: Date.now(), fecha: fechaAISO(new Date()), cantidades: { conexionado_tablerito: 3 }, horas: 8, avanceItems: [] } }));
    await esperar(p, () => window.__av2.estado('b1').R['tabl|2'].e === 'ver');
    const c3b = await cel_(p, 'tabl', 2), pv2 = await p.evaluate(() => window.__av2.estado('b1').pctVer);
    c(c3b.e === 'ver' && (await cel_(p, 'tabl', 0)).e === 'ver' && pv2 >= pv1, 'la oficina cierra la orden → hecho (verificado) · ' + JSON.stringify(c3b) + ' · verificado ' + pv1 + ' → ' + pv2 + ' %');
    // «2 izajes» sin decir cuáles (la orden de mañana, mandada por marcas): a las siguientes que faltan
    await p.evaluate(() => window.fbOtUpdate('o308', { 'campo.marcas.montaje_prfv': { hecho: true, cant: 2, por: 'Juan Pérez' }, estado: 'En curso' }));
    await esperar(p, () => window.__av2.estado('b1').R['izaje|5'].e === 'sinver');
    const i6 = await cel_(p, 'izaje', 5), i7 = await cel_(p, 'izaje', 6), i8 = await cel_(p, 'izaje', 7), p3 = await pct(p);
    c(i6.e === 'sinver' && i6.sinCol && i7.e === 'sinver' && i8.e === 'falta' && p3 > p1, '«2 izajes» sin columna → Col 6 y 7 (las siguientes que faltan), «sin columna exacta», y la obra sube (' + p1 + ' → ' + p3 + ' %)');
    const d = await db(p);
    c(!d.avanceObras.b1.av2, 'todo eso sin escribir nada en la obra (sale de las órdenes)');
    c(!errsJs(A).length, 'sin errores de JS ' + JSON.stringify(errsJs(A).slice(0, 3)));
    await A.ctx.close();
  }

  // ================================================================= 2) a mano: columna completa, destildar, falla
  if (SOLO('2')) {
    const A = await sesion('lucia'); const p = A.page;
    await avance(p);
    const p0 = await pct(p);
    await p.click('#a2App .a2-tira [data-a2="col"][data-i="3"]'); await p.waitForTimeout(400);
    let h = await tx(p, '#a2Ov');
    c(/Col 4/.test(h) && /Columna completa/.test(h) && /BPN 6 verde · 2010/.test(h) && /Fusible 10×38 2 A · 3017/.test(h), 'la hoja de la Col 4: «✅ Columna completa», cada paso y las piezas (BPN, fusible…) · ' + h.slice(0, 200));
    await foto(p, 'columna', '#a2Ov .v7-caja');
    await p.click('#a2Ov [data-a2="completa"]'); await p.waitForTimeout(500);
    let d = await db(p);
    c(!d.avanceObras.b1.av2 && /motivo/i.test(await tx(p, '#a2HMsg')), 'sin motivo no guarda nada (pide el motivo)');
    await motivo(p, 'La Col 4 la terminaron sin orden, la vi en obra'); await p.click('#a2Ov [data-a2="completa"]'); await p.waitForTimeout(1500);
    d = await db(p);
    const m = (d.avanceObras.b1.av2 || {}).m || {}, ks = Object.keys(m).filter((k) => /_COL4$/.test(k));
    const p1 = await pct(p);
    c(ks.length >= 6 && ks.every((k) => m[k].e === 'si' && /sin orden/.test(m[k].motivo) && m[k].por), '«Columna completa» guarda cada paso que faltaba «a mano» con el motivo · ' + ks.join(','));
    c(p1 > p0 && (d.avanceObras.b1.av2.hist || []).length === 1 && (d.avanceObras.b1.avanceHist || []).some((x) => x.av2 && x.motivo), 'la obra sube (' + p0 + ' → ' + p1 + ' %) y queda en av2.hist y en avanceHist (v156)');
    const est = await p.evaluate(() => window.__av2.estadoCol(window.__av2.estado('b1'), 3));
    c(est.n === est.t, 'la Col 4 queda completa (' + est.n + ' de ' + est.t + ')');
    const ori = await tx(p, '#a2Ov');
    c(/Sin orden · cargado a mano/.test(ori) && /Historial/.test(ori), 'cada paso dice «Sin orden · cargado a mano» y hay historial');
    // destildar el sellado
    await motivo(p, 'El sellado no está, me equivoqué'); await p.click('#a2Ov [data-a2="pMarcar"][data-p="sello"][data-ac="desmarcar"]'); await p.waitForTimeout(1300);
    const s4 = await cel_(p, 'sello', 3), p2 = await pct(p);
    c(s4.e === 'falta' && p2 < p1, 'destildar el sellado: vuelve a falta y la obra baja (' + p1 + ' → ' + p2 + ' %)');
    await p.click('#a2Ov [data-a2="x"]'); await p.waitForTimeout(300);
    // falla en el izaje de la Col 3 (hecho por OT-2026-302): resta y vuelve
    await p.click('#a2App [data-a2="cel"][data-p="izaje"][data-i="2"]'); await p.waitForTimeout(400);
    await motivo(p, 'Columna golpeada por un camión'); await p.click('#a2Ov [data-a2="pMarcar"][data-p="izaje"][data-ac="falla"]'); await p.waitForTimeout(1300);
    const f3 = await cel_(p, 'izaje', 2), p3 = await pct(p);
    c(f3.e === 'falla' && /golpeada/.test(f3.motivo) && p3 < p2, '«Se arruinó»: falla con motivo, resta (' + p2 + ' → ' + p3 + ' %) y vuelve a pendiente · ' + JSON.stringify(f3));
    const fl = await tx(p, '#a2App .a2-falta');
    c(/Col 3: Columna golpeada/.test(fl), 'la falla aparece en «Falta» · ' + fl.slice(0, 120));
    await p.click('#a2App [data-a2="cel"][data-p="izaje"][data-i="2"]'); await p.waitForTimeout(400);
    await motivo(p, 'Ya la cambiaron'); await p.click('#a2Ov [data-a2="pMarcar"][data-p="izaje"][data-ac="marcar"]'); await p.waitForTimeout(1300);
    const p4 = await pct(p);
    const i3 = await cel_(p, 'izaje', 2); c(/^(mano|ver)$/.test(i3.e) && p4 === p2, 'marcarla otra vez: vuelve (' + p2 + ' → ' + p4 + ' %, ' + i3.e + ') y queda el historial (' + (((await db(p)).avanceObras.b1.av2 || {}).hist || []).length + ' cambios)');
    c((await scrollX(p)) <= 0, 'sin scroll de costado');
    c(!errsJs(A).length, 'sin errores de JS ' + JSON.stringify(errsJs(A).slice(0, 3)));
    await A.ctx.close();
  }

  // ================================================================= 3) elegir varias + aviso de fraguado
  if (SOLO('3')) {
    const A = await sesion('lucia'); const p = A.page;
    await avance(p);
    await p.click('#a2App [data-a2="selOn"]'); await p.waitForTimeout(300);
    for (const i of [6, 7, 8, 9]) { await p.click(`#a2App [data-a2="elegir"][data-i="${i}"]`); await p.waitForTimeout(150); }
    await p.click('#a2App [data-a2="selPaso"][data-p="izaje"]'); await p.waitForTimeout(300);
    const av = await tx(p, '#a2App .a2-selp');
    c(/4 elegidas/.test(await tx(p, '#a2App .a2-selcab')) && /Col 7 está fraguando/.test(av) && /Col 10 todavía no tiene hormigón/.test(av) && /¿Lo marcaron igual\?/.test(av) && /Marcar igual en las 4/.test(av), '«Elegir varias» Col 7–10 + Izaje: avisa fraguando y sin hormigón y pregunta · ' + av.slice(0, 220));
    await foto(p, 'elegir_varias', '#a2App .a2-grilla');
    await p.fill('#a2SelMot', 'Las izaron igual con caño'); await p.click('#a2App [data-a2="selMarcar"]'); await p.waitForTimeout(1500);
    const d = await db(p), m = (d.avanceObras.b1.av2 || {}).m || {};
    c(['COL7', 'COL8', 'COL9', 'COL10'].every((k) => m['c_izaje_' + k] && m['c_izaje_' + k].e === 'si') && Object.keys(m).length === 4, '«Marcar igual en las 4»: el izaje de las 4 queda a mano con el motivo · ' + Object.keys(m).join(','));
    c(!(await p.$('#a2App .a2-selp')), 'y sale del modo elegir');
    c(!errsJs(A).length, 'sin errores de JS ' + JSON.stringify(errsJs(A).slice(0, 3)));
    await A.ctx.close();
  }

  // ================================================================= 4) mover foto, corregir cierre y anular revierten
  if (SOLO('4')) {
    const A = await sesion('lucia'); const p = A.page;
    await avance(p);
    const p0 = await pct(p);
    const adj = await p.evaluate(() => { const o = ordenesTrabajo.find((x) => x.id === 'o302'); return Object.keys(o.campo.fotos).find((k) => o.campo.fotos[k].num === 'Col 5'); });
    const mv = await p.evaluate(async (a) => { try { const r = await window.__moverFoto.mover([a], { num: 'Col 6' }, 'era la Col 6'); return r && (r.ok !== false); } catch (e) { return 'err ' + e.message; } }, adj);
    await esperar(p, () => window.__av2.estado('b1').R['izaje|5'].e === 'ver');
    const i5 = await cel_(p, 'izaje', 4), i6 = await cel_(p, 'izaje', 5);
    c(mv === true && i5.e === 'falta' && i6.e === 'ver' && i6.ot === 'OT-2026-302', '«↔ Mover» la foto del izaje de Col 5 a Col 6: el avance la pasa de columna · ' + JSON.stringify([mv, i5.e, i6]));
    const cc = await p.evaluate(async () => { try { const P = window.__corregirCierre.plan('o304', [{ tarea: 'montaje_luminaria', cantidad: 2 }], 'era 2, no 3'); if (P.err) return 'plan ' + P.err; const r = await window.__corregirCierre.aplicar(P); return r && (r.ok !== false) ? true : JSON.stringify(r); } catch (e) { return 'err ' + e.message; } });
    await esperar(p, () => window.__av2.estado('b1').R['artef|2'].e === 'falta');
    c(cc === true && (await cel_(p, 'artef', 2)).e === 'falta' && (await cel_(p, 'artef', 0)).e === 'ver', '✏ Corregir cierre (artefacto 3 → 2): la Col 3 deja de figurar hecha · ' + cc);
    const p1 = await pct(p);
    await p.evaluate(() => window.fbOtUpdate('o302', { estado: 'Anulada' }));
    await esperar(p, () => window.__av2.estado('b1').R['izaje|0'].e !== 'ver');
    const p2 = await pct(p);
    c((await cel_(p, 'izaje', 0)).e === 'falta' && p2 < p1 && p1 <= p0, 'anular la orden del izaje: las columnas vuelven a falta (' + p0 + ' → ' + p1 + ' → ' + p2 + ' %)');
    c(!errsJs(A).length, 'sin errores de JS ' + JSON.stringify(errsJs(A).slice(0, 3)));
    await A.ctx.close();
  }

  // ================================================================= 5) guardar el avance armado
  if (SOLO('5')) {
    const A = await sesion('lucia'); const p = A.page;
    await avance(p);
    const a = await tx(p, '#a2App .a2-arm');
    c(/todavía no se guardó/.test(a), 'avisa «Armado con lo que dicen las órdenes · todavía no se guardó» · ' + a);
    await p.click('#a2App [data-a2="guardarArmado"]'); await p.waitForTimeout(300);
    c(/no se escribió nada/.test(await tx(p, '#a2Ov')), 'pregunta antes («Sí, guardar»)');
    await p.click('#a2Ov [data-a2="guardarSi"]'); await p.waitForTimeout(1300);
    const d = await db(p), g = ((d.avanceObras.b1.av2 || {}).guardado) || {};
    c(g.pct === (await p.evaluate(() => window.__av2.pct('b1'))) && g.por && g.resumen && g.resumen.izaje === '5 de 12', 'con «Sí» queda av2.guardado (% y resumen) · ' + JSON.stringify(g).slice(0, 160));
    c(!(await p.$('#a2App .a2-arm')), 'y ya no lo ofrece');
    await A.ctx.close();
  }

  // ================================================================= 6) itemizado, certificación, auditor
  if (SOLO('6')) {
    const A = await sesion('lucia'); const p = A.page;
    await avance(p);
    const r = await p.evaluate(() => { const o = avanceObras.find((x) => x.id === 'b1'); const M = fechaAISO(new Date()).slice(0, 7); const con = JSON.stringify(window.__certMensual ? window.__certMensual.armar(M) : null), it = window.avanceItemizadoPct(o); window.__v158No = true; const sin = JSON.stringify(window.__certMensual ? window.__certMensual.armar(M) : null), pctSin = calcularAvanceEtapasPct(o); window.__v158No = false; return { igual: con === sin, it, pctSin, con: con.length }; });
    c(r.igual && r.it === r.pctSin, 'la certificación y el itemizado no cambian (con y sin la v158: igual; itemizado ' + r.it + ' %) · ' + JSON.stringify(r));
    const H = await p.evaluate(() => window.__auditAvance.revisar({ obra: 'b1' }).hallazgos.map((h) => h.tipo));
    c(H.indexOf('fallaAv2') >= 0, 'el auditor (v156) suma lo del avance nuevo (fallas para rehacer) · ' + H.join(','));
    const ex = await p.evaluate(() => { const O = window.__auditAvance.explicarObra('b1'); return { av: O.avancePct, it: O.avanceItemizadoPct, nuevo: !!O.avanceNuevo }; });
    c(ex.nuevo && ex.it === r.it, 'explicarObra trae el avance nuevo y el itemizado aparte · ' + JSON.stringify(ex));
    const dup = await p.evaluate(() => window.__av2.hallazgosAuditor(avanceObras.find((x) => x.id === 'b1')).map((h) => h.tipo + ':' + h.texto).join(' | '));
    c(/fallaAv2/.test(dup), 'hallazgos del avance nuevo · ' + dup.slice(0, 160));
    await A.ctx.close();
  }

  // ================================================================= 7) tareas nuevas
  if (SOLO('7')) {
    const A = await sesion('lucia'); const p = A.page;
    const t = await p.evaluate(() => { const ids = ['acabado_pozo', 'fusibles_borneras', 'subida_cable', 'prensacables', 'morsetos_terminales', 'conexion_epec', 'inspeccion_interna', 'plano_conforme', 'certificado_instalacion', 'carpeta_epec', 'rehacer_falla']; return ids.map((k) => { const a = ACTIVIDADES_CATALOGO.find((x) => x.id === k), d = window.__DICC_ID[k]; return { k, cat: !!a, pasos: !!(a && /a confirmar/.test(a.pasos || '')), pts: d && d.pts, noAv: d && d.noAvanza, av: (window.__av2.TAREA_AV[k] || []).length > 0 || k === 'rehacer_falla' }; }); });
    c(t.every((x) => x.cat && x.pasos && x.pts > 0 && x.noAv && x.av), 'las 11 tareas nuevas están en el catálogo (con pasos «a confirmar», puntos = HH × dificultad), no mueven el itemizado y sí el avance nuevo · ' + JSON.stringify(t.filter((x) => !(x.cat && x.pasos && x.pts > 0 && x.noAv && x.av))));
    await p.evaluate(() => mostrarVista('parte')); await p.waitForTimeout(800);
    const lo = await p.evaluate(() => document.getElementById('viewParteDiario').innerHTML.indexOf('Acabado de pozo') >= 0 || [...document.querySelectorAll('option')].some((o) => /Acabado de pozo/.test(o.textContent)));
    c(lo, 'aparecen en «Llenar orden»');
    const sg = await p.evaluate(() => { try { const r = window.__sugerida.rend('fusibles_borneras'); return r && (r.porDia || r.dia || r.v || JSON.stringify(r)); } catch (e) { return 'err ' + e.message; } });
    c(sg && !/^err/.test(String(sg)), 'la orden sugerida tiene un rendimiento por defecto (del diccionario, a confirmar) · ' + JSON.stringify(sg).slice(0, 80));
    await A.ctx.close();
    const B = await sesion('juan', { cel: true }, { juanNueva: true }); const q = B.page;
    await q.evaluate(() => mostrarVista('inicio')); await q.waitForTimeout(600); await q.evaluate(() => window.__cuadrillaDia.ir('obra')); await q.waitForTimeout(900);
    const mo = await tx(q, '#cdApp');
    c(/Fusibles, portafusibles y borneras/.test(mo) && /Col 1/.test(mo), 'Modo obra de la cuadrilla con la tarea nueva, columna por columna · ' + mo.slice(0, 160));
    await B.ctx.close();
  }

  // ================================================================= 8) asistente
  if (SOLO('8')) {
    const A = await sesion('lucia'); const p = A.page;
    await p.waitForTimeout(2500);
    await p.evaluate(async () => { const P = window.__av2.planMarcar({ obra: 'b1', columnas: ['Col 4'], pieza: 'bpn_v', accion: 'pieza_falta', cant: 1 }); await window.__av2.aplicar(P, 'Falta una BPN verde en la caja'); });
    const sw = await worker(p); await p.evaluate(() => window.__asistenteAbrir()); await p.waitForTimeout(700);
    let ped = await decir(p, sw, '¿qué le falta a la col 4 de bulevares?', [usa('avance_obra', { obra: 'BULEVARES', columna: 'Col 4' }), fin('A la Col 4 le falta 1 BPN verde.')]);
    const r1 = resultado(ped, 1);
    c(herramientas(ped).indexOf('avance_obra') >= 0 && herramientas(ped).indexOf('proponer_marcar_avance') >= 0, 'la oficina tiene avance_obra y proponer_marcar_avance');
    c(/BPN 6 verde \(2010\)/.test(r1) && /Col 4/.test(r1) && /avanceObraPct/.test(r1) && /avanceItemizadoPct/.test(r1), 'avance_obra: qué le falta a la Col 4 exacto (pieza con código) y los dos % · ' + r1.slice(0, 220));
    ped = await decir(p, sw, 'marcá el artefacto de la col 4, lo vi colocado', [usa('proponer_marcar_avance', { obra: 'BULEVARES', columnas: 'Col 4', pasos: 'artefacto', accion: 'marcar', motivo: 'lo vi colocado' }), fin('¿Lo marco?')]);
    c(/pendiente_de_confirmacion/.test(resultado(ped, 1)), 'proponer_marcar_avance arma la tarjeta (no guarda) · ' + resultado(ped, 1).slice(0, 120));
    let d = await db(p);
    c(!((d.avanceObras.b1.av2 || {}).m || {}).c_artef_COL4, 'antes del «Sí» no cambia nada');
    await p.click('#iaChat .ia-conf:last-of-type [data-iasi]'); await p.waitForTimeout(1600);
    d = await db(p); const v = ((d.avanceObras.b1.av2 || {}).m || {}).c_artef_COL4 || {};
    c(v.e === 'si' && v.porAsistente && /colocado/.test(v.motivo), 'con «Sí»: el artefacto de la Col 4 queda a mano (porAsistente, con el motivo) · ' + JSON.stringify(v).slice(0, 140));
    await A.ctx.close();
    const B = await sesion('dir'); const q = B.page;
    await q.waitForTimeout(2500);
    const sw2 = await worker(q); await q.evaluate(() => window.__asistenteAbrir()); await q.waitForTimeout(700);
    const ped2 = await decir(q, sw2, '¿cuánto va bulevares?', [usa('avance_obra', { obra: 'BULEVARES' }), fin('Va bien.')]);
    c(herramientas(ped2).indexOf('avance_obra') >= 0 && herramientas(ped2).indexOf('proponer_marcar_avance') < 0 && /avanceObraPct/.test(resultado(ped2, 1)), 'Dirección: lee el avance (avance_obra) y no puede proponer cambios');
    await B.ctx.close();
  }

  // ================================================================= 9) Dirección, solo mirar y cuadrilla
  if (SOLO('9')) {
    for (const quien of ['dir', 'mir']) {
      const A = await sesion(quien); const p = A.page;
      await avance(p);
      const r = await p.evaluate(() => ({ app: !!document.getElementById('a2App'), sel: !!document.querySelector('#a2App [data-a2="selOn"]'), arm: !!document.querySelector('#a2App [data-a2="guardarArmado"]'), add: !!document.querySelector('#a2App [data-a2="agregar"]') }));
      await p.evaluate(() => window.__av2.abrirColumna('b1', 3)); await p.waitForTimeout(300);
      const h = await p.evaluate(() => ({ completa: !!document.querySelector('#a2Ov [data-a2="completa"]'), marcar: !!document.querySelector('#a2Ov [data-a2="pMarcar"]'), mot: !!document.getElementById('a2Mot') }));
      c(r.app && !r.sel && !r.arm && !r.add && !h.completa && !h.marcar && !h.mot, (quien === 'dir' ? 'Dirección' : '«Solo mirar»') + ': ve el avance nuevo sin ningún botón para cambiar · ' + JSON.stringify([r, h]));
      if (quien === 'dir') await foto(p, 'direccion', '#a2App');
      await A.ctx.close();
    }
    const B = await sesion('juan', { cel: true }); const q = B.page;
    const v = await q.evaluate(() => ({ ve: window.__av2.puedeVer(), perm: window.PERMISOS.permiso('avance') }));
    c(!v.ve && v.perm === 'oculto', 'la cuadrilla no ve el avance de obra · ' + JSON.stringify(v));
    await B.ctx.close();
  }
  if (browser) await browser.close();
  return c.fin ? c.fin() : null;
})();
