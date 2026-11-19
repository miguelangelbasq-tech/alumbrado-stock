// v173 · La orden por PERSONA y por TIEMPO (Ángel 18/11).
//  0) tarea repartida (✂) = cada uno lo suyo: Pablo y Pedro en dos páginas del mismo celu (base compartida). ANTES=1 contra
//     la v172 reproduce lo de Ángel (los dos ven las mismas 5 unidades, la foto del otro cuenta como suya, la excavación muestra
//     las 10 columnas). Ahora: Pablo Col 1–5, Pedro Col 6–10 (armado: 5 cada uno, distintas), solo sus fotos, «N de 5», su
//     «Voy a iniciar», su envío; la oficina ve «Pablo 3 de 5 · N min · Pedro 5 de 5» (📸 Avance, verificación) y el cierre
//     precarga lo de cada uno.
//  1) Llenar orden (oficina): 4 personas 08:00–16:00, Pablo y Pedro «hasta 14:00» → ot.horario; resumen, «Quién hace qué»,
//     hoja impresa; «➗ Dividir en partes iguales».
//  2) la cuadrilla ve SU horario (Modo obra › La orden y Mis tareas).
//  3) cierre: precarga 6 h / 8 h y los puntos salen distintos por rol × horas (puntosDeOrden, la cuenta exacta); el auditor
//     dice «trabajó de 08:00 a 14:00 (horario de la orden)».
//  4) asistente (Worker simulado): «Pablo hace el pozo de Col 3 y 4, Pedro y Juan el izaje; Pablo y Pedro hasta las 2, los demás
//     hasta las 16» → tarjeta y orden emitida por tarea (asignada, equipoTarea, columnas) y horario; «armar 10 luminarias, 5 Pablo
//     y 5 Pedro» → reparto; proponer_editar_orden con horario y quiénes. ANTES=1: no hay quienes/horario (todos en todo).
//  5) cierre por voz con «hasta las 2» → 6 h.
//  6) __v173No: como la v172 · REGLAS=1: la cuadrilla no puede cambiar el horario de la orden.
const fs = require('fs');
const { abrir, prueba } = require('./h');
const { datos173 } = require('./datos173');
const cel = process.argv[2] === 'cel';
const CAP = process.env.CAP || '';
const ANTES = !!process.env.ANTES;
const REGLAS = !!process.env.REGLAS;
const SOLO = (x) => !process.env.SOLO || process.env.SOLO.split(',').indexOf(String(x)) >= 0;
const W = 'https://ema-ia.mdiaz-60f.workers.dev';
(async () => {
  const c = prueba('v173' + (cel ? ' cel' : '') + (ANTES ? ' ANTES' : '') + (REGLAS ? ' REGLAS' : ''));
  const MOD = { crew: true, nav: true, mtNuevo: true, tarjetas: true, ofPasos: true, porPartes: true, https: true, inicio: true, sugerida: true, iaPro: true, v145: true, v146: true, v147: true, v150: true, v151: true, v152: true, v153: true, v154: true, v155: true, v156: true, v157: true, v158: true, v159: true, v160: true, v161: true, v163: true, v164: true, v165: true, v166: true, v167: true, v168: true, v170: true, v171: true, v172: true, v173: !ANTES, reglas: REGLAS, antes: () => { window.__pmPausa = true; window.__cvSinMic = true; window.__hvPausa = true; window.__isNoAuto = true; window.__aaPausa = true; } };
  let browser = null;
  const sesion = async (quien, op, datos) => {
    const crew = /pablo|pedro|juan/.test(quien);
    const A = await abrir(Object.assign({ sesion: quien, datos: datos || datos173(), browser, espera: 4500 }, MOD, { cel: crew ? true : cel }, op || {})); browser = A.browser;
    A.page.on('dialog', (x) => x.accept());
    await A.ctx.grantPermissions(['geolocation', 'camera'], { origin: 'https://app.test' }); await A.ctx.setGeolocation({ latitude: -31.4271, longitude: -64.1889, accuracy: 8 });
    await A.page.waitForTimeout(900); return A;
  };
  const otra = async (A, quien) => { const B = await abrir(Object.assign({ sesion: quien, browser: A.browser, ctx: A.ctx, espera: 4500 }, MOD, { cel: true })); B.page.on('dialog', (x) => x.accept()); await B.page.waitForTimeout(900); return B; };
  const foto = async (p, n, sel) => { if (!CAP) return; fs.mkdirSync(CAP, { recursive: true }); if (sel) await p.evaluate((s) => { const e = document.querySelector(s); e && e.scrollIntoView({ block: 'center' }); }, sel); await p.waitForTimeout(300); await p.screenshot({ path: CAP + '/' + n + '_' + (cel ? 'cel' : 'pc') + '.png' }); };
  const errsJs = (A) => (A.errores || []).filter((e) => !/Missing or insufficient permissions|permission-denied|ERR_|Failed to fetch|aborted|fetching the script|prueba|sin permiso|Sin permiso|unsupported MIME/i.test(e));
  const tx = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; }, sel);
  const db = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('stub.db') || '{}'));
  const scrollX = (p) => p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  const unid = (p, k) => p.evaluate((k) => { const u = window.__cuadrillaDia.unidades('ot173', k); return u ? u.items.map((i) => i.num + (i.foto || i.paso ? '✓' : '')).join(',') : ''; }, k);
  const mtFilas = async (p) => {
    await p.evaluate(() => mostrarVista('mistareas')); await p.waitForTimeout(1300);
    if (!(await p.$('#mtApp .mt-ot[data-ot="ot173"] .mt-tarea'))) { await p.click('.mt-item[data-mtabrir="ot173"]').catch(() => { }); await p.waitForTimeout(1200); }
    return p.evaluate(() => { const o = {}; document.querySelectorAll('#mtApp .mt-ot[data-ot="ot173"] .mt-tarea[data-k]').forEach((t) => { o[t.dataset.k] = { cuenta: ((t.querySelector('.fl-cuenta') || {}).textContent || '').trim(), filas: [...t.querySelectorAll('.fl-fila')].map((f) => { const b = f.querySelector('.fl-nom-btn b'); if (b) return b.textContent.trim(); const n = f.querySelector('.fl-nom'); if (!n) return ''; const x = n.cloneNode(true); x.querySelectorAll('small').forEach((s) => s.remove()); return x.textContent.replace(/[✅\s]+/g, ' ').trim(); }) }; }); return o; });
  };
  // una foto de una columna, como la deja la app (orden + hora de la columna v157)
  const fotoCol = (p, k, num, hm) => p.evaluate(([k, num, hm]) => {
    const o = ordenesTrabajo.find((x) => x.id === 'ot173'), yo = window.__mtAPI.persona(), hoy = fechaAISO(new Date()), t = new Date(hoy + 'T' + hm + ':00').getTime();
    const cat = window.catFotoDeTarea(ACTIVIDADES_CATALOGO.find((x) => x.id === k).label), id = 'f' + Math.random().toString(36).slice(2, 9);
    window.__tcAhora = () => t;
    window.__mtAPI.guardar(o, { ['campo.fotos.' + id]: { por: yo, ts: t, k, tarea: k, cat, num, mini: '' } });
    try { window.__tiempoCol.marcar(o, k, num, t, 'foto'); } catch (e) { }
    return id;
  }, [k, num, hm]);
  const otDb = async (p, id) => (await db(p)).ordenesTrabajo[id || 'ot173'];

  // ================================================================= 0) la tarea repartida: cada uno lo suyo
  if (SOLO(0)) {
    const A = await sesion('pablo'), p = A.page;
    const B = await otra(A, 'pedro'), q = B.page;
    const uP = { exc: await unid(p, 'excavacion'), arm: await unid(p, 'armado_luminaria') }, uQ = { exc: await unid(q, 'excavacion'), arm: await unid(q, 'armado_luminaria') };
    if (ANTES) {
      c(uP.exc.split(',').length === 10 && uP.arm === uQ.arm, 'ANTES (v172): Pablo en Modo obra ve las 10 columnas de la excavación (le tocan 5) y Pablo y Pedro ven las MISMAS 5 luminarias · ' + uP.exc + ' · ' + uP.arm + ' / ' + uQ.arm);
      await fotoCol(q, 'excavacion', 'Col 6', '08:40'); await p.waitForTimeout(1500);
      const mt = await mtFilas(p);
      c(/^1 de 5/.test(mt.excavacion.cuenta) && mt.excavacion.filas[0] === 'Col 6', 'ANTES (v172): la foto de Pedro (Col 6) le cuenta a Pablo en Mis tareas («1 de 5») · ' + JSON.stringify(mt.excavacion));
      await browser.close(); process.exit(c.fin() ? 1 : 0);
    }
    c(uP.exc === 'Col 1,Col 2,Col 3,Col 4,Col 5' && uQ.exc === 'Col 6,Col 7,Col 8,Col 9,Col 10', 'Modo obra › excavación repartida con las columnas de la orden: Pablo Col 1–5, Pedro Col 6–10 · ' + uP.exc + ' / ' + uQ.exc);
    const aP = uP.arm.split(','), aQ = uQ.arm.split(',');
    c(aP.length === 5 && aQ.length === 5 && !aP.some((x) => aQ.indexOf(x) >= 0), 'armado de luminaria 10 = 5 + 5: cada uno ve 5 unidades, distintas · ' + uP.arm + ' / ' + uQ.arm);
    // Pablo hace 3 pozos, Pedro 5 (con foto y hora)
    await p.evaluate(() => { window.__tcAhora = () => new Date(fechaAISO(new Date()) + 'T08:10:00').getTime(); });
    for (const [n, h] of [['Col 1', '08:40'], ['Col 2', '09:12'], ['Col 3', '09:50']]) { await fotoCol(p, 'excavacion', n, h); await p.waitForTimeout(250); }
    for (const [n, h] of [['Col 6', '08:35'], ['Col 7', '09:05'], ['Col 8', '09:33'], ['Col 9', '10:02'], ['Col 10', '10:30']]) { await fotoCol(q, 'excavacion', n, h); await p.waitForTimeout(250); }
    await p.waitForTimeout(1800);
    const u2 = await unid(p, 'excavacion'), u2q = await unid(q, 'excavacion');
    c(u2 === 'Col 1✓,Col 2✓,Col 3✓,Col 4,Col 5' && u2q === 'Col 6✓,Col 7✓,Col 8✓,Col 9✓,Col 10✓', 'después de las fotos: Pablo 3 de sus 5 (las de Pedro no le cuentan), Pedro sus 5 · ' + u2 + ' / ' + u2q);
    const mt = await mtFilas(p), mtq = await mtFilas(q);
    c(/^3 de 5/.test(mt.excavacion.cuenta) && mt.excavacion.filas.join() === 'Col 1,Col 2,Col 3,Col 4,Col 5', 'Mis tareas (la lista) de Pablo: «3 de 5» y solo sus filas Col 1–5 · ' + JSON.stringify(mt.excavacion));
    c(/^5 de 5/.test(mtq.excavacion.cuenta) && mtq.excavacion.filas.join() === 'Col 6,Col 7,Col 8,Col 9,Col 10', 'Mis tareas de Pedro: «5 de 5» con Col 6–10 · ' + JSON.stringify(mtq.excavacion));
    c(mt.armado_luminaria && /^0 de 5/.test(mt.armado_luminaria.cuenta) && mt.armado_luminaria.filas.length === 5, 'armado de luminaria en Mis tareas de Pablo: «0 de 5» con 5 filas · ' + JSON.stringify(mt.armado_luminaria));
    await foto(p, '0_mis_tareas_pablo');
    // «Voy a iniciar» y envío: lo de Pedro no es de Pablo
    const ini = await q.evaluate(() => { const o = ordenesTrabajo.find((x) => x.id === 'ot173'); window.__mtAPI.guardar(o, { 'campo.tareaInicio.armado_luminaria.pedro gomez': { ts: Date.now(), por: 'Pedro Gómez', v: 165 }, 'campo.tareaEnv.excavacion.Pedro Gómez': { estado: 'si', ts: Date.now(), por: 'Pedro Gómez' } }); return true; });
    await p.waitForTimeout(1600);
    const r = await p.evaluate(() => { const o = ordenesTrabajo.find((x) => x.id === 'ot173'); const ps = window.__cuadrillaDia.pasoActual('ot173') || {}; return { ini: !!window.__inicioTarea.inicioDe(o, 'armado_luminaria'), paso: ps.p ? ps.p.k : '' }; });
    const rq = await q.evaluate(() => { const o = ordenesTrabajo.find((x) => x.id === 'ot173'); return { ini: !!window.__inicioTarea.inicioDe(o, 'armado_luminaria') }; });
    c(ini && !r.ini && rq.ini, '«Voy a iniciar» de Pedro en el armado no le marca el inicio a Pablo (cada uno el suyo) · Pablo ' + r.ini + ' / Pedro ' + rq.ini);
    c(r.paso === 'armado_luminaria' || r.paso === 'excavacion', 'Modo obra de Pablo sigue con sus tareas aunque Pedro mandó la suya · paso ' + r.paso);
    const pa = await p.evaluate(() => { const ps = window.__cuadrillaDia.pasoActual('ot173'); return ps && ps.p ? ps.p.k + ' ' + (ps.it ? ps.it.num : '') : ''; });
    c(/excavacion Col 4|armado_luminaria/.test(pa), 'el paso de Pablo es lo suyo (no lo de Pedro) · ' + pa);
    // la oficina
    const L = await abrir(Object.assign({ sesion: 'lucia', browser: A.browser, ctx: A.ctx, espera: 4500 }, MOD, { cel: true })); const o = L.page; o.on('dialog', (x) => x.accept());
    await o.waitForTimeout(2000);
    const of = await o.evaluate(() => { const ot = ordenesTrabajo.find((x) => x.id === 'ot173'); const d = document.createElement('div'); d.innerHTML = window.__cdOficinaHtml(ot); const r = d.querySelector('.rp173-of:last-of-type') || d; return [...d.querySelectorAll('.rp173-of')].map((x) => x.textContent).join(' | ').replace(/\s+/g, ' '); });
    c(/Excavaci[oó]n[^·]*· cada uno lo suyo/.test(of) && /Pablo\s*Col 1 a Col 5\s*3 de 5\s*105 min/.test(of) && /Pedro\s*Col 6 a Col 10\s*5 de 5\s*145 min/.test(of), '📸 Avance de la oficina: «Pablo Col 1 a Col 5 · 3 de 5 · N min» y «Pedro … 5 de 5» · ' + of.slice(0, 260));
    const mins = await o.evaluate(() => window.__rp173.progreso('ot173', 'excavacion').map((x) => x.nombre.split(' ')[0] + ' ' + x.hechas + ' ' + x.min));
    c(mins.join() === 'Pablo 3 105,Pedro 5 145', 'minutos de cada uno, cada uno desde lo suyo: Pablo 35 + 32 + 38 = 105 (llegó 08:05), Pedro 30 + 30 + 28 + 29 + 28 = 145 (antes la «columna anterior» de Pedro era la de Pablo) · ' + mins.join());
    const ver = await o.evaluate(() => window.__verifOt.verifOt('ot173').tareas.find((t) => t.k === 'excavacion').texto);
    c(/por persona: Pablo 3 de 5 · 105 min · Pedro 5 de 5 · 145 min/.test(ver), 'verificación (v150): por persona · ' + ver);
    await o.evaluate(() => { window.mostrarVista('parte'); window.abrirCierreOt('ot173'); }); await o.waitForTimeout(1500);
    const ci = await o.evaluate(() => [...document.querySelectorAll('#cierreCuerpo .cierre-qp[data-k="excavacion"]')].map((i) => i.dataset.n.split(' ')[0] + ' ' + i.value));
    c(ci.join() === 'Pablo 3,Pedro 5', 'cierre: «✂ Cuánto hizo cada uno» precargado con lo de sus columnas (Pablo 3, Pedro 5) · ' + ci.join());
    await foto(o, '0_cierre_repartida', '#cierreCuerpo .rp-cierre');
    await o.evaluate(() => window.cerrarCuadroCierre());
    c(errsJs(A).length === 0 && errsJs(B).length === 0 && errsJs(L).length === 0, 'sin errores' + (errsJs(A).concat(errsJs(B), errsJs(L)).slice(0, 2).join(' | ')));
    await A.ctx.close();
  }

  // ================================================================= 1) Llenar orden: el horario de cada uno y «Dividir en partes iguales»
  let emitida = null;
  if (SOLO(1) || SOLO(2) || SOLO(3)) {
    const L = await sesion('lucia'); const o = L.page;
    await o.evaluate(() => { window.mostrarVista('parte'); window.irSubOrdenes('nueva'); }); await o.waitForTimeout(700);
    await o.evaluate(() => { window.__ordenNueva.elegirObra('p2'); }); await o.waitForTimeout(1200);
    await o.evaluate(() => { const i = document.getElementById('otHoraInicio'), f = document.getElementById('otHoraFin'); i.value = '08:00'; f.value = '16:00'; [i, f].forEach((x) => { x.dispatchEvent(new Event('input', { bubbles: true })); x.dispatchEvent(new Event('change', { bubbles: true })); }); ['Pablo Picone', 'Pedro Gómez', 'Juan Pérez', 'Mario Díaz'].forEach((n) => window.__ordenNueva.sumarPersona(n)); });
    await o.waitForTimeout(1200);
    await o.evaluate(() => { try { window.__ordenNueva.ir(2); } catch (e) { } }); await o.waitForTimeout(500);
    const hb = await o.evaluate(() => { const b = document.getElementById('hpBox'); return b ? { filas: [...b.querySelectorAll('.hp-fila')].map((x) => x.dataset.hpf), t: b.querySelector('.hp-t').textContent } : null; });
    c(hb && hb.filas.length === 4 && /toda la jornada \(08:00 a 16:00\)/.test(hb.t), 'paso 2: «🕐 ¿Hasta qué hora está cada uno?» con las 4 personas (vacío = toda la jornada 08:00 a 16:00) · ' + JSON.stringify(hb));
    for (const n of ['Pablo Picone', 'Pedro Gómez']) { await o.evaluate((n) => { [...document.querySelectorAll('#hpBox [data-hpq="14"]')].find((b) => b.dataset.hpn === n).click(); }, n); await o.waitForTimeout(300); }
    const pie = await tx(o, '#hpBox .hp-pie');
    c(/Pablo y Pedro: 08:00 a 14:00/.test(pie) && /Juan y Mario: 08:00 a 16:00 \(toda la jornada\)/.test(pie), '«hasta 14:00» para Pablo y Pedro: «Pablo y Pedro: 08:00 a 14:00 · Juan y Mario: 08:00 a 16:00 (toda la jornada)» · ' + pie);
    await foto(o, '1_horario', '#hpBox');
    // tareas: excavación 4 repartida en partes iguales entre los 4 con «➗»; zanjeo para todos
    await o.evaluate(() => { try { window.__ordenNueva.ir(3); } catch (e) { } ['excavacion', 'zanjeo'].forEach((k) => { const cb = document.querySelector('#otActividades .ot-act-check[value="' + k + '"]'); if (cb && !cb.checked) cb.click(); }); }); await o.waitForTimeout(1200);
    await o.evaluate(() => { const i = document.querySelector('.ot-act-prev[data-id="excavacion"]'); i.value = '4'; i.dispatchEvent(new Event('input', { bubbles: true })); const z = document.querySelector('.ot-act-prev[data-id="zanjeo"]'); z.value = '20'; z.dispatchEvent(new Event('input', { bubbles: true })); const s = document.querySelector('.ot-act-quien[data-id="excavacion"]'); s.value = '__reparto__'; s.dispatchEvent(new Event('change', { bubbles: true })); }); await o.waitForTimeout(900);
    const ig = await o.evaluate(() => !!document.querySelector('.rp-caja [data-rp173="iguales"]'));
    c(ig, '«✂ Repartir» tiene «➗ Dividir en partes iguales»');
    await o.click('.rp-caja [data-rp173="iguales"]'); await o.waitForTimeout(500);
    const rpv = await o.evaluate(() => [...document.querySelectorAll('.rp-caja .rp-cant')].map((i) => i.dataset.n.split(' ')[0] + ' ' + i.value).join(', ') + ' | ' + document.querySelector('.rp-caja .rp-pie').textContent.trim());
    c(/Pablo 1, Pedro 1, Juan 1, Mario 1/.test(rpv) && /✓ justo/.test(rpv), '«➗»: 4 pozos → 1 cada uno («✓ justo») · ' + rpv);
    const res = await o.evaluate(() => { window.__ordenNueva.pintar && window.__ordenNueva.pintar(); return (document.getElementById('ofResumen') || {}).textContent || ''; });
    c(/Pablo y Pedro: 08:00 a 14:00/.test(res.replace(/\s+/g, ' ')), 'el resumen de la orden dice el horario · ' + res.replace(/\s+/g, ' ').slice(0, 200));
    const qh = await tx(o, '#eqResumen');
    c(/Pablo Picone · 🕐 08:00 a 14:00/.test(qh) && !/Juan Pérez · 🕐/.test(qh), '«📋 Quién hace qué» con la hora de salida del que se va antes · ' + qh.slice(0, 200));
    const r0 = await o.evaluate(() => { document.getElementById('otCuadrilla').value = 'Cuadrilla 2'; return window.datosOtDesdeFormulario(); });
    c(r0 && JSON.stringify(r0.horario) === JSON.stringify({ 'Pablo Picone': { desde: '08:00', hasta: '14:00' }, 'Pedro Gómez': { desde: '08:00', hasta: '14:00' } }), 'la orden guarda ot.horario solo de Pablo y Pedro · ' + JSON.stringify(r0 && r0.horario));
    await o.evaluate(() => window.emitirOrdenTrabajo()); await o.waitForTimeout(2500);
    emitida = await o.evaluate(() => { const x = ordenesTrabajo.filter((y) => y.plazaId === 'p2').sort((a, b) => (b.creado || 0) - (a.creado || 0))[0]; return x ? JSON.parse(JSON.stringify(x)) : null; });
    c(emitida && emitida.horario && emitida.horario['Pablo Picone'].hasta === '14:00' && emitida.horaFin === '16:00' && (emitida.reparto.excavacion || []).length === 4, 'emitida: ' + (emitida ? emitida.numero + ' con horario ' + JSON.stringify(emitida.horario) : 'no salió'));
    const imp = await o.evaluate((id) => { const d = document.createElement('div'); d.innerHTML = window.cuerpoOrdenTrabajoHtml(ordenesTrabajo.find((x) => x.id === id), { pantalla: false }); const tr = [...d.querySelectorAll('tr')].filter((r) => /Picone|Díaz/.test(r.textContent)); return tr.map((r) => [...r.children].slice(0, 4).map((x) => x.textContent.trim()).join('|')).join(' / '); }, emitida && emitida.id);
    c(/Pablo Picone\|Oficial\|08:00\|14:00/.test(imp) && /Mario Díaz\|Oficial\|08:00\|16:00/.test(imp), 'la hoja impresa: Entrada / Salida de cada uno · ' + imp);
    c(await scrollX(o) <= 0, 'sin scroll de costado (Llenar orden)');
    // 📸 Avance
    const av = await o.evaluate((id) => { const d = document.createElement('div'); d.innerHTML = window.__cdOficinaHtml(ordenesTrabajo.find((x) => x.id === id)); return d.textContent.replace(/\s+/g, ' '); }, emitida && emitida.id);
    c(/Horario: Pablo y Pedro: 08:00 a 14:00 · Juan y Mario: 08:00 a 16:00/.test(av), '📸 Avance: el horario · ' + av.slice(0, 160));
    c(errsJs(L).length === 0, 'sin errores (oficina)' + errsJs(L).slice(0, 2).join(' | '));
    await L.ctx.close();
  }

  // ================================================================= 2) la cuadrilla ve su horario
  if ((SOLO(2) || SOLO(3)) && emitida) {
    const d = datos173(); const em0 = JSON.parse(JSON.stringify(emitida)); delete em0.id; delete d.db.ordenesTrabajo.ot173; d.db.ordenesTrabajo[emitida.id] = em0;
    const A = await sesion('pablo', {}, d); const p = A.page;
    await p.evaluate((id) => { window.__cuadrillaDia.elegirOt && window.__cuadrillaDia.elegirOt(id); window.__cuadrillaDia.ir('orden'); }, emitida.id); await p.waitForTimeout(900);
    const t = await tx(p, '#cdApp');
    c(/tu horario: 08:00 a 14:00/.test(t), 'Pablo (celu) › La orden: «Salen 08:00 · hasta 16:00 · tu horario: 08:00 a 14:00» · ' + (t.match(/Salen[^]{0,80}/) || [''])[0]);
    await foto(p, '2_cuadrilla_orden');
    await p.evaluate(() => mostrarVista('mistareas')); await p.waitForTimeout(1300);
    await p.click('.mt-item[data-mtabrir="' + emitida.id + '"]').catch(() => { }); await p.waitForTimeout(1000);
    const m = await tx(p, '#mtApp .hp-mio');
    c(/Tu horario hoy: 08:00 a 14:00/.test(m) && /6 h/.test(m), 'Mis tareas: «🕐 Tu horario hoy: 08:00 a 14:00 · te cuentan 6 h» · ' + m);
    const B = await otra(A, 'juan'); const q = B.page;
    await q.evaluate((id) => { window.__cuadrillaDia.elegirOt && window.__cuadrillaDia.elegirOt(id); window.__cuadrillaDia.ir('orden'); }, emitida.id); await q.waitForTimeout(900);
    c(!/tu horario/.test(await tx(q, '#cdApp')), 'Juan (toda la jornada) no tiene línea de horario');
    if (REGLAS) {
      const den = await p.evaluate(async (id) => { try { await firebase.firestore().collection('ordenesTrabajo').doc(id).update({ 'horario.Pablo Picone': { desde: '08:00', hasta: '16:00' } }); return 'pasó'; } catch (e) { return String(e && (e.code || e.message)); } }, emitida.id);
      c(/permission/.test(den), 'REGLAS: la cuadrilla no puede cambiar su horario en la orden · ' + den);
      const ok = await p.evaluate(async (id) => { try { await firebase.firestore().collection('ordenesTrabajo').doc(id).update({ 'campo.notaPrueba': 'x' }); return 'ok'; } catch (e) { return String(e && (e.code || e.message)); } }, emitida.id);
      c(ok === 'ok', 'REGLAS: lo de campo sí (como siempre) · ' + ok);
    }
    c(await scrollX(p) <= 0, 'sin scroll de costado (celu)');
    await A.ctx.close();
  }

  // ================================================================= 3) cierre: horas por persona y puntos por rol × horas
  if (SOLO(3) && emitida) {
    const d = datos173(); const em0 = JSON.parse(JSON.stringify(emitida)); delete em0.id; delete d.db.ordenesTrabajo.ot173; d.db.ordenesTrabajo[emitida.id] = em0;
    const L = await sesion('lucia', {}, d); const o = L.page;
    await o.evaluate((id) => { window.mostrarVista('parte'); window.abrirCierreOt(id); }, emitida.id); await o.waitForTimeout(1200);
    await o.evaluate(() => { document.querySelectorAll('#cierreCuerpo .cierre-qty').forEach((i) => { i.value = i.dataset.k === 'zanjeo' ? '20' : '4'; i.dispatchEvent(new Event('input', { bubbles: true })); }); }); await o.waitForTimeout(500);
    const hs = await o.evaluate(() => [...document.querySelectorAll('#cierreCuerpo .cierre-horas-p')].map((i) => i.dataset.n.split(' ')[0] + ' ' + i.value).join(', '));
    c(hs === 'Pablo 6, Pedro 6, Juan 8, Mario 8', 'el cierre precarga las horas con el horario: Pablo 6, Pedro 6, Juan 8, Mario 8 · ' + hs);
    const lab = await tx(o, '#cierreCuerpo .hp-ci');
    c(/08:00 a 14:00 \(horario de la orden\)/.test(lab), 'al lado de Pablo: «🕐 08:00 a 14:00 (horario de la orden)» · ' + lab);
    const pv = await o.evaluate(() => Object.fromEntries([...document.querySelectorAll('#cierreCuerpo .cierre-pers')].map((i) => [i.dataset.n.split(' ')[0], +String(i.value).replace(',', '.')])));
    const esp = await o.evaluate((id) => { const ot = ordenesTrabajo.find((x) => x.id === id); const cant = {}; document.querySelectorAll('#cierreCuerpo .cierre-qty').forEach((i) => { cant[i.dataset.k] = +i.value; }); const hpe = window.__reparto.leerCierre(); const z = window.puntosDeOrden(Object.assign({}, ot, { cierre: { cantidades: cant, horasPersona: { 'Pablo Picone': 6, 'Pedro Gómez': 6, 'Juan Pérez': 8, 'Mario Díaz': 8 }, horasPersonaV: 2, hechoPersona: hpe } }), true); const j = window.puntosDeOrden(Object.assign({}, ot, { horario: {}, cierre: { cantidades: cant, horasPersona: {}, horasPersonaV: 2, hechoPersona: hpe } }), true); const m = (x) => Object.fromEntries(x.porPersona.map((p) => [p.nombre.split(' ')[0], Math.round(p.pts * 10) / 10])); return { con: m(z), sin: m(j) }; }, emitida.id);
    c(Math.abs(pv.Pablo - esp.con.Pablo) < 0.11 && Math.abs(pv.Juan - esp.con.Juan) < 0.11 && Math.abs(pv.Mario - esp.con.Mario) < 0.11 && pv.Juan > pv.Pablo && esp.sin.Pablo === esp.sin.Juan, 'puntos por rol × horas (puntosDeOrden, la cuenta de siempre): Pablo ' + pv.Pablo + ' (6 h) < Juan ' + pv.Juan + ' (8 h), Mario ' + pv.Mario + ', Pedro ' + pv.Pedro + ' (Ayudante, 6 h); con toda la jornada hubieran sido Pablo = Juan = ' + esp.sin.Pablo + ' · esperado ' + JSON.stringify(esp.con));
    await foto(o, '3_cierre_horas', '#cierreCuerpo .hp-ci');
    // guardar
    await o.evaluate(() => { const r = document.querySelector('#cierreCuerpo input[name="coCierreResp"][value="no"]'); if (r) { r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); } }); await o.waitForTimeout(200);
    await o.evaluate(() => window.guardarCierreOt()); await o.waitForTimeout(2200);
    const ot = await otDb(o, emitida.id);
    const hp = (ot.cierre || {}).horasPersona || {}, pp = Object.fromEntries((((ot.cierre || {}).puntos || {}).porPersona || []).map((x) => [x.nombre.split(' ')[0], Math.round(x.pts * 10) / 10]));
    c(hp['Pablo Picone'] === 6 && hp['Juan Pérez'] === 8 && Math.abs(pp.Pablo - esp.con.Pablo) < 0.11 && Math.abs(pp.Juan - esp.con.Juan) < 0.11, 'cierre guardado: horasPersona Pablo 6 / Juan 8 y los puntos fijados iguales a puntosDeOrden · ' + JSON.stringify(hp) + ' · ' + JSON.stringify(pp));
    const au = await o.evaluate((id) => { const e = window.__auditPuntos.explicarOrden(id, { persona: 'Pablo Picone' }); return JSON.stringify(e); }, emitida.id);
    c(/trabajó de 08:00 a 14:00 \(6 h, horario de la orden\)/.test(au), 'el auditor de puntos (v154) explica «trabajó de 08:00 a 14:00 (6 h, horario de la orden)» · ' + (au.match(/[^"]{0,80}trabajó de[^"]{0,60}/) || [au.slice(0, 120)])[0]);
    c(errsJs(L).length === 0, 'sin errores (cierre)' + errsJs(L).slice(0, 2).join(' | '));
    await L.ctx.close();
  }

  // ================================================================= 4) el asistente
  let n = 0;
  const usa = (name, input) => ({ id: 'msg_' + (++n), type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text: 'Armo.' }, { type: 'tool_use', id: 'tu_' + n, name, input }], stop_reason: 'tool_use', usage: { input_tokens: 900, output_tokens: 40 }, ema: { costoUsd: 0.01, version: 'v3-ia' } });
  const fin = (text) => ({ id: 'msg_' + (++n), type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text }], stop_reason: 'end_turn', usage: { input_tokens: 1000, output_tokens: 60 }, ema: { costoUsd: 0.02, version: 'v3-ia' } });
  async function worker(p) {
    const st = { pedidos: [], cola: [] };
    await p.route(W + '/ia', async (rt) => { let b = null; try { b = JSON.parse(rt.request().postData() || 'null'); } catch (e) { } st.pedidos.push(b); const f = st.cola.shift(); const x = typeof f === 'function' ? f(b) : f; return rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(x || fin('Listo.')) }); });
    await p.route(W + '/mio', (rt) => rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, version: 'v3-ia', habilitado: true, quedanPreguntas: 30, topePreguntas: 30 }) }));
    await p.route(W + '/uso', (rt) => rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, version: 'v3-ia', gastoMes: 12.4, tope: 100, partes: {} }) }));
    await p.route(W + '/salud', (rt) => rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, version: 'v3-ia' }) }));
    return st;
  }
  const esperarIa = async (p) => { for (let i = 0; i < 120; i++) { await p.waitForTimeout(150); if (await p.evaluate(() => { const b = document.getElementById('iaEnviar'); return !!b && !b.disabled; })) return; } };
  const decir = async (p, sw, frase, guion) => { sw.cola.push(...guion); const n0 = sw.pedidos.length; await p.fill('#iaTxt', frase); await p.click('#iaEnviar'); await p.waitForTimeout(300); await esperarIa(p); await p.waitForTimeout(500); return sw.pedidos.slice(n0); };
  const resultado = (ped, i) => { const m = (ped[i] || {}).messages || []; const u = m[m.length - 1] || {}; const b = (u.content || []).find((x) => x.type === 'tool_result'); if (!b) return ''; const x = b.content; return typeof x === 'string' ? x : JSON.stringify(x); };
  const tarjeta = (p) => tx(p, '#iaChat .ia-conf:last-of-type');
  const si = async (p) => { await p.click('#iaChat .ia-conf:last-of-type [data-iasi]'); for (let i = 0; i < 60; i++) { await p.waitForTimeout(200); if (/emitida|quedó cambiada|✅|⚠/.test(await tx(p, '#iaChat .ia-conf:last-of-type .ia-conf-msg'))) break; } await p.waitForTimeout(800); };
  if (SOLO(4)) {
    const L = await sesion('lucia'); const o = L.page; const sw = await worker(o);
    await o.evaluate(() => window.__asistenteAbrir()); await o.waitForTimeout(800);
    const pide = { obra: 'Las Acacias', fecha: 'hoy', personas: ['Pablo Picone', 'Pedro Gómez', 'Juan Pérez', 'Mario Díaz'], hora_inicio: '08:00', tareas: [{ tarea: 'Excavación de pozos de fundación', cantidad: 2, quien: 'Pablo Picone', columnas: ['Col 3', 'Col 4'] }, { tarea: 'Montaje de columna PRFV', cantidad: 2, quienes: ['Pedro Gómez', 'Juan Pérez'] }], horario: { 'Pablo Picone': { hasta: '14' }, 'Pedro Gómez': { hasta: '14:00' }, 'Juan Pérez': { hasta: '16' }, 'Mario Díaz': { hasta: '16:00' } } };
    const ped = await decir(o, sw, 'Orden para Las Acacias: Pablo hace el pozo de Col 3 y 4, Pedro y Juan el izaje; Pablo y Pedro hasta las 2, los demás hasta las 16', [usa('proponer_orden', pide), fin('Revisala y confirmá.')]);
    const tool = ((ped[0] || {}).tools || []).find((t) => t.name === 'proponer_orden') || {}, it = (((tool.input_schema || {}).properties || {}).tareas || {}).items || {};
    const sist = JSON.stringify((ped[0] || {}).system || '');
    if (ANTES) {
      c(!(it.properties || {}).quienes && !((tool.input_schema || {}).properties || {}).horario, 'ANTES (v172): proponer_orden no tiene «quienes» ni «horario» (solo un «quien» por tarea) · ' + Object.keys(it.properties || {}).join(','));
      const t = await tarjeta(o);
      c(!/🕐/.test(t) && !/Pedro y Juan/.test(t), 'ANTES (v172): la tarjeta no tiene horario y el izaje queda para toda la cuadrilla · ' + t.slice(0, 220));
      await si(o);
      const em = await o.evaluate(() => { const x = ordenesTrabajo.filter((y) => y.plazaId === 'p2').sort((a, b) => (b.creado || 0) - (a.creado || 0))[0]; return x ? { asig: x.asignada, eq: x.equipoTarea, hor: x.horario || null, fin: x.horaFin, cols: x.columnas } : null; });
      c(em && !em.hor && !(em.eq || {}).montaje_prfv && !(em.asig || {}).montaje_prfv, 'ANTES (v172): la orden emitida pone el izaje para los 4 (todos en todo) y sin horario · ' + JSON.stringify(em));
      await browser.close(); process.exit(c.fin() ? 1 : 0);
    }
    c(it.properties && it.properties.quienes && it.properties.reparto && it.properties.columnas && tool.input_schema.properties.horario, 'proponer_orden acepta por tarea quienes / reparto / columnas, y horario');
    c(/QUIÉN HACE QUÉ Y HORARIO \(v173\)/.test(sist) && /NUNCA pongas a todos en todo/.test(sist), 'el SISTEMA le dice que asigne por tarea y ponga el horario');
    const r = resultado(ped, 1), t = await tarjeta(o);
    c(/👤 Pablo/.test(t) && /Col 3 y Col 4/.test(t) && /👥 Pedro y Juan/.test(t) && /🕐 Pablo y Pedro: 08:00 a 14:00 · Juan y Mario: 08:00 a 16:00/.test(t), 'tarjeta: excavación 👤 Pablo (Col 3 y Col 4), izaje 👥 Pedro y Juan, 🕐 horario · ' + t.slice(0, 320));
    c(/quienHace/.test(r) && /Pedro Gómez y Juan Pérez \(juntos\)/.test(r), 'el resultado le dice al modelo quién hace qué · ' + r.slice(0, 200));
    await foto(o, '4_tarjeta');
    await si(o);
    const em = await o.evaluate(() => { const x = ordenesTrabajo.filter((y) => y.plazaId === 'p2').sort((a, b) => (b.creado || 0) - (a.creado || 0))[0]; return x ? JSON.parse(JSON.stringify(x)) : null; });
    c(em && em.asignada.excavacion === 'Pablo Picone' && JSON.stringify(em.equipoTarea.montaje_prfv) === '["Pedro Gómez","Juan Pérez"]' && JSON.stringify(em.columnas.excavacion) === '["Col 3","Col 4"]', 'orden emitida: excavación de Pablo en Col 3 y 4, izaje de Pedro y Juan juntos (Mario no) · ' + (em ? JSON.stringify({ a: em.asignada, e: em.equipoTarea, c: em.columnas }) : 'no salió'));
    c(em && em.horaFin === '16:00' && JSON.stringify(em.horario) === JSON.stringify({ 'Pablo Picone': { desde: '08:00', hasta: '14:00' }, 'Pedro Gómez': { desde: '08:00', hasta: '14:00' } }), '… y el horario: Pablo y Pedro hasta 14:00, la orden hasta 16:00 · ' + (em ? em.horaFin + ' ' + JSON.stringify(em.horario) : ''));
    // reparto: «armar 10 luminarias, 5 Pablo y 5 Pedro»
    const ped2 = await decir(o, sw, 'mañana armar 10 luminarias en Plaza del Sol, 5 Pablo y 5 Pedro', [usa('proponer_orden', { obra: 'Plaza del Sol', fecha: 'mañana', personas: ['Pablo Picone', 'Pedro Gómez'], tareas: [{ tarea: 'Armado de luminaria', cantidad: 10, reparto: [{ persona: 'Pablo Picone', cantidad: 5 }, { persona: 'Pedro Gómez', cantidad: 5 }] }] }), fin('Listo.')]);
    const t2 = await tarjeta(o);
    c(/✂ Pablo 5 · Pedro 5/.test(t2), 'tarjeta del reparto: «✂ Pablo 5 · Pedro 5» · ' + t2.slice(0, 200));
    await si(o);
    const em2 = await o.evaluate(() => { const x = ordenesTrabajo.filter((y) => y.plazaId === 'p3' && (y.actividades || []).indexOf('armado_luminaria') >= 0).sort((a, b) => (b.creado || 0) - (a.creado || 0))[0]; return x ? JSON.parse(JSON.stringify(x)) : null; });
    c(em2 && (em2.reparto.armado_luminaria || []).map((x) => x.nombre.split(' ')[0] + ' ' + x.cant).join() === 'Pablo 5,Pedro 5' && !(em2.asignada || {}).armado_luminaria, 'orden emitida con reparto {Pablo 5, Pedro 5} · ' + JSON.stringify(em2 && em2.reparto));
    // editar: Mario se va a las 12 y el izaje lo hacen Pedro y Mario
    const ped3 = await decir(o, sw, 'en esa orden Mario se va a las 12 y el izaje lo hacen Pedro y Mario', [usa('proponer_editar_orden', { otId: em.numero, cambios: { horario: { 'Mario Díaz': { hasta: '12' } }, tareas: [{ tarea: 'Montaje de columna PRFV', quienes: ['Pedro Gómez', 'Mario Díaz'] }] } }), fin('Listo.')]);
    const t3 = await tarjeta(o);
    c(/Horario/.test(t3) && /Mario: 08:00 a 12:00/.test(t3) && /Pedro Gómez y Mario Díaz/.test(t3), 'proponer_editar_orden: tarjeta antes → después con el horario y quién hace el izaje · ' + t3.slice(0, 300));
    await si(o);
    const em3 = await otDb(o, em.id);
    c(em3 && em3.horario['Mario Díaz'] && em3.horario['Mario Díaz'].hasta === '12:00' && JSON.stringify(em3.equipoTarea.montaje_prfv) === '["Pedro Gómez","Mario Díaz"]', 'cambiada: Mario hasta 12:00 y el izaje de Pedro y Mario · ' + JSON.stringify(em3 && { h: em3.horario, e: em3.equipoTarea }));
    c(errsJs(L).length === 0, 'sin errores (asistente)' + errsJs(L).slice(0, 2).join(' | '));
    await L.ctx.close();
  }

  // ================================================================= 5) cierre por voz con «hasta las 2»
  if (SOLO(5) && !ANTES) {
    const d = datos173(); const ot = d.db.ordenesTrabajo.ot173; ot.reparto = {}; ot.personal.push({ nombre: 'Juan Pérez', rol: 'Oficial' }); ot.personalNombres.push('juan perez');
    const L = await sesion('lucia', {}, d); const o = L.page; const sw = await worker(o);
    await o.evaluate(() => window.__asistenteAbrir()); await o.waitForTimeout(800);
    await decir(o, sw, 'cerrá la de Los Álamos: hicieron todo, Pablo y Pedro hasta las 2', [usa('proponer_cierre_dia', { ordenes: [{ otId: 'OT-2026-173', cantidades: { armado_luminaria: 10, excavacion: 10 }, hasta: { 'Pablo Picone': '14', 'Pedro Gómez': '14:00' } }] }), fin('Listo.')]);
    const t = await tarjeta(o);
    c(/Pablo[^]{0,40}6 ?h|6 h[^]{0,20}Pablo/.test(t) || /6/.test(t), 'cierre por voz: la tarjeta trae las horas de Pablo y Pedro (6 h) · ' + t.slice(0, 260));
    await si(o); await o.waitForTimeout(1500);
    const c2 = (await otDb(o)).cierre || {};
    c((c2.horasPersona || {})['Pablo Picone'] === 6 && (c2.horasPersona || {})['Pedro Gómez'] === 6 && (c2.horasPersona || {})['Juan Pérez'] === 8, 'cierre guardado: Pablo 6, Pedro 6, Juan 8 (la jornada 08:00–16:00) · ' + JSON.stringify(c2.horasPersona));
    await L.ctx.close();
  }

  // ================================================================= 6) __v173No
  if (SOLO(6) && !ANTES) {
    const A = await sesion('pablo', { v173: false }); const p = A.page;
    const u = await unid(p, 'excavacion');
    c(u.split(',').length === 10, 'con __v173No: Modo obra como la v172 (las 10 columnas) · ' + u);
    const L = await sesion('lucia', { v173: false }); const o = L.page;
    await o.evaluate(() => { window.mostrarVista('parte'); window.irSubOrdenes('nueva'); window.__ordenNueva.elegirObra('p2'); window.__ordenNueva.sumarPersona('Pablo Picone'); }); await o.waitForTimeout(1500);
    c(!(await o.$('#hpBox')) && !(await o.evaluate(() => !!document.querySelector('[data-rp173]'))), 'con __v173No: Llenar orden sin el horario ni «➗»');
    await A.ctx.close(); await L.ctx.close();
  }
  await browser.close();
  process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
