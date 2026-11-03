// Pruebas v101 · Alternativas del pañol debajo de lo que falta en «📦 Material de esta obra»: 🟢 casi igual / 🟡 sirve con
// diferencias (norma, conductores, sección, unidad, Municipalidad), «Pedir esta en su lugar» con la equivalencia de unidad,
// el pedido al pañol lleva la alternativa; y en «Calculadora ↔ pañol» ya no confunde medidas distintas.
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
function datos() {
  const d = baseDatos(), ahora = Date.now();
  d.db.avanceObras.p1.secciones = [{ titulo: 'Materiales', items: [
    { desc: 'Cable Cu 3×1,5 mm² XLPE + vaina PVC (IRAM 2178-1) — columna a luminaria', cod: 6001, cantNecesaria: 90, un: 'm' },
    { desc: 'Bornera BPN 6 mm² gris — fase (RSTN+T)', cod: 2009, cantNecesaria: 30, un: 'Un.' },
    { desc: 'Prensacable 1/2" RE, con tuerca y arandela (Ø 5–8 mm)', cod: 5020, cantNecesaria: 4, un: 'Un.' },
    { desc: 'FUSIBLE CILINDRICO 10 X 38 2 AMP', cod: 3017, cantNecesaria: 20, un: 'Un.' }] }];
  const e = (id, c, q) => ({ tipo: 'entrada', codigo: c, cantidad: q, fecha: d.hoy, ts: ahora + id });
  d.db.catalogoProductos = { '1019': { codigo: 1019, un: 'Un.' }, '1025': { codigo: 1025, un: 'Un.' }, '1020': { codigo: 1020, un: 'Un.' } };   // v103: la base ahora tiene los cables en m; la prueba sigue con los rollos de antes
  d.db.movimientos = { m1: e(1, 1019, 3), m2: e(2, 1025, 2), m3: e(3, 1020, 5), m4: e(4, 2009, 10), m5: e(5, 2003, 50), m6: e(6, 5019, 8), m7: e(7, 3016, 30), m8: e(8, 3018, 40) };
  return d;
}
(async () => {
  const c = prueba('v101' + (cel ? ' cel' : ''));
  const A = await abrir({ sesion: 'admin', cel, datos: datos(), espera: 3500, reglas: true }), p = A.page;
  const resp = []; p.on('dialog', (d) => { resp.push(d.message()); d.type() === 'prompt' ? d.accept('100') : d.accept(); });
  await p.evaluate(() => mostrarVista('calc')); await p.waitForTimeout(700);
  await p.click('#subtabsComputo [data-cptab="mat"]'); await p.waitForTimeout(500);
  await p.click('#cardMatObra .cp-obra'); await p.waitForTimeout(800);
  const alts = () => p.evaluate(() => [...document.querySelectorAll('#cardMatObra tr.cor-alt')].map((tr) => ({ prev: tr.previousElementSibling.querySelector('small').textContent, t: tr.querySelector('.cor-alts-t').textContent, a: [...tr.querySelectorAll('.cor-a')].map((x) => (x.classList.contains('verde') ? 'V' : 'A') + ':' + x.querySelector('.cor-a-cab b').textContent + ':' + x.innerText.replace(/\s+/g, ' ')) })));
  let r = await alts();
  const cab = r.find((x) => x.prev === '6001'), bpn = r.find((x) => x.prev === '2009');
  c(cab && /No hay este/.test(cab.t) && cab.a[0].indexOf('V:') === 0 && cab.a.slice(0, 2).map((x) => x.split(':')[1]).sort().join() === '1019,1025', 'cable 3×1,5 (6001) en rojo: abajo, en verde, el 1019 y el 1025 que hay en el pañol · ' + JSON.stringify(cab && cab.a.map((x) => x.slice(0, 7))));
  const a1019 = cab && cab.a.find((x) => x.split(':')[1] === '1019'), a1020 = cab && cab.a.find((x) => x.split(':')[1] === '1020');
  c(a1019 && /daba la Municipalidad/.test(a1019) && /no dice la norma/.test(a1019) && /Un\. \(rollos\)/.test(a1019), 'el 1019 avisa: lo daba la Municipalidad, no dice la norma, lo cuentan en rollos');
  c(a1020 && a1020.indexOf('A:') === 0 && /sección 2,5 mm² en vez de 1,5/.test(a1020), 'en amarillo el 3×2,5 (1020): «sección 2,5 en vez de 1,5 (más grueso)»');
  c(bpn && /Para lo que no alcanza/.test(bpn.t) && bpn.a.some((x) => /^A:2003:/.test(x) && /no dice el color/.test(x)), 'la BPN gris (hay 10 de 30): para lo que falta, en amarillo el 2003 «no dice el color»');
  c(!r.find((x) => x.prev === '5020') && !r.find((x) => x.prev === '3017'), 'no ofrece medidas o amperes distintos: prensacable 1/2" ≠ 1 1/2", fusible 2 A ≠ 1 A ni Neozed');
  await p.screenshot({ path: __dirname + '/v101_alt' + (cel ? '_cel' : '') + '.png' });
  // elegir el 1025 → pregunta cuántos m trae el rollo (100) → el pedido lleva 1 rollo del 1025
  await p.click('#cardMatObra tr.cor-alt [data-alt="1025"]'); await p.waitForTimeout(500);
  r = await p.evaluate(() => ({ ped: JSON.parse(JSON.stringify((window.__corPedidoRef() || {}).items || [])), sel: (document.querySelector('#cardMatObra .cor-a.elegida') || {}).innerText || '' }));
  const it = r.ped.find((x) => x.codigo == 1025);
  c(resp.some((x) => /cuántos m trae cada Un/i.test(x)) && it && it.cant === 1 && it.alternativaDe == 6001 && !r.ped.some((x) => x.codigo == 6001), 'pregunta cuántos metros trae el rollo (100) y en el pedido va 1 rollo del 1025 en lugar del 6001 · ' + JSON.stringify(it));
  c(/Va en el pedido en lugar del 6001/.test(r.sel), 'queda marcada «✓ Va en el pedido en lugar del 6001»');
  await p.click('#cardMatObra [data-corpedir]'); await p.waitForTimeout(800);
  r = await p.evaluate(() => ({ notas: (document.getElementById('rsNotas') || {}).value || '', filas: [...document.querySelectorAll('#rsFilas [data-f="prod"]')].map((i) => i.value) }));
  c(/1025 en lugar de 6001/.test(r.notas) && r.filas.some((x) => /^1025\b|1025 —/.test(x) || /1025/.test(x)), 'el pedido al pañol trae el 1025 y en las notas «1025 en lugar de 6001 (revisar norma y medida)» · ' + r.notas);
  await p.evaluate(() => { const b = document.querySelector('[data-rs="cerrar"]'); b && b.click(); }); await p.waitForTimeout(300);
  // Calculadora ↔ pañol
  await p.evaluate(() => { mostrarVista('stock'); }); await p.waitForTimeout(500);
  r = await p.evaluate(() => { const R = window.__calcPanol.revisar(); return R.duplicado.map((x) => x.e.cod + '>' + x.cands.map((y) => (y.nivel === 'verde' ? 'V' : 'A') + y.q.codigo).join(',')); });
  c(r.some((x) => /^6001>.*V1019/.test(x)) && !r.some((x) => /^5020>/.test(x) || /^3017>/.test(x)), '«Calculadora ↔ pañol» usa la misma comparación: 6001 → 🟢 1019; ya no marca el prensacable ni el fusible · ' + JSON.stringify(r));
  if (cel) { await p.evaluate(() => mostrarVista('calc')); await p.waitForTimeout(500); const w = await p.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]); c(w[0] <= w[1] + 1, 'celular: sin scroll de costado ' + w); }
  const errs = A.errores.filter((e) => !/Missing or insufficient permissions/.test(e));
  c(!errs.length, 'sin errores de JS ' + JSON.stringify(errs.slice(0, 3)));
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
