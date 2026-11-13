// v151 · «📄 Falta documentación» y «✅ Terminadas» en Avance de obra y en Obras (legajos) + ficha «📄 Documentación» del legajo.
//  1) la cuenta (de memoria): 100 % con documentación completa (San Pablo), 100 % sin PAT ni certificado (Las Rosas), en curso sin
//     carpeta EPEC (Barrio San Vicente), sin empezar (Del Sol: no se le reclama nada); fecha del 100 % por el último cierre.
//  2) Avance de obra: subíndices con contadores, chips de lo que falta, Terminadas con la fecha y ✅/⚠, filtro por tipo.
//  3) Obras (legajos): pestañas nuevas (y «🗄 Archivadas» la de antes), filtro de tipo y buscador, botón «📄 Documentación».
//  4) la ficha: 4 filas ✅/❌; cargar la planilla de PAT con foto (Worker de fotos simulado → R2, sin la imagen en la base),
//     certificado «Lo tengo en papel» con fecha, reemplazar (el anterior queda en el historial), ver, PDF grande rechazado,
//     carpeta EPEC → Registrar obra; auditoría obra_documento.
//  5) permisos: mirar y cuadrilla no ven los botones de cargar · 6) apagado (__v151No): todo como antes.
const { abrir, prueba } = require('./h');
const { datos151, PNG } = require('./datos151');
const cel = process.argv[2] === 'cel';
const CAP = process.env.CAP || '';
const SOLO = (x) => !process.env.SOLO || process.env.SOLO.indexOf(x) >= 0;
const JPG = Buffer.from('/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=', 'base64');
(async () => {
  const c = prueba('v151' + (cel ? ' cel' : ''));
  const MOD = { cel, espera: 5000, v151: true, inicio: true, nav: true, https: true, lgPleg: true };
  let browser = null;
  const sesion = async (quien, op) => {
    const A = await abrir(Object.assign({ sesion: quien, datos: datos151(), browser }, MOD, op || {})); browser = A.browser;
    A.r2 = { put: 0 };
    await A.ctx.route(/ema-fotos\.mdiaz-60f\.workers\.dev/, async (rq) => { if (rq.request().method() === 'GET' && /\/f\//.test(rq.request().url())) return rq.fulfill({ status: 200, contentType: 'image/jpeg', headers: { 'access-control-allow-origin': '*' }, body: JPG }); if (rq.request().method() === 'PUT') A.r2.put++; rq.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ ok: true }) }); });
    A.page.on('dialog', (x) => x.accept()); await A.page.waitForTimeout(1200); return A;
  };
  const db = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('stub.db') || '{}'));
  const ver = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); return !!e && e.getBoundingClientRect().height > 0 && getComputedStyle(e).visibility !== 'hidden'; }, sel);
  const txt = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; }, sel);
  const scrollX = (p) => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const clic = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return false; e.click(); return true; }, sel);
  const sinToast = (p) => p.evaluate(() => { document.querySelectorAll('body *').forEach((e) => { if (e.children.length < 8 && /Falta cerrar la quincena/.test(e.textContent || '') && getComputedStyle(e).position === 'fixed') e.style.display = 'none'; }); });
  const foto = async (p, nombre, sel) => { if (!CAP) return; await sinToast(p); if (sel) await p.evaluate((s) => { const e = document.querySelector(s); e && e.scrollIntoView({ block: 'start' }); window.scrollBy(0, -80); }, sel); await p.waitForTimeout(400); await p.screenshot({ path: CAP + '/' + nombre + '_' + (cel ? 'cel' : 'pc') + '.png' }); };
  const esperar = (p, fn, arg, ms) => p.waitForFunction(fn, arg, { timeout: ms || 20000, polling: 200 }).then(() => true, () => false);
  const D0 = datos151(), dia = D0.dia;
  const fl = (f) => f.split('-').reverse().join('/');

  if (SOLO('1')) {
    const A = await sesion('lucia'); const p = A.page;
    // 1) la cuenta
    const k = await p.evaluate(() => { const D = window.__docObra, o = (id) => avanceObras.find((x) => x.id === id); return { c: D.cuentas('todas'), cb: D.cuentas('barrio'), f: D.lista('faltadoc').map((x) => x.id), t: D.lista('term100').map((x) => x.id), e1: D.estado(o('q1')).completa, e2: D.estado(o('q2')).falta, e3: D.estado(o('q3')).falta, f100: D.fecha100(o('q1')), f2: D.fecha100(o('q2')), d4: D.faltaDoc(o('q4')) }; });
    c(k.c.faltadoc === 2 && k.c.term100 === 2 && k.f.join() === 'q2,q3' && k.t.indexOf('q1') >= 0 && k.t.indexOf('q2') >= 0 && k.t.length === 2, 'cuenta: falta documentación = Las Rosas y San Vicente (2) · terminadas = San Pablo y Las Rosas (2) · ' + JSON.stringify(k.c));
    c(k.e1 === true && k.e2.join() === 'pat,cert' && k.e3.join() === 'carpeta,conforme,pat,cert' && k.d4 === false, 'San Pablo completa · a Las Rosas le faltan PAT y certificado · a San Vicente los 4 · Del Sol (0 %) no se reclama');
    c(k.f100 && k.f100.fecha === dia(-3) && k.f100.numero === 'OT-2026-150' && k.f2 && k.f2.numero === 'OT-2026-151', 'fecha del 100 %: el último cierre que movió el avance (OT-2026-150 el ' + fl(dia(-3)) + ')');
    c(k.cb.faltadoc === 1 && k.cb.term100 === 0, 'con el filtro «Barrios»: 1 falta documentación, 0 terminadas');

    // 2) Avance de obra
    await p.evaluate(() => mostrarVista('avance')); await p.waitForTimeout(900);
    const tabs = await txt(p, '#avDocTabs');
    c(await ver(p, '#avDocTabs') && /Falta documentación 2/.test(tabs) && /Terminadas 2/.test(tabs) && /Avance/.test(tabs), 'Avance de obra: subíndices «📊 Avance · 📄 Falta documentación (2) · ✅ Terminadas (2)» · ' + tabs);
    c(await ver(p, '#avancePanelGrid') && !(await ver(p, '#avDocLista')), 'de entrada, «📊 Avance»: las tarjetas de siempre');
    await p.click('[data-dcavtab="faltadoc"]'); await p.waitForTimeout(500);
    const lf = await p.evaluate(() => [...document.querySelectorAll('#avDocLista .dc-card')].map((e) => e.textContent.replace(/\s+/g, ' ')));
    c(lf.length === 2 && /LAS ROSAS/.test(lf[0]) && /PAT/.test(lf[0]) && /Certificado/.test(lf[0]) && !/Carpeta EPEC/.test(lf[0]) && /SAN VICENTE/.test(lf[1]) && /Carpeta EPEC/.test(lf[1]), 'Falta documentación: Las Rosas con chips «PAT · Certificado» y San Vicente con «Carpeta EPEC …» · ' + lf.map((x) => x.slice(0, 70)).join(' | '));
    c(!(await ver(p, '#avancePanelGrid')) && await p.evaluate(() => document.querySelectorAll('#avDocLista [data-dcdoc]').length === 2), 'en ese modo las tarjetas de siempre se esconden y cada obra tiene «📄 Documentación»');
    await foto(p, 'avance_falta_doc', '#avancePanelCard');
    await p.click('[data-dcavtab="term100"]'); await p.waitForTimeout(500);
    const lt = await p.evaluate(() => [...document.querySelectorAll('#avDocLista .dc-card')].map((e) => e.textContent.replace(/\s+/g, ' ')));
    const ros = lt.find((x) => /LAS ROSAS/.test(x)) || '', sp = lt.find((x) => /SAN PABLO/.test(x)) || '';
    c(lt.length === 2 && /Documentación completa/.test(sp) && new RegExp('100 % el ' + fl(dia(-3)) + ' \\(OT-2026-150\\)').test(sp) && /Falta: PAT · Certificado/.test(ros), 'Terminadas: San Pablo «✅ Documentación completa» y llegó al 100 % el ' + fl(dia(-3)) + ' (OT-2026-150) · Las Rosas «⚠ Falta: PAT · Certificado»');
    await foto(p, 'avance_terminadas', '#avancePanelCard');
    await p.evaluate(() => window.avanceElegirTipo('barrio')); await p.waitForTimeout(400);
    const tb = await txt(p, '#avDocTabs');
    c(/Falta documentación 1/.test(tb) && /Terminadas 0/.test(tb) && /Todavía no hay barrios al 100/.test(await txt(p, '#avDocLista')), 'con «🏘 Barrios»: Falta documentación 1 · Terminadas 0 («Todavía no hay barrios al 100 %»)');
    await p.evaluate(() => window.avanceElegirTipo('todas')); await p.waitForTimeout(300);
    await p.click('#avDocLista [data-dcav="q2"] .t'); await p.waitForTimeout(600);
    c(await p.evaluate(() => typeof avanceActivoId !== 'undefined' && String(avanceActivoId) === 'q2'), 'tocar la obra abre su avance (detalle de Las Rosas)');
    await p.click('[data-dcavtab="avance"]'); await p.waitForTimeout(400);
    c(await ver(p, '#avancePanelGrid') && !(await ver(p, '#avDocLista')), '«📊 Avance» vuelve a las tarjetas de siempre');

    // 3) Obras (legajos)
    await p.evaluate(() => mostrarVista('obras')); await p.waitForTimeout(800);
    const lgt = await txt(p, '#obrasApp .lg-tabs');
    c(/En curso 4/.test(lgt) && /Falta documentación 2/.test(lgt) && /Terminadas 2/.test(lgt) && /Archivadas 0/.test(lgt), 'Obras: pestañas «🚧 En curso · 📄 Falta documentación (2) · ✅ Terminadas (2) · 🗄 Archivadas» · ' + lgt);
    await p.click('#obrasApp [data-lgtab="faltadoc"]'); await p.waitForTimeout(500);
    const of = await p.evaluate(() => [...document.querySelectorAll('#obrasApp .lg-lista .dc-card')].map((e) => e.textContent.replace(/\s+/g, ' ')));
    c(of.length === 2 && /LAS ROSAS/.test(of.join()) && /SAN VICENTE/.test(of.join()), 'Obras › Falta documentación: Las Rosas y San Vicente con lo que falta');
    await foto(p, 'obras_falta_doc', '#obrasApp');
    await p.click('#obrasApp [data-lgtipo="barrio"]'); await p.waitForTimeout(400);
    const ob = await p.evaluate(() => [...document.querySelectorAll('#obrasApp .lg-lista .dc-card')].map((e) => e.textContent.replace(/\s+/g, ' ')));
    c(ob.length === 1 && /SAN VICENTE/.test(ob[0]) && /Barrios 1/.test(await txt(p, '#obrasApp .lg-tipos')), 'el filtro de tipo se combina: «🏘 Barrios» deja solo San Vicente');
    await p.click('#obrasApp [data-lgtipo="todas"]'); await p.waitForTimeout(300);
    await p.click('#obrasApp [data-lgtab="term100"]'); await p.waitForTimeout(400);
    await p.fill('#lgBuscar', 'rosas'); await p.waitForTimeout(500);
    const os = await p.evaluate(() => [...document.querySelectorAll('#obrasApp .lg-lista .dc-card')].map((e) => e.textContent.replace(/\s+/g, ' ')));
    c(os.length === 1 && /LAS ROSAS/.test(os[0]) && /Falta: PAT · Certificado/.test(os[0]), 'Obras › Terminadas con el buscador «rosas»: solo Las Rosas, «⚠ Falta: PAT · Certificado»');
    await p.fill('#lgBuscar', ''); await p.waitForTimeout(400);
    await foto(p, 'obras_terminadas', '#obrasApp');
    await p.click('#obrasApp [data-dcdoc="q2"]'); await p.waitForTimeout(1200);
    const sec = await p.evaluate(() => { const s = document.getElementById('lgDocSec'); if (!s) return null; const r = s.getBoundingClientRect(); return { abierta: !s.classList.contains('lg-cerrada'), filas: [...s.querySelectorAll('.dc-row')].map((x) => x.dataset.dck + ':' + (x.classList.contains('si') ? 'si' : 'no')), antesFotos: !!s.nextElementSibling && s.nextElementSibling.id === 'lgFotosSec', vis: r.top < innerHeight && r.bottom > 0, cargar: s.querySelectorAll('[data-dc="cargar"]').length, papel: s.querySelectorAll('[data-dc="papel"]').length }; });
    c(sec && sec.abierta && sec.vis && sec.filas.join() === 'carpeta:si,conforme:si,pat:no,cert:no' && sec.antesFotos, '«📄 Documentación» abre el legajo con la ficha a la vista: Carpeta ✅ · Conforme ✅ · PAT ❌ · Certificado ❌ (antes de las fotos) · ' + JSON.stringify(sec));
    c(sec && sec.cargar === 2 && sec.papel === 2, 'PAT y Certificado con «📎 Cargar» y «✔ Lo tengo en papel»');
    await foto(p, 'ficha_documentacion', '#lgDocSec');

    // 4) cargar la planilla de PAT con foto (R2 simulado)
    await clic(p, '#lgDocSec [data-dc="cargar"][data-k="pat"]'); await p.waitForTimeout(500);
    c(await p.evaluate(() => { const o = document.getElementById('dcOv'); return !!o && o.classList.contains('v7-ov') && o.getAttribute('role') === 'dialog' && !!o.querySelector('.v7-x[aria-label="Cerrar"]') && !!o.querySelector('#dcArchivo') && o.querySelector('#dcMsg').getAttribute('role') === 'status'; }), 'hoja «⚡ Planilla de PAT» (.v7-ov, role=dialog, ✕, aviso role=status) con fecha y «Sacar foto o elegir archivo»');
    await foto(p, 'hoja_cargar');
    await p.setInputFiles('#dcArchivo', { name: 'pat.png', mimeType: 'image/png', buffer: Buffer.from(PNG.split(',')[1], 'base64') });
    const okPat = await esperar(p, () => { const d = JSON.parse(localStorage.getItem('stub.db') || '{}'); const x = (((d.avanceObras || {}).q2 || {}).documentos || {}).pat; return !!(x && x.ok && x.adjId); });
    const d1 = await db(p), pat = ((d1.avanceObras.q2.documentos || {}).pat) || {}, adj = (d1.adjuntos || {})[pat.adjId] || {};
    c(okPat && pat.tipoArch === 'foto' && pat.fecha && /lucia/.test(pat.por) && pat.ts > 0 && pat.porNombre === 'Lucía Fernández', 'PAT con foto: avanceObras.documentos.pat {ok, fecha, adjId, tipoArch: foto, por, ts} · ' + JSON.stringify({ f: pat.fecha, a: !!pat.adjId }));
    c(adj.tipo === 'documento' && adj.doc === 'pat' && adj.plazaId === 'q2' && /^fotos\//.test(adj.r2 || '') && !adj.dataUrl && A.r2.put >= 1, 'la foto fue a la nube de fotos (R2): en la base queda la ficha con r2 y sin la imagen · ' + (adj.r2 || '(sin r2)'));
    c(Object.values(d1.auditoria || {}).some((a) => a.accion === 'obra_documento' && /Planilla de PAT/.test(a.detalle || '')), 'auditoría obra_documento');
    await p.waitForTimeout(900);
    c(!(await p.evaluate(() => !!document.getElementById('dcOv'))) && /PAT/.test(await txt(p, '#lgDocSec [data-dck="pat"]')) && await p.evaluate(() => document.querySelector('#lgDocSec [data-dck="pat"]').classList.contains('si')), 'la hoja se cierra sola y la fila de PAT pasa a ✅ con «👁 Ver» y «↺ Reemplazar»');

    // certificado «Lo tengo en papel»
    await clic(p, '#lgDocSec [data-dc="papel"][data-k="cert"]'); await p.waitForTimeout(500);
    await p.fill('#dcFecha', dia(-1)); await p.fill('#dcNota', 'en el bibliorato');
    await p.click('#dcOv [data-dc="guardarPapel"]');
    await esperar(p, () => { const d = JSON.parse(localStorage.getItem('stub.db') || '{}'); const x = (((d.avanceObras || {}).q2 || {}).documentos || {}).cert; return !!(x && x.ok); });
    const d2 = await db(p), cert = ((d2.avanceObras.q2.documentos || {}).cert) || {};
    c(cert.ok && cert.papel === true && cert.fecha === dia(-1) && cert.nota === 'en el bibliorato' && !cert.adjId, 'Certificado «✔ Lo tengo en papel» con la fecha ' + fl(dia(-1)) + ' y dónde está');
    await p.waitForTimeout(900);
    c(/Documentación completa \(4 de 4\)/.test(await txt(p, '#lgDocSec')), 'la ficha dice «✅ Documentación completa (4 de 4)»');
    c(await p.evaluate(() => window.__docObra.cuentas('todas').faltadoc === 1), 'Las Rosas sale de «Falta documentación» (queda 1)');

    // reemplazar la PAT (la foto pasa al historial)
    await clic(p, '#lgDocSec [data-dc="reemplazar"][data-k="pat"]'); await p.waitForTimeout(500);
    c(/el anterior queda en el historial/.test(await txt(p, '#dcOv')) && await p.evaluate(() => !!document.querySelector('#dcOv #dcArchivo') && !!document.querySelector('#dcOv [data-dc="guardarPapel"]')), '«↺ Reemplazar»: foto/PDF o en papel, «el anterior queda en el historial»');
    await p.click('#dcOv [data-dc="guardarPapel"]');
    await esperar(p, () => { const d = JSON.parse(localStorage.getItem('stub.db') || '{}'); const x = (((d.avanceObras || {}).q2 || {}).documentos || {}).pat; return !!(x && x.papel && (x.hist || []).length === 1); });
    const d3 = await db(p), pat2 = d3.avanceObras.q2.documentos.pat;
    c(pat2.papel === true && pat2.hist.length === 1 && pat2.hist[0].adjId === pat.adjId && !!d3.adjuntos[pat.adjId], 'reemplazada: ahora en papel, la foto anterior queda en hist[] y el adjunto no se borró');
    await p.waitForTimeout(900);
    c(/Antes \(1\)/.test(await txt(p, '#lgDocSec [data-dck="pat"]')), 'la fila muestra «Antes (1)» con el anterior');
    c(Object.values(d3.auditoria || {}).filter((a) => a.accion === 'obra_documento').length >= 3, 'cada carga y reemplazo queda en la auditoría');

    // PDF grande: no se guarda
    await p.evaluate(() => window.abrirLegajo('q3')); await p.waitForTimeout(900);
    await p.evaluate(() => { const s = document.getElementById('lgDocSec'); s && s.classList.remove('lg-cerrada'); });
    await clic(p, '#lgDocSec [data-dc="cargar"][data-k="cert"]'); await p.waitForTimeout(400);
    await p.setInputFiles('#dcArchivo', { name: 'cert.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(800 * 1024, 65) });
    await p.waitForTimeout(600);
    c(/pesa 800 KB/.test(await txt(p, '#dcMsg')) && !((await db(p)).avanceObras.q3.documentos), 'un PDF de 800 KB no se guarda: «sacale una foto o marcá Lo tengo en papel»');
    await p.click('#dcOv [data-dc="x"]'); await p.waitForTimeout(300);
    c(!(await p.evaluate(() => !!document.getElementById('dcOv'))), 'la ✕ cierra la hoja');
    // un PDF chico sí (como los remitos)
    await clic(p, '#lgDocSec [data-dc="cargar"][data-k="cert"]'); await p.waitForTimeout(400);
    await p.setInputFiles('#dcArchivo', { name: 'cert.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n%prueba\n') });
    await esperar(p, () => { const d = JSON.parse(localStorage.getItem('stub.db') || '{}'); const x = (((d.avanceObras || {}).q3 || {}).documentos || {}).cert; return !!(x && x.ok); });
    const d4 = await db(p), c3 = (d4.avanceObras.q3.documentos || {}).cert || {}, a3 = d4.adjuntos[c3.adjId] || {};
    c(c3.tipoArch === 'pdf' && a3.mime === 'application/pdf' && /^data:application\/pdf/.test(a3.dataUrl || ''), 'un PDF chico se guarda como los remitos (adjunto con el PDF)');
    // carpeta EPEC → Registrar obra
    await p.waitForTimeout(900);
    await clic(p, '#lgDocSec [data-dc="carpeta"]'); await p.waitForTimeout(1500);
    c(await p.evaluate(() => document.getElementById('viewRegistro').style.display !== 'none' && !!document.getElementById('obCarpetaEpec') && window.REGISTRO_OBRA.estado().editando === 'q3'), '«📁 Cargar la fecha» lleva a Registrar obra con San Vicente para editar y la fecha de la carpeta');
    // ver el certificado de San Pablo (foto)
    await p.evaluate(() => window.abrirLegajo('q1')); await p.waitForTimeout(900);
    await p.evaluate(() => { const s = document.getElementById('lgDocSec'); s && s.classList.remove('lg-cerrada'); });
    c(/Documentación completa/.test(await txt(p, '#lgDocSec')) && /lo tienen en papel/.test(await txt(p, '#lgDocSec [data-dck="pat"]')), 'San Pablo: completa, la PAT «lo tienen en papel»');
    await clic(p, '#lgDocSec [data-dc="ver"][data-k="cert"]'); await p.waitForTimeout(1200);
    c(await p.evaluate(() => [...document.querySelectorAll('body > *')].some((e) => getComputedStyle(e).position === 'fixed' && /visor|adjunto|gv|gal/i.test(e.id + ' ' + e.className) && e.getBoundingClientRect().height > 200)), '«👁 Ver» abre la foto del certificado en el visor');
    await p.keyboard.press('Escape'); await p.waitForTimeout(300);
    c(await scrollX(p) <= 0, 'sin scroll de costado');
    c(A.errores.length === 0, 'sin errores en la consola' + (A.errores.length ? ': ' + A.errores.slice(0, 2).join(' | ') : ''));
    await A.ctx.close();
  }

  // 5) permisos: mirar y cuadrilla
  if (SOLO('2')) {
    const M = await sesion('mir'); const p = M.page;
    await p.evaluate(() => mostrarVista('avance')); await p.waitForTimeout(800);
    c(await ver(p, '#avDocTabs'), 'mirar: ve los subíndices en Avance de obra');
    await p.evaluate(() => window.abrirLegajo('q2')); await p.waitForTimeout(1200);
    await p.evaluate(() => { const s = document.getElementById('lgDocSec'); s && s.classList.remove('lg-cerrada'); });
    const m = await p.evaluate(() => { const s = document.getElementById('lgDocSec'); return s ? { filas: s.querySelectorAll('.dc-row').length, bt: s.querySelectorAll('[data-dc="cargar"],[data-dc="papel"],[data-dc="reemplazar"],[data-dc="carpeta"]').length } : null; });
    c(m && m.filas === 4 && m.bt === 0 && await p.evaluate(() => !window.__docObra.puedeCargar()), 'mirar: ve la ficha (4 filas) pero sin «Cargar», «Lo tengo en papel» ni «Reemplazar»');
    c(M.errores.length === 0, 'mirar: sin errores');
    await M.ctx.close();
    const R = await sesion('raul', { crew: true }); const q = R.page;
    await q.evaluate(() => { try { window.abrirLegajo('q2'); } catch (e) { } }); await q.waitForTimeout(1200);
    const r = await q.evaluate(() => ({ puede: window.__docObra.puedeCargar(), bt: document.querySelectorAll('#lgDocSec [data-dc="cargar"],#lgDocSec [data-dc="papel"],#lgDocSec [data-dc="reemplazar"]').length }));
    c(!r.puede && r.bt === 0, 'cuadrilla: no puede cargar ni ve los botones');
    c(R.errores.length === 0, 'cuadrilla: sin errores');
    await R.ctx.close();
  }

  // 6) apagado: como antes
  if (SOLO('3')) {
    const V = await sesion('lucia', { v151: false }); const p = V.page;
    await p.evaluate(() => mostrarVista('avance')); await p.waitForTimeout(700);
    c(!(await ver(p, '#avDocTabs')) && await ver(p, '#avancePanelGrid'), 'apagado (__v151No): Avance de obra como antes');
    await p.evaluate(() => mostrarVista('obras')); await p.waitForTimeout(700);
    const t = await txt(p, '#obrasApp .lg-tabs');
    c(/Terminadas 0/.test(t) && !/Falta documentación|Archivadas/.test(t), 'apagado: Obras con «En curso / ✅ Terminadas» de antes · ' + t);
    await p.evaluate(() => window.abrirLegajo('q2')); await p.waitForTimeout(1200);
    c(!(await p.evaluate(() => !!document.getElementById('lgDocSec'))), 'apagado: el legajo sin la ficha nueva');
    c(V.errores.length === 0, 'apagado: sin errores');
    await V.ctx.close();
  }
  if (browser) await browser.close();
  process.exit(c.fin() ? 1 : 0);
})();
