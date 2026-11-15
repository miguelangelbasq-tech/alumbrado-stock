// v156 · Auditor del avance de obra (el asistente y una hoja sin IA controlan el avance con exactitud).
//  0) explicar y revisar (sin IA): cada número con sus fuentes y la suma cuadra; revisar encuentra todo lo sembrado y nada en
//     la obra buena (SAN PABLO); hoja «🔎 Control del avance» (.v7-ov, role=dialog, ✕) con la obra, el ítem desplegable y la suma.
//  1) nota del porqué con «Sí» (asistente) y después ya no se marca; nota a mano desde la hoja.
//  2) varias correcciones juntas con casillas (se destilda una): historial con motivo y auditoría «avance_auditoria».
//  3) motivo obligatorio al cambiar lo hecho a mano en Avance de obra (cancelar no cambia; con motivo queda en avanceHist).
//  4) el asistente: las 4 preguntas (¿está bien LOS ÁLAMOS?, ¿por qué el ítem 5 dice…?, ¿qué se hizo esta semana y cuadra?,
//     revisá todas las obras → modelo del supervisor y effort high) y la tarjeta; SISTEMA.
//  5) permisos: Dirección ve (sin botones ni proponer_*), cuadrilla / pañol / solo mirar no.
//  6) Supervisor, Inicio Ejecutivo «Para atender», parte del avance de las 18 h, revisión con IA de las 12/18 h.
//  7) arreglo de la v155: el Inicio de Dirección no muestra proyecciones absurdas («+999 d», «2890 días después»).
const { abrir, prueba } = require('./h');
const { datos156 } = require('./datos156');
const { datos155 } = require('./datos155');
const cel = process.argv[2] === 'cel';
const W = 'https://ema-ia.mdiaz-60f.workers.dev';
const CAP = process.env.CAP || '';
const SOLO = (x) => !process.env.SOLO || process.env.SOLO.indexOf(x) >= 0;
(async () => {
  const c = prueba('v156' + (cel ? ' cel' : ''));
  const MOD = { cel, espera: 5000, v145: true, v146: true, v147: true, v150: true, v151: true, v152: true, v153: true, v154: true, v155: true, v156: true, sugerida: true, inicio: true, porPartes: true, ofPasos: true, tarjetas: true, nav: true, mtNuevo: true, iaPro: true, crew: true, https: true, reglas: !!process.env.REGLAS, antes: () => { window.__pmPausa = true; window.__cvSinMic = true; window.__hvPausa = true; window.__isNoAuto = true; window.__aaPausa = true; } };
  let browser = null;
  const sesion = async (quien, op, datos) => { const A = await abrir(Object.assign({ sesion: quien, datos: (datos || datos156)(), browser }, MOD, op || {})); browser = A.browser; A.page.on('dialog', (x) => x.accept()); await A.page.waitForTimeout(1200); return A; };
  const db = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('stub.db') || '{}'));
  const scrollX = (p) => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const foto = async (p, nombre, sel) => { if (!CAP) return; if (sel) await p.evaluate((s) => { const e = document.querySelector(s); e && e.scrollIntoView({ block: 'center' }); }, sel); await p.waitForTimeout(350); await p.screenshot({ path: CAP + '/' + nombre + '_' + (cel ? 'cel' : 'pc') + '.png' }); };
  const auds = async (p) => Object.values((await db(p)).auditoria || {}).filter((a) => a.accion === 'avance_auditoria');
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
  const errsJs = (A) => (A.errores || []).filter((e) => !/Missing or insufficient permissions|permission-denied|ERR_|Failed to fetch|aborted|fetching the script|prueba|sin permiso|Sin permiso/i.test(e));
  const hall = (p, a) => p.evaluate((x) => window.__auditAvance.revisar(x || {}).hallazgos.map((h) => ({ nivel: h.nivel, tipo: h.tipo, obra: h.obra, item: h.item || '', numero: h.numero || '', texto: h.texto })), a || {});

  // ================================================================= 0) explicar y revisar (sin IA) + la hoja
  if (SOLO('0')) {
    const A = await sesion('lucia'); const p = A.page;
    await p.waitForTimeout(4000);
    let r = await p.evaluate(() => window.__auditAvance.explicarItem('PLAZA SAN PABLO', '5'));
    c(r.cuadra && r.hechas === 1 && r.fuentes.length === 3 && r.fuentes.map((x) => x.numero + ' ' + x.k + ' ' + x.delta).join(',') === 'OT-2026-201 excavacion 0.24,OT-2026-201 hormigonado 0.26,OT-2026-202 montaje_prfv 0.5' && /0,24 \+ 0,26 \+ 0,5 = 1 ✓ cuadra/.test(r.texto), 'SAN PABLO ítem 5: cada unidad con su orden, tarea y parte (0,24 + 0,26 + 0,5 = 1 ✓) · ' + r.texto.slice(0, 300));
    c(/12 % del ítem/.test(r.texto) && /13 % del ítem/.test(r.texto) && /25 % del ítem/.test(r.texto), 'dice la parte del ítem de cada tarea (por partes: 12 %, 13 %, 25 %)');
    r = await p.evaluate(() => window.__auditAvance.explicarItem('PLAZA LAS ROSAS', '15'));
    c(!r.fuentes.length && r.sinFecha === 40 && r.estado === 'aMano' && /a mano, sin fecha, sin motivo anotado: \+40/.test(r.texto) && /= 40 ✓ cuadra/.test(r.texto), 'LAS ROSAS ítem 15: 40 «a mano, sin fecha, sin motivo anotado» y la suma cuadra · ' + r.texto.slice(0, 260));
    r = await p.evaluate(() => window.__auditAvance.explicarObra('s1'));
    c(r.avancePct === 50 && !r.hallazgos.length && /todo|No encontré nada raro/.test(r.resumen) && r.planilla && r.planilla.cols === 2 && /Col 1: Pozo ✓ \(OT-2026-201/.test(r.planilla.columnas[0]) && /Izaje ✓ \(OT-2026-202/.test(r.planilla.columnas[0]) && /con foto/.test(r.planilla.columnas[0]), 'SAN PABLO: 50 %, nada raro, planilla columna por columna (pozo, hormigonado, izaje con orden, fecha y foto) · ' + JSON.stringify(r.planilla && r.planilla.columnas[0]).slice(0, 200));
    c(/El itemizado dice 2 columnas/.test(r.contraItemizado) && /izaje 2/.test(r.contraItemizado), 'contra el itemizado: «el itemizado dice 2 columnas… la planilla tiene izaje 2…» · ' + r.contraItemizado.slice(0, 200));
    const H = await hall(p);
    const tiene = (tipo, obra, re) => H.some((h) => h.tipo === tipo && h.obra === obra && (!re || re.test(h.texto)));
    c(!H.some((h) => h.obra === 'PLAZA SAN PABLO'), 'nada en la obra que cuadra perfecto (SAN PABLO)');
    c(tiene('sinRespaldo', 'PLAZA LAS ROSAS', /sin ninguna evidencia/), 'ítem cargado a mano sin respaldo (LAS ROSAS)');
    c(tiene('sinFecha', 'PLAZA LAS ROSAS', /no entran en ninguna certificación/), 'avance sin fecha fuera de la certificación (LAS ROSAS)');
    c(tiene('noMovio', 'PLAZA EL OLMO', /OT-2026-203.*no movió el avance.*0,52 al ítem 5/), 'orden cerrada que no movió el avance (OT-203, debía sumar 0,52)');
    c(tiene('dosVecesOt', 'PLAZA EL OLMO', /OT-2026-204 .*DOS VECES el ítem 5.*0,5 \+ 0,5.*sobran 0,5/), 'orden que movió el avance dos veces (OT-204: 0,5 + 0,5, sobran 0,5)');
    c(tiene('ordenImposible', 'PLAZA LOS PINOS', /izada sin hormigonado.*Col 1/), 'columna izada sin hormigonado (LOS PINOS, a revisar)');
    c(tiene('fraguado', 'PLAZA EL CEIBO', /menos de 72 h de fraguado.*1 día/), 'hormigonado e izaje con 1 día de diferencia (EL CEIBO)');
    c(tiene('calculo', 'PLAZA SARMIENTO', /16 columnas de 10 m.*ítem 8/), 'el cálculo distinto del itemizado (SARMIENTO: 16 de 10 m contra 8 en el ítem 8)');
    c(tiene('deMas', 'PLAZA ITALIA', /2 hechas de 1/), 'hechas de más que lo contratado (ITALIA)');
    c(tiene('documentacion', 'PLAZA VÉLEZ', /planilla de PAT/) && !H.some((h) => h.obra === 'PLAZA VÉLEZ' && /carpeta EPEC|conforme|certificado de instalaci/.test(h.texto)), 'obra al 100 % sin PAT (VÉLEZ; lo demás está)');
    c(H.filter((h) => h.nivel === 'rojo').length >= 4 && H.every((h) => ['rojo', 'ambar', 'info'].includes(h.nivel)), 'cada hallazgo con su nivel (rojo / ámbar / info) · ' + H.length + ' hallazgos');
    // la hoja sin IA
    await p.evaluate(() => window.__auditAvance.abrir({ obra: '' })); await p.waitForTimeout(700);
    r = await p.evaluate(() => { const o = document.getElementById('aaOv'); return o ? { v7: o.classList.contains('v7-ov'), dlg: o.getAttribute('role'), x: !!o.querySelector('.v7-x[aria-label="Cerrar"]'), obras: o.querySelectorAll('.aa-ob').length, rojo: o.querySelectorAll('.qp-h.rojo').length, cc: !!o.querySelector('[data-ccabrir="t204"]') } : null; });
    c(r && r.v7 && r.dlg === 'dialog' && r.x && r.obras >= 8 && r.rojo >= 4 && r.cc, 'hoja «🔎 Control del avance» (.v7-ov, role=dialog, ✕): obras, hallazgos rojos y «✏ Corregir cierre» · ' + JSON.stringify(r));
    await foto(p, 'control_todas', '#aaOv .qp-h.rojo');
    if (cel) c((await scrollX(p)) <= 0, 'celu: sin scroll de costado (hoja)');
    await p.selectOption('#aaObra', 's1'); await p.waitForTimeout(600);
    await p.click('#aaOv [data-aa="item"][data-id="5"]'); await p.waitForTimeout(400);
    r = await p.evaluate(() => { const o = document.getElementById('aaOv'); return { res: (o.querySelector('.aa-res') || {}).textContent || '', suma: (o.querySelector('.aa-suma') || {}).textContent || '', fu: o.querySelectorAll('.aa-itb .aa-f').length, pl: !!o.querySelector('.aa-pl'), sinH: /No encontré nada raro/.test(o.textContent) }; });
    c(/50 %/.test(r.res) && /0,24 \+ 0,26 \+ 0,5 = 1 ✓ cuadra/.test(r.suma) && r.fu === 3 && r.pl && r.sinH, 'la hoja de SAN PABLO: 50 %, el ítem desplegado con sus 3 fuentes y la suma que cuadra, la planilla de columnas · ' + JSON.stringify(r).slice(0, 200));
    await foto(p, 'control_obra', '#aaOv .aa-itb');
    if (cel) c((await scrollX(p)) <= 0, 'celu: sin scroll de costado (obra)');
    await p.click('#aaOv .v7-x'); await p.waitForTimeout(300);
    c(await p.evaluate(() => !document.getElementById('aaOv')), '✕ cierra la hoja');
    // accesos: Avance de obra (arriba y en la obra) y legajo
    await p.evaluate(() => { mostrarVista('avance'); verAvanceDetalle('s1'); }); await p.waitForTimeout(2600);
    r = await p.evaluate(() => ({ top: !!document.querySelector('#avancePanelCard .aa-btn[data-aaabrir=""]'), obra: !!document.querySelector('#aviSec .aa-btn[data-aaabrir="s1"]') }));
    c(r.top && r.obra, 'Avance de obra: «🔎 Control del avance» arriba y en la obra · ' + JSON.stringify(r));
    await p.evaluate(() => { mostrarVista('obras'); window.abrirLegajo('s3'); }); await p.waitForTimeout(3000);
    r = await p.evaluate(() => { const s = document.getElementById('lgAaSec'); return s ? s.textContent.replace(/\s+/g, ' ') : ''; });
    c(/Control del avance/.test(r) && /3 mal/.test(r), 'legajo: sección «🔎 Control del avance» (EL OLMO: 3 mal) · ' + r.slice(0, 120));
    c(!errsJs(A).length, 'sin errores de JS ' + JSON.stringify(errsJs(A).slice(0, 3)));
    await A.page.context().close();
  }

  // ================================================================= 1) nota del porqué con «Sí»
  if (SOLO('1')) {
    const A = await sesion('lucia'); const p = A.page;
    await p.waitForTimeout(4000);
    const sw = await worker(p); await p.evaluate(() => window.__asistenteAbrir()); await p.waitForTimeout(700);
    let ped = await decir(p, sw, 'anotá que los 40 m de zanja de LAS ROSAS los cargamos a mano porque la orden se perdió', [usa('proponer_nota_avance', { obra: 'LAS ROSAS', item: '15', texto: 'Los 40 m los cargamos a mano porque la orden se perdió' }), fin('¿La guardo?')]);
    c(/pendiente_de_confirmacion/.test(resultado(ped, 1)), 'proponer_nota_avance arma la tarjeta (no guarda nada todavía) · ' + resultado(ped, 1).slice(0, 120));
    let d = await db(p);
    c(!(d.avanceObras.s2.avanceNotas || []).length, 'antes del «Sí» no hay nota');
    await p.click('#iaChat .ia-conf:last-of-type [data-iasi]'); await p.waitForTimeout(1500);
    d = await db(p);
    const nota = (d.avanceObras.s2.avanceNotas || [])[0] || {};
    c(nota.item === '15' && /orden se perdió/.test(nota.texto) && nota.porAsistente && nota.por, 'con «Sí»: avanceNotas {item, texto, por, ts} en la obra · ' + JSON.stringify(nota).slice(0, 160));
    const H = await hall(p, { obra: 's2' });
    c(!H.some((h) => h.tipo === 'sinRespaldo' || h.tipo === 'sinFecha'), 'después ya no lo marca (la nota explica el número) · ' + JSON.stringify(H).slice(0, 160));
    const e = await p.evaluate(() => window.__auditAvance.explicarItem('s2', '15').texto);
    c(/explicado por la nota/.test(e) && /orden se perdió/.test(e), 'y la explicación usa la nota · ' + e.slice(0, 200));
    c((await auds(p)).some((x) => /nota/.test(x.detalle || '')), 'auditoría «avance_auditoria» de la nota');
    // a mano desde la hoja
    await p.evaluate(() => { window.__asistente && window.__asistente.cerrar && window.__asistente.cerrar(); window.__auditAvance.abrir({ obra: 's4' }); }); await p.waitForTimeout(600);
    await p.click('#aaOv [data-aa="nota"]'); await p.waitForTimeout(400);
    await p.fill('#aaNotaIn', 'El pozo y la base de LOS PINOS los hizo una cuadrilla de la Municipalidad'); await p.click('#aaOv [data-aa="notasi"]'); await p.waitForTimeout(1200);
    d = await db(p);
    c((d.avanceObras.s4.avanceNotas || []).some((x) => /Municipalidad/.test(x.texto)) && /Nota guardada/.test(await p.textContent('#aaOv')), 'la hoja anota el porqué a mano («Sí, anotar»)');
    c(!errsJs(A).length, 'sin errores de JS ' + JSON.stringify(errsJs(A).slice(0, 3)));
    await A.page.context().close();
  }

  // ================================================================= 2) varias correcciones con casillas
  if (SOLO('2')) {
    const A = await sesion('lucia'); const p = A.page;
    await p.waitForTimeout(4000);
    const sw = await worker(p); await p.evaluate(() => window.__asistenteAbrir()); await p.waitForTimeout(700);
    let ped = await decir(p, sw, 'corregí lo de ITALIA, EL OLMO y anotá lo de VÉLEZ', [usa('proponer_correcciones_avance', { motivo: 'Control del avance del 14/11', correcciones: [{ tipo: 'item', obra: 'ITALIA', item: '9', hechas: 1 }, { tipo: 'item', obra: 'EL OLMO', item: '5', hechas: 0.5 }, { tipo: 'nota', obra: 'VÉLEZ', texto: 'La planilla de PAT la tiene el inspector' }] }), fin('Confirmá.')]);
    c(/pendiente_de_confirmacion/.test(resultado(ped, 1)), 'una sola tarjeta con las 3 correcciones');
    let r = await p.evaluate(() => { const e = [...document.querySelectorAll('#iaChat .ia-conf')].pop(); return e ? { n: e.querySelectorAll('input[data-aasel]').length, t: e.textContent.replace(/\s+/g, ' ') } : null; });
    c(r && r.n === 3 && /ítem 9/.test(r.t) && /2 → 1/.test(r.t), 'la tarjeta tiene 3 casillas con antes → después · ' + (r && r.t.slice(0, 200)));
    await p.click('#iaChat .ia-conf:last-of-type input[data-aasel="1"]'); await p.waitForTimeout(200);   // destilda EL OLMO
    await p.click('#iaChat .ia-conf:last-of-type [data-iasi]'); await p.waitForTimeout(2000);
    const d = await db(p), it = d.avanceObras.s7.valorItems[0], ol = d.avanceObras.s3.valorItems[0];
    const h = (d.avanceObras.s7.avanceHist || [])[0] || {};
    c(it.cantidadAvanzada === 1 && ol.cantidadAvanzada === 1 && (d.avanceObras.s8.avanceNotas || []).some((x) => /inspector/.test(x.texto)), 'con «Sí»: ITALIA 2 → 1 y la nota de VÉLEZ; EL OLMO (destildada) no cambió');
    c(h.item === '9' && h.antes === 2 && h.despues === 1 && /Control del avance/.test(h.motivo) && h.porAsistente, 'historial avanceHist con antes → después y el motivo · ' + JSON.stringify(h).slice(0, 160));
    c((await auds(p)).length >= 2, 'auditoría «avance_auditoria» de cada cambio');
    ped = await decir(p, sw, 'bajá ITALIA a 0', [usa('proponer_correcciones_avance', { correcciones: [{ tipo: 'item', obra: 'ITALIA', item: '9', hechas: 0 }] }), fin('¿Por qué?')]);
    c(/Falta el motivo/.test(resultado(ped, 1)), 'sin motivo no arma la corrección (lo pide, no lo inventa) · ' + resultado(ped, 1).slice(0, 120));
    c(!errsJs(A).length, 'sin errores de JS ' + JSON.stringify(errsJs(A).slice(0, 3)));
    await A.page.context().close();
  }

  // ================================================================= 3) motivo obligatorio en Avance de obra
  if (SOLO('3')) {
    const A = await sesion('lucia'); const p = A.page;
    await p.waitForTimeout(4000);
    await p.evaluate(() => { mostrarVista('avance'); verAvanceDetalle('s1'); }); await p.waitForTimeout(2500);
    await p.click('#aviSec [data-avi="mas"][data-ref="v:1"]'); await p.waitForTimeout(500);
    let r = await p.evaluate(() => { const o = document.getElementById('aaMotOv'); return o ? { dlg: o.getAttribute('role'), t: o.textContent.replace(/\s+/g, ' '), x: !!o.querySelector('.v7-x') } : null; });
    c(r && r.dlg === 'dialog' && r.x && /1 → 2/.test(r.t), 'tocar «+» pide el motivo con antes → después (1 → 2) · ' + (r && r.t.slice(0, 120)));
    await foto(p, 'motivo_avance', '#aaMotOv');
    await p.click('#aaMotOv [data-aam="si"]'); await p.waitForTimeout(300);
    c(await p.evaluate(() => !!document.getElementById('aaMotOv') && /Escribí el motivo/.test(document.getElementById('aaMotMsg').textContent)), 'sin motivo no guarda');
    await p.click('#aaMotOv [data-aam="x"]'); await p.waitForTimeout(1200);
    let d = await db(p);
    c(d.avanceObras.s1.valorItems[0].cantidadAvanzada === 1 && !(d.avanceObras.s1.avanceHist || []).length, 'cancelar: lo hecho no cambia');
    await p.click('#aviSec [data-avi="mas"][data-ref="v:1"]'); await p.waitForTimeout(500);
    await p.fill('#aaMotIn', 'Izamos la otra columna el sábado sin orden'); await p.click('#aaMotOv [data-aam="si"]'); await p.waitForTimeout(2000);
    d = await db(p);
    const h = (d.avanceObras.s1.avanceHist || [])[0] || {};
    c(d.avanceObras.s1.valorItems[0].cantidadAvanzada === 2 && h.item === '5' && h.antes === 1 && h.despues === 2 && /sábado/.test(h.motivo) && h.por, 'con motivo: lo hecho pasa a 2 y queda en avanceHist {item, antes, despues, motivo, por, ts} · ' + JSON.stringify(h).slice(0, 160));
    const e = await p.evaluate(() => window.__auditAvance.explicarItem('s1', '5').texto);
    c(/a mano en Avance de obra .* 1 → 2 .*motivo: «Izamos la otra columna el sábado sin orden»/.test(e) && /cuadra/.test(e), 'la explicación muestra el cambio a mano con quién, cuándo y el motivo · ' + e.slice(-260));
    c(!errsJs(A).length, 'sin errores de JS ' + JSON.stringify(errsJs(A).slice(0, 3)));
    await A.page.context().close();
  }

  // ================================================================= 4) el asistente: las 4 preguntas
  if (SOLO('4')) {
    const A = await sesion('lucia'); const p = A.page;
    await p.waitForTimeout(4000);
    const sw = await worker(p); await p.evaluate(() => window.__asistenteAbrir()); await p.waitForTimeout(700);
    let ped = await decir(p, sw, '¿está bien el avance de LOS ÁLAMOS?', [usa('auditar_avance', { obra: 'LOS ÁLAMOS' }), fin('Sí.')]);
    const tools = herramientas(ped), sist = JSON.stringify((ped[0] || {}).system || '');
    c(['auditar_avance', 'proponer_nota_avance', 'proponer_correcciones_avance'].every((x) => tools.includes(x)), 'oficina: el asistente recibe las 3 herramientas nuevas');
    c(/SÍ PODÉS AUDITAR EL AVANCE/.test(sist) && /nunca inventes el porqué de un número cargado a mano/.test(sist), 'SISTEMA: audita el avance y no inventa el porqué');
    let rr = resultado(ped, 1);
    c(/"obra":"PLAZA LOS ÁLAMOS"/.test(rr) && /"resumen"/.test(rr) && /OT-2026-110/.test(rr) && /"planilla"/.test(rr), '¿está bien LOS ÁLAMOS? → resumen, cada ítem con sus fuentes y la planilla · ' + rr.slice(0, 200));
    ped = await decir(p, sw, '¿por qué el ítem 5 de EL OLMO dice 1?', [usa('auditar_avance', { obra: 'EL OLMO', item: '5' }), fin('Por la OT-204.')]);
    rr = resultado(ped, 1);
    c(/OT-2026-204/.test(rr) && /0,5/.test(rr) && /"cuadra":true/.test(rr), '¿por qué el ítem 5 dice 1? → las fuentes (OT-204 0,5 + 0,5) · ' + rr.slice(0, 200));
    ped = await decir(p, sw, '¿qué se hizo esta semana y cuadra con el itemizado?', [(b) => usa('auditar_avance', { desde: (() => { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().slice(0, 10); })() }), fin('Esto.')]);
    rr = resultado(ped, 1);
    c(/"modulosDelPeriodo"/.test(rr) && /PLAZA EL CEIBO/.test(rr) && /OT-2026-207/.test(rr) && /"cuadra":false/.test(rr), 'esta semana: lo hecho por obra con las órdenes y si cuadra · ' + rr.slice(0, 200));
    ped = await decir(p, sw, 'revisá el avance de todas las obras', [usa('auditar_avance', {}), fin('Esto.')]);
    rr = resultado(ped, 1);
    const ef = ((ped[0] || {}).output_config || {}).effort;
    c(/"mal":[1-9]/.test(rr) && /PLAZA EL OLMO/.test(rr) && ef === 'high', 'revisá todas: hallazgos de todas las obras con effort high · ' + JSON.stringify({ ef, m: (ped[0] || {}).model }) + ' ' + rr.slice(0, 120));
    c(!errsJs(A).length, 'sin errores de JS ' + JSON.stringify(errsJs(A).slice(0, 3)));
    await A.page.context().close();
  }

  // ================================================================= 5) permisos
  if (SOLO('5')) {
    let A = await sesion('dir'); let p = A.page;
    await p.waitForTimeout(4000);
    let sw = await worker(p); await p.evaluate(() => window.__asistenteAbrir()); await p.waitForTimeout(700);
    let ped = await decir(p, sw, '¿está bien el avance de EL OLMO?', [usa('auditar_avance', { obra: 'EL OLMO' }), fin('No.')]);
    let tools = herramientas(ped);
    c(tools.includes('auditar_avance') && !tools.some((x) => /^proponer_/.test(x)) && /DOS VECES/.test(resultado(ped, 1)), 'Dirección: el asistente audita (auditar_avance) y no recibe ninguna proponer_*');
    await p.evaluate(() => { window.__asistente && window.__asistente.cerrar && window.__asistente.cerrar(); window.__auditAvance.abrir({ obra: 's3' }); }); await p.waitForTimeout(700);
    let r = await p.evaluate(() => { const o = document.getElementById('aaOv'); return o ? { h: o.querySelectorAll('.qp-h').length, acc: o.querySelectorAll('.qp-h .qp-acc button').length, mirar: /solo para mirar/.test(o.textContent) } : null; });
    c(r && r.h >= 2 && r.acc === 0 && r.mirar, 'Dirección ve la hoja (solo para mirar, sin botones de cambio) · ' + JSON.stringify(r));
    c(await p.evaluate(() => !window.__auditAvance.puede()), 'Dirección no puede cambiar');
    await p.evaluate(() => window.__auditAvance.cerrar());
    r = await p.evaluate(() => { try { window.__inicioDir.pintar(); } catch (e) { } return !!document.querySelector('#iniDir [data-aaabrir]'); });
    c(r, 'Dirección: acceso «🔎 Control» en su Inicio (Programación)');
    await A.page.context().close();
    A = await sesion('juan', { cel: true }); p = A.page;
    await p.waitForTimeout(3500);
    r = await p.evaluate(() => ({ ab: window.__auditAvance.abrir({}), ov: !!document.getElementById('aaOv'), sup: window.__auditAvance.supHallazgos().length }));
    c(!r.ab && !r.ov && !r.sup, 'cuadrilla: no ve el control del avance · ' + JSON.stringify(r));
    sw = await worker(p); await p.evaluate(() => window.__asistenteAbrir()); await p.waitForTimeout(700);
    ped = await decir(p, sw, '¿cómo va el avance?', [fin('Bien.')]);
    c(!herramientas(ped).includes('auditar_avance'), 'cuadrilla: el asistente no recibe auditar_avance');
    await A.page.context().close();
    for (const q of ['pan', 'mir']) {
      A = await sesion(q); p = A.page; await p.waitForTimeout(3000);
      r = await p.evaluate(() => ({ ab: window.__auditAvance.abrir({}), ov: !!document.getElementById('aaOv') }));
      c(!r.ab && !r.ov, (q === 'pan' ? 'pañol' : 'solo mirar') + ': no ve el control del avance');
      await A.page.context().close();
    }
  }

  // ================================================================= 6) Supervisor, Para atender, parte del avance, revisión con IA
  if (SOLO('6')) {
    const A = await sesion('lucia'); const p = A.page;
    await p.waitForTimeout(4500);
    let r = await p.evaluate(() => (window.__supervisor.hallazgos({ ahora: true }) || []).filter((h) => h.cat === 'Avance').map((h) => h.g + ' ' + h.t));
    c(r.some((x) => /^rojo Avance: \d+ cosas para revisar/.test(x)) && r.some((x) => /^ambar Avance/.test(x)), 'el Supervisor tiene la línea «Avance: N cosas para revisar» · ' + r.join(' | '));
    r = await p.evaluate(() => { mostrarVista('inicio'); try { window.__inicioPro.pintar(); } catch (e) { } return new Promise((ok) => setTimeout(() => ok(!!document.querySelector('#iniEje [data-ie="auditavance"]')), 900)); });
    c(r, 'Inicio Ejecutivo › Para atender: «🔎 Control del avance» con los rojos');
    if (r) { await p.click('#iniEje [data-ie="auditavance"]'); await p.waitForTimeout(700); c(await p.evaluate(() => !!document.getElementById('aaOv')), 'tocarlo abre la hoja'); await p.evaluate(() => window.__auditAvance.cerrar()); }
    // parte del avance (18 h, sin IA, por el turno de pasarManana)
    r = await p.evaluate(async () => { window.__pmEspera = 0; window.__aaPausa = false; const d = new Date(); d.setHours(18, 30, 0, 0); if (d.getDay() === 0) d.setDate(d.getDate() + 1); window.__aaAhora = d.toISOString(); localStorage.removeItem('ema.aa.vistos'); return await window.__auditAvance.tic(); });
    const d = await db(p);
    const av = Object.values(d.avisosPush || {}).filter((x) => x.tipo === 'avance');
    c(r && r.gano && r.nuevos >= 4 && av.length >= 1 && /Parte del avance/.test(av[0].titulo), 'parte del avance de las 18 h: aviso a Administración con los rojos nuevos · ' + JSON.stringify(r).slice(0, 160));
    r = await p.evaluate(async () => { localStorage.removeItem('ema.aa.parte.' + new Date(window.__aaAhora).toISOString().slice(0, 10)); return await window.__auditAvance.tic(); });
    c(!r || !r.nuevos, 'al otro rato sin rojos nuevos: no avisa de nuevo');
    // la revisión con IA de las 12/18 suma lo rojo del avance
    const sw = await worker(p); sw.cola.push(fin('Acá hay algo raro.'));
    await p.evaluate(async () => { const a = await window.__iaCargar(); await a.revisionSupervisor([], '2026-11-14-18'); });
    await p.waitForTimeout(500);
    const ult = JSON.stringify(((sw.pedidos[0] || {}).messages || []).slice(-1));
    c(/Control del avance \(sin IA\)/.test(ult) && /DOS VECES/.test(ult), 'la revisión con IA de las 12/18 h lleva el resumen de lo rojo del avance');
    c(!errsJs(A).length, 'sin errores de JS ' + JSON.stringify(errsJs(A).slice(0, 3)));
    await A.page.context().close();
  }

  // ================================================================= 7) arreglo v155: Inicio de Dirección sin proyecciones absurdas
  if (SOLO('7')) {
    const A = await sesion('dir', { leaflet: true }, datos155); const p = A.page;
    await p.waitForTimeout(4500);
    const ver = () => p.evaluate(() => { window.__preciosNube = Object.assign({}, window.__preciosNube || {}, { contratoInicio: '2026-10-15', contratoPlazoMeses: 4 }); window.__inicioDir.pintar(); const D = window.__inicioDir.datos(); const t = (document.getElementById('iniDir') || {}).textContent || ''; return { est: D.estProy, dif: D.difDias, proy: D.proy, t: t.replace(/\s+/g, ' ') }; });
    let r = await ver();
    c(r.est === 'lejos' && !r.proy && !/\+999|más de 999|\d{3,} días después|terminamos el/.test(r.t) && /Muy atrasado: al ritmo de los últimos 7 días no se llega/.test(r.t), 'como en la captura (poco ritmo contra 18.407 módulos): «Muy atrasado: al ritmo de los últimos 7 días no se llega» en vez de «+999 d» / «2890 días después» · ' + JSON.stringify({ est: r.est, proy: r.proy }));
    await foto(p, 'dir_lejos');
    const k = await p.evaluate(() => { const e = document.querySelector('#iniDir .dr-k6') || document.querySelector('#iniDir .dr-hkpi'); return e ? e.textContent.replace(/\s+/g, ' ') : ''; });
    c(/No llega/.test(k) && !/\+999/.test(k), 'el KPI dice «No llega» (no «+999 d») · ' + k.slice(0, 160));
    // sin días con avance en la última semana: no hay ritmo para estimar
    await p.evaluate(() => { const h = new Date().toISOString().slice(0, 10); for (let i = ordenesTrabajo.length - 1; i >= 0; i--) { const o = ordenesTrabajo[i]; if (o.cierre && o.cierre.cerradoTs && String(o.fecha) < h) ordenesTrabajo.splice(i, 1); } });
    r = await ver();
    c(r.est === 'sinRitmo' && !/\+999|más de 999|\d{3,} días después/.test(r.t) && /todavía no hay ritmo/i.test(r.t), 'sin días con avance en la semana: «todavía no hay ritmo suficiente para estimar» · ' + JSON.stringify({ est: r.est, dif: r.dif }));
    await foto(p, 'dir_sinritmo');
    c(!errsJs(A).length, 'sin errores de JS ' + JSON.stringify(errsJs(A).slice(0, 3)));
    await A.page.context().close();
  }
  if (browser) await browser.close(); process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
