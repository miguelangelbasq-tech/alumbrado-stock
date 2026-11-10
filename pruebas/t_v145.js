// v145 · Certificación mensual automática + material contra avance (y lo que aprende la app) + gente sin tarea.
//  1) certificación (admin): mes con avance de varias órdenes, acumulado anterior, plaza ejecutada (CERTIF_MUNI), provisiones
//     aparte, ítem sin fecha avisado, hechas de más, otra zona y barrio afuera, anulada con el avance descontado, $ con y sin
//     IVA, mes anterior, PDF (con QR) y Excel, cerrar el mes (Sí de admin) y que no cambie (lo cargado tarde va al siguiente).
//  2) material contra avance: 🟢🟡🔴 en el legajo, sustituto, vales, pedir devolución, margen, Supervisor.
//  3) aprendizaje con 3 obras terminadas y «✨ Informe del asistente» que solo anota (Worker simulado).
//  4) permisos: pañol y cuadrilla no ven la certificación ni la herramienta del asistente; oficina sí (sin cerrar).
//  5) gente sin tarea: nómina de 6 (1 ausente, 4 en órdenes) → 1 sin tarea; dónde ponerlo; sumarlo con «Sí»; Inicio;
//     recordatorio de las 17 una vez; días sin tarea en 🧠; y en la sugerida (datos de la v143): bloque, cartel al emitir y
//     el aviso después de emitir.
const fs = require('fs');
const { abrir, prueba, DOM } = require('./h');
const { datos145 } = require('./datos145');
const { datos143 } = require('./datos143');
const cel = process.argv[2] === 'cel';
const W = 'https://ema-ia.mdiaz-60f.workers.dev';
const CAP = process.env.CAP || '';
(async () => {
  const c = prueba('v145' + (cel ? ' cel' : ''));
  const MOD = { cel, espera: 4500, v145: true, sugerida: true, inicio: true, porPartes: true, ofPasos: true, tarjetas: true, nav: true, mtNuevo: true, lgPleg: false };
  let browser = null;
  const sesion = async (quien, datos, op) => { const A = await abrir(Object.assign({ sesion: quien, datos: datos || datos145(), browser }, MOD, op || {})); browser = A.browser; A.page.on('dialog', (x) => x.accept()); await A.page.waitForTimeout(800); return A; };
  const db = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('stub.db') || '{}'));
  const ver = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); return !!e && e.getBoundingClientRect().height > 0 && getComputedStyle(e).visibility !== 'hidden'; }, sel);
  const txt = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; }, sel);
  const D = datos145(), M = D.M, man = D.man;
  const sigMes = (() => { const x = new Date(M + '-15T12:00:00'); x.setMonth(x.getMonth() + 1); return x.toISOString().slice(0, 7); })();
  const sinToast = (p) => p.evaluate(() => { document.querySelectorAll('body *').forEach((e) => { if (e.children.length < 8 && /Falta cerrar la quincena/.test(e.textContent || '') && getComputedStyle(e).position === 'fixed') e.style.display = 'none'; }); });   // capturas: sin el cartel de la quincena
  const scrollH = (p) => p.evaluate(() => { const o = document.getElementById('certOv'); const s = o && o.querySelector('.sg-in'); return s ? s.scrollWidth - s.clientWidth : 0; });
  let n = 0;
  const usa = (name, input) => ({ id: 'msg_' + (++n), type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text: 'Me fijo.' }, { type: 'tool_use', id: 'tu_' + n, name, input }], stop_reason: 'tool_use', usage: { input_tokens: 900, output_tokens: 40 }, ema: { costoUsd: 0.01, version: 'v3-ia' } });
  const fin = (text) => ({ id: 'msg_' + (++n), type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text }], stop_reason: 'end_turn', usage: { input_tokens: 1000, output_tokens: 60 }, ema: { costoUsd: 0.02, version: 'v3-ia' } });
  async function worker(p) {
    const st = { pedidos: [], cola: [] };
    await p.route(W + '/ia', async (rt) => { let b = null; try { b = JSON.parse(rt.request().postData() || 'null'); } catch (e) { } st.pedidos.push(b); const f = st.cola.shift(); const x = typeof f === 'function' ? f(b) : f; return x ? rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(x) }) : rt.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: { tipo: 'prueba', mensaje: 'sin guion' } }) }); });
    await p.route(W + '/mio', (rt) => rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, version: 'v3-ia', habilitado: true, quedanPreguntas: 30, topePreguntas: 30 }) }));
    await p.route(W + '/uso', (rt) => rt.abort());
    return st;
  }
  const esperarIa = async (p) => { for (let i = 0; i < 100; i++) { await p.waitForTimeout(150); if (await p.evaluate(() => { const b = document.getElementById('iaEnviar'); return !!b && !b.disabled; })) return; } };

  // ================================================================= 1) certificación (admin)
  {
    const A = await sesion('admin', null, { iaPro: true, https: true }); const p = A.page;
    const sr = await worker(p); await p.waitForTimeout(500);
    const R = await p.evaluate((M) => { const R = window.__certMensual.armar(M); const F = (id, it) => { const x = R.lista.find((o) => o.id === id); const f = x && x.filas.find((y) => y.id === it); return f ? { ant: f.ant, mes: f.mes, acum: f.acum, sf: f.sinFecha, prov: f.prov, demas: f.demas, ots: f.ots, k: f.k } : null; };
      return { ids: R.lista.map((x) => x.id), fuera: R.fuera, a5: F('pA', '5'), a18: F('pA', '18'), a25: F('pA', '25'), a86: F('pA', '86'), b1: F('pB', '1'), b43: F('pB', '43'), m2: F('pM', '2'), m44: F('pM', '44'), m11: F('pM', '11'), kMes: R.kMes, kProv: R.kProv, sinIva: R.sinIva, conIva: R.conIva, mod: R.modulo, rev: R.revisar.map((r) => r.t), K: { 5: epecItemK('5'), 18: epecItemK('18'), 1: epecItemK('1'), 44: epecItemK('44'), 86: epecItemK('86') }, zona: R.zona && R.zona.zona }; }, M);
    c(R.a5 && R.a5.mes === 3 && R.a5.ant === 3 && R.a5.acum === 6 && R.a5.ots.join(',') === 'OT-2026-302,OT-2026-303', 'mes con avance de varias órdenes: ítem 5 de PLAZA MITRE = 2 + 1 del mes (OT-302, OT-303) · ' + JSON.stringify(R.a5));
    c(R.a5 && R.a5.ant === 3, 'acumulado anterior: las 3 de la orden del mes pasado (OT-301)');
    c(R.a5 && R.a5.mes === 3, 'la orden anulada con el avance descontado (OT-308) no entra');
    c(R.a18 && R.a18.mes === 20, 'otro ítem de otra orden del mes (zanja 18: 20 m)');
    c(R.a86 && R.a86.prov && R.a86.mes === 40 && Math.abs(R.kProv - 40 * R.K[86]) < 1e-6, 'provisiones aparte (86: 40 m) · kProv ' + R.kProv);
    c(R.a25 && R.a25.sf === 10 && R.a25.mes === 0 && R.rev.some((t) => /PLAZA MITRE: sin fecha 1 ítem/.test(t)), 'ítem sin fecha (25 cargado a mano): no se reparte y se avisa «sin fecha: 1 ítem, revisalos»');
    c(R.b43 && R.b43.demas && R.rev.some((t) => /SAN MARTÍN: hechas de más/.test(t)), 'hechas de más (43: 3 de 2) para revisar');
    c(R.m2 && R.m2.ant === 3 && R.m2.mes === 0 && R.m44 && R.m44.ant === 3 && R.m44.mes === 1 && R.m11 && R.m11.ant === 12 && !R.m11.sf, 'plaza ejecutada (SANTA ANA, CERTIF_MUNI): lo certificado va como anterior y el mes suma solo lo nuevo · ' + JSON.stringify([R.m2, R.m44, R.m11]));
    c(R.ids.indexOf('pZ') < 0 && R.ids.indexOf('pR') < 0 && R.fuera === 2 && R.zona === 'A', 'solo nuestra zona (A): la plaza de la zona B y el barrio no entran (2 afuera)');
    const kEsp = 3 * R.K[5] + 20 * R.K[18] + 2 * R.K[1] + 1 * R.K[44];
    c(Math.abs(R.kMes - kEsp) < 1e-6 && Math.abs(R.sinIva - (R.kMes + R.kProv) * R.mod) < 0.01 && Math.abs(R.conIva - R.sinIva * 1.21) < 0.01 && Math.abs(R.mod - 296126.45) < 0.01, `módulos del mes = Σ K × cantidad (${R.kMes.toFixed(2)}), $ = (obra + provisiones) × módulo $296.126,45 y con IVA × 1,21`);
    // pantalla
    await p.evaluate(() => window.mostrarVista('informe')); await p.waitForTimeout(1800);
    c(await ver(p, '#ctInfCard'), 'tarjeta «📑 Certificación mensual» en Informes');
    c(await p.evaluate(() => !!document.getElementById('menuCert')), 'entrada «📑 Certificación del mes» en el menú (admin)');
    await p.click('#ctInfCard [data-ct="abrir"]'); await p.waitForTimeout(900);
    const t1 = await txt(p, '#certOv');
    c(await ver(p, '#certOv') && /Borrador de /.test(t1) && /PLAZA MITRE/.test(t1) && /PLAZA SAN MARTÍN/.test(t1) && /PLAZA SANTA ANA/.test(t1) && !/FAVALORO/.test(t1) && /Provisiones \(aparte/.test(t1) && /Con IVA \(21 %\)/.test(t1) && /Para revisar antes de certificar/.test(t1), 'pantalla: borrador del mes, obras, provisiones aparte, $ sin y con IVA, «Para revisar»');
    c((await scrollH(p)) <= 1, 'sin scroll horizontal');
    if (CAP) { await sinToast(p); await p.screenshot({ path: CAP + '/cert_' + (cel ? 'cel' : 'pc') + '.png', fullPage: false }); }
    await p.selectOption('#ctMes', D.mesAnt); await p.waitForTimeout(600);
    c(/Borrador de /.test(await txt(p, '#certOv')) && await p.evaluate((m) => { const R = window.__certMensual.armar(m); const x = R.lista.find((o) => o.id === 'pA'); const f = x && x.filas.find((y) => y.id === '5'); return !!f && f.mes === 3 && f.ant === 0; }, D.mesAnt), 'mes anterior: ítem 5 = 3 en el mes, 0 anterior');
    await p.selectOption('#ctMes', M); await p.waitForTimeout(500);
    // PDF y Excel
    await p.click('#certOv [data-ct="pdf"]'); await p.waitForTimeout(1500);
    const hj = await p.evaluate(() => { const a = window.hojaEMA && window.hojaEMA.actual(); const d = (document.querySelector('#hojaOv iframe') || {}).contentDocument; return { t: a ? a.titulo : '', doc: a ? a.doc : '', qr: !!(d && d.querySelector('.ema-qr img')) || /class="ema-qr/.test(a ? a.doc : '') }; });
    c(/^Certificado mensual /.test(hj.t) && /PLAZA MITRE/.test(hj.doc) && /Total con IVA/.test(hj.doc) && /Provisiones/.test(hj.doc) && hj.qr, 'PDF en la hoja A4 (hojaPdf) con obras, provisiones, total con IVA y QR · ' + hj.t);
    await p.evaluate(() => { try { window.hojaEMA.cerrar(); } catch (e) { const o = document.getElementById('hojaOv'); if (o) o.remove(); } }); await p.waitForTimeout(300);
    if (!(await ver(p, '#certOv'))) await p.evaluate(() => window.__certMensual.abrir());
    const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 8000 }).catch(() => null), p.click('#certOv [data-ct="excel"]')]);
    const ex = await p.evaluate(() => window.__ctUltimoExcel ? { s: window.__ctUltimoExcel.secciones.length, t: window.__ctUltimoExcel.tiles.length } : null);
    c(!!dl && /\.xlsx$/.test(dl.suggestedFilename()) && ex && ex.s >= 3, 'planilla Excel (.xlsx con el formato de los informes) · ' + (dl ? dl.suggestedFilename() : 'sin descarga'));
    // cerrar el mes
    c(await ver(p, '#certOv [data-ct="cerrarmes"]'), 'admin ve «🔒 Cerrar el certificado»');
    await p.click('#certOv [data-ct="cerrarmes"]'); await p.waitForTimeout(400);
    c(await ver(p, '#ctPreg'), 'pide «Sí» antes de cerrar');
    await p.click('#ctPreg [data-ct="sicerrar"]'); await p.waitForTimeout(1500);
    const d1 = await db(p), cc = ((d1.configEquipo || {}).precios || {}).certCerrados || {}, snap = (((d1.avanceObras || {}).pA || {}).certificados || {})[M];
    c(cc[M] && cc[M].ts && Math.abs(cc[M].modulo - R.mod) < 0.01 && snap && snap.it['5'].m === 3 && snap.it['5'].a === 6, 'cerrado: foto fija en avanceObras.certificados.' + M + ' y la marca en configEquipo/precios.certCerrados');
    c(/🔒 Cerrado el/.test(await txt(p, '#certOv')) && !(await ver(p, '#certOv [data-ct="cerrarmes"]')), 'pantalla: «🔒 Cerrado el …» y ya no se puede volver a cerrar');
    await p.evaluate(() => window.__certMensual.cerrar());
    // 2) material contra avance (legajo)
    await p.evaluate(() => { window.mostrarVista('obras'); }); await p.waitForTimeout(600);
    await p.evaluate(() => window.abrirLegajo('pA')); await p.waitForTimeout(2500);
    const mv = await p.evaluate(() => { const D = window.__matAvance.deObra(avanceObras.find((o) => o.id === 'pA')); const s = (c) => { const f = D.filas.find((x) => String(x.codigo) === String(c)); return f ? f.s + '|' + f.deb + '|' + f.ent + '|' + f.sus.map((x) => x.codigo).join(',') : ''; }; return { c1010: s(1010), c6021: s(6021), c3017: s(3017), c6010: s(6010), c7015: s(7015), rj: D.rj, am: D.am, ok: D.ok, cols: D.colsNom.length }; });
    c(/^rj\|30\|300/.test(mv.c1010), '🔴 Cable Cu 4×4: salieron 300 m, el avance (10 % del cable) justifica 30 m · ' + mv.c1010);
    c(/^rj\|6\|0/.test(mv.c6021), '🔴 vínculo: hay avance (6 de 10 columnas) y no salió nada («¿lo sacaron de otra obra?»)');
    c(/^am\|24\|30/.test(mv.c3017), '🟡 fusibles: 30 contra 24 (más allá del 10 %)');
    c(/^ok\|6\|6\|6011/.test(mv.c6010), '🟢 luminarias: 4 + 2 del sustituto 6011 (reserva cambiada) = 6, parejo · ' + mv.c6010);
    c(/^ok\|6\|7/.test(mv.c7015), '🟢 jabalinas: 7 contra 6 (dentro del margen, 1 Un.)');
    const lg = await txt(p, '#lgMavSec');
    c(await p.evaluate(() => { const s = document.getElementById('lgMavSec'), b = document.getElementById('lgBalSec'); return !!s && (!b || s.previousElementSibling === b); }) && /Material contra avance/.test(lg) && /Col 1/.test(lg), 'legajo: sección «📦 Material contra avance» debajo de «🧾 Material: calculado vs. entregado», con las columnas hechas por nombre');
    if (CAP) { await sinToast(p); await p.evaluate(() => document.getElementById('lgMavSec').scrollIntoView()); await p.waitForTimeout(300); await p.screenshot({ path: CAP + '/mat_' + (cel ? 'cel' : 'pc') + '.png' }); }
    await p.evaluate(() => { const b = [...document.querySelectorAll('#lgMavSec .mav-f')].find((x) => /1010/.test(x.textContent)); b.querySelector('[data-mav="vales"]').click(); }); await p.waitForTimeout(400);
    const vt = await txt(p, '#mavVales');
    c(/S-0413/.test(vt) && /S-0414/.test(vt), '«Ver vales»: S-0413 y S-0414');
    await p.evaluate(() => document.querySelector('#mavVales [data-mav="x"]').click());
    const av0 = Object.keys((await db(p)).avisosPush || {}).length;
    await p.evaluate(() => { const b = [...document.querySelectorAll('#lgMavSec .mav-f')].find((x) => /1010/.test(x.textContent)); b.querySelector('[data-mav="devol"]').click(); }); await p.waitForTimeout(400);
    await p.click('#mavDev [data-mav="devsi"]'); await p.waitForTimeout(1500);
    const avs = Object.values((await db(p)).avisosPush || {}).filter((a) => a.tipo === 'devolucion');
    c(avs.length >= 3 && avs.some((a) => a.clave === 'juan perez') && avs.some((a) => a.clave === 'pedro gomez') && avs.some((a) => a.email === 'pan@' + DOM) && Object.keys((await db(p)).avisosPush || {}).length > av0, '«Pedir devolución» con «Sí»: aviso a quienes retiraron y al pañol (no mueve stock)');
    // margen editable
    await p.evaluate(() => { const i = document.getElementById('mavMargen'); i.value = '30'; i.dispatchEvent(new Event('change', { bubbles: true })); }); await p.waitForTimeout(1200);
    const mg = await p.evaluate(() => ({ m: window.__matAvance.margen(), s: (window.__matAvance.deObra(avanceObras.find((o) => o.id === 'pA')).filas.find((x) => x.codigo == 3017) || {}).s }));
    const bm = (((await db(p)).configEquipo || {}).baremo || {}).aprendeMaterial || {};
    c(mg.m === 30 && mg.s === 'ok' && bm.margen === 30, 'margen editable (30 %): se guarda en configEquipo/baremo.aprendeMaterial y los fusibles pasan a 🟢');
    await p.evaluate(() => { const i = document.getElementById('mavMargen'); i.value = '10'; i.dispatchEvent(new Event('change', { bubbles: true })); }); await p.waitForTimeout(800);
    // Supervisor
    const sp = await p.evaluate(() => window.__supervisor.hallazgos({ ahora: true }).filter((h) => h.cat === 'Material').map((h) => h.t + ' · ' + h.s));
    c(sp.some((t) => /PLAZA MITRE: material contra avance · 2 en rojo/.test(t)), 'Supervisor (sin IA): «PLAZA MITRE: material contra avance · 2 en rojo» · ' + sp[0]);
    // 3) lo que aprende la app
    await p.evaluate(() => window.__sugerida.abrirAprende('material')); await p.waitForTimeout(800);
    const ap = await txt(p, '#apOv');
    c(/Material real por columna y por tipo de obra/.test(ap) && /la calculadora pone 1 m por columna; lo real fue 1,29 \(3 obras\)/.test(ap) && /PRFV 7 m/.test(ap), '🧠 📦 Material: «la calculadora pone 1 m por columna; lo real fue 1,29 (3 obras)» · PRFV 7 m');
    c(/Material contra avance/.test(ap) && !/Próximamente/.test(ap), '🧠 📦 Material: el semáforo por obra (ya no dice «Próximamente»)');
    if (CAP) { await sinToast(p); await p.screenshot({ path: CAP + '/aprende_' + (cel ? 'cel' : 'pc') + '.png' }); }
    sr.cola.push(usa('proponer_aprende_material', { codigo: '1010', tipo: 'PRFV 7 m', sugerencia: 'La calculadora pone 1 m por columna; lo real fue 1,29 (3 obras): revisar' }), fin('Te lo dejo anotado para Ángel.'));
    await p.click('#apOv [data-mav="ia"]'); await p.waitForTimeout(1500); await esperarIa(p);
    const ui = JSON.stringify((sr.pedidos[0] || {}).messages || []);
    c(/\[Material real\]/.test(ui) && /1010/.test(ui) && !/costo|precio/i.test(ui.replace(/precio de|sin plata/g, '')), '«✨ Informe del asistente»: le manda el material real ya calculado, sin plata');
    const cal0 = JSON.stringify((await db(p)).historialCalculos || {});
    await p.click('#iaChat .ia-conf:last-of-type [data-iasi]'); await p.waitForTimeout(1500);
    const am = ((((await db(p)).configEquipo || {}).baremo || {}).aprendeMaterial || {}).sugerencias || [];
    c(am.length === 1 && am[0].codigo === '1010' && /1,29/.test(am[0].texto) && am[0].porAsistente && JSON.stringify((await db(p)).historialCalculos || {}) === cal0, 'con «Sí» solo se ANOTA para Ángel (baremo.aprendeMaterial.sugerencias); la Calculadora no cambia');
    // herramienta de lectura del asistente
    const ce = await p.evaluate(async () => { const r = await window.__asistente.ejecutar('certificacion', {}); return { n: r.r && r.r.obras.length, k: r.r && r.r.modulosMes, err: r.err }; });
    c(ce.n >= 3 && ce.k > 0, 'asistente (admin): herramienta «certificacion» con las obras del mes · ' + JSON.stringify(ce));
    // lo cargado tarde (una orden del mes cerrada después): el mes no cambia, va al siguiente
    await p.evaluate(async (M) => { const db = firebase.firestore(); await db.collection('ordenesTrabajo').doc('oT').set({ numero: 'OT-2026-320', fecha: M + '-09', plazaId: 'pA', plazaNombre: 'PLAZA MITRE', personal: [], personalNombres: [], actividades: ['montaje_prfv'], estado: 'Terminada', cierre: { cerradoTs: Date.now(), avanceItems: [{ id: '5', delta: 1 }] } }); const o = avanceObras.find((x) => x.id === 'pA'); o.valorItems[0].cantidadAvanzada = 7; await db.collection('avanceObras').doc('pA').update({ valorItems: o.valorItems }); }, M);
    await p.waitForTimeout(1500);
    const L = await p.evaluate(([M, S]) => { const a = window.__certMensual.armar(M), b = window.__certMensual.armar(S); const f = (R) => { const x = R.lista.find((o) => o.id === 'pA'); return x && x.filas.find((y) => y.id === '5'); }; return { kA: a.kMes, mesA: f(a).mes, tarde: f(a).tarde, revA: a.revisar.map((r) => r.t), mesB: f(b).mes, antB: f(b).ant, revB: b.revisar.map((r) => r.t) }; }, [M, sigMes]);
    c(Math.abs(L.kA - R.kMes) < 1e-6 && L.mesA === 3 && L.tarde === 1 && L.revA.some((t) => /se cargó después del cierre/.test(t)), 'mes cerrado no cambia: lo cargado tarde se avisa («se cargó después del cierre») · ' + JSON.stringify(L).slice(0, 160));
    c(L.mesB === 1 && L.antB === 6 && L.revB.some((t) => /entra lo cargado tarde/.test(t)), 'y entra en el mes siguiente (anterior = lo cerrado, 6)');
    c(A.errores.length === 0, 'sin errores (admin) ' + A.errores.slice(0, 2).join(' | '));
    await A.ctx.close();
  }
  // ================================================================= 4) permisos
  for (const [quien, nom] of [['pan', 'pañol'], ['raul', 'cuadrilla']]) {
    const Q = await sesion(quien, null, { iaPro: true, https: true }); const q = Q.page;
    await worker(q); await q.waitForTimeout(600);
    const r = await q.evaluate(async () => { const out = { puede: window.__certMensual.puedePlata(), menu: !!document.getElementById('menuCert'), abre: window.__certMensual.abrir(), ov: !!(document.getElementById('certOv') && !document.getElementById('certOv').hidden) };
      try { window.__asistenteAbrir && window.__asistenteAbrir(); } catch (e) { } for (let i = 0; i < 40 && !window.__asistente; i++) await new Promise((r) => setTimeout(r, 150));
      if (window.__asistente) { out.tool = window.__asistente.alcance().tools(window.__asistente.TOOLS).some((t) => t.name === 'certificacion'); const e = await window.__asistente.ejecutar('certificacion', {}); out.ej = e.err || 'vio'; }
      return out; });
    c(!r.puede && !r.menu && !r.abre && !r.ov, `${nom}: no ve la certificación (ni menú ni pantalla)`);
    c(r.tool === false && /no lo puedo ver/i.test(r.ej || ''), `${nom}: el asistente no recibe «certificacion» y si la pide contesta «no lo puedo ver» · ` + r.ej);
    await Q.ctx.close();
  }
  {
    const Q = await sesion('lucia'); const q = Q.page;
    const r = await q.evaluate(() => { window.__certMensual.abrir(); return { ok: !document.getElementById('certOv').hidden, cerrar: !!document.querySelector('#certOv [data-ct="cerrarmes"]') }; });
    c(r.ok && !r.cerrar, 'oficina: ve la certificación pero el mes lo cierra Administración');
    await Q.ctx.close();
  }
  // ================================================================= 5) gente sin tarea
  {
    const A = await sesion('admin'); const p = A.page;
    const st = await p.evaluate((man) => ({ per: window.__sinTarea.personal().map((x) => x.nombre), sin: window.__sinTarea.sinTarea(man).map((x) => x.nombre), man: window.__sinTarea.manana(), sug: window.__sinTarea.sugerencias(man, { nombre: 'Mario Ruiz', rol: 'Ayudante' }).map((s) => s.txt + ' — ' + s.porque) }), man);
    c(st.man === man && st.per.length === 6 && st.per.indexOf('Pablo Pañol') < 0, 'personal de alumbrado: los 6 de obra de la nómina (sin el pañolero, que tiene usuario de pañol)');
    c(st.sin.join(',') === 'Mario Ruiz', 'mañana: 6 − 1 ausente (Diego, enfermo) − 4 en órdenes = Mario sin tarea · ' + st.sin);
    c(/^Sumar a PLAZA MITRE \(OT-2026-310\) — Izaje con 2: con uno más rinde 12 por día/.test(st.sug[0] || '') && st.sug.some((s) => /OT-2026-311/.test(s)) && /Otra tarea \(a mano\)/.test(st.sug[st.sug.length - 1]), 'dónde ponerlo: primero el izaje de 2 (rinde 12 con 3, según Ángel), después la otra orden y al final «Otra tarea (a mano)» · ' + st.sug[0]);
    await p.evaluate(() => window.mostrarVista('inicio')); await p.waitForTimeout(1500);
    const ie = await txt(p, '#ieAtender');
    c(/1 persona sin tarea mañana/.test(ie), 'Inicio Ejecutivo › Para atender: «1 persona sin tarea mañana» (ya hay órdenes emitidas para mañana)');
    // recordatorio de las 17
    const hoy = D.hoy;
    const r1 = await p.evaluate(async (h) => { window.__stAhora = new Date(h + 'T17:20:00').getTime(); return await window.__sinTarea.tic(); }, hoy);
    const r2 = await p.evaluate(async () => await window.__sinTarea.tic());
    const ra = Object.values((await db(p)).avisosPush || {}).filter((a) => a.tipo === 'sintarea');
    c(r1 && r1.l.join(',') === 'Mario Ruiz' && r2 === null && ra.length === 2 && ra.some((a) => a.email === 'admin@' + DOM) && ra.some((a) => a.email === 'lucia@' + DOM) && /Mario Ruiz/.test(ra[0].cuerpo), 'recordatorio 17:00 a Administración y Oficina, una sola vez por día · ' + ra.length);
    const r0 = await p.evaluate(async (h) => { localStorage.removeItem('ema.sinTarea.aviso'); window.__stAhora = new Date(h + 'T16:00:00').getTime(); return await window.__sinTarea.tic(); }, hoy);
    c(r0 === null, 'antes de la hora no avisa');
    await p.evaluate(() => { delete window.__stAhora; });
    // sumar a la orden con «Sí»
    await p.evaluate((man) => { window.__sugerida.abrir(man); }, man); await p.waitForTimeout(1200);
    const bq = await txt(p, '#stBloque');
    c(/1 persona sin tarea mañana/.test(bq) && /Mario Ruiz/.test(bq), 'hoja de la orden sugerida: bloque «👷 1 persona sin tarea mañana» arriba, con Mario');
    if (CAP) { await sinToast(p); await p.evaluate(() => document.getElementById('stBloque').scrollIntoView()); await p.screenshot({ path: CAP + '/sintarea_' + (cel ? 'cel' : 'pc') + '.png' }); }
    await p.evaluate(() => document.querySelector('#stBloque [data-st="ot"]').click()); await p.waitForTimeout(400);
    c(await ver(p, '#stPreg'), '«Sumar» a una orden emitida pide «Sí»');
    await p.click('#stPreg [data-st="otsi"]'); await p.waitForTimeout(1500);
    const m1 = ((await db(p)).ordenesTrabajo || {}).m1 || {};
    c((m1.personalNombres || []).indexOf('mario ruiz') >= 0 && (m1.personal || []).some((x) => x.nombre === 'Mario Ruiz'), 'con «Sí» Mario queda en la OT-2026-310');
    c((await p.evaluate((man) => window.__sinTarea.sinTarea(man).length, man)) === 0 && !(await p.evaluate(() => !!document.getElementById('stBloque'))), 'y ya no queda nadie sin tarea mañana');
    await p.evaluate(() => window.__sugerida.cerrar());
    await p.evaluate(() => window.__sugerida.abrirAprende('sintarea')); await p.waitForTimeout(600);
    const at = await txt(p, '#apOv');
    c(/Días sin tarea este mes/.test(at) && /Mario Ruiz/.test(at) && /Diego Luna/.test(at), '🧠 👷 Días sin tarea: el conteo del mes por persona');
    // ---- mayúsculas prolijas y el degradé de las acciones
    const fm = await p.evaluate(() => { const F = window.__fmtNombre; return [F.obra('Costa Canal'), F.titulo('Bº ciudad de mis sueños'), F.titulo('ERIDANUS 1416'), F.barrio('COSTA CANAL'), F.persona('juan PÉREZ'), F.titulo('barrio los platanos ii'), F.obra('georg nicolai')]; });
    c(fm.join('|') === 'COSTA CANAL|Bº Ciudad de Mis Sueños|Eridanus 1416|Bº Costa Canal|Juan Pérez|Barrio los Platanos II|GEORG NICOLAI', 'formato de nombres: «Costa Canal»→«COSTA CANAL», «Bº ciudad de mis sueños»→«Bº Ciudad de Mis Sueños», «ERIDANUS 1416»→«Eridanus 1416» · ' + fm.join(' | '));
    await p.evaluate(() => window.mostrarVista('inicio')); await p.waitForTimeout(1200);
    const gr = await p.evaluate(() => { const ch = document.querySelector('#iniEje .ie-chip.on'), w = document.createElement('div'); w.className = 'subtabs'; w.innerHTML = '<button type="button" class="subtab activo">x</button>'; document.body.appendChild(w); const b = w.firstChild; const r = [ch ? getComputedStyle(ch).backgroundImage : '', getComputedStyle(b).backgroundImage, getComputedStyle(ch || b).color]; w.remove(); return r; });
    c(/linear-gradient/.test(gr[0]) && /31, 95, 134/.test(gr[0]) && /31, 95, 134/.test(gr[1]) && /255, 255, 255/.test(gr[2]), 'chip «Todas» del Inicio y subpestaña activa con el degradé de «Calcular materiales» (navy → turquesa hondo), letra blanca');
    if (CAP) { await sinToast(p); await p.evaluate(() => { const e = document.querySelector('#iniEje .ie-chips'); e && e.scrollIntoView({ block: 'center' }); }); await p.waitForTimeout(300); await p.screenshot({ path: CAP + '/grad_inicio_' + (cel ? 'cel' : 'pc') + '.png' }); }
    await p.evaluate(() => window.mostrarVista('obras')); await p.waitForTimeout(1500);
    const lc = await p.evaluate(() => { const b = document.querySelector('.lg-card[data-lgabrir="pX"]'); return b ? { n: b.querySelector('.n').textContent, tt: getComputedStyle(b.querySelector('.t')).textTransform } : null; });
    c(lc && /Bº Costa Canal/.test(lc.n) && lc.tt === 'uppercase', 'Obras: «COSTA CANAL» en mayúsculas y el barrio «Bº Costa Canal» (en pantalla; la base no cambia)');
    c((((await db(p)).avanceObras || {}).pX || {}).nombre === 'Costa Canal', 'lo guardado sigue igual hasta que alguien diga «Sí»');
    c(await ver(p, '#fnBtn'), 'Obras (admin): botón «🔤 Ordenar mayúsculas en la base»');
    await p.evaluate(() => document.getElementById('fnBtn').click()); await p.waitForTimeout(400);
    const fo = await txt(p, '#fnOv');
    c(/Costa Canal/.test(fo) && /COSTA CANAL/.test(fo) && /Eridanus 1416/.test(fo) && !/PLAZA MITRE/.test(fo), 'muestra antes → después solo de lo que cambia');
    await p.click('#fnOv [data-fn="si"]');
    for (let i = 0; i < 40; i++) { await p.waitForTimeout(250); if (!(await p.evaluate(() => !!document.getElementById('fnOv')))) break; }
    await p.waitForTimeout(800);
    const px = ((await db(p)).avanceObras || {}).pX || {}, au = Object.values((await db(p)).auditoria || {}).filter((a) => a.accion === 'obras_mayusculas' || /Mayúsculas ordenadas/.test(a.detalle || a.texto || ''));
    c(px.nombre === 'COSTA CANAL' && px.barrio === 'Costa Canal' && px.direccion === 'Eridanus 1416' && au.length >= 1, 'con «Sí» guarda los nombres prolijos por «Registrar obra», con auditoría · ' + JSON.stringify([px.nombre, px.barrio, px.direccion, au.length]));
    c(A.errores.length === 0, 'sin errores (gente sin tarea) ' + A.errores.slice(0, 2).join(' | '));
    await A.ctx.close();
  }
  // en la sugerida (datos de la v143): bloque, cartel al emitir y el aviso después
  {
    const A = await sesion('lucia', datos143()); const p = A.page;
    const f = await p.evaluate(() => window.__sugerida.fechaDef());
    const ql = await p.evaluate((f) => window.__sinTarea.quedanPlan(window.__sugerida.armar(f)).map((x) => x.nombre), f);
    await p.evaluate(() => window.__sugerida.abrir()); await p.waitForTimeout(1200);
    c(ql.length > 0 && await ver(p, '#stBloque'), 'sugerida: los que quedan sin orden aparecen arriba con «Sumar a…» · ' + ql.join(', '));
    const ia = await p.evaluate((f) => window.__sugerida.resumenIa(f).sinTarea, f);
    c(Array.isArray(ia) && ia.length === ql.length && ia[0].dondePonerlo.length > 0, 'el asistente ve la lista con dónde ponerlos (resumenIa.sinTarea)');
    await p.click('#sgOv [data-sg="emitir"]'); await p.waitForTimeout(600);
    c(await ver(p, '#stCartel') && new RegExp('Quedan ' + ql.length + ' sin tarea').test(await txt(p, '#stCartel')), 'al tocar «Emitir»: «Quedan N sin tarea» con «Asignar ahora» / «Emitir igual»');
    await p.click('#sgEm [data-sg="emitirsi"]');
    for (let i = 0; i < 160; i++) { await p.waitForTimeout(250); if (!(await p.evaluate(() => window.__sugerida.emitiendo()))) break; }
    await p.waitForTimeout(800);
    const mg = await txt(p, '#sgOv .sg-msg');
    c(/Emitidas?:/.test(mg) && /sin tarea/.test(mg) && /Asignar ahora/.test(mg), 'después de emitir: «Quedan N sin tarea» con «Asignar ahora» · ' + mg.slice(0, 140));
    await p.click('#sgOv .sg-msg [data-st="asignar"]'); await p.waitForTimeout(600);
    c(await ver(p, '#stBloque'), '«Asignar ahora» lleva al bloque');
    c(A.errores.length === 0, 'sin errores (sugerida) ' + A.errores.slice(0, 2).join(' | '));
    await A.ctx.close();
  }
  // ================================================================= 6) reglas de Ángel en la sugerida: mínimo 2, equipos habituales, vínculos sin grúa
  {
    const d = datos143(), L = d.db.configEquipo.personal.lista;
    L.push({ nombre: 'Pablo Díaz', rol: 'Oficial', activo: true }, { nombre: 'Ariel Lastra', rol: 'Ayudante', activo: true }, { nombre: 'Marcos González', rol: 'Oficial', activo: true });
    const A = await sesion('lucia', d); const p = A.page;
    const rv = await p.evaluate(() => { const R = window.__sugReglas; return { obra1: R.revisar(1, ['montaje_prfv'], []), galpon1: R.revisar(1, ['armado_vinculo', 'prueba_artefactos'], []), barq1: R.revisar(1, ['montaje_luminaria'], [{ id: 'vB1' }], { minObra: 1, reglas: {} }), dos: R.revisar(2, ['montaje_prfv'], [{ id: 'vG' }]) }; });
    c(/mínimo 2 personas/.test(rv.obra1.join(' ')) && rv.galpon1.length === 0 && rv.dos.length === 0, 'equipo de 1 en obra → no; galpón de 1 → sí; 2 con la grúa → bien');
    c(/La barquilla necesita 2/.test(rv.barq1.join(' ')), 'barquilla con 1 (aunque el mínimo se baje a 1) → «La barquilla necesita 2»');
    const pl = await p.evaluate(() => { const D = window.__sugerida.armar(); return D.ordenes.map((o) => ({ id: o.obraId, inc: o.incluir, gente: o.gente.map((x) => x.nombre), av: o.avisos.map((a) => a.t).join(' | '), t: o.tareas.map((t) => ({ k: t.k, m: t.rend ? t.rend.modoIz : '', pq: t.porque.join(' / ') })) })).concat([{ libres: D.libres.map((x) => x.nombre) }]); });
    const p3 = pl.find((o) => o.id === 'p3') || {}, p1 = pl.find((o) => o.id === 'p1') || {}, lib = pl[pl.length - 1].libres;
    c(p3.gente && p3.gente.length === 1 && !p3.inc && /mínimo 2 personas/.test(p3.av) && lib.indexOf(p3.gente[0]) >= 0, 'sugerida: la obra que quedaba con 1 (PLAZA DEL SOL) no se emite, lo dice y la persona queda sin tarea (para el galpón u otro equipo)');
    // la propuesta de equipos habituales (sin guardar)
    await p.evaluate(() => { window.mostrarVista('produccion'); }); await p.waitForTimeout(800);
    await p.evaluate(() => { const b = document.querySelector('#subtabsProd [data-sub="personal"]'); b && b.click(); }); await p.waitForTimeout(2000);
    const eh = await txt(p, '#ehCard');
    const em = await p.evaluate(() => ['Marcos Manclova', 'Marcos González', 'Ariel Lastra', 'Pablo', 'Ulises Toledo'].map((n) => window.__sugReglas.emparejar(n).estado));
    c(/Equipos habituales/.test(eh) && /Propuesta de Ángel sin guardar/.test(eh) && /a confirmar/.test(eh) && /no encontrado/.test(eh), 'Producción › Personal: «👥 Equipos habituales» con la propuesta de Ángel precargada, «a confirmar» y «no encontrado»');
    c(em.join(',') === 'confirmar,ok,ok,parecido,no', 'emparejado por nombre Y apellido: «Marcos Manclova» con dos Marcos en la nómina → a confirmar (no elige); «Marcos González» y «Ariel Lastra» → ok; «Pablo» → ≈ Pablo Díaz; «Ulises Toledo» → no encontrado · ' + em.join(','));
    c(!((await db(p)).configEquipo.personal || {}).equiposHab, 'no se guarda solo (hasta «Guardar»)');
    if (CAP) { await sinToast(p); await p.evaluate(() => document.getElementById('ehCard').scrollIntoView()); await p.screenshot({ path: CAP + '/equipos_' + (cel ? 'cel' : 'pc') + '.png' }); }
    // guardar solo el de la grúa y ver la sugerida
    await p.evaluate(() => { [...document.querySelectorAll('#ehCard [data-eh="quitar"]')].slice(0, 4).forEach(() => { const b = document.querySelector('#ehCard [data-eh="quitar"]'); b && b.click(); }); }); await p.waitForTimeout(400);
    await p.evaluate(() => { const s = document.querySelector('#ehCard select[data-eh="p"][data-j="0"]'); s.value = 'Pablo Díaz'; s.dispatchEvent(new Event('change', { bubbles: true })); const v = document.querySelector('#ehCard select[data-eh="v"]'); v.value = 'vG'; v.dispatchEvent(new Event('change', { bubbles: true })); }); await p.waitForTimeout(300);
    await p.click('#ehCard [data-eh="guardar"]'); await p.waitForTimeout(1200);
    const g = ((await db(p)).configEquipo.personal || {}).equiposHab || [];
    c(g.length === 1 && g[0].nombres.join(',') === 'Pablo Díaz,Ariel Lastra' && g[0].vehiculoId === 'vG' && g[0].grua, 'con «Guardar» queda en configEquipo/personal.equiposHab · ' + JSON.stringify(g));
    const pl2 = await p.evaluate(() => { const D = window.__sugerida.armar(); const o = D.ordenes.find((x) => x.obraId === 'p1'); return { gente: o.gente.map((x) => x.nombre), veh: o.vehiculos.map((v) => v.id), av: o.avisos.map((a) => a.t).join(' | '), t: o.tareas.map((t) => ({ k: t.k, m: t.rend ? t.rend.modoIz : '', pq: t.porque.join(' / ') })) }; });
    const iz = pl2.t.find((x) => x.k === 'montaje_prfv') || {}, vi = pl2.t.find((x) => x.k === 'montaje_vinculo');
    c(pl2.gente.indexOf('Pablo Díaz') >= 0 && pl2.gente.indexOf('Ariel Lastra') >= 0 && pl2.veh.indexOf('vG') >= 0 && /Equipo de la grúa/.test(pl2.av), 'sugerida: el equipo de la grúa (Pablo y Ariel) va a la obra con izaje, con la grúa');
    c(/^cano/.test(iz.m) && /con caño y sin vínculo/.test(iz.pq), 'grúa izando sin vínculos: «con caño y sin vínculo» (6 con 2 / 12 con 3) · ' + iz.m);
    c(!vi || (!/van con el izaje/.test(vi.pq) && /van aparte, sin grúa/.test(vi.pq)), 'los vínculos no van «con el izaje»: aparte, con hidro chica o barquilla, en las columnas ya izadas');
    // «Llenar orden»: aviso con «Emitir igual»
    await p.evaluate(() => { window.__dofOrig = window.datosOtDesdeFormulario; window.datosOtDesdeFormulario = () => ({ personal: [{ nombre: 'Juan Pérez' }], actividades: ['montaje_luminaria'], vehiculos: [{ id: 'vB1', nombre: 'Barquilla 1' }] }); window.__emitio = 0; });
    await p.evaluate(() => { window.emitirOrdenTrabajo(); }); await p.waitForTimeout(500);
    const m2 = await txt(p, '#m2Preg');
    c(/mínimo 2 personas/.test(m2) && /La barquilla necesita 2/.test(m2) && /Emitir igual/.test(m2), '«Llenar orden» con 1 persona y barquilla: aviso «En obra van mínimo 2» / «La barquilla necesita 2» con «Emitir igual»');
    await p.click('#m2Preg [data-m2="no"]'); await p.waitForTimeout(300);
    c(!(await p.evaluate(() => !!document.getElementById('m2Preg'))) && /No se emitió/.test(await txt(p, '#otMsg')), '«Volver» no emite');
    await p.evaluate(() => { window.datosOtDesdeFormulario = window.__dofOrig; });
    c(A.errores.length === 0, 'sin errores (reglas) ' + A.errores.slice(0, 2).join(' | '));
    await A.ctx.close();
  }
  await browser.close();
  process.exitCode = c.fin() ? 1 : 0;
})().catch((e) => { console.error(e); console.log('RESULTADO v145: ERROR'); process.exitCode = 1; });
