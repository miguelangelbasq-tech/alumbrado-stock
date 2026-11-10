// v143 · Orden sugerida (la arma la app, sin IA; nada se escribe hasta «Emitir»):
//  · qué falta (saldoObra), obra sin cálculo, lo que quedó de ayer, fraguado (bloquea con fecha; sin fecha avisa; igual en
//    metálica), columnas siguientes, rendimiento medido contra el diccionario, modos de izaje (4 / 13 / 6 / 12 / 3), zanja
//    100 m con tope, cable limitado por la zanja, pozos y hormigón todos el mismo día (camión con más de 5), jabalina con los
//    tableritos, sellado solo en las izadas, persona ocupada, ausencias, misma cuadrilla, sin vehículo, lugares, grúa
//    ocupada, falta material, sábado de 5,5 h, semana encadenada;
//  · cambiar gente y cantidad, ajustes que se guardan, ausencias en Personal y aviso en Llenar orden, emitir 3 (números,
//    avisos, personalNombres, recordatorio de las 7 con enviarDesde), plan para la inspección, 🧠 Lo que aprende la app;
//  · igualdad con «Llenar orden» (documento y puntos al cerrar), una orden por obra y día (unaObra);
//  · el asistente: lee la sugerida, propone cambios (igual que a mano en la hoja), revisión «Está bien así» / con propuesta,
//    informe de rendimientos con proponer_rendimiento; cuadrilla y mirar no reciben estas herramientas.
const { abrir, prueba, DOM } = require('./h');
const { datos143 } = require('./datos143');
const cel = process.argv[2] === 'cel';
const W = 'https://ema-ia.mdiaz-60f.workers.dev';
(async () => {
  const c = prueba('v143' + (cel ? ' cel' : ''));
  const MOD = { cel, espera: 4500, sugerida: true, inicio: true, porPartes: true, ofPasos: true, tarjetas: true, nav: true, mtNuevo: true };
  let browser = null;
  const sesion = async (quien, op) => { const A = await abrir(Object.assign({ sesion: quien, datos: datos143(op || {}), browser }, MOD, op || {})); browser = A.browser; A.page.on('dialog', (x) => x.accept()); await A.page.waitForTimeout(800); return A; };
  const db = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('stub.db') || '{}'));
  const ver = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); return !!e && e.getBoundingClientRect().height > 0 && getComputedStyle(e).visibility !== 'hidden'; }, sel);
  const txt = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; }, sel);
  const plan = (p, f, E) => p.evaluate(([f, E]) => { const d = window.__sugerida.armar(f || undefined, E || undefined); return JSON.parse(JSON.stringify({ fecha: d.fecha, horas: d.horas, libres: d.libres, ausentes: d.ausentes, sinCalculo: d.sinCalculo, emitidas: d.emitidas.length, ordenes: d.ordenes.map((o) => ({ id: o.obraId, obra: o.obra, incluir: o.incluir, emitida: o.emitida, gente: o.gente.map((x) => x.nombre), ocupados: o.ocupados.map((x) => x.nombre), veh: o.vehiculos.map((v) => v.id), tareas: o.tareas.map((t) => ({ k: t.k, cant: t.cant, cols: t.colsTxt, porque: t.porque.join(' | '), fuente: t.rend && t.rend.fuente })), bl: o.bloqueadas.map((b) => b.k + ': ' + b.motivo), av: o.avisos.map((a) => a.n + ': ' + a.t), pts: o.pts && o.pts.total, hh: [o.hhUsadas, o.hhDisp] })) })); }, [f || null, E || null]);
  const O = (pl, id) => pl.ordenes.find((o) => o.id === id) || { tareas: [], av: [], bl: [], gente: [], ocupados: [], veh: [] };
  const T = (o, k) => o.tareas.find((t) => t.k === k);
  const limpiar = (o) => { const x = JSON.parse(JSON.stringify(o)); ['id', 'numero', 'ts', 'creado', 'creadoPor', 'editadoTs', '_ts', 'docId'].forEach((k) => delete x[k]); return x; };
  const ordenar = (x) => (Array.isArray(x) ? x.map(ordenar) : x && typeof x == 'object' ? Object.keys(x).sort().reduce((o, k) => { o[k] = ordenar(x[k]); return o; }, {}) : x);
  const igual = (a, b) => JSON.stringify(ordenar(a)) === JSON.stringify(ordenar(b));
  const nuevas = (d0, d1) => Object.keys(d1.ordenesTrabajo || {}).filter((k) => !(d0.ordenesTrabajo || {})[k]).map((k) => Object.assign({ id: k }, d1.ordenesTrabajo[k]));
  const cerrarOt = (p, id) => p.evaluate(async (id) => { window.abrirCierreOt(id); await new Promise((r) => setTimeout(r, 1500)); const ot = ordenesTrabajo.find((o) => o.id === id) || {}; document.querySelectorAll('#cierreCuerpo .cierre-qty[data-k]').forEach((i) => { const v = (ot.previsto || {})[i.dataset.k]; if (v != null) { i.value = String(v); i.dispatchEvent(new Event('input', { bubbles: true })); i.dispatchEvent(new Event('change', { bubbles: true })); } }); await new Promise((r) => setTimeout(r, 300)); const x = document.querySelector('input[name="coCierreResp"][value="no"]'); x && (x.checked = true); await guardarCierreOt(); await new Promise((r) => setTimeout(r, 2000)); }, id);
  const abrirHoja = async (p) => { await p.evaluate(() => window.__sugerida.abrir()); await p.waitForTimeout(900); };
  const emitirHoja = async (p, avisar) => { await p.click('#sgOv [data-sg="emitir"]'); await p.waitForTimeout(500); if (avisar === false) await p.evaluate(() => { document.getElementById('sgAvisar').checked = false; }); await p.click('#sgEm [data-sg="emitirsi"]'); await p.waitForTimeout(400); for (let i = 0; i < 160; i++) { await p.waitForTimeout(250); if (!(await p.evaluate(() => window.__sugerida.emitiendo() || /⏳/.test(window.__sugerida._st.msg)))) break; } await p.waitForTimeout(1200); };
  // Worker simulado (/ia, /mio, /uso)
  let n = 0;
  const usa = (name, input) => ({ id: 'msg_' + (++n), type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text: 'Me fijo.' }, { type: 'tool_use', id: 'tu_' + n, name, input }], stop_reason: 'tool_use', usage: { input_tokens: 900, output_tokens: 40 }, ema: { costoUsd: 0.01, version: 'v3-ia' } });
  const fin = (text) => ({ id: 'msg_' + (++n), type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text }], stop_reason: 'end_turn', usage: { input_tokens: 1000, output_tokens: 60 }, ema: { costoUsd: 0.02, version: 'v3-ia' } });
  async function worker(p) {
    const st = { pedidos: [], cola: [] };
    await p.route(W + '/ia', async (rt) => { let b = null; try { b = JSON.parse(rt.request().postData() || 'null'); } catch (e) { } st.pedidos.push(b); const f = st.cola.shift(); const x = typeof f === 'function' ? f(b) : f; return x ? rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(x) }) : rt.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: { tipo: 'prueba', mensaje: 'sin guion' } }) }); });
    await p.route(W + '/mio', (rt) => rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, version: 'v3-ia', habilitado: true, quedanPreguntas: 30, topePreguntas: 30 }) }));
    await p.route(W + '/uso', (rt) => rt.abort());
    return st;
  }
  const esperarIa = async (p) => { for (let i = 0; i < 100; i++) { await p.waitForTimeout(150); if (await p.evaluate(() => { const b = document.getElementById('iaEnviar'); return !!b && !b.disabled; })) return; } };

  // ================================================================= 1) el armado (oficina)
  if (!process.env.SOLO || process.env.SOLO.indexOf('1') >= 0) {
    const A = await sesion('lucia'); const p = A.page;
    const d0 = await db(p), f = await p.evaluate(() => window.__sugerida.fechaDef());
    await p.evaluate(() => window.mostrarVista('inicio')); await p.waitForTimeout(1500);
    const ini = await txt(p, '#ieSug');
    c(await ver(p, '#ieSug') && /órdenes sugeridas/.test(ini) && /PLAZA LOS ÁLAMOS/.test(ini) && /Revisar y emitir|Ver la de mañana/.test(ini), 'tarjeta del Inicio Ejecutivo: «Mañana: N órdenes sugeridas» con las obras y el botón · ' + ini.slice(0, 120));
    const pl = await plan(p);
    const p1 = O(pl, 'p1'), p2 = O(pl, 'p2'), p3 = O(pl, 'p3');
    c(pl.sinCalculo.some((x) => x.obraId === 'p4') && !pl.ordenes.some((o) => o.id === 'p4'), 'obra sin cálculo (BARRIO SAN VICENTE): no se sugiere y va a «Sin cálculo: no puedo sugerir»');
    c(p1.gente.join(',') === 'Juan Pérez,Pedro Gómez', 'misma cuadrilla hasta terminar: Los Álamos con Juan y Pedro (la de la última orden) · ' + p1.gente);
    const iz = T(p1, 'montaje_prfv');
    c(iz && iz.cant === 4 && iz.cols === 'Col 9 a Col 12' && /Quedan 4 de 12/.test(iz.porque) && /ya pasaron las 72 h/.test(iz.porque), 'izaje: las 4 que quedan, Col 9 a Col 12 (las siguientes a las de foto), con el porqué y el fraguado cumplido · ' + JSON.stringify(iz));
    c(iz && iz.fuente === 'angel' && /todo la cuadrilla, 4–5 por día con 2/.test(iz.porque), 'izaje con 2 personas: «Según Ángel: todo la cuadrilla, 4–5 por día»');
    const vi = T(p1, 'montaje_vinculo');
    c(vi && /OT-2026-134 \(se hicieron 6 de 8\)/.test(vi.porque) && vi.cols === 'Col 7 a Col 10', 'lo que quedó de ayer: el vínculo «se hicieron 6 de 8» en la OT-2026-134, columnas siguientes · ' + JSON.stringify(vi));
    c(p1.av.some((a) => /^info: Lo ideal: el equipo civil antes/.test(a)), 'sugerencia «Lo ideal: el equipo civil antes → 13 por día» (no obligatoria)');
    c(p1.av.some((a) => /Pañol: Luminaria LED 75 W \(6010\) hay 1 y la reserva R-0050 pide 4 → falta 3/.test(a)), 'falta material: la reserva contra el stock del pañol (solo aviso)');
    c(p1.veh.indexOf('vG') >= 0 && p1.veh.indexOf('vH1') >= 0, 'vehículos: la grúa para el izaje y la hidro de Juan para el vínculo en altura · ' + p1.veh);
    c(p1.pts > 0 && p1.hh[0] <= p1.hh[1], 'puntos estimados y jornada usada/disponible · ' + p1.pts + ' · ' + p1.hh);
    c(p2.bl.some((b) => /^montaje_prfv: .*hormigon.*→ fraguan hasta el .* → izaje desde el/.test(b)), 'fraguado con fecha: Las Acacias se hormigonó ayer → no se iza mañana (izaje desde …) · ' + p2.bl[0]);
    c(p2.ocupados.indexOf('Diego Luna') >= 0 && p2.av.some((a) => /Diego Luna ya está en la OT-2026-139/.test(a)), 'persona ocupada: Diego ya tiene la OT-2026-139 ese día (no se repite)');
    c(p2.gente.indexOf('Javier Olariaga') >= 0 && p2.gente.indexOf('Axel Díaz') >= 0, 'equipo civil: va a Las Acacias (izaje pendiente sin el cable a la vista) · ' + p2.gente);
    const za = T(p2, 'zanjeo'), te = T(p2, 'tendido_cable');
    c(za && za.cant === 96 && /100 m por día/.test(za.porque), 'zanja: 100 m por día según Ángel, con tope en lo que falta (96) · ' + JSON.stringify(za));
    c(te && te.cant === 149 && /zanja ya está abierta \(84 m/.test(te.porque), 'tendido: lo que hay de zanja abierta (320 × 84/180 = 149 m) · ' + (te && te.cant));
    c(p2.veh.indexOf('vT') >= 0, 'el equipo civil con transporte (Hilux)');
    const ex = T(p3, 'excavacion'), ho = T(p3, 'hormigonado');
    c(ex && ho && ex.cant === 6 && ho.cant === 6 && /mismo día/.test(ho.porque), 'pozos y hormigonado de toda la obra el mismo día (6 y 6)');
    c(p3.av.some((a) => /Pedir camión de hormigón .*6 bases \(más de 5/.test(a)), 'más de 5 bases → «Pedir camión de hormigón»');
    c(p3.av.some((a) => /No sé cuándo se hormigonaron 4 bases/.test(a)), 'fraguado sin fecha (cargadas a mano): no bloquea, avisa «No sé cuándo se hormigonaron»');
    c(p3.av.some((a) => /Cambia la cuadrilla .*Lucas: vacaciones hasta el/.test(a)) && pl.ausentes.some((x) => x.nombre === 'Lucas Vera'), 'ausencias: Lucas de vacaciones no se propone y se avisa «Cambia la cuadrilla»');
    c(p3.av.some((a) => /^rojo: Sin vehículo/.test(a)), 'sin vehículo: aviso rojo');
    c(pl.libres.some((x) => x.nombre === 'Ana Torres'), 'gente libre: Ana Torres en «Sin orden»');
    // rendimientos
    const r = await p.evaluate(() => { const S = window.__sugerida, J = 8; const m = S.rend('conexionado_tablerito', { gente: 2 }); S.probarCfg({ rend: { conexionado_tablerito: { modo: 'dicc' } } }); const d = S.rend('conexionado_tablerito', { gente: 2 }); S.probarCfg(null); return { m: m.fuente + ' ' + Math.round(m.porHH * 2 * J * 100) / 100, d: d.fuente + ' ' + Math.round(d.porHH * 2 * J * 100) / 100, txt: m.txt }; });
    c(r.m === 'medido 8' && r.d === 'dicc 16' && /3 cierres/.test(r.txt), 'rendimiento medido (3 cierres: 8 por día con 2) contra el del diccionario (16) · ' + JSON.stringify(r));
    const mz = await p.evaluate(() => { const S = window.__sugerida, pd = (x) => Math.round(x.porHH * x.gente * 8 * 100) / 100, R = (modo, g, civ) => { S.probarCfg({ izaje: { modo } }); const y = S.rend('montaje_prfv', { gente: g, horas: 8, civilListo: civ }); y.gente = g; return [y.modoIz, pd(y), y.tope]; }; const out = { todo: R('auto', 2, false), civil: R('auto', 3, true), cano2: R('cano', 2, false), cano3: R('cano', 3, true), guia: R('guia', 2, false) }; S.probarCfg(null); return out; });
    c(mz.todo[1] === 4 && mz.todo[2] === 5 && mz.civil[0] === 'civil' && mz.civil[1] === 13 && mz.cano2[1] === 6 && mz.cano3[1] === 12 && mz.guia[1] === 3, 'modos de izaje: todo 4 (tope 5) · civil 13 con 3 · caño 6 con 2 · caño 12 con 3 y civil · guía 3 · ' + JSON.stringify(mz));
    // sábado de 5,5 h
    const sab = await p.evaluate(() => { const S = window.__sugerida; let d = new Date(); while (d.getDay() !== 6) d.setDate(d.getDate() + 1); const f = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); const a = S.horasDia(f); S.probarCfg({ sabFin: '14:00' }); const b = S.horasDia(f); S.probarCfg(null); const dom = new Date(d); dom.setDate(dom.getDate() + 1); return { a, b, dom: S.horasDia(dom.toISOString().slice(0, 10)) }; });
    c(sab.a === 5.5 && sab.b === 6.5 && sab.dom === 0, 'sábado de 7:30 a 13:00 = 5,5 h (hasta las 14 = 6,5 h); domingo no · ' + JSON.stringify(sab));
    // reglas sobre cambios (sin escribir nada)
    const E1 = { [pl.fecha]: { p1: { agregar: ['conexionado_tablerito'], cant: { conexionado_tablerito: 4 } } } };
    let q = O(await plan(p, pl.fecha, E1), 'p1');
    const pat = T(q, 'pat');
    c(pat && pat.cant === 4 && /tableritos/.test(pat.porque), 'jabalina con su conexión el mismo día que los tableritos (4 con 4) · ' + JSON.stringify(pat));
    q = O(await plan(p, pl.fecha, { [pl.fecha]: { p1: { sumar: ['Javier Olariaga'] } } }), 'p1');
    const se = T(q, 'sellado_base');
    c(se && se.cant === 8 && /ya izadas/.test(se.porque), 'sellado y aplomado del civil: solo las columnas izadas (8 de 12) · ' + JSON.stringify(se));
    q = O(await plan(p, pl.fecha, { [pl.fecha]: { p1: { sumar: ['Ana Torres'], veh: ['vG'] } } }), 'p1');
    c(q.av.some((a) => /No hay lugar: van 3 y los vehículos tienen 2 lugares/.test(a)), 'lugares: no más gente que lugares (grúa de 2 con 3 personas)');
    // semana encadenada
    const sem = await p.evaluate(() => window.__sugerida.semana().map((d) => ({ f: d.fecha, p1: (d.ordenes.find((o) => o.obraId === 'p1') || { tareas: [] }).tareas.map((t) => t.k + ':' + t.cant), p3: (d.ordenes.find((o) => o.obraId === 'p3') || { tareas: [], bloqueadas: [] }), p3b: ((d.ordenes.find((o) => o.obraId === 'p3') || {}).bloqueadas || []).map((b) => b.k + ': ' + b.motivo) })));
    const izTot = sem.reduce((s, d) => s + d.p1.filter((x) => /^montaje_prfv:/.test(x)).reduce((a, x) => a + +x.split(':')[1], 0), 0);
    c(sem.length === 5 && izTot === 4 && !sem[1].p1.some((x) => /^montaje_prfv/.test(x)), 'semana encadenada: lo que se iza el primer día ya no queda para el segundo (4 en total) · ' + JSON.stringify(sem.map((d) => d.p1)));
    c(sem[1].p3b.some((b) => /^montaje_metalica: .*fraguan hasta/.test(b)), 'fraguado igual en metálica: Plaza del Sol se hormigona el primer día y al otro no se iza · ' + sem[1].p3b[0]);
    // la hoja: por obra, por persona, semana; cambiar con pocos toques
    await abrirHoja(p);
    c(await ver(p, '#sgOv .sg-card[data-sgobra="p1"]') && /Sin cálculo: no puedo sugerir/.test(await txt(p, '#sgOv')) && /Quedan 4 de 12/.test(await txt(p, '#sgOv')), 'hoja de sugeridas: una tarjeta por obra con el porqué y «Sin cálculo»');
    const k = await txt(p, '#sgOv .sg-kpi');
    c(/3 órdenes/.test(k.replace(/(\d) /g, '$1 ')) || /^3/.test(k), 'KPIs arriba: órdenes, personas, puntos, avisos · ' + k);
    await p.click('#sgOv [data-v="persona"]'); await p.waitForTimeout(400);
    c(/Juan Pérez/.test(await txt(p, '#sgOv .sg-lista')) && /Ana Torres/.test(await txt(p, '#sgOv .sg-lista')) && /Lucas Vera/.test(await txt(p, '#sgOv .sg-lista')), 'pestaña «Por persona»: quién va a dónde, libres y ausentes');
    await p.click('#sgOv [data-v="semana"]'); await p.waitForTimeout(500);
    c(/Emitir el día/.test(await txt(p, '#sgOv .sg-lista')), 'pestaña «Semana» con «Emitir el día»');
    await p.click('#sgOv [data-v="obra"]'); await p.waitForTimeout(300);
    await p.click('#sgOv .sg-card[data-sgobra="p1"] .sg-pie [data-sg="cambiar"]'); await p.waitForTimeout(400);
    const pts0 = O(await plan(p), 'p1').pts;
    await p.click('#sgEd [data-sg="sacar"][data-n="Pedro Gómez"]'); await p.waitForTimeout(400);
    let q2 = O(await plan(p), 'p1');
    c(q2.gente.join(',') === 'Juan Pérez' && q2.hh[1] === 8 && q2.pts !== pts0, 'cambiar gente: tocar a Pedro lo saca y se recalculan jornada (8 HH) y puntos · ' + q2.hh + ' · ' + q2.pts);
    await p.click('#sgEd [data-sg="sumar"][data-n="Ana Torres"]'); await p.waitForTimeout(400);
    await p.click('#sgEd [data-sg="menos"][data-k="montaje_prfv"]'); await p.waitForTimeout(400);
    q2 = O(await plan(p), 'p1');
    c(q2.gente.indexOf('Ana Torres') >= 0 && T(q2, 'montaje_prfv').cant === 3, 'sumar a un libre (＋ Ana) y − en la cantidad (izaje 4 → 3)');
    await p.click('#sgEd [data-sg="volver"]'); await p.waitForTimeout(400); await p.click('#sgEd [data-sg="x"]');
    q2 = O(await plan(p), 'p1');
    c(q2.gente.join(',') === 'Juan Pérez,Pedro Gómez' && T(q2, 'montaje_prfv').cant === 4, '«Volver a la sugerida» deja todo como estaba');
    // nada se escribió
    const d1 = await db(p);
    c(['ordenesTrabajo', 'avisosPush', 'configEquipo', 'auditoria'].every((k) => JSON.stringify(d0[k] || {}) === JSON.stringify(d1[k] || {})), 'nada se escribe en la base al abrir, mirar y cambiar la sugerida (solo con «Emitir» / «Guardar»)');
    // ajustes: se guardan con «Guardar»
    await p.click('#sgOv [data-sg="cfg"]'); await p.waitForTimeout(500);
    await p.evaluate(() => { const i = document.querySelector('#sgCfg [data-sgc="t"][data-p="sabFin"]'); i.value = '14:00'; i.dispatchEvent(new Event('change', { bubbles: true })); }); await p.waitForTimeout(400);
    const dA = await db(p);
    c(!((((dA.configEquipo || {}).baremo || {}).sugerida) || {}).sabFin, 'tocar un ajuste no guarda nada todavía');
    await p.click('#sgCfg [data-sgc="guardar"]'); await p.waitForTimeout(1200);
    const dB = await db(p), sg = (((dB.configEquipo || {}).baremo || {}).sugerida) || {};
    c(sg.sabFin === '14:00' && sg.jornada === 8 && sg.fraguado === 72 && sg.angel && sg.angel.izTodo.porDia === 4 && /Guardado/.test(await txt(p, '#sgCfgMsg')), 'ajustes que se guardan en configEquipo/baremo.sugerida (con «Guardar») · ' + JSON.stringify({ sabFin: sg.sabFin, jornada: sg.jornada }));
    await p.click('#sgCfg [data-sg="x"]'); await p.waitForTimeout(300);
    // 🧠 Lo que aprende la app
    await p.click('#sgOv [data-ap="abrir"]'); await p.waitForTimeout(600);
    const ap = await txt(p, '#apOv');
    c(/Tiempos de cada tarea/.test(ap) && /Conexionado del tablerito/.test(ap), '🧠 Lo que aprende la app › ⏱ Tiempos: lo medido por tarea (con datos, diferencia, personas y cuadrilla)');
    await p.click('#apOv [data-ap="tab"][data-v="material"]'); await p.waitForTimeout(400);
    c(/Próximamente: material real por columna y por tipo de obra/.test(await txt(p, '#apOv')), '📦 Material: lo que ya existe y «Próximamente…»');
    await p.click('#apOv [data-ap="cerrar"]'); await p.waitForTimeout(300);
    // plan para la inspección
    await p.click('#sgOv [data-sg="epec"]'); await p.waitForTimeout(400);
    await p.click('#sgEp [data-sg="epecdia"]'); await p.waitForTimeout(1500);
    const ep = await p.evaluate(() => { const h = window.hojaEMA && window.hojaEMA.actual(); return h ? { t: h.titulo, d: String(h.doc || '') } : null; });
    c(ep && /Plan de trabajo/.test(ep.t) && /PLAZA LOS ÁLAMOS/.test(ep.d) && /ID 4031/.test(ep.d) && /responsable/.test(ep.d) && !/pts|puntos|\$/.test(ep.d.replace(/<style[\s\S]*?<\/style>/g, '')), '📤 Plan para la inspección: hoja A4 con obra, ID, tareas, cuadrilla (cuántos y responsable), vehículo y horario, sin puntos ni plata');
    await p.evaluate(() => window.hojaEMA && window.hojaEMA.cerrar()); await p.waitForTimeout(300);
    // emitir las 3
    await p.evaluate(() => { window.__avisosWorkerNuevo = true; });
    const dE0 = await db(p);
    await emitirHoja(p);
    const dE1 = await db(p), nv = nuevas(dE0, dE1);
    const nums = nv.map((o) => o.numero).sort();
    c(nv.length === 3 && new Set(nums).size === 3 && nums.every((x) => /^OT-\d{4}-\d+$/.test(x)), 'emitir las 3: tres órdenes con su número OT · ' + nums);
    const o1 = nv.find((o) => o.plazaId === 'p1') || {};
    c(JSON.stringify(o1.personalNombres) === JSON.stringify(['juan perez', 'pedro gomez']) && o1.previsto && o1.previsto.montaje_prfv === 4 && o1.fecha === pl.fecha && (o1.vehiculos || []).some((v) => v.id === 'vG'), 'la orden de Los Álamos: personalNombres, tareas, fecha y la grúa · ' + JSON.stringify({ pn: o1.personalNombres, prev: o1.previsto, veh: (o1.vehiculos || []).map((v) => v.id) }));
    const av = Object.values(dE1.avisosPush || {}).filter((a) => !Object.values(dE0.avisosPush || {}).some((b) => b.ts === a.ts && b.clave === a.clave));
    const avOt = av.filter((a) => a.tipo === 'ot'), avRec = av.filter((a) => a.tipo === 'recordatorio');
    const t7 = (() => { const m = pl.fecha.match(/^(\d{4})-(\d\d)-(\d\d)$/); return Date.UTC(+m[1], +m[2] - 1, +m[3], 10, 0); })();
    c(avOt.length === 7 && avOt.some((a) => a.clave === 'juan perez'), 'aviso al celu al emitir a cada uno (7 personas) · ' + avOt.length);
    c(avRec.length === 7 && avRec.every((a) => a.enviarDesde === t7 && /^Hoy: /.test(a.cuerpo)), 'recordatorio a las 7:00 del día (enviarDesde = 7:00 de Argentina, «Hoy: obra · tareas») · ' + avRec.length + ' · ' + (avRec[0] && avRec[0].cuerpo));
    c(/Emitidas?: OT-/.test(await txt(p, '#sgOv .sg-msg')), 'la hoja dice qué órdenes salieron');
    const pl2 = await plan(p);
    c(pl2.emitidas === 3 && O(pl2, 'p1').emitida && /OT-/.test(O(pl2, 'p1').emitida.numero), 'después de emitir, la sugerida muestra las emitidas (no las vuelve a proponer)');
    await p.evaluate(() => window.__sugerida.cerrar()); await p.evaluate(() => window.mostrarVista('inicio')); await p.waitForTimeout(1600);
    c(/emitidas 3 de 3/.test(await txt(p, '#ieSug')), 'la tarjeta del Inicio queda «Emitidas 3 de 3» · ' + (await txt(p, '#ieSug')).slice(0, 80));
    // ausencias: Producción › Personal y el aviso en Llenar orden
    await p.evaluate(() => { window.mostrarVista('produccion'); const pp = document.getElementById('prodPanelPersonal'); [...document.querySelectorAll('[id^="prodPanel"]')].forEach((x) => { x.style.display = 'none'; }); pp.style.display = ''; }); await p.waitForTimeout(2200);
    c(await ver(p, '#sgPerCard') && /Ausencias/.test(await txt(p, '#sgPerCard')) && /Equipo civil/.test(await txt(p, '#sgPerCard')), 'Producción › Personal del equipo: 🗓 Ausencias, 🦺 Equipo civil y 🚚 tipo y lugares de cada vehículo');
    await p.selectOption('#sgAusP', 'Ana Torres'); await p.selectOption('#sgAusM', 'franco');
    await p.click('#sgPerCard [data-sgp="aus"]'); await p.waitForTimeout(1000);
    const dF = await db(p), aus = ((dF.configEquipo || {}).personal || {}).ausencias || [];
    c(aus.length === 2 && aus.some((a) => a.persona === 'Ana Torres' && a.motivo === 'franco'), 'ausencia agregada en configEquipo/personal.ausencias');
    await p.evaluate(() => window.__sugerida.cargarEnLlenar({ obraId: 'p3', fecha: window.__sugerida.fechaDef(), personas: ['Lucas Vera'], tareas: [] })); await p.waitForTimeout(2200);
    c(/Ausente ese día: Lucas: vacaciones/.test(await txt(p, '#sgAusAv')), 'Llenar orden avisa si eligen a alguien ausente (solo aviso)');
    c(!A.errores.length, 'sin errores de la página · ' + A.errores.slice(0, 3).join(' | '));
    await A.ctx.close();
  }

  // ================================================================= 2) igual que «Llenar orden» (documento y puntos), grúa ocupada, unaObra
  if (!process.env.SOLO || process.env.SOLO.indexOf('2') >= 0) {
    const A = await sesion('lucia'); const p = A.page, f = await p.evaluate(() => window.__sugerida.fechaDef());
    // grúa ocupada
    await p.evaluate((f) => firebase.firestore().collection('ordenesTrabajo').doc('gx').set({ numero: 'OT-2026-150', fecha: f, plazaId: 'p4', plazaNombre: 'BARRIO SAN VICENTE', personal: [{ nombre: 'Ana Torres', rol: 'Oficial' }], personalNombres: ['ana torres'], actividades: [], vehiculos: [{ id: 'vG', nombre: 'Grúa', patente: 'AA 100 GR' }], estado: 'Emitida', creado: Date.now() }), f); await p.waitForTimeout(1200);
    let q = O(await plan(p), 'p1');
    c(!T(q, 'montaje_prfv') && q.bl.some((b) => /^montaje_prfv: .*La grúa ya va a OT-2026-150/.test(b)), 'grúa ocupada: no se propone izaje y se avisa · ' + q.bl.join(' / '));
    await p.evaluate(() => firebase.firestore().collection('ordenesTrabajo').doc('gx').delete()); await p.waitForTimeout(1200);
    // por la hoja: solo Los Álamos
    await abrirHoja(p);
    await p.click('#sgOv input[data-sg="incluir"][data-obra="p2"]'); await p.waitForTimeout(300);
    await p.click('#sgOv input[data-sg="incluir"][data-obra="p3"]'); await p.waitForTimeout(300);
    const d0 = await db(p); await emitirHoja(p, false); const nx = nuevas(d0, await db(p));
    c(nx.length === 1 && nx[0].plazaId === 'p1', 'emitir solo la incluida (casilla de cada obra)');
    const avX = Object.values((await db(p)).avisosPush || {}).filter((a) => a.tipo === 'ot').length;
    c(avX === 0, '«Avisar a cada uno al celu» apagado: no sale el aviso de siempre');
    await A.ctx.close();
    // a mano en «Llenar orden», lo mismo
    const B = await sesion('lucia'); const pb = B.page;
    await pb.evaluate(async (f) => { window.mostrarVista('parte'); window.irSubOrdenes('nueva'); await new Promise((r) => setTimeout(r, 500)); window.__ordenNueva.elegirObra('p1'); const fe = document.getElementById('otFecha'); fe.value = f; fe.dispatchEvent(new Event('change', { bubbles: true })); }, f); await pb.waitForTimeout(600);
    await pb.evaluate(() => { window.__ordenNueva.sumarPersona('Juan Pérez'); window.__ordenNueva.sumarPersona('Pedro Gómez'); }); await pb.waitForTimeout(600);
    await pb.evaluate(() => { [['montaje_prfv', 4], ['montaje_vinculo', 4]].forEach(([k, n]) => { const cb = document.querySelector(`#otActividades .ot-act-check[value="${k}"]`); if (!cb.checked) cb.click(); const i = document.querySelector(`#otActividades .ot-act-prev[data-id="${k}"]`); i.value = String(n); i.dispatchEvent(new Event('input', { bubbles: true })); i.dispatchEvent(new Event('change', { bubbles: true })); }); }); await pb.waitForTimeout(500);
    await pb.evaluate(() => { const ya = window.otVehiculosElegidos(); ['vG', 'vH1'].forEach((id) => { if (ya.indexOf(id) < 0) { const b = document.querySelector(`#otVehBox [data-otveh="${id}"]`); b && b.click(); } }); window.otVehiculosElegidos().filter((id) => ['vG', 'vH1'].indexOf(id) < 0).forEach((id) => { const b = document.querySelector(`#otVehBox [data-otveh="${id}"]`); b && b.click(); }); }); await pb.waitForTimeout(500);
    await pb.evaluate(() => { const cu = document.getElementById('otCuadrilla'); cu.value = 'Juan y Pedro'; cu.dispatchEvent(new Event('input', { bubbles: true })); window.__otSinAviso = true; });
    const e0 = await db(pb); await pb.evaluate(() => window.emitirOrdenTrabajo()); await pb.waitForTimeout(1500); const ny = nuevas(e0, await db(pb));
    const X = limpiar(nx[0] || {}), Y = limpiar(ny[0] || {});
    const difs = Object.keys(Object.assign({}, X, Y)).filter((k) => JSON.stringify(ordenar(X[k])) !== JSON.stringify(ordenar(Y[k])));
    c(ny.length === 1 && igual(X, Y), 'igualdad con Llenar orden: el documento guardado es el mismo (sin id, número ni fechas de creación) · diferencias: ' + difs.map((k) => k + '=' + JSON.stringify(X[k]) + ' vs ' + JSON.stringify(Y[k])).join(' ; ').slice(0, 400));
    // los puntos al cerrar
    const A2 = await sesion('lucia'); const pa = A2.page;
    await pa.evaluate(() => { window.__sugerida.abrir(); }); await pa.waitForTimeout(800);
    await pa.click('#sgOv input[data-sg="incluir"][data-obra="p2"]'); await pa.click('#sgOv input[data-sg="incluir"][data-obra="p3"]'); await pa.waitForTimeout(300);
    const a0 = await db(pa); await emitirHoja(pa, false); const na = nuevas(a0, await db(pa))[0];
    await cerrarOt(pa, na.id); await cerrarOt(pb, ny[0].id);
    const ca = ((await db(pa)).ordenesTrabajo[na.id] || {}).cierre || {}, cb = ((await db(pb)).ordenesTrabajo[ny[0].id] || {}).cierre || {};
    c(ca.cerradoTs && cb.cerradoTs && igual(Object.assign({}, ca.puntos, { ts: 0 }), Object.assign({}, cb.puntos, { ts: 0 })) && JSON.stringify(ca.cantidades) === JSON.stringify(cb.cantidades) && ((ca.puntos || {}).total || 0) > 0, 'los puntos al cerrar dan igual por los dos caminos (sin la hora del cierre) · ' + JSON.stringify(ca.puntos && ca.puntos.porPersona));
    const sa = await pa.evaluate(() => JSON.stringify(window.saldoObra('p1').tareas)), sb = await pb.evaluate(() => JSON.stringify(window.saldoObra('p1').tareas));
    c(sa === sb, 'el avance / «Quedan» de la obra queda igual por los dos caminos');
    await A2.ctx.close(); await B.ctx.close();
    // una orden por obra y día: ya hay una de Los Álamos ese día (con Ana) → «Sumar a la OT-…»
    const U = await sesion('lucia'); const pu = U.page;
    await pu.evaluate((f) => firebase.firestore().collection('ordenesTrabajo').doc('ua').set({ numero: 'OT-2026-160', fecha: f, plazaId: 'p1', plazaNombre: 'PLAZA LOS ÁLAMOS', obraId: '4031', personal: [{ nombre: 'Ana Torres', rol: 'Oficial' }], personalNombres: ['ana torres'], actividades: ['limpieza_obra'], previsto: { limpieza_obra: 1 }, estado: 'Emitida', creado: Date.now() }), f); await pu.waitForTimeout(1200);
    await abrirHoja(pu);
    c(/Ya hay OT-2026-160 para esta obra ese día/.test(await txt(pu, '#sgOv .sg-card[data-sgobra="p1"]')), 'la sugerida avisa que ya hay una orden de esa obra ese día');
    await pu.click('#sgOv input[data-sg="incluir"][data-obra="p2"]'); await pu.click('#sgOv input[data-sg="incluir"][data-obra="p3"]'); await pu.waitForTimeout(300);
    await pu.click('#sgOv [data-sg="emitir"]'); await pu.waitForTimeout(400); await pu.click('#sgEm [data-sg="emitirsi"]');
    let pop = false; for (let i = 0; i < 40 && !pop; i++) { await pu.waitForTimeout(250); pop = await ver(pu, '#uoPop'); }
    c(pop, 'al emitir aparece «Ya hay una orden para … ese día» (unaObra), arriba de la hoja');
    if (pop) await pu.click('#uoPop [data-uo="sumar"]');
    await pu.waitForTimeout(2500);
    const ua = ((await db(pu)).ordenesTrabajo || {}).ua || {};
    c((ua.personalNombres || []).indexOf('juan perez') >= 0 && (ua.previsto || {}).montaje_prfv === 4 && /sumad/i.test(await txt(pu, '#sgOv .sg-msg')), '«Sumar a la OT-2026-160»: la gente y las tareas van a esa orden · ' + JSON.stringify(ua.personalNombres));
    await U.ctx.close();
  }

  // ================================================================= 3) el asistente encima (ordenes_sugeridas, proponer, revisar, informe)
  if (!process.env.SOLO || process.env.SOLO.indexOf('3') >= 0) {
    const IA = Object.assign({}, MOD, { iaPro: true, https: true });
    const camb = [{ tipo: 'sacar_persona', obra: 'Las Acacias', persona: 'Raúl' }, { tipo: 'excluir_obra', obra: 'Plaza del Sol' }, { tipo: 'cantidad', obra: 'Los Álamos', tarea: 'Montaje de columna PRFV', cantidad: 3 }];
    const A = await abrir(Object.assign({ sesion: 'lucia', datos: datos143(), browser }, IA)); const p = A.page; p.on('dialog', (x) => x.accept());
    const st = await worker(p); await p.waitForTimeout(800);
    await p.evaluate(() => window.__asistenteAbrir()); await p.waitForTimeout(1200);
    const chips = await p.evaluate(() => [...document.querySelectorAll('#iaChips .chip')].map((x) => x.textContent));
    c(chips.some((x) => /Órdenes de mañana/.test(x)), 'chip «📋 Órdenes de mañana» en el asistente');
    let tr1 = '';
    st.cola.push(usa('ordenes_sugeridas', {}), (b) => { tr1 = JSON.stringify(b.messages[b.messages.length - 1]); return usa('proponer_ordenes_sugeridas', { cambios: camb }); }, fin('Te dejé la propuesta: confirmala.'));
    await p.fill('#iaTxt', 'armame las órdenes de mañana, sacá a Raúl de Las Acacias, no mandes Plaza del Sol y poné 3 izajes en Los Álamos'); await p.click('#iaEnviar'); await p.waitForTimeout(300); await esperarIa(p);
    const herr = (st.pedidos[0] && st.pedidos[0].tools || []).map((t) => t.name);
    c(herr.indexOf('ordenes_sugeridas') >= 0 && herr.indexOf('proponer_ordenes_sugeridas') >= 0 && herr.indexOf('proponer_rendimiento') >= 0, 'oficina recibe ordenes_sugeridas, proponer_ordenes_sugeridas y proponer_rendimiento');
    c(/PLAZA LOS ÁLAMOS/.test(tr1) && /Quedan 4 de 12/.test(tr1), 'ordenes_sugeridas le pasa al modelo lo que calcula el mismo motor de la hoja (obras, tareas, porqué)');
    const card = await txt(p, '#iaChat .ia-conf:last-of-type');
    c(/Órdenes sugeridas/.test(card) && /Sí, emitir las 2/.test(card) && /Abrir la hoja/.test(card) && /Raúl Sosa/.test(card), 'tarjeta antes → después con «Sí, emitir las 2» / «Abrir la hoja» / «No» · ' + card.slice(0, 160));
    const d0 = await db(p);
    await p.click('#iaChat .ia-conf:last-of-type [data-iasi]');
    for (let i = 0; i < 60; i++) { await p.waitForTimeout(250); if (/Emitidas?:/.test(await txt(p, '#iaChat .ia-conf:last-of-type'))) break; }
    const nIA = nuevas(d0, await db(p));
    c(nIA.length === 2 && /Emitidas: OT-/.test(await txt(p, '#iaChat .ia-conf:last-of-type')), 'con el «Sí» se emiten por «Llenar orden» (2 órdenes)');
    await A.ctx.close();
    // lo mismo a mano en la hoja → mismo resultado
    const B = await sesion('lucia'); const pb = B.page;
    await abrirHoja(pb);
    await pb.click('#sgOv .sg-card[data-sgobra="p2"] .sg-pie [data-sg="cambiar"]'); await pb.waitForTimeout(300); await pb.click('#sgEd [data-sg="sacar"][data-n="Raúl Sosa"]'); await pb.waitForTimeout(600); await pb.click('#sgEd [data-sg="x"]');
    await pb.click('#sgOv input[data-sg="incluir"][data-obra="p3"]'); await pb.waitForTimeout(300);
    await pb.click('#sgOv .sg-card[data-sgobra="p1"] .sg-pie [data-sg="cambiar"]'); await pb.waitForTimeout(300); await pb.click('#sgEd [data-sg="menos"][data-k="montaje_prfv"]'); await pb.waitForTimeout(600); await pb.click('#sgEd [data-sg="x"]');
    await pb.waitForTimeout(600);
    const qh = await plan(pb);
    c(T(O(qh, 'p1'), 'montaje_prfv').cant === 3 && O(qh, 'p2').gente.indexOf('Raúl Sosa') < 0 && !O(qh, 'p3').incluir, 'a mano en la hoja: los mismos tres cambios quedaron aplicados');
    const e0 = await db(pb); await emitirHoja(pb); const nH = nuevas(e0, await db(pb));
    const por = (l, id) => limpiar(l.find((o) => o.plazaId === id) || {});
    const dif = (a, b) => Object.keys(Object.assign({}, a, b)).filter((k) => JSON.stringify(ordenar(a[k])) !== JSON.stringify(ordenar(b[k]))).map((k) => k + '=' + JSON.stringify(a[k]) + ' vs ' + JSON.stringify(b[k])).join(' ; ').slice(0, 600);
    c(nH.length === 2 && igual(por(nIA, 'p1'), por(nH, 'p1')) && igual(por(nIA, 'p2'), por(nH, 'p2')), 'lo que propone el asistente sale igual que haciendo los mismos cambios a mano en la hoja · ' + nH.length + ' ' + dif(por(nIA, 'p1'), por(nH, 'p1')) + ' | ' + dif(por(nIA, 'p2'), por(nH, 'p2')));
    await B.ctx.close();
    // revisar con el asistente: «Está bien así» y con una propuesta que se acepta
    const R = await abrir(Object.assign({ sesion: 'lucia', datos: datos143(), browser }, IA)); const pr = R.page; pr.on('dialog', (x) => x.accept());
    const sr = await worker(pr); await pr.waitForTimeout(800);
    await abrirHoja(pr);
    sr.cola.push(fin('Está bien así.'));
    await pr.click('#sgOv [data-sg="iarev"]'); await pr.waitForTimeout(1500); await esperarIa(pr);
    const b0 = sr.pedidos[0] || {}, u0 = JSON.stringify((b0.messages || []).slice(-1));
    c(sr.pedidos.length === 1 && /\[Orden sugerida\]/.test(u0) && (b0.ema || {}).tipo === 'pregunta' && /Está bien así/.test(await txt(pr, '#iaChat')), '«✨ Revisar con el asistente»: un solo pedido (pregunta) con la sugerida armada → «Está bien así»');
    sr.cola.push(usa('proponer_ordenes_sugeridas', { cambios: [{ tipo: 'excluir_obra', obra: 'Plaza del Sol' }], motivo: 'Sin vehículo' }), fin('Plaza del Sol no tiene vehículo: la saco.'));
    await pr.evaluate(() => window.__asistente.revisarSugerida(window.__sugerida.fechaDef())); await pr.waitForTimeout(800); await esperarIa(pr);
    const dr0 = await db(pr);
    await pr.click('#iaChat .ia-conf:last-of-type [data-iasi]');
    for (let i = 0; i < 60; i++) { await pr.waitForTimeout(250); if (/Emitidas?:/.test(await txt(pr, '#iaChat .ia-conf:last-of-type'))) break; }
    const nr = nuevas(dr0, await db(pr));
    c(nr.length === 2 && !nr.some((o) => o.plazaId === 'p3'), 'revisión con una propuesta (sacar Plaza del Sol) que se acepta: salen las otras 2');
    // informe de rendimientos → proponer_rendimiento → Sí → se guarda en Ajustes
    sr.cola.push(usa('proponer_rendimiento', { tarea: 'Conexionado del tablerito en la columna', por_dia: 8, motivo: '3 cierres dan 8 por día con 2' }), fin('Conviene usar 8 por día.'));
    await pr.evaluate(() => window.__asistente.informeRendimientos()); await pr.waitForTimeout(800); await esperarIa(pr);
    const ui = JSON.stringify((sr.pedidos[sr.pedidos.length - 2] || {}).messages || []);
    c(/\[Tiempos\]/.test(ui) && /Conexionado del tablerito/.test(ui) && !/valorHora|\$ /.test(ui), '«✨ Informe del asistente» le manda los tiempos ya agregados, sin plata');
    await pr.click('#iaChat .ia-conf:last-of-type [data-iasi]'); await pr.waitForTimeout(1500);
    const rg = ((((await db(pr)).configEquipo || {}).baremo || {}).sugerida || {}).rend || {};
    c(rg.conexionado_tablerito && rg.conexionado_tablerito.mano === 8 && rg.conexionado_tablerito.modo === 'mano', 'con el «Sí» el rendimiento propuesto se guarda en Ajustes de la sugerida');
    await R.ctx.close();
    // cuadrilla y mirar: no reciben estas herramientas
    for (const quien of ['pedro', 'mir']) {
      const Q = await abrir(Object.assign({ sesion: quien, datos: datos143(), browser }, IA)); const pq = Q.page;
      await worker(pq); await pq.waitForTimeout(800);
      await pq.evaluate(() => window.__asistenteAbrir && window.__asistenteAbrir()); await pq.waitForTimeout(1500);
      const l = await pq.evaluate(() => window.__asistente ? window.__asistente.alcance().tools(window.__asistente.TOOLS).map((t) => t.name) : null);
      c(Array.isArray(l) && !l.some((x) => /sugeridas|rendimiento/.test(x)), `${quien === 'pedro' ? 'cuadrilla' : 'solo mirar'}: no recibe ordenes_sugeridas ni las propuestas`);
      c(!(await pq.evaluate(() => window.__sugerida.puede())) && !(await ver(pq, '#sgTab')), `${quien === 'pedro' ? 'cuadrilla' : 'solo mirar'}: no ve la orden sugerida`);
      await Q.ctx.close();
    }
  }
  await browser.close();
  process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
