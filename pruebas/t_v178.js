// v178 · El asistente ve TODO y hace TODO (Ángel 19/11: «la IA de la app tiene que saber y ver todo lo de la app, absolutamente
// todo; no puede decirme que no ve»).
//  0) Administración LEE cada colección (también las que no están en memoria: herramientas, quincenas, mapa, presencia,
//     ubicación, adjuntos, fotos, auditoría, avisos, Proyectista, notas, tableros, cuadrillas, guías, salud, alias, gastos),
//     leer_doc (OT por número, reserva R-, configEquipo, pushSubs/secretos no), buscar_en_todo («QUIROGA» en varias),
//     describir_datos y el SISTEMA.
//  1) ver_pantalla en 3 pantallas (Inicio, Pañol › Catálogo, Llenar orden con un campo cargado).
//  2) acciones con «Sí»: reserva, herramienta, gasto, obra nueva, alta de producto, ausencia; usuario (rol) y borrar obra con el
//     «Sí» dos veces; borrar una obra con órdenes no se arma; auditoría asistente_editar.
//  3) Oficina: lo que sus permisos dejan (no auditoría ni usuarios; sí reserva y ubicación en vivo).
//  4) cuadrilla, pañol, mirar y Dirección: como antes (sin las herramientas nuevas; NO_VE).
//  5) __v178No: como la v177.
const { abrir, prueba } = require('./h');
const { datos178 } = require('./datos178');
const cel = process.argv[2] === 'cel';
const REGLAS = !!process.env.REGLAS;
const SOLO = (x) => !process.env.SOLO || process.env.SOLO.split(',').indexOf(String(x)) >= 0;
const W = 'https://ema-ia.mdiaz-60f.workers.dev';
const NUEVAS = ['leer_doc', 'buscar_en_todo', 'ver_pantalla', 'dato_app', 'proponer_accion'];
(async () => {
  const c = prueba('v178' + (cel ? ' cel' : '') + (REGLAS ? ' REGLAS' : ''));
  const MOD = { cel, espera: 3500, https: true, iaPro: true, inicio: true, v155: true, v175: true, v176: true, v177: true, v178: true, reglas: REGLAS, antes: () => { window.__pmPausa = true; window.__hvPausa = true; window.__isNoAuto = true; window.__aaPausa = true; window.__cvSinMic = true; } };
  let browser = null;
  const sesion = async (quien, op) => { const A = await abrir(Object.assign({ sesion: quien, datos: datos178(), browser }, MOD, op || {})); browser = A.browser; A.page.on('dialog', (x) => x.accept()); await A.page.waitForTimeout(1200); return A; };
  const db = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('stub.db') || '{}'));
  const tx = (p, s) => p.evaluate((x) => { const e = document.querySelector(x); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; }, s);
  const esperar = async (p, fn, arg, ms) => { for (let i = 0; i < (ms || 40); i++) { if (await p.evaluate(fn, arg)) return true; await p.waitForTimeout(250); } return false; };
  let n = 0;
  const usa = (name, input) => ({ id: 'msg_' + (++n), type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text: 'Miro.' }, { type: 'tool_use', id: 'tu_' + n, name, input }], stop_reason: 'tool_use', usage: { input_tokens: 900, output_tokens: 40 }, ema: { costoUsd: 0.01, version: 'v5-ia' } });
  const fin = (text) => ({ id: 'msg_' + (++n), type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text }], stop_reason: 'end_turn', usage: { input_tokens: 1000, output_tokens: 60 }, ema: { costoUsd: 0.02, version: 'v5-ia' } });
  async function worker(p) {
    const st = { pedidos: [], cola: [] };
    await p.route(W + '/ia', async (rt) => { let b = null; try { b = JSON.parse(rt.request().postData() || 'null'); } catch (e) { } st.pedidos.push(b); const f = st.cola.shift() || fin('Listo.'); return rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(f) }); });
    await p.route(W + '/mio', (rt) => rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, version: 'v5-ia', habilitado: true, quedanPreguntas: 30, topePreguntas: 30 }) }));
    await p.route(W + '/uso', (rt) => rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, version: 'v5-ia', gastoMes: 12.4, tope: 100, partes: {} }) }));
    await p.route(W + '/salud', (rt) => rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, version: 'v5-ia' }) }));
    return st;
  }
  const esperarIa = async (p) => { for (let i = 0; i < 160; i++) { await p.waitForTimeout(150); if (await p.evaluate(() => { const b = document.getElementById('iaEnviar'); return !!b && !b.disabled; })) return; } };
  const decir = async (p, sw, frase, guion) => { sw.cola.push(...guion); const n0 = sw.pedidos.length; await p.fill('#iaTxt', frase); await p.click('#iaEnviar'); await p.waitForTimeout(300); await esperarIa(p); await p.waitForTimeout(400); return sw.pedidos.slice(n0); };
  const resultado = (ped, i) => { const m = (ped[i] || {}).messages || []; const u = m[m.length - 1] || {}; const b = (u.content || []).find((x) => x.type === 'tool_result'); if (!b) return ''; const x = b.content; return typeof x === 'string' ? x : Array.isArray(x) ? x.map((y) => (y && y.type === 'text' ? y.text : '')).join('') : JSON.stringify(x); };
  const herramientas = (ped) => ((ped[0] || {}).tools || []).map((t) => t.name);
  const toolDe = (ped, nm) => ((ped[0] || {}).tools || []).find((t) => t.name === nm);
  const abrirIa = async (p) => { await esperar(p, () => typeof window.__asistenteAbrir === 'function', null, 80); const sw = await worker(p); await p.evaluate(() => window.__asistenteAbrir()); await p.waitForTimeout(800); return sw; };
  const tarjeta = (p) => tx(p, '#iaChat .ia-conf:last-of-type');
  const botones = (p) => p.evaluate(() => { const c = [...document.querySelectorAll('#iaChat .ia-conf')].pop(); return c ? [...c.querySelectorAll('button')].map((b) => b.textContent.trim()) : []; });
  const si = async (p) => { await p.evaluate(() => { const c = [...document.querySelectorAll('#iaChat .ia-conf')].pop(); const b = c && c.querySelector('[data-iasi]'); b && b.click(); }); for (let i = 0; i < 40; i++) { await p.waitForTimeout(250); if (/✅|No se pudo|estoy seguro/.test(await tarjeta(p))) break; } await p.waitForTimeout(300); };
  const sinErr = (A) => (A.errores || []).filter((e) => !/permission|ERR_|Failed to fetch|aborted|ResizeObserver/i.test(e));
  try {
    // ================================================================= 0) Administración lee todo
    if (SOLO(0)) {
      const A = await sesion('admin'); const p = A.page; const sw = await abrirIa(p);
      const enMem = await p.evaluate(() => ({ herr: (window.__herramientasLista || []).length, mp: (window.__mapaPuntos || []).length, pres: Object.keys(window.__presenciaDatos || {}).length }));
      let ped = await decir(p, sw, '¿qué herramientas hay?', [usa('consultar', { coleccion: 'herramientas' }), fin('Hay 2.')]);
      const h = herramientas(ped), sys = JSON.stringify((ped[0] || {}).system || '');
      c(NUEVAS.every((x) => h.indexOf(x) >= 0), 'admin recibe leer_doc, buscar_en_todo, ver_pantalla, dato_app y proponer_accion');
      c(/VER Y HACER TODO \(v178/.test(sys) && /NUNCA digas «no lo puedo ver»/.test(sys), 'el SISTEMA: VER Y HACER TODO (v178) · nunca digas «no lo puedo ver» sin buscar');
      const en = (toolDe(ped, 'consultar').input_schema.properties.coleccion.enum || []);
      c(['adjuntos', 'fotosObra', 'auditoria', 'avisosCuadrilla', 'proyectos', 'planosNotas', 'tableros', 'cuadrillas', 'guias', 'salud', 'alias'].every((k) => en.indexOf(k) >= 0), 'consultar ofrece todas las colecciones (' + en.length + ')');
      c(/Amoladora Bosch/.test(resultado(ped, 1)) && (enMem.herr > 0 || /leído de la base/.test(resultado(ped, 1))), `herramientas (${enMem.herr} en memoria; si no, de la base) · ` + resultado(ped, 1).slice(0, 120));
      const MARCAS = [['herramientasMov', /Ramón QUIROGA/], ['mapaPuntos', /Tablero viejo/], ['cierresQuincena', /2026-11-1/], ['presencia', /PRES/], ['ubicacionVivo', /UBIC/], ['adjuntos', /ADJ-7788/], ['fotosObra', /FOTOOBRA/], ['auditoria', /QUIROGA-AUDIT/], ['avisosCuadrilla', /cinta aisladora/], ['proyectos', /PROY-ALBERDI/], ['planosNotas', /NOTA-PLANO/], ['tableros', /TABLERO-ANA/], ['cuadrillas', /CUAD-NORTE/], ['guias', /GUIA-PROPIA/], ['salud', /SALUD-PARTE/], ['alias', /angel/], ['gastos', /GASTO-NAFTA/], ['usuarios', /Mirta Mira/], ['reservas', /R-0001/]];
      for (let i = 0; i < MARCAS.length; i += 7) {
        const lote = MARCAS.slice(i, i + 7);
        ped = await decir(p, sw, 'leé ' + lote.map((x) => x[0]).join(', '), lote.map((x) => usa('consultar', { coleccion: x[0] })).concat([fin('Listo.')]));
        lote.forEach((x, j) => { const r = resultado(ped, j + 1); c(x[1].test(r), `consultar ${x[0]} trae lo de la base · ` + r.slice(0, 100)); });
      }
      ped = await decir(p, sw, 'auditoría de borrados', [usa('consultar', { coleccion: 'auditoria', filtro: { accion: 'plaza_borrada' } }), fin('Una.')]);
      c(/QUIROGA-AUDIT/.test(resultado(ped, 1)) && /"total":1/.test(resultado(ped, 1)), 'consultar con filtro va directo a la base (auditoría de una acción)');
      ped = await decir(p, sw, 'leé la OT-2026-201, la R-0001, las cuadrillas, pushSubs y secretos', [usa('leer_doc', { coleccion: 'ordenesTrabajo', id: 'OT-2026-201' }), usa('leer_doc', { coleccion: 'reservas', id: 'R-0001' }), usa('leer_doc', { coleccion: 'configEquipo', id: 'cuadrillas' }), usa('leer_doc', { coleccion: 'herramientas', id: 'H-002' }), usa('leer_doc', { coleccion: 'pushSubs', id: 'x' }), usa('leer_doc', { coleccion: 'secretosServidor', id: 'vapid' }), fin('Listo.')]);
      c(/"existe":true/.test(resultado(ped, 1)) && /OT-2026-201/.test(resultado(ped, 1)), 'leer_doc OT por número · ' + resultado(ped, 1).slice(0, 90));
      c(/solicitada/.test(resultado(ped, 2)) && /CUAD-NORTE/.test(resultado(ped, 3)) && /Escalera/.test(resultado(ped, 4)), 'leer_doc reserva R-0001, configEquipo/cuadrillas y la herramienta H-002');
      c(/no se lee/.test(resultado(ped, 5)) && /no se lee/.test(resultado(ped, 6)), 'pushSubs y secretosServidor no se leen (y dice por qué) · ' + resultado(ped, 6).slice(0, 90));
      ped = await decir(p, sw, '¿dónde aparece Quiroga?', [usa('buscar_en_todo', { texto: 'quiroga' }), usa('buscar_en_todo', { texto: 'quiroga', profundo: true }), fin('En varias.')]);
      let r = resultado(ped, 1);
      c(['herramientas', 'herramientasMov', 'mapaPuntos', 'avisosCuadrilla'].every((k) => r.indexOf('"coleccion":"' + k + '"') >= 0), 'buscar_en_todo encuentra «Quiroga» en herramientas, sus movimientos, el mapa y los avisos · ' + r.slice(0, 160));
      c(/"coleccion":"auditoria"/.test(resultado(ped, 2)), 'con profundo:true también mira la auditoría · ' + resultado(ped, 2).slice(0, 300));
      ped = await decir(p, sw, '¿qué datos hay?', [usa('describir_datos', {}), usa('dato_app', { cual: 'lista_compras' }), usa('dato_app', { cual: 'version' }), fin('Muchos.')]);
      r = resultado(ped, 1);
      c(/"coleccion":"auditoria"/.test(r) && /"coleccion":"cuadrillas"/.test(r) && /secretosServidor/.test(r), 'describir_datos: las colecciones nuevas y lo que no se lee a propósito');
      c(/"cual":"lista_compras"/.test(resultado(ped, 2)) && /"version":"20\d\d/.test(resultado(ped, 3)), 'dato_app: lista de compras y versión');
      c(sinErr(A).length === 0, 'sin errores de JS · ' + sinErr(A).slice(0, 2).join(' | '));
      await A.browser.close(); browser = null;
    }
    // ================================================================= 1) ver_pantalla en 3 pantallas
    if (SOLO(1)) {
      const A = await sesion('admin'); const p = A.page; const sw = await abrirIa(p);
      const pant = async (frase) => { const ped = await decir(p, sw, frase, [usa('ver_pantalla', {}), fin('Veo.')]); return resultado(ped, 1); };
      await p.evaluate(() => { try { window.__asistente.cerrar(); } catch (e) { } });
      await p.evaluate(() => window.mostrarVista('inicio')); await p.waitForTimeout(900);
      await p.evaluate(() => window.__asistenteAbrir()); await p.waitForTimeout(500);
      let r = await pant('¿qué estoy viendo?');
      c(/"vista":"inicio"/.test(r) && r.length > 400, 'ver_pantalla en el Inicio · ' + r.slice(0, 120));
      await p.evaluate(() => { try { window.__asistente.cerrar(); } catch (e) { } window.mostrarVista('stock'); }); await p.waitForTimeout(1500);
      await p.evaluate(() => window.__asistenteAbrir()); await p.waitForTimeout(500);
      r = await pant('¿qué es esto?');
      c(/"vista":"stock"/.test(r) && /Catálogo|catálogo|Pañol|pañol/.test(r), 'ver_pantalla en el Pañol · ' + r.slice(0, 160));
      await p.evaluate(() => { try { window.__asistente.cerrar(); } catch (e) { } window.mostrarVista('parte'); }); await p.waitForTimeout(1500);
      await p.evaluate(() => { const b = [...document.querySelectorAll('#viewParteDiario .subtab, #viewParteDiario button')].find((x) => /Llenar orden/.test(x.textContent) && x.offsetParent); b && b.click(); }); await p.waitForTimeout(900);
      const puso = await p.evaluate(() => { const i = [...document.querySelectorAll('#viewParteDiario input[type=text], #viewParteDiario textarea')].find((x) => x.offsetParent && !x.readOnly); if (!i) return ''; i.value = 'NOTA-EN-PANTALLA'; i.dispatchEvent(new Event('input', { bubbles: true })); return i.id || i.name || 'sí'; });
      await p.evaluate(() => window.__asistenteAbrir()); await p.waitForTimeout(500);
      r = await pant('¿está bien lo que cargué?');
      c(/"vista":"parte"/.test(r) && !!puso && /NOTA-EN-PANTALLA/.test(r) && /Llenar orden/.test(r) && /"campos":\[\{/.test(r), `ver_pantalla en Órdenes con el campo cargado (${puso}) · ` + r.slice(0, 160));
      c(!/Asistente EMA/.test(r.slice(0, 600)) || /"vista"/.test(r), 'no cuenta el panel del asistente');
      await A.browser.close(); browser = null;
    }
    // ================================================================= 2) acciones de Administración
    if (SOLO(2)) {
      const A = await sesion('admin'); const p = A.page; const sw = await abrirIa(p);
      // reserva
      await decir(p, sw, 'aprobá la R-0001', [usa('proponer_accion', { accion: 'reserva', datos: { reserva: 'R-0001', estado: 'aprobar' } }), fin('Confirmá.')]);
      c(/Reserva R-0001/.test(await tarjeta(p)) && /solicitada/.test(await tarjeta(p)) && (await db(p)).reservas.r1.estado === 'solicitada', 'reserva: tarjeta solicitada → pendiente y nada antes del Sí');
      await si(p); let d = await db(p);
      c(d.reservas.r1.estado === 'pendiente' && /Asistente/.test(JSON.stringify(d.reservas.r1.historial)) && d.reservas.r1.aprobadaPor, 'con «Sí»: reserva aprobada (pendiente, historial, aprobadaPor)');
      // herramienta (no estaba en memoria)
      await decir(p, sw, 'dale la amoladora a Mauricio', [usa('proponer_accion', { accion: 'herramienta', datos: { herramienta: 'H-001', que: 'asignar', persona: 'Mainini' } }), fin('Confirmá.')]);
      c(/H-001/.test(await tarjeta(p)) && /Mauricio Mainini/.test(await tarjeta(p)), 'herramienta: tarjeta H-001 → a cargo de Mauricio Mainini');
      await si(p); d = await db(p);
      c(d.herramientas.h1.asignada && d.herramientas.h1.asignada.persona === 'Mauricio Mainini' && Object.values(d.herramientasMov).some((m) => m.herr === 'h1' && m.tipo === 'entrega' && m.porAsistente), 'con «Sí»: asignada + movimiento «entrega» (como la pantalla)');
      await p.waitForTimeout(800);
      c(/Remito para firmar/.test(await tx(p, '#hrrPost')), 'como en la pantalla: aparece «📄 Remito para firmar» de la entrega');
      await p.evaluate(() => { const b = document.querySelector('[data-hrpost="listo"]'); b && b.click(); }); await p.waitForTimeout(300);
      // gasto
      const cat = await p.evaluate(() => (window.GASTOS && window.GASTOS.CATS && window.GASTOS.CATS[0]) || null);
      await decir(p, sw, 'cargá un gasto', [usa('proponer_accion', { accion: 'gasto', datos: { obra: 'San Martín', categoria: cat ? cat.txt : 'x', detalle: 'Cinta GASTO-IA', importe: 2500 } }), fin('Confirmá.')]);
      await si(p); d = await db(p);
      c(cat && Object.values(d.gastosObra).some((g) => g.desc === 'Cinta GASTO-IA' && g.importe === 2500 && g.plazaId === 'p1' && g.cat === cat.id), 'gasto guardado en la obra (' + (cat && cat.id) + ')');
      // obra nueva
      await decir(p, sw, 'registrá la plaza Las Heras', [usa('proponer_accion', { accion: 'obra_nueva', datos: { nombre: 'PLAZA LAS HERAS IA', tipo: 'plaza', ID: '5555', barrio: 'Alberdi' } }), fin('Confirmá.')]);
      await si(p); d = await db(p);
      c(Object.values(d.avanceObras).some((o) => o.nombre === 'PLAZA LAS HERAS IA' && o.obraId === '5555' && o.tipoObra === 'plaza'), 'obra nueva registrada');
      // alta de producto: el código lo elige la app
      const prox = await p.evaluate(() => proximoCodigoCatalogo(9000));
      await decir(p, sw, 'alta de producto', [usa('proponer_accion', { accion: 'producto_alta', datos: { familia: 9, desc: 'Precinto PROD-IA', un: 'Un.', minimo: 10 } }), fin('Confirmá.')]);
      c(new RegExp(String(prox)).test(await tarjeta(p)), 'producto: la tarjeta dice el código que elige la app (' + prox + ')');
      await si(p); d = await db(p);
      c(d.catalogoProductos && d.catalogoProductos[String(prox)] && d.catalogoProductos[String(prox)].desc === 'Precinto PROD-IA', 'producto ' + prox + ' en el catálogo');
      // ausencia
      await decir(p, sw, 'Petitti de vacaciones hasta el viernes', [usa('proponer_accion', { accion: 'ausencia', datos: { persona: 'Petitti', motivo: 'vacaciones', desde: 'hoy', hasta: 'mañana' } }), fin('Confirmá.')]);
      await si(p); d = await db(p);
      c((d.configEquipo.personal.ausencias || []).some((x) => x.persona === 'PETITTI ISMAEL' && x.motivo === 'vacaciones') && d.configEquipo.personal.nomina.length === 15, 'ausencia anotada (y la nómina sigue con 15)');
      // usuario: delicado → dos veces
      await decir(p, sw, 'Mirta pasa a oficina', [usa('proponer_accion', { accion: 'usuario', datos: { usuario: 'mir', rol: 'oficina' } }), fin('Confirmá.')]);
      c(/Delicado/.test(await tarjeta(p)), 'usuario: la tarjeta avisa que es delicado');
      await si(p); d = await db(p);
      c(d.usuarios.uMir.rol === 'mirar' && (await botones(p)).indexOf('Sí, estoy seguro') >= 0, 'primer «Sí»: no cambia nada y pide «Sí, estoy seguro» · ' + (await botones(p)).join(' | '));
      await si(p); d = await db(p);
      c(d.usuarios.uMir.rol === 'oficina', 'segundo «Sí»: Mirta pasa a Oficina');
      // borrar obra: con órdenes no; vacía sí, dos veces
      let ped = await decir(p, sw, 'borrá San Martín', [usa('proponer_accion', { accion: 'borrar_obra', datos: { obra: 'Plaza San Martín' } }), fin('No.')]);
      c(/No la borro/.test(resultado(ped, 1)) && /archiv/.test(resultado(ped, 1)), 'borrar una obra con órdenes no se arma (ofrece archivar)');
      await decir(p, sw, 'borrá la vacía', [usa('proponer_accion', { accion: 'borrar_obra', datos: { obra: 'PLAZA VACÍA DE PRUEBA' } }), fin('Confirmá.')]);
      await si(p); c(!!(await db(p)).avanceObras.pVacia, 'primer «Sí»: la obra sigue');
      await si(p); c(!(await db(p)).avanceObras.pVacia, 'segundo «Sí»: la obra vacía se borró');
      // reiniciar puntos por proponer_editar: también dos veces
      await decir(p, sw, 'que los puntos cuenten desde el 15', [usa('proponer_editar', { coleccion: 'reinicios', id: 'reinicios', cambios: { puntosDesde: '2026-11-15' }, motivo: 'prueba' }), fin('Confirmá.')]);
      c(/Delicado/.test(await tarjeta(p)), 'reiniciar puntos (proponer_editar reinicios) también es delicado');
      d = await db(p);
      const au = Object.values(d.auditoria || {}).filter((x) => x.accion === 'asistente_editar' && x.porAsistente);
      c(au.length >= 8 && au.some((x) => x.coleccion === 'usuario') && au.some((x) => x.coleccion === 'reserva'), 'auditoría asistente_editar de cada acción (' + au.length + ')');
      c(sinErr(A).length === 0, 'sin errores de JS · ' + sinErr(A).slice(0, 2).join(' | '));
      await A.browser.close(); browser = null;
    }
    // ================================================================= 3) Oficina
    if (SOLO(3)) {
      const A = await sesion('lucia'); const p = A.page; const sw = await abrirIa(p);
      const ped = await decir(p, sw, 'auditoría y ubicación', [usa('consultar', { coleccion: 'auditoria' }), usa('consultar', { coleccion: 'ubicacionVivo' }), usa('leer_doc', { coleccion: 'usuarios', id: 'uMir' }), usa('proponer_accion', { accion: 'usuario', datos: { usuario: 'mir', rol: 'admin' } }), usa('consultar', { coleccion: 'herramientas' }), fin('Listo.')]);
      const h = herramientas(ped);
      c(NUEVAS.every((x) => h.indexOf(x) >= 0), 'oficina recibe las herramientas nuevas');
      c(/permiso/.test(resultado(ped, 1)) && /UBIC/.test(resultado(ped, 2)), 'oficina: la auditoría no (es de Administración), la ubicación en vivo sí');
      c(/permiso|Administración/.test(resultado(ped, 3)) && /no puede/.test(resultado(ped, 4)), 'oficina: usuarios no (ni leer ni cambiar)');
      c(/Amoladora/.test(resultado(ped, 5)), 'oficina: herramientas leídas de la base');
      await decir(p, sw, 'aprobá la R-0001', [usa('proponer_accion', { accion: 'reserva', datos: { reserva: 'R-0001', estado: 'aprobar' } }), fin('Confirmá.')]);
      await si(p);
      c((await db(p)).reservas.r1.estado === 'pendiente', 'oficina aprueba una reserva con «Sí»');
      await A.browser.close(); browser = null;
    }
    // ================================================================= 4) los demás roles, como antes
    if (SOLO(4)) {
      for (const [q, nom] of [['pan', 'pañol'], ['mir', 'mirar'], ['dir', 'Dirección'], ['pedro', 'cuadrilla']]) {
        const A = await sesion(q); const p = A.page; const sw = await abrirIa(p);
        const ped = await decir(p, sw, 'leé la auditoría', [usa('leer_doc', { coleccion: 'auditoria', id: 'au1' }), usa('proponer_accion', { accion: 'reserva', datos: { reserva: 'R-0001', estado: 'aprobar' } }), usa('consultar', { coleccion: 'auditoria' }), fin('No.')]);
        const h = herramientas(ped), en = ((toolDe(ped, 'consultar') || { input_schema: { properties: { coleccion: {} } } }).input_schema.properties.coleccion.enum) || [];
        c(NUEVAS.every((x) => h.indexOf(x) < 0) && en.indexOf('auditoria') < 0 && en.indexOf('adjuntos') < 0, nom + ': sin herramientas nuevas ni colecciones nuevas en consultar');
        c(/Eso no lo puedo ver con tu usuario/.test(resultado(ped, 1)) && /Eso no lo puedo ver con tu usuario/.test(resultado(ped, 2)), nom + ': leer_doc / proponer_accion → NO_VE');
        c(/Eso no lo puedo ver|No hay ninguna colección|permiso/.test(resultado(ped, 3)), nom + ': consultar auditoria no · ' + resultado(ped, 3).slice(0, 80));
        c((await db(p)).reservas.r1.estado === 'solicitada', nom + ': no cambió nada');
        await A.browser.close(); browser = null;
      }
    }
    // ================================================================= 6) más acciones de Administración
    if (SOLO(6)) {
      const A = await sesion('admin', { v151: true }); const p = A.page; const sw = await abrirIa(p);
      const una = async (frase, accion, datos, veces) => { const ped = await decir(p, sw, frase, [usa('proponer_accion', { accion, datos, motivo: 'prueba v178' }), fin('Confirmá.')]); for (let i = 0; i < (veces || 1); i++) await si(p); return { r: resultado(ped, 1), card: await tarjeta(p) }; };
      let x = await una('poné un punto', 'punto_mapa', { nombre: 'Acopio PUNTO-IA', icono: 'material', obra: 'San Martín', lat: -31.42, lng: -64.17 });
      let d = await db(p);
      c(Object.values(d.mapaPuntos).some((m) => m.nombre === 'Acopio PUNTO-IA' && m.icono === 'material' && m.plazaId === 'p1'), 'punto en el mapa · ' + x.card.slice(-60));
      x = await una('la PAT de San Martín la tenemos en papel', 'documento', { obra: 'San Martín', doc: 'pat', nota: 'carpeta azul' });
      d = await db(p);
      c(d.avanceObras.p1.documentos && d.avanceObras.p1.documentos.pat && d.avanceObras.p1.documentos.pat.papel === true, 'documentación: PAT en papel · ' + x.card.slice(-60));
      x = await una('respondele a Juan', 'aviso_cuadrilla', { aviso: 'cinta aisladora', estado: 'resuelto', respuesta: 'Ya va la cinta' });
      d = await db(p);
      c(d.avisosCuadrilla.av1.estado === 'resuelto' && d.avisosCuadrilla.av1.respuesta === 'Ya va la cinta', 'aviso de la cuadrilla resuelto con respuesta · ' + x.card.slice(-80));
      x = await una('archivá la vacía', 'archivar_obra', { obra: 'PLAZA VACÍA DE PRUEBA', archivar: true });
      d = await db(p);
      c(d.avanceObras.pVacia.oculta === true, 'obra archivada');
      x = await una('sumá a Carla de oficina', 'contacto', { nombre: 'Carla Ruiz', rol: 'oficina', tel: '3515550000' });
      d = await db(p);
      c((d.configEquipo.personal.contactos || []).some((k) => k.nombre === 'Carla Ruiz' && k.tel === '3515550000') && d.configEquipo.personal.nomina.length === 15, 'contacto guardado (la nómina sigue igual)');
      x = await una('reabrí la primera de noviembre', 'quincena', { que: 'reabrir', quincena: '2026-11-1', motivo: 'faltaba un cierre' }, 2);
      d = await db(p);
      c(d.cierresQuincena['2026-11-1'].estado === 'abierta' && /faltaba un cierre/.test(JSON.stringify(d.cierresQuincena['2026-11-1'].historial || [])), 'quincena reabierta con el «Sí» dos veces y el motivo · ' + x.card.slice(-80));
      x = await una('borrá la foto de la col 9', 'borrar_fotos', { ids: ['a2'], motivo: 'repetida' }, 2);
      d = await db(p);
      c((d.avanceObras.p1.fotosBorradas || []).indexOf('a2') >= 0, 'borrar fotos con el «Sí» dos veces (fotosBorrar de la app) · ' + x.card.slice(-80));
      c(sinErr(A).length === 0, 'sin errores de JS · ' + sinErr(A).slice(0, 2).join(' | '));
      await A.browser.close(); browser = null;
    }
    // ================================================================= 5) __v178No
    if (SOLO(5)) {
      const A = await sesion('admin', { v178: false }); const p = A.page; const sw = await abrirIa(p);
      const ped = await decir(p, sw, '¿qué puntos hay en el mapa?', [usa('consultar', { coleccion: 'mapaPuntos' }), fin('Ninguno.')]);
      c(NUEVAS.every((x) => herramientas(ped).indexOf(x) < 0) && !/VER Y HACER TODO/.test(JSON.stringify(ped[0].system || '')), '__v178No: sin las herramientas nuevas ni la línea del SISTEMA');
      c(/vac[ií]a en memoria/.test(resultado(ped, 1)) && !/Tablero viejo/.test(resultado(ped, 1)), '__v178No: los puntos del mapa sin abrir el Mapa «vacía en memoria» (como la v177) · ' + resultado(ped, 1).slice(0, 100));
      await A.browser.close(); browser = null;
    }
  } catch (e) { console.log('ERROR', e && e.stack || e); c(false, 'la prueba se cortó: ' + String(e && e.message || e).slice(0, 200)); }
  if (browser) { try { await browser.close(); } catch (e) { } }
  process.exit(c.fin() ? 1 : 0);
})();
