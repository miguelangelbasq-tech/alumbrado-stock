// Pruebas v102 (1) · columnas sin vínculo y tableros en la orden, recalcular una obra registrada, etapa y «qué falta» desde
// los ítems, la inspección ya no rellena el material sin preguntar, colores del avance como los del mapa.
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
(async () => {
  const c = prueba('v102a' + (cel ? ' cel' : ''));
  const d = baseDatos();
  d.db.avanceObras.p1.secciones = [{ titulo: 'Materiales', items: [{ desc: 'Columna PRFV recta 7 m', cod: 6008, cantNecesaria: 2, un: 'Un.', cantInstalada: 1 }] }];
  const A = await abrir({ sesion: 'admin', cel, datos: d, espera: 3500, reglas: true }), p = A.page;
  const dlg = []; p.on('dialog', (x) => { dlg.push(x.message()); x.accept(); });
  await p.evaluate(() => mostrarVista('calc')); await p.waitForTimeout(700);
  const calc = (cols, vinc, t2) => p.evaluate(async ([cols, vinc, t2]) => {
    const w = (ms) => new Promise((r) => setTimeout(r, ms));
    document.getElementById('obraNombre').value = 'Plaza San Martín'; document.getElementById('obraId').value = '1234';
    columnaGrupos.length = 0; columnaGrupos.push({ id: 1, altura: 7, columnas: cols }); renderColumnaGrupos();
    vinculoGrupos.length = 0; vinculoGrupos.push({ id: 1, tipo: 'simple_400', columnas: vinc, sobre: 'nueva' }); try { renderVinculoGrupos(); } catch (e) { }
    tablerosExtra.length = 0; if (t2) { document.getElementById('tableroAddBtn').click(); await w(200); }
    calcular(); await w(1300);
    const o = avanceObras.find((x) => x.id === 'p1'), t = window.totalesDeObra(o), pv = window.epecPreviaDe(o);
    return { col: t.montaje_prfv, tab: t.tablero, dudas: (pv.dudas || []).join(' ') };
  }, [cols, vinc, t2]);
  let r = await calc(4, 3, false);
  c(r.col === 4 && /1 columna\(s\) de 7 m<\/b> no tienen vínculo/.test(r.dudas), 'plaza de 4 columnas con vínculos para 3: la orden cuenta 4 (la que sobra como de 1 brazo, con aviso) · ' + r.col);
  r = await calc(4, 4, true);
  c(r.tab === 2, 'recalculando enseguida con un segundo tablero, la orden ya cuenta 2 (antes quedaba el resultado viejo 20 s) · ' + r.tab);
  // obra ya registrada con material viejo → pasar el cálculo
  r = await p.evaluate(() => { renderAvisoAltaComputo(); const b = document.querySelector('#avisoAltaComputo [onclick*="__obraComputo.pasar"]'); return { b: !!b, txt: (document.getElementById('avisoAltaComputo') || {}).innerText || '' }; });
  c(r.b && /cálculo anterior/.test(r.txt), 'la obra registrada tiene el material de un cálculo anterior: aparece «🔄 Pasar este cálculo a la obra»');
  await p.click('#avisoAltaComputo [onclick*="__obraComputo.pasar"]'); await p.waitForTimeout(1200);
  r = await p.evaluate(() => { const o = window.__stubDB().avanceObras.p1; const cols = []; (o.secciones || []).forEach((s) => s.items.forEach((i) => { if (+i.cod === 6008) cols.push(i.cantNecesaria + '/' + i.cantInstalada); })); return { cols, n: (o.secciones || []).length, boton: !!document.querySelector('#avisoAltaComputo [onclick*="__obraComputo.pasar"]') }; });
  c(dlg.some((x) => /cálculo anterior/.test(x)) && r.cols.join() === '4/1' && r.n > 1 && !r.boton, 'pregunta antes y la obra queda con el cálculo nuevo (4 columnas), conservando lo instalado (1) · ' + JSON.stringify(r));
  // etapa y qué falta desde los ítems
  r = await p.evaluate(() => {
    const o = { id: 'x', etapas: {}, valorItems: [{ id: 1, itemPliego: '6', cantidad: 4, cantidadAvanzada: 4 }, { id: 2, itemPliego: '10', cantidad: 1, cantidadAvanzada: 1 }] };
    const a = [etapaActualLabel(o), pendienteSugerido(o)];
    o.valorItems[1].cantidadAvanzada = 0; a.push(etapaActualLabel(o), pendienteSugerido(o));
    o.valorItems[1].cantidadAvanzada = 1; o.etapas.inspeccion = true; a.push(pendienteSugerido(o));
    return a;
  });
  c(r[0] === 'Finalizada' && /Inspección municipal/.test(r[1]) && !/Poste/.test(r[1]), 'obra al 100 % sin poste ni desmonte: dice «Finalizada» y solo falta la inspección (antes: «Poste de PRFV para tablero») · ' + r.slice(0, 2).join(' | '));
  c(/Tablero y acometida/.test(r[2]) && /Tablero y acometida \(0 de 1/.test(r[3]) && /Obra terminada/.test(r[4]), 'si falta el tablero lo dice con lo que falta, y con la inspección tildada queda terminada · ' + r.slice(2).join(' | '));
  r = await p.evaluate(() => [colorPorPctEtapas(0), colorPorPctEtapas(20), colorPorPctEtapas(45), colorPorPctEtapas(80), colorPorPctEtapas(100)]);
  c(r.join() === '#9aa3b5,#FF3B30,#FF9F0A,#3b82f6,#34C759', 'colores del avance iguales a los del mapa: gris, rojo, amarillo, azul, verde');
  // inspección: pregunta antes de marcar el material
  await p.evaluate(() => { const o = avanceObras.find((x) => x.id === 'p1'); o.valorItems = [{ id: 1, itemPliego: '6', cantidad: 4, cantidadAvanzada: 4 }]; o.etapas = { pozo: true, zanjeo: true, cableTapada: true, fundaciones: true, izaje: true, vinculos: true, posteTablero: true, tableroConexion: true, sellos: true, limpiezaPintura: true, desmonte: true }; mostrarVista('avance'); verAvanceDetalle('p1'); });
  await p.waitForTimeout(800); dlg.length = 0;
  p.removeAllListeners('dialog'); p.on('dialog', (x) => { dlg.push(x.message()); x.dismiss(); });
  await p.click('#avanceDetalleCard input[data-action="toggle-etapa"][data-etapa="inspeccion"]'); await p.waitForTimeout(1200);
  r = await p.evaluate(() => { const o = window.__stubDB().avanceObras.p1; return { insp: o.etapas.inspeccion, inst: o.secciones.map((s) => s.items.map((i) => i.cantInstalada)).flat() }; });
  c(r.insp === true && dlg.some((x) => /Marco también todo el material/.test(x)) && r.inst.filter((x) => x > 1).length === 0, 'tildar la inspección pregunta antes de marcar todo el material instalado (si decís que no, no lo toca) · ' + JSON.stringify(r).slice(0, 120));
  r = await p.evaluate(() => (document.getElementById('avancePanelHint') || {}).textContent || '');
  c(!/valorización|etapas/.test(r), 'los textos ya no mencionan etapas ni valorización · ' + r);
  if (cel) { const w = await p.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]); c(w[0] <= w[1] + 1, 'celular: sin scroll de costado ' + w); }
  const errs = A.errores.filter((e) => !/Missing or insufficient permissions/.test(e));
  c(!errs.length, 'sin errores de JS ' + JSON.stringify(errs.slice(0, 3)));
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
