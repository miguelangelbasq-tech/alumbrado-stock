// Pruebas v056: «Cómputo de la plaza» con subíndices Calculadora · Historial · Material por obra.
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
function datos() {
  const d = baseDatos(), ahora = Date.now();
  const sec = (items) => [{ titulo: 'Materiales', items }];
  d.db.historialCalculos = {
    h1: { nombre: 'Plaza San Martín', id: '1234', barrio: 'Centro', cantCol: 6, tareas: ['Columnas'], tiles: [], alertas: [], estado: 'Pendiente', fecha: d.hoy, ts: ahora - 1000, secciones: sec([{ desc: 'Alambre para ataduras — ataduras', corto: 'Alambre para ataduras', cod: 1001, cant: 4, un: 'm' }]) },
    h2: { nombre: 'Barrio Costa Canal', id: 'B-01', barrio: 'Costa Canal', cantCol: 33, tareas: ['Red aérea'], tiles: [], alertas: [], estado: 'En curso', fecha: d.hoy, ts: ahora, secciones: sec([{ desc: 'Cable acometida anti hurto 2.5/2.5 mm', corto: 'Cable acometida anti hurto 2.5/2.5 mm', cod: 1002, cant: 120, un: 'Un.' }]) }
  };
  d.db.avanceObras.p1.secciones = sec([
    { desc: 'Alambre para ataduras — ataduras', cod: 1001, cantNecesaria: 10, un: 'm' },
    { desc: 'Cable acometida anti hurto 2.5/2.5 mm — bajadas', cod: 1002, cantNecesaria: 40, un: 'Un.' },
    { desc: 'Cable acometida anti hurto 4/4 mm — tramos', cod: 1003, cantNecesaria: 5, un: 'Un.' },
    { desc: 'Material 1004 — varios', cod: 1004, cantNecesaria: 10, un: 'Un.' },
    { desc: 'Zanjeo', tarea: true, cantNecesaria: 1 }
  ]);
  d.db.catalogoProductos = { '1001': { codigo: 1001, un: 'm' }, '1002': { codigo: 1002, un: 'Un.' }, '1003': { codigo: 1003, un: 'Un.' }, '1004': { codigo: 1004, un: 'Un.' } };   // v103: la base ahora tiene cables en m y alambre en kg; la prueba sigue con las unidades de antes
  d.db.movimientos = { m1: { tipo: 'entrada', codigo: 1001, cantidad: 50, fecha: d.hoy, ts: ahora }, m3: { tipo: 'entrada', codigo: 1003, cantidad: 100, fecha: d.hoy, ts: ahora }, m4: { tipo: 'entrada', codigo: 1004, cantidad: 4, fecha: d.hoy, ts: ahora }, m2: { tipo: 'salida', codigo: 1001, cantidad: 10, plazaId: 'p1', plazaNombre: 'Plaza San Martín', fecha: d.hoy, ts: ahora } };
  return d;
}
(async () => {
  const c = prueba('v056' + (cel ? ' cel' : ''));
  const A = await abrir({ sesion: 'admin', cel, datos: datos(), espera: 5000, reglas: true }), p = A.page;
  await p.evaluate(() => mostrarVista('calc')); await p.waitForTimeout(800);
  const vis = (sel) => p.evaluate((s) => { const e = document.querySelector(s); return !!e && getComputedStyle(e).display !== 'none' && e.offsetParent !== null; }, sel);
  const tabs = () => p.evaluate(() => [...document.querySelectorAll('#subtabsComputo [data-cptab]')].map((b) => b.dataset.cptab + (b.classList.contains('on') ? '*' : '') + ':' + b.textContent.trim()));
  let r = await tabs();
  c(r.length === 3 && /^calc\*/.test(r[0]) && /Historial 2/.test(r[1]) && /Material por obra/.test(r[2]), 'Cómputo de la plaza tiene 🧮 Calculadora · 🗂 Historial (2) · 📦 Material por obra · ' + r.join(' | '));
  c((await vis('#obraNombre')) && (await vis('#resultCard')) && !(await vis('#cardHistCalc')), 'en «Calculadora» se ven los datos y el resultado (el historial no)');
  await p.click('#subtabsComputo [data-cptab="hist"]'); await p.waitForTimeout(500);
  r = await p.evaluate(() => [...document.querySelectorAll('#histBody tr')].filter((tr) => tr.style.display !== 'none').map((tr) => tr.querySelector('td').textContent));
  c((await vis('#cardHistCalc')) && !(await vis('#obraNombre')) && !(await vis('#resultCard')) && r.length === 2, '«Historial»: a pantalla completa con los 2 cómputos guardados');
  await p.screenshot({ path: __dirname + '/v056_historial' + (cel ? '_cel' : '') + '.png' });
  await p.fill('#cpHistBuscar', 'costa'); await p.waitForTimeout(300);
  r = await p.evaluate(() => [...document.querySelectorAll('#histBody tr')].filter((tr) => tr.style.display !== 'none').map((tr) => tr.querySelector('td').textContent));
  c(r.join() === 'Barrio Costa Canal', 'el buscador del historial filtra (costa → Barrio Costa Canal)');
  await p.fill('#cpHistBuscar', ''); await p.waitForTimeout(200);
  await p.evaluate(() => { const b = [...document.querySelectorAll('#histBody button')].find((x) => /Ver/.test(x.textContent)); b && b.click(); }); await p.waitForTimeout(900);
  r = await tabs();
  c(/^calc\*/.test(r[0]) && (await vis('#resultCard')) && /Plaza San Martín|Costa Canal/.test(await p.evaluate(() => document.getElementById('resultCard').innerText)), '«Ver / Imprimir» de un cómputo vuelve sola a «Calculadora» con el resultado');
  await p.click('#subtabsComputo [data-cptab="mat"]'); await p.waitForTimeout(700);
  r = await p.evaluate(() => [...document.querySelectorAll('#cardMatObra .cp-obra')].map((b) => b.innerText.replace(/\n/g, ' ')));
  c((await vis('#cardMatObra')) && !(await vis('#obraNombre')) && r.length === 1 && /Plaza San Martín/.test(r[0]) && /faltan 3/.test(r[0]), '«Material por obra»: lista las obras registradas con cómputo y cuántos materiales les faltan · ' + r.join(' | '));
  await p.click('#cardMatObra .cp-obra'); await p.waitForTimeout(700);
  // v101: debajo de lo que falta van las filas de alternativas (tr.cor-alt): no se cuentan como materiales
  r = await p.evaluate(() => { const t = document.querySelector('#cardMatObra .cor-bal'); return t ? { filas: [...t.querySelectorAll('tbody tr:not(.cor-alt)')].map((tr) => tr.innerText.replace(/\s+/g, ' ')), cls: [...t.querySelectorAll('tbody tr:not(.cor-alt)')].map((tr) => tr.querySelector('small').textContent + ':' + tr.className), sem: (t.querySelector('.cor-sem') || {}).innerText || '', pedir: !!t.querySelector('[data-corpedir]') } : null; });
  c(r && r.filas.length === 4 && r.filas.some((x) => /Alambre/.test(x) && /10/.test(x)) && r.pedir, 'al elegirla: calculado / ya salió / apartado / falta (el alambre ya salió entero) y «Pedir al pañol lo que falta» · ' + (r && r.filas.join(' || ')));
  c(r.cls.includes('1003:cor-r-ok') && r.cls.includes('1004:cor-r-parte') && r.cls.includes('1002:cor-r-no') && r.cls.includes('1001:cor-ok') && /1\s*hay en el pañol/.test(r.sem) && /1\s*hay una parte/.test(r.sem) && /1\s*no hay/.test(r.sem), 'semáforo: 🟢 1003 hay (100) · 🟡 1004 hay una parte (4 de 10) · 🔴 1002 no hay · el ya retirado sin color · ' + r.cls.join(' '));
  await p.screenshot({ path: __dirname + '/v056_material' + (cel ? '_cel' : '') + '.png' });
  await p.click('#cardMatObra [data-corpedir]'); await p.waitForTimeout(700);
  r = await p.evaluate(() => ({ modal: !!document.getElementById('rsModal'), obra: (document.getElementById('rsObra') || {}).value, filas: document.querySelectorAll('#rsFilas .rs-fila').length }));
  c(r.modal && r.obra === 'p1' && r.filas === 3, 'el botón abre el pedido al pañol con la obra y lo que falta (' + r.filas + ' materiales)');
  r = await p.evaluate(() => ({ cls: [...document.querySelectorAll('#rsFilas .rs-fila')].map((f) => (f.className.match(/rs-(ok|parte|no)/) || [''])[0] + ':' + ((f.querySelector('.rs-st') || {}).textContent || '')), res: (document.getElementById('rsRes') || {}).innerText || '' }));
  c(r.cls.some((x) => /^rs-ok:✓ hay 100/.test(x)) && r.cls.some((x) => /^rs-parte:hay 4 · faltan 6/.test(x)) && r.cls.some((x) => /^rs-no:✕ no hay en pañol/.test(x)) && /1\s*hay en el pañol/.test(r.res), 'en la reserva cada material sale en verde (hay), amarillo (hay una parte) o rojo (no hay), con el resumen · ' + r.cls.join(' | '));
  await p.screenshot({ path: __dirname + '/v056_reserva' + (cel ? '_cel' : '') + '.png' });
  await p.evaluate(() => { const m = document.getElementById('rsModal'); m && m.remove(); });
  await p.reload(); await p.waitForTimeout(5000); await p.evaluate(() => mostrarVista('calc')); await p.waitForTimeout(700);
  r = await tabs();
  c(/^mat\*/.test(r[2]) && (await vis('#cardMatObra .cor-bal')), 'al volver a entrar recuerda el subíndice y la obra elegida');
  await p.evaluate(() => window.calcRapidaIr('hormigon')); await p.waitForTimeout(400);
  const enRapida = !(await vis('#subtabsComputo')) && !(await vis('#cardMatObra'));
  await p.evaluate(() => window.calcRapidaIr('computo')); await p.waitForTimeout(400);
  c(enRapida && (await vis('#subtabsComputo')) && (await vis('#cardMatObra')), 'en los cálculos rápidos los subíndices no aparecen, y vuelven al tocar «Cómputo de la plaza»');
  await p.click('#subtabsComputo [data-cptab="calc"]'); await p.waitForTimeout(300);
  c((await vis('#obraNombre')) && !(await vis('#cardMatObra')), 'y «Calculadora» vuelve a mostrar el formulario');
  const errs = A.errores.filter((e) => !/Missing or insufficient permissions|permission-denied|error occurred when fetching the script/i.test(e));
  c(!errs.length, 'sin errores de JS ' + JSON.stringify(errs.slice(0, 3)));
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
