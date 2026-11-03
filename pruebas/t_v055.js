// Pruebas v055: «🔎 Calculadora ↔ pañol» (qué no coincide entre los cómputos y el catálogo) + 4 unidades corregidas en el catálogo base.
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
function datos() {
  const d = baseDatos(), ahora = Date.now();
  const it = (cod, corto, un, cant) => ({ desc: corto + ' — para la obra', corto, cod, cantNecesaria: cant, un });
  d.db.avanceObras.p1.secciones = [{ titulo: 'Materiales', items: [
    it(7010, 'Cable Cu 1×10 mm² verde-amarillo (IRAM NM 247-3)', 'm', 17),
    it(7015, 'Dispersor (jabalina) de Cu con alma de acero Ø14,6 × 1500 mm (IRAM 2309)', 'Un.', 3),
    it(1001, 'Alambre para ataduras', 'm', 5),
    it(1002, 'Cable acometida anti hurto 2.5/2.5 mm', 'm', 40),
    it(1003, 'Arandela plana galvanizada 1/2"', 'Un.', 8),
    it(1004, 'Cable acometida anti hurto 6/6 mm', 'Un.', 2),
    it(9998, 'Material inventado del cálculo', 'Un.', 1),
    { desc: 'Zanjeo a mano', tarea: true, cod: 1001 }
  ] }];
  d.db.catalogoProductos = {
    '1450': { codigo: 1450, desc: 'Alambre para ataduras galvanizado N° 16', un: 'm', sector: 'pañol', stock: 0, costo: 0, creado: ahora },
    '1004': { codigo: 1004, activo: false }
  };
  d.db.movimientos = { m1: { tipo: 'entrada', codigo: 1450, desc: 'Alambre para ataduras galvanizado N° 16', un: 'm', cantidad: 50, fecha: d.hoy, ts: ahora, usuario: 'admin@ema-alumbrado.app' } };
  return d;
}
(async () => {
  const c = prueba('v055' + (cel ? ' cel' : ''));
  const A = await abrir({ sesion: 'admin', cel, datos: datos(), espera: 5000, reglas: true }), p = A.page;
  p.on('dialog', (dd) => dd.accept());
  let r = await p.evaluate(() => [6010, 1016, 7015, 7010].map((k) => k + ':' + (stockBase(k) || {}).un));
  c(r.join() === '6010:Un.,1016:m,7015:Un.,7010:m', 'catálogo base: las 4 unidades cruzadas quedan como en la calculadora · ' + r.join(' '));
  await p.evaluate(() => mostrarVista('stock')); await p.waitForTimeout(700);
  r = await p.evaluate(() => [...document.querySelectorAll('#subtabsStock .subtab')].map((b) => b.dataset.sub + '|' + b.textContent));
  c(r.some((x) => /^calcpanol\|.*Calculadora ↔ pañol/.test(x)), 'el Pañol tiene la pestaña «🔎 Calculadora ↔ pañol»');
  await p.click('#subtabsStock [data-sub="calcpanol"]'); await p.waitForTimeout(600);
  r = await p.evaluate(() => { const e = document.getElementById('cardCalcPanol'); return { vis: !!e && getComputedStyle(e).display !== 'none', txt: e ? e.innerText : '' }; });
  c(r.vis && /No cambia nada/.test(r.txt) && /Revisar/.test(r.txt), 'se ve la tarjeta con «🔎 Revisar» y aclara que no cambia nada');
  await p.click('#cpRevisar'); await p.waitForTimeout(800);
  const res = () => p.evaluate(() => { const r = window.__calcPanol.revisar(); return { total: r.total, ok: r.ok, noExiste: r.noExiste.map((x) => x.e.cod), baja: r.baja.map((x) => x.e.cod), dup: r.duplicado.map((x) => x.e.cod + '>' + x.cands.map((y) => y.q.codigo).join('/')), unidad: r.unidad.map((x) => x.e.cod), nombre: r.nombre.map((x) => x.e.cod), txt: document.getElementById('cardCalcPanol').innerText }; });
  r = await res();
  c(r.total === 7, 'toma los 7 materiales del cómputo de la obra (las tareas no) · ' + r.total);
  c(r.dup.includes('1001>1450'), '«🔁 En 0, pero hay otro parecido con stock»: 1001 Alambre (0) ↔ 1450 Alambre galvanizado (hay 50) · ' + r.dup.join());
  c(r.unidad.includes('1002') && !r.unidad.includes('7010') && !r.unidad.includes('7015'), '«📏 Unidad distinta»: 1002 (cálculo m / pañol Un.); 7010 y 7015 ya no, por la corrección · ' + r.unidad.join());
  c(r.noExiste.join() === '9998' && r.baja.join() === '1004', '«❌ No existe» el 9998 y «⛔ Dado de baja» el 1004');
  c(r.nombre.includes('1003'), '«✏️ Nombre distinto»: 1003 (en el cómputo «Arandela…», en el pañol otro material)');
  c(/2 coinciden/.test(r.txt) && /5 para revisar/.test(r.txt) && /Plaza San Martín/.test(r.txt) && /hay 50/.test(r.txt) && /en pañol 0/.test(r.txt), 'cada caso dice en qué obra se usa y cuánto hay');
  await p.screenshot({ path: __dirname + '/v055_chequeo' + (cel ? '_cel' : '') + '.png', fullPage: false });
  const neg0 = await p.evaluate(() => JSON.stringify(window.__stubDB ? window.__stubDB().catalogoProductos : {}));
  // v102: ya no se cambia la unidad del producto (dejaba mal lo contado): se pregunta cuántos m trae cada Un. y se convierte
  p.removeAllListeners('dialog'); p.on('dialog', (d) => d.type() === 'prompt' ? d.accept('100') : d.accept());
  await p.click('#cardCalcPanol [data-corfactor="1002"]'); await p.waitForTimeout(2200);
  r = await res();
  const doc = await p.evaluate(() => (window.__stubDB ? window.__stubDB().catalogoProductos['1002'] : null));
  c(doc && doc.porUnidad && doc.porUnidad.m === 100 && doc.un !== 'm', '«📏 ¿Cuántos m trae cada Un.?»: pregunta y guarda en la ficha que 1 Un. = 100 m (la unidad no se toca) · ' + JSON.stringify(doc));
  c(/1 Un\. = 100 m/.test(r.txt), 'y lo muestra en la lista');
  const errs = A.errores.filter((e) => !/Missing or insufficient permissions|permission-denied|error occurred when fetching the script/i.test(e));
  c(!errs.length, 'sin errores de JS ' + JSON.stringify(errs.slice(0, 3)));
  const neg = await p.evaluate(() => (window.__stubNegadas || []).filter((x) => /^(create|update|delete)/.test(x)));
  c(!neg.length, 'la base (reglas simuladas) no rechazó nada ' + JSON.stringify(neg));
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
