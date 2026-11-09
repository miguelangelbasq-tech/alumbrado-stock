// v132 · Asistente EMA: botón «✨ Asistente» (solo Administración y Oficina), preguntas con herramientas que leen lo que la app
// ya tiene (datos_obra, ubicacion_obra, ordenes_completas), acciones que se proponen con tarjeta y se hacen recién con «Sí»
// (proponer_orden emite por «Llenar orden» con personalNombres y aviso; «No» no escribe nada), Haiku → Sonnet, contador de gasto,
// error del Worker (429), «refusal» y sin señal. El Worker se simula interceptando el fetch a /ia.
const { abrir, otraPagina, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
const URL_IA = 'https://ema-ia.mdiaz-60f.workers.dev/ia';
(async () => {
  const c = prueba('v132' + (cel ? ' cel' : ''));
  const d = baseDatos(), ahora = Date.now(), hoy = d.hoy;
  const manana = (() => { const x = new Date(hoy + 'T12:00:00'); x.setDate(x.getDate() + 1); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); })();
  const ayer = (() => { const x = new Date(hoy + 'T12:00:00'); x.setDate(x.getDate() - 1); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); })();
  Object.assign(d.db.avanceObras.p1, { lat: -31.41, lng: -64.18, tipoObra: 'plaza',
    valorItems: [{ id: 1, itemPliego: '5', cantidad: 10, cantidadAvanzada: 4 }, { id: 2, itemPliego: '8', cantidad: 2, cantidadAvanzada: 0 }] });
  d.db.configEquipo.personal.vehiculos = [{ id: 'v1', nombre: 'Hilux', patente: 'AB123CD', activo: true }];
  d.db.configEquipo.personal.lista[0].vehiculoId = 'v1';
  const anio = new Date().getFullYear();
  d.db.ordenesTrabajo.ot2 = { numero: `OT-${anio}-002`, fecha: ayer, plazaId: 'p1', plazaNombre: 'Plaza San Martín', obraId: '1234', cuadrilla: 'Juan', personal: [{ nombre: 'Juan Pérez', rol: 'Oficial' }], personalNombres: ['juan perez'],
    actividades: ['zanjeo'], previsto: { zanjeo: 10 }, actividadesManuales: [], estado: 'En curso', creado: ahora - 864e5,
    campo: { marcas: { zanjeo: { hecho: true, cant: 10, por: 'Juan Pérez' } }, tareaEnv: { zanjeo: { 'juan perez': { estado: 'si', ts: ahora - 3600e3, por: 'Juan Pérez' } } }, horasTarea: { zanjeo: { ini: '08:00', fin: '12:00', por: 'Juan Pérez' } }, enviados: { 'juan perez': { nombre: 'Juan Pérez', ts: ahora - 3600e3 } } } };
  const MOD = { cel, espera: 3500, ofPasos: true, mtNuevo: true, porPartes: true, reglas: true, https: true, tarjetas: true };
  const A = await abrir(Object.assign({ sesion: 'admin', datos: d }, MOD)), p = A.page;
  p.on('dialog', (x) => x.accept());
  // ---- el Worker simulado
  const pedidos = [], cola = []; let costo = 0;
  await p.route(URL_IA, async (r) => {
    const req = r.request(); let b = null; try { b = JSON.parse(req.postData() || 'null'); } catch (e) { }
    pedidos.push({ b, auth: req.headers()['authorization'] || '' });
    const f = cola.shift();
    const x = typeof f === 'function' ? f(b) : f;
    if (!x) return r.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: { tipo: 'prueba', mensaje: 'sin guion' } }) });
    if (x.status) return r.fulfill({ status: x.status, contentType: 'application/json', body: JSON.stringify(x.body) });
    if (x.ema) costo += x.ema.costoUsd;
    return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(x) });
  });
  let n = 0;
  const usa = (name, input, txt) => ({ id: 'msg_' + (++n), type: 'message', role: 'assistant', content: [{ type: 'text', text: txt || 'Me fijo.' }, { type: 'tool_use', id: 'tu_' + n, name, input }], stop_reason: 'tool_use', usage: { input_tokens: 900, output_tokens: 40 }, ema: { costoUsd: 0.0011 } });
  const fin = (text) => ({ id: 'msg_' + (++n), type: 'message', role: 'assistant', content: [{ type: 'text', text }], stop_reason: 'end_turn', usage: { input_tokens: 1000, output_tokens: 60 }, ema: { costoUsd: 0.0009 } });
  const esperarLibre = async () => { for (let i = 0; i < 60; i++) { await p.waitForTimeout(150); const ok = await p.evaluate(() => { const b = document.getElementById('iaEnviar'); return !!b && !b.disabled; }); if (ok) return; } };
  async function preguntar(t, guion) { cola.push(...guion); const n0 = pedidos.length; await p.fill('#iaTxt', t); await p.click('#iaEnviar'); await p.waitForTimeout(200); await esperarLibre(); return pedidos.slice(n0); }
  const ultimaB = (sel) => p.evaluate((s) => { const l = document.querySelectorAll('#iaChat ' + s); return l.length ? l[l.length - 1].textContent.replace(/\s+/g, ' ') : ''; }, sel || '.ia-b.ia');
  const db = () => p.evaluate(() => window.__stubDB());

  // ---- 1) el botón: visible para admin, oculto para la cuadrilla
  await p.waitForTimeout(1600);
  let r = await p.evaluate(() => { const b = document.querySelector('#iaFab'); return { hay: !!b, vis: !!(b && !b.hidden && getComputedStyle(b).display !== 'none' && b.getBoundingClientRect().width > 0), tx: b ? b.textContent : '' }; });
  c(r.vis && /Asistente/.test(r.tx), 'Administración ve el botón «✨ Asistente» · ' + JSON.stringify(r));
  const J = await otraPagina(A, Object.assign({}, MOD, { sesion: 'juan', cel: true })), q = J.page;
  await q.waitForTimeout(2200);
  r = await q.evaluate(() => { const b = document.querySelector('#iaFab'); return { hay: !!b, vis: !!(b && !b.hidden && getComputedStyle(b).display !== 'none' && b.getBoundingClientRect().width > 0), cargado: !!window.__asistente }; });
  c(!r.vis && !r.cargado, 'la cuadrilla (operario) no ve el botón ni carga el asistente · ' + JSON.stringify(r));
  const P2 = await otraPagina(A, Object.assign({}, MOD, { sesion: 'pedro', cel: true })), q2 = P2.page;
  await q2.waitForTimeout(2200);
  r = await q2.evaluate(() => { const b = document.querySelector('#iaFab'); return !!(b && !b.hidden && getComputedStyle(b).display !== 'none' && b.getBoundingClientRect().width > 0); });
  c(!r, 'la cuadrilla (rol cuadrilla) tampoco lo ve');
  await J.page.close(); await P2.page.close();

  // ---- abrir el panel
  await p.click('#iaFab .ia-fab-b'); await p.waitForTimeout(600);
  r = await p.evaluate(() => { const x = document.getElementById('iaPanel'), b = x && x.getBoundingClientRect(); return { vis: !!(x && !x.hidden), w: b ? Math.round(b.width) : 0, chips: document.querySelectorAll('#iaChips .chip').length, mic: !!document.querySelector('#iaPanel .ia-mic') }; });
  c(r.vis && r.chips >= 5 && r.mic && (cel ? r.w >= 389 : r.w <= 440), 'se abre el panel (' + (cel ? 'pantalla completa' : 'al costado') + ') con sugerencias y micrófono · ' + JSON.stringify(r));
  if (cel) await p.screenshot({ path: __dirname + '/v132_panel_cel.png' });

  // ---- 2) pregunta de lectura: «¿cuántas columnas…?» → datos_obra → tool_result → respuesta
  let ps = await preguntar('¿cuántas columnas tiene san martin?', [usa('datos_obra', { obraId: 'san martin' }), (b) => { const m = b.messages[b.messages.length - 1], tr = m.content[0]; const j = JSON.parse(tr.content); return fin(`Tiene **${j.columnas.total} columnas** (${j.columnas.hechas} hechas).`); }]);
  const tr = ps[1] && ps[1].b.messages[ps[1].b.messages.length - 1].content[0], jt = tr ? JSON.parse(tr.content) : {};
  c(ps.length === 2 && ps[0].auth === 'Bearer tok-uAdmin' && ps[0].b.model === 'claude-sonnet-5-5' && ps[0].b.output_config.effort === 'medium', 'pregunta con Sonnet, effort medium (v133: Sonnet para todo; antes Haiku/low) y el token de Firebase · ' + JSON.stringify(ps.map((x) => [x.b.model, x.auth])));
  c(ps[0].b.system[0].cache_control && ps[0].b.system[0].cache_control.type === 'ephemeral' && ps[0].b.tools.length >= 14 && ps[0].b.tools[ps[0].b.tools.length - 1].cache_control && !('temperature' in ps[0].b) && /Hoy es/.test(ps[0].b.system[1].text) && /Ana Admin/.test(ps[0].b.system[1].text), 'system + tools con cache_control, sin temperature, con la fecha y quién pregunta');
  c(tr && tr.type === 'tool_result' && tr.tool_use_id === 'tu_1' && jt.columnas && jt.columnas.total === 12 && jt.columnas.hechas === 4 && jt.columnas.porTipo.length === 2 && jt.lat === -31.41, 'datos_obra devuelve las columnas por tipo (12, 4 hechas) y las coordenadas · ' + JSON.stringify(jt.columnas || jt).slice(0, 200));
  r = await ultimaB();
  c(/12 columnas/.test(r) && /4 hechas/.test(r), 'la respuesta aparece en el chat · ' + r);

  // ---- 3) ubicación con el link
  await preguntar('pasame la ubi de san martin', [usa('ubicacion_obra', { obraId: 'p1' }), fin('Ahí va la ubicación de PLAZA SAN MARTÍN.')]);
  r = await p.evaluate(() => { const a = [...document.querySelectorAll('#iaChat a[data-iamapa]')].pop(), w = [...document.querySelectorAll('#iaChat a[data-iawa]')].pop(); return { a: a && a.href, w: w && w.href }; });
  c(r.a === 'https://maps.google.com/?q=-31.41,-64.18' && /^https:\/\/wa\.me\/\?text=/.test(r.w || '') && decodeURIComponent(r.w).includes('maps.google.com/?q=-31.41,-64.18'), 'ubicación: botones «📍 Abrir mapa» y «Compartir por WhatsApp» con el link · ' + JSON.stringify(r).slice(0, 160));

  // ---- 4) proponer_orden: tarjeta y nada escrito hasta el Sí; «No» no escribe
  const nOt0 = Object.keys((await db()).ordenesTrabajo).length, nAv0 = Object.keys((await db()).avisosPush || {}).length;
  const propOrden = (veh) => usa('proponer_orden', Object.assign({ obra: 'p1', fecha: manana, personas: ['Juan'], tareas: [{ tarea: 'zanjeo', cantidad: 20 }] }, veh ? { vehiculo: veh } : {}), 'La armo.');
  ps = await preguntar('armá una orden para mañana en san martin con juan, zanjeo 20 m', [propOrden(), fin('Te la dejé abajo: confirmala con «Sí, hacelo».')]);
  const res4 = ps[1] && JSON.parse(ps[1].b.messages[ps[1].b.messages.length - 1].content[0].content);
  r = await p.evaluate(() => { const l = document.querySelectorAll('#iaChat .ia-conf'), x = l[l.length - 1]; return { n: l.length, t: x ? x.textContent.replace(/\s+/g, ' ') : '' }; });
  let s = await db();
  c(ps[0] && ps[0].b.model === 'claude-sonnet-5-5' && ps[0].b.output_config.effort === 'medium', '«armá…» va con Sonnet y effort medium');
  c(r.n === 1 && /Orden nueva/.test(r.t) && /SAN MART/i.test(r.t) && /Juan Pérez/.test(r.t) && /20/.test(r.t) && /Sí, hacelo/.test(r.t) && res4 && res4.estado === 'pendiente_de_confirmacion', 'la tarjeta muestra la orden (obra, gente, tarea y cantidad) con «Sí, hacelo» / «No» · ' + r.t.slice(0, 200));
  c(Object.keys(s.ordenesTrabajo).length === nOt0 && Object.keys(s.avisosPush || {}).length === nAv0, 'antes del Sí no se escribe nada en la base');
  if (cel) await p.screenshot({ path: __dirname + '/v132_tarjeta_cel.png' });
  await p.click('#iaChat .ia-conf:last-of-type [data-iano]'); await p.waitForTimeout(800);
  s = await db();
  r = await ultimaB('.ia-conf');
  c(Object.keys(s.ordenesTrabajo).length === nOt0 && !Object.values(s.auditoria || {}).some((x) => x.porAsistente) && /No se hizo nada/.test(r), '«No» no escribe nada · ' + r.slice(-40));
  // de nuevo, ahora con «Sí»
  await preguntar('dale, armala de nuevo con la hilux', [propOrden('hilux'), fin('Lista para confirmar.')]);
  await p.click('#iaPanel .ia-conf:last-of-type [data-iasi]');
  for (let i = 0; i < 40; i++) { await p.waitForTimeout(250); s = await db(); if (Object.keys(s.ordenesTrabajo).length > nOt0) break; }
  await p.waitForTimeout(1500); s = await db();
  const nueva = Object.entries(s.ordenesTrabajo).find(([id, o]) => id !== 'ot1' && id !== 'ot2');
  const on = nueva ? nueva[1] : {};
  c(!!nueva && on.plazaId === 'p1' && on.fecha === manana && JSON.stringify(on.personalNombres) === '["juan perez"]' && (on.actividades || []).includes('zanjeo') && (on.previsto || {}).zanjeo === 20 && /^OT-\d{4}-\d+$/.test(on.numero || '') && on.estado === 'Emitida' && (on.vehiculos || []).some((v) => v.id === 'v1'), 'con «Sí» la orden queda emitida como la de la oficina (número, personalNombres, tarea, cantidad y vehículo) · ' + JSON.stringify({ n: on.numero, pn: on.personalNombres, a: on.actividades, pr: on.previsto, f: on.fecha, v: (on.vehiculos || []).map((v) => v.nombre) }));
  const av = Object.values(s.avisosPush || {}).filter((x) => x.clave === 'juan perez' && x.tipo === 'ot');
  c(av.length >= 1, 'y a Juan le queda el aviso al celu · ' + av.length);
  const au = Object.values(s.auditoria || {}).filter((x) => x.porAsistente && x.accion === 'asistente_orden');
  c(au.length === 1 && au[0].detalle.includes(on.numero), 'queda en auditoría con porAsistente · ' + JSON.stringify(au.map((x) => x.detalle)));
  r = await ultimaB('.ia-conf');
  c(new RegExp('✅ ' + (on.numero || 'x') + ' emitida').test(r), 'la tarjeta dice «✅ OT-… emitida» · ' + r.slice(-80));
  // el panel sigue abierto en la PC; en el celu se ve la orden en «Llenar orden»
  if (cel) { await p.evaluate(() => window.__asistenteAbrir()); await p.waitForTimeout(300); }

  // ---- 5) ordenes_completas (y la nota de lo que pasó con la tarjeta llega en el próximo pedido)
  ps = await preguntar('¿qué OT están completas para cerrar?', [usa('ordenes_completas', {}), fin('Está lista la OT-002; la OT-001 no.')]);
  const u0 = ps[0] && ps[0].b.messages[ps[0].b.messages.length - 1];
  c(u0 && typeof u0.content === 'string' && /\[Nota de la app:.*emiti/.test(u0.content), 'el próximo pedido le cuenta a Claude que la orden se emitió · ' + String(u0 && u0.content).slice(0, 120));
  const jc = ps[1] && JSON.parse(ps[1].b.messages[ps[1].b.messages.length - 1].content[0].content);
  const lista = (jc.listasParaCerrar || []).map((x) => x.otId), noL = (jc.noListas || []).find((x) => x.otId === 'ot1');
  c(lista.includes('ot2') && !lista.includes('ot1') && noL && /no mand/.test(noL.motivos.join(' ')), 'ordenes_completas: la que mandó todo con horas está lista; la otra dice por qué no · ' + JSON.stringify(jc).slice(0, 220));

  // ---- 6) cierre propuesto → con «Sí» abre el cierre ya cargado
  await preguntar('cerrame la 002', [usa('proponer_cierre', { otIds: [`OT-${anio}-002`] }), fin('Confirmá y te abro el cierre.')]);
  await p.click('#iaPanel .ia-conf:last-of-type [data-iasi]'); await p.waitForTimeout(1500);
  r = await p.evaluate(() => ({ vis: (document.getElementById('cierreOt') || {}).style.display !== 'none', t: (document.getElementById('cierreTitulo') || {}).textContent, cola: !!document.getElementById('iaCola') }));
  s = await db();
  c(r.vis && /002/.test(r.t) && r.cola && !(s.ordenesTrabajo.ot2.cierre && s.ordenesTrabajo.ot2.cierre.cerradoTs), 'cierre: con «Sí» se abre el cierre de la orden (sin cerrarla sola) y la barra «Cierre 1 de 1» · ' + JSON.stringify(r));
  await p.click('#iaCola [data-iacola]'); await p.waitForTimeout(700);
  r = await p.evaluate(() => ({ cola: !!document.getElementById('iaCola'), vis: (document.getElementById('cierreOt') || {}).style.display !== 'none' }));
  c(!r.cola && !r.vis, '«Terminar» corta la serie y cierra la ventana sin guardar');
  await p.evaluate(() => window.__asistenteAbrir()); await p.waitForTimeout(400);

  // ---- 7) el aviso se manda recién con el Sí (v133: ya no hay paso de Haiku a Sonnet: todo va con Sonnet de entrada)
  ps = await preguntar('avisale a juan que mañana lleve la escalera', [usa('proponer_aviso', { personas: ['Juan'], texto: 'Mañana llevá la escalera.' }), fin('Confirmalo en la tarjeta.')]);
  c(ps.map((x) => x.b.model).join(',') === 'claude-sonnet-5-5,claude-sonnet-5-5', 'una acción va con Sonnet sin repetir el pedido · ' + ps.map((x) => x.b.model).join(','));
  const nAv1 = Object.values((await db()).avisosPush || {}).filter((x) => x.tipo === 'aviso').length;
  await p.click('#iaPanel .ia-conf:last-of-type [data-iasi]'); await p.waitForTimeout(1200);
  s = await db();
  const avs = Object.values(s.avisosPush || {}).filter((x) => x.tipo === 'aviso');
  c(nAv1 === 0 && avs.length === 1 && avs[0].clave === 'juan perez' && /escalera/.test(avs[0].cuerpo), 'el aviso a Juan sale recién con «Sí» · ' + JSON.stringify(avs.map((x) => [x.clave, x.cuerpo])));

  // ---- 8) error del Worker (429) con su mensaje
  await preguntar('¿y el stock de fusibles?', [{ status: 429, body: { error: { tipo: 'limite', mensaje: 'Llegaste a 20 pedidos por minuto. Esperá un ratito.' } } }]);
  r = await ultimaB('.ia-b.mal');
  c(/Llegaste a 20 pedidos por minuto/.test(r), 'error 429 del Worker: se muestra el mensaje que trae · ' + r);

  // ---- 9) refusal: no se ejecutan las herramientas de ese turno
  const nConf = await p.evaluate(() => document.querySelectorAll('#iaChat .ia-conf').length);
  await preguntar('algo raro', [{ id: 'msg_r', type: 'message', role: 'assistant', content: [{ type: 'tool_use', id: 'tu_r', name: 'proponer_aviso', input: { personas: ['Juan'], texto: 'x' } }], stop_reason: 'refusal', usage: { input_tokens: 10, output_tokens: 1 }, ema: { costoUsd: 0.0001 } }]);
  r = await ultimaB('.ia-b.mal');
  const nConf2 = await p.evaluate(() => document.querySelectorAll('#iaChat .ia-conf').length);
  c(/No puedo ayudarte con eso/.test(r) && nConf2 === nConf, '«refusal»: avisa que no puede y no corre la herramienta · ' + r);

  // ---- 10) sin señal
  await A.ctx.setOffline(true); await p.waitForTimeout(200);
  const nP = pedidos.length; await p.fill('#iaTxt', 'hola'); await p.click('#iaEnviar'); await p.waitForTimeout(600);
  r = await ultimaB('.ia-b.mal');
  c(/Sin señal: el asistente necesita internet/.test(r) && pedidos.length === nP, 'sin señal: «Sin señal: el asistente necesita internet» y no pide nada · ' + r);
  await A.ctx.setOffline(false); await p.waitForTimeout(200);

  // ---- 11) gasto del día y del mes, y la línea en menú › Versión
  r = await p.evaluate(() => { const g = JSON.parse(localStorage.getItem('ema.ia.gasto') || '{}'); const d = Object.values(g.d || {})[0] || 0, m = Object.values(g.m || {})[0] || 0; return { d, m, txt: window.__iaGastoTexto() }; });
  c(Math.abs(r.d - costo) < 1e-6 && Math.abs(r.m - costo) < 1e-6 && /Asistente: US\$ [\d,]+ hoy · US\$ [\d,]+ este mes/.test(r.txt), 'el gasto se suma por día y por mes · ' + JSON.stringify(r) + ' esperado ' + costo.toFixed(4));
  await p.evaluate(() => window.revisarApp()); await p.waitForTimeout(400);
  r = await p.evaluate(() => ((document.querySelector('#avisoApp .av-txt') || {}).textContent || ''));
  c(/Asistente: US\$/.test(r), 'menú › Versión muestra «Asistente: US$ … hoy · US$ … este mes»');
  await p.click('#avisoApp .av-ok').catch(() => { });

  if (cel) { const sw = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth); c(sw <= 0, 'sin scroll de costado · ' + sw); await p.screenshot({ path: __dirname + '/v132_chat_cel.png' }); }
  else await p.screenshot({ path: __dirname + '/v132_chat_pc.png' });
  const errs = (A.errores || []).concat(J.errores || []).filter((e) => !/Missing or insufficient permissions|permission-denied|ERR_|Failed to fetch|aborted|fetching the script|net::/i.test(e));
  c(!errs.length, 'sin errores de JS ' + JSON.stringify(errs.slice(0, 3)));
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
