// v141 · El Asistente por rol y los topes del mes.
//  · alcance(): herramientas que recibe cada rol (lista cerrada) y resultados limpios ANTES de ir al modelo:
//    cuadrilla pregunta el valor hora → la herramienta no devuelve el dato; pañol no ve sueldos pero sí precios de materiales;
//    mirar solo lo general; oficina ve sueldos. System con lo que no ve («Eso no lo puedo ver con tu usuario…»).
//  · Modelo por rol (pañol/cuadrilla/operario/mirar → Sonnet 5.5 effort low), ema.tipo en cada pedido (pregunta/remito).
//  · Cartel de tope (no error rojo), chip «Te quedan N preguntas hoy» (/mio y ema.uso), ⚙ Límites guarda (admin),
//    «Gastado este mes» (/uso), aviso a Administración al freno del mes, aviso del Worker viejo, remito con tope.
const { abrir, prueba, baseDatos, DOM } = require('./h');
const cel = process.argv[2] === 'cel';
const W = 'https://ema-ia.mdiaz-60f.workers.dev';
const CAP = process.env.CAP || '';
const NO_VE = 'Eso no lo puedo ver con tu usuario, preguntale a la oficina.';
function datos() {
  const d = baseDatos(), ahora = Date.now(), hoy = d.hoy;
  const U = d.db.usuarios;
  U.uRaul = { email: 'raul@' + DOM, usuario: 'raul', nombre: 'Raúl Díaz', rol: 'cuadrilla', persona: 'Raúl Díaz', personaClave: 'raul diaz', activo: true };
  U.uPan = { email: 'pan@' + DOM, usuario: 'pan', nombre: 'Pablo Pañol', rol: 'panol', activo: true };
  U.uMir = { email: 'mir@' + DOM, usuario: 'mir', nombre: 'Mirta Mira', rol: 'mirar', activo: true };
  U.uOfi = { email: 'ofi@' + DOM, usuario: 'ofi', nombre: 'Olga Oficina', rol: 'oficina', activo: true };
  ['raul', 'pan', 'mir', 'ofi'].forEach((u, i) => { d.cuentas[u + '@' + DOM] = { pass: 'clave123', uid: ['uRaul', 'uPan', 'uMir', 'uOfi'][i] }; });
  d.db.configEquipo.personal = { lista: [{ nombre: 'Juan Pérez', rol: 'Oficial', activo: true, valorHora: 5123 }, { nombre: 'Pedro Gómez', rol: 'Ayudante', activo: true, valorHora: 4321 }, { nombre: 'Raúl Díaz', rol: 'Oficial', activo: true, valorHora: 5555 }] };
  Object.assign(d.db.avanceObras.p1, { lat: -31.41, lng: -64.18 });
  d.db.avanceObras.p2 = { nombre: 'PLAZA GEORG NICOLAI', obraId: '4026', barrio: 'Alta Córdoba', direccion: 'Calle 1', lat: -31.39, lng: -64.19, creado: ahora };
  d.db.ordenesTrabajo.ot5 = { numero: 'OT-2026-005', fecha: hoy, plazaId: 'p2', plazaNombre: 'PLAZA GEORG NICOLAI', obraId: '4026', personal: [{ nombre: 'Raúl Díaz', rol: 'Oficial' }, { nombre: 'Pedro Gómez', rol: 'Ayudante' }], personalNombres: ['raul diaz', 'pedro gomez'], actividades: ['zanjeo'], previsto: { zanjeo: 10 }, actividadesManuales: [], estado: 'Emitida', creado: ahora };
  d.db.catalogoProductos = { 3017: { codigo: 3017, desc: 'Fusible cilíndrico 10×38 2 A', un: 'Un.', costo: 777, activo: true } };
  d.db.movimientos = { m1: { tipo: 'entrada', codigo: 3017, desc: 'Fusible cilíndrico 10×38 2 A', un: 'Un.', cantidad: 10, fecha: hoy, ts: ahora - 5e5, usuario: 'admin@x', precioUnit: 777 } };
  d.db.gastosObra = { g1: { plazaId: 'p1', fecha: hoy, categoria: 'Combustible', monto: 99999, detalle: 'nafta' } };
  return d;
}
(async () => {
  const c = prueba('v141' + (cel ? ' cel' : ''));
  const MOD = { cel, espera: 4500, iaPro: true, nav: true, inicio: true, mtNuevo: true, ofPasos: true, tarjetas: true, porPartes: true, https: true };
  const d0 = datos();
  let browser = null;
  const sufijo = cel ? '_cel' : '_pc';
  const foto = async (pg, nom, ms) => { if (CAP) { await pg.waitForTimeout(ms == null ? 700 : ms); await pg.screenshot({ path: CAP + '/' + nom + sufijo + '.png' }); } };
  // Worker simulado: /ia (guion), /mio y /uso
  function worker(p, st) {
    st.pedidos = []; st.cola = []; st.mio = null; st.uso = null; st.usoPedidos = 0; st.mioPedidos = 0;
    return Promise.all([
      p.route(W + '/ia', async (rt) => {
        let b = null; try { b = JSON.parse(rt.request().postData() || 'null'); } catch (e) { }
        st.pedidos.push(b);
        const f = st.cola.shift(), x = typeof f === 'function' ? f(b) : f;
        if (!x) return rt.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: { tipo: 'prueba', mensaje: 'sin guion' } }) });
        if (x.__status) return rt.fulfill({ status: x.__status, contentType: 'application/json', body: JSON.stringify(x.body) });
        return rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(x) });
      }),
      p.route(W + '/mio', (rt) => { st.mioPedidos++; return st.mio ? rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(st.mio) }) : rt.abort(); }),
      p.route(W + '/uso', (rt) => { st.usoPedidos++; return st.uso ? rt.fulfill({ status: st.uso.__status || 200, contentType: 'application/json', body: JSON.stringify(st.uso.body || st.uso) }) : rt.abort(); })
    ]);
  }
  let n = 0;
  const usa = (name, input, uso) => ({ id: 'msg_' + (++n), type: 'message', role: 'assistant', model: 'claude-sonnet-5-5', content: [{ type: 'text', text: 'Me fijo.' }, { type: 'tool_use', id: 'tu_' + n, name, input }], stop_reason: 'tool_use', usage: { input_tokens: 900, output_tokens: 40 }, ema: Object.assign({ costoUsd: 0.01, version: 'v3-ia' }, uso || {}) });
  const fin = (text, ema) => ({ id: 'msg_' + (++n), type: 'message', role: 'assistant', model: 'claude-sonnet-5-5', content: [{ type: 'text', text }], stop_reason: 'end_turn', usage: { input_tokens: 1000, output_tokens: 60 }, ema: Object.assign({ costoUsd: 0.02, version: 'v3-ia' }, ema || {}) });
  const esperarLibre = async (pg) => { for (let i = 0; i < 80; i++) { await pg.waitForTimeout(150); const ok = await pg.evaluate(() => { const b = document.getElementById('iaEnviar'); return !!b && !b.disabled; }); if (ok) return; } };
  async function preguntar(p, st, t, guion) { st.cola.push(...guion); const n0 = st.pedidos.length; await p.fill('#iaTxt', t); await p.click('#iaEnviar'); await p.waitForTimeout(250); await esperarLibre(p); return st.pedidos.slice(n0); }
  const herrs = (b) => (b && b.tools ? b.tools.map((t) => t.name) : []);
  const sysTxt = (b) => (b && b.system ? b.system.map((s) => s.text).join('\n') : '');
  const ej = (p, nom, inp) => p.evaluate(async ([a, b]) => { const r = await window.__asistente.ejecutar(a, b); return { err: r && r.err || '', r: r && r.r, s: JSON.stringify(r && r.r || null) }; }, [nom, inp || {}]);
  async function sesion(quien) {
    const A = await abrir(Object.assign({ sesion: quien, datos: d0, browser }, MOD)); browser = A.browser;
    const p = A.page; p.on('dialog', (x) => x.accept());
    const st = {}; await worker(p, st);
    await p.waitForTimeout(1200);
    return { p, st, A };
  }

  // ================================================================= 1) CUADRILLA
  {
    const { p, st, A } = await sesion('raul');
    st.mio = { ok: true, version: 'v3-ia', rol: 'cuadrilla', habilitado: true, pausado: false, nivel: '', preguntasHoy: 1, topePreguntas: 10, quedanPreguntas: 9, remitosHoy: 0, topeRemitos: 0, quedanRemitos: 0 };
    let r = await p.evaluate(() => { const b = document.getElementById('iaFab'); return { vis: !!(b && !b.hidden && b.getBoundingClientRect().width > 0), roles: window.__iaRoles() }; });
    c(r.vis && r.roles.length === 6, 'de entrada el asistente lo ven todos los roles: la cuadrilla tiene la lengüeta · ' + JSON.stringify(r));
    await p.evaluate(() => window.__asistenteAbrir()); await p.waitForTimeout(900);
    r = await p.evaluate(() => { const q = document.getElementById('iaQueda'); return { nivel: window.__asistente.nivelRol(), vis: !!q && !q.hidden && q.getBoundingClientRect().height > 0, t: q ? q.textContent : '', chips: [...document.querySelectorAll('#iaChips .chip')].map((x) => x.textContent) }; });
    c(r.nivel === 'crew' && r.vis && r.t === 'Te quedan 9 preguntas hoy' && st.mioPedidos >= 1, 'al abrir el panel pide /mio y muestra el chip «Te quedan 9 preguntas hoy» · ' + JSON.stringify(r));
    c(r.chips.some((x) => /Mis tareas de hoy/.test(x)) && !r.chips.some((x) => /Armar una orden|Puntos de la quincena/.test(x)), 'los atajos son los de la cuadrilla (sin «Armar una orden») · ' + JSON.stringify(r.chips));
    await foto(p, 'v141_queda');
    // la cuadrilla pregunta el valor hora: el modelo intenta leer la nómina y la app no devuelve el dato
    let ps = await preguntar(p, st, '¿cuánto es mi valor hora?', [usa('consultar', { coleccion: 'personal' }), usa('personal', { texto: 'raul' }), fin(NO_VE, { uso: { rol: 'cuadrilla', tipo: 'pregunta', preguntasHoy: 3, topePreguntas: 10, quedanPreguntas: 7, remitosHoy: 0, topeRemitos: 0 } })]);
    const b0 = ps[0], tr1 = ps[1] && ps[1].messages[ps[1].messages.length - 1].content[0], tr2 = ps[2] && ps[2].messages[ps[2].messages.length - 1].content[0];
    const H = herrs(b0);
    c(H.slice().sort().join() === 'abrir,buscar_obra,como_se_hace,datos_obra,ordenes,puntos,stock,ubicacion_obra,ver_plano', 'la cuadrilla recibe solo sus herramientas (sin personal, consultar, gastos, ni proponer_*) · ' + H.join());
    c(/CUADRILLA/.test(sysTxt(b0)) && sysTxt(b0).indexOf(NO_VE) >= 0, 'el system dice qué no puede ver y la respuesta exacta «' + NO_VE + '»');
    c(b0 && b0.model === 'claude-sonnet-5-5' && b0.output_config.effort === 'low' && b0.ema && b0.ema.tipo === 'pregunta', 'cuadrilla: Sonnet 5.5 con effort «low» y ema.tipo «pregunta» · ' + JSON.stringify(b0 && [b0.model, b0.output_config, b0.ema]));
    c(tr1 && tr1.is_error && /no lo puedo ver/.test(tr1.content) && !/5555|5123|valorHora/.test(JSON.stringify(ps[1].messages)) && tr2 && tr2.is_error && !/5555|valorHora/.test(JSON.stringify(ps[2].messages)), 'si el modelo pide la nómina (consultar o personal) la app contesta «no lo puedo ver» y el valor hora NUNCA va al modelo · ' + JSON.stringify([tr1 && tr1.content, tr2 && tr2.content]));
    r = await p.evaluate(() => ({ t: (document.getElementById('iaQueda') || {}).textContent, ult: [...document.querySelectorAll('#iaChat .ia-b.ia')].pop().textContent }));
    c(r.t === 'Te quedan 7 preguntas hoy' && r.ult.indexOf('Eso no lo puedo ver con tu usuario') >= 0, 'contesta «Eso no lo puedo ver…» y el chip se actualiza con lo que dice el Worker (7) · ' + JSON.stringify(r));
    await foto(p, 'v141_cuadrilla_no_ve');
    // ejecutar directo: lo suyo sí, lo ajeno no
    await p.evaluate(() => { try { ordenesTrabajo.push({ id: 'otX', numero: 'OT-2026-099', fecha: new Date().toISOString().slice(0, 10), plazaId: 'p1', plazaNombre: 'Plaza San Martín', personal: [{ nombre: 'Juan Pérez', rol: 'Oficial' }], personalNombres: ['juan perez'], actividades: [], actividadesManuales: [{ actividad: 'Otra cosa', detalle: '' }], estado: 'Emitida' }); } catch (e) { } });
    let x = await ej(p, 'ordenes', {});
    c(!x.err && x.r.ordenes.length === 1 && x.r.ordenes[0].numero === 'OT-2026-005' && !('gente' in x.r.ordenes[0]) && x.r.ordenes[0].conVos === 'vos y 1 más' && !/Pedro|Juan/.test(x.s), 'ordenes: solo las suyas (aunque haya otras en memoria) y sin los nombres de los demás · ' + x.s.slice(0, 220));
    x = await ej(p, 'stock', { texto: '3017' });
    c(!x.err && /3017/.test(x.s) && !/777|costo|precio/.test(x.s), 'stock: ve el material y la cantidad, sin precios ni costos · ' + x.s.slice(0, 200));
    x = await ej(p, 'datos_obra', { obraId: 'p1' });
    const x2 = await ej(p, 'ubicacion_obra', { obraId: 'georg' });
    c(/no lo puedo ver/.test(x.err) && !x2.err && /maps\.google/.test(x2.s), 'obra ajena: «no lo puedo ver»; la de su orden: le pasa cómo llegar · ' + JSON.stringify([x.err, x2.s.slice(0, 80)]));
    x = await ej(p, 'puntos', {});
    c(!x.err && 'tusPuntos' in x.r && !('ranking' in x.r) && !/Pedro|Juan/.test(x.s), 'puntos: solo los suyos (sin el ranking de los demás) · ' + x.s);
    x = await ej(p, 'como_se_hace', { texto: 'puesta a tierra jabalina' });
    c(!x.err && x.r.encontrados >= 1 && /jabalina/i.test(x.s), '«cómo se hace»: busca en las guías y en Normas · ' + x.s.slice(0, 160));
    x = await ej(p, 'consultar', { coleccion: 'gastos' });
    c(x.err === NO_VE, 'consultar gastos: «' + NO_VE + '»');
    // cartel de tope (el Worker corta: tope_dia)
    st.cola.push({ __status: 429, body: { error: { tipo: 'tope_dia', mensaje: 'Llegaste a tus 10 preguntas de hoy. Mañana se renuevan.' } } });
    await p.fill('#iaTxt', '¿y mañana qué hago?'); await p.click('#iaEnviar'); await p.waitForTimeout(300); await esperarLibre(p);
    r = await p.evaluate(() => { const t = [...document.querySelectorAll('#iaChat .ia-tope')].pop(), q = document.getElementById('iaQueda'); return { hay: !!t, tx: t ? t.textContent.replace(/\s+/g, ' ') : '', mal: [...document.querySelectorAll('#iaChat .ia-b.mal')].length, chip: q.textContent, chip0: q.classList.contains('ia-queda-0') }; });
    c(r.hay && /Por hoy, listo/.test(r.tx) && /Llegaste a tus 10 preguntas de hoy/.test(r.tx) && r.mal === 0 && r.chip === 'No te quedan preguntas hoy' && r.chip0, 'tope del día: cartel lindo (no error rojo) y el chip pasa a «No te quedan preguntas hoy» · ' + JSON.stringify(r));
    await foto(p, 'v141_tope');
    // freno del mes: la respuesta trae avisar → aviso a Administración (busca a los admin en la base)
    const av0 = await p.evaluate(() => Object.keys(window.__stubDB().avisosPush || {}).length);
    await p.evaluate(() => { window.__iaUso.poner({ costoUsd: 0.01, version: 'v3-ia', uso: { rol: 'cuadrilla', tipo: 'pregunta', quedanPreguntas: 1, topePreguntas: 10 }, freno: { nivel: 'pausa', avisar: true, gastoMes: 80.02, tope: 100, pausa: 80, corte: 95 } }); });
    await p.waitForTimeout(1200);
    r = await p.evaluate(() => Object.values(window.__stubDB().avisosPush || {}).filter((a) => a.tipo === 'ia_freno').map((a) => [a.email, a.titulo, a.cuerpo]));
    c(r.length === 1 && r[0][0] === 'admin@' + 'ema-alumbrado.app' && /80,02/.test(r[0][2]) && /pausa/.test(r[0][2]), 'al llegar al freno del mes se le avisa al celular a Administración (una vez) · ' + JSON.stringify(r));
    await p.evaluate(() => { window.__iaUso.poner({ costoUsd: 0.01, version: 'v3-ia', uso: { rol: 'cuadrilla', tipo: 'pregunta' }, freno: { nivel: 'pausa', avisar: true, gastoMes: 81, tope: 100, corte: 95 } }); });
    await p.waitForTimeout(600);
    r = await p.evaluate(() => Object.values(window.__stubDB().avisosPush || {}).filter((a) => a.tipo === 'ia_freno').length);
    c(r === 1, 'el aviso del freno no se repite en el mismo mes · ' + r);
    c(A.errores.length === 0, 'sin errores de JavaScript · ' + JSON.stringify(A.errores).slice(0, 300));
    await p.close();
  }

  // ================================================================= 2) PAÑOL
  {
    const { p, st, A } = await sesion('pan');
    await p.evaluate(() => window.__asistenteAbrir()); await p.waitForTimeout(800);
    const ps = await preguntar(p, st, '¿cuánto hay de fusibles?', [fin('Hay 10.')]);
    const H = herrs(ps[0]);
    c(H.indexOf('stock') >= 0 && H.indexOf('proponer_movimiento_panol') >= 0 && H.indexOf('consultar') >= 0 && ['personal', 'puntos', 'obra_completa', 'proponer_orden', 'ordenes'].every((h) => H.indexOf(h) < 0), 'pañol: recibe las del pañol (stock, consultar, movimientos) y no personal, puntos, obra_completa ni órdenes · ' + H.join());
    const cons = ps[0].tools.find((t) => t.name === 'consultar');
    c(cons && cons.input_schema.properties.coleccion.enum.join() === 'obras,catalogo,movimientos,reservas,herramientas,herramientasMov,calculos', 'pañol: consultar solo ofrece las colecciones del pañol y las obras · ' + (cons && cons.input_schema.properties.coleccion.enum.join()));
    c(ps[0].model === 'claude-sonnet-5-5' && ps[0].output_config.effort === 'low' && /PAÑOL/.test(sysTxt(ps[0])), 'pañol: Sonnet 5.5 effort low y el system con lo que no ve');
    let x = await ej(p, 'consultar', { coleccion: 'personal' });
    const x2 = await ej(p, 'consultar', { coleccion: 'catalogo', texto: '3017' });
    const x3 = await ej(p, 'consultar', { coleccion: 'movimientos' });
    c(x.err === NO_VE && !x2.err && /"costo":777/.test(x2.s) && /"precioUnit":777/.test(x3.s), 'pañol no ve la nómina (sueldos) pero SÍ los precios de materiales (catálogo y movimientos) · ' + JSON.stringify([x.err, x2.s.slice(0, 120)]));
    x = await ej(p, 'consultar', { coleccion: 'precios' }); const xg = await ej(p, 'consultar', { coleccion: 'gastos' });
    c(x.err === NO_VE && xg.err === NO_VE, 'pañol: precios del itemizado y gastos → «no lo puedo ver»');
    x = await ej(p, 'armar_pdf', { tipo: 'puntos' });
    c(x.err === NO_VE, 'pañol: armar_pdf solo de stock, compras, comprobantes y reservas');
    // remito: ema.tipo «remito» y cartel si el Worker dice tope_remitos
    st.cola.push({ __status: 429, body: { error: { tipo: 'tope_remitos', mensaje: 'Llegaste a tus 40 remitos de hoy. Mañana se renuevan.' } } });
    const n0 = st.pedidos.length;
    await p.evaluate(async () => {
      const cv = document.createElement('canvas'); cv.width = 400; cv.height = 300; const g = cv.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, 400, 300); g.fillStyle = '#000'; g.fillText('REMITO 0001-123', 20, 40);
      const bl = await new Promise((ok) => cv.toBlob(ok, 'image/jpeg', 0.8));
      window.__remitoFoto.abrir(); await new Promise((ok) => setTimeout(ok, 300));
      window.__remitoFoto.conArchivo(new File([bl], 'remito.jpg', { type: 'image/jpeg' }));
    });
    await p.waitForTimeout(2500);
    const rb = st.pedidos[n0];
    const r = await p.evaluate(() => { const o = document.getElementById('rfOv'); return o ? o.textContent.replace(/\s+/g, ' ') : ''; });
    c(rb && rb.ema && rb.ema.tipo === 'remito' && rb.model === 'claude-opus-5-5' && /Llegaste a tus 40 remitos de hoy/.test(r) && /a mano/.test(r), 'remito: va con Opus y ema.tipo «remito»; con el tope el cartel dice «Llegaste a tus 40 remitos…» y ofrece cargarlo a mano · ' + JSON.stringify([rb && rb.ema, rb && rb.model, r.slice(0, 160)]));
    c(A.errores.length === 0, 'sin errores de JavaScript · ' + JSON.stringify(A.errores).slice(0, 300));
    await p.close();
  }

  // ================================================================= 3) SOLO MIRAR
  {
    const { p, st, A } = await sesion('mir');
    await p.evaluate(() => window.__asistenteAbrir()); await p.waitForTimeout(800);
    const ps = await preguntar(p, st, '¿cómo viene georg?', [usa('datos_obra', { obraId: 'georg' }), fin('Va bien.')]);
    const H = herrs(ps[0]), tr = ps[1] && JSON.parse(ps[1].messages[ps[1].messages.length - 1].content[0].content);
    c(H.slice().sort().join() === 'abrir,buscar_obra,como_se_hace,datos_obra,ubicacion_obra', 'solo mirar: preguntas generales (obras, ubicación, cómo se hace) · ' + H.join());
    c(tr && tr.nombre === 'PLAZA GEORG NICOLAI' && 'avancePct' in tr && !('material' in tr) && !('ordenesAbiertas' in tr) && !('tareasQueFaltan' in tr), 'solo mirar: datos de la obra con lo general (avance, ubicación), sin material ni órdenes · ' + JSON.stringify(Object.keys(tr || {})));
    let x = await ej(p, 'stock', { texto: '3017' }); const x2 = await ej(p, 'ordenes', {});
    c(x.err === NO_VE && x2.err === NO_VE, 'solo mirar: pañol y órdenes → «no lo puedo ver»');
    c(/SOLO MIRAR/.test(sysTxt(ps[0])) && ps[0].model === 'claude-sonnet-5-5', 'solo mirar: system propio y Sonnet');
    c(A.errores.length === 0, 'sin errores de JavaScript · ' + JSON.stringify(A.errores).slice(0, 300));
    await p.close();
  }

  // ================================================================= 4) OFICINA
  {
    const { p, st, A } = await sesion('ofi');
    st.uso = { ok: true, version: 'v3-ia', mes: '2026-11', gastoMes: 23.4, tope: 100, pausa: 80, corte: 95, nivel: '', partes: { preguntas: 15.1, remitos: 6.3, supervisor: 2 }, personas: [] };
    await p.evaluate(() => window.__asistenteAbrir()); await p.waitForTimeout(800);
    const ps = await preguntar(p, st, '¿cuánto cobra por hora Juan?', [usa('consultar', { coleccion: 'personal' }), fin('Juan: $ 5.123 la hora.')]);
    const H = herrs(ps[0]), tr = ps[1] && ps[1].messages[ps[1].messages.length - 1].content[0];
    c(['personal', 'puntos', 'consultar', 'proponer_orden', 'obra_completa', 'como_se_hace'].every((h) => H.indexOf(h) >= 0) && ps[0].model === 'claude-opus-5-5' && !/Lo que ve este usuario/.test(sysTxt(ps[0])), 'oficina: todas las herramientas, Opus y sin recortes · ' + H.length);
    c(tr && !tr.is_error && /5123/.test(tr.content) && /valorHora/.test(tr.content), 'oficina SÍ ve sueldos y valor hora (la nómina va completa) · ' + String(tr && tr.content).slice(0, 120));
    await p.click('#iaPanel [data-ia="cfg"]'); await p.waitForTimeout(900);
    const r = await p.evaluate(() => ({ lim: !!document.getElementById('iaLimites'), g: (document.getElementById('iaGastoMes') || {}).textContent || '' }));
    c(!r.lim && r.g === 'Gastado este mes: US$ 23,40 de 100 · preguntas 15,10 · remitos 6,30 · supervisor 2,00', 'oficina: en ⚙ ve «Gastado este mes» (del Worker) pero no los Límites (solo admin) · ' + JSON.stringify(r));
    c(A.errores.length === 0, 'sin errores de JavaScript · ' + JSON.stringify(A.errores).slice(0, 300));
    await p.close();
  }

  // ================================================================= 5) ADMIN: ⚙ Límites, gasto del mes, Worker viejo
  {
    const { p, st, A } = await sesion('admin');
    st.uso = { ok: true, version: 'v3-ia', mes: '2026-11', dia: '2026-11-10', gastoMes: 23.4, tope: 100, pausa: 80, corte: 95, nivel: '', partes: { preguntas: 15.1, remitos: 6.3, supervisor: 2 },
      personas: [{ uid: 'uRaul', nombre: 'Raúl Díaz', rol: 'cuadrilla', rolTxt: 'Cuadrilla', hoy: { preguntas: 4, remitos: 0 }, mes: { preguntas: 31, remitos: 0, usd: 1.2 }, topes: { preguntas: 10, remitos: 0 } }, { uid: 'uPan', nombre: 'Pablo Pañol', rol: 'panol', rolTxt: 'Pañol', hoy: { preguntas: 2, remitos: 5 }, mes: { preguntas: 20, remitos: 33, usd: 6.3 }, topes: { preguntas: 20, remitos: 40 } }] };
    await p.evaluate(() => window.__asistenteAbrir()); await p.waitForTimeout(800);
    const ps = await preguntar(p, st, 'hola', [Object.assign(fin('Hola.'), { ema: { costoUsd: 0.02 } })]);
    let r = await p.evaluate(() => ({ notas: [...document.querySelectorAll('#iaChat .ia-b.nota')].map((x) => x.textContent).filter((t) => /Worker del asistente todavía es el de antes/.test(t)).length, chip: (document.getElementById('iaQueda') || {}).hidden }));
    c(ps[0].tools.length === (await p.evaluate(() => window.__asistente.TOOLS.length)) && r.notas === 1 && r.chip === true, 'admin: todas las herramientas; con el Worker viejo (sin v3-ia) avisa una vez y no rompe; sin tope no hay chip · ' + JSON.stringify(r));
    await preguntar(p, st, 'chau', [Object.assign(fin('Chau.'), { ema: { costoUsd: 0.02 } })]);
    r = await p.evaluate(() => [...document.querySelectorAll('#iaChat .ia-b.nota')].filter((x) => /Worker del asistente/.test(x.textContent)).length);
    c(r === 1, 'el aviso del Worker viejo no se repite · ' + r);
    await p.click('#iaPanel [data-ia="cfg"]'); await p.waitForTimeout(1200);
    r = await p.evaluate(() => {
      const L = document.getElementById('iaLimites'), v = (s) => (document.querySelector('#iaCfg [data-ialim="' + s + '"]') || {}).value;
      return { hay: !!L, g: (document.getElementById('iaGastoMes') || {}).textContent, cua: v('cuadrilla.preguntas'), pan: [v('panol.preguntas'), v('panol.remitos')], ofi: v('oficina.preguntas'), mes: [v('mes.tope'), v('mes.pausaPct'), v('mes.cortePct')], sw: [...document.querySelectorAll('#iaCfg [data-iarol]')].map((x) => x.dataset.iarol + ':' + x.checked).join(), pers: (document.getElementById('iaLimPers') || {}).textContent.replace(/\s+/g, ' '), freno: (document.getElementById('iaLimFreno') || {}).textContent, ancho: document.getElementById('iaCfg').scrollWidth <= document.getElementById('iaCfg').clientWidth + 1 };
    });
    c(r.hay && r.cua === '10' && r.pan.join() === '20,40' && r.ofi === '30' && r.mes.join() === '100,80,95' && /oficina:true.*mirar:true/.test(r.sw), '⚙ Límites (admin): topes por rol de entrada (oficina 30, pañol 20 + 40 remitos, cuadrilla 10), freno 100 / 80 % / 95 % y todos prendidos · ' + JSON.stringify(r).slice(0, 300));
    c(r.g === 'Gastado este mes: US$ 23,40 de 100 · preguntas 15,10 · remitos 6,30 · supervisor 2,00' && /Raúl Díaz/.test(r.pers) && /Pablo Pañol/.test(r.pers) && /5 de 40/.test(r.pers) && /80,00/.test(r.freno) && r.ancho, '«Gastado este mes» del Worker y el detalle por persona (hoy y mes) · ' + JSON.stringify([r.g, r.pers.slice(0, 160), r.freno]));
    await p.evaluate(() => { const el = document.getElementById('iaLimites'); el && el.scrollIntoView(); });
    await foto(p, 'v141_limites');
    await p.fill('#iaCfg [data-ialim="cuadrilla.preguntas"]', '8');
    await p.fill('#iaCfg [data-ialim="mes.pausaPct"]', '70');
    await p.fill('#iaCfg [data-ialim="mes.tope"]', '120');
    await p.click('#iaCfg [data-iarol="mirar"]', { force: true });
    await p.click('#iaCfg [data-ia="cfgguardar"]'); await p.waitForTimeout(900);
    r = await p.evaluate(() => { const a = ((window.__stubDB().configEquipo || {}).personal || {}).asistente || {}; return { a, msg: document.getElementById('iaCfgMsg').textContent, roles: window.__iaRoles(), lista: !!((window.__stubDB().configEquipo || {}).personal || {}).lista }; });
    c(r.a.limites && r.a.limites.roles.cuadrilla.preguntas === 8 && r.a.limites.roles.panol.remitos === 40 && r.a.limites.mes.tope === 120 && r.a.limites.mes.pausaPct === 70 && r.a.roles.indexOf('mirar') < 0 && r.a.roles.indexOf('admin') >= 0 && r.lista && /Guardado/.test(r.msg), '⚙ Límites guarda en configEquipo/personal.asistente (limites + roles) sin tocar la nómina · ' + JSON.stringify([r.a.limites && r.a.limites.mes, r.a.roles, r.msg]));
    c(r.roles.indexOf('mirar') < 0, 'apagar «Solo mirar» lo saca de los roles que ven el asistente · ' + r.roles.join());
    await p.fill('#iaCfg [data-ialim="mes.pausaPct"]', '99');
    await p.click('#iaCfg [data-ia="cfgguardar"]'); await p.waitForTimeout(500);
    r = await p.evaluate(() => ({ msg: document.getElementById('iaCfgMsg').textContent, p: (((window.__stubDB().configEquipo || {}).personal || {}).asistente || {}).limites.mes.pausaPct }));
    c(/pausa tiene que ser menor/.test(r.msg) && r.p === 70, 'no deja guardar una pausa mayor que el corte · ' + JSON.stringify(r));
    const vt = await p.evaluate(() => window.__iaGastoTexto());
    c(/Gastado este mes: US\$ 23,4\d de 100/.test(vt), 'menú › Versión también muestra «Gastado este mes» · ' + vt.replace(/\n/g, ' | '));
    c(A.errores.length === 0, 'sin errores de JavaScript · ' + JSON.stringify(A.errores).slice(0, 300));
    await p.close();
  }
  await browser.close();
  process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
