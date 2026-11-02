// Pruebas v092 · Proyectista con cálculos: Columnas (qué lleva cada una), Eléctrico (caída de tensión, fases, protecciones),
// Luz (archivo .ldt/.ies, cálculo punto por punto, mapa de zonas oscuras, radio útil) y memoria de cálculo.
// Los números se controlan aparte, en Python (num/control.py: 9.600 controles). Acá: que la pantalla use esos cálculos,
// guarde bien, avise lo que falta, ande en el celular y no tire errores.
const { abrir, otraPagina, prueba, baseDatos } = require('./h');
const { F, ldt, ies } = require('./num/fotos.js');
const fs = require('fs'), os = require('os'), path = require('path');
const cel = process.argv[2] === 'cel';
const esperar = (p, fn, arg, ms = 10000) => p.waitForFunction(fn, arg, { timeout: ms, polling: 100 }).then(() => true, () => false);
// plaza de prueba: tablero, 6 columnas, borde de 4 puntos (coordenadas en metros desde un origen)
const LAT0 = -31.4201, LNG0 = -64.1888, KY = 110861.5, KX = 95049.0;
const ll = (x, y) => ({ lat: LAT0 + y / KY, lng: LNG0 + x / KX });
function proyecto(nCol, conBorde) {
  const ps = [Object.assign({ id: 't1', n: 'T1', tipo: 'tab', acc: 0.02, fuente: 'gps', ts: 1, nota: '' }, ll(-6, -6))];
  for (let i = 0; i < nCol; i++) {
    const x = (i % 6) * 15, y = Math.floor(i / 6) * 16 + (i % 2) * 3;
    ps.push(Object.assign({ id: 'c' + i, n: 'C' + (i + 1), tipo: i === 3 ? 'colE' : 'colN', acc: 0.02, fuente: 'gps', ts: 2 + i, nota: '' }, ll(x, y)));
  }
  if (conBorde) { const W = 6 * 15 - 5, H = Math.ceil(nCol / 6) * 16; [[-8, -8], [W, -8], [W, H], [-8, H]].forEach((q, i) => ps.push(Object.assign({ id: 'b' + i, n: 'B' + (i + 1), tipo: 'borde', acc: null, fuente: 'mapa', ts: 100 + i, nota: '', corte: i === 0 }, ll(q[0], q[1])))); }
  return { nombre: 'PLAZA PRUEBA · proyecto', obraId: '', obraNombre: '', puntos: ps, creado: 1, ts: 1, por: 'admin', faja: 0, etapa: 1 };
}
function datos() {
  const d = baseDatos();
  d.db.proyectos = { pz1: proyecto(6, true), pz2: proyecto(60, true) };
  return d;
}
(async () => {
  const c = prueba('v092' + (cel ? ' cel' : ''));
  const M = await abrir({ sesion: 'admin', cel, datos: datos(), espera: 3500, reglas: true, https: true, leaflet: true });
  const p = M.page, errores = M.errores;
  const dbp = (id) => p.evaluate((i) => JSON.parse(JSON.stringify((window.__stubDB().proyectos || {})[i] || null)), id);
  const sinCostado = async (donde) => { const r = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, w: document.documentElement.clientWidth, ov: document.getElementById('pyCuerpo').scrollWidth - document.getElementById('pyCuerpo').clientWidth })); c(r.sw <= r.w + 1 && r.ov <= 1, 'celular: ' + donde + ' sin scroll de costado ' + JSON.stringify(r)); };
  await p.evaluate(() => window.__abrirProyectista('pz1')); await esperar(p, () => window.__proyectista && window.__proyectista.estado().id === 'pz1'); await p.waitForTimeout(800);   // Leaflet saca las etiquetas viejas con una animación
  let r = await p.evaluate(() => [...document.querySelectorAll('#pyOv [data-py="pest"]')].map((b) => b.textContent));
  c(r.length === 6 && /Columnas/.test(r[3]) && /Eléctrico/.test(r[4]) && /Luz/.test(r[5]), 'pestañas nuevas: Columnas, Eléctrico y Luz: ' + r.join(' | '));
  r = await p.evaluate(() => ({ tipo: [...document.querySelectorAll('#pyOv [data-py="tipo"]')].map((b) => b.textContent.trim()), cotas: [...document.querySelectorAll('#pyMapa .py-cota')].length, borde: document.querySelectorAll('#pyMapa path.leaflet-interactive, #pyMapa path').length }));
  c(r.tipo.includes('Borde de la plaza'), 'tipo de punto nuevo «Borde de la plaza»');
  c(r.cotas === 6, 'los puntos de borde no se unen con los tramos de cable (6 cotas, de T1 a C6): ' + r.cotas);

  // ---- Columnas sin luminaria: avisa
  await p.click('[data-py="pest"][data-p="cols"]'); await p.waitForTimeout(300);
  r = await p.evaluate(() => ({ filas: document.querySelectorAll('#pyCols tbody tr').length, txt: document.getElementById('pyCols').innerText }));
  c(r.filas === 6 && /Falta cargar la luminaria/.test(r.txt) && !/Falta marcar el tablero/.test(r.txt), 'Columnas: 6 filas y avisa que falta la luminaria (el tablero está): ' + r.filas);
  if (cel) await sinCostado('Columnas');

  // ---- Luz: cargar la luminaria con su archivo .ldt
  await p.click('[data-py="pest"][data-p="luz"]'); await p.waitForTimeout(500);
  r = await p.evaluate(() => document.getElementById('pyLuz').innerText);
  c(/Todavía no hay luminarias/.test(r) && /Cargá la luminaria/.test(r), 'Luz sin luminaria: lo dice claro');
  const arch = path.join(os.tmpdir(), 'LED_prueba_' + process.pid + '.ldt');
  fs.writeFileSync(arch, ldt(2, F.c0, 72, 37, 85, 10000, 98.5), 'latin1');
  await p.setInputFiles('#pyLumArch', arch); await esperar(p, () => /Archivo leído/.test(document.getElementById('pyLuz').innerText));
  r = await p.evaluate(() => ({ n: document.getElementById('pyLumNom').value, w: document.getElementById('pyLumW').value, lm: document.getElementById('pyLumLm').value }));
  c(r.n === 'LUMINARIA PRUEBA ISYM 2' && r.w === '98,5' && r.lm === '8500', 'al elegir el .ldt completa nombre, potencia y flujo solos: ' + JSON.stringify(r));
  await p.fill('#pyLumCos', '1,2'); await p.click('[data-py="lumGuardar"]'); await p.waitForTimeout(300);
  r = await p.evaluate(() => (document.getElementById('pyMsg') || {}).textContent);
  c(/cos φ va entre 0 y 1/.test(r), 'controla los datos (cos φ 1,2 no): ' + r);
  await p.fill('#pyLumCos', '0,95'); await p.click('[data-py="lumGuardar"]');
  await esperar(p, () => ((window.__stubDB().proyectos.pz1.lums) || []).length === 1);
  const pz = await dbp('pz1');
  const L1 = pz.lums[0];
  c(L1 && L1.W === 98.5 && L1.lm === 8500 && L1.cos === 0.95 && L1.fot && L1.fot.formato === 'LDT' && L1.fot.i.length === 73 && L1.fot.i[0].length === 73 && JSON.stringify(L1).length < 60000, 'guarda la luminaria con su fotometría compacta (' + JSON.stringify(L1).length + ' bytes)');

  // ---- Columnas: poner a todas + editar una
  await p.click('[data-py="pest"][data-p="cols"]'); await p.waitForTimeout(300);
  await p.selectOption('#pyMasCol', 'P7'); await p.selectOption('#pyMasArt', '1'); await p.selectOption('#pyMasLum', L1.id); await p.click('[data-py="aplicar"]');
  await esperar(p, () => window.__stubDB().proyectos.pz1.puntos.filter((x) => x.el && x.el.lum).length === 6);
  r = (await dbp('pz1')).puntos.filter((x) => x.el);
  c(r.length === 6 && r.every((x) => x.el.col === 'P7' && x.el.art === 1 && x.el.lum === L1.id), '«Poner a todas»: tipo, artefactos y luminaria en las 6 columnas');
  await p.selectOption('#pyCols tr[data-id="c4"] select[data-pye="art"]', '2'); await p.waitForTimeout(400);
  await p.selectOption('#pyCols tr[data-id="c2"] select[data-pye="circ"]', '2'); await p.waitForTimeout(400);
  await p.selectOption('#pyCols tr[data-id="c5"] select[data-pye="circ"]', '2'); await p.waitForTimeout(400);
  await p.fill('#pyCols tr[data-id="c1"] input[data-pye="mira"]', '370'); await p.press('#pyCols tr[data-id="c1"] input[data-pye="mira"]', 'Tab'); await p.waitForTimeout(400);
  r = (await dbp('pz1')).puntos;
  const porId = {}; r.forEach((x) => { porId[x.id] = x; });
  c(porId.c4.el.art === 2 && porId.c2.el.circ === 2 && porId.c5.el.circ === 2 && porId.c1.el.mira === 10, 'editar una columna: artefactos, circuito y rumbo (370° → 10°) quedan guardados');
  r = await p.evaluate(() => [...document.querySelectorAll('#pyCols tr[data-id="c5"] select[data-pye="de"] option')].map((o) => o.textContent));
  c(r.join() === 'la anterior,el tablero,C3', '«Viene de» ofrece el tablero y las columnas del mismo circuito: ' + r.join(', '));

  // ---- Eléctrico
  await p.click('[data-py="pest"][data-p="elec"]'); await p.waitForTimeout(400);
  const calc = await p.evaluate(() => { const r = window.__proyectista._calc.red('pz1'); return { n: r.circuitos.length, c: r.circuitos.map((k) => ({ dv: k.dvMax, In: k.prot.In, P: k.P, art: k.art, fases: k.nPorFase })), gen: r.tableros[0] }; });
  r = await p.evaluate(() => ({ filas: [...document.querySelectorAll('#pyElec tr[data-clave]')].map((t) => t.innerText.replace(/\s+/g, ' ')), txt: document.getElementById('pyElec').innerText }));
  c(calc.n === 2 && r.filas.length === 2 && calc.c[0].art === 5 && calc.c[1].art === 2, 'dos circuitos (5 y 2 artefactos): ' + JSON.stringify(calc.c.map((k) => k.art)));
  c(r.filas[0].indexOf(calc.c[0].dv.toFixed(2).replace('.', ',') + ' %') >= 0 && r.filas[0].indexOf(calc.c[0].P.toFixed(0) + ' W') >= 0, 'la tabla muestra la caída y la potencia que da el cálculo: ' + r.filas[0].slice(0, 120));
  c(calc.c[0].fases.R + calc.c[0].fases.S + calc.c[0].fases.T === 5 && Math.max(calc.c[0].fases.R, calc.c[0].fases.S, calc.c[0].fases.T) <= 2, 'reparto automático de fases parejo (5 artefactos → ' + JSON.stringify(calc.c[0].fases) + ')');
  c(/Térmica curva C 10 A tetrapolar/.test(r.txt) && /Interruptor general recomendado/.test(r.txt) && /a confirmar/.test(r.txt), 'protecciones recomendadas por circuito y general (lo que no se sabe, «a confirmar»)');
  c(/Cuadro resumen/.test(r.txt) && /Columnas PRFV 7 m\s*6 Un\./.test(r.txt) && /Luminarias LUMINARIA PRUEBA ISYM 2\s*7 Un\./.test(r.txt) && /Jabalinas[^\n]*\s*3 Un\./.test(r.txt), 'cuadro resumen: columnas, luminarias (7), cable y jabalinas (2 circuitos + 1 tablero)');
  const dv4 = calc.c[0].dv;
  await p.selectOption('#pyElec tr[data-clave="t1|1"] select[data-pyci="sec"]', '10'); await p.waitForTimeout(500);
  let calc2 = await p.evaluate(() => window.__proyectista._calc.red('pz1').circuitos[0].dvMax);
  r = (await dbp('pz1')).circ;
  c(r && r['t1|1'].sec === 10 && calc2 < dv4 * 0.6, 'subir el cable a 10 mm² baja la caída (' + dv4.toFixed(3) + ' → ' + calc2.toFixed(3) + ' %) y queda guardado');
  await p.selectOption('#pyElec tr[data-clave="t1|1"] select[data-pyci="tipo"]', '1F'); await p.waitForTimeout(500);
  calc2 = await p.evaluate(() => { const k = window.__proyectista._calc.red('pz1').circuitos[0]; return { dv: k.dvMax, f: k.nPorFase, In: k.prot }; });
  c(calc2.f.R === 5 && calc2.f.S === 0 && calc2.In.polos === '2P', 'circuito monofásico: todo en una fase y térmica bipolar: ' + JSON.stringify(calc2.f));
  await p.selectOption('#pyElec tr[data-clave="t1|1"] select[data-pyci="tipo"]', '3F'); await p.waitForTimeout(400);
  await p.fill('#pyElec input[data-pyk="lim"]', 'abc'); await p.press('#pyElec input[data-pyk="lim"]', 'Tab'); await p.waitForTimeout(300);
  r = await p.evaluate(() => (document.getElementById('pyMsg') || {}).textContent);
  c(/Poné un número/.test(r), 'un dato mal escrito avisa y no se guarda: ' + r);
  await p.fill('#pyElec input[data-pyk="lim"]', '0,05'); await p.press('#pyElec input[data-pyk="lim"]', 'Tab'); await p.waitForTimeout(500);
  r = await p.evaluate(() => [...document.querySelectorAll('#pyElec .py-sem')].map((x) => x.className));
  c((await dbp('pz1')).calc.lim === 0.05 && r.some((x) => /mal/.test(x)), 'con una caída máxima muy baja (0,05 %) el semáforo se pone en rojo');
  await p.fill('#pyElec input[data-pyk="lim"]', '3'); await p.press('#pyElec input[data-pyk="lim"]', 'Tab'); await p.waitForTimeout(400);
  if (cel) await sinCostado('Eléctrico');

  // ---- Luz: calcula sola y coincide con el motor
  await p.click('[data-py="pest"][data-p="luz"]');
  await esperar(p, () => window.__proyectista.estado().luz, null, 20000);
  const L = await p.evaluate(() => { const e = window.__proyectista.estado(); const P = window.__stubDB().proyectos.pz1; const C = window.__proyectista._calc; const r = C.luz(P.puntos, P.lums, C.cfgDe(P)); return { e: e.luz, em: r.em, emin: r.emin, ok: r.ok, txt: document.getElementById('pyLuz').innerText, radios: document.querySelectorAll('#pyLuz .py-trad tbody tr').length, zona: r.zonaTipo, area: r.area }; });
  c(L.e && Math.abs(L.e.em - L.em) < 1e-9 && Math.abs(L.e.emin - L.emin) < 1e-9, 'la pantalla calcula la luz sola y da lo mismo que el motor: Em ' + L.em.toFixed(2) + ' lx · Emin ' + L.emin.toFixed(2) + ' lx');
  c(L.zona === 'borde' && Math.abs(L.area - 93 * 24) < 30, 'usa el borde de la plaza marcado como zona de cálculo (' + L.area.toFixed(0) + ' m²)');
  c(L.txt.indexOf(L.em.toFixed(1).replace('.', ',') + ' lx') >= 0 && /(Cumple|No cumple) la clase P3/.test(L.txt), 'muestra promedio, mínimo, uniformidad y si cumple la clase');
  c(L.radios === 6, 'radio útil de cada columna (6)');
  await p.selectOption('#pyLuz select[data-pyk="clase"]', 'P6'); await esperar(p, () => { const e = window.__proyectista.estado(); return e.luz && !e.calcLuz && /clase P6/.test(document.getElementById('pyLuz').innerText); }, null, 15000);
  r = await p.evaluate(() => window.__proyectista.estado().luz);
  c(r && r.ok === (r.em >= 2 && r.emin >= 0.4), 'cambiando la clase (P6) recalcula y vuelve a decir si cumple: ' + JSON.stringify(r));
  if (cel) await sinCostado('Luz');
  // ---- mapa de luz
  await p.click('[data-py="verLuz"]'); await p.waitForTimeout(1200);
  r = await p.evaluate(() => ({ img: document.querySelectorAll('#pyMapa img.leaflet-image-layer').length, src: ((document.querySelector('#pyMapa img.leaflet-image-layer') || {}).src || '').slice(0, 22), ley: !!document.querySelector('#pyOv .py-ley'), chip: (document.querySelector('[data-py="luzMapa"]') || {}).className }));
  c(r.img === 1 && r.src === 'data:image/png;base64,' && r.ley && /activo/.test(r.chip), '«Ver el mapa de luz»: zonas oscuras pintadas sobre el satélite, con leyenda');
  r = await p.evaluate(() => document.querySelectorAll('#pyMapa path').length);
  c(r >= 6 + 6 + 1, 'en el mapa: radio útil de cada columna y borde de la plaza (' + r + ' trazos)');
  await p.click('[data-py="pest"][data-p="plano"]'); await p.waitForTimeout(400);
  r = await p.evaluate(() => { const s = document.querySelector('#pyPlano svg'); return { img: s.querySelectorAll('image').length, pol: s.querySelectorAll('polygon').length }; });
  c(r.img === 1 && r.pol === 1, 'el plano también muestra la luz y el borde (' + JSON.stringify(r) + ')');

  // ---- memoria de cálculo
  await p.click('[data-py="memoria"]'); await esperar(p, () => !!document.getElementById('hojaOv'), null, 15000); await p.waitForTimeout(500);
  r = await p.evaluate(() => { const f = document.querySelector('#hojaOv iframe'); return f ? f.srcdoc : ''; });
  c(/Memoria de cálculo · PLAZA PRUEBA/.test(r) && /1\. Plano/.test(r) && /<image /.test(r) && /Unifilar · tablero T1/.test(r) && /Térmica curva C/.test(r) && /6\. A confirmar/.test(r) && /Método punto por punto/.test(r) && /fasores|fasorial/.test(r), 'memoria de cálculo A4: plano con la luz, columnas, circuitos, unifilar, luz, resumen y lo «a confirmar»');
  await p.evaluate(() => window.hojaEMA && hojaEMA.cerrar());
  // ---- DXF con borde y datos eléctricos
  r = await p.evaluate(() => window.__proyectista._dxf('pz1', 'gk'));
  c(/\r\nPOLYLINE\r\n8\r\nBORDE\r\n/.test(r) && (r.match(/\r\nVERTEX\r\n/g) || []).length === 4 && /\r\nELECTRICO\r\n/.test(r) && /T1\/1 [RST] 1xLUMINARIA PRUEBA ISYM 2/.test(r), 'DXF: borde de la plaza como polilínea y en cada columna tablero/circuito/fase/luminaria');

  // ---- .ies también
  fs.writeFileSync(arch.replace('.ldt', '.ies'), ies(F.c0, Array.from({ length: 37 }, (_, i) => i * 5), Array.from({ length: 37 }, (_, i) => i * 5), 10000, true));
  await p.click('[data-py="pest"][data-p="luz"]'); await p.waitForTimeout(400);
  await p.setInputFiles('#pyLumArch', arch.replace('.ldt', '.ies')); await esperar(p, () => /Archivo leído/.test(document.getElementById('pyLuz').innerText));
  r = await p.evaluate(() => ({ n: document.getElementById('pyLumNom').value, lm: document.getElementById('pyLumLm').value }));
  c(r.n === 'LUMINARIA IES' && +r.lm > 9000, 'también lee archivos .ies (nombre y flujo integrado): ' + JSON.stringify(r));
  await p.setInputFiles('#pyLumArch', { name: 'roto.ldt', mimeType: 'text/plain', buffer: Buffer.from('hola\nesto no es\n') }); await p.waitForTimeout(500);
  r = await p.evaluate(() => (document.getElementById('pyMsg') || {}).textContent);
  c(/No pude leer el archivo/.test(r), 'un archivo roto avisa y no rompe nada: ' + r);
  fs.unlinkSync(arch); fs.unlinkSync(arch.replace('.ldt', '.ies'));

  // ---- proyecto grande (60 columnas): rápido
  await p.click('[data-py="volver"]'); await p.waitForTimeout(300);
  await p.evaluate((l) => { const P = window.__stubDB().proyectos.pz2; return firebase.firestore().collection('proyectos').doc('pz2').update({ lums: [l], puntos: P.puntos.map((q) => (q.tipo === 'colN' || q.tipo === 'colE') ? Object.assign({}, q, { el: { lum: l.id, art: 2, circ: 1 + (+q.id.slice(1) % 4) } }) : q) }); }, L1);
  await p.waitForTimeout(800);
  await p.evaluate(() => window.__abrirProyectista('pz2')); await p.waitForTimeout(500);
  const t0 = Date.now();
  await p.click('[data-py="pest"][data-p="elec"]'); await esperar(p, () => document.querySelectorAll('#pyElec tr[data-clave]').length === 4);
  const tElec = Date.now() - t0;
  const t1 = Date.now();
  await p.click('[data-py="pest"][data-p="luz"]'); await esperar(p, () => window.__proyectista.estado().luz, null, 30000);
  const tLuz = Date.now() - t1;
  r = await p.evaluate(() => window.__proyectista._calc.red('pz2').circuitos.map((k) => k.art));
  c(tElec < 3000 && tLuz < 8000 && r.join() === '30,30,30,30', 'proyecto de 60 columnas (120 artefactos, 4 circuitos): eléctrico ' + tElec + ' ms, luz ' + tLuz + ' ms');

  // ---- otra compu de la oficina ve todo
  const O = await otraPagina(M, { sesion: 'admin', cel, espera: 3500, reglas: true, https: true, leaflet: true });
  await O.page.evaluate(() => window.__abrirProyectista('pz1')); await O.page.waitForTimeout(800);
  await O.page.click('[data-py="pest"][data-p="luz"]'); await esperar(O.page, () => window.__proyectista.estado().luz, null, 20000);
  r = await O.page.evaluate(() => window.__proyectista.estado().luz);
  const r1 = await p.evaluate(() => { const P = window.__stubDB().proyectos.pz1, C = window.__proyectista._calc; return C.luz(P.puntos, P.lums, C.cfgDe(P)).em; });
  c(r && Math.abs(r.em - r1) < 1e-9, 'otra compu de la oficina abre el proyecto y da el mismo resultado (queda todo en la base)');
  c(!errores.length && !O.errores.length, 'sin errores de JS ' + JSON.stringify(errores.concat(O.errores).slice(0, 4)));
  await M.browser.close(); process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
