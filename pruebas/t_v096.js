// Pruebas v096 · «📸 Avance» de una orden en el tablero: tarea por tarea con marcas, quién, medidas y fotos (al visor), checklist,
// envíos, horas y novedades; se actualiza solo mientras la cuadrilla carga; botones Legajo / Ver / Revisar y cerrar.
const fs = require('fs');
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
const JPG = 'data:image/jpeg;base64,' + fs.readFileSync(__dirname + '/foto.jpg').toString('base64');
function datos() {
  const d = baseDatos(), ahora = Date.now(), ot = d.db.ordenesTrabajo.ot1;
  ot.actividades = ['montaje_prfv', 'zanjeo'];
  ot.previsto = { montaje_prfv: 4, zanjeo: 30 };
  ot.equipoTarea = { montaje_prfv: ['Juan Pérez', 'Pedro Gómez'] };
  ot.campo = {
    seguridad: { epp: true, baliza: true, herram: true, corte: 'no', por: 'Juan Pérez', ts: ahora - 3 * 3600e3 },
    marcas: { montaje_prfv: { hecho: true, cant: 3, por: 'Juan Pérez', ts: ahora - 3600e3 }, 'm:Revisar tablero': { hecho: false, motivo: 'material', por: 'Pedro Gómez', ts: ahora - 1800e3 } },
    medidas: { zanjeo: { prof: 0.8, ancho: 0.4, ts: ahora } },
    fotos: {
      adj1: { por: 'Juan Pérez', ts: ahora - 3500e3, k: 'montaje_prfv', tarea: 'Montaje de columna PRFV', cat: 'columna', num: 'Col 1', mini: JPG },
      adj2: { por: 'Pedro Gómez', ts: ahora - 3400e3, k: 'montaje_prfv', tarea: 'Montaje de columna PRFV', cat: 'columna', num: 'Col 2', mini: JPG },
      adj3: { por: 'Juan Pérez', ts: ahora - 3000e3, k: 'seguridad', tarea: 'Seguridad: balizado', cat: 'seguridad', num: '', mini: JPG },
      adj4: { por: 'Juan Pérez', ts: ahora - 2000e3, k: 'montaje_prfv', cat: 'columna', num: 'Col 3', mini: '', borrada: true }
    },
    enviados: { 'Juan Pérez': { nombre: 'Juan Pérez', ts: ahora - 600e3 } },
    horas: { juan_perez: { nombre: 'Juan Pérez', ini: '07:00', fin: '13:00', horas: 6 } },
    novedades: { 'Pedro Gómez': 'Faltó el tablerito de la C4' }
  };
  d.db.adjuntos = {}; ['adj1', 'adj2', 'adj3'].forEach((k) => { d.db.adjuntos[k] = { tipo: 'obra', plazaId: 'p1', plazaNombre: 'Plaza San Martín', dataUrl: JPG, ts: ahora, usuario: 'juan@x' }; });
  return d;
}
(async () => {
  const c = prueba('v096' + (cel ? ' cel' : ''));
  const A = await abrir({ sesion: 'admin', cel, datos: datos(), espera: 3500, reglas: true, https: true }), p = A.page;
  await p.evaluate(() => { mostrarVista('parte'); window.irSubOrdenes && irSubOrdenes('tablero'); }); await p.waitForTimeout(900);
  let r = await p.evaluate(() => { const c = document.querySelector('.ot-tb-card[data-otid="ot1"]'); return c ? { av: !!c.querySelector('[data-ota="avance"]'), txt: c.innerText.replace(/\s+/g, ' ') } : null; });
  c(r && r.av, 'cada tarjeta del tablero tiene «📸 Avance»: ' + (r && r.txt.slice(0, 80)));
  await p.click('.ot-tb-card[data-otid="ot1"] [data-ota="avance"]'); await p.waitForTimeout(600);
  const hoja = () => p.evaluate(() => { const o = document.getElementById('avOt'); return o ? { txt: o.innerText.replace(/\s+/g, ' '), fotos: o.querySelectorAll('[data-aofoto]').length, tareas: o.querySelectorAll('.ao-t').length } : null; });
  r = await hoja();
  c(r && /Plaza San Martín/.test(r.txt) && /OT-2026-001/.test(r.txt) && /en vivo/.test(r.txt), 'abre la hoja del avance de la orden, «en vivo»');
  c(r && /2 de 3 tareas marcadas/.test(r.txt) && /3 fotos/.test(r.txt), 'arriba: 2 de 3 tareas marcadas y 3 fotos (la borrada no cuenta): ' + (r && r.txt.slice(0, 160)));
  c(r && /Checklist ✓ Juan/.test(r.txt) && /Juan envió/.test(r.txt) && /Juan 07:00–13:00/.test(r.txt) && /Pedro: Faltó el tablerito de la C4/.test(r.txt), 'checklist de seguridad, quién envió, horas y novedades de cada uno');
  c(r && r.tareas === 3 && /Montaje de columna PRFV.*👥 Juan Pérez, Pedro Gómez.*previsto 4.*✓ Se hizo · 3/.test(r.txt) && /Marcó Juan a las/.test(r.txt), 'tarea por tarea: quién la hace (el grupo), previsto, «✓ Se hizo · 3» y quién marcó');
  c(r && /Revisar tablero.*✗ No se hizo · faltó material/.test(r.txt) && /Zanjeo.*⏳ Sin marcar/.test(r.txt), '«✗ No se hizo · faltó material» y «⏳ Sin marcar»');
  c(r && /📏 Profundidad: 0,80? m · Ancho: 0,40? m/.test(r.txt), 'las medidas cargadas, con su nombre y coma decimal: «Profundidad: 0,8 m · Ancho: 0,4 m»');
  c(r && r.fotos === 3, 'las fotos de la orden, con miniatura (2 de la columna + 1 de seguridad): ' + (r && r.fotos));
  if (cel) { const w = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, w: document.documentElement.clientWidth, x: document.querySelector('#avOt .ao-cuerpo').scrollWidth - document.querySelector('#avOt .ao-cuerpo').clientWidth })); c(w.sw <= w.w + 1 && w.x <= 1, 'celular: sin scroll de costado ' + JSON.stringify(w)); }
  await p.screenshot({ path: __dirname + '/v096_avance' + (cel ? '_cel' : '') + '.png' });
  // ---- tocar una foto: visor con todas las de la orden
  await p.click('#avOt [data-aofoto="1"]'); await p.waitForTimeout(800);
  r = await p.evaluate(() => ({ g: window.emaGaleria.actual(), t1: (document.querySelector('#gpVisor .gp-t1') || {}).textContent }));
  c(r.g && r.g.n === 3 && r.g.i === 1 && r.g.id === 'adj2' && /Col 2/.test(r.t1), 'tocando una foto se abre el visor con las 3 fotos, en esa: ' + JSON.stringify(r));
  await p.evaluate(() => window.emaGaleria.cerrar()); await p.waitForTimeout(400);
  c(!!(await p.evaluate(() => document.getElementById('avOt'))), 'al cerrar el visor sigue la hoja del avance');
  // ---- en vivo: la cuadrilla marca otra tarea y sube una foto
  await p.evaluate(() => fbOtUpdate('ot1', { 'campo.marcas.zanjeo': { hecho: true, cant: 25, por: 'Pedro Gómez', ts: Date.now() }, 'campo.fotos.adj5': { por: 'Pedro Gómez', ts: Date.now(), k: 'zanjeo', tarea: 'Zanjeo', cat: 'zanja', num: 'Tramo 1', mini: '' } }));
  const ok = await p.waitForFunction(() => /3 de 3 tareas marcadas/.test((document.getElementById('avOt') || {}).innerText || ''), null, { timeout: 6000 }).then(() => true, () => false);
  r = await hoja();
  c(ok && /Zanjeo.*✓ Se hizo · 25/.test(r.txt) && r.fotos === 4, 'se actualiza sola: la cuadrilla marca el zanjeo (25 m) y sube una foto → 3 de 3 y 4 fotos');
  // ---- botones
  await p.click('#avOt [data-ao="cerrar"]'); await p.waitForTimeout(800);
  r = await p.evaluate(() => ({ hoja: !!document.getElementById('avOt'), cierre: !!document.querySelector('#cierreCuerpo .cierre-qty') }));
  c(!r.hoja && r.cierre, '«Revisar y cerrar» abre el cierre de la orden');
  await p.evaluate(() => { const b = document.querySelector('#cierreCuerpo') && document.querySelector('[onclick*="cerrarCuadroCierre"], #cierreCancelar'); if (window.cerrarCuadroCierre) window.cerrarCuadroCierre(); }); await p.waitForTimeout(400);
  await p.evaluate(() => { mostrarVista('parte'); window.irSubOrdenes && irSubOrdenes('tablero'); }); await p.waitForTimeout(600);
  await p.click('.ot-tb-card[data-otid="ot1"] .pl'); await p.waitForTimeout(500);
  c(!!(await p.evaluate(() => document.getElementById('avOt'))), 'tocando el nombre de la plaza en la tarjeta también se abre');
  await p.click('#avOt [data-ao="legajo"]'); await p.waitForTimeout(1200);
  r = await p.evaluate(() => ({ hoja: !!document.getElementById('avOt'), vista: document.body.dataset.vista, legajo: ((document.getElementById('obrasApp') || {}).innerText || '').slice(0, 300) }));
  c(!r.hoja && r.vista === 'obras' && /San Mart/i.test(r.legajo), '«📁 Legajo de la obra» lleva al legajo de la plaza');
  await p.evaluate(() => { mostrarVista('parte'); window.irSubOrdenes && irSubOrdenes('tablero'); }); await p.waitForTimeout(600);
  await p.click('.ot-tb-card[data-otid="ot1"] [data-ota="avance"]'); await p.waitForTimeout(400);
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  c(!(await p.evaluate(() => document.getElementById('avOt'))), 'Escape la cierra');
  const ant = await p.evaluate(() => JSON.stringify(window.__stubDB().ordenesTrabajo.ot1));
  c(ant.indexOf('Tramo 1') >= 0, 'no cambia nada de la orden (solo la mira)');
  c(!A.errores.length, 'sin errores de JS ' + JSON.stringify(A.errores.slice(0, 3)));
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
