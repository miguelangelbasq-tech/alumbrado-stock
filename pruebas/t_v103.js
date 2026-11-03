// Pruebas v103 · respuestas de Ángel: cables en m y alambre en kg, 7004–7007 de baja, mismo material con otro código,
// ganancia = caja 3,5 + 0,5 y 5 % de reserva (el ítem sin la reserva), provisiones fuera del %, puntos desde noviembre.
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
(async () => {
  const c = prueba('v103' + (cel ? ' cel' : ''));
  const A = await abrir({ sesion: 'admin', cel, datos: baseDatos(), espera: 3500, reglas: true, pisoReal: true }), p = A.page;
  let r = await p.evaluate(() => { const g = (k) => (catalogoCompleto().find((x) => x.codigo === k) || {}); return { c1009: g(1009).un, c1032: g(1032).un, c7012: g(7012).un, a1001: g(1001).un, b7004: catalogo().some((x) => x.codigo === 7004), b7007c: g(7007).activo }; });
  c(r.c1009 === 'm' && r.c1032 === 'm' && r.c7012 === 'm' && r.a1001 === 'kg', 'cables en metros (1009, 1032, 7012) y alambre en kg · ' + JSON.stringify(r));
  c(!r.b7004 && r.b7007c === false, '7004–7007 de baja: no se ofrecen, pero siguen para los movimientos viejos · ' + JSON.stringify(r));
  r = await p.evaluate(() => ({ a: window.__alternativasMismo(7010, 1032), b: window.__alternativasMismo(3039, 3038), d: window.__alternativasMismo(7006, 7005), no: window.__alternativasMismo(7010, 1019) }));
  c(r.a && r.b && r.d && !r.no, 'mismo material con otro código: 7010=1032, 3038=3039, 7005=7006 · ' + JSON.stringify(r));
  r = await p.evaluate(() => ({ prfv7: gananciaPorDefecto(7, 'PRFV'), prfv10: gananciaPorDefecto(10, 'PRFV'), met: gananciaPorDefecto(7, 'Metálica') }));
  c(r.prfv7 === 4 && r.prfv10 === 4, 'ganancia por subida en PRFV = caja (3,5 m) + 0,5 m, en 7 y en 10 m · ' + JSON.stringify(r));
  r = await p.evaluate(() => { const o = { id: 'zc', secciones: [{ titulo: 'CABLEADO', items: [{ desc: 'Cable Cu 4×4 mm² — 100 m de zanja', cantNecesaria: 137, itemCant: 130, un: 'm' }] }] }; const it = ((window.epecPreviaDe(o) || {}).filas || []).find((i) => +i.item === 37); return it && it.cantidad; });
  c(Math.abs(r - 130) < 0.01, 'el material lleva 5 % de reserva, pero el ítem 37 cobra zanja + subidas sin la reserva · ' + r);
  r = await p.evaluate(() => window.avanceItemizadoPct({ valorItems: [{ id: 1, itemPliego: '6', cantidad: 4, cantidadAvanzada: 4 }], valorItemsEpec: [{ id: 2, itemEpec: '84.1', cantidad: 4, cantidadAvanzada: 0 }] }));
  c(r === 100, 'las provisiones (83–89) sin tildar no traban el avance: la obra con el trabajo hecho queda al 100 % · ' + r);
  r = await p.evaluate(() => ({ piso: window.__puntosPiso(), vieja: window.__puntosExcluida({ fecha: '2026-10-20' }), nueva: window.__puntosExcluida({ fecha: '2026-11-02' }) }));
  c(r.piso === '2026-11-01' && r.vieja && !r.nueva, 'puntos: lo de antes de noviembre fue prueba y no suma; desde el 01/11 sí · ' + JSON.stringify(r));
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})();
