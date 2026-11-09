// v134 · El Asistente EMA edita lo que la persona puede editar (siempre con tarjeta antes → después y «Sí») y charla por voz.
//  1) Oficina edita una OT (suma a Rolando y cambia la cantidad): la tarjeta muestra antes y después; con «No» no se guarda
//     nada; con «Sí» queda con personalNombres, el aviso al celu de Rolando y la auditoría «asistente_editar».
//  2) Cuadrilla: el asistente no le manda herramientas de acción al modelo y las acciones contestan «solo consulta».
//  3) Calculadora: «las 16 de 10 m» → cómputo NUEVO guardado (el viejo queda igual) y «Pasar este cálculo a la obra».
//  4) Pañol: vale de salida con número de comprobante S-….  5) proponer_editar respeta los permisos (gastos, usuarios).
//  6) Datos de la obra por el formulario de Registrar obra.  7) Modo charla con voz simulada: escucha, responde, habla,
//     vuelve a escuchar, «sí, hacelo» por voz confirma la tarjeta, y corta con «terminar».  8) presencia.disp se escribe.
const { abrir, otraPagina, prueba, baseDatos, DOM } = require('./h');
const cel = process.argv[2] === 'cel';
const URL_IA = 'https://ema-ia.mdiaz-60f.workers.dev/ia';
(async () => {
  const c = prueba('v134' + (cel ? ' cel' : ''));
  const d = baseDatos(), ahora = Date.now(), hoy = d.hoy;
  d.db.avanceObras.p1 = Object.assign(d.db.avanceObras.p1, { lat: -31.41, lng: -64.18, tipoObra: 'plaza' });
  d.db.avanceObras.p2 = { nombre: 'PLAZA GEORG NICOLAI', obraId: '4100', barrio: 'Alberdi', direccion: 'Calle 1', tipoObra: 'plaza', lat: -31.42, lng: -64.19, creado: ahora, valorItems: [{ id: 11, itemPliego: '6', cantidad: 8, cantidadAvanzada: 0 }, { id: 12, itemPliego: '8', cantidad: 8, cantidadAvanzada: 0 }] };
  d.db.historialCalculos = { h1: { nombre: 'PLAZA GEORG NICOLAI', id: '4100', barrio: 'Alberdi', fecha: '2026-11-05', ts: ahora - 864e5 * 4, usuario: 'admin@' + DOM, estado: 'Pendiente', cantCol: 16, tipoCol: 'PRFV', altura: 7, tareas: ['Columnas'], tiles: [], alertas: [], form: { v: 1, campos: { colTipo: 'PRFV' }, columnaGrupos: [], circuitos: [] }, secciones: [] } };
  Object.assign(d.db.ordenesTrabajo.ot1, { actividades: ['fundaciones'], previsto: { fundaciones: 4 } });
  d.db.usuarios.uRol = { email: 'rolando@' + DOM, usuario: 'rolando', nombre: 'Rolando Velázquez', rol: 'cuadrilla', persona: 'Rolando Velázquez', personaClave: 'rolando velazquez', activo: true };
  d.db.usuarios.uOfi = { email: 'olga@' + DOM, usuario: 'olga', nombre: 'Olga Oficina', rol: 'oficina', activo: true, ajustes: { gastos: 'oculto' } };
  d.cuentas['olga@' + DOM] = { pass: 'clave123', uid: 'uOfi' };
  d.db.configEquipo.personal.lista.push({ nombre: 'Rolando Velázquez', rol: 'Ayudante', activo: true });
  d.db.configEquipo.personal.vehiculos = [{ id: 'v1', nombre: 'Hilux', patente: 'AB123CD', activo: true }];
  d.db.configEquipo.personal.asistente = { roles: ['admin', 'oficina', 'cuadrilla'] };
  d.db.gastosObra = { g1: { plazaId: 'p2', categoria: 'Materiales', monto: 1000, fecha: hoy } };
  const MOD = { cel, espera: 3500, ofPasos: true, mtNuevo: true, porPartes: true, reglas: true, https: true, tarjetas: true };
  const A = await abrir(Object.assign({ sesion: 'admin', datos: d }, MOD)), p = A.page;
  p.on('dialog', (x) => x.accept());
  // ---- el Worker simulado (por página)
  let n = 0;
  const usa = (name, input) => ({ id: 'msg_' + (++n), type: 'message', role: 'assistant', content: [{ type: 'text', text: 'Me fijo.' }, { type: 'tool_use', id: 'tu_' + n, name, input }], stop_reason: 'tool_use', usage: { input_tokens: 900, output_tokens: 40 }, ema: { costoUsd: 0.02 } });
  const fin = (text) => ({ id: 'msg_' + (++n), type: 'message', role: 'assistant', content: [{ type: 'text', text }], stop_reason: 'end_turn', usage: { input_tokens: 1000, output_tokens: 60 }, ema: { costoUsd: 0.03 } });
  async function worker(pg) {
    const W = { pedidos: [], cola: [] };
    await pg.route(URL_IA, async (r) => {
      const req = r.request(); let b = null; try { b = JSON.parse(req.postData() || 'null'); } catch (e) { }
      W.pedidos.push({ b }); const f = W.cola.shift(); const x = typeof f === 'function' ? f(b) : f;
      if (!x) return r.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: { tipo: 'prueba', mensaje: 'sin guion' } }) });
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(x) });
    });
    return W;
  }
  const esperarLibre = async (pg) => { for (let i = 0; i < 80; i++) { await pg.waitForTimeout(150); const ok = await pg.evaluate(() => { const b = document.getElementById('iaEnviar'); return !!b && !b.disabled; }); if (ok) return; } };
  async function preguntar(pg, W, t, guion) { W.cola.push(...guion); const n0 = W.pedidos.length; await pg.fill('#iaTxt', t); await pg.click('#iaEnviar'); await pg.waitForTimeout(200); await esperarLibre(pg); return W.pedidos.slice(n0); }
  const resultado = (ped) => { const m = ped.b.messages[ped.b.messages.length - 1], tr = m.content[0]; const txt = typeof tr.content === 'string' ? tr.content : tr.content[0].text; return JSON.parse(txt); };
  const ultConf = (pg) => pg.evaluate(() => { const l = document.querySelectorAll('#iaChat .ia-conf'), x = l[l.length - 1]; return x ? x.textContent.replace(/\s+/g, ' ') : ''; });
  const dbDe = (pg) => pg.evaluate(() => window.__stubDB());
  const esperarDb = async (pg, f) => { let s = null; for (let i = 0; i < 40; i++) { s = await dbDe(pg); if (f(s)) return s; await pg.waitForTimeout(200); } return s; };

  // ======= 1) Oficina edita una OT
  const O = await otraPagina(A, Object.assign({}, MOD, { sesion: 'olga' })), q = O.page;
  q.on('dialog', (x) => x.accept());
  const WO = await worker(q);
  await q.waitForTimeout(2500);
  await q.evaluate(() => window.__asistenteAbrir()); await q.waitForTimeout(600);
  const pedirEdit = () => preguntar(q, WO, 'sumale a Rolando a la OT 001 y poné 6 de fundaciones', [usa('proponer_editar_orden', { otId: 'OT-2026-001', cambios: { agregar_personas: ['Rolando'], tareas: [{ tarea: 'fundaciones', cantidad: 6 }] } }), fin('Te dejé el cambio para confirmar.')]);
  let ps = await pedirEdit();
  let j = resultado(ps[1]);
  let r = await ultConf(q);
  let s = await dbDe(q);
  const tools0 = ps[0].b.tools.map((t) => t.name);
  c(['proponer_editar_orden', 'proponer_calculo', 'proponer_editar_obra', 'proponer_movimiento_panol', 'proponer_editar', 'proponer_orden'].every((k) => tools0.includes(k)) && /Puede editar: [^\n]*parte/.test(ps[0].b.system[1].text), 'Oficina recibe las herramientas de edición y el contexto dice qué hojas edita · ' + ps[0].b.system[1].text.split('\n').slice(-1)[0]);
  c(j.estado === 'pendiente_de_confirmacion' && /Gente/.test(r) && /Gente\s*Juan Pérez, Pedro Gómez → Juan Pérez, Pedro Gómez, Rolando Velázquez/.test(r) && /4 \w+ → 6/.test(r) && /OT-2026-001/.test(r) && !(s.ordenesTrabajo.ot1.personalNombres || []).includes('rolando velazquez') && s.ordenesTrabajo.ot1.previsto.fundaciones === 4, 'tarjeta «Cambiar OT-2026-001» con antes → después (gente y 4 → 6) y nada guardado todavía · ' + r.slice(0, 220));
  await q.click('#iaPanel .ia-conf:last-of-type [data-iano]'); await q.waitForTimeout(900);
  s = await dbDe(q); r = await ultConf(q);
  c(/No se hizo nada/.test(r) && s.ordenesTrabajo.ot1.previsto.fundaciones === 4 && !Object.values(s.auditoria || {}).some((x) => x.accion === 'asistente_editar'), 'con «No» no se guarda nada');
  ps = await pedirEdit();
  if (cel) await q.screenshot({ path: __dirname + '/v134_editar_ot_cel.png' });
  await q.click('#iaPanel .ia-conf:last-of-type [data-iasi]');
  s = await esperarDb(q, (x) => (x.ordenesTrabajo.ot1.personalNombres || []).includes('rolando velazquez') && Object.values(x.auditoria || {}).some((y) => y.accion === 'asistente_editar'));
  const ot = s.ordenesTrabajo.ot1, au = Object.values(s.auditoria || {}).filter((x) => x.accion === 'asistente_editar');
  const av = Object.values(s.avisosPush || {}).filter((x) => x.clave === 'rolando velazquez' && x.tipo === 'ot');
  c(JSON.stringify(ot.personalNombres) === '["juan perez","pedro gomez","rolando velazquez"]' && ot.personal.some((x) => x.nombre === 'Rolando Velázquez' && x.rol === 'Ayudante') && ot.previsto.fundaciones === 6 && ot.numero === 'OT-2026-001', 'con «Sí» la orden queda con Rolando (rol de la nómina), personalNombres y 6 de fundaciones; el número no cambia · ' + JSON.stringify({ pn: ot.personalNombres, pr: ot.previsto }));
  c(av.length === 1 && /OT-2026-001/.test(av[0].cuerpo), 'a Rolando le llega el aviso al celu (avisosPush), como al editar desde la pantalla · ' + JSON.stringify(av.map((x) => x.cuerpo)));
  c(au.length === 1 && au[0].porAsistente === true && au[0].coleccion === 'ordenesTrabajo' && au[0].ref === 'ot1' && au[0].antes && au[0].despues && JSON.stringify(au[0].antes.personalNombres) === '["juan perez","pedro gomez"]' && au[0].despues.previsto.fundaciones === 6, 'auditoría «asistente_editar» con colección, id, antes y después · ' + JSON.stringify(au[0] || {}).slice(0, 200));
  r = await ultConf(q); c(/✅ OT-2026-001 quedó cambiada/.test(r), 'la tarjeta dice «✅ OT-2026-001 quedó cambiada» · ' + r.slice(-120));
  // proponer_editar: Oficina sin gastos no los edita; usuarios solo Administración; las órdenes van por su herramienta
  r = await q.evaluate(() => { const H = window.__asistente.herramientas; return { g: H.proponer_editar({ coleccion: 'gastos', id: 'g1', cambios: { monto: 5 }, motivo: 'x' }).err || '', u: H.proponer_editar({ coleccion: 'usuarios', id: 'uRol', cambios: { rol: 'admin' }, motivo: 'x' }).err || '', o: H.proponer_editar({ coleccion: 'ordenes', id: 'ot1', cambios: { notas: 'x' }, motivo: 'x' }).err || '', a: H.proponer_editar({ coleccion: 'auditoria', id: 'x', cambios: { a: 1 }, motivo: 'x' }).err || '' }; });
  c(/no puede editar «gastos»/.test(r.g) && /solo Administración/.test(r.u) && /proponer_editar_orden/.test(r.o) && /no se edita/.test(r.a), 'proponer_editar respeta los permisos: Oficina sin gastos no edita gastos, usuarios solo Administración, auditoría nunca · ' + JSON.stringify(r));
  await O.page.close();

  // ======= 2) Cuadrilla: sin acciones
  const P = await otraPagina(A, Object.assign({}, MOD, { sesion: 'pedro', cel: true })), pp = P.page;
  const WP = await worker(pp);
  await pp.waitForTimeout(2500);
  const abre = await pp.evaluate(() => window.__asistenteAbrir()); await pp.waitForTimeout(600);
  ps = abre ? await preguntar(pp, WP, 'cambiá la OT 001 a mañana', [fin('No puedo hacer cambios con tu usuario.')]) : [];
  r = await pp.evaluate(() => { const H = window.__asistente && window.__asistente.herramientas; if (!H) return null; return { a: H.proponer_editar_orden({ otId: 'OT-2026-001', cambios: { fecha: 'mañana' } }).err || '', b: H.proponer_movimiento_panol({ tipo: 'vale', items: [{ codigo: '2009', cant: 1 }] }).err || '', c: H.proponer_orden({ obra: 'p1', personas: ['Juan'], tareas: [{ tarea: 'fundaciones', cantidad: 1 }] }).err || '' }; });
  const toolsC = ps.length ? ps[0].b.tools.map((t) => t.name) : [];
  c(abre && ps.length === 1 && toolsC.length > 5 && !toolsC.some((k) => /^proponer_/.test(k)) && /SOLO CONSULTA/.test(ps[0].b.system[1].text), 'cuadrilla con el asistente habilitado: al modelo no le llega ninguna herramienta de acción y el contexto dice «solo consulta» · ' + toolsC.length);
  c(r && [r.a, r.b, r.c].every((x) => /solo puede consultar/.test(x)), 'y si igual se las pide, las acciones contestan que solo consulta · ' + JSON.stringify(r));
  await P.page.close();

  // ======= 3) Calculadora (admin): «las 16 de 10 m»
  const WA = await worker(p);
  await p.evaluate(async () => {
    const sf = snapshotFormulario(), p0 = (sf.circuitos[0].puntos || [])[0] || { esColumna: true };
    sf.campos.obraNombre = 'PLAZA GEORG NICOLAI'; sf.campos.obraId = '4100'; sf.campos.colTipo = 'PRFV'; sf.campos.toggleColumnas = true;
    sf.columnaGrupos = [{ id: 1, altura: 7, columnas: 8 }, { id: 2, altura: 10, columnas: 8 }];
    sf.circuitos = [1, 2].map((k) => Object.assign({}, sf.circuitos[0], { id: k, numero: k, tablero: 1, puntos: Array.from({ length: 8 }, (_, i) => Object.assign({}, p0, { id: k * 100 + i })) }));
    const h = { form: sf }; const rc = actRecalcular(h);
    await firebase.firestore().collection('historialCalculos').doc('h1').update(Object.assign({ form: sf }, rc.nuevo ? { secciones: rc.nuevo.secciones, cantCol: rc.nuevo.cantCol, altura: rc.nuevo.altura, tipoCol: rc.nuevo.tipoCol } : {}));
  });
  await p.waitForTimeout(1500);
  await p.evaluate(() => window.__asistenteAbrir()); await p.waitForTimeout(600);
  ps = await preguntar(p, WA, 'en georg nicolai son las 16 de 10 m, rehacé el cálculo', [usa('proponer_calculo', { obraId: 'georg nicolai', cambiosForm: { columnas: [{ altura: 10, columnas: 16 }] } }), fin('Te dejo el cómputo nuevo para confirmar.')]);
  j = resultado(ps[1]); r = await ultConf(p); s = await dbDe(p);
  c(j.estado === 'pendiente_de_confirmacion' && /Columnas\s*8 de 7 m \+ 8 de 10 m → 16 de 10 m/.test(r) && /Materiales que cambian/.test(r) && (j.materialesQueCambian || []).some((x) => /10 m/i.test(x)) && Object.keys(s.historialCalculos).length === 1, 'tarjeta «Cómputo nuevo»: columnas 8 de 7 + 8 de 10 → 16 de 10, materiales que cambian; todavía no se guarda nada · ' + r.slice(0, 260));
  c(/Itemizado previsto/.test(r) && (j.itemizadoPrevisto || []).some((x) => /ítem 8: \d+ → 16/.test(x)), 'y qué cambia en el itemizado previsto (ítem 8 → 16) · ' + JSON.stringify(j.itemizadoPrevisto));
  if (cel) await p.screenshot({ path: __dirname + '/v134_calculo_cel.png' });
  await p.click('#iaPanel .ia-conf:last-of-type [data-iasi]');
  s = await esperarDb(p, (x) => Object.keys(x.historialCalculos).length === 2);
  const hs = Object.entries(s.historialCalculos), h1 = s.historialCalculos.h1, hn = (hs.find(([k]) => k !== 'h1') || [])[1] || {};
  const g10 = (hn.form && hn.form.columnaGrupos || []).filter((g) => +g.altura === 10).reduce((a, g) => a + +g.columnas, 0), g7 = (hn.form && hn.form.columnaGrupos || []).filter((g) => +g.altura === 7).reduce((a, g) => a + +g.columnas, 0);
  c(hs.length === 2 && h1.form.columnaGrupos.length === 2 && h1.form.columnaGrupos[0].altura === 7 && g10 === 16 && g7 === 0 && hn.nombre === 'PLAZA GEORG NICOLAI' && hn.estado === 'Pendiente', 'con «Sí» queda un cómputo NUEVO con 16 de 10 m; el viejo sigue igual · ' + JSON.stringify({ n: hs.length, g10, g7, viejo: h1.form.columnaGrupos }));
  await p.waitForTimeout(600); r = await p.evaluate(() => { const l = document.querySelectorAll('#iaChat .ia-conf'), x = l[l.length - 1]; return { t: x.textContent.replace(/\s+/g, ' '), pasar: !!x.querySelector('[data-iapasar]') }; });
  s = await dbDe(p);
  c(/Cómputo nuevo guardado/.test(r.t) && Object.values(s.auditoria || {}).some((x) => x.accion === 'asistente_editar' && x.coleccion === 'historialCalculos' && x.porAsistente), 'la tarjeta dice «Cómputo nuevo guardado» y queda en la auditoría · ' + r.t.slice(-140));

  // ======= 4) Pañol: vale de salida con número
  ps = await preguntar(p, WA, 'hacé un vale de 5 BPN 6 para georg nicolai, lo retira Juan', [usa('proponer_movimiento_panol', { tipo: 'vale', items: [{ codigo: '2009', cant: 5 }], obra: 'p2', persona: 'Juan' }), fin('Confirmá el vale.')]);
  j = resultado(ps[1]); r = await ultConf(p);
  c(j.estado === 'pendiente_de_confirmacion' && /Vale de salida/.test(r) && /2009/.test(r) && /sale 5/.test(r) && !Object.keys((await dbDe(p)).movimientos || {}).length, 'tarjeta «Vale de salida» con el stock antes → después; nada cargado todavía · ' + r.slice(0, 200));
  await p.click('#iaPanel .ia-conf:last-of-type [data-iasi]');
  s = await esperarDb(p, (x) => Object.keys(x.movimientos || {}).length === 1);
  await p.waitForTimeout(800); r = await ultConf(p);
  const mv = Object.values(s.movimientos || {})[0] || {};
  c(mv.tipo === 'salida' && String(mv.codigo) === '2009' && mv.cantidad === 5 && mv.plazaId === 'p2' && mv.destino === 'PLAZA GEORG NICOLAI' && mv.retiradoPor === 'Juan Pérez' && /^VS/.test(mv.valeGrupo || '') && /^S-\d{4}$/.test(mv.numero || '') && new RegExp('Vale ' + mv.numero).test(r), 'con «Sí» el vale queda cargado como en el pañol, con su número de comprobante ' + mv.numero + ' · ' + r.slice(-100));

  // ======= 5) genérico (admin) y 6) datos de la obra por «Registrar obra»
  ps = await preguntar(p, WA, 'poné mínimo 50 al 2009', [usa('proponer_editar', { coleccion: 'catalogo', id: '2009', cambios: { minimo: 50 }, motivo: 'pedido de Ángel' }), fin('Confirmalo.')]);
  r = await ultConf(p);
  c(/minimo\s*.* → 50/.test(r) && !((await dbDe(p)).catalogoProductos || {})['2009'], 'proponer_editar: tarjeta «minimo: antes → 50», sin guardar todavía · ' + r.slice(0, 160));
  await p.click('#iaPanel .ia-conf:last-of-type [data-iasi]');
  s = await esperarDb(p, (x) => x.catalogoProductos && x.catalogoProductos['2009'] && x.catalogoProductos['2009'].minimo === 50);
  c(s.catalogoProductos && s.catalogoProductos['2009'] && s.catalogoProductos['2009'].minimo === 50, 'con «Sí» el producto queda con mínimo 50 (por fbGuardarProductoCatalogo)');
  ps = await preguntar(p, WA, 'cambiá la dirección de georg nicolai a Calle 2 y ponela en obra', [usa('proponer_editar_obra', { obraId: 'p2', cambios: { direccion: 'Calle 2', situacion: 'En obra' } }), fin('Confirmalo.')]);
  r = await ultConf(p);
  c(/Dirección\s*Calle 1 → Calle 2/.test(r) && /Situación\s*— → En obra/.test(r), 'tarjeta de la obra: dirección y situación antes → después · ' + r.slice(0, 160));
  await p.click('#iaPanel .ia-conf:last-of-type [data-iasi]');
  s = await esperarDb(p, (x) => x.avanceObras.p2.direccion === 'Calle 2' && x.avanceObras.p2.situacion === 'En obra');
  c(s.avanceObras.p2.direccion === 'Calle 2' && s.avanceObras.p2.situacion === 'En obra' && s.avanceObras.p2.editadoPor, 'con «Sí» la obra queda con la dirección nueva (por el formulario de Registrar obra) y la situación');
  await p.evaluate(() => { window.__asistente.cerrar(); window.mostrarVista('inicio'); });

  // ======= 8) presencia.disp
  s = await esperarDb(p, (x) => x.presencia && x.presencia.uAdmin && x.presencia.uAdmin.disp);
  const meta = await p.evaluate(() => document.querySelector('meta[name="ema-version"]').content);
  const dp = s.presencia && s.presencia.uAdmin && s.presencia.uAdmin.disp;
  c(dp && dp.versionApp === meta && 'bateria' in dp && 'red' in dp && 'modelo' in dp && 'android' in dp && 'apk' in dp && 'carga' in dp, 'presencia/{uid}.disp se escribe con modelo, android, apk, versionApp (el sello), batería, carga y red · ' + JSON.stringify(dp));

  // ======= 7) modo charla con voz simulada (reconocimiento y síntesis del navegador)
  const vozFalsa = () => {
    window.__vozLog = { escuchas: 0, dichos: [], escuchoHablando: 0, frases: ['mandale un aviso a juan que traiga la escalera', 'sí, hacelo', '¿qué hay hoy?', 'terminar'] };
    let hablando = false;
    class SR { constructor() { this.lang = ''; } start() { const L = window.__vozLog; L.escuchas++; if (hablando) L.escuchoHablando++; setTimeout(() => { const f = L.frases.shift(); if (f) this.onresult && this.onresult({ results: [[{ transcript: f }]] }); else this.onerror && this.onerror({ error: 'no-speech' }); this.onend && this.onend(); }, 250); } stop() { } abort() { } }
    window.webkitSpeechRecognition = SR; window.SpeechRecognition = SR;
    const synth = { speaking: false, getVoices: () => [{ lang: 'es-AR', name: 'prueba' }], cancel() { hablando = false; }, speak(u) { hablando = true; window.__vozLog.dichos.push(u.text); setTimeout(() => { hablando = false; u.onend && u.onend(); }, 120); } };
    Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true });
  };
  const V = await otraPagina(A, Object.assign({}, MOD, { sesion: 'admin', antes: vozFalsa })), vp = V.page;
  vp.on('dialog', (x) => x.accept());
  const WV = await worker(vp);
  await vp.waitForTimeout(2500);
  await vp.evaluate(() => window.__asistenteAbrir()); await vp.waitForTimeout(600);
  WV.cola.push(usa('proponer_aviso', { personas: ['Juan'], texto: 'Traé la escalera' }), fin('Te dejo el aviso para Juan, confirmalo.'), fin('Hoy hay una orden en San Martín.'));
  await vp.click('#iaPanel [data-ia="charla"]');
  await vp.waitForTimeout(400);
  r = await vp.evaluate(() => { const b = document.getElementById('iaCharla'); return { vis: !!(b && !b.hidden && b.getBoundingClientRect().height > 0), t: b ? b.textContent : '', terminar: !!(b && b.querySelector('[data-ia="charlafin"]')) }; });
  c(r.vis && /Te escucho|Charlando|Pensando|Hablando/.test(r.t) && r.terminar, 'barra «🗣 Charlando…» a la vista con «Terminar» · ' + r.t);
  if (cel) await vp.screenshot({ path: __dirname + '/v134_charla_cel.png' }); else await vp.screenshot({ path: __dirname + '/v134_charla_pc.png' });
  for (let i = 0; i < 60; i++) { await vp.waitForTimeout(250); const on = await vp.evaluate(() => window.__asistente.charla().on); if (!on) break; }
  const L = await vp.evaluate(() => window.__vozLog);
  s = await dbDe(vp);
  r = await vp.evaluate(() => ({ on: window.__asistente.charla().on, barra: !document.getElementById('iaCharla') || document.getElementById('iaCharla').hidden, txt: document.getElementById('iaChat').textContent.replace(/\s+/g, ' '), conf: (document.querySelector('#iaChat .ia-conf') || {}).textContent || '' }));
  const avJ = Object.values(s.avisosPush || {}).filter((x) => x.clave === 'juan perez' && /escalera/.test(x.cuerpo || ''));
  c(WV.pedidos.length === 3 && /aviso a juan/.test(JSON.stringify(WV.pedidos[0].b.messages)) && /CHARLANDO POR VOZ/.test(WV.pedidos[0].b.system[1].text), 'lo dicho va al asistente, avisándole que es una charla por voz (respuestas cortas) · pedidos ' + WV.pedidos.length);
  c(L.dichos.some((x) => /aviso para Juan/.test(x)) && L.dichos.some((x) => /orden en San Martín/.test(x)) && !L.dichos.some((x) => /[✅📣]/u.test(x)), 'lee en voz alta cada respuesta (sin emojis) · ' + JSON.stringify(L.dichos));
  c(avJ.length === 1 && /Aviso mandado/.test(r.conf), '«sí, hacelo» dicho confirma la tarjeta (que queda a la vista) y el aviso sale · ' + r.conf.slice(0, 120));
  c(L.escuchas >= 4 && L.escuchoHablando === 0, 'vuelve a escuchar después de cada respuesta y nunca escucha mientras habla · escuchas ' + L.escuchas);
  c(!r.on && r.barra && /terminamos la charla/.test(r.txt), 'con «terminar» la charla se corta sola y la barra desaparece');
  // el botón «Terminar» corta también
  await vp.evaluate(() => { window.__vozLog.frases = []; }); await vp.click('#iaPanel [data-ia="charla"]'); await vp.waitForTimeout(500);
  await vp.click('#iaCharla [data-ia="charlafin"]'); await vp.waitForTimeout(400);
  r = await vp.evaluate(() => window.__asistente.charla().on);
  c(!r, 'el botón «Terminar» de la barra corta la charla');
  r = await vp.evaluate(() => { const b = document.querySelector('#iaChat .ia-b.ia .ia-oir'); return !!b; });
  c(r, 'cada respuesta tiene «🔊 Escuchar»');
  if (cel) { const sw = await vp.evaluate(() => document.documentElement.scrollWidth - innerWidth); c(sw <= 0, 'sin scroll de costado · ' + sw); }
  const errs = (A.errores || []).concat(V.errores || []).filter((e) => !/Missing or insufficient permissions|permission-denied|ERR_|Failed to fetch|aborted|fetching the script|net::/i.test(e));
  c(!errs.length, 'sin errores de JS ' + JSON.stringify(errs.slice(0, 3)));
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
