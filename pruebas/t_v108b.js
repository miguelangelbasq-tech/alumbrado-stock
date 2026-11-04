// Pruebas v108 (revisión): «Quedan» por partes, avance de antes de la v108, zanja a mano o con máquina con la misma parte,
// redondeo (la columna llega justo al 100 %), cable de subida sin cálculo, aviso por partes, etapas de las tareas nuevas
// y «Solo lo de esta obra» sin obra.
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
(async () => {
  const c = prueba('v108b' + (cel ? ' cel' : ''));
  const d = baseDatos(), hoy = d.hoy;
  d.db.avanceObras.p1.valorItems = [
    { id: 1, itemPliego: '5', cantidad: 4, cantidadAvanzada: 0 }, { id: 2, itemPliego: '6', cantidad: 4, cantidadAvanzada: 2 },
    { id: 3, itemPliego: '15', cantidad: 100, cantidadAvanzada: 0 }, { id: 4, itemPliego: '7', cantidad: 1, cantidadAvanzada: 0 },
    { id: 5, itemPliego: '30', cantidad: 50, cantidadAvanzada: 0 }, { id: 6, itemPliego: '9', cantidad: 1, cantidadAvanzada: 0 }];
  d.db.avanceObras.p2 = Object.assign({}, d.db.avanceObras.p1, { nombre: 'Plaza Colón', valorItems: [{ id: 1, itemPliego: '7', cantidad: 1, cantidadAvanzada: 0 }, { id: 2, itemPliego: '30', cantidad: 3, cantidadAvanzada: 0 }] });
  const P = [{ nombre: 'Juan Pérez', rol: 'Oficial' }], pn = ['juan perez'];
  const ot = (id, act, pz) => ({ numero: 'OT-2026-8' + id, fecha: hoy, plazaId: pz || 'p1', plazaNombre: pz ? 'Plaza Colón' : 'Plaza San Martín', cuadrilla: 'C1', horaInicio: '07:00', horaFin: '15:00', personal: P, personalNombres: pn, actividades: act, previsto: {}, estado: 'En curso', creado: Date.now() });
  const PARTES = ['excavacion', 'hormigonado', 'montaje_prfv', 'armado_vinculo', 'montaje_vinculo', 'armado_luminaria', 'montaje_luminaria', 'armado_tablerito', 'conexionado_tablerito', 'sellado_base'];
  d.db.ordenesTrabajo = { c1: ot('01', ['montaje_prfv']), c2: ot('02', ['zanjeo']), c3: ot('03', ['zanja_maquina', 'tapado_zanja']), c4: ot('04', PARTES, 'p2'), c5: ot('05', ['colocacion_tablero']) };
  const A = await abrir({ sesion: 'admin', cel, datos: d, espera: 3500, reglas: true, porPartes: true }), p = A.page;
  p.on('dialog', (x) => x.accept());
  await p.evaluate(() => mostrarVista('parte')); await p.waitForTimeout(400);
  const abrirC = async (id, q) => { await p.evaluate((id) => window.abrirCierreOt(id), id); await p.waitForTimeout(800); for (const [k, v] of Object.entries(q)) await p.fill(`#cierreCuerpo .cierre-qty[data-k="${k}"]`, String(v)); await p.waitForTimeout(900); return p.evaluate(() => (document.getElementById('cierreEfectos') || {}).textContent || ''); };
  const guardar = async () => { await p.evaluate(async () => { const x = document.querySelector('input[name="coCierreResp"][value="no"]'); x && (x.checked = true); await guardarCierreOt(); }); await p.waitForTimeout(1500); };
  const it = () => p.evaluate(() => Object.fromEntries(window.__stubDB().avanceObras.p1.valorItems.map((x) => [x.itemPliego, x.cantidadAvanzada])));
  // 1) 8 columnas PRFV (contratadas 4 + 4 + 1, de las del ítem 6 ya había 2 hechas de antes): entran 7, sobra 1
  let t = await abrirC('c1', { montaje_prfv: 8 });
  c(/solo su parte/.test(t), 'el cierre explica que cada tarea suma solo su parte del ítem');
  c(/sobran 1 columna/.test(t) && /Diferencias con lo hecho/.test(t), 'lo que sobra dice la unidad y dónde se revisa · ' + (t.match(/sobran[^.]*/) || [''])[0]);
  await guardar(); let v = await it();
  c(v['5'] === 1 && v['6'] === 2.5 && v['7'] === 0.25, 'el avance de antes (sin tarea anotada) cuenta como completo: ítem 6 pasa de 2 a 2,5 · ' + JSON.stringify(v));
  let a = await p.evaluate(() => window.__avanceDeObra('p1'));
  c(a.hecho.montaje_prfv === 9 && a.hecho.excavacion === 2 && a.total.montaje_prfv === 9, '«Quedan» de la orden: izaje 9 de 9, pozos solo las 2 de antes (no las 8 por el 25 % del ítem) · ' + JSON.stringify({ m: a.hecho.montaje_prfv, e: a.hecho.excavacion }));
  // 2) zanja a mano y después con máquina sobre los mismos metros: comparten el 70 %
  await abrirC('c2', { zanjeo: 100 }); await guardar();
  await abrirC('c3', { zanja_maquina: 100, tapado_zanja: 100 }); await guardar(); v = await it();
  c(v['15'] === 100, 'zanja a mano + con máquina no pasan del 70 %; con el tapado llega a 100 · ítem 15 = ' + v['15']);
  a = await p.evaluate(() => window.__avanceDeObra('p1'));
  c(a.hecho.zanjeo === 100 && a.hecho.zanja_maquina === 100, '«Quedan» de la zanja: hecha (por cualquiera de las dos) · ' + JSON.stringify({ z: a.hecho.zanjeo, zm: a.hecho.zanja_maquina }));
  // 3) una columna de 3 brazos con todas sus tareas llega justo a 1 (sin quedar en 0,99); el cable de subida sin cálculo no se toca
  const tot = await p.evaluate(() => (window.totalesDeObra(avanceObras.find((o) => o.id === 'p2')) || {}).montaje_luminaria || 0);
  t = await abrirC('c4', { excavacion: 1, hormigonado: 1, montaje_prfv: 1, armado_vinculo: 1, montaje_vinculo: 1, armado_luminaria: 3, montaje_luminaria: 3, armado_tablerito: 1, conexionado_tablerito: 1, sellado_base: 1 });
  c(/vínculo|Vínculo/i.test(t) && (await p.$$eval('#cierreEfectos .cierre-etapa[data-key="vinculos"]', (x) => x.length)) === 1, 'las tareas nuevas proponen su etapa (montaje de vínculo → «vínculos»)');
  await guardar(); v = await it();
  v = await p.evaluate(() => Object.fromEntries(window.__stubDB().avanceObras.p2.valorItems.map((x) => [x.itemPliego, x.cantidadAvanzada])));
  c(v['7'] === 1, 'columna de 3 brazos con sus 10 tareas: el ítem 7 queda en 1 justo · ' + v['7']);
  c(tot > 0 || v['30'] === 0, 'sin cálculo de luminarias, el cable de subida (ítem 30) no se llena con una sola · tot ' + tot + ' · ítem 30 = ' + v['30']);
  // 4) tablero: propone la etapa del tablero
  t = await abrirC('c5', { colocacion_tablero: 1 });
  c((await p.$$eval('#cierreEfectos .cierre-etapa[data-key="tableroConexion"]', (x) => x.length)) === 1, 'colocación del tablero propone la etapa «tablero»');
  await p.evaluate(() => { const x = document.querySelector('#cierreOv, .cierre-ov'); x && x.remove(); });
  // 5) «Solo lo de esta obra» en una orden nueva sin obra
  await p.evaluate(() => { mostrarVista('parte'); const s = document.getElementById('otPlaza'); if (s) { s.value = ''; s.dispatchEvent(new Event('change', { bubbles: true })); } }); await p.waitForTimeout(1800);
  r = await p.evaluate(async () => { const b = document.getElementById('otSoloObra'); if (!b) return { sin: true }; b.click(); await new Promise((r) => setTimeout(r, 100)); return { txt: b.textContent, on: document.getElementById('otActividades').classList.contains('solo-obra') }; });
  c(r.sin || (!r.on && /Elegí una obra/.test(r.txt)), 'sin obra elegida, «Solo lo de esta obra» avisa y no deja la lista vacía · ' + JSON.stringify(r));
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})();
var r;
