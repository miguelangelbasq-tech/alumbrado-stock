// v133 · Asistente EMA «pro»: obra_completa (cómputo «16 de 10 m» contra itemizado «8 del ítem 6 + 8 del ítem 8» y la
// diferencia), historial_calculos, consultar (paginado y permisos: sin gastos no hay gastos; sin mails), describir_datos,
// revisar_calculo, ver_plano (imagen dentro del tool_result), ver_fotos (con la distancia a la obra), ubicar_fotos +
// proponer_mover_fotos (nada se mueve sin el «Sí»; «Fotos sin obra» en Obras), diagnostico_equipo y
// proponer_corregir_itemizado (nada se escribe sin el «Sí»; con el Sí ítem 6 = 0 e ítem 8 = 16 + auditoría).
// Todo con Sonnet (effort medium). El Worker se simula interceptando el fetch a /ia.
const zlib = require('zlib');
const { abrir, otraPagina, prueba, baseDatos, DOM } = require('./h');
const cel = process.argv[2] === 'cel';
const URL_IA = 'https://ema-ia.mdiaz-60f.workers.dev/ia';
// PNG de color liso (para el plano y las miniaturas)
function png(w, h, rgb) {
  const crcT = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crcT[n] = c >>> 0; }
  const crc = (b) => { let c = 0xffffffff; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const ch = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
  const ih = Buffer.alloc(13); ih.writeUInt32BE(w, 0); ih.writeUInt32BE(h, 4); ih[8] = 8; ih[9] = 2;
  const raw = Buffer.alloc((w * 3 + 1) * h); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * (w * 3 + 1) + 1 + x * 3; raw[i] = (rgb[0] + x) & 255; raw[i + 1] = (rgb[1] + y) & 255; raw[i + 2] = rgb[2]; }
  return 'data:image/png;base64,' + Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), ch('IHDR', ih), ch('IDAT', zlib.deflateSync(raw)), ch('IEND', Buffer.alloc(0))]).toString('base64');
}
(async () => {
  const c = prueba('v133' + (cel ? ' cel' : ''));
  const d = baseDatos(), ahora = Date.now(), hoy = d.hoy;
  // ---- datos: dos obras con coordenadas (a ~1,4 km), GEORG NICOLAI con itemizado 8 + 8 y cómputo «16 de 10 m»
  Object.assign(d.db.avanceObras.p1, { lat: -31.41, lng: -64.18, tipoObra: 'plaza' });
  d.db.avanceObras.p2 = { nombre: 'PLAZA GEORG NICOLAI', obraId: '4100', barrio: 'Alberdi', direccion: 'Calle 1', tipoObra: 'plaza', lat: -31.42, lng: -64.19, creado: ahora,
    valorItems: [{ id: 11, itemPliego: '6', cantidad: 8, cantidadAvanzada: 2 }, { id: 12, itemPliego: '8', cantidad: 8, cantidadAvanzada: 0 }] };
  const pts = (n) => Array.from({ length: n }, (_, i) => ({ id: i + 1 }));
  d.db.historialCalculos = { h1: { nombre: 'PLAZA GEORG NICOLAI', id: '4100', barrio: 'Alberdi', fecha: '2026-11-05', ts: ahora - 864e5 * 4, usuario: 'admin@' + DOM, estado: 'Pendiente', cantCol: 16, tipoCol: 'PRFV', altura: 10, tareas: ['Columnas'], tiles: [], alertas: [],
    form: { v: 1, campos: { colTipo: 'PRFV', toggleColumnas: true, obraNombre: 'PLAZA GEORG NICOLAI', obraId: '4100' }, columnaGrupos: [{ id: 1, altura: 10, columnas: 16 }], vinculoGrupos: [], civilGrupos: [], circuitos: [{ tablero: 1, numero: 1, puntos: pts(8) }, { tablero: 1, numero: 2, puntos: pts(8) }], tramos: [], zanjaTramos: [], tablerosExtra: [] },
    secciones: [{ titulo: 'Columnas', items: [{ cod: 6007, desc: 'Columna PRFV 10 m', corto: 'Columna PRFV 10 m', cant: 16, un: 'Un.' }] }, { titulo: 'Puesta a tierra', items: [{ cod: 7015, desc: 'Jabalina', corto: 'Jabalina', cant: 3, un: 'Un.' }] }] } };
  d.db.ordenesTrabajo.ot9 = Object.assign({}, d.db.ordenesTrabajo.ot1, { numero: 'OT-2026-009', plazaId: 'p2', plazaNombre: 'PLAZA GEORG NICOLAI', obraId: '4100' });
  d.db.gastosObra = { g1: { plazaId: 'p2', categoria: 'Materiales', monto: 1000, fecha: hoy } };
  d.db.planosObra = { pl1: { plazaId: 'p2', nombre: 'Planta general', tipo: 'foto', paginas: [{ n: 2, w: 900, h: 600 }], creado: ahora - 5000, por: 'Ana Admin', mini: png(4, 4, [200, 200, 200]) } };
  const PL = png(900, 600, [30, 60, 200]), mitad = Math.ceil(PL.length / 2);
  d.db.planosImg = { pl1_0_0: { plano: 'pl1', pag: 0, parte: 0, d: PL.slice(0, mitad) }, pl1_0_1: { plano: 'pl1', pag: 0, parte: 1, d: PL.slice(mitad) } };
  const MINI = png(60, 60, [120, 80, 40]);
  // fotos: f1 bien (en GEORG); f2 y f3 de Rolando del 06/11 cargadas en SAN MARTÍN pero sacadas en GEORG (a ~20 m); f4 lejos de todo
  d.db.fotosObra = {
    f1: { plazaId: 'p2', plazaNombre: 'PLAZA GEORG NICOLAI', adjId: 'a1', cat: 'columna', num: 'Col 1', por: 'Juan Pérez', fecha: '2026-11-05', ts: ahora - 864e5 * 4, lat: -31.42005, lng: -64.19, mini: MINI },
    f2: { plazaId: 'p1', plazaNombre: 'Plaza San Martín', adjId: 'a2', cat: 'pat', num: 'Col 3', por: 'Rolando Velázquez', fecha: '2026-11-06', ts: ahora - 864e5 * 3, lat: -31.42018, lng: -64.19, mini: MINI, otId: 'ot1' },
    f3: { plazaId: 'p1', plazaNombre: 'Plaza San Martín', adjId: 'a3', cat: 'columna', num: 'Col 4', por: 'Rolando Velázquez', fecha: '2026-11-06', ts: ahora - 864e5 * 3 + 6e4, lat: -31.42015, lng: -64.19005, mini: MINI },
    f4: { plazaId: 'p1', plazaNombre: 'Plaza San Martín', adjId: 'a4', cat: 'otra', por: 'Pedro Gómez', fecha: '2026-11-07', ts: ahora - 864e5 * 2, lat: -31.5, lng: -64.3, mini: MINI }
  };
  d.db.adjuntos = { a2: { plazaId: 'p1', plazaNombre: 'Plaza San Martín', tipo: 'obra', ts: ahora }, a3: { plazaId: 'p1', plazaNombre: 'Plaza San Martín', tipo: 'obra', ts: ahora }, a4: { plazaId: 'p1', plazaNombre: 'Plaza San Martín', tipo: 'obra', ts: ahora } };
  // usuarios: Rolando (cuadrilla) sin persona vinculada; Olga (oficina) sin permiso de gastos
  d.db.usuarios.uRol = { email: 'rolando@' + DOM, usuario: 'rolando', nombre: 'Rolando Velázquez', rol: 'cuadrilla', activo: true };
  d.db.usuarios.uOfi = { email: 'olga@' + DOM, usuario: 'olga', nombre: 'Olga Oficina', rol: 'oficina', activo: true, ajustes: { gastos: 'oculto' } };
  d.cuentas['olga@' + DOM] = { pass: 'clave123', uid: 'uOfi' };
  d.db.configEquipo.personal.lista.push({ nombre: 'Rolando Velázquez', rol: 'Oficial', activo: true });
  const MOD = { cel, espera: 3500, ofPasos: true, mtNuevo: true, porPartes: true, reglas: true, https: true, tarjetas: true };
  const A = await abrir(Object.assign({ sesion: 'admin', datos: d }, MOD)), p = A.page;
  p.on('dialog', (x) => x.accept());
  // ---- el Worker simulado
  const pedidos = [], cola = [];
  await p.route(URL_IA, async (r) => {
    const req = r.request(); let b = null; try { b = JSON.parse(req.postData() || 'null'); } catch (e) { }
    pedidos.push({ b, largo: (req.postData() || '').length });
    const f = cola.shift(); const x = typeof f === 'function' ? f(b) : f;
    if (!x) return r.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: { tipo: 'prueba', mensaje: 'sin guion' } }) });
    return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(x) });
  });
  let n = 0;
  const usa = (name, input) => ({ id: 'msg_' + (++n), type: 'message', role: 'assistant', content: [{ type: 'text', text: 'Me fijo.' }, { type: 'tool_use', id: 'tu_' + n, name, input }], stop_reason: 'tool_use', usage: { input_tokens: 900, output_tokens: 40 }, ema: { costoUsd: 0.02 } });
  const fin = (text) => ({ id: 'msg_' + (++n), type: 'message', role: 'assistant', content: [{ type: 'text', text }], stop_reason: 'end_turn', usage: { input_tokens: 1000, output_tokens: 60 }, ema: { costoUsd: 0.03 } });
  const esperarLibre = async (pg) => { for (let i = 0; i < 80; i++) { await pg.waitForTimeout(150); const ok = await pg.evaluate(() => { const b = document.getElementById('iaEnviar'); return !!b && !b.disabled; }); if (ok) return; } };
  async function preguntar(t, guion, pg) { pg = pg || p; cola.push(...guion); const n0 = pedidos.length; await pg.fill('#iaTxt', t); await pg.click('#iaEnviar'); await pg.waitForTimeout(200); await esperarLibre(pg); return pedidos.slice(n0); }
  const resultado = (ped) => { const m = ped.b.messages[ped.b.messages.length - 1], tr = m.content[0]; const txt = typeof tr.content === 'string' ? tr.content : tr.content[0].text; return { tr, j: JSON.parse(txt) }; };
  const db = () => p.evaluate(() => window.__stubDB());
  const ultConf = () => p.evaluate(() => { const l = document.querySelectorAll('#iaChat .ia-conf'), x = l[l.length - 1]; return x ? x.textContent.replace(/\s+/g, ' ') : ''; });

  // el formulario guardado es el de la Calculadora real (snapshotFormulario) con 16 columnas PRFV de 10 m en 2 circuitos de 8
  await p.evaluate(async () => {
    const sf = snapshotFormulario(), p0 = (sf.circuitos[0].puntos || [])[0] || { esColumna: true };
    sf.columnaGrupos = [{ id: 1, altura: 10, columnas: 16 }];
    sf.circuitos = [1, 2].map((k) => Object.assign({}, sf.circuitos[0], { id: k, numero: k, tablero: 1, puntos: Array.from({ length: 8 }, (_, i) => Object.assign({}, p0, { id: k * 100 + i })) }));
    await firebase.firestore().collection('historialCalculos').doc('h1').update({ form: sf });
  });
  await p.waitForTimeout(1500);
  await p.click('#iaFab .ia-fab-b'); await p.waitForTimeout(600);

  // ---- 1) obra_completa: las dos fuentes y la diferencia
  let ps = await preguntar('¿qué dice la calculadora de georg nicolai?', [usa('obra_completa', { obraId: 'georg nicolai' }), fin('El cómputo del 05/11 dice 16 de 10 m; el itemizado tiene 8 del ítem 6 y 8 del ítem 8.')]);
  c(ps.length === 2 && ps.every((x) => x.b.model === 'claude-sonnet-5-5' && x.b.output_config.effort === 'medium' && x.b.max_tokens === 4000), 'todo va con Sonnet, effort medium y max_tokens 4000 · ' + JSON.stringify(ps.map((x) => [x.b.model, x.b.output_config.effort, x.b.max_tokens])));
  const nombres = ps[0].b.tools.map((t) => t.name);
  c(['obra_completa', 'historial_calculos', 'consultar', 'describir_datos', 'revisar_calculo', 'ver_plano', 'ver_fotos', 'ubicar_fotos', 'proponer_mover_fotos', 'diagnostico_equipo', 'proponer_corregir_itemizado'].every((k) => nombres.includes(k)) && ps[0].b.tools[ps[0].b.tools.length - 1].cache_control && ps[0].b.system[0].cache_control, 'herramientas nuevas, con cache_control en el system y las herramientas · ' + nombres.length);
  c(/no tengo acceso/i.test(ps[0].b.system[0].text) && /de dónde sale cada número/.test(ps[0].b.system[0].text) && /proponer_corregir_itemizado/.test(ps[0].b.system[0].text) && /no lo discutas/.test(ps[0].b.system[0].text), 'el system pide buscar antes de decir «no tengo acceso», decir la fuente, proponer el arreglo y no discutir');
  let { j } = resultado(ps[1]);
  const it = (j.itemizado || {}).items || [], ult = (j.calculos || {}).ultimo || {};
  c(it.find((x) => x.item === '6' && x.cant === 8 && x.hechas === 2) && it.find((x) => x.item === '8' && x.cant === 8 && x.K > 0), 'obra_completa trae el itemizado (ítem 6: 8 con 2 hechas, ítem 8: 8, con K) · ' + JSON.stringify(it));
  c(ult.columnas && ult.columnas.porAltura['10'] === 16 && ult.columnas.tipo === 'PRFV' && ult.circuitos === 2 && (ult.materiales || []).some((m) => m.codigo === '6007' && m.cant === 16) && ult.campos && ult.campos.colTipo === 'PRFV' && /05\/11\/2026/.test(ult.de) && ult.quien === 'Ana Admin', 'y el cómputo de la Calculadora: 16 PRFV de 10 m, circuitos, formulario, materiales, fecha y quién · ' + JSON.stringify(ult).slice(0, 260));
  const dif = j.diferencias || [];
  const d10 = dif.find((x) => /Columnas PRFV de 10 m/.test(x.tema)), d7 = dif.find((x) => /Columnas PRFV de 7 m/.test(x.tema));
  c(d10 && d10.segunCalculo === 16 && d10.segunItemizado === 8 && /cómputo del 05\/11\/2026/.test(d10.fuentes) && d7 && d7.segunCalculo === 0 && d7.segunItemizado === 8, '«diferencias»: 10 m → cómputo 16 contra itemizado 8; 7 m → 0 contra 8 (ítem 6), con la fuente · ' + JSON.stringify([d10, d7]).slice(0, 300));
  c(j.planos.length === 1 && j.planos[0].nombre === 'Planta general' && j.gastos.cantidad === 1 && !/@/.test(JSON.stringify(j)), 'también planos y gastos (con permiso), y ningún mail en lo que se manda');

  // ---- 2) historial_calculos
  ps = await preguntar('mostrame el historial de la calculadora de 4100', [usa('historial_calculos', { obra: '4100' }), fin('Hay 1 cómputo.')]);
  ({ j } = resultado(ps[1]));
  c(j.total === 1 && j.calculos[0].columnas.porAltura['10'] === 16 && (j.calculos[0].materiales || []).length === 2, 'historial_calculos: el cómputo con su detalle · ' + JSON.stringify(j).slice(0, 200));

  // ---- 3) consultar: paginado
  ps = await preguntar('listame las órdenes una por una', [usa('consultar', { coleccion: 'ordenes', limite: 1 }), (b) => { const r = JSON.parse(b.messages[b.messages.length - 1].content[0].content); return usa('consultar', { coleccion: 'ordenes', limite: 1, desde: parseInt(String(r.hayMas).replace(/\D+/g, ''), 10) }); }, fin('Listo.')]);
  const q1 = resultado(ps[1]).j, q2 = resultado(ps[2]).j;
  c(q1.total === 2 && q1.devueltos === 1 && /desde=1/.test(q1.hayMas) && q2.desde === 1 && q2.devueltos === 1 && !q2.hayMas && q2.registros[0].id !== q1.registros[0].id && /ordenesTrabajo/.test(q1.que), 'consultar pagina («hay más: pedí desde=N») · ' + JSON.stringify({ t: q1.total, d: q1.devueltos, m: q1.hayMas }));
  ps = await preguntar('¿y los gastos?', [usa('consultar', { coleccion: 'gastos', filtro: { plazaId: 'p2' } }), fin('Hay un gasto.')]);
  c(resultado(ps[1]).j.total === 1, 'Administración ve los gastos con consultar');

  // ---- 4) describir_datos
  ps = await preguntar('¿qué datos tenés?', [usa('describir_datos', {}), fin('Tengo todo esto.')]);
  ({ j } = resultado(ps[1]));
  const cc = (j.colecciones || []).find((x) => x.coleccion === 'calculos'), co = (j.colecciones || []).find((x) => x.coleccion === 'obras');
  c(cc && cc.registros === 1 && /Calculadora|CALCULADORA/.test(cc.que) && cc.campos.includes('form') && co && co.registros >= 2 && co.campos.includes('valorItems') && j.colecciones.length >= 20, 'describir_datos: colecciones, qué son, registros, campos y ejemplo · ' + JSON.stringify(cc).slice(0, 160));

  // ---- 5) revisar_calculo
  ps = await preguntar('¿la calculadora sacó bien georg nicolai?', [usa('revisar_calculo', { obraId: 'p2' }), fin('Revisado.')]);
  ({ j } = resultado(ps[1]));
  const jab = (j.reglas || []).find((x) => /jabalinas/.test(x.regla));
  c(j.recalculo && j.recalculo.hayCambios === true && j.recalculo.columnasHoy && j.recalculo.columnasHoy.cantCol === 16 && jab && jab.esperado === 3 && jab.listado === 3 && jab.ok && j.planos && j.planos.cantidad === 1 && (j.diferencias || []).length >= 2, 'revisar_calculo: recalcula, revisa reglas (jabalinas = circuitos + tableros) y avisa del plano · ' + JSON.stringify({ rc: j.recalculo, jab }).slice(0, 260));

  // ---- 6) ver_plano: imagen dentro del tool_result
  ps = await preguntar('mirá el plano de georg nicolai y contá las columnas', [usa('ver_plano', { obraId: 'georg nicolai' }), fin('En el plano se ven…')]);
  const tr6 = ps[1] && ps[1].b.messages[ps[1].b.messages.length - 1].content[0];
  const img6 = tr6 && Array.isArray(tr6.content) ? tr6.content.find((x) => x.type === 'image') : null, txt6 = tr6 && Array.isArray(tr6.content) ? JSON.parse(tr6.content[0].text) : {};
  c(img6 && img6.source.type === 'base64' && img6.source.media_type === 'image/jpeg' && img6.source.data.length > 500 && img6.source.data.length * 0.75 < 1.5e6 && txt6.plano === 'Planta general' && /Contá/.test(txt6.consigna), 'ver_plano: el tool_result lleva el plano como imagen JPEG base64 (< 1,5 MB) y la consigna · ' + JSON.stringify({ px: txt6.px, kb: img6 ? Math.round(img6.source.data.length * 0.75 / 1024) : 0 }));
  // v136: la historia va TAL CUAL (solo se agrega: con Opus 5.5 / Fable 5.2 no se pueden editar los mensajes de antes);
  // antes de la v136 la imagen vieja se cambiaba por un texto. El peso lo controla «compactar» (conversación nueva desde un resumen).
  ps = await preguntar('gracias', [fin('De nada.')]);
  const viejas = JSON.stringify(ps[0].b.messages).match(/"type":"image"/g);
  c(viejas && viejas.length === 1 && !/ya miraste/.test(JSON.stringify(ps[0].b.messages)), 'en el turno siguiente la historia va tal cual, con la imagen del plano (solo se agrega)');

  // ---- 7) ver_fotos con la distancia a la obra
  ps = await preguntar('mostrame las fotos de san martin', [usa('ver_fotos', { obraId: 'p1', n: 6 }), fin('Hay fotos que parecen de otra obra.')]);
  const tr7 = ps[1].b.messages[ps[1].b.messages.length - 1].content[0], j7 = JSON.parse(tr7.content[0].text);
  const imgs7 = tr7.content.filter((x) => x.type === 'image'), rol = (j7.mostradas || []).filter((x) => /Rolando/.test(x.por));
  c(imgs7.length === 3 && j7.totalFotos >= 3 && rol.length === 2 && rol.every((x) => x.lat && x.distanciaALaObraM > 1000 && x.lejos && /GEORG/.test(x.otraObraCerca || '')), 'ver_fotos: miniaturas como imágenes, con lat/lng, distancia a la obra y la obra que está cerca · ' + JSON.stringify(rol).slice(0, 260));

  // ---- 8) ubicar_fotos + proponer_mover_fotos
  ps = await preguntar('las fotos de rolando del 06/11 quedaron en otra obra?', [usa('ubicar_fotos', { fecha: '06/11/2026', persona: 'rolando' }), fin('12 fotos…')]);
  ({ j } = resultado(ps[1]));
  const g = (j.malUbicadas || [])[0] || {};
  c(j.malUbicadas && j.malUbicadas.length === 1 && g.obraDestino === 'p2' && JSON.stringify(g.fotos.sort()) === '["f2","f3"]' && /2 foto\(s\) de Rolando Velázquez del 06\/11\/2026 están en Plaza San Martín pero se sacaron en PLAZA GEORG NICOLAI, a \d+–\d+ m/.test(g.resumen), 'ubicar_fotos: «2 fotos de Rolando del 06/11 están en SAN MARTÍN pero se sacaron en GEORG NICOLAI, a N m» · ' + g.resumen);
  await preguntar('movelas', [usa('proponer_mover_fotos', { fotos: ['f2', 'f3'], obraDestino: 'p2', motivo: 'el GPS dice que son de GEORG NICOLAI' }), fin('Confirmalo en la tarjeta.')]);
  let s = await db();
  let r = await p.evaluate(() => { const l = document.querySelectorAll('#iaChat .ia-conf'), x = l[l.length - 1]; return { t: x ? x.textContent.replace(/\s+/g, ' ') : '', imgs: x ? x.querySelectorAll('.ia-fotos img').length : 0 }; });
  c(/Mover 2 fotos/.test(r.t) && /GEORG/.test(r.t) && r.imgs === 2 && s.fotosObra.f2.plazaId === 'p1' && s.fotosObra.f3.plazaId === 'p1', 'tarjeta «Mover 2 fotos» con las miniaturas; antes del Sí no se mueve nada · ' + r.t.slice(0, 140));
  await p.click('#iaPanel .ia-conf:last-of-type [data-iasi]'); await p.waitForTimeout(1500);
  s = await db();
  const au8 = Object.values(s.auditoria || {}).filter((x) => x.accion === 'asistente_mover_fotos' && x.porAsistente);
  c(s.fotosObra.f2.plazaId === 'p2' && s.fotosObra.f3.plazaNombre === 'PLAZA GEORG NICOLAI' && s.fotosObra.f2.movidaDe && s.fotosObra.f2.movidaDe.plazaId === 'p1' && s.fotosObra.f2.movidaDe.por === 'Ana Admin' && s.fotosObra.f2.otId === 'ot1' && s.adjuntos.a2.plazaId === 'p2' && s.adjuntos.a3.movidaDe && au8.length === 1, 'con «Sí» las fotos pasan a GEORG (ficha y adjunto, con movidaDe, la orden queda igual) y queda la auditoría · ' + JSON.stringify({ f2: s.fotosObra.f2.plazaId, mv: s.fotosObra.f2.movidaDe, a2: s.adjuntos.a2.plazaId, au: au8.length }));
  // la que está lejos de todo va a «Fotos sin obra»
  ps = await preguntar('¿y las que quedan en san martin?', [usa('ubicar_fotos', { obraId: 'p1' }), (b) => { const r = JSON.parse(b.messages[b.messages.length - 1].content[0].content); const x = (r.malUbicadas || [])[0] || { fotos: [] }; return usa('proponer_mover_fotos', { fotos: x.fotos, obraDestino: x.obraDestino, motivo: 'lejos de toda obra' }); }, fin('Confirmá.')]);
  ({ j } = resultado(ps[1]));
  c(j.malUbicadas.length === 1 && j.malUbicadas[0].obraDestino === 'sin_obra' && j.malUbicadas[0].fotos[0] === 'f4', 'la foto sin ninguna obra cerca va como «sin obra» · ' + JSON.stringify(j.malUbicadas));
  await p.click('#iaPanel .ia-conf:last-of-type [data-iasi]'); await p.waitForTimeout(1200);
  s = await db();
  c(s.fotosObra.f4.plazaId === '__sinObra' && s.adjuntos.a4.plazaId === '__sinObra', 'con «Sí» queda en la carpeta «Fotos sin obra»');
  await p.evaluate(() => window.__asistente.cerrar());
  await p.evaluate(() => window.mostrarVista('obras')); await p.waitForTimeout(1800);
  r = await p.evaluate(() => { const b = document.getElementById('fsoBtn'); return !!(b && b.getBoundingClientRect().width > 0); });
  c(r, 'en Obras aparece «📷 Fotos sin obra»');
  await p.click('#fsoBtn'); await p.waitForTimeout(1200);
  r = await p.evaluate(() => { const o = document.getElementById('fsoOv'); return { vis: !!(o && !o.hidden), n: o ? o.querySelectorAll('.fso-f').length : 0, t: o ? o.textContent.replace(/\s+/g, ' ') : '' }; });
  c(r.vis && r.n === 1 && /Pedro Gómez/.test(r.t) && /venía de Plaza San Martín/.test(r.t), '«Fotos sin obra» muestra la foto, quién, de dónde venía y la obra más cercana · ' + r.t.slice(0, 160));
  if (cel) { const sw = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth); c(sw <= 0, 'sin scroll de costado en «Fotos sin obra» · ' + sw); await p.screenshot({ path: __dirname + '/v133_sinobra_cel.png' }); }
  await p.click('#fsoOv [data-fso="cerrar"]'); await p.waitForTimeout(300);
  await p.evaluate(() => window.__asistenteAbrir()); await p.waitForTimeout(400);

  // ---- 9) diagnostico_equipo
  ps = await preguntar('¿hay algún celu o usuario fallando?', [usa('diagnostico_equipo', {}), fin('Rolando no tiene la persona vinculada.')]);
  ({ j } = resultado(ps[1]));
  const ur = (j.usuarios || []).find((x) => /Rolando/.test(x.nombre));
  c(ur && ur.problemas.some((x) => /sin persona vinculada/.test(x)) && j.esteAparato && typeof j.esteAparato.lecturasHoy === 'number' && Array.isArray(j.ordenesTrabadas) && /diagn/.test(ps[0].b.system[0].text) && !/@/.test(JSON.stringify(j.usuarios)), 'diagnostico_equipo: Rolando sin persona vinculada, lecturas y cola de este aparato, órdenes trabadas, sin mails · ' + JSON.stringify(ur));

  // ---- 10) proponer_corregir_itemizado: nada sin el Sí; con el Sí 6 = 0 y 8 = 16 + auditoría
  // el ítem 6 tiene 2 hechas: sin decir cuántas pasan, no arma la tarjeta y pide el dato (v134: las hechas pasan con las columnas)
  const nP = pedidos.length, nC = await p.evaluate(() => document.querySelectorAll('#iaChat .ia-conf').length);
  await preguntar('pasalas al 8', [usa('proponer_corregir_itemizado', { obraId: 'p2', cambios: [{ item: '6', cantNueva: 0 }, { item: '8', cantNueva: 16 }], motivo: 'x' }), fin('¿Cuántas estaban hechas?')]);
  r = resultado(pedidos[nP + 1]).j;
  c(/FALTA UN DATO/.test(r.error || '') && /2 hechas/.test(r.error) && (await p.evaluate(() => document.querySelectorAll('#iaChat .ia-conf').length)) === nC, 'si el ítem que baja tiene hechas, pide cuántas pasan antes de proponer');
  await preguntar('las 2 hechas pasan, corregilo', [usa('proponer_corregir_itemizado', { obraId: 'p2', cambios: [{ item: '6', cantNueva: 0, hechasNueva: 0 }, { item: '8', cantNueva: 16, hechasNueva: 2 }], motivo: 'en obra son todas de 10 m (Ángel)' }), fin('Te dejo la corrección para confirmar.')]);
  s = await db();
  r = await ultConf();
  const vi0 = s.avanceObras.p2.valorItems;
  c(/Corregir el itemizado/.test(r) && /Ítem 6 ·[^Í]*8 → 0/.test(r) && /Ítem 8 ·[^Í]*8 → 16/.test(r) && /hechas 2 → 0/.test(r) && /hechas 0 → 2/.test(r) && vi0.find((x) => x.itemPliego === '6').cantidad === 8 && vi0.find((x) => x.itemPliego === '8').cantidad === 8, 'tarjeta «Corregir el itemizado» (6: 8 → 0, 8: 8 → 16) y antes del Sí no cambia nada · ' + r.slice(0, 200));
  if (cel) await p.screenshot({ path: __dirname + '/v133_itemizado_cel.png' });
  await p.click('#iaPanel .ia-conf:last-of-type [data-iasi]');
  for (let i = 0; i < 20; i++) { await p.waitForTimeout(250); s = await db(); if (s.avanceObras.p2.valorItems.find((x) => x.itemPliego === '8').cantidad === 16) break; }
  await p.waitForTimeout(600); s = await db();
  const vi = s.avanceObras.p2.valorItems, i6 = vi.find((x) => x.itemPliego === '6'), i8 = vi.find((x) => x.itemPliego === '8');
  const au = Object.values(s.auditoria || {}).filter((x) => x.accion === 'asistente_itemizado' && x.porAsistente);
  c(i6.cantidad === 0 && i8.cantidad === 16 && i6.cantidadAvanzada === 0 && i8.cantidadAvanzada === 2 && /hechasDespues/.test(JSON.stringify(au[0])) && au.length === 1 && /ítem 6: 8→0/.test(au[0].detalle) && /10 m/.test(au[0].detalle), 'con «Sí» la obra queda con 0 en el ítem 6 y 16 en el ítem 8 (las hechas del 6 no pueden pasar el total) y la auditoría · ' + JSON.stringify({ i6, i8, au: au.map((x) => x.detalle) }));
  r = await ultConf();
  c(/✅ Itemizado corregido/.test(r), 'la tarjeta dice «✅ Itemizado corregido»');

  // ---- 11) permisos: Oficina sin gastos no ve gastos con consultar ni en obra_completa
  const O = await otraPagina(A, Object.assign({}, MOD, { sesion: 'olga', cel })), q = O.page;
  await q.waitForTimeout(2500);
  r = await q.evaluate(async () => { window.__asistenteAbrir(); await new Promise((ok) => setTimeout(ok, 400)); const H = window.__asistente.herramientas; const g = await H.consultar({ coleccion: 'gastos' }); const o = await H.consultar({ coleccion: 'obras', limite: 5 }); const oc = await H.obra_completa({ obraId: 'p2' }); const u = await H.consultar({ coleccion: 'usuarios' }); return { g: g.err || '', gr: !!(g.r && g.r.registros), o: o.r ? o.r.devueltos : -1, oc: oc.r ? String(oc.r.gastos) : '', u: u.err || '', mail: /@/.test(JSON.stringify(o.r)) }; });
  c(/permiso/.test(r.g) && !r.gr && r.o >= 2 && /sin permiso/.test(r.oc) && /permiso/.test(r.u) && !r.mail, 'Oficina sin permiso de gastos: consultar no devuelve gastos (ni obra_completa), ni usuarios; las obras sí, sin mails · ' + JSON.stringify(r));
  await O.page.close();

  // ---- 12) tope de 10 vueltas
  r = await p.evaluate(() => /TOPE_VUELTAS = 10/.test(document.getElementById('asistenteIaCod').textContent));
  c(r, 'tope de 10 vueltas por pregunta');

  if (cel) { const sw = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth); c(sw <= 0, 'sin scroll de costado · ' + sw); await p.screenshot({ path: __dirname + '/v133_chat_cel.png' }); }
  else await p.screenshot({ path: __dirname + '/v133_chat_pc.png' });
  const errs = (A.errores || []).filter((e) => !/Missing or insufficient permissions|permission-denied|ERR_|Failed to fetch|aborted|fetching the script|net::/i.test(e));
  c(!errs.length, 'sin errores de JS ' + JSON.stringify(errs.slice(0, 3)));
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
