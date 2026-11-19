// v182 · Datos seguros: los agujeros que encontró la auditoría del 19/11 (sobre la v176). Con ANTES=1 contra la v178 cada grupo
// reproduce el agujero (falla) y con la v182 pasa.
//  0) la caché vacía (aparato nuevo, sin señal): las escuchas de baremo / precios / personal / cuadrillas / ubicacion NO marcan
//     «llegó la base» y la guardia frena el guardado (también sin señal, que antes quedaba en cola); cuando contesta el servidor, sí.
//  1) respaldo completo: con las obras archivadas y con lo que el aparato todavía no tenía (lo lee de la base); ubicacion y reinicios.
//  2) restaurar: contra la base, sin duplicar (obra renombrada, obra archivada, orden y movimiento que ya están), catálogo solo
//     completa vacíos, vista previa «se agregan N, se saltean M», dos «Sí», auditoría; restaurar otra vez no agrega nada.
//  3) borrar de verdad: fbClearMovimientos / fbHistCalcVaciar sin la zona no borran; «Importar movimientos» solo agrega; zona
//     peligrosa solo Administración, con BORRAR escrito, respaldo bajado antes y auditoría; Oficina no.
//  4) equipos habituales: la tarjeta dibujada antes de que llegue la base no se queda con la propuesta de ejemplo.
//  5) ⚙ Límites del asistente abierto antes de que llegue la base: no graba lo de fábrica (se vuelve a cargar; después guarda bien).
//  6) teléfonos de «La cuadrilla en obra»: sacar uno pregunta (la copia de la base no se toca antes de guardar).
//  7) avanceHist: dos cambios casi a la vez no se pisan (arrayUnion); reinicios con la caché vacía no guardan.
const { abrir, prueba, DOM } = require('./h');
const { datos174 } = require('./datos174');
const fs = require('fs'), os = require('os'), path = require('path');
const cel = process.argv[2] === 'cel';
const ANTES = !!process.env.ANTES;
const SOLO = process.env.SOLO != null && process.env.SOLO !== '' ? process.env.SOLO.split(',').map(Number) : null;
const corre = (g) => !SOLO || SOLO.indexOf(g) >= 0;

function datos() {
  const d = datos174(), ahora = Date.now(), hoy = d.hoy;
  d.cuentas['ofi@' + DOM] = { pass: 'clave123', uid: 'uOfi' };
  d.db.usuarios.uOfi = { email: 'ofi@' + DOM, usuario: 'ofi', nombre: 'Olga Oficina', rol: 'oficina', activo: true };
  const P = d.db.configEquipo.personal;
  P.contactos = [{ nombre: 'Lucía Oficina', rol: 'oficina', tel: '351 555 1111', email: '' }, { nombre: 'Ángel', rol: 'admin', tel: '351 555 2222', email: '' }];
  P.seguridadCuadrilla = { casco: 'oblig', conos: 'oblig' };
  P.equiposHab = [{ nombres: ['JAVIER OLARIAGA', 'Ivan Exequiel Pereyra'], aVeces: [], vehiculoId: 'v1', tareas: 'Zanjeo', grua: false }];
  P.asistente = { roles: ['admin', 'oficina', 'panol'], limites: { roles: { cuadrilla: { preguntas: 5, remitos: 0 }, operario: { preguntas: 5, remitos: 0 }, panol: { preguntas: 20, remitos: 40 }, oficina: { preguntas: 30, remitos: 40 }, mirar: { preguntas: 10, remitos: 0 } }, mes: { tope: 77, pausaPct: 80, cortePct: 95 } } };
  d.db.configEquipo.baremo = { ts: 1, valorPunto: 1234 };
  d.db.configEquipo.precios = { ts: 1, contratistaPct: 12, gastosRef: { lista: [{ id: 'n1', nombre: 'Nafta', precio: 1000, cat: 'combustible' }], vehiculos: [], ts: 1 } };
  d.db.configEquipo.cuadrillas = { lista: ['Cuadrilla 1', 'Cuadrilla 2'] };
  d.db.configEquipo.ubicacion = { activo: true, desde: '07:00', hasta: '15:00', dias: [1, 2, 3, 4, 5], cadaSeg: 60 };
  d.db.configEquipo.reinicios = { saldoDesde: '2026-10-29', puntosSinObras: ['p1'], puntosSinDias: [] };
  Object.assign(d.db.avanceObras, {
    pArch: { nombre: 'PLAZA ARCHIVADA', obraId: '9999', oculta: true, creado: ahora - 9e6 },
    pRen: { nombre: 'PLAZA RENOMBRADA', obraId: '5555', creado: ahora - 8e6, avanceHist: [{ item: '1', antes: 0, despues: 1, motivo: 'inicial', ts: 1 }] }
  });
  d.db.movimientos = {
    m1: { tipo: 'entrada', codigo: 3017, desc: 'Fusible', un: 'Un.', cantidad: 10, fecha: hoy, ts: ahora - 5e5, usuario: 'admin@x', numero: 'E-0001' },
    m2: { tipo: 'salida', codigo: 3017, desc: 'Fusible', un: 'Un.', cantidad: 2, fecha: hoy, ts: ahora - 4e5, usuario: 'admin@x', numero: 'S-0001', plazaId: 'p1' }
  };
  d.db.catalogoProductos = { 3017: { codigo: 3017, desc: 'Fusible cilíndrico 10×38 2 A (hoy)', un: 'Un.', costo: 900, activo: true } };
  d.db.historialCalculos = { h1: { nombre: 'PLAZA SAN MARTÍN', id: 'c1', fecha: hoy, ts: ahora - 3e5, modo: 'plaza' }, h2: { nombre: 'PLAZA RENOMBRADA', id: 'c2', fecha: hoy, ts: ahora - 2e5, modo: 'plaza' } };
  d.db.gastosObra = {}; d.db.planSemanal = {}; d.db.historialEtapas = {}; d.db.reservas = {};
  return d;
}
// la caché vacía: hasta que window.__dsSinServidor sea false, las escuchas de configEquipo/<doc> contestan «no existe, de la caché»
const CACHE_VACIA = () => {
  window.__dsSinServidor = true;
  const DOCS = ['baremo', 'precios', 'personal', 'cuadrillas', 'ubicacion', 'reinicios'];
  let fb0;
  Object.defineProperty(window, 'firebase', { configurable: true, get() { return fb0; }, set(fb) {
    fb0 = fb;
    try {
      const fs = fb.firestore(), col0 = fs.collection;
      fs.collection = function (c) {
        const r = col0.call(fs, c); if (c !== 'configEquipo') return r;
        const doc0 = r.doc;
        r.doc = function (id) {
          const d = doc0.call(r, id); if (DOCS.indexOf(id) < 0) return d;
          const on0 = d.onSnapshot, get0 = d.get;
          d.onSnapshot = function (cb, er) {
            let un = null, vivo = true;
            setTimeout(() => { if (vivo && window.__dsSinServidor) cb({ id, exists: false, metadata: { fromCache: true }, data: () => undefined, get: () => undefined }); }, 0);
            const iv = setInterval(() => { if (!window.__dsSinServidor) { clearInterval(iv); if (vivo) un = on0.call(d, cb, er); } }, 100);
            return () => { vivo = false; clearInterval(iv); un && un(); };
          };
          d.get = function () { return window.__dsSinServidor ? Promise.resolve({ id, exists: false, metadata: { fromCache: true }, data: () => undefined }) : get0.apply(d, arguments); };
          return d;
        };
        return r;
      };
    } catch (e) { }
  } });
};
// lo que se baja (respaldos) queda en window.__bajados
const BAJADOS = () => { window.__bajados = []; const f = () => { if (window.respaldoBajar && !window.respaldoBajar.__t) { const o = window.respaldoBajar; const n = function (e, a) { window.__bajados.push({ e: JSON.parse(JSON.stringify(e)), a }); }; n.__t = 1; window.respaldoBajar = n; } }; document.addEventListener('DOMContentLoaded', f); setInterval(f, 300); };

(async () => {
  const c = prueba('v182' + (cel ? ' cel' : '') + (ANTES ? ' ANTES' : ''));
  let browser = null;
  const sesion = async (quien, d, op) => {
    const A = await abrir(Object.assign({ sesion: quien, datos: d || datos(), cel, espera: 3500, browser }, op || {}));
    browser = A.browser; A.page.on('dialog', (x) => x.accept()); return A;
  };
  const db = (p) => p.evaluate(() => JSON.parse(JSON.stringify(window.__stubDB())));
  const auditoria = (p, acc) => p.evaluate((a) => Object.values(window.__stubDB().auditoria || {}).filter((x) => x.accion === a), acc);
  // contesta las hojas de la v182 (#dsHoja): «Sí» (y BORRAR cuando lo pide); devuelve los títulos vistos
  const hojas = async (p, n, op) => {
    const vistos = [];
    for (let i = 0; i < 60 && vistos.length < n; i++) {
      await p.waitForTimeout(250);
      const h = await p.evaluate(() => { const d = document.getElementById('dsHoja'); return d ? { t: d.getAttribute('aria-label'), txt: d.innerText, esc: !!document.getElementById('dsEscribir'), dis: (d.querySelector('[data-dsh="si"]') || {}).disabled } : null; });
      if (!h) continue;
      vistos.push(h);
      if (op && op.no) { await p.click('#dsHoja [data-dsh="no"]'); continue; }
      if (h.esc) { await p.fill('#dsEscribir', 'borra'); h.disMal = await p.evaluate(() => document.querySelector('#dsHoja [data-dsh="si"]').disabled); await p.fill('#dsEscribir', 'BORRAR'); }
      await p.click('#dsHoja [data-dsh="si"]');
      await p.waitForTimeout(200);
    }
    return vistos;
  };

  // ============================================================================ 0) la caché vacía
  if (corre(0)) {
    const A = await sesion('admin', null, { antes: CACHE_VACIA, inicio: true, v176: true });
    const p = A.page; await p.waitForTimeout(1500);
    let r = await p.evaluate(() => ({ c: Object.assign({}, window.__cfgCargado || {}), pers: !!window.__personalCargado }));
    c(!r.c.baremo && !r.c.precios && !r.c.cuadrillas && !r.pers, 'sin señal y sin copia: baremo, precios, cuadrillas y personal NO quedan como «llegó la base» · ' + JSON.stringify(r));
    const intento = (f, x) => p.evaluate(async ([f, x]) => { try { await window[f](x); return 'guardó'; } catch (e) { return 'frenó: ' + (e.code || '') + ' ' + e.message; } }, [f, x]);
    await p.evaluate(() => { window.__stubSinRed = true; });   // sin señal: antes quedaba en cola y salía al volver
    const g = [await Promise.race([intento('fbBaremoGuardar', { valorPunto: 1 }), new Promise((ok) => setTimeout(() => ok('en cola'), 1500))]), await Promise.race([intento('fbPreciosGuardar', { contratistaPct: 0 }), new Promise((ok) => setTimeout(() => ok('en cola'), 1500))]), await Promise.race([intento('fbPersonalGuardar', { contactos: [] }), new Promise((ok) => setTimeout(() => ok('en cola'), 1500))]), await Promise.race([intento('fbCuadrillasGuardar', ['Cuadrilla de ejemplo']), new Promise((ok) => setTimeout(() => ok('en cola'), 1500))])];
    c(g.every((x) => /^frenó: ps-cargando/.test(x)), 'guardar baremo / precios / personal / cuadrillas con lo de fábrica → la guardia frena («todavía no llegaron los datos») · ' + JSON.stringify(g).slice(0, 300));
    await p.evaluate(() => { window.__stubSinRed = false; }); await p.waitForTimeout(1500);
    let b = await db(p);
    c(b.configEquipo.baremo.valorPunto === 1234 && b.configEquipo.precios.contratistaPct === 12 && b.configEquipo.personal.contactos.length === 2 && b.configEquipo.cuadrillas.lista.length === 2, 'al volver la señal no sale nada de lo frenado: la base sigue como estaba · ' + JSON.stringify([b.configEquipo.baremo.valorPunto, b.configEquipo.precios.contratistaPct, (b.configEquipo.personal.contactos || []).length, b.configEquipo.cuadrillas.lista]));
    await p.evaluate(() => { window.__dsSinServidor = false; }); await p.waitForTimeout(1800);
    r = await p.evaluate(() => ({ c: Object.assign({}, window.__cfgCargado || {}), pers: !!window.__personalCargado }));
    c(r.c.baremo && r.c.precios && r.pers, 'cuando contesta el servidor, sí llegó · ' + JSON.stringify(r));
    const g2 = await intento('fbBaremoGuardar', { valorPunto: 1500 }); await p.waitForTimeout(400); b = await db(p);
    c(g2 === 'guardó' && b.configEquipo.baremo.valorPunto === 1500, 'y ahí guarda como siempre · ' + g2);
    const u = await p.evaluate(async () => { try { await window.__cfgGuardia('ubicacion', { hasta: '16:00' }); return 'ok'; } catch (e) { return e.code; } });
    c(u === 'ok', 'la ubicación (que lee la base al guardar) también anda con el servidor · ' + u);
    c(A.errores.length === 0, 'sin errores de JavaScript · ' + JSON.stringify(A.errores).slice(0, 300));
    await p.close();
  }

  // ============================================================================ 1) respaldo completo
  if (corre(1)) {
    const A = await sesion('admin', null, { antes: BAJADOS, demora: { movimientos: 60000 } });
    const p = A.page; await p.waitForTimeout(800);
    await p.evaluate(() => window.exportarRespaldoCompleto()); await p.waitForTimeout(2500);
    const r = await p.evaluate(() => { const e = (window.__bajados[0] || {}).e || {}; return { f: e.formato, obras: (e.avanceObras || []).map((o) => o.id || o.nombre), movs: (e.movimientos || []).length, cfg: Object.keys(e.configEquipo || {}), msg: document.getElementById('respaldoMsg').innerText }; });
    c(r.obras.indexOf('pArch') >= 0 && r.obras.length === 3, 'el respaldo completo lleva las obras ARCHIVADAS (3 de 3) · ' + JSON.stringify(r.obras));
    c(r.movs === 2, 'lleva los movimientos aunque el aparato todavía no los tenía (los lee de la base) · ' + r.movs);
    c(r.cfg.indexOf('ubicacion') >= 0 && r.cfg.indexOf('reinicios') >= 0 && r.cfg.indexOf('personal') >= 0 && r.cfg.indexOf('baremo') >= 0, 'y configEquipo: también ubicación y reinicios · ' + r.cfg.join());
    c(/archivadas/.test(r.msg) && /Respaldo bajado/.test(r.msg), 'el cartel lo dice («1 archivadas») · ' + r.msg.slice(0, 200));
    c(A.errores.length === 0, 'sin errores de JavaScript · ' + JSON.stringify(A.errores).slice(0, 300));
    await p.close();
  }

  // ============================================================================ 2) restaurar sin duplicar
  if (corre(2)) {
    const A = await sesion('admin', null, { antes: BAJADOS });
    const p = A.page; await p.waitForTimeout(1200);
    // el respaldo «de antes»: lo de la base + una obra y un movimiento nuevos; el producto con el costo y la desc. viejos
    const arch = await p.evaluate(() => {
      const D = JSON.parse(JSON.stringify(window.__stubDB())), l = (c) => Object.keys(D[c] || {}).map((id) => Object.assign({ id }, D[c][id]));
      const obras = l('avanceObras'); obras.find((o) => o.id === 'pRen').nombre = 'PLAZA CON EL NOMBRE DE ANTES';
      obras.push({ id: 'pNueva', nombre: 'PLAZA QUE SE BORRÓ', obraId: '7777' });
      const movs = l('movimientos'); movs.push({ id: 'm9', tipo: 'entrada', codigo: 3017, desc: 'Fusible', un: 'Un.', cantidad: 5, fecha: '2026-11-01', ts: 1000, numero: 'E-0009' });
      return { formato: 'respaldo-completo-v2', exportado: '2026-11-10T12:00:00Z', porUsuario: 'admin@x', movimientos: movs, catalogoProductos: [{ id: '3017', codigo: 3017, desc: 'Fusible (desc. vieja)', un: 'Un.', costo: 500, minimo: 10 }], avanceObras: obras, ordenesTrabajo: l('ordenesTrabajo'), gastosObra: [], planSemanal: [], historialEtapas: [], historialCalculos: Object.keys(D.historialCalculos).map((k) => Object.assign({ docId: k }, D.historialCalculos[k])), reservas: [], fotosObra: [], configEquipo: {}, usuarios: [] };
    });
    const antes = await db(p), n0 = (c) => Object.keys(antes[c] || {}).length;
    await p.evaluate((e) => { window.__rest = window.restaurarRespaldoCompleto(e); }, arch);
    const vistos = await hojas(p, 2); await p.waitForTimeout(2500);
    let b = await db(p), n = (c) => Object.keys(b[c] || {}).length;
    const prev = (vistos[0] || {}).txt || '';
    c(vistos.length === 2 && /se agregan/i.test(prev) && /se saltean/i.test(prev) && /Total: se agregan 3, se saltean/.test(prev.replace(/\s+/g, ' ')), 'vista previa «se agregan N, se saltean M (ya están)» y una segunda confirmación · ' + vistos.length + ' · ' + prev.replace(/\s+/g, ' ').slice(-300));
    c(n('avanceObras') === n0('avanceObras') + 1 && !!b.avanceObras.pNueva, 'obras: solo entra la que faltaba (la renombrada y la archivada NO se duplican) · ' + n0('avanceObras') + ' → ' + n('avanceObras'));
    c(n('ordenesTrabajo') === n0('ordenesTrabajo') && n('movimientos') === n0('movimientos') + 1 && !!b.movimientos.m9, 'órdenes no se duplican y de los movimientos entra solo el que faltaba, con su número de registro · ' + [n0('ordenesTrabajo'), n('ordenesTrabajo'), n0('movimientos'), n('movimientos')].join(','));
    const pr = b.catalogoProductos['3017'] || {};
    c(pr.costo === 900 && /\(hoy\)/.test(pr.desc) && pr.minimo === 10, 'catálogo: no pisa el costo ni la descripción de hoy; solo completa lo vacío (mínimo 10) · ' + JSON.stringify(pr));
    c(n('historialCalculos') === n0('historialCalculos'), 'los cómputos no se duplican · ' + n('historialCalculos'));
    const au = await auditoria(p, 'respaldo_restaurar');
    c(au.length === 1 && au[0].agregados === 3, 'queda en la auditoría (respaldo_restaurar, con lo agregado) · ' + JSON.stringify(au.map((x) => x.detalle)));
    // otra vez el mismo archivo: no agrega nada
    await p.evaluate((e) => { window.__rest = window.restaurarRespaldoCompleto(e); }, arch);
    const v2 = await hojas(p, 2); await p.waitForTimeout(2000);
    const b2 = await db(p), msg = await p.evaluate(() => document.getElementById('respaldoMsg').innerText);
    c(Object.keys(b2.avanceObras).length === n('avanceObras') && Object.keys(b2.movimientos).length === n('movimientos') && /No falta nada/.test(msg) && v2.length === 0, 'restaurar otra vez el mismo archivo no agrega nada («No falta nada») · ' + msg.slice(0, 120));
    // cancelar no escribe
    const arch2 = JSON.parse(JSON.stringify(arch)); arch2.avanceObras.push({ id: 'pOtra', nombre: 'OTRA', obraId: '1' });
    await p.evaluate((e) => { window.__rest = window.restaurarRespaldoCompleto(e); }, arch2);
    await hojas(p, 1, { no: true }); await p.waitForTimeout(800);
    c(!(await db(p)).avanceObras.pOtra, '«Cancelar» en la vista previa no escribe nada');
    c(A.errores.length === 0, 'sin errores de JavaScript · ' + JSON.stringify(A.errores).slice(0, 300));
    await p.close();
  }

  // ============================================================================ 3) borrar de verdad
  if (corre(3)) {
    const A = await sesion('admin', null, { antes: BAJADOS });
    const p = A.page; await p.waitForTimeout(1200);
    let r = await p.evaluate(async () => { const o = {}; try { await window.fbClearMovimientos(); o.clear = 'borró'; } catch (e) { o.clear = 'frenó'; } try { await window.fbHistCalcVaciar(); o.hist = 'borró'; } catch (e) { o.hist = 'frenó'; } return o; });
    await p.waitForTimeout(500); let b = await db(p);
    c(r.clear === 'frenó' && r.hist === 'frenó' && Object.keys(b.movimientos).length === 2 && Object.keys(b.historialCalculos).length === 2, 'borrar todos los movimientos / cómputos sin pasar por la zona peligrosa: no borra (se anulan, no se borran) · ' + JSON.stringify(r));
    // importar común: agrega
    const f = path.join(os.tmpdir(), 'movs182_' + process.pid + '.json');
    fs.writeFileSync(f, JSON.stringify({ movimientos: Object.keys(b.movimientos).map((id) => Object.assign({ id }, b.movimientos[id])).concat([{ id: 'm7', tipo: 'entrada', codigo: 3017, desc: 'Fusible', un: 'Un.', cantidad: 3, fecha: '2026-11-02', ts: 2000 }]) }));
    await p.evaluate(() => { window.mostrarVista('stock'); }); await p.waitForTimeout(500);
    await p.setInputFiles('#stockImportInput', f);
    const vi = await hojas(p, 1); await p.waitForTimeout(1500); b = await db(p);
    c(Object.keys(b.movimientos).length === 3 && !!b.movimientos.m1 && !!b.movimientos.m7 && /agregan 1/.test((vi[0] || {}).txt || ''), '«⬆ Importar movimientos» solo AGREGA lo que falta (2 que están + 1 nuevo = 3), no reemplaza · ' + Object.keys(b.movimientos).join() + ' · ' + ((vi[0] || {}).txt || '').replace(/\s+/g, ' ').slice(0, 120));
    r = await p.evaluate(() => { const z = document.getElementById('dsZonaStock'), zc = document.getElementById('dsZonaCalc'); return { z: !!z && !z.hidden, zc: !!zc && !zc.hidden, enZona: !!(z && z.querySelector('button[onclick="reiniciarStock()"]')), fuera: !!document.querySelector('#cardStockSoloStock > .hist-actions button[onclick="reiniciarStock()"]'), hist: !!(zc && zc.querySelector('button[onclick="limpiarHistorial()"]')) }; });
    c(r.z && r.zc && r.enZona && !r.fuera && r.hist, '«⚠ Zona peligrosa» (Administración): ahí están «Reiniciar movimientos» y «Limpiar historial», ya no a la vista · ' + JSON.stringify(r));
    await p.evaluate(() => { document.getElementById('dsZonaStock').open = true; document.querySelector('#dsZonaStock button[onclick="reiniciarStock()"]').click(); });
    const vz = await hojas(p, 2); await p.waitForTimeout(1500); b = await db(p);
    const baj = await p.evaluate(() => window.__bajados.filter((x) => x.e.formato === 'respaldo-antes-de-borrar-v1').map((x) => ({ a: x.a, n: (x.e.movimientos || []).length })));
    c(vz.length === 2 && vz[1].esc && vz[1].disMal === true, 'dos confirmaciones; la segunda solo con «BORRAR» escrito · ' + JSON.stringify(vz.map((x) => [x.t, x.esc, x.disMal])));
    c(baj.length === 1 && baj[0].n === 3 && Object.keys(b.movimientos || {}).length === 0, 'antes de borrar se baja solo el respaldo de lo que se borra (3) y recién ahí borra · ' + JSON.stringify(baj));
    const au = await auditoria(p, 'zona_peligrosa');
    c(au.length === 1 && au[0].cuantos === 3, 'queda en la auditoría (zona_peligrosa) · ' + JSON.stringify(au.map((x) => x.detalle)));
    // oficina: no
    const O = await sesion('ofi'); const q = O.page; await q.waitForTimeout(1200);
    r = await q.evaluate(async () => { const z = document.getElementById('dsZonaStock'); window.limpiarHistorial(); await new Promise((ok) => setTimeout(ok, 600)); const h = document.getElementById('dsHoja'); const t = h ? h.innerText : ''; h && h.querySelector('[data-dsh="no"]').click(); return { z: !!z && !z.hidden, t }; });
    await q.waitForTimeout(600); b = await db(q);
    c(!r.z && /solo Administración/.test(r.t) && Object.keys(b.historialCalculos).length === 2, 'Oficina no ve la zona peligrosa y «Limpiar historial» le dice que es solo de Administración (no borra) · ' + r.t.slice(0, 120));
    c(A.errores.length === 0 && O.errores.length === 0, 'sin errores de JavaScript · ' + JSON.stringify(A.errores.concat(O.errores)).slice(0, 300));
    await q.close(); await p.close(); try { fs.unlinkSync(f); } catch (e) { }
  }

  // ============================================================================ 4) equipos habituales
  if (corre(4)) {
    const A = await sesion('admin', null, { demora: { 'configEquipo/personal': 12000 }, v145: true });
    const p = A.page;
    await p.evaluate(() => { window.mostrarVista('produccion'); }); await p.waitForTimeout(400);
    await p.evaluate(() => { const b = document.querySelector('#subtabsProd [data-sub="personal"]'); b && b.click(); }); await p.waitForTimeout(800);
    const t0 = await p.evaluate(() => ((document.getElementById('ehCard') || {}).innerText || '').replace(/\s+/g, ' '));
    await p.waitForTimeout(13000);
    const t1 = await p.evaluate(() => ((document.getElementById('ehCard') || {}).innerText || '').replace(/\s+/g, ' '));
    c(/Propuesta de Ángel/.test(t0) || !t0, 'antes de que llegue la base la tarjeta muestra la propuesta (o nada) · ' + t0.slice(0, 120));
    c(!/Propuesta de Ángel sin guardar/.test(t1) && /Zanjeo/.test(await p.evaluate(() => JSON.stringify([...document.querySelectorAll('#ehCard input')].map((x) => x.value)))), 'cuando llega la base, la tarjeta se vuelve a armar con los equipos guardados (no se queda con la propuesta) · ' + t1.slice(0, 160));
    c(A.errores.length === 0, 'sin errores de JavaScript · ' + JSON.stringify(A.errores).slice(0, 300));
    await p.close();
  }

  // ============================================================================ 5) ⚙ Límites antes de que llegue la base
  if (corre(5)) {
    const A = await sesion('admin', null, { demora: { 'configEquipo/personal': 15000 }, iaPro: true, https: true });
    const p = A.page;
    await p.evaluate(() => window.__asistenteAbrir()); await p.waitForTimeout(1200);
    await p.click('#iaPanel [data-ia="cfg"]'); await p.waitForTimeout(900);
    const v0 = await p.evaluate(() => (document.querySelector('#iaCfg [data-ialim="mes.tope"]') || {}).value);
    await p.waitForTimeout(13000);   // llegó la base; la hoja quedó como se armó
    await p.fill('#iaCfg [data-ialim="cuadrilla.preguntas"]', '6');
    await p.click('#iaCfg [data-ia="cfgguardar"]'); await p.waitForTimeout(1200);
    let b = await db(p), a = b.configEquipo.personal.asistente || {};
    const m1 = await p.evaluate(() => (document.getElementById('iaCfgMsg') || {}).textContent || '');
    c(a.limites.mes.tope === 77 && a.roles.indexOf('panol') >= 0 && a.limites.roles.cuadrilla.preguntas === 5, 'lo armado con lo de fábrica (tope ' + v0 + ') NO pisa los límites de la base (tope 77, pañol prendido) · ' + JSON.stringify([a.limites.mes, a.roles]) + ' · ' + m1);
    const v1 = await p.evaluate(() => (document.querySelector('#iaCfg [data-ialim="mes.tope"]') || {}).value);
    c(v1 === '77' && /se volvieron a cargar|revisá/i.test(m1), 'se vuelve a cargar con lo de la base y lo dice · ' + v1);
    await p.fill('#iaCfg [data-ialim="cuadrilla.preguntas"]', '6');
    await p.click('#iaCfg [data-ia="cfgguardar"]'); await p.waitForTimeout(1200);
    b = await db(p); a = b.configEquipo.personal.asistente || {};
    c(a.limites.mes.tope === 77 && a.limites.roles.cuadrilla.preguntas === 6 && a.roles.indexOf('panol') >= 0 && (b.configEquipo.personal.respaldos || []).length >= 1, 'después guarda bien (cuadrilla 6, tope 77) y queda la copia de antes (respaldos) · ' + JSON.stringify([a.limites.roles.cuadrilla, (b.configEquipo.personal.respaldos || []).length]));
    c(A.errores.length === 0, 'sin errores de JavaScript · ' + JSON.stringify(A.errores).slice(0, 300));
    await p.close();
  }

  // ============================================================================ 6) teléfonos de la cuadrilla
  if (corre(6)) {
    const A = await sesion('admin');
    const p = A.page; await p.waitForTimeout(800);
    await p.evaluate(() => { window.mostrarVista('produccion'); }); await p.waitForTimeout(400);
    await p.evaluate(() => { const b = document.querySelector('#subtabsProd [data-sub="personal"]'); b && b.click(); }); await p.waitForTimeout(2500);
    await p.evaluate(() => { document.querySelector('#cdCfgCard [data-cdc="sacar"][data-i="1"]').click(); }); await p.waitForTimeout(500);
    const nube = await p.evaluate(() => (window.__personalNube.contactos || []).length);
    c(nube === 2, 'sacar un teléfono en la pantalla no toca la copia de la base antes de guardar · ' + nube);
    await p.evaluate(() => { document.querySelector('#cdCfgCard [data-cdc="guardar"]').click(); }); await p.waitForTimeout(900);
    const q = await p.evaluate(() => { const d = document.getElementById('psConf'); return d ? d.innerText.replace(/\s+/g, ' ') : ''; });
    c(/Sacar 1/.test(q) && /Ángel/.test(q), 'al guardar, la guardia pregunta «¿Sacar 1…?» con el contacto · ' + q.slice(0, 160));
    if (q) { await p.click('#psConf [data-psc="no"]'); await p.waitForTimeout(500); }
    let b = await db(p);
    c(b.configEquipo.personal.contactos.length === 2, '«No, cancelar» deja los 2 teléfonos');
    if (q) { await p.evaluate(() => { document.querySelector('#cdCfgCard [data-cdc="guardar"]').click(); }); await p.waitForTimeout(700); await p.click('#psConf [data-psc="si"]'); await p.waitForTimeout(900); }
    b = await db(p);
    c(b.configEquipo.personal.contactos.length === 1 && b.configEquipo.personal.contactos[0].nombre === 'Lucía Oficina' && (b.configEquipo.personal.respaldos || []).length >= 1, '«Sí, sacarlos» lo saca y queda la copia de antes · ' + JSON.stringify(b.configEquipo.personal.contactos));
    await p.evaluate(() => { window.__g182 = window.__cfgGuardia('personal', { seguridadCuadrilla: { casco: 'oblig' } }, {}).then(() => 'sin preguntar', (e) => e.code); });
    await p.waitForTimeout(600); const g2 = await p.evaluate(() => { const d = document.getElementById('psConf'); const t = d ? d.innerText : ''; d && d.querySelector('[data-psc="no"]').click(); return t; });
    const g = await p.evaluate(() => window.__g182);
    c(/seguridadCuadrilla: conos/.test(g2), 'sacar un ítem de la seguridad también pregunta · ' + g2.replace(/\s+/g, ' ').slice(0, 120) + ' · ' + g);
    c(A.errores.length === 0, 'sin errores de JavaScript · ' + JSON.stringify(A.errores).slice(0, 300));
    await p.close();
  }

  // ============================================================================ 7) avanceHist sin pisarse; reinicios con caché vacía
  if (corre(7)) {
    const A = await sesion('admin', null, { antes: CACHE_VACIA });
    const p = A.page; await p.waitForTimeout(1200);
    const r = await p.evaluate(async () => {
      const ob = window.avanceObrasTodas.find((o) => o.id === 'pRen'), FV = firebase.firestore.FieldValue;
      const e0 = { item: '2', antes: 0, despues: 1, motivo: 'desde otro celu', ts: 2 }, e1 = { item: '3', antes: 0, despues: 1, motivo: 'desde este', ts: 3 };
      const p0 = firebase.firestore().collection('avanceObras').doc('pRen').update({ avanceHist: FV.arrayUnion(e0) });   // el otro aparato, casi a la vez
      const l = (ob.avanceHist || []).concat([e1]);
      await Promise.all([p0, window.fbAvanceCampos('pRen', { avanceHist: l })]);
      return (window.__stubDB().avanceObras.pRen.avanceHist || []).map((x) => x.motivo);
    });
    c(r.length === 3 && r.indexOf('desde otro celu') >= 0 && r.indexOf('desde este') >= 0, 'avanceHist: lo que anotó otro aparato casi a la vez no se pierde (se agrega, no se reemplaza) · ' + JSON.stringify(r));
    // reinicios: la lista armada con lo de fábrica (sin señal, sin copia) no se guarda
    await p.evaluate(() => { window.mostrarVista('produccion'); }); await p.waitForTimeout(600);
    const g = await p.evaluate(async () => {
      let s = document.getElementById('reiPtsObra'); if (!s) { s = document.createElement('select'); s.id = 'reiPtsObra'; document.body.appendChild(s); }
      if (![...s.options].some((o) => o.value === 'pRen')) { const o = document.createElement('option'); o.value = 'pRen'; o.textContent = 'x'; s.appendChild(o); }
      s.value = 'pRen'; const b = document.createElement('button'); b.dataset.rei = 'ptsObra'; document.body.appendChild(b); b.click(); b.remove();
      await new Promise((ok) => setTimeout(ok, 800)); return ((document.getElementById('reiMsg') || {}).textContent || '') + ' | ' + JSON.stringify(window.__stubDB().configEquipo.reinicios.puntosSinObras);
    });
    await p.evaluate(() => { window.__dsSinServidor = false; }); await p.waitForTimeout(1500);
    const b = await db(p);
    c(JSON.stringify(b.configEquipo.reinicios.puntosSinObras) === '["p1"]', 'reinicios: la base sigue con lo suyo · ' + g + ' → ' + JSON.stringify(b.configEquipo.reinicios.puntosSinObras));
    c(A.errores.length === 0, 'sin errores de JavaScript · ' + JSON.stringify(A.errores).slice(0, 300));
    await p.close();
  }
  if (browser) await browser.close();
  process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
