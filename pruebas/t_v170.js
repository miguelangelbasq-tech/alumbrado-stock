// v170 · Avance de obra: carga rápida a mano (datos163: PLAZA MEDIA b4 sin órdenes, PLAZA BULEVARES b1 con órdenes).
//  0) «✏ Carga rápida» en PLAZA MEDIA: «10 izadas» → cartel «también marca pozo y hormigón de esas 10 (ya fraguado)» → «Sí»;
//     sin pedir motivo (queda «Carga rápida del avance»), av2.hist / avanceHist, el %; «↶ Deshacer»; «Solo el izaje»; «Todas»
//     el pozo; «8» hormigones con − / +; bajar el izaje y «¿También sacás los pasos que siguen?».
//  1) la grilla con «✏ Tocar marca»: tocar marca / saca sin hoja (con la cascada), mantener apretado abre la hoja, «Tocar marca: No».
//  2) Bulevares (con órdenes): «Todas» izadas no toca lo de las órdenes (hecho, fraguando, falla), avisa del fraguado; una orden
//     cerrada nueva encima de lo marcado no cuenta dos veces; tocar una celda de una orden abre la hoja.
//  3) el ajuste de Administración «Pedir motivo al cambiar el avance a mano»: No (de entrada) / Sí (pide el motivo en la tarjeta, la
//     hoja de la columna y el ítem por ítem del itemizado v156); la oficina no ve el ajuste.
//  4) lo que no va por columna: zanja en metros y replanteo (de una vez); deshacer.
//  5) Dirección, «solo mirar», pañol y cuadrilla no pueden.
//  6) compatibilidad: con __v170No (pruebas viejas) todo como la v169 (motivo obligatorio, sin tarjeta).
const { abrir, prueba } = require('./h');
const { datos163 } = require('./datos163');
const cel = process.argv[2] === 'cel';
const CAP = process.env.CAP || '';
const SOLO = (x) => !process.env.SOLO || process.env.SOLO.indexOf(x) >= 0;
(async () => {
  const c = prueba('v170' + (cel ? ' cel' : ''));
  const MOD = { cel, espera: 5000, crew: true, nav: true, mtNuevo: true, tarjetas: true, ofPasos: true, porPartes: true, https: true, inicio: true, sugerida: true, iaPro: true, v145: true, v146: true, v147: true, v150: true, v151: true, v152: true, v153: true, v154: true, v155: true, v156: true, v157: true, v158: true, v159: true, v160: true, v161: true, v163: true, v170: true, reglas: !!process.env.REGLAS, antes: () => { window.__pmPausa = true; window.__hvPausa = true; window.__isNoAuto = true; window.__aaPausa = true; window.__cvSinMic = true; } };
  let browser = null;
  const sesion = async (quien, op) => { const A = await abrir(Object.assign({ sesion: quien, datos: datos163(), browser }, MOD, op || {})); browser = A.browser; A.page.on('dialog', (x) => x.accept()); await A.page.waitForTimeout(1200); return A; };
  const db = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('stub.db') || '{}'));
  const scrollX = (p) => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const foto = async (p, nombre, sel) => { if (!CAP) return; await p.evaluate((s) => { const st = document.getElementById('cap170') || document.head.appendChild(Object.assign(document.createElement('style'), { id: 'cap170' })); st.textContent = '#avToast{display:none!important}'; if (s) { const e = document.querySelector(s); if (e) window.scrollTo(0, Math.max(0, e.getBoundingClientRect().top + window.scrollY - 70)); } }, sel); await p.waitForTimeout(400); await p.screenshot({ path: CAP + '/' + nombre + '_' + (cel ? 'cel' : 'pc') + '.png' }); };
  const errsJs = (A) => (A.errores || []).filter((e) => !/Missing or insufficient permissions|permission-denied|ERR_|Failed to fetch|aborted|fetching the script|prueba|sin permiso|Sin permiso/i.test(e));
  const avance = async (p, id) => { await p.evaluate(() => mostrarVista('avance')); await p.waitForTimeout(700); await p.evaluate((x) => verAvanceDetalle(x), id); await p.waitForTimeout(1200); };
  const pctX = (p, id) => p.evaluate((x) => Math.round(window.__av2.estado(x).pctX * 100) / 100, id);
  const fila = (p, id, paso) => p.evaluate(([o, a]) => { const E = window.__av2.estado(o); return E.L.cols.map((c, i) => E.R[a + '|' + i].e).join(','); }, [id, paso]);
  const cuenta = (p, id, paso) => p.evaluate(([o, a]) => { const E = window.__av2.estado(o); return E.L.cols.filter((c, i) => ({ ver: 1, sinver: 1, mano: 1, frag: 1 })[E.R[a + '|' + i].e]).length; }, [id, paso]);
  const cartel = (p) => p.evaluate(() => { const e = document.getElementById('a2Rc'); return e && !e.hidden ? e.textContent.replace(/\s+/g, ' ').trim() : ''; });
  const listo = async (p, q, n) => { await p.fill(`#a2Rap input[data-a2rn="${q}"]`, String(n)); await p.waitForTimeout(150); await p.click(`#a2Rap .a2r-listo[data-q="${q}"]`); await p.waitForTimeout(500); };
  const si = async (p, b) => { await p.click(`#a2Rc [data-a2r="${b || 'si'}"]`); await p.waitForTimeout(1300); };
  const tocarCel = (p, paso, i) => p.click(`#a2App .a2-grilla [data-a2="cel"][data-p="${paso}"][data-i="${i}"]`);

  // ================================================================= 0) carga rápida en una obra sin órdenes
  if (SOLO('0')) {
    const A = await sesion('lucia'); const p = A.page;
    await avance(p, 'b4');
    const tj = await p.evaluate(() => { const t = document.getElementById('a2Rap'); return { hay: !!t, mot: !!document.getElementById('a2RapMot'), filas: t ? t.querySelectorAll('.a2r-f[data-q^="p:"]').length : 0, cfg: !!document.querySelector('[data-a2r="cfgMot"]'), arriba: t && t.compareDocumentPosition(document.querySelector('#a2App .a2-rubros')) & 4 }; });
    c(tj.hay && !tj.mot && tj.filas >= 8 && !tj.cfg && tj.arriba, '«✏ Carga rápida» arriba de los rubros, una fila por paso, sin pedir motivo (la oficina no ve el ajuste) · ' + JSON.stringify(tj));
    await foto(p, 'carga_rapida', '#a2Rap');
    await listo(p, 'p:izaje', 10);
    const ct = await cartel(p);
    c(/Marcar 10 izadas también marca pozo y hormigón de esas 10 \(ya fraguado\)/.test(ct) && /Sí/.test(ct) && /Solo el izaje/.test(ct), 'el cartel de la cascada: «' + ct + '»');
    c(await p.evaluate(() => document.getElementById('a2Rc').getAttribute('role') === 'status'), 'el cartel es role=status');
    let d = await db(p);
    c(!(d.avanceObras.b4.av2), 'antes del «Sí» no se escribió nada');
    await foto(p, 'cartel_cascada', '#a2Rap');
    await si(p);
    const r0 = await p.evaluate(() => { const E = window.__av2.estado('b4'), g = (a) => E.L.cols.map((c, i) => E.R[a + '|' + i].e === 'mano' ? 1 : 0).join(''); return { iz: g('izaje'), po: g('pozo'), ho: g('horm'), frag: window.__av2.alertas(E).frag.length, pct: E.pct, glob: calcularAvanceEtapasPct(avanceObras.find((o) => o.id === 'b4')) }; });
    c(r0.iz === '111111111100' && r0.po === '111111111100' && r0.ho === '111111111100' && r0.frag === 0, 'Col 1–10 quedan izadas con pozo y hormigón (sin fraguar) · ' + JSON.stringify(r0));
    c(r0.pct > 0 && r0.glob === r0.pct, 'el % se mueve (y es el de toda la app): ' + r0.pct + ' %');
    const ct2 = await cartel(p);
    c(/la obra pasó de 0 % a \d+ %/.test(ct2) && /Deshacer/.test(ct2), 'cartel con el resultado y «↶ Deshacer»: «' + ct2 + '»');
    d = await db(p);
    const m = ((d.avanceObras.b4.av2 || {}).m) || {}, ks = Object.keys(m);
    c(ks.length === 30 && ks.every((k) => m[k].e === 'si' && m[k].motivo === 'Carga rápida del avance' && m[k].por === 'lucia@ema-alumbrado.app') && m.c_horm_COL1.fragOk === true && !m.c_horm_COL1.hormTs, 'en la base: 30 claves (10 × 3) con el motivo «Carga rápida del avance», quién, y el hormigón sin fraguado');
    c(((d.avanceObras.b4.av2 || {}).hist || []).length === 1 && (d.avanceObras.b4.avanceHist || []).some((x) => x.av2 && /Carga rápida/.test(x.motivo) && x.despues === r0.pct), 'queda en av2.hist y en avanceHist (antes → después)');
    // deshacer
    await p.click('#a2Rc [data-a2r="deshacer"]'); await p.waitForTimeout(1300);
    d = await db(p);
    const r1 = await p.evaluate(() => window.__av2.estado('b4').pct);
    c(r1 === 0 && Object.keys(((d.avanceObras.b4.av2 || {}).m) || {}).length === 0 && /Deshacer/.test((((d.avanceObras.b4.av2 || {}).hist || []).slice(-1)[0] || {}).motivo || ''), '«↶ Deshacer»: vuelve al 0 %, borra las claves y queda en el historial · ' + r1 + ' · ' + (await cartel(p)));
    // «Solo el izaje»
    await listo(p, 'p:izaje', 10); await si(p, 'solo');
    const r2 = await p.evaluate(() => { const E = window.__av2.estado('b4'); return { iz: window.__av2.estado('b4').L.cols.filter((c, i) => E.R['izaje|' + i].e === 'mano').length, po: E.L.cols.filter((c, i) => E.R['pozo|' + i].e !== 'falta').length }; });
    c(r2.iz === 10 && r2.po === 0, '«Solo el izaje»: 10 izadas y el pozo sigue faltando · ' + JSON.stringify(r2));
    // «Todas» los pozos y 8 hormigones con − / +
    await p.click('#a2Rap [data-a2r="todas"][data-q="p:pozo"]'); await p.waitForTimeout(300);
    c(await p.evaluate(() => document.querySelector('#a2Rap input[data-a2rn="p:pozo"]').value === '12' && !document.querySelector('#a2Rap .a2r-listo[data-q="p:pozo"]').hidden), '«Todas» pone 12 y aparece «Listo»');
    await p.click('#a2Rap .a2r-listo[data-q="p:pozo"]'); await p.waitForTimeout(1300);
    c((await cuenta(p, 'b4', 'pozo')) === 12 && !(await cartel(p)).match(/también marca/), 'pozo: 12 de 12, sin preguntar (no tiene pasos antes)');
    for (let i = 0; i < 9; i++) { await p.click('#a2Rap [data-a2r="mas"][data-q="p:horm"]'); await p.waitForTimeout(120); }
    await p.click('#a2Rap [data-a2r="menos"][data-q="p:horm"]'); await p.waitForTimeout(150);
    const lt = await p.evaluate(() => document.querySelector('#a2Rap .a2r-listo[data-q="p:horm"]').textContent);
    c(/marcar 8 más \(quedan 8\)/.test(lt), '− / +: «' + lt + '»');
    await p.click('#a2Rap .a2r-listo[data-q="p:horm"]'); await p.waitForTimeout(1300);
    c((await fila(p, 'b4', 'horm')) === 'mano,mano,mano,mano,mano,mano,mano,mano,falta,falta,falta,falta', '«8 de 12»: las primeras 8 columnas con hormigón, en orden');
    // bajar el izaje con un vínculo después
    await listo(p, 'p:vinc', 2);
    const cv = await cartel(p);
    c((await fila(p, 'b4', 'vinc')).startsWith('mano,mano,falta') && !/también marca/.test(cv), '2 vínculos: sin preguntar (pozo, hormigón e izaje ya están) · ' + cv);
    await listo(p, 'p:izaje', 8);
    c((await cuenta(p, 'b4', 'izaje')) === 8 && !/siguen/.test(await cartel(p)), 'izaje 10 → 8: saca las últimas dos (sin pasos después) sin preguntar');
    await listo(p, 'p:izaje', 1);
    const cb = await cartel(p);
    c(/Sacar 7 izajes\. ¿También sacás los pasos que siguen \(vínculo\) de esa columna\?/.test(cb), 'izaje 8 → 1: «' + cb + '»');
    await si(p);
    c((await fila(p, 'b4', 'izaje')).startsWith('mano,falta') && (await fila(p, 'b4', 'vinc')).startsWith('mano,falta'), '«Sí, también»: la Col 2 sin izaje ni vínculo; la Col 1 sigue');
    c(!(await p.$('#aaMotOv')) && !(await p.$('#a2Ov')), 'nunca apareció la hoja del motivo');
    c((await scrollX(p)) <= 0, 'sin scroll de costado');
    c(!errsJs(A).length, 'sin errores de JS ' + JSON.stringify(errsJs(A).slice(0, 3)));
    await A.ctx.close();
  }

  // ================================================================= 1) la grilla: tocar marca
  if (SOLO('1')) {
    const A = await sesion('lucia'); const p = A.page;
    await avance(p, 'b4');
    const bt = await p.evaluate(() => { const b = document.querySelector('#a2App .a2-grilla [data-a2r="toque"]'); return b ? b.textContent : ''; });
    c(/Tocar marca: Sí/.test(bt), 'en la grilla «✏ Tocar marca: Sí» de entrada');
    await tocarCel(p, 'izaje', 11); await p.waitForTimeout(400);
    const ct = await cartel(p);
    c(/Col 12 izada también marca pozo y hormigón de esa columna/.test(ct) && !(await p.$('#a2Ov')), 'tocar el izaje de la Col 12 (sin hoja): «' + ct + '»');
    await si(p);
    c((await p.evaluate(() => { const E = window.__av2.estado('b4'); return ['pozo', 'horm', 'izaje'].map((a) => E.R[a + '|11'].e).join(); })) === 'mano,mano,mano', 'queda izada con pozo y hormigón');
    await foto(p, 'grilla_tocar', '#a2App .a2-grilla');
    await tocarCel(p, 'izaje', 11); await p.waitForTimeout(1300);
    c((await p.evaluate(() => window.__av2.estado('b4').R['izaje|11'].e)) === 'falta' && /sacar izaje/.test(await cartel(p)), 'tocarla de nuevo la saca (sin pasos después, sin preguntar) · ' + (await cartel(p)));
    await tocarCel(p, 'pozo', 0); await p.waitForTimeout(1300);
    c((await p.evaluate(() => window.__av2.estado('b4').R['pozo|0'].e)) === 'mano' && !(await p.$('#a2Ov')), 'tocar el pozo de la Col 1: marcado al toque');
    // mantener apretado: la hoja de la celda
    await p.evaluate(() => { const c = document.getElementById('a2Rc'); c && (c.hidden = true); document.querySelector('#a2App .a2-grilla [data-a2="cel"][data-p="horm"][data-i="2"]').scrollIntoView({ block: 'center' }); }); await p.waitForTimeout(300);
    const b = await p.$('#a2App .a2-grilla [data-a2="cel"][data-p="horm"][data-i="2"]'); const bb = await b.boundingBox();
    await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.mouse.down(); await p.waitForTimeout(650); await p.mouse.up(); await p.waitForTimeout(500);
    c(!!(await p.$('#a2Ov')) && (await p.evaluate(() => window.__av2.estado('b4').R['horm|2'].e)) === 'falta', 'mantener apretado abre la hoja de la celda (no marca)');
    c(!(await p.$('#a2Ov #a2Mot')), 'y la hoja no pide motivo');
    await p.click('#a2Ov [data-a2="x"]'); await p.waitForTimeout(300);
    await p.click('#a2App [data-a2r="toque"]'); await p.waitForTimeout(400);
    await tocarCel(p, 'horm', 3); await p.waitForTimeout(500);
    c(!!(await p.$('#a2Ov')) && (await p.evaluate(() => window.__av2.estado('b4').R['horm|3'].e)) === 'falta', '«Tocar marca: No»: tocar abre la hoja como antes');
    await p.click('#a2Ov [data-a2="x"]'); await p.waitForTimeout(200);
    await p.click('#a2App [data-a2r="toque"]'); await p.waitForTimeout(300);
    c((await scrollX(p)) <= 0, 'sin scroll de costado');
    c(!errsJs(A).length, 'sin errores de JS ' + JSON.stringify(errsJs(A).slice(0, 3)));
    await A.ctx.close();
  }

  // ================================================================= 2) Bulevares: las órdenes encima
  if (SOLO('2')) {
    const A = await sesion('lucia'); const p = A.page;
    await avance(p, 'b1');
    const antes = await p.evaluate(() => { const E = window.__av2.estado('b1'), g = (a, i) => E.R[a + '|' + i]; return { iz: [0, 1, 2, 3, 4].map((i) => g('izaje', i).e + ':' + g('izaje', i).ot).join(), h7: g('horm', 6).e, a2: g('artef', 1).e, k: window.__avRap.cuentaPaso(E, 'izaje') }; });
    c(antes.k.min === 5 && antes.k.n === 5 && antes.k.max === 12, 'izaje: «5 de 12 · 5 de órdenes» (no se puede bajar de 5) · ' + JSON.stringify(antes.k));
    await p.click('#a2Rap [data-a2r="todas"][data-q="p:izaje"]'); await p.waitForTimeout(300);
    await p.click('#a2Rap .a2r-listo[data-q="p:izaje"]'); await p.waitForTimeout(500);
    const ct = await cartel(p);
    c(/Marcar 7 izadas también marca pozo y hormigón de 3 de ellas/.test(ct), 'cascada solo donde falta (Col 10–12): «' + ct + '»');
    await si(p);
    const ct2 = await cartel(p);
    const desp = await p.evaluate(() => { const E = window.__av2.estado('b1'), g = (a, i) => E.R[a + '|' + i]; return { iz: [0, 1, 2, 3, 4].map((i) => g('izaje', i).e + ':' + g('izaje', i).ot).join(), iz6: [5, 6, 7, 8, 9, 10, 11].map((i) => g('izaje', i).e).join(), h7: [6, 7, 8].map((i) => g('horm', i).e).join(), h10: [9, 10, 11].map((i) => g('horm', i).e).join(), p12: g('pozo', 11).e, a2: g('artef', 1).e }; });
    c(desp.iz === antes.iz && desp.h7 === 'frag,frag,frag' && desp.a2 === antes.a2 && desp.iz6 === 'mano,mano,mano,mano,mano,mano,mano' && desp.h10 === 'mano,mano,mano' && desp.p12 === 'mano', 'lo de las órdenes no se toca (izadas Col 1–5, hormigón fraguando Col 7–9, falla Col 2); se suma lo que faltaba · ' + JSON.stringify(desp));
    c(/fraguando \(quedó marcado igual\)/.test(ct2), 'y avisa el fraguado sin frenar: «' + ct2 + '»');
    // tocar una celda que viene de una orden: la hoja de siempre
    await tocarCel(p, 'izaje', 0); await p.waitForTimeout(500);
    c(!!(await p.$('#a2Ov')) && /OT-2026-302/.test(await p.evaluate(() => document.getElementById('a2Ov').textContent)), 'tocar una celda de una orden abre la hoja (no la desmarca)');
    await p.click('#a2Ov [data-a2="x"]'); await p.waitForTimeout(250);
    // una orden cerrada nueva sobre la Col 6 (ya marcada a mano): no cuenta dos veces
    const x0 = await pctX(p, 'b1');
    await p.evaluate(() => { const f = fechaAISO(new Date()), t = Date.now() - 3600e3; return firebase.firestore().collection('ordenesTrabajo').doc('o470').set({ numero: 'OT-2026-470', fecha: f, plazaId: 'b1', plazaNombre: 'PLAZA BULEVARES', obraId: '4019', personal: [{ nombre: 'Juan Pérez', rol: 'Oficial' }, { nombre: 'Pedro Gómez', rol: 'Ayudante' }], personalNombres: ['juan perez', 'pedro gomez'], actividades: ['montaje_prfv'], previsto: { montaje_prfv: 1 }, estado: 'Terminada', creado: t, campo: { pasosObra: { montaje_prfv: { 'col 6': { num: 'Col 6', ini: '08:00', fin: '09:00', estado: 'si', por: 'Juan Pérez', ts: t, min: 60 } } } }, cierre: { cerradoTs: Date.now(), fecha: f, cantidades: { montaje_prfv: 1 }, horas: 8, avanceItems: [] } }); });
    await p.waitForTimeout(2500);
    const x1 = await pctX(p, 'b1'), i6 = await p.evaluate(() => { const r = window.__av2.estado('b1').R['izaje|5']; return r.e + ':' + (r.ot || ''); });
    c(Math.abs(x1 - x0) < 0.01 && /^ver:OT-2026-470/.test(i6), 'la orden nueva pasa a ser la fuente de la Col 6, sin contar dos veces: ' + x0 + ' → ' + x1 + ' · ' + i6);
    c(!errsJs(A).length, 'sin errores de JS ' + JSON.stringify(errsJs(A).slice(0, 3)));
    await A.ctx.close();
  }

  // ================================================================= 3) el ajuste de Administración
  if (SOLO('3')) {
    const A = await sesion('admin'); const p = A.page;
    await avance(p, 'b4');
    const cfg = await p.evaluate(() => [...document.querySelectorAll('#a2Rap [data-a2r="cfgMot"]')].map((b) => b.textContent + ':' + b.getAttribute('aria-pressed')).join(' | '));
    c(/No \(por ahora\):true/.test(cfg) && /Sí:false/.test(cfg), 'Administración ve «Pedir motivo al cambiar el avance a mano: No (por ahora)» elegido · ' + cfg);
    await foto(p, 'ajuste_motivo', '.a2r-cfg');
    await p.click('#a2Rap [data-a2r="cfgMot"][data-v="1"]'); await p.waitForTimeout(1200);
    let d = await db(p);
    c(((d.configEquipo || {}).baremo || {}).avanceMotivo === true && !!(await p.$('#a2RapMot')), '«Sí»: se guarda configEquipo/baremo.avanceMotivo y la tarjeta pide el motivo');
    await listo(p, 'p:pozo', 3);
    const ct = await cartel(p);
    d = await db(p);
    c(/Escribí el motivo/.test(ct) && !(d.avanceObras.b4.av2), 'sin motivo no se guarda: «' + ct + '»');
    await p.fill('#a2RapMot', 'Lo vi en obra');
    await listo(p, 'p:pozo', 3); await p.waitForTimeout(900);
    d = await db(p);
    const m = ((d.avanceObras.b4.av2 || {}).m) || {};
    c((await cuenta(p, 'b4', 'pozo')) === 3 && m.c_pozo_COL1 && m.c_pozo_COL1.motivo === 'Lo vi en obra', 'con el motivo, se guarda con ese motivo');
    await p.click('#a2App .a2-tira [data-a2="col"][data-i="5"]'); await p.waitForTimeout(400);
    c(!!(await p.$('#a2Ov #a2Mot')), 'la hoja de la columna vuelve a pedir el motivo');
    await p.click('#a2Ov [data-a2="completa"]'); await p.waitForTimeout(700);
    c(/Escribí el motivo/.test(await p.evaluate(() => (document.getElementById('a2HMsg') || {}).textContent || '')), '«Columna completa» sin motivo: «Escribí el motivo»');
    await p.click('#a2Ov [data-a2="x"]'); await p.waitForTimeout(250);
    const it = await p.evaluate(() => new Promise((res) => { const o = avanceObras.find((x) => x.id === 'b1'); let r = null; window.__auditAvance.pedirMotivo(o, '5', 0, 1, (m) => { r = m; }); setTimeout(() => { const ov = !!document.getElementById('aaMotOv'); const el = document.getElementById('aaMotOv'); el && el.remove(); res({ r, ov }); }, 300); }));
    c(it.ov && it.r === null, 'el ítem por ítem del itemizado (v156) también pide el motivo (#aaMotOv) · ' + JSON.stringify(it));
    await p.click('#a2Rap [data-a2r="cfgMot"][data-v="0"]'); await p.waitForTimeout(1200);
    d = await db(p);
    const it2 = await p.evaluate(() => new Promise((res) => { const o = avanceObras.find((x) => x.id === 'b1'); let r = null; window.__auditAvance.pedirMotivo(o, '5', 0, 1, (m) => { r = m; }); setTimeout(() => res({ r, ov: !!document.getElementById('aaMotOv') }), 300); }));
    c(((d.configEquipo || {}).baremo || {}).avanceMotivo === false && !(await p.$('#a2RapMot')) && !it2.ov && it2.r === 'Carga rápida del avance', '«No (por ahora)»: sin motivo otra vez, también el ítem por ítem («Carga rápida del avance») · ' + JSON.stringify(it2));
    c((await p.evaluate(() => (JSON.parse(localStorage.getItem('stub.db')).auditoria ? Object.values(JSON.parse(localStorage.getItem('stub.db')).auditoria).filter((a) => a.accion === 'avance_motivo_cfg').length : 0))) >= 2, 'el cambio del ajuste queda en la auditoría');
    c(!errsJs(A).length, 'sin errores de JS ' + JSON.stringify(errsJs(A).slice(0, 3)));
    await A.ctx.close();
  }

  // ================================================================= 4) lo que no va por columna
  if (SOLO('4')) {
    const A = await sesion('lucia'); const p = A.page;
    await avance(p, 'b4');
    await p.click('#a2Rap details.a2r-dd:not(.a2r-ddp) > summary'); await p.waitForTimeout(300);
    const z0 = await p.evaluate(() => { const E = window.__av2.estado('b4'), x = E.L.cosas.find((c) => c.id === 'zanja'); return { h: E.RC.zanja.h, tot: x.tot }; });
    await listo(p, 'k:zanja', 100); await p.waitForTimeout(900);
    const z1 = await p.evaluate(() => window.__av2.estado('b4').RC.zanja.h);
    let d = await db(p);
    c(z0.h === 0 && z1 === 100 && d.avanceObras.b4.av2.m.k_zanja.e === 'cant' && d.avanceObras.b4.av2.m.k_zanja.cant === 100, 'zanja: «100 de ' + z0.tot + ' m» con «Listo» (k_zanja cant 100)');
    c(await p.evaluate(() => document.querySelector('#a2Rap details.a2r-dd:not(.a2r-ddp)').open), 'la lista sigue abierta después del cambio');
    await p.click('#a2Rap [data-a2r="bin"][data-id="replanteo"]'); await p.waitForTimeout(1200);
    c((await p.evaluate(() => window.__av2.estado('b4').RC.replanteo.h)) === 1, 'replanteo (de una vez): «Marcar hecho» con un toque');
    await foto(p, 'sin_columna', '#a2Rap details.a2r-dd:not(.a2r-ddp)');
    await p.click('#a2Rc [data-a2r="deshacer"]'); await p.waitForTimeout(1300);
    d = await db(p);
    c((await p.evaluate(() => window.__av2.estado('b4').RC.replanteo.h)) === 0 && !d.avanceObras.b4.av2.m.k_replanteo && d.avanceObras.b4.av2.m.k_zanja.cant === 100, '«↶ Deshacer» saca solo el último cambio (el replanteo); la zanja queda');
    c((await scrollX(p)) <= 0, 'sin scroll de costado');
    c(!errsJs(A).length, 'sin errores de JS ' + JSON.stringify(errsJs(A).slice(0, 3)));
    await A.ctx.close();
  }

  // ================================================================= 5) quién no puede
  if (SOLO('5')) {
    for (const quien of ['dir', 'mir', 'pan']) {
      const A = await sesion(quien); const p = A.page;
      await avance(p, 'b4');
      const r = await p.evaluate(() => { const b = document.querySelector('#a2App [data-a2="cel"]'); return { tj: !!document.getElementById('a2Rap'), toque: !!document.querySelector('[data-a2r="toque"]'), celda: b ? window.__avRap.celda(b) : 'sin grilla' }; });
      c(!r.tj && !r.toque && r.celda !== true, (quien === 'dir' ? 'Dirección' : quien === 'mir' ? '«Solo mirar»' : 'Pañol') + ': sin «✏ Carga rápida» ni «Tocar marca» · ' + JSON.stringify(r));
      await A.ctx.close();
    }
    const B = await sesion('juan', { cel: true }); const q = B.page;
    const v = await q.evaluate(() => ({ html: window.__avRapHtml(window.__av2.estado('b4')), puede: window.__av2.puede() }));
    c(!v.html && !v.puede, 'la cuadrilla tampoco · ' + JSON.stringify(v).slice(0, 80));
    await B.ctx.close();
  }

  // ================================================================= 6) compatibilidad (__v170No)
  if (SOLO('6')) {
    const A = await sesion('lucia', { v170: false }); const p = A.page;
    await avance(p, 'b4');
    const r = await p.evaluate(async () => { const P = window.__av2.planMarcar({ obra: 'b4', columnas: ['Col 1'], pasos: ['pozo'], accion: 'marcar' }); const x = await window.__av2.aplicar(P, ''); window.__av2.abrirColumna('b4', 0); return { tj: !!document.getElementById('a2Rap'), toque: !!document.querySelector('[data-a2r="toque"]'), ok: x.ok, txt: x.txt, mot: !!document.querySelector('#a2Ov #a2Mot'), pide: window.__avMotivoPide() }; });
    c(!r.tj && !r.toque && !r.ok && /motivo/.test(r.txt) && r.mot && r.pide, 'con __v170No: sin tarjeta ni «Tocar marca», el motivo obligatorio como en la v169 · ' + JSON.stringify(r));
    await A.ctx.close();
  }
  if (browser) await browser.close();
  return c.fin ? c.fin() : null;
})();
