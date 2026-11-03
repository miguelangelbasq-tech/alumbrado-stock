// Pruebas v102 (3) · pañol: unidad del cálculo vs. la del pañol (cuántos trae cada Un.), lo cambiado por otro material cuenta
// para el original, «No hay» no es apartado, lista de compras con lo libre, «pasar» stock solo entre la misma medida, anular con
// su pareja, los movimientos no se borran, el stock inicial no se cambia a mano.
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
(async () => {
  const c = prueba('v102c' + (cel ? ' cel' : ''));
  const d = baseDatos(), ahora = Date.now(), e = (id, cod, q, x) => Object.assign({ tipo: 'entrada', codigo: cod, cantidad: q, fecha: d.hoy, ts: ahora + id }, x || {});
  d.db.catalogoProductos = { '1009': { codigo: 1009, un: 'Un.' } };   // v103: la base ahora tiene los cables en m; la prueba sigue con el 1009 en Un. (rollos)
  d.db.avanceObras.p1.secciones = [{ titulo: 'Materiales', items: [
    { desc: 'Cable Cu 4×2,5 mm² XLPE + vaina PVC (IRAM 2178-1)', cod: 1009, cantNecesaria: 100, un: 'm' },
    { desc: 'Cable Cu 3×1,5 mm² XLPE + vaina PVC (IRAM 2178-1) — columna a luminaria', cod: 6001, cantNecesaria: 90, un: 'm' },
    { desc: 'Bornera BPN 6 mm² gris — fase (RSTN+T)', cod: 2009, cantNecesaria: 10, un: 'Un.' }] }];
  d.db.avanceObras.p2 = { nombre: 'Plaza Colón', obraId: '5678', creado: '2026-10-01', secciones: [{ titulo: 'M', items: [{ desc: 'Cable Cu 4×4 mm²', cod: 1010, cantNecesaria: 50, un: 'm' }] }] };
  d.db.movimientos = { m1: e(1, 1009, 3), m2: e(2, 1025, 5), m3: e(3, 2009, 20), m4: e(4, 1010, 100) };
  d.db.reservas = {
    r1: { numero: 'R-0001', plazaId: 'p1', estado: 'pendiente', items: [{ codigo: 1025, desc: 'Cable SUBTERRANEO de cobre 3 X 1.5 MM IRAM 2178', un: 'Un.', cant: 1, entregado: 0, alternativaDe: 6001, cantOriginal: 90 }, { codigo: 2009, desc: 'BPN', un: 'Un.', cant: 10, entregado: 0, sinStock: { ts: 1 } }], creado: ahora },
    r2: { numero: 'R-0002', plazaId: 'p1x', estado: 'pendiente', items: [{ codigo: 1010, desc: 'Cable Cu 4×4', un: 'm', cant: 100, entregado: 0 }], creado: ahora } };
  const A = await abrir({ sesion: 'admin', cel, datos: d, espera: 3500, reglas: true }), p = A.page;
  const dlg = []; p.on('dialog', (x) => { dlg.push(x.type() + ':' + x.message()); x.type() === 'prompt' ? x.accept(/cuántos m trae/i.test(x.message()) ? '50' : 'error de carga') : x.accept(); });
  await p.evaluate(() => mostrarVista('calc')); await p.waitForTimeout(600);
  await p.click('#subtabsComputo [data-cptab="mat"]'); await p.waitForTimeout(500);
  await p.click('#cardMatObra .cp-obra[data-cpobra="p1"]'); await p.waitForTimeout(800);
  const filas = () => p.evaluate(() => { const o = {}; document.querySelectorAll('#cardMatObra .cor-bal tbody tr:not(.cor-alt)').forEach((tr) => { o[tr.querySelector('small').textContent] = { cls: tr.className, txt: tr.innerText.replace(/\s+/g, ' ') }; }); return { o, ped: JSON.parse(JSON.stringify((window.__corPedidoRef() || {}).items || [])) }; });
  let r = await filas();
  c(/cor-r-unidad/.test(r.o['1009'].cls) && /el pañol lo cuenta en Un\./.test(r.o['1009'].txt) && /100/.test(r.o['1009'].txt) && /\bm\b/.test(r.o['1009'].txt) && !r.ped.some((x) => x.codigo == 1009), 'cable 4×2,5: calculado 100 m y el pañol lo cuenta en Un. → lo dice y NO lo pide con la unidad equivocada · ' + r.o['1009'].txt);
  c(/cor-ok/.test(r.o['6001'].cls) && !r.ped.some((x) => x.codigo == 6001), 'el 6001 ya está cubierto por el 1025 que se eligió en su lugar: no vuelve a salir como faltante ni se pide dos veces · ' + r.o['6001'].txt);
  c(/cor-r-ok|cor-r-parte/.test(r.o['2009'].cls) && /—/.test(r.o['2009'].txt.split(' ')[0] === '' ? '' : r.o['2009'].txt), 'la BPN marcada «✕ No hay» en la reserva no cuenta como apartada: sigue faltando · ' + r.o['2009'].txt);
  await p.click('#cardMatObra [data-corfactor="1009"]'); await p.waitForTimeout(1500);
  r = await filas();
  const doc = await p.evaluate(() => window.__stubDB().catalogoProductos['1009']);
  c(doc && doc.porUnidad && doc.porUnidad.m === 50 && /cor-r-ok/.test(r.o['1009'].cls) && /hay 150/.test(r.o['1009'].txt), '«¿Cuántos m trae cada Un.?» → 50: queda en la ficha y convierte: 3 Un. = 150 m, alcanza · ' + r.o['1009'].txt);
  // lista de compras con lo libre
  r = await p.evaluate(() => { const o = avanceObras.find((x) => x.id === 'p2'); const l = comprasParaPlaza(o); const x = l.find((y) => y.codigo === 1010); return x && { stock: x.stock, comprar: x.comprar }; });
  c(r && r.stock === 0 && r.comprar === 50, 'lista de compras: los 100 m de 4×4 están apartados para otra obra → para esta hay que comprar 50 (antes decía que no) · ' + JSON.stringify(r));
  // pasar stock solo entre la misma medida
  r = await p.evaluate(() => { const C = stockCatalogoPorCodigo(), m = (a, b) => window.__alternativas.mismaMedida(C.get(String(a)), C.get(String(b))); return [m(6005, 6006), m(3016, 3017), m(1019, 1025)]; });
  c(r[0] === false && r[1] === false && r[2] === true, '«Revisar stock negativo» ya no propone pasar de columna 10 m a 7 m ni de fusible 1 A a 2 A; sí entre los dos 3×1,5 · ' + JSON.stringify(r));
  // anular con su pareja
  await p.evaluate(async () => { await fbAddMovimiento({ tipo: 'entrada', devolucion: true, usoDeCargo: true, codigo: 1010, cantidad: 4, un: 'm', ts: Date.now(), fecha: '2026-11-03' }); await fbAddMovimiento({ tipo: 'salida', usoDeCargo: true, codigo: 1010, cantidad: 4, un: 'm', ts: Date.now() + 1, fecha: '2026-11-03', plazaId: 'p1' }); });
  await p.waitForTimeout(900);
  const id = await p.evaluate(() => stockMovimientos.find((m) => m.usoDeCargo && m.tipo === 'entrada').id);
  await p.evaluate((id) => anularStockMovimiento(id), id); await p.waitForTimeout(2500);
  r = await p.evaluate(() => stockMovimientos.filter((m) => m.usoDeCargo).map((m) => m.tipo + ':' + !!m.anulado).sort().join(' '));
  c(r === 'entrada:true salida:true' && dlg.some((x) => /tiene su pareja/.test(x)), 'anular la mitad de «usó en una plaza» ofrece anular la pareja y quedan las dos anuladas · ' + r);
  r = await p.evaluate(async () => { try { await fbDeleteMovimiento('m1'); return 'borró'; } catch (e) { return e.code; } });
  c(r === 'no-se-borra', 'los movimientos no se pueden borrar (se anulan)');
  r = await p.evaluate(() => { catEditarProducto && catEditarProducto(1010); const s = document.getElementById('catStock'); return { ro: s && s.readOnly, un: (document.getElementById('catUn') || {}).value }; });
  c(r.ro === true, 'al editar un producto, el stock no se cambia a mano (se carga un movimiento) · ' + JSON.stringify(r));
  r = await p.evaluate(() => { catLimpiarFormulario(); return document.getElementById('catUn').value; });
  c(r === 'Un.', 'el formulario de alta vuelve a «Un.» (antes «c/a», que la app no reconocía)');
  if (cel) { await p.evaluate(() => mostrarVista('calc')); await p.waitForTimeout(400); const w = await p.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]); c(w[0] <= w[1] + 1, 'celular: sin scroll de costado ' + w); }
  const errs = A.errores.filter((x) => !/Missing or insufficient permissions/.test(x));
  c(!errs.length, 'sin errores de JS ' + JSON.stringify(errs.slice(0, 3)));
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
