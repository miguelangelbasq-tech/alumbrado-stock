// Pruebas v112 · «Llenar orden» por pasos con resumen y puntos por persona, obras/gente con un toque, cartel de pendientes;
// la cuadrilla envía entre varios y queda lo más completo; tareas de barrio y reclamos; «＋ Crear tarea» en Producción.
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
(async () => {
  const c = prueba('v112' + (cel ? ' cel' : ''));
  const d = baseDatos(), hoy = d.hoy;
  d.db.avanceObras.p1.valorItems = [{ id: 1, itemPliego: '5', cantidad: 7, cantidadAvanzada: 0 }];
  d.db.configEquipo.personal.vehiculos = [{ id: 'v1', nombre: 'Hilux', patente: 'AB123CD' }, { id: 'v2', nombre: 'Ranger', patente: '' }];
  d.db.configEquipo.personal.lista[0].vehiculoId = 'v1'; d.db.configEquipo.personal.lista[1].vehiculoId = 'v2';
  d.db.ordenesTrabajo = { v1: { numero: 'OT-2026-090', fecha: hoy, plazaId: 'p1', plazaNombre: 'Plaza San Martín', personal: [{ nombre: 'Juan Pérez', rol: 'Oficial' }], personalNombres: ['juan perez'], actividades: ['poda'], previsto: { poda: 1 }, estado: 'Anulada', creado: Date.now() - 86400000 } };
  const A = await abrir({ sesion: 'admin', cel, datos: d, espera: 3500, porPartes: true, ofPasos: true }), p = A.page;
  p.on('dialog', (x) => x.accept());
  await p.evaluate(() => mostrarVista('parte')); await p.waitForTimeout(500);
  await p.click('#subtabsOrdenes .subtab[data-sub="nueva"]'); await p.waitForTimeout(1800);
  // 1) pasos
  let r = await p.evaluate(() => ({ pasos: [...document.querySelectorAll('#ofPasos .of-paso')].map((b) => b.textContent.trim()), vis: [...document.querySelectorAll('#viewParteDiario > .grid > div:first-child > .card[data-paso]')].filter((x) => x.offsetParent !== null).map((x) => x.dataset.paso), res: !!document.getElementById('ofResumen'), vacia: (document.getElementById('parteResultCard') || {}).style.display }));
  c(r.pasos.length === 4 && r.vis.join() === '1' && r.res && r.vacia === 'none', 'Llenar orden por pasos (Obra · Gente · Tareas · Material), un paso a la vista y el resumen en vez de la hoja vacía · ' + r.pasos.join(' | '));
  // 2) obra reciente con un toque → cartel de pendientes
  r = await p.evaluate(() => [...document.querySelectorAll('#ofObrasRec [data-of-obra]')].map((b) => b.textContent));
  c(r.includes('Plaza San Martín'), 'obras recientes con un toque · ' + r.join(', '));
  await p.click('#ofObrasRec [data-of-obra="p1"]'); await p.waitForTimeout(1500);
  r = await p.evaluate(() => !!document.getElementById('ofPend'));
  c(!r, 'v119: al elegir la obra el cartel de pendientes ya NO se abre solo (pedido de Ángel)');
  await p.evaluate(() => { const b = document.querySelector('[data-of-pend]'); b && b.click(); }); await p.waitForTimeout(800);
  r = await p.evaluate(() => ({ t: (document.querySelector('#ofPend h3') || {}).textContent || '', n: document.querySelectorAll('#ofPend [data-op-k]').length, ks: [...document.querySelectorAll('#ofPend [data-op-k]')].map((x) => x.dataset.opK) }));
  c(/tareas pendientes/.test(r.t) && r.n >= 5 && r.ks.includes('montaje_prfv'), 'con el botón «Ver las N tareas pendientes» sale el cartel · ' + r.t);
  // dejar solo 2: montaje y excavación
  await p.evaluate(() => { document.querySelectorAll('#ofPend [data-op-k]').forEach((x) => { x.checked = ['montaje_prfv', 'excavacion'].includes(x.dataset.opK); }); });
  await p.click('#ofPend [data-op="si"]'); await p.waitForTimeout(800);
  r = await p.evaluate(() => ({ marc: [...document.querySelectorAll('#otActividades .ot-act-check:checked')].map((x) => x.value).sort(), prev: (document.querySelector('#otActividades .ot-act-prev[data-id="montaje_prfv"]') || {}).value, paso: (document.querySelector('#ofPasos .of-paso.on') || {}).dataset.ofIr }));
  c(r.marc.join() === 'excavacion,montaje_prfv' && r.prev === '7' && r.paso === '3', 'agrega solo las elegidas, con lo que queda (7), y lleva al paso de tareas · ' + JSON.stringify(r));
  // 3) gente con un toque
  await p.click('#ofPasos .of-paso[data-of-ir="2"]'); await p.waitForTimeout(300);
  await p.click('#ofGenteRap [data-of-gente="Juan Pérez"]'); await p.waitForTimeout(300);
  await p.click('#ofGenteRap [data-of-gente="Pedro Gómez"]'); await p.waitForTimeout(500);
  r = await p.evaluate(() => personal.map((x) => x.nombre + '/' + x.rol));
  c(r.join() === 'Juan Pérez/Oficial,Pedro Gómez/Ayudante', 'la gente de la nómina se suma con un toque (con su rol) · ' + r.join(', '));
  await p.fill('#otCuadrilla', 'Cuadrilla 1'); await p.waitForTimeout(1500);
  // en qué vehículo va cada uno (con los vehículos de la orden; sale el que tiene a cargo o el primero; se puede cambiar)
  await p.click('#otVehBox [data-otveh="v1"]'); await p.waitForTimeout(300); await p.click('#otVehBox [data-otveh="v2"]'); await p.waitForTimeout(1200);
  r = await p.evaluate(() => [...document.querySelectorAll('#vpBox [data-vp]')].map((s) => s.dataset.vp + '=' + s.value));
  c(r.join() === 'Juan Pérez=v1,Pedro Gómez=v1', 'con dos vehículos en la orden, cada persona elige en cuál va (de entrada, el primero) · ' + r.join(', '));
  await p.selectOption('#vpBox [data-vp="Pedro Gómez"]', 'v2'); await p.waitForTimeout(1200);
  r = await p.evaluate(() => (document.querySelector('#ofResumen .of-fila[data-of-ir="2"] small') || {}).textContent || '');
  c(/Hilux: Juan · Ranger: Pedro/.test(r), 'el resumen dice en qué vehículo va cada uno · ' + r);
  // 4) puntos por persona si terminan todo
  r = await p.evaluate(() => [...document.querySelectorAll('#ofResumen .of-pp')].map((x) => x.textContent.replace(/\s+/g, ' ').trim()));
  c(r.length === 3 && /Juan Pérez/.test(r[0]) && /pts/.test(r[1]) && /Total/.test(r[2]), 'el resumen dice los puntos de cada uno si terminan todo · ' + r.join(' | '));
  if (cel) { const sw = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth), bar = await p.evaluate(() => { const b = document.getElementById('ofBarra'); return b && getComputedStyle(b).display; }); c(sw <= 0 && bar === 'flex', 'celu: sin scroll de costado y barra fija abajo con «Emitir» · ' + sw + ' ' + bar); await p.screenshot({ path: __dirname + '/v112_orden_cel.png' }); }
  else await p.screenshot({ path: __dirname + '/v112_orden_pc.png' });
  // 5) emitir desde el resumen
  await p.click('#ofResumen [data-of-emitir]'); await p.waitForTimeout(2500);
  r = await p.evaluate(() => Object.values(window.__stubDB().ordenesTrabajo).filter((o) => o.estado !== 'Anulada').map((o) => ({ pz: o.plazaId, act: (o.actividades || []).slice().sort().join(), pers: (o.personal || []).length, vp: Object.entries(o.vehiculoPersona || {}).map(([n, v]) => n + '=' + v.nombre).join() })));
  c(r.length === 1 && r[0].pz === 'p1' && r[0].act === 'excavacion,montaje_prfv' && r[0].pers === 2 && r[0].vp === 'Juan Pérez=Hilux,Pedro Gómez=Ranger', '«Emitir» del resumen emite la orden como siempre · ' + JSON.stringify(r));
  // 6) la cuadrilla: lo más completo gana
  r = await p.evaluate(() => {
    const L = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const ot = { campo: { marcas: { montaje_prfv: { k: 'montaje_prfv', hecho: true, cant: 4, por: 'Juan Pérez', ts: 1 } } } };
    const p1 = window.__marcaEquipo(ot, 'montaje_prfv', 'Pedro Gómez', { k: 'montaje_prfv', hecho: true, cant: 2, por: 'Pedro Gómez', ts: 2 }, L);
    const m1 = p1['campo.marcas.montaje_prfv'];
    ot.campo.marcasPor = { montaje_prfv: { juan_p_rez: ot.campo.marcas.montaje_prfv, pedro_g_mez: { hecho: true, cant: 2, por: 'Pedro Gómez', ts: 2 } } };
    const m2 = window.__marcaEquipo(ot, 'montaje_prfv', 'Pedro Gómez', { k: 'montaje_prfv', hecho: false, cant: 0, por: 'Pedro Gómez', ts: 3 }, L)['campo.marcas.montaje_prfv'];
    return { c1: m1.cant, h1: m1.hecho, t1: m1.porTodos, c2: m2.cant, h2: m2.hecho };
  });
  c(r.c1 === 4 && r.h1 && r.t1.length === 2 && r.c2 === 4 && r.h2, 'si dos marcan la misma tarea queda lo más completo (4, no el 2 del segundo), aunque uno la desmarque · ' + JSON.stringify(r));
  // 7) tareas de barrio y reclamos
  r = await p.evaluate(() => ['corte_media', 'reclamo_revision', 'cambio_termica', 'subir_termica'].map((k) => { const a = ACTIVIDADES_CATALOGO.find((x) => x.id === k); return a ? `${a.label} · ${metaDeTarea(k).fase} · ${(window.__DICC_ID[k] || {}).pts}` : 'FALTA ' + k; }));
  c(r.every((x) => /Barrios y reclamos/.test(x)), 'tareas de barrio y reclamos en el diccionario, con sus puntos · ' + r.join(' | '));
  // 8) Producción › Cuánto vale cada tarea: explicación y «＋ Crear tarea»
  await p.evaluate(() => mostrarVista('produccion')); await p.waitForTimeout(600);
  await p.evaluate(() => { const b = [...document.querySelectorAll('#subtabsProd .subtab')].find((x) => /vale/i.test(x.textContent)); b && b.click(); }); await p.waitForTimeout(1500);
  r = await p.evaluate(() => ({ como: /1 punto = 1 hora-hombre/.test((document.querySelector('#tnCard .tn-como') || {}).textContent || '') }));
  await p.fill('#tnNom', 'Cambio de fotocontrol'); await p.fill('#tnUn', 'fotocontrol'); await p.fill('#tnHh', '0.5');
  await p.click('#tnCard [data-tn-f="alt"]'); await p.click('#tnCard [data-tn-f="rie"]'); await p.waitForTimeout(200);
  const res = await p.evaluate(() => document.getElementById('tnRes').textContent);
  c(r.como && /0,5 h × 1,4 de dificultad = 0,7 puntos por fotocontrol/.test(res), 'explica cómo se suman los puntos y calcula la tarea nueva al instante · ' + res);
  await p.click('#tnCrear'); await p.waitForTimeout(1500);
  r = await p.evaluate(() => { const a = ACTIVIDADES_CATALOGO.find((x) => x.label === 'Cambio de fotocontrol'); const b = (window.__stubDB().configEquipo || {}).baremo || {}; const s = (b.tareasPropias || []).find((x) => x.label === 'Cambio de fotocontrol'); return { ok: !!a, fase: a && metaDeTarea(a.id).fase, s: s && { pts: s.pts, un: s.un, fase: s.fase, hh: s.hh } }; });
  c(r.ok && r.fase === 'Varios' && r.s && r.s.pts === 0.7 && r.s.hh === 0.5 && r.s.fase === 'Varios', '«＋ Crear la tarea» la guarda para todo el equipo con su fase, horas y puntos · ' + JSON.stringify(r));
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})();
