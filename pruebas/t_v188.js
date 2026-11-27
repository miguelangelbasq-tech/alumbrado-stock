// v188 · Reserva nueva desde el celu (Ángel 27/11/2026: «pongo la obra y no me sale para buscar al personal ni el material
// ni nada»). En el celu las sugerencias de «Para quién» y de cada material van en la caja propia #sugCaja (v119), que quedaba
// DEBAJO de la ventana de la reserva (z 9500 contra 9600). Con ANTES=1 (APP = la v187) reproduce el error.
// Correr: APPDIR=… APP=…/index.html node t_v188.js [cel]   (también con REGLAS=1)
const { abrir, prueba } = require('./h.js');
const { datos178 } = require('./datos178');
const cel = process.argv[2] === 'cel', ANTES = !!process.env.ANTES;
const c = prueba('v188' + (cel ? ' (celu)' : ' (PC)') + (ANTES ? ' ANTES' : ''));
const MOD = { v188: true, nav: true, inicio: true, mtNuevo: true, tarjetas: true, ofPasos: true, rsObra: true, lgPleg: true, v186: true, v187: true, v185: true, v184: true };
const ROLES = [['admin', 'Administración'], ['lucia', 'Oficina'], ['pan', 'Pañol'], ['pedro', 'Cuadrilla que carga órdenes']].filter((x) => !process.env.ROL || x[0] === process.env.ROL);
(async () => {
  let browser = null;
  for (const [ses, nom] of ROLES) {
    const A = await abrir(Object.assign({}, MOD, { browser, sesion: ses, cel, datos: datos178(), espera: 5000 }));
    browser = A.browser; const p = A.page;
    const toca = async (sel) => { if (cel) await p.tap(sel); else await p.click(sel); };
    const encima = () => p.evaluate(() => { const k = document.getElementById('sugCaja'); if (!k) return { caja: false }; const b = k.querySelector('button'); const r = b.getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { caja: true, n: k.children.length, arriba: !!(e && e.closest('#sugCaja')), x: r.left + r.width / 2, y: r.top + r.height / 2, v: b.dataset.v }; });
    const antesN = await p.evaluate(() => (window.reservasMaterial || []).length);
    await p.evaluate(() => { mostrarVista('stock'); window.__stockSubIr && window.__stockSubIr('reservas'); }); await p.waitForTimeout(900);
    const vis = await p.evaluate(() => { const b = document.getElementById('rsNueva'); return !!(b && b.offsetParent); });
    c(vis, nom + ': se ve «＋ Nueva reserva»');
    if (!vis) { await A.ctx.close(); continue; }
    await toca('#rsNueva'); await p.waitForTimeout(700);
    c(await p.evaluate(() => !!document.getElementById('rsModal')), nom + ': se abre la ventana de la reserva');
    await p.selectOption('#rsObra', 'p1'); await p.waitForTimeout(300);
    // «Para quién»
    await toca('#rsPara'); await p.waitForTimeout(400);
    let r = await encima();
    if (cel) {
      c(r.caja && r.n > 0, nom + ': al tocar «Para quién» salen los nombres de la nómina (' + (r.n || 0) + ')');
      c(r.arriba, nom + ': la lista de nombres queda ARRIBA de la ventana y se puede tocar');
      if (r.caja) { await p.touchscreen.tap(r.x, r.y); await p.waitForTimeout(400); }
      const val = await p.evaluate(() => document.getElementById('rsPara').value);
      c(r.caja && val === r.v, nom + ': tocar un nombre lo pone en «Para quién» (' + val + ')');
      if (!val) await p.fill('#rsPara', 'Juan Pérez');
    } else {
      c(!r.caja && await p.evaluate(() => document.getElementById('rsPara').getAttribute('list') === 'rsParaLista'), nom + ': en la compu queda la lista del navegador (sin la caja)');
      await p.fill('#rsPara', 'Juan Pérez');
    }
    // material
    const prod = '#rsFilas .rs-fila:last-child [data-f=prod]';
    await toca(prod); await p.keyboard.type('cable'); await p.waitForTimeout(400);
    r = await encima();
    if (cel) {
      c(r.caja && r.n > 0, nom + ': al escribir «cable» salen materiales del pañol (' + (r.n || 0) + ')');
      c(r.arriba, nom + ': la lista de materiales queda ARRIBA de la ventana y se puede tocar');
      if (r.caja && r.arriba) { await p.touchscreen.tap(r.x, r.y); await p.waitForTimeout(400); }
      else { const v = await p.evaluate(() => { const o = document.querySelector('#stockDatalist option'); return o && o.value; }); await p.fill(prod, v || ''); await p.waitForTimeout(300); }
    } else {
      c(!r.caja, nom + ': en la compu el material usa la lista del navegador');
      const v = await p.evaluate(() => [...document.querySelectorAll('#stockDatalist option')].map((o) => o.value).find((x) => /cable/i.test(x)));
      await p.fill(prod, v || ''); await p.waitForTimeout(300);
    }
    let d = await p.evaluate((s) => ({ v: document.querySelector(s).value, desc: (document.querySelector('#rsFilas .rs-fila:last-child .rs-u-desc') || {}).textContent || '' }), prod);
    c(/—/.test(d.v) && d.desc.length > 2, nom + ': el material queda elegido del catálogo (' + d.v + ')');
    c(await p.evaluate(() => document.querySelectorAll('#rsFilas .rs-fila').length === 1 && !!document.getElementById('rsModal')), nom + ': elegir la sugerencia no toca lo que estaba debajo (sigue 1 renglón, la ventana abierta)');
    await p.fill('#rsFilas .rs-fila:last-child [data-f=cant]', '2');
    // segundo material con «＋ Agregar material»
    await toca('#rsModal [data-rs=fila]'); await p.waitForTimeout(150);   // enseguida: el renglón nuevo no espera al relojito de 1 s
    await toca(prod); await p.keyboard.type('jabal'); await p.waitForTimeout(800);
    r = await encima();
    if (cel) { c(r.caja && r.arriba, nom + ': el renglón nuevo («＋ Agregar material», tocado enseguida) también muestra la lista arriba'); if (r.caja && r.arriba) { await p.touchscreen.tap(r.x, r.y); await p.waitForTimeout(400); } }
    if (!cel || !(r.caja && r.arriba)) { const v = await p.evaluate(() => [...document.querySelectorAll('#stockDatalist option')].map((o) => o.value).find((x) => /jabal/i.test(x))); await p.fill(prod, v || ''); await p.waitForTimeout(300); }
    await p.fill('#rsFilas .rs-fila:last-child [data-f=cant]', '1'); await p.waitForTimeout(200);
    await toca('#rsModal [data-rs=guardar]'); await p.waitForTimeout(1500);
    const dsp = await p.evaluate(() => (window.reservasMaterial || []).length);
    const ult = await p.evaluate(() => { const l = (window.reservasMaterial || []).slice().sort((a, b) => (b.creado || 0) - (a.creado || 0) || String(b.numero).localeCompare(String(a.numero))); return l[0] ? { obra: l[0].plazaId, para: l[0].para, n: (l[0].items || []).length } : null; });
    c(dsp === antesN + 1 && ult && ult.obra === 'p1' && ult.n === 2 && !!ult.para, nom + ': la reserva se guarda con la obra, para quién y los 2 materiales · ' + JSON.stringify(ult));
    if (ses === 'admin' && cel) {
      // un campo de una pantalla (no ventana) sigue con la caja de siempre (z 9500)
      const z = await p.evaluate(() => { const i = document.getElementById('stockMovProducto'); window.__sugerencias.preparar(); i.value = 'cable'; window.__sugerencias.mostrar(i); const k = document.getElementById('sugCaja'); const z = k ? getComputedStyle(k).zIndex : ''; window.__sugerencias.cerrar(); i.value = ''; return z; });
      c(z === '9500', 'en un campo de una pantalla la caja sigue igual (z ' + z + ')');
    }
    const errs = A.errores.filter((e) => !/Missing or insufficient permissions|permission-denied|error occurred when fetching the script/i.test(e));
    c(!errs.length, nom + ': sin errores de JS ' + JSON.stringify(errs.slice(0, 3)));
    await A.ctx.close();
  }
  // la bandera apaga el arreglo
  if (cel && !ANTES) {
    const A = await abrir(Object.assign({}, MOD, { browser, sesion: 'admin', cel, datos: datos178(), espera: 5000, v188: false }));
    const p = A.page;
    await p.evaluate(() => window.abrirNuevaReserva({ plazaId: 'p1' })); await p.waitForTimeout(500);
    await p.tap('#rsPara'); await p.waitForTimeout(400);
    const z = await p.evaluate(() => { const k = document.getElementById('sugCaja'); return k ? getComputedStyle(k).zIndex : ''; });
    c(z === '9500', 'con __v188No la caja queda como antes (z ' + z + ')');
    await A.ctx.close();
  }
  await browser.close(); process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
