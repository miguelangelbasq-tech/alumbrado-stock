// v169 · «🔧 Armadas» con su propio subíndice en el Pañol (datos168, con y sin la receta 6026 / AR-0001 de 4 armadas).
//  0) pañolero: subpestaña «🔧 Armadas» después de Herramientas; Catálogo pañol sin la tarjeta, con la línea «🔧 Luminarias
//     armadas: 4 listas · Ver»; «Ver» → la subpestaña (tarjeta, título del header, «‹ Volver al catálogo»), «atrás» vuelve al
//     catálogo; tocando la subpestaña no hay «Volver»; «Armar» abre la hoja desde ahí; sin scroll de costado en el celu.
//  1) la ficha del producto armada: «Ver en Pañol › Armadas» (cierra la ficha y abre la subpestaña); «Armar» sigue.
//  2) ?doc=AR-0001 (QR): el comprobante con Pañol › Armadas detrás.
//  3) roles: pañol sin recetas (la subpestaña igual, «todavía no hay recetas»); oficina edita; cuadrilla (solo Catálogo +
//     Armadas, si hay receta; sin receta, solo Catálogo), mirar y Dirección miran sin botones.
//  4) __v169No: todo como la v168 (la tarjeta en Catálogo pañol, sin la subpestaña ni la línea).
const { abrir, prueba } = require('./h');
const { datos168 } = require('./datos168');
const cel = process.argv[2] === 'cel';
const CAP = process.env.CAP || '';
const SOLO = (x) => !process.env.SOLO || process.env.SOLO.indexOf(x) >= 0;
(async () => {
  const c = prueba('v169' + (cel ? ' cel' : ''));
  const MOD = { cel, espera: 4500, nav: true, ofPasos: true, porPartes: true, https: true, inicio: true, sugerida: true, v145: true, v146: true, v147: true, v150: true, v151: true, v152: true, v153: true, v154: true, v155: true, v156: true, v157: true, v158: true, v159: true, v160: true, v161: true, v163: true, v164: true, v165: true, v166: true, v167: true, v168: true, v169: true, reglas: !!process.env.REGLAS };
  let browser = null;
  const sesion = async (quien, op, dop) => { const A = await abrir(Object.assign({ sesion: quien, datos: datos168(dop), browser }, MOD, op || {})); browser = A.browser; A.page.on('dialog', (x) => x.accept()); await A.page.waitForTimeout(800); return A; };
  const scrollX = (p) => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const errsJs = (A) => (A.errores || []).filter((e) => !/Missing or insufficient permissions|permission-denied|ERR_|Failed to fetch|aborted|fetching the script|sin permiso|Sin permiso|open-meteo/i.test(e));
  const tx = (p, s) => p.evaluate((x) => { const e = document.querySelector(x); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; }, s);
  const esperar = async (p, fn, arg, ms) => { for (let i = 0; i < (ms || 40); i++) { if (await p.evaluate(fn, arg)) return true; await p.waitForTimeout(250); } return false; };
  const foto = async (p, nombre) => { if (!CAP) return; await p.waitForTimeout(400); await p.screenshot({ path: CAP + '/' + (cel ? 'cel_' : 'pc_') + nombre + '.png' }); };
  const alSub = async (p, sub) => { await p.evaluate((s) => { mostrarVista('stock'); const b = document.querySelector('#subtabsStock .subtab[data-sub="' + s + '"]'); b && b.click(); }, sub); await p.waitForTimeout(1800); };
  const est = (p) => p.evaluate(() => {
    const vis = (id) => { const x = document.getElementById(id); return !!x && !!x.offsetParent && !x.classList.contains('ar-off'); };
    const subs = [...document.querySelectorAll('#subtabsStock .subtab')].map((b) => b.dataset.sub);
    const act = ((document.querySelector('#subtabsStock .subtab.activo') || {}).dataset || {}).sub || '';
    return { subs, act, card: vis('arCard'), linea: vis('arLinea'), volver: vis('arVolver'), inv: vis('cardStockInventario'), hdr: (document.getElementById('hdrHoja') || {}).textContent || '', stock: document.getElementById('viewStock').style.display !== 'none', lineaTx: (document.getElementById('arLinea') || {}).textContent || '' };
  });

  // ================================================================= 0..2) el pañolero con la receta y 4 armadas
  if (SOLO('0') || SOLO('1') || SOLO('2')) {
    const A = await sesion('pan', null, { conArmadas: true }); const p = A.page;
    await alSub(p, 'inventario');
    let e = await est(p);
    const iH = e.subs.indexOf('herramientas');
    c(iH >= 0 && e.subs[iH + 1] === 'armadas' && /🔧 Armadas/.test(await tx(p, '#subtabsStock [data-sub="armadas"]')), 'la subpestaña «🔧 Armadas» está después de Herramientas (' + e.subs.slice(0, 5).join(', ') + ')');
    c(!e.card && e.inv, 'Catálogo pañol ya no tiene la tarjeta de las armadas');
    c(e.linea && /Luminarias armadas: 4 listas/.test(e.lineaTx) && /Ver/.test(e.lineaTx), 'Catálogo pañol: la línea «🔧 Luminarias armadas: 4 listas · Ver» (' + e.lineaTx.trim() + ')');
    await foto(p, '01_catalogo_linea');
    if (SOLO('0')) {
      await p.click('#arLinea [data-armtab="ir"]'); await p.waitForTimeout(1000);
      e = await est(p);
      c(e.act === 'armadas' && e.card && !e.inv && !e.linea, '«Ver» abre la subpestaña con la tarjeta (y sin el catálogo)');
      c(/Luminaria armada 7 m/.test(await tx(p, '#arCard')) && !!(await p.$('#arCard [data-ar="armar"]')), 'la tarjeta de siempre: la armada con «Armar» y «Llevar a obra»');
      c(/Luminarias armadas/.test(e.hdr), 'el título de arriba dice «Luminarias armadas» (' + e.hdr + ')');
      c(e.volver, 'arriba, «‹ Volver al catálogo»');
      c(await p.evaluate(() => { const b = document.querySelector('#subtabsStock .subtab.activo'), s = document.getElementById('subtabsStock').getBoundingClientRect(), r = b.getBoundingClientRect(); return r.left >= s.left - 1 && r.right <= s.right + 1; }), 'la subpestaña «🔧 Armadas» queda a la vista en la fila');
      c((await scrollX(p)) <= 0, 'sin scroll de costado');
      await foto(p, '02_armadas_desde_catalogo');
      c(await esperar(p, () => window.__atras && window.__atras.estado().prof > 0), 'el «atrás» lo tiene anotado');
      await p.goBack(); await p.waitForTimeout(900);
      e = await est(p);
      c(e.stock && e.act === 'inventario' && e.linea && !e.card && !e.volver, '«atrás» vuelve al Catálogo pañol (no sale del pañol)');
      await p.click('#subtabsStock [data-sub="armadas"]'); await p.waitForTimeout(1000);
      e = await est(p);
      c(e.act === 'armadas' && e.card && !e.volver, 'tocando la subpestaña: la tarjeta, sin «Volver»');
      await p.click('#arCard [data-ar="armar"][data-arc="6026"]'); await p.waitForTimeout(700);
      c(await p.evaluate(() => !!document.getElementById('arOv') && /Armar/.test(document.getElementById('arOv').textContent)), '«Armar» desde la subpestaña abre la hoja de siempre');
      await foto(p, '03_armar_desde_sub');
      await p.evaluate(() => window.__armadas.cerrar()); await p.waitForTimeout(400);
      // Armadas → otra subpestaña → Armadas
      await p.click('#subtabsStock [data-sub="reservas"]'); await p.waitForTimeout(600);
      c(!(await est(p)).card, 'en Reservas no está la tarjeta');
      if (cel) c((await scrollX(p)) <= 0, 'celu: sin scroll de costado en el pañol');
    }
    if (SOLO('1')) {
      await alSub(p, 'inventario');
      await p.evaluate(() => window.abrirFichaMaterial(6026)); await p.waitForTimeout(900);
      c(await p.evaluate(() => !!document.querySelector('#pfModal .ar-pf [data-ar="armar"]') && !!document.querySelector('#pfModal .ar-pf [data-armtab="ficha"]')), 'la ficha de la armada: «Armar», «Llevar a obra» y «Ver en Pañol › Armadas»');
      await foto(p, '04_ficha');
      await p.click('#pfModal [data-armtab="ficha"]'); await p.waitForTimeout(1000);
      const e1 = await est(p);
      c(!(await p.$('#pfModal')) && e1.act === 'armadas' && e1.card, '«Ver en Pañol › Armadas» cierra la ficha y abre la subpestaña');
      await p.evaluate(() => window.abrirFichaMaterial(6026)); await p.waitForTimeout(900);
      await p.click('#pfModal .ar-pf [data-ar="armar"]'); await p.waitForTimeout(700);
      c(await p.evaluate(() => !!document.getElementById('arOv')), '«Armar» de la ficha sigue abriendo la hoja');
      await p.evaluate(() => { window.__armadas.cerrar(); const m = document.getElementById('pfModal'); m && m.remove(); }); await p.waitForTimeout(300);
    }
    if (SOLO('2')) {
      await p.evaluate(() => mostrarVista('inicio')); await p.waitForTimeout(800);
      await p.evaluate(() => window.__codigos.abrirRef({ doc: 'AR-0001' })); await p.waitForTimeout(1800);
      const t2 = await p.evaluate(() => { const h = document.getElementById('hojaOv'); return h ? (h.querySelector('.hj-tit b') || {}).textContent || '' : ''; });
      const e2 = await est(p);
      c(/AR-0001/.test(t2), '?doc=AR-0001 abre el comprobante del armado');
      c(e2.stock && e2.act === 'armadas', '…con Pañol › Armadas detrás');
      await p.evaluate(() => { const x = document.querySelector('#hojaOv .hj-x'); x && x.click(); }); await p.waitForTimeout(600);
      c((await est(p)).card, 'al cerrar el comprobante queda la subpestaña de las armadas');
    }
    c(errsJs(A).length === 0, 'pañolero: sin errores' + (errsJs(A).length ? ': ' + errsJs(A).slice(0, 2).join(' | ') : ''));
    await p.close();
  }

  // ================================================================= 3) roles
  if (SOLO('3')) {
    { // pañol sin recetas
      const A = await sesion('pan'); const p = A.page; await alSub(p, 'inventario');
      const e = await est(p);
      c(e.subs.includes('armadas') && e.linea && /todavía no hay recetas/.test(e.lineaTx), 'pañol sin recetas: la subpestaña igual y la línea «todavía no hay recetas»');
      await p.click('#arLinea [data-armtab="ir"]'); await p.waitForTimeout(900);
      c(/Tenés material en DEPOSITO LUMINARIAS/.test(await tx(p, '#arCard')) && !!(await p.$('#arCard [data-ar="nueva"]')), 'en la subpestaña: el aviso de DEPOSITO LUMINARIAS y «＋ Nueva armada»');
      await foto(p, '05_sin_receta');
      c(errsJs(A).length === 0, 'pañol sin recetas: sin errores'); await p.close();
    }
    { // oficina
      const A = await sesion('lucia', null, { conArmadas: true }); const p = A.page; await alSub(p, 'armadas');
      const e = await est(p);
      c(e.act === 'armadas' && e.card && !!(await p.$('#arCard [data-ar="armar"]')) && !!(await p.$('#arCard [data-ar="nueva"]')), 'oficina: la subpestaña con «Armar» y «＋ Nueva armada»');
      c(errsJs(A).length === 0, 'oficina: sin errores'); await p.close();
    }
    for (const [q, nom] of [['juan', 'cuadrilla'], ['mir', 'solo mirar'], ['dir', 'Dirección']]) {
      const A = await sesion(q, null, { conArmadas: true }); const p = A.page; await alSub(p, 'inventario');
      let e = await est(p);
      if (q === 'juan') c(e.subs.join(',') === 'inventario,armadas', 'cuadrilla: solo «Catálogo pañol» y «🔧 Armadas» (' + e.subs.join(',') + ')');
      else c(e.subs.includes('armadas'), nom + ': ve la subpestaña');
      c(e.linea && /4 listas/.test(e.lineaTx), nom + ': la línea en el catálogo');
      await p.click('#subtabsStock [data-sub="armadas"]'); await p.waitForTimeout(900);
      e = await est(p);
      const bot = !!(await p.$('#arCard [data-ar="armar"], #arCard [data-ar="llevar"], #arCard [data-ar="nueva"], #arCard [data-ar="dep"]'));
      c(e.card && /Luminaria armada 7 m/.test(await tx(p, '#arCard')) && !bot, nom + ': ve las armadas sin botones para armar ni llevar');
      if (cel) c((await scrollX(p)) <= 0, nom + ': sin scroll de costado');
      if (q === 'juan') await foto(p, '06_cuadrilla');
      c(errsJs(A).length === 0, nom + ': sin errores' + (errsJs(A).length ? ': ' + errsJs(A).slice(0, 2).join(' | ') : '')); await p.close();
    }
    { // cuadrilla sin recetas: como antes, solo el catálogo
      const A = await sesion('juan'); const p = A.page; await alSub(p, 'inventario');
      const e = await est(p);
      c(e.subs.join(',') === 'inventario' && !e.linea, 'cuadrilla sin recetas: solo «Catálogo pañol», sin la línea');
      await p.close();
    }
  }

  // ================================================================= 4) compatibilidad
  if (SOLO('4')) {
    const A = await sesion('pan', { v169: false }, { conArmadas: true }); const p = A.page;
    await alSub(p, 'inventario');
    const e = await est(p);
    c(!e.subs.includes('armadas') && e.card && !e.linea && e.inv, '__v169No: la tarjeta en Catálogo pañol como la v168, sin la subpestaña ni la línea');
    c(await p.evaluate(() => !document.querySelector('[data-armtab]')), '__v169No: sin «Ver» ni «Ver en Pañol › Armadas»');
    c(errsJs(A).length === 0, '__v169No: sin errores'); await p.close();
  }
  await browser.close();
  process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
