// v180 · 🗂 Unir / mover / eliminar carpetas de obra (Ángel 19/11: «en carpetas a veces se crean por error o son duplicados;
//  hay que poner la posibilidad de mover o eliminar carpeta, mover órdenes, fotos, todo»). Datos: datos180 (PLAZA LOS ALAMOS
//  repetida de PLAZA LOS ÁLAMOS con órdenes, fotos, video, PDF, vales, reserva, cálculo, gasto, plano, punto, etapa, relevamiento,
//  aviso, itemizado, avance a mano y PAT; PLAZA VACÍA).
//  0) unir desde el legajo (hoja): inventario, choques, «Sí, unir» → «Unir»; todo apunta a la buena (cantidades = inventario),
//     la repetida archivada con unidaEn, itemizado/avance/PAT juntados (gana el destino en lo que choca), la orden cerrada con su
//     avance apuntando al ítem de la buena, el legajo y las órdenes de la buena lo incluyen, auditoría obra_unir con cada id;
//     «↶ Deshacer unión» deja todo como estaba.
//  1) se corta a mitad (tandas de 3, corte después de la 1.ª) → «Seguir la unión» desde el legajo termina sin duplicar nada.
//  2) mover una orden con sus fotos y su avance a otra obra (hoja) y deshacer.
//  3) eliminar: la vacía (doble confirmación, copia en auditoría, «Volver a crearla»); la que tiene cosas no (ofrece Unir/Archivar).
//  4) posibles duplicadas: tarjeta en Obras, Supervisor, «No son la misma».
//  5) roles: Dirección, cuadrilla, pañol y mirar no ven ni pueden.  6) asistente (oficina).  7) __v180No.
const { abrir, prueba } = require('./h');
const { datos180 } = require('./datos180');
const cel = process.argv[2] === 'cel';
const REGLAS = !!process.env.REGLAS;
const SOLO = (x) => !process.env.SOLO || process.env.SOLO.split(',').indexOf(String(x)) >= 0;
const CAP = process.env.CAP || '';
const W = 'https://ema-ia.mdiaz-60f.workers.dev';
(async () => {
  const c = prueba('v180' + (cel ? ' cel' : '') + (REGLAS ? ' REGLAS' : ''));
  const MOD = { cel, espera: 3500, v180: true, v152: true, v158: true, reglas: REGLAS, antes: () => { window.__supNoIA = true; window.__pmPausa = true; window.__hvPausa = true; window.__aaPausa = true; window.__isNoAuto = true; window.__gdEspera = 0; } };
  const sesion = async (quien, d, op) => { const A = await abrir(Object.assign({ sesion: quien, datos: d || datos180() }, MOD, op || {})); A.page.on('dialog', (x) => x.accept()); await A.page.waitForTimeout(800); return A; };
  const db = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('stub.db') || '{}'));
  const tx = (p, s) => p.evaluate((x) => { const e = document.querySelector(x); return e ? e.innerText.replace(/\s+/g, ' ').trim() : ''; }, s);
  const esperar = async (p, fn, arg, n) => { for (let i = 0; i < (n || 60); i++) { if (await p.evaluate(fn, arg)) return true; await p.waitForTimeout(200); } return false; };
  const clic = async (p, sel) => { await p.evaluate((s) => { const b = document.querySelector(s); if (!b) throw new Error('no está ' + s); b.scrollIntoView({ block: 'center' }); }, sel); await p.click(sel); await p.waitForTimeout(250); };
  const legajo = async (p, id) => { await p.evaluate((x) => { mostrarVista('obras'); window.abrirLegajo(x); }, id); await p.waitForTimeout(400); await esperar(p, () => !!document.getElementById('lgCpSec') || !!document.getElementById('lgFotosSec'), null, 30); await p.waitForTimeout(1700); };
  const sinCostado = (p) => p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  const cap = async (p, n) => { if (CAP && /legajo|unida|mitad/.test(n)) await p.evaluate(() => { const s = document.getElementById('lgCpSec'); s && s.scrollIntoView({ block: 'center' }); }); if (CAP) await p.screenshot({ path: CAP + '/' + n + (cel ? '_cel' : '_pc') + '.png', fullPage: false }); };
  const conf2 = async (p, texto) => { await esperar(p, () => !!document.getElementById('cpConf2'), null, 30); if (texto) await p.fill('#cpConf2In', texto); await p.click('#cpConf2 [data-cc2="si"]'); await p.waitForTimeout(300); };
  const COLS_P = ['ordenesTrabajo', 'fotosObra', 'adjuntos', 'movimientos', 'reservas', 'historialCalculos', 'gastosObra', 'historialEtapas', 'planosObra', 'mapaPuntos'];
  const deObra = (d, id) => { const r = {}; COLS_P.forEach((k) => { r[k] = Object.keys(d[k] || {}).filter((x) => d[k][x] && d[k][x].plazaId === id).sort(); }); r.proyectos = Object.keys(d.proyectos || {}).filter((x) => d.proyectos[x].obraId === id); return r; };
  const total = (r) => Object.keys(r).reduce((s, k) => s + r[k].length, 0);
  try {
    // ======================================================================= 0) unir desde el legajo y deshacer
    if (SOLO(0)) {
      const D = datos180(), A = await sesion('admin', D), p = A.page;
      const antes = deObra(D.db, 'p1b'), nAntes = total(antes), p1Antes = deObra(D.db, 'p1');
      await legajo(p, 'p1b');
      const s = await tx(p, '#lgCpSec');
      c(/Unir, mover o eliminar esta carpeta/.test(s) && /Puede ser la misma que «PLAZA LOS ÁLAMOS» \(mismo ID 4031, mismo nombre, pines a \d+ m\)/.test(s), 'legajo: «🗂 Unir, mover o eliminar» con «Puede ser la misma que PLAZA LOS ÁLAMOS»');
      await cap(p, '180_0_legajo');
      await clic(p, '#lgCpSec [data-cpabrir^="unir:"]');
      c(await esperar(p, () => !!document.querySelector('#cpOv [data-cpdest="p1"]')), 'hoja «🔗 Unir con otra obra»: la parecida arriba y el buscador');
      const ov = await p.evaluate(() => { const v = document.getElementById('cpOv'); return { rol: v.getAttribute('role'), x: !!v.querySelector('[aria-label="Cerrar"]'), st: !!v.querySelector('#cpMsg[role=status]') }; });
      c(ov.rol === 'dialog' && ov.x && ov.st, 'la hoja es role=dialog con ✕ y mensaje role=status');
      await p.fill('#cpQ', 'acac'); await p.waitForTimeout(300);
      c(/LAS ACACIAS/.test(await tx(p, '#cpOv .cp-lista')) && !/BULEVARES/.test(await tx(p, '#cpOv .cp-lista')), 'el buscador filtra');
      await p.fill('#cpQ', ''); await p.waitForTimeout(200);
      await clic(p, '#cpOv [data-cpdest="p1"]');
      c(await esperar(p, () => !!document.querySelector('#cpOv [data-cp="unirSi"]'), null, 60), 'revisar: inventario armado');
      const h = await tx(p, '#cpOv');
      c(/2 órdenes de trabajo/.test(h) && /3 fotos/.test(h) && /1 videos/.test(h) && /1 PDF/.test(h) && /2 vales, entradas y devoluciones/.test(h) && /1 reservas/.test(h) && /1 cálculos/.test(h) && /1 gastos/.test(h) && /1 planos/.test(h) && /1 puntos del mapa/.test(h) && /1 relevamientos/.test(h), 'inventario: órdenes, fotos, video, PDF, vales, reserva, cálculo, gasto, plano, punto, relevamiento');
      c(/«PLAZA LOS ÁLAMOS»: 4 → 6/.test(h), 'antes → después de la buena (órdenes 4 → 6)');
      c(/1 avisos de la cuadrilla/.test(h) && /quedan con la de origen/.test(h), 'el aviso de la cuadrilla queda (las reglas no dejan cambiarlo) y se dice');
      c(/Lo que choca \(2\)/i.test(h) && /ítem 5: esta tiene 0,75 hecho, la que se une 2/.test(h) && /c_pozo|pozo COL 1/.test(h), 'choques listados: ítem 5 y el pozo de la Col 1 (gana el destino salvo que se elija)');
      c(/＋ ítem 13/.test(h) && /Documentación «pat»/.test(h) && /carpeta EPEC/.test(h), 'lo que se junta: ítem 13, la planilla de PAT, la carpeta');
      c(await sinCostado(p), 'sin scroll de costado');
      await cap(p, '180_0_revisar');
      await clic(p, '#cpOv [data-cp="unirSi"]');
      c(/¿Seguro\? Se pasan 21 cosas/.test(await tx(p, '#cpOv')) && !!(await p.$('#cpOv [data-cp="unirYa"]')), 'segunda confirmación: «¿Seguro? Se pasan 21 cosas…» con «🔗 Unir»');
      await cap(p, '180_0_confirmar');
      let d = await db(p); c(total(deObra(d, 'p1b')) === nAntes && !(d.avanceObras.p1b.union), 'hasta tocar «Unir» no cambió nada');
      await clic(p, '#cpOv [data-cp="unirYa"]');
      c(await esperar(p, () => !!document.querySelector('#cpOv [data-cp="abrirDst"]'), null, 80), 'listo: «Abrir PLAZA LOS ÁLAMOS» y «↶ Deshacer unión»');
      c(/quedó archivada \(unida en «PLAZA LOS ÁLAMOS»\)/.test(await tx(p, '#cpOv')), 'el mensaje dice que quedó archivada y unida');
      await cap(p, '180_0_listo');
      d = await db(p);
      const ahora = deObra(d, 'p1'), queda = deObra(d, 'p1b');
      c(total(queda) === 0, 'en la repetida no queda nada (' + total(queda) + ')');
      c(COLS_P.every((k) => antes[k].every((x) => ahora[k].indexOf(x) >= 0)) && antes.proyectos.every((x) => ahora.proyectos.indexOf(x) >= 0), 'cada cosa de la repetida ahora es de la buena');
      c(total(ahora) === total(p1Antes) + nAntes, `las cuentas cierran: ${total(p1Antes)} + ${nAntes} = ${total(ahora)}`);
      c(d.ordenesTrabajo.b150.plazaNombre === 'PLAZA LOS ÁLAMOS' && d.movimientos.mb1.destino === 'PLAZA LOS ÁLAMOS' && d.fotosObra.gb3.plazaNombre === 'PLAZA LOS ÁLAMOS' && d.fotosObra.gb3.movidaDe.plazaId === 'p1b', 'con el nombre de la buena (órdenes, vales, fotos con movidaDe)');
      c(d.historialCalculos.cb1.plazaId === 'p1' && d.historialCalculos.cb1.nombre === 'PLAZA LOS ÁLAMOS' && d.historialCalculos.cb1.form.campos.obraNombre === 'PLAZA LOS ÁLAMOS', 'el cálculo pasa con su formulario');
      c(d.proyectos.pyb.obraId === 'p1' && d.avisosCuadrilla.avb.obraId === 'p1b', 'el relevamiento pasa; el aviso de la cuadrilla queda');
      const o = d.avanceObras.p1b, b = d.avanceObras.p1;
      c(o.oculta === true && o.unidaEn === 'p1' && o.union.estado === 'hecha' && o.union.hechos === 21 && o.union.pasos.length === 21, 'la repetida: archivada, unidaEn p1, union hecha 21 de 21 (no se borró)');
      const i5 = b.valorItems.find((x) => x.itemPliego === '5'), i13 = b.valorItems.find((x) => x.itemPliego === '13');
      c(i5.cantidadAvanzada === 0.75 && i13 && i13.cantidadAvanzada === 1, 'itemizado: el ítem 5 queda como estaba (choque, gana el destino), el 13 se suma con 1 hecho');
      c(b.av2.m['c_pozo_COL 1'].e === 'no' && b.av2.m['c_pozo_COL 2'].e === 'si', 'avance de obra: la Col 1 queda «no» (destino) y la Col 2 «si» se suma');
      c(b.documentos.pat.ok && b.carpetaEpec === '2026-11-02' && b.avanceHist.length === 1 && b.avanceHist[0].deObra === 'PLAZA LOS ALAMOS', 'PAT, carpeta EPEC y el historial del avance pasan');
      c(d.ordenesTrabajo.b150.cierre.avanceItems[0].id === 1, 'la orden cerrada apunta al ítem 5 de la buena (id 1)');
      const aud = Object.values(d.auditoria || {}).find((x) => x.accion === 'obra_unir');
      c(aud && aud.destino === 'p1' && aud.ids.ordenesTrabajo.length === 2 && aud.ids.fotosObra.length === 5 && aud.cantidad === 21, 'auditoría obra_unir con cada id movido');
      await clic(p, '#cpOv [data-cp="x"]');
      await p.waitForTimeout(800);
      const memo = await p.evaluate(() => ({ ots: ordenesTrabajo.filter((x) => x.plazaId === 'p1').length, sal: (() => { try { return JSON.stringify(window.saldoObra('p1')).length > 2; } catch (e) { return false; } })(), vis: avanceObras.some((x) => x.id === 'p1b') }));
      c(memo.ots === 6 && !memo.vis, 'en la app: la buena tiene 6 órdenes y la repetida ya no sale en las hojas');
      await legajo(p, 'p1');
      const lg = await p.evaluate(() => [...document.querySelectorAll('#obrasApp .lg-tile')].map((x) => x.innerText.replace(/\s+/g, ' ')).join(' | '));
      c(/Órdenes 6/i.test(lg) && /Fotos (8|9|1\d)/i.test(lg), 'el legajo de la buena: 6 órdenes y las fotos juntas · ' + lg);
      // deshacer desde la carpeta archivada
      await legajo(p, 'p1b');
      c(/se unió con «PLAZA LOS ÁLAMOS»/.test(await tx(p, '#lgCpSec')), 'el legajo de la repetida dice «se unió con…» con «↶ Deshacer unión»');
      await cap(p, '180_0_unida');
      await clic(p, '#lgCpSec [data-cpabrir^="deshacer:"]');
      await conf2(p);
      c(await esperar(p, () => /Unión deshecha/.test((document.getElementById('cpOv') || {}).innerText || ''), null, 80), '«↶ Unión deshecha»');
      d = await db(p);
      const vuelto = deObra(d, 'p1b');
      c(COLS_P.every((k) => JSON.stringify(vuelto[k]) === JSON.stringify(antes[k])) && JSON.stringify(deObra(d, 'p1')) === JSON.stringify(p1Antes), 'deshacer: cada cosa vuelve a su obra');
      c(d.ordenesTrabajo.b150.plazaNombre === 'PLAZA LOS ALAMOS' && !('movidaDe' in d.fotosObra.gb3) && d.historialCalculos.cb1.nombre === 'PLAZA LOS ALAMOS' && d.ordenesTrabajo.b150.cierre.avanceItems[0].id === 7, 'con sus nombres de antes (y sin movidaDe)');
      c(JSON.stringify(d.avanceObras.p1.valorItems) === JSON.stringify(D.db.avanceObras.p1.valorItems) && JSON.stringify(d.avanceObras.p1.av2) === JSON.stringify(D.db.avanceObras.p1.av2) && !d.avanceObras.p1.documentos && !d.avanceObras.p1.carpetaEpec, 'la buena vuelve a su itemizado, avance, documentación y carpeta');
      c(d.avanceObras.p1b.oculta === false && !d.avanceObras.p1b.unidaEn && d.avanceObras.p1b.union.estado === 'deshecha', 'la repetida vuelve a estar en curso (sin unidaEn)');
      c(Object.values(d.auditoria).some((x) => x.accion === 'obra_unir_deshacer'), 'auditoría obra_unir_deshacer');
      c(!A.errores.length, 'sin errores en la página ' + A.errores.slice(0, 2).join(' | '));
      await A.browser.close();
    }
    // ======================================================================= 1) se corta a mitad y se sigue
    if (SOLO(1)) {
      const D = datos180(), A = await sesion('lucia', D), p = A.page;
      const antes = deObra(D.db, 'p1b'), p1Antes = deObra(D.db, 'p1');
      const r = await p.evaluate(async () => { window.__cpTanda = 3; window.__cpCortar = 1; try { await window.__carpetas.unir('p1b', 'p1', { motivo: 'repetida' }); return 'no se cortó'; } catch (e) { return e.code || e.message; } });
      c(r === 'cortado', 'la oficina une con tandas de 3 y se corta después de la primera (' + r + ')');
      let d = await db(p);
      c(d.avanceObras.p1b.union.estado === 'en curso' && d.avanceObras.p1b.union.hechos === 3 && !d.avanceObras.p1b.unidaEn, 'quedó anotado: «en curso», 3 de 21, sin unidaEn');
      c(total(deObra(d, 'p1')) === total(p1Antes) + 3, 'solo pasaron las 3 primeras');
      await legajo(p, 'p1b');
      c(/quedó a mitad \(3 de 21\)/.test(await tx(p, '#lgCpSec')), 'el legajo avisa «La unión con PLAZA LOS ÁLAMOS quedó a mitad (3 de 21)»');
      const sup = await p.evaluate(() => window.__carpetas.supHallazgos().filter((x) => x.g === 'rojo').length);
      c(sup === 1, 'y el Supervisor (rojo)');
      await cap(p, '180_1_mitad');
      await clic(p, '#lgCpSec [data-cpabrir^="seguir:"]');
      await clic(p, '#cpOv [data-cp="seguir"]');
      c(await esperar(p, () => !!document.querySelector('#cpOv [data-cp="abrirDst"]'), null, 80), '«▶ Seguir la unión» termina');
      d = await db(p);
      c(total(deObra(d, 'p1b')) === 0 && total(deObra(d, 'p1')) === total(p1Antes) + total(antes) && d.avanceObras.p1b.union.hechos === 21 && d.avanceObras.p1b.unidaEn === 'p1', 'todo pasó una sola vez (21 de 21)');
      c(d.avanceObras.p1.avanceHist.length === 1 && Object.values(d.auditoria).filter((x) => x.accion === 'obra_unir').length === 1, 'el avance se juntó una sola vez y una sola auditoría');
      await A.browser.close();
    }
    // ======================================================================= 2) mover una orden con sus fotos y deshacer
    if (SOLO(2)) {
      const D = datos180(), A = await sesion('admin', D), p = A.page;
      await legajo(p, 'p1b');
      await clic(p, '#lgCpSec [data-cpabrir^="mover:"]');
      await clic(p, '#cpOv [data-cpdest="p3"]');
      c(await esperar(p, () => !!document.querySelector('#cpOv [data-cpsel="ordenes"][value="b150"]'), null, 60), 'hoja «↔ Mover cosas»: lista de órdenes, fotos, vales…');
      await p.evaluate(() => { const i = document.querySelector('#cpOv [data-cpsel="ordenes"][value="b150"]'); i.click(); }); await p.waitForTimeout(300);
      c(/También pasar el avance que dieron al cerrarse/.test(await tx(p, '#cpOv')), 'orden cerrada: «También pasar el avance que dieron»');
      await cap(p, '180_2_mover');
      await clic(p, '#cpOv [data-cp="moverSi"]'); await conf2(p);
      c(await esperar(p, () => !!document.querySelector('#cpOv [data-cp="deshacerMov"]'), null, 60), 'listo, con «↶ Deshacer»');
      let d = await db(p);
      c(d.ordenesTrabajo.b150.plazaId === 'p3' && d.ordenesTrabajo.b150.plazaNombre === 'PLAZA BULEVARES', 'la orden pasó a BULEVARES');
      c(d.fotosObra.gb3.plazaId === 'p3' && d.fotosObra.gbv.plazaId === 'p3' && d.adjuntos.fb3.plazaId === 'p3' && d.adjuntos.vb1.plazaId === 'p3', 'con su foto y su video (fichas y adjuntos)');
      c(d.fotosObra.gb4.plazaId === 'p1b' && d.ordenesTrabajo.b151.plazaId === 'p1b' && d.movimientos.mb1.plazaId === 'p1b', 'lo demás quedó');
      const i5b = d.avanceObras.p1b.valorItems.find((x) => x.itemPliego === '5'), i5c = d.avanceObras.p3.valorItems.find((x) => x.itemPliego === '5');
      c(i5b.cantidadAvanzada === 0 && i5c && Math.abs(i5c.cantidadAvanzada - ((D.db.avanceObras.p3.valorItems.find((x) => x.itemPliego === '5') || {}).cantidadAvanzada || 0) - 2) < 1e-9 && d.ordenesTrabajo.b150.cierre.avanceItems[0].id === i5c.id, 'el avance que dio (2 del ítem 5) se resta de la repetida y se suma a BULEVARES');
      c(Object.values(d.auditoria).some((x) => x.accion === 'obra_mover'), 'auditoría obra_mover');
      await clic(p, '#cpOv [data-cp="deshacerMov"]'); await p.waitForTimeout(1500);
      d = await db(p);
      c(d.ordenesTrabajo.b150.plazaId === 'p1b' && d.fotosObra.gb3.plazaId === 'p1b' && JSON.stringify(d.avanceObras.p1b.valorItems) === JSON.stringify(D.db.avanceObras.p1b.valorItems) && JSON.stringify(d.avanceObras.p3.valorItems) === JSON.stringify(D.db.avanceObras.p3.valorItems), '↶ Deshacer: la orden, la foto y el avance vuelven');
      // una foto suelta con el motor de «↔ Mover» (v152)
      const rf = await p.evaluate(async () => { const r = await window.__carpetas.mover('p1b', 'p2', { fotos: ['zb1'] }, { motivo: 'era de Las Acacias' }); return r.err || r.txt; });
      d = await db(p);
      c(d.fotosObra.gbz.plazaId === 'p2' && /1 foto/.test(rf), 'una foto suelta pasa con «↔ Mover» · ' + rf);
      await A.browser.close();
    }
    // ======================================================================= 3) eliminar
    if (SOLO(3)) {
      const D = datos180(), A = await sesion(REGLAS ? 'lucia' : 'admin', D), p = A.page;
      await legajo(p, 'p9');
      await clic(p, '#lgCpSec [data-cpabrir^="eliminar:"]');
      c(await esperar(p, () => /Está vacía/.test((document.getElementById('cpOv') || {}).innerText || ''), null, 60), 'PLAZA VACÍA: «✓ Está vacía» con el detalle de cada cosa');
      await cap(p, '180_3_vacia');
      await clic(p, '#cpOv [data-cp="elimSi"]');
      c(await esperar(p, () => { const b = document.querySelector('#cpConf2 [data-cc2="si"]'); return b && b.disabled; }), 'segunda confirmación: escribir el nombre (botón apagado hasta escribirlo)');
      await cap(p, '180_3_escribir');
      await conf2(p, 'PLAZA VACÍA');
      c(await esperar(p, () => /se eliminó/.test((document.getElementById('cpOv') || {}).innerText || ''), null, 60), '«🗑 PLAZA VACÍA se eliminó»');
      let d = await db(p);
      const aud = Object.values(d.auditoria || {}).find((x) => x.accion === 'obra_eliminar');
      c(!d.avanceObras.p9 && aud && aud.copia && aud.copia.nombre === 'PLAZA VACÍA' && aud.copia.lat === -31.3, 'borrada; la copia entera quedó en auditoría (obra_eliminar)');
      await clic(p, '#cpOv [data-cp="recrear"]'); await p.waitForTimeout(800);
      d = await db(p); c(d.avanceObras.p9 && d.avanceObras.p9.nombre === 'PLAZA VACÍA' && d.avanceObras.p9.barrio === 'Centro', '«↶ Volver a crearla» la trae de vuelta');
      await clic(p, '#cpOv [data-cp="x"]');
      await legajo(p, 'p1b');
      await clic(p, '#lgCpSec [data-cpabrir^="eliminar:"]');
      c(await esperar(p, () => /No se puede eliminar/.test((document.getElementById('cpOv') || {}).innerText || ''), null, 60), 'la repetida NO se puede eliminar (tiene cosas)');
      const h = await tx(p, '#cpOv');
      c(/órdenes de trabajo: 2/.test(h) && !!(await p.$('#cpOv [data-cp="aUnir"]')) && !!(await p.$('#cpOv [data-cp="archivar"]')), 'muestra lo que tiene y ofrece «🔗 Unir con…» y «🗄 Archivar»');
      await cap(p, '180_3_noVacia');
      const r = await p.evaluate(async () => (await window.__carpetas.eliminar('p1b')).err || 'se borró');
      d = await db(p); c(/No está vacía/.test(r) && d.avanceObras.p1b, 'el motor tampoco la borra');
      await A.browser.close();
    }
    // ======================================================================= 4) posibles duplicadas
    if (SOLO(4)) {
      const D = datos180(), A = await sesion('lucia', D), p = A.page;
      await p.evaluate(() => mostrarVista('obras')); await p.waitForTimeout(2200);
      const h = await tx(p, '#cpDupCard');
      c(/Posibles duplicadas \(1\)/.test(h) && /PLAZA LOS ÁLAMOS/.test(h) && /PLAZA LOS ALAMOS/.test(h) && /mismo ID 4031 · mismo nombre · pines a \d+ m/.test(h), 'Obras: «🗂 Posibles duplicadas (1)» con el porqué');
      await cap(p, '180_4_obras');
      const sp = await p.evaluate(() => window.__supervisor ? window.__supervisor.hallazgos({ ahora: true }).filter((x) => /Posible obra repetida/.test(x.t)).length : -1);
      c(sp === 1, 'Supervisor: «🗂 Posible obra repetida»');
      // «Unir» de la tarjeta abre la hoja con la buena de destino
      await clic(p, '#cpDupCard [data-cpdup]');
      c(await esperar(p, () => /PLAZA LOS ALAMOS\s*→\s*PLAZA LOS ÁLAMOS/.test((document.querySelector('#cpOv .cp-dir') || {}).innerText || ''), null, 60), '«Unir» propone dejar la que tiene más cargado (PLAZA LOS ÁLAMOS)');
      await clic(p, '#cpOv [data-cp="invertir"]');
      c(await esperar(p, () => /PLAZA LOS ÁLAMOS\s*→\s*PLAZA LOS ALAMOS/.test((document.querySelector('#cpOv .cp-dir') || {}).innerText || ''), null, 60), '«⇄ Quedarse con la otra» la da vuelta');
      await clic(p, '#cpOv [data-cp="x"]');
      await clic(p, '#cpDupCard [data-cpno]'); await conf2(p); await p.waitForTimeout(2000);
      const d = await db(p);
      c(d.avanceObras.p1.noDuplicadaDe.indexOf('p1b') >= 0 && d.avanceObras.p1b.noDuplicadaDe.indexOf('p1') >= 0 && !(await p.$('#cpDupCard')), '«No son la misma» → no sale más (noDuplicadaDe en las dos)');
      await A.browser.close();
    }
    // ======================================================================= 5) roles
    if (SOLO(5)) {
      for (const q of ['dir', 'pan', 'mir', 'juan']) {
        const A = await sesion(q, null, q === 'juan' ? { crew: false } : {}), p = A.page;
        await p.evaluate(() => { try { mostrarVista('obras'); window.abrirLegajo && window.abrirLegajo('p1b'); } catch (e) { } }); await p.waitForTimeout(2600);
        const r = await p.evaluate(async () => ({ sec: !!document.getElementById('lgCpSec'), card: !!document.getElementById('cpDupCard'), puede: window.__carpetas.puede(), plan: (await window.__carpetas.planUnir('p1b', 'p1')).err || 'armó', sup: window.__carpetas.supHallazgos().length, abre: window.__carpetas.abrir({ modo: 'unir', src: 'p1b' }) }));
        c(!r.sec && !r.card && !r.puede && /Administración y Oficina/.test(r.plan) && !r.sup && !r.abre, q + ': sin sección, sin tarjeta, sin hoja, el motor no deja');
        await A.browser.close();
      }
    }
    // ======================================================================= 6) asistente (oficina)
    if (SOLO(6)) {
      const D = datos180(), A = await abrir(Object.assign({ sesion: 'lucia', datos: D }, MOD, { https: true, iaPro: true, v155: true })), p = A.page;
      A.page.on('dialog', (x) => x.accept());
      let n = 0;
      const usa = (name, input) => ({ id: 'm' + (++n), type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text: 'Miro.' }, { type: 'tool_use', id: 'tu' + n, name, input }], stop_reason: 'tool_use', usage: { input_tokens: 900, output_tokens: 40 }, ema: { costoUsd: 0.01, version: 'v5-ia' } });
      const fin = (text) => ({ id: 'm' + (++n), type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text }], stop_reason: 'end_turn', usage: { input_tokens: 1000, output_tokens: 60 }, ema: { costoUsd: 0.02, version: 'v5-ia' } });
      const st = { ped: [], cola: [] };
      await p.route(W + '/ia', async (rt) => { let b = null; try { b = JSON.parse(rt.request().postData() || 'null'); } catch (e) { } st.ped.push(b); return rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(st.cola.shift() || fin('Listo.')) }); });
      for (const x of ['mio', 'uso', 'salud']) await p.route(W + '/' + x, (rt) => rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, version: 'v5-ia', habilitado: true, quedanPreguntas: 30, topePreguntas: 30, gastoMes: 1, tope: 100, partes: {} }) }));
      await esperar(p, () => typeof window.__asistenteAbrir === 'function', null, 80);
      await p.evaluate(() => window.__asistenteAbrir()); await p.waitForTimeout(900);
      const listo = async () => { for (let i = 0; i < 120; i++) { await p.waitForTimeout(150); if (await p.evaluate(() => { const b = document.getElementById('iaEnviar'); return !!b && !b.disabled; })) return; } };
      const decir = async (t, g) => { st.cola.push(...g); const k = st.ped.length; await p.fill('#iaTxt', t); await p.click('#iaEnviar'); await p.waitForTimeout(300); await listo(); await p.waitForTimeout(400); return st.ped.slice(k); };
      const res = (ped, i) => { const m = (ped[i] || {}).messages || []; const u = m[m.length - 1] || {}; const b = (u.content || []).find((x) => x.type === 'tool_result'); if (!b) return ''; const x = b.content; return typeof x === 'string' ? x : Array.isArray(x) ? x.map((y) => (y && y.type === 'text' ? y.text : '')).join('') : JSON.stringify(x); };
      let ped = await decir('¿hay obras repetidas?', [usa('revisar_carpetas', {}), fin('Sí: LOS ALAMOS está dos veces.')]);
      const tools = ((ped[0] || {}).tools || []).map((t) => t.name);
      c(['revisar_carpetas', 'proponer_unir_obras', 'proponer_mover_a_obra', 'proponer_eliminar_obra'].every((x) => tools.indexOf(x) >= 0) && /CARPETAS DE OBRA \(v180\)/.test(JSON.stringify(ped[0].system || '')), 'la oficina tiene las 4 herramientas y el SISTEMA «CARPETAS DE OBRA (v180)»');
      const r0 = res(ped, 1);
      c(/posiblesDuplicadas/.test(r0) && /PLAZA LOS ALAMOS/.test(r0) && /mismo ID 4031/.test(r0) && /parecenVacias/.test(r0) && /PLAZA VAC/.test(r0), 'revisar_carpetas: la duplicada y la vacía · ' + r0.slice(0, 140));
      ped = await decir('unila con la buena', [usa('proponer_unir_obras', { origen: 'p1b', destino: 'PLAZA LOS ÁLAMOS', elegir: [{ conflicto: 'vi:valorItems:5', quedarse: 'sumar' }], motivo: 'repetida' }), fin('Te dejé la tarjeta.')]);
      const card = await tx(p, '#iaChat .ia-conf:last-of-type');
      c(/Unir «PLAZA LOS ALAMOS» en «PLAZA LOS ÁLAMOS»/.test(card) && /21 cosas/.test(card) && /Sumar: 2,75/.test(card) && /Sí, unir/.test(card), 'tarjeta: «🔗 Unir…», 21 cosas, el choque del ítem 5 sumado, «Sí, unir»');
      let d = await db(p); c(total(deObra(d, 'p1b')) > 0, 'hasta el Sí, nada');
      await p.evaluate(() => { const c = [...document.querySelectorAll('#iaChat .ia-conf')].pop(); c.querySelector('[data-iasi]').click(); });
      c(await esperar(p, () => !!document.getElementById('cpConf2')), 'con el «Sí» la app pide «🔗 Unir» otra vez');
      await cap(p, '180_6_asistente');
      await conf2(p); await p.waitForTimeout(2500);
      d = await db(p);
      c(total(deObra(d, 'p1b')) === 0 && d.avanceObras.p1b.unidaEn === 'p1' && d.avanceObras.p1.valorItems.find((x) => x.itemPliego === '5').cantidadAvanzada === 2.75, 'unidas por el asistente (el ítem 5 sumado como se eligió)');
      c(Object.values(d.auditoria).some((x) => x.accion === 'obra_unir' && x.porAsistente), 'auditoría obra_unir porAsistente');
      ped = await decir('borrá la carpeta de los alamos repetida', [usa('proponer_eliminar_obra', { obra: 'p1b' }), fin('No se puede.')]);
      c(/no_se_puede/.test(res(ped, 1)) && /avisos de la cuadrilla/.test(res(ped, 1)), 'eliminar la que tiene algo (el aviso): «no_se_puede»');
      ped = await decir('borrá plaza vacía', [usa('proponer_eliminar_obra', { obra: 'PLAZA VACÍA' }), fin('Tarjeta.')]);
      await p.evaluate(() => { const c = [...document.querySelectorAll('#iaChat .ia-conf')].pop(); c.querySelector('[data-iasi]').click(); });
      await conf2(p, 'plaza vacía'); await p.waitForTimeout(2000);
      d = await db(p); c(!d.avanceObras.p9, 'eliminar la vacía por el asistente (con el nombre escrito)');
      ped = await decir('pasá la reserva R-0101 a bulevares', [usa('proponer_mover_a_obra', { origen: 'PLAZA LOS ÁLAMOS', destino: 'BULEVARES', reservas: ['R-0101'] }), fin('Tarjeta.')]);
      await p.evaluate(() => { const c = [...document.querySelectorAll('#iaChat .ia-conf')].pop(); c.querySelector('[data-iasi]').click(); }); await p.waitForTimeout(2000);
      d = await db(p); c(d.reservas.rb1.plazaId === 'p3', 'mover una reserva por el asistente');
      await A.browser.close();
      // Dirección: ni revisar_carpetas ni proponer_*
      const B = await abrir(Object.assign({ sesion: 'dir', datos: datos180() }, MOD, { https: true, iaPro: true, v155: true })), q = B.page; const s2 = { ped: [] };
      await q.route(W + '/ia', async (rt) => { s2.ped.push(JSON.parse(rt.request().postData() || 'null')); return rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(fin('ok')) }); });
      for (const x of ['mio', 'uso', 'salud']) await q.route(W + '/' + x, (rt) => rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, version: 'v5-ia', habilitado: true, quedanPreguntas: 30 }) }));
      await esperar(q, () => typeof window.__asistenteAbrir === 'function', null, 80); await q.evaluate(() => window.__asistenteAbrir()); await q.waitForTimeout(900);
      await q.fill('#iaTxt', 'hola'); await q.click('#iaEnviar'); await q.waitForTimeout(2500);
      const t2 = ((s2.ped[0] || {}).tools || []).map((t) => t.name);
      c(t2.length > 5 && !t2.some((x) => /carpetas|unir_obras|mover_a_obra|eliminar_obra/.test(x)), 'Dirección no recibe las herramientas de carpetas');
      await B.browser.close();
    }
    // ======================================================================= 7) __v180No
    if (SOLO(7)) {
      const A = await abrir(Object.assign({ sesion: 'admin', datos: datos180() }, MOD, { v180: false })), p = A.page;
      await p.evaluate(() => { mostrarVista('obras'); }); await p.waitForTimeout(2000);
      const a = !!(await p.$('#cpDupCard'));
      await p.evaluate(() => window.abrirLegajo('p1b')); await p.waitForTimeout(2200);
      const r = await p.evaluate(() => ({ sec: !!document.getElementById('lgCpSec'), sup: window.__carpetas ? window.__carpetas.supHallazgos().length : 0, puede: window.__carpetas ? window.__carpetas.puede() : false }));
      c(!a && !r.sec && !r.sup && !r.puede, '__v180No: sin tarjeta, sin sección, sin Supervisor (como la v179)');
      await A.browser.close();
    }
  } catch (e) { console.log('ERROR', e && e.stack); c(false, 'excepción: ' + (e && e.message)); }
  process.exit(c.fin() ? 1 : 0);
})();
