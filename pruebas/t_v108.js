// Pruebas v108 · el circuito de la obra: diccionario de tareas (una acción cada una), cierre por partes del ítem,
// «🔎 Diferencias con lo hecho» en el Itemizado (Sí / No), «Solo lo de esta obra» en la orden y el baremo con el diccionario.
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
(async () => {
  const c = prueba('v108' + (cel ? ' cel' : ''));
  const d = baseDatos(), hoy = d.hoy;
  d.db.avanceObras.p1.valorItems = [{ id: 1, itemPliego: '5', cantidad: 7, cantidadAvanzada: 0 }, { id: 2, itemPliego: '15', cantidad: 100, cantidadAvanzada: 0 }];
  const P = [{ nombre: 'Juan Pérez', rol: 'Oficial' }, { nombre: 'Pedro Gómez', rol: 'Ayudante' }], pn = ['juan perez', 'pedro gomez'];
  const ot = (id, act, extra) => Object.assign({ numero: 'OT-2026-6' + id, fecha: hoy, plazaId: 'p1', plazaNombre: 'Plaza San Martín', cuadrilla: 'C1', horaInicio: '07:00', horaFin: '15:00', personal: P, personalNombres: pn, actividades: act, previsto: {}, estado: 'En curso', creado: Date.now() }, extra || {});
  d.db.ordenesTrabajo = { a1: ot('01', ['montaje_prfv', 'zanjeo', 'prueba_encendido']) };
  const A = await abrir({ sesion: 'admin', cel, datos: d, espera: 3500, reglas: true }), p = A.page;
  p.on('dialog', (x) => x.accept());
  let r = await p.evaluate(() => { const ids = ACTIVIDADES_CATALOGO.map((x) => x.id); return { nuevas: ['armado_luminaria', 'montaje_luminaria', 'armado_vinculo', 'montaje_vinculo', 'armado_tablerito', 'conexionado_tablerito', 'colocacion_tablero', 'armado_tablero', 'poste_madera', 'basura_grua', 'limpieza_obra'].every((k) => ids.includes(k)), vieja: metaDeTarea('vinculo_luminaria').fase, pts: (window.baremoActual() || {}).armado_tablero, partes: metaDeTarea('montaje_prfv').grupos[0].pct }; });
  c(r.nuevas && /Tareas viejas/.test(r.vieja) && r.pts && r.pts.pts === 5.6 && r.partes === 0.25, 'el diccionario suma las tareas claras (armar luminaria, montar vínculo, tablerito, tablero…) con puntos = horas × dificultad; las viejas quedan aparte · ' + JSON.stringify(r));
  // cierre por partes
  await p.evaluate(() => mostrarVista('parte')); await p.waitForTimeout(400);
  const cerrar = async (id, q) => {
    await p.evaluate((id) => window.abrirCierreOt(id), id); await p.waitForTimeout(800);
    for (const [k, v] of Object.entries(q)) await p.fill(`#cierreCuerpo .cierre-qty[data-k="${k}"]`, String(v));
    await p.waitForTimeout(900);
    const txt = await p.evaluate(() => (document.getElementById('cierreEfectos') || {}).innerText || '');
    await p.evaluate(async () => { const x = document.querySelector('input[name="coCierreResp"][value="no"]'); x && (x.checked = true); await guardarCierreOt(); });
    await p.waitForTimeout(1500); return txt;
  };
  let txt = await cerrar('a1', { montaje_prfv: 7, zanjeo: 100, prueba_encendido: 1 });
  r = await p.evaluate(() => { const o = window.__stubDB().avanceObras.p1, t = window.__stubDB().ordenesTrabajo.a1; return { it: o.valorItems.map((x) => x.itemPliego + ':' + x.cantidadAvanzada), k: (t.cierre.avanceItems || []).map((x) => x.id + '/' + x.k + '/' + x.delta) }; });
  c(/25 % del ítem/.test(txt) && r.it.join() === '5:1.75,15:70', 'el izaje de 7 columnas suma su parte (25 %) del ítem de columna completa, y la zanja a mano su 70 %: ya no queda la columna al 100 % de golpe · ' + JSON.stringify(r));
  c(r.k.join() === '5/montaje_prfv/1.75,15/zanjeo/70', 'queda anotado qué tarea sumó cada parte');
  c(!/prueba de encendido/i.test(txt.split('Avance del Itemizado')[1] || ''), 'las tareas que no avanzan el itemizado (prueba de encendido) dan puntos pero no piden ítem');
  // otra orden que vuelve a montar (una columna de más)
  await p.evaluate(async (o) => { await firebase.firestore().collection('ordenesTrabajo').doc('a2').set(o); }, ot('02', ['montaje_prfv', 'zanjeo']));
  await p.waitForTimeout(700);
  txt = await cerrar('a2', { montaje_prfv: 1, zanjeo: 20 });
  r = await p.evaluate(() => { const o = window.__stubDB().avanceObras.p1; return o.valorItems.map((x) => x.itemPliego + ':' + x.cantidadAvanzada).join(); });
  c(/sobran 1,00/.test(txt) && /sobran 20,00/.test(txt) && r === '5:1.75,15:70', 'una columna y 20 m de más no se meten en la parte de otras tareas: quedan como «sobran» · ' + r);
  // diferencias con lo hecho
  r = await p.evaluate(() => window.__diferenciasObra(avanceObras.find((x) => x.id === 'p1')).map((d) => d.nombre + ':' + d.hecho + '/' + d.contratado));
  c(r.join() === 'Columnas PRFV:8/7,Zanja:120/100', 'Diferencias con lo hecho: columnas 8 hechas de 7 contratadas, zanja 120 de 100 · ' + r.join());
  await p.evaluate(() => window.__verDiferencias('p1')); await p.waitForTimeout(400);
  await p.click('#difOv [data-difsi="0"]'); await p.waitForTimeout(1200);
  r = await p.evaluate(() => { const o = window.__stubDB().avanceObras.p1; const f = o.valorItems.find((x) => x.itemPliego === '5'); return { cant: f.cantidad, av: f.cantidadAvanzada, aj: (o.coAjustes || []).map((a) => a.itemId + ':' + a.delta + ':' + a.motivo), quedan: (window.__diferenciasObra(avanceObras.find((x) => x.id === 'p1')) || []).map((d) => d.nombre) }; });
  c(r.cant === 8 && r.aj.length === 1 && /^5:1:Hecho de más/.test(r.aj[0]) && r.av > 1.75 && r.quedan.join() === 'Zanja', '«Sí, sumar»: el ítem 5 pasa a 8, queda en el historial de ajustes y avanza lo hecho · ' + JSON.stringify(r));
  await p.click('#difOv [data-difno="0"]'); await p.waitForTimeout(1200);
  r = await p.evaluate(() => { const o = window.__stubDB().avanceObras.p1; return { z: o.valorItems.find((x) => x.itemPliego === '15').cantidad, desc: Object.keys(o.difDescartadas || {}), quedan: window.__diferenciasObra(avanceObras.find((x) => x.id === 'p1')).length }; });
  c(r.z === 100 && r.desc.join() === 'Zanja' && r.quedan === 0, '«No»: la zanja queda como estaba y no vuelve a preguntar · ' + JSON.stringify(r));
  await p.evaluate(() => { const o = document.getElementById('difOv'); o && o.remove(); });
  // orden nueva: solo lo de esta obra
  r = await p.evaluate(async () => { window.irSubOrdenes('nueva'); await new Promise((s) => setTimeout(s, 800)); const b = document.getElementById('otSoloObra'); return !!b; });
  c(r, 'en la orden está «📋 Solo lo de esta obra»');
  // baremo con el diccionario
  r = await p.evaluate(async () => { mostrarVista('produccion'); await new Promise((s) => setTimeout(s, 400)); const b = [...document.querySelectorAll('#viewProduccion [data-sub], #viewProduccion button')].find((x) => /vale cada tarea|Baremo/i.test(x.textContent)); b && b.click(); const pb = document.getElementById('prodPanelBaremo'); pb && (pb.style.display = ''); await new Promise((s) => setTimeout(s, 900)); window.__circuitoObra.baremo(); const tr = document.querySelector('#tablaBaremo tr[data-k="armado_tablero"]'); return tr ? tr.children[3].innerText.replace(/\s+/g, ' ') : null; });
  c(r && /5,6/.test(r) && /HH/.test(r), 'Producción › Cuánto vale cada tarea: al lado sale el valor del diccionario (horas × dificultad), no el del pliego · ' + r);
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})();
