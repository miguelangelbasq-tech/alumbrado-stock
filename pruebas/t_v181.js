// v181 · 📜 Registro de cambios en el Guardián de datos (Ángel 19/11: «cada modificación, cada cambio —letra, color, nombre—, si
// se borra algo de la app, tiene que quedar registrado en la app qué es lo que se hizo y quién lo hizo, en el Guardián»).
//  0) cambios desde varias pantallas (renombrar la obra, color del pin, gasto alta y borrado, estado de la reserva, sector de una
//     persona, precio de un producto, foto borrada, orden editada; la cuadrilla marca en su orden) → cada uno queda con quién,
//     cuándo, pantalla y antes → después.
//  1) se agrupa (≤ 1 documento de auditoria por ráfaga), sin ruido (latidos, salud, ubicación, avisos), valores cortados (sin
//     imágenes, textos largos, secretos «[oculto]», sueldos «[privado]»), < 1 MB, y pasa a resúmenes cerca del cupo.
//  2) Guardián › «📜 Historial de cambios»: filtros, antes → después, «Volver este cambio» (color) y volver a crear un gasto
//     borrado con «Sí» (y queda anotado), Excel y PDF.
//  3) la alerta del Guardián lleva a los cambios que la causaron.
//  4) asistente historial_cambios / proponer_revertir_cambio (solo Administración).
//  5) solo Administración ve el historial; los cambios de Oficina, Dirección (no escribe) y la cuadrilla igual se anotan
//     (REGLAS=1: cada uno crea su auditoria con su correo).  6) __v181No.
const { abrir, otraPagina, prueba } = require('./h');
const { datos181 } = require('./datos181');
const cel = process.argv[2] === 'cel';
const REGLAS = !!process.env.REGLAS;
const SOLO = (x) => !process.env.SOLO || process.env.SOLO.split(',').indexOf(String(x)) >= 0;
const W = 'https://ema-ia.mdiaz-60f.workers.dev';
const ANTES = () => { window.__rcEspera = 400; window.__rcTope = 3000; window.__rcCuadrilla = 800; window.__gdEspera = 0; window.__supNoIA = true; window.__pmPausa = true; window.__hvPausa = true; window.__isNoAuto = true; window.__aaPausa = true; window.__cvSinMic = true; };
(async () => {
  const c = prueba('v181' + (cel ? ' cel' : '') + (REGLAS ? ' REGLAS' : ''));
  const MOD = { cel, espera: 3500, https: true, inicio: true, v176: true, v181: true, reglas: REGLAS, antes: ANTES };
  const sesion = async (quien, op, base) => { const o = Object.assign({ sesion: quien, datos: datos181() }, MOD, op || {}); const A = base ? await otraPagina(base, o) : await abrir(o); A.page.on('dialog', (x) => x.accept()); await A.page.waitForTimeout(800); return A; };
  const db = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('stub.db') || '{}'));
  const gesto = (p) => p.evaluate(() => document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })));
  const flush = async (p) => { await p.waitForTimeout(150); await p.evaluate(() => window.__regCambios.flush()); await p.waitForTimeout(250); };
  const audDocs = async (p) => Object.entries((await db(p)).auditoria || {}).map(([id, d]) => Object.assign({ id }, d));
  const cambios = async (p) => (await audDocs(p)).filter((d) => d.accion === 'cambios_app').reduce((l, d) => l.concat((d.cambios || []).map((E, i) => Object.assign({ usuario: d.usuario, nombre: d.nombre, rol: d.rol, aid: d.id, eid: d.id + '#' + i }, E))), []);
  const ultimo = async (p, fn) => (await cambios(p)).filter(fn).sort((a, b) => b.t1 - a.t1)[0];
  const ev = (p, f, a) => p.evaluate(f, a);
  const sinErr = (A) => (A.errores || []).filter((e) => !/permission|ERR_|Failed to fetch|aborted|ResizeObserver|insufficient/i.test(e));
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
  const tarjeta = (p) => p.evaluate(() => { const e = [...document.querySelectorAll('#iaChat .ia-conf')].pop(); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; });
  const si = async (p) => { await p.evaluate(() => { const c = [...document.querySelectorAll('#iaChat .ia-conf')].pop(); const b = c && c.querySelector('[data-iasi]'); b && b.click(); }); for (let i = 0; i < 40; i++) { await p.waitForTimeout(250); if (/✅|No se pudo|estoy seguro/.test(await tarjeta(p))) break; } await p.waitForTimeout(400); };
  const abrirIa = async (p) => { for (let i = 0; i < 80 && !(await p.evaluate(() => typeof window.__asistenteAbrir === 'function')); i++) await p.waitForTimeout(250); const sw = await worker(p); await p.evaluate(() => window.__asistenteAbrir()); await p.waitForTimeout(800); return sw; };
  try {
    // ================================================================= 0) cambios desde varias pantallas
    if (SOLO(0)) {
      const A = await sesion('admin'), p = A.page;
      const pasar = async (vista, fn, arg) => { await ev(p, (v) => { try { mostrarVista(v); } catch (e) { } }, vista); await p.waitForTimeout(250); await gesto(p); await ev(p, fn, arg); await flush(p); };
      await pasar('registro', () => window.fbAvanceCampos('p1', { nombre: 'PLAZA SAN MARTÍN NORTE' }));
      let E = await ultimo(p, (x) => x.c === 'avanceObras' && x.id === 'p1');
      c(E && /Renombró la obra PLAZA SAN MARTÍN → PLAZA SAN MARTÍN NORTE/.test(E.r) && E.usuario === 'admin@ema-alumbrado.app' && E.nombre === 'Ana Admin' && E.rol === 'admin' && E.o === 'persona', 'renombrar la obra: ' + (E && E.r));
      c(E && E.pa === 'Registrar obra' && E.f[0].k === 'nombre' && JSON.parse(E.f[0].aj) === 'PLAZA SAN MARTÍN' && JSON.parse(E.f[0].dj) === 'PLAZA SAN MARTÍN NORTE' && E.t1 > Date.now() - 60000, 'con la pantalla (Registrar obra), cuándo y el nombre antes → después');
      await pasar('mapa', () => window.fbAvanceCampos('p1', { mapaColor: '#1A73E8' }));
      E = await ultimo(p, (x) => x.c === 'avanceObras' && x.f && x.f.some((f) => f.k === 'mapaColor'));
      c(E && /Cambió el color del pin de PLAZA SAN MARTÍN NORTE de rojo a azul/.test(E.r) && E.pa === 'Mapa', 'color del pin: ' + (E && E.r));
      await pasar('gastos', () => window.fbGastoAdd({ cat: 'combustible', fecha: '2026-11-19', desc: 'Gasoil', cant: 50, un: 'l', pu: 100, importe: 5000, plazaId: 'p1', plazaNombre: 'PLAZA SAN MARTÍN NORTE', obraId: '1234', usuario: 'admin@ema-alumbrado.app', ts: Date.now() }));
      E = await ultimo(p, (x) => x.c === 'gastosObra' && x.t === 'alta');
      c(E && /Agregó el gasto de \$ 5\.000 «Gasoil» de PLAZA SAN MARTÍN NORTE/.test(E.r) && E.nuevo && JSON.parse(E.nuevo).importe === 5000, 'alta de gasto: ' + (E && E.r));
      await pasar('gastos', () => window.fbGastoEliminar('g1'));
      E = await ultimo(p, (x) => x.c === 'gastosObra' && x.t === 'borrado');
      const prev = E && E.prev ? JSON.parse(E.prev) : {};
      c(E && /Borró el gasto de \$ 12\.000 «Hormigón elaborado» de PLAZA SAN MARTÍN/.test(E.r) && prev.importe === 12000 && prev.proveedor === 'Hormigonera Sur' && !E.prevX, 'borrado de gasto con la copia completa de cómo estaba: ' + (E && E.r));
      await pasar('stock', () => window.fbReservaActualizar('r1', { estado: 'entregada' }));
      E = await ultimo(p, (x) => x.c === 'reservas');
      c(E && /Pasó la reserva R-0045 de PLAZA SAN MARTÍN de lista a entregada/.test(E.r), 'estado de la reserva: ' + (E && E.r));
      await pasar('produccion', () => { const l = JSON.parse(JSON.stringify(window.__personalNube.nomina)); l.find((x) => x.nombre === 'Mauricio Mainini').sector = 'ilicitos'; return window.fbPersonalGuardar({ nomina: l }); });
      E = await ultimo(p, (x) => x.c === 'configEquipo' && x.id === 'personal');
      const fn = E && (E.f || []).find((f) => f.k === 'nomina');
      c(E && /Mauricio Mainini: sector alumbrado → ilicitos/.test(E.r) && /Personal del equipo/.test(E.r), 'sector de una persona: ' + (E && E.r));
      c(fn && fn.p && !/4000|4010/.test(fn.aj + fn.dj) && /\[privado\]/.test(fn.aj), 'el valor hora no queda en el registro («[privado]»)');
      await pasar('stock', () => window.fbGuardarProductoCatalogo({ codigo: '1019', costo: 120 }));
      E = await ultimo(p, (x) => x.c === 'catalogoProductos');
      c(E && /Cambió el precio de 1019 CABLE TPR 3x1,5 de \$ 100 a \$ 120/.test(E.r), 'precio de un producto: ' + (E && E.r));
      await pasar('obras', async () => { await window.fbFotosObraDe('p1'); return window.fbFotoObraBorrar('f1'); });
      E = await ultimo(p, (x) => x.c === 'fotosObra' && x.t === 'borrado');
      c(E && /Borró la foto Col 1 de PLAZA SAN MARTÍN/.test(E.r) && E.prevX === 'imagen' && !/AAAAAAAA/.test(E.prev || ''), 'foto borrada (sin la imagen en el registro): ' + (E && E.r));
      await pasar('parte', () => window.fbOtUpdate('ot1', { horaInicio: '08:00', notas: 'Llevar escalera y conos' }));
      E = await ultimo(p, (x) => x.c === 'ordenesTrabajo' && x.usuario === 'admin@ema-alumbrado.app');
      c(E && /la orden OT-2026-001/.test(E.r) && /07:00 → 08:00/.test(E.r) && /Llevar escalera → Llevar escalera y conos/.test(E.r) && E.pa === 'Órdenes', 'orden editada: ' + (E && E.r));
      // la cuadrilla marca en su orden (otro celu, otra persona)
      const B = await sesion('pedro', { cel: true }, A), q = B.page;
      await gesto(q); await ev(q, () => window.fbOtCampo('ot1', { 'campo.marcas.rev': { hecha: true, por: 'Pedro Gómez' } }));
      await q.waitForTimeout(1200); await flush(q);
      E = await ultimo(q, (x) => x.c === 'ordenesTrabajo' && x.usuario === 'pedro@ema-alumbrado.app');
      c(E && /Marcó en la orden OT-2026-001/.test(E.r) && E.nombre === 'Pedro Gómez' && E.rol === 'cuadrilla', 'la cuadrilla marca en su orden: ' + (E && E.r));
      const todos = await cambios(p);
      c(todos.every((x) => x.usuario && x.t1 && x.r), `cada cambio con quién, cuándo y resumen (${todos.length})`);
      c(!sinErr(A).length && !sinErr(B).length, 'sin errores ' + sinErr(A).concat(sinErr(B)).slice(0, 2).join(' | '));
      await B.page.close(); await A.browser.close();
    }
    // ================================================================= 1) agrupado, sin ruido, valores cortados, cupo
    if (SOLO(1)) {
      const A = await sesion('admin'), p = A.page;
      await flush(p); const n0 = (await audDocs(p)).filter((d) => d.accion === 'cambios_app').length;
      await gesto(p);
      await ev(p, async () => { const ps = []; for (let i = 0; i < 10; i++) ps.push(window.fbGastoAdd({ cat: 'materiales', fecha: '2026-11-19', desc: 'Arena ' + i, importe: 1000 + i, plazaId: 'p2', plazaNombre: 'PLAZA LOS ÁLAMOS', ts: Date.now() })); for (let i = 0; i < 5; i++) ps.push(window.fbAvanceCampos('p2', { barrio: 'B' + i })); await Promise.all(ps); });
      await ev(p, async () => { try { await window.fbPresenciaMarcar(); } catch (e) { } try { await window.fbSaludGuardar({ prueba181: 1 }); } catch (e) { } const f = firebase.firestore(); await f.collection('ubicacionVivo').doc('uAdmin').set({ lat: 1, lng: 2, ts: Date.now() }); await f.collection('avisosPush').add({ enviado: false, email: 'x@y', titulo: 'hola' }); });
      await p.waitForTimeout(900); await flush(p);
      const docs = (await audDocs(p)).filter((d) => d.accion === 'cambios_app');
      c(docs.length - n0 >= 1 && docs.length - n0 <= 2, `una ráfaga de 15 escrituras → ${docs.length - n0} documento(s) de auditoria (1; 2 si la ráfaga pasa los 3 s del tope de la prueba)`);
      const L = await cambios(p);
      c(L.filter((x) => x.c === 'gastosObra' && x.t === 'alta' && /Arena/.test(x.r)).length === 10, '10 altas de gasto adentro');
      const b = L.find((x) => x.c === 'avanceObras' && x.id === 'p2');
      c(b && b.n === 5 && JSON.parse(b.f[0].aj) === 'Alberdi' && JSON.parse(b.f[0].dj) === 'B4', 'las 5 del mismo documento juntas: barrio Alberdi → B4');
      c(!L.some((x) => /^(presencia|ubicacionVivo|avisosPush|auditoria)$/.test(x.c) || (x.c === 'configEquipo' && /presencia|salud/.test(x.id))), 'sin ruido: presencia, salud, ubicación, avisos');
      await gesto(p);
      await ev(p, async () => { await window.fbAvanceCampos('p2', { fotoPortada: 'data:image/jpeg;base64,' + 'A'.repeat(5000), notaLarga: 'x'.repeat(3000) }); await firebase.firestore().collection('usuarios').doc('uJuan').update({ fcmToken: 'tok-secreto-123', nombre: 'Juan Pérez R.' }); });
      await p.waitForTimeout(700); await flush(p);
      const L2 = await cambios(p), im = L2.find((x) => x.c === 'avanceObras' && x.f && x.f.some((f) => f.k === 'fotoPortada')), us = L2.find((x) => x.c === 'usuarios');
      const ff = im && im.f.find((f) => f.k === 'fotoPortada'), fl = im && im.f.find((f) => f.k === 'notaLarga');
      c(ff && ff.dj === '"[imagen]"' && ff.x === 'imagen' && fl && /… \(3000 letras\)/.test(fl.dj) && fl.dj.length < 600, 'sin imágenes ni base64; los textos largos cortados');
      c(us && us.f.find((f) => f.k === 'fcmToken').dj === '"[oculto]"' && !JSON.stringify(await audDocs(p)).includes('tok-secreto-123'), 'secretos «[oculto]» (nunca el token)');
      c((await audDocs(p)).every((d) => JSON.stringify(d).length < 1000000), 'cada documento de auditoria < 1 MB');
      const cu = await ev(p, () => window.__regCambios.cuenta());
      c(cu.aud >= 2 && cu.ops >= 17, `cuenta del día: ${cu.ops} escrituras de la app, ${cu.aud} de registro`);
      await ev(p, () => { window.__rcTopeDia = 0; }); await gesto(p); await ev(p, () => window.fbAvanceCampos('p2', { barrio: 'Alberdi' })); await p.waitForTimeout(2600); await flush(p);
      const rs = (await audDocs(p)).filter((d) => d.resumido);
      c(rs.length === 1 && rs[0].cambios[0].f[0].k === 'barrio' && !rs[0].cambios[0].f[0].dj && /barrio/.test(rs[0].detalle), 'cerca del cupo: solo resúmenes (sin valores) y más tiempo juntando');
      // sin señal: se anota igual, no se traba y sale cuando vuelve
      await ev(p, () => { window.__rcTopeDia = 400; window.__stubSinRed = true; }); const a0 = (await ev(p, () => window.__regCambios.cuenta())).aud;
      await gesto(p); await ev(p, () => { window.fbAvanceCampos('p2', { barrio: 'Sin señal' }); }); await p.waitForTimeout(700); await flush(p);
      await gesto(p); await ev(p, () => { window.fbAvanceCampos('p1', { direccion: 'Calle sin señal 1' }); }); await p.waitForTimeout(700); await flush(p);
      const a1 = (await ev(p, () => window.__regCambios.cuenta())).aud;
      await ev(p, () => { window.__stubSinRed = false; }); await p.waitForTimeout(1500);
      const L3 = await cambios(p);
      c(a1 - a0 === 2 && L3.some((x) => x.f && x.f.some((f) => f.dj === '"Sin señal"')) && L3.some((x) => x.f && x.f.some((f) => f.dj === '"Calle sin señal 1"')), 'sin señal: se anota igual (no se traba) y sale cuando vuelve');
      await A.browser.close();
    }
    // ================================================================= 2) la hoja «📜 Historial de cambios»
    if (SOLO(2)) {
      const A = await sesion('admin'), p = A.page;
      await gesto(p); await ev(p, () => window.fbAvanceCampos('p1', { mapaColor: '#1A73E8' })); await flush(p);
      await gesto(p); await ev(p, () => window.fbGastoEliminar('g1')); await flush(p);
      await gesto(p); await ev(p, () => window.fbGuardarProductoCatalogo({ codigo: '1019', costo: 130 })); await flush(p);
      await ev(p, () => window.__guardian.abrir()); await p.waitForTimeout(1300);
      c(await ev(p, () => !!document.querySelector('#gdOv [data-rc="abrir"]')), 'Guardián: botón «📜 Historial de cambios»');
      await p.click('#gdOv [data-rc="abrir"]'); await p.waitForTimeout(1200);
      let h = await ev(p, () => { const v = document.getElementById('rcOv'); return v ? { t: v.innerText, rol: v.getAttribute('role'), x: !!v.querySelector('[aria-label="Cerrar"]'), n: v.querySelectorAll('.rc-e').length } : null; });
      c(h && h.rol === 'dialog' && h.x && h.n >= 3 && /Borró el gasto/.test(h.t) && /color del pin/.test(h.t) && /Ana Admin/.test(h.t), `la hoja con ${h && h.n} cambios, quién y qué`);
      c(/escrituras de registro/.test(h.t) && /20\.000/.test(h.t), 'dice lo que cuesta hoy (escrituras contra el cupo)');
      await p.selectOption('#rcTipo', 'borrado'); await p.waitForTimeout(300);
      h = await ev(p, () => [...document.querySelectorAll('#rcOv .rc-e')].map((e) => e.innerText));
      c(h.length === 1 && /Borró el gasto/.test(h[0]), 'filtro tipo «Borrados»: solo el gasto');
      await p.selectOption('#rcTipo', 'todos'); await p.fill('#rcTexto', 'precio'); await p.waitForTimeout(600);
      h = await ev(p, () => [...document.querySelectorAll('#rcOv .rc-e')].map((e) => e.innerText));
      c(h.length === 1 && /CABLE/.test(h[0]), 'filtro de texto «precio»');
      await p.fill('#rcTexto', ''); await p.waitForTimeout(500);
      await p.selectOption('#rcCol', 'avanceObras'); await p.waitForTimeout(300);
      h = await ev(p, () => [...document.querySelectorAll('#rcOv .rc-e')].map((e) => e.innerText));
      c(h.length >= 1 && h.every((x) => /pin|obra/i.test(x)), 'filtro por sección (Obras)');
      await p.selectOption('#rcCol', ''); await p.selectOption('#rcPersona', 'admin@ema-alumbrado.app'); await p.fill('#rcObra', 'san martín'); await p.waitForTimeout(600);
      h = await ev(p, () => [...document.querySelectorAll('#rcOv .rc-e')].map((e) => e.innerText));
      c(h.length >= 2 && h.every((x) => /Ana Admin/.test(x)), `filtros persona + obra (${h.length})`);
      await p.fill('#rcObra', ''); await p.waitForTimeout(500);
      // volver el color
      const eidCol = await ev(p, () => { const e = [...document.querySelectorAll('#rcOv .rc-e')].find((x) => /color del pin/.test(x.innerText)); return e && e.dataset.rce; });
      await p.click(`#rcOv [data-rc="ver:${eidCol}"]`); await p.waitForTimeout(300);
      const det = await ev(p, () => document.querySelector('#rcOv .rc-e.ab').innerText);
      c(/rojo/.test(det) && /azul/.test(det) && /Volver este cambio/.test(det), 'abierto: antes → después (rojo → azul) y «↶ Volver este cambio»');
      await p.click(`#rcOv [data-rc="volver:${eidCol}"]`); await p.waitForTimeout(800);
      c(/¿Volver estos datos a como estaban\?/.test(await ev(p, () => document.getElementById('rcOv').innerText)), 'pide el «Sí»');
      await p.click('#rcOv [data-rc="si"]'); await p.waitForTimeout(1500);
      let d = await db(p);
      c(d.avanceObras.p1.mapaColor === '#EA4335', 'con «Sí» el pin vuelve a rojo');
      await flush(p);
      let L = await cambios(p);
      c(L.some((x) => x.c === 'avanceObras' && x.o === 'revertir' && x.rev === eidCol && /de azul a rojo/.test(x.r)) && (await audDocs(p)).some((x) => x.accion === 'cambio_revertido'), 'la vuelta atrás también queda anotada (origen «volvió un cambio»)');
      // volver a crear el gasto borrado
      await p.waitForTimeout(800);
      await ev(p, () => window.__regCambios.cerrar()); await ev(p, () => window.__regCambios.abrir({ f: { tipo: 'borrado' } })); await p.waitForTimeout(1200);
      const eidG = await ev(p, () => { const e = [...document.querySelectorAll('#rcOv .rc-e')].find((x) => /Borró el gasto/.test(x.innerText)); return e && e.dataset.rce; });
      await p.click(`#rcOv [data-rc="ver:${eidG}"]`); await p.waitForTimeout(300);
      await p.click(`#rcOv [data-rc="volver:${eidG}"]`); await p.waitForTimeout(800);
      c(/¿Volver a crear lo borrado\?/.test(await ev(p, () => document.getElementById('rcOv').innerText)), 'borrado: «¿Volver a crear lo borrado?»');
      await p.click('#rcOv [data-rc="si"]'); await p.waitForTimeout(1500);
      d = await db(p);
      c(d.gastosObra.g1 && d.gastosObra.g1.importe === 12000 && d.gastosObra.g1.desc === 'Hormigón elaborado', 'con «Sí» el gasto vuelve con el mismo id y sus datos');
      await ev(p, () => { window.__rcUltimoExcel = null; }); await p.click('#rcOv [data-rc="excel"]'); await p.waitForTimeout(600);
      const ex = await ev(p, () => window.__rcUltimoExcel && window.__rcUltimoExcel.secciones[0]);
      c(ex && ex.cols.indexOf('Antes') >= 0 && ex.filas.some((r) => /Hormigón/.test(r.join(' '))), `Excel con antes y después (${ex && ex.filas.length} filas)`);
      await p.click('#rcOv [data-rc="pdf"]'); await p.waitForTimeout(900);
      c(await ev(p, () => !!document.getElementById('hojaOv') && /Historial de cambios/.test(document.getElementById('hojaOv').innerText)), 'PDF (hoja A4)');
      await ev(p, () => { const h = document.getElementById('hojaOv'); const x = h && h.querySelector('[aria-label="Cerrar"], .hj-x, [data-hj="cerrar"]'); x ? x.click() : h && h.remove(); }); await p.waitForTimeout(300);
      c(await ev(p, () => document.documentElement.scrollWidth <= window.innerWidth + 1), 'sin scroll de costado');
      await A.browser.close();
    }
    // ================================================================= 3) la alerta del Guardián lleva a los cambios
    if (SOLO(3)) {
      const A = await sesion('admin'), p = A.page;
      await gesto(p);
      await ev(p, () => { const P = window.__personalNube; return firebase.firestore().collection('configEquipo').doc('personal').update({ nomina: P.nomina.slice(0, 11), vehiculos: [] }); });
      await p.waitForTimeout(600); await flush(p);
      await ev(p, async () => { await window.__guardian.tic(); }); await p.waitForTimeout(800);
      const al = await ev(p, () => window.__guardian.abiertas().map((a) => ({ clave: a.clave, lista: a.lista, texto: a.texto })));
      const an = al.find((a) => a.lista === 'nomina');
      c(an && /Se borraron 4 personas/.test(an.texto), 'el Guardián avisa: ' + (an && an.texto));
      const causa = await ev(p, async (k) => { const a = window.__guardian.abiertas().find((x) => x.clave === k); return (await window.__regCambios.causasAlerta(a)).map((E) => ({ r: E.r, u: E.usuario, eid: E.eid })); }, an && an.clave);
      c(causa.length >= 1 && causa[0].u === 'admin@ema-alumbrado.app' && /sacó Bruno Federico Cherino|sacó/.test(causa[0].r), 'la causa: quién y qué (' + (causa[0] && causa[0].r.slice(0, 120)) + ')');
      await ev(p, () => window.__guardian.abrir()); await p.waitForTimeout(1300);
      c(await ev(p, (k) => !!document.querySelector(`#gdOv [data-rc="alerta:${k}"]`), an.clave), 'en la alerta: «📜 Quién lo cambió»');
      await p.click(`#gdOv [data-rc="alerta:${an.clave}"]`); await p.waitForTimeout(1500);
      const est = await ev(p, () => ({ e: window.__regCambios.estado(), t: document.getElementById('rcOv').innerText, m: document.querySelectorAll('#rcOv .rc-e.marcada').length }));
      c(est.m >= 1 && est.e.marcados.indexOf(causa[0].eid) >= 0 && /Los cambios que pueden haber causado/.test(est.t) && /nómina/.test(est.t), 'abre el historial con ese cambio marcado y abierto');
      await A.browser.close();
    }
    // ================================================================= 4) asistente
    if (SOLO(4)) {
      const A = await sesion('admin', { iaPro: true, v155: true, v175: true, v177: true, v178: true }), p = A.page;
      await gesto(p); await ev(p, () => window.fbGastoEliminar('g1')); await flush(p);
      await gesto(p); await ev(p, () => window.fbAvanceCampos('p1', { nombre: 'PLAZA SAN MARTÍN SUR' })); await flush(p);
      const sw = await abrirIa(p);
      let ped = await decir(p, sw, '¿quién borró el gasto del hormigón?', [usa('historial_cambios', { tipo: 'borrado', coleccion: 'gastos', desde: 'hoy' }), fin('Lo borró Ana Admin hoy.')]);
      const hs = herramientas(ped), r1 = resultado(ped, 1);
      c(hs.indexOf('historial_cambios') >= 0 && hs.indexOf('proponer_revertir_cambio') >= 0, 'admin: el asistente tiene historial_cambios y proponer_revertir_cambio');
      c(/Borró el gasto de \$ 12\.000/.test(r1) && /Ana Admin/.test(r1) && /sePuedeVolver":true/.test(r1), 'historial_cambios: quién, qué y si se puede volver');
      const eid = (r1.match(/"id":"([^"]+#\d+)"/) || [])[1];
      ped = await decir(p, sw, '¿qué cambió hoy en las obras?', [usa('historial_cambios', { coleccion: 'obras', desde: 'hoy' }), fin('Renombraron.')]);
      c(/Renombró la obra PLAZA SAN MARTÍN → PLAZA SAN MARTÍN SUR/.test(resultado(ped, 1)), 'historial_cambios por sección (obras)');
      ped = await decir(p, sw, 'volvé a poner ese gasto', [usa('proponer_revertir_cambio', { id: eid }), fin('¿Lo vuelvo?')]);
      c(/Volver a crear lo borrado/.test(await tarjeta(p)), 'proponer_revertir_cambio: tarjeta «Volver a crear lo borrado»');
      await si(p);
      const d = await db(p);
      c(d.gastosObra.g1 && d.gastosObra.g1.importe === 12000, 'con «Sí» el gasto vuelve');
      await flush(p);
      c((await cambios(p)).some((x) => x.c === 'gastosObra' && x.t === 'alta' && x.o === 'asistente'), 'queda anotado como hecho por el asistente');
      await A.browser.close();
      const B = await sesion('ofi', { iaPro: true, v155: true, v175: true, v177: true, v178: true }), q = B.page;
      const sw2 = await abrirIa(q);
      const pd = await decir(q, sw2, '¿quién cambió algo?', [usa('historial_cambios', {}), fin('No sé.')]);
      c(herramientas(pd).indexOf('historial_cambios') < 0 && !/Borró/.test(resultado(pd, 1)), 'Oficina: el asistente no tiene el historial de cambios');
      await B.browser.close();
    }
    // ================================================================= 5) roles
    if (SOLO(5)) {
      for (const q of ['ofi', 'dir', 'juan']) {
        const A = await sesion(q, q === 'juan' ? { cel: true } : {}), p = A.page;
        const r = await ev(p, async () => ({ abre: await window.__regCambios.abrir(), hoja: !!document.getElementById('rcOv'), menu: !!document.getElementById('menuGuardian') }));
        c(!r.abre && !r.hoja && !r.menu, q + ': no ve el historial (solo Administración)');
        if (q !== 'dir') {
          await gesto(p);
          if (q === 'ofi') await ev(p, () => window.fbGastoAdd({ cat: 'materiales', fecha: '2026-11-19', desc: 'Piedra', importe: 3000, plazaId: 'p1', plazaNombre: 'PLAZA SAN MARTÍN', ts: Date.now() }));
          else await ev(p, () => window.fbOtCampo('ot1', { 'campo.marcas.rev': { hecha: true, por: 'Juan Pérez' } }));
          await p.waitForTimeout(1200); await flush(p);
          const L = await cambios(p), neg = await ev(p, () => (window.__stubNegadas || []).filter((x) => /auditoria/.test(x)));
          c(L.some((x) => x.usuario === (q === 'ofi' ? 'ofi' : 'juan') + '@ema-alumbrado.app') && !neg.length, q + ': su cambio queda anotado con su correo' + (REGLAS ? ' (las reglas lo dejan)' : '') + (neg.length ? ' ✗ ' + neg.join(',') : ''));
        }
        await A.browser.close();
      }
    }
    // ================================================================= 6) __v181No
    if (SOLO(6)) {
      const A = await sesion('admin', { antes: () => { window.__v181No = true; window.__gdEspera = 0; } }), p = A.page;
      await gesto(p); await ev(p, () => window.fbAvanceCampos('p1', { nombre: 'X' })); await p.waitForTimeout(1500);
      const x = await ev(p, () => ({ rc: !!window.__regCambios, b: !!document.querySelector('[data-rc]') }));
      c(!x.rc && !(await cambios(p)).length, '__v181No: nada del registro de cambios');
      await A.browser.close();
    }
  } catch (e) { console.log('ERROR', e); c(false, 'excepción: ' + (e && e.message)); }
  process.exit(c.fin() ? 1 : 0);
})();
