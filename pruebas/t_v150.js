// v150 · «Lo hecho, verificado»: la app sabe qué se hizo en cada columna y avisa antes de repetirlo.
//  1) verificación de la orden (sin IA): OT-120 «🟡 Parcial (2 de 3)» con Col 4 y Col 5 (foto y hora) y Col 6 «faltó material»;
//     OT-121 sin detalle por columna (⚠); OT-122 con foto de otra obra (⚠); tablero «Para revisar y cerrar», hoja, cierre precargado,
//     «✅ Está bien» (campo.verificado), Supervisor.
//  2) Llenar orden: la línea por tarea y el cartel al emitir (Cancelar / Dejar solo Col 6 / Emitir igual).
//  3) el pase a mañana y la sugerida no repiten; repaso del tablero (OT-130 de hoy repite el izaje) con «Sacar esa tarea» y «Sí».
//  4) planilla de columnas (legajo y ficha del Mapa de guerra) · 6) parte de verificación de las 18:00 (turno, aviso, «Ver»).
//  5) asistente: verificar_orden (solo oficina), «✨ Que lo revise el asistente» (verificación + fotos, Worker simulado) y la
//     tarjeta de proponer_orden que avisa que repite trabajo.
//  7) cuadrilla: Modo obra salta Col 4 y Col 5 y lo dice («Es otra cosa»), sin nada de la oficina.
const { abrir, prueba, DOM } = require('./h');
const { datos150 } = require('./datos150');
const cel = process.argv[2] === 'cel';
const W = 'https://ema-ia.mdiaz-60f.workers.dev';
const CAP = process.env.CAP || '';
const SOLO = (x) => !process.env.SOLO || process.env.SOLO.indexOf(x) >= 0;
(async () => {
  const c = prueba('v150' + (cel ? ' cel' : ''));
  const MOD = { cel, espera: 5000, v145: true, v146: true, v147: true, v150: true, sugerida: true, inicio: true, porPartes: true, ofPasos: true, tarjetas: true, nav: true, mtNuevo: true, iaPro: true, crew: true, https: true, antes: () => { window.__pmPausa = true; window.__cvSinMic = true; window.__hvPausa = true; window.__isNoAuto = true; } };
  let browser = null;
  const sesion = async (quien, op) => { const A = await abrir(Object.assign({ sesion: quien, datos: datos150(), browser }, MOD, op || {})); browser = A.browser; A.page.on('dialog', (x) => x.accept()); await A.page.waitForTimeout(1200); return A; };
  const db = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('stub.db') || '{}'));
  const ver = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); return !!e && e.getBoundingClientRect().height > 0 && getComputedStyle(e).visibility !== 'hidden'; }, sel);
  const txt = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; }, sel);
  const scrollX = (p) => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const sinToast = (p) => p.evaluate(() => { document.querySelectorAll('body *').forEach((e) => { if (e.children.length < 8 && /Falta cerrar la quincena/.test(e.textContent || '') && getComputedStyle(e).position === 'fixed') e.style.display = 'none'; }); });
  const foto = async (p, nombre, sel) => { if (!CAP) return; await sinToast(p); if (sel) await p.evaluate((s) => { const e = document.querySelector(s); e && e.scrollIntoView({ block: 'center' }); }, sel); await p.waitForTimeout(300); await p.screenshot({ path: CAP + '/' + nombre + '_' + (cel ? 'cel' : 'pc') + '.png' }); };
  let n = 0;
  const usa = (name, input) => ({ id: 'msg_' + (++n), type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text: 'Miro.' }, { type: 'tool_use', id: 'tu_' + n, name, input }], stop_reason: 'tool_use', usage: { input_tokens: 900, output_tokens: 40 }, ema: { costoUsd: 0.01, version: 'v3-ia' } });
  const fin = (text) => ({ id: 'msg_' + (++n), type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text }], stop_reason: 'end_turn', usage: { input_tokens: 1000, output_tokens: 60 }, ema: { costoUsd: 0.02, version: 'v3-ia' } });
  async function worker(p) {
    const st = { pedidos: [], cola: [] };
    await p.route(W + '/ia', async (rt) => { let b = null; try { b = JSON.parse(rt.request().postData() || 'null'); } catch (e) { } st.pedidos.push(b); const f = st.cola.shift(); const x = typeof f === 'function' ? f(b) : f; return x ? rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(x) }) : rt.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: { tipo: 'prueba', mensaje: 'sin guion' } }) }); });
    await p.route(W + '/mio', (rt) => rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, version: 'v3-ia', habilitado: true, quedanPreguntas: 30, topePreguntas: 30 }) }));
    await p.route(W + '/uso', (rt) => rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, version: 'v3-ia', gastoMes: 12.4, tope: 100, partes: {} }) }));
    await p.route(W + '/salud', (rt) => rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, version: 'v3-ia' }) }));
    return st;
  }
  const esperarIa = async (p) => { for (let i = 0; i < 100; i++) { await p.waitForTimeout(150); if (await p.evaluate(() => { const b = document.getElementById('iaEnviar'); return !!b && !b.disabled; })) return; } };
  const D0 = datos150(), hoy = D0.hoy, man = D0.man, ayer = D0.ayer;
  const tablero = async (p, tab) => { await p.evaluate(() => window.mostrarVista('parte')); await p.waitForTimeout(900); await p.evaluate((t) => { const b = document.querySelector('[data-tbs="' + t + '"]'); b && b.click(); }, tab); await p.waitForTimeout(1500); };

  // ================================================================= 1) la verificación de la orden (oficina)
  if (SOLO('1')) {
    const A = await sesion('lucia'); const p = A.page;
    const v = await p.evaluate(() => ({ a: window.__verifOt.verifOt('a120'), b: window.__verifOt.verifOt('b121'), d: window.__verifOt.verifOt('d122'), t: window.__verifOt.texto('a120') }));
    const ta = v.a.tareas[0];
    c(v.a.res === 'parcial' && ta.hechas === 2 && ta.pedidas === 3 && ta.si.map((u) => u.num).join() === 'Col 4,Col 5' && ta.no.map((u) => u.num).join() === 'Col 6', 'OT-120: 🟡 parcial 2 de 3 (Col 4 y Col 5 hechas, Col 6 no) · ' + v.t.slice(0, 160));
    c(/con foto y hora/.test(ta.texto) && /no se hizo Col 6: «faltó material»/.test(ta.texto) && !ta.dudas.length, 'el texto dice «con foto y hora» y «no se hizo Col 6: "faltó material"», sin dudas');
    c(v.b.res === 'duda' && /sin detalle por columna/.test(v.b.tareas[0].texto), 'OT-121 (sin pasos ni fotos): «hecho según la cuadrilla, sin detalle por columna» y ⚠ dudosa');
    c(v.d.res === 'duda' && /820 m/.test(v.d.tareas[0].dudas.join()), 'OT-122: ⚠ dudosa por la foto sacada a 820 m de la obra (GPS)');
    await tablero(p, 'revisar');
    const card = await txt(p, '.ot-tb-card[data-otid="a120"] .hv-tbw');
    c(/Parcial \(2 de 3\)/.test(card) && /Col 4 y Col 5/.test(card) && /Está bien/.test(card) && /Cerrar con esto/.test(card), 'tablero › Para revisar y cerrar: la tarjeta de la OT-120 dice «🟡 Parcial (2 de 3)» con «✅ Está bien» y «Cerrar con esto» · ' + card.slice(0, 120));
    c(/Dudosa/.test(await txt(p, '.ot-tb-card[data-otid="b121"] .hv-tbw')), 'la OT-121 sale ⚠ Dudosa en el tablero');
    await foto(p, 'verif_tablero', '.ot-tb-card[data-otid="a120"]');
    await p.click('.ot-tb-card[data-otid="a120"] [data-hv="ver"]'); await p.waitForTimeout(500);
    const hoja = await txt(p, '#hvOv');
    c(/Verificación · OT-2026-120/.test(hoja) && /Parcial/.test(hoja) && /pedidas 3 · hechas 2/.test(hoja) && await p.evaluate(() => { const o = document.getElementById('hvOv'); return o.classList.contains('v7-ov') && o.getAttribute('role') === 'dialog' && !!o.querySelector('.v7-x[aria-label="Cerrar"]'); }), 'hoja «🔎 Verificación» (.v7-ov, role=dialog, ✕) con el detalle por tarea');
    await foto(p, 'verif_hoja');
    await p.click('#hvOv [data-hv="cerrar"]'); await p.waitForTimeout(1200);
    const ci = await p.evaluate(() => { const i = document.querySelector('#cierreCuerpo .cierre-qty[data-k="montaje_prfv"]'); const r = i && i.closest('tr').nextElementSibling; return { v: i ? i.value : null, nota: r && r.classList.contains('hv-cie') ? r.textContent.replace(/\s+/g, ' ') : '' }; });
    c(ci.v === '2' && /Lo verificado/.test(ci.nota) && /precargado: 2/.test(ci.nota), '«Cerrar con esto»: el cierre viene precargado con lo verificado (2) y la línea «🔎 Lo verificado» · ' + ci.nota.slice(0, 120));
    await foto(p, 'verif_cierre', '#cierreCuerpo .hv-cie');
    await p.evaluate(() => { try { cerrarCuadroCierre(); } catch (e) { } }); await p.waitForTimeout(400);
    const d0 = await db(p);
    c(!((d0.ordenesTrabajo.a120.cierre || {}).cerradoTs) && !(d0.ordenesTrabajo.a120.campo || {}).verificado, 'nada se escribe sin tocar un botón (la orden sigue sin cerrar ni verificar)');
    const sup = await p.evaluate(() => window.__supervisor.hallazgos({ ahora: true }).filter((h) => h.cat === 'Verificación').map((h) => h.t + ' | ' + h.g));
    c(sup.some((x) => /OT-2026-120 · 🟡 Parcial \(2 de 3\)/.test(x)) && sup.some((x) => /OT-2026-130 \(hoy\) pide algo ya hecho \| rojo/.test(x)), 'Supervisor: la OT-120 parcial y la OT-130 de hoy que pide algo ya hecho (rojo) · ' + sup.length + ' hallazgos');
    await tablero(p, 'revisar');
    await p.click('.ot-tb-card[data-otid="a120"] [data-hv="ok"]'); await p.waitForTimeout(1200);
    const d1 = await db(p), vf = ((d1.ordenesTrabajo.a120.campo || {}).verificado) || {};
    c(vf.ok === true && vf.resultado === 'parcial' && /lucia/.test(vf.por) && vf.ts > 0, '«✅ Está bien» guarda campo.verificado {ok, por, ts, resultado: parcial} · ' + JSON.stringify({ r: vf.resultado, por: vf.por }));
    c(/Verificada/.test(await txt(p, '.ot-tb-card[data-otid="a120"] .hv-tbw')) && !(await p.evaluate(() => window.__supervisor.hallazgos({ ahora: true }).some((h) => /OT-2026-120/.test(h.t)))), 'después: la tarjeta dice «Verificada» y el Supervisor ya no la marca');
    c(Object.values(d1.auditoria || {}).some((a) => a.accion === 'ot_verificada' || /ot_verificada/.test(JSON.stringify(a))), 'auditoría ot_verificada');
    c(await scrollX(p) <= 0, 'sin scroll de costado');
    c(A.errores.length === 0, 'sin errores en la consola' + (A.errores.length ? ': ' + A.errores.slice(0, 2).join(' | ') : ''));
    await A.ctx.close();
  }

  // ================================================================= 2) Llenar orden: aviso por tarea y cartel al emitir
  if (SOLO('2')) {
    const A = await sesion('lucia'); const p = A.page;
    await p.evaluate(() => { window.mostrarVista('parte'); window.irSubOrdenes('nueva'); }); await p.waitForTimeout(700);
    await p.evaluate(() => { try { window.__ordenNueva.elegirObra('p1'); } catch (e) { const s = document.getElementById('otPlaza'); s.value = 'p1'; s.dispatchEvent(new Event('change', { bubbles: true })); } }); await p.waitForTimeout(1800);
    const lin = await p.evaluate(() => { const cb = document.querySelector('#otActividades .ot-act-check[value="montaje_prfv"]'), el = cb && cb.closest('.ot-tarea'), l = el && el.querySelector('.hv-linea'); return l ? l.textContent.replace(/\s+/g, ' ') : ''; });
    c(/Mandado sin cerrar: Col 4 y Col 5 ayer \(OT-2026-120, Juan, con foto y hora\)/.test(lin), 'Llenar orden › izaje: «⏳ Mandado sin cerrar: Col 4 y Col 5 ayer (OT-2026-120, Juan, con foto y hora)»');
    c(/Ya hecho: Col 1 a Col 3/.test(lin) && /Col 6 no se hizo ayer: «faltó material»/.test(lin) && /Ya asignado hoy en OT-2026-130 \(3\)/.test(lin) && /Falta de verdad: 1 \(Col 6\)/.test(lin), '… «⚠ Ya hecho: Col 1 a Col 3», «Col 6 no se hizo», «📅 Ya asignado hoy en OT-2026-130» y «Falta de verdad: 1 (Col 6)» · ' + lin.slice(0, 90));
    await p.evaluate(() => { try { const k = document.getElementById('otActividades').closest('[data-paso]'); if (k) window.__ordenNueva.ir(+k.dataset.paso || k.dataset.paso); } catch (e) { } }); await p.waitForTimeout(600);
    await p.evaluate(() => { const cb = document.querySelector('#otActividades .ot-act-check[value="montaje_prfv"]'); const el = cb.closest('.ot-tarea'); el.scrollIntoView({ block: 'center' }); });
    await foto(p, 'aviso_llenar');
    // el cartel al emitir (los datos de la orden, simulados como t_v145; la emisión de verdad no corre: __hvSoloProbar)
    await p.evaluate((m) => { window.datosOtDesdeFormulario = () => ({ plazaId: 'p1', plazaNombre: 'PLAZA LOS ÁLAMOS', fecha: m, actividades: ['montaje_prfv'], previsto: { montaje_prfv: 3 }, personal: [{ nombre: 'Juan Pérez' }, { nombre: 'Pedro Gómez' }], vehiculos: [] }); window.__hvSoloProbar = true; window.__hvEmitio = 0; const cb = document.querySelector('#otActividades .ot-act-check[value="montaje_prfv"]'); if (cb && !cb.checked) { cb.checked = true; cb.dispatchEvent(new Event('change', { bubbles: true })); } const i = cb.closest('.ot-tarea').querySelector('.ot-act-prev'); if (i) { i.value = '3'; i.dispatchEvent(new Event('input', { bubbles: true })); } }, man);
    await p.evaluate(() => { document.getElementById('otEmitirBtn').click(); }); await p.waitForTimeout(700);
    const pr = await txt(p, '#hvPreg');
    c(/Esto ya está hecho en 2 de 3 \(Col 4 y Col 5\)/.test(pr) && /Dejar solo Col 6/.test(pr) && /Emitir igual/.test(pr) && /Cancelar/.test(pr) && /OT-2026-130/.test(pr), 'al emitir: cartel «Esto ya está hecho en 2 de 3 (Col 4 y Col 5)» con Cancelar / Dejar solo Col 6 / Emitir igual (y «ya asignado en OT-130») · ' + pr.slice(0, 120));
    await foto(p, 'aviso_cartel');
    await p.click('#hvPreg [data-hvp="no"]'); await p.waitForTimeout(400);
    c(!(await p.evaluate(() => !!document.getElementById('hvPreg'))) && (await p.evaluate(() => window.__hvEmitio)) === 0 && /No se emitió/.test(await txt(p, '#otMsg')), '«Cancelar» no emite');
    await p.evaluate(() => { document.getElementById('otEmitirBtn').click(); }); await p.waitForTimeout(600);
    await p.click('#hvPreg [data-hvp="solo"]'); await p.waitForTimeout(500);
    const so = await p.evaluate(() => { const cb = document.querySelector('#otActividades .ot-act-check[value="montaje_prfv"]'); return { v: cb.closest('.ot-tarea').querySelector('.ot-act-prev').value, e: window.__hvEmitio }; });
    c(so.v === '1' && so.e === 1, '«Dejar solo Col 6»: la tarea queda en 1 y se emite · ' + JSON.stringify(so));
    await p.evaluate(() => { document.getElementById('otEmitirBtn').click(); }); await p.waitForTimeout(600);
    await p.click('#hvPreg [data-hvp="si"]'); await p.waitForTimeout(400);
    c((await p.evaluate(() => window.__hvEmitio)) === 2, '«Emitir igual» emite');
    const au = Object.values((await db(p)).auditoria || {}).filter((a) => /ot_repite_trabajo/.test(JSON.stringify(a)));
    c(au.length === 2, 'auditoría ot_repite_trabajo (dejar solo / emitir igual) · ' + au.length);
    c(await scrollX(p) <= 0, 'sin scroll de costado');
    c(A.errores.length === 0, 'sin errores en la consola' + (A.errores.length ? ': ' + A.errores.slice(0, 2).join(' | ') : ''));
    await A.ctx.close();
  }

  // ================================================================= 3) pase a mañana, repaso del tablero y la sugerida
  if (SOLO('3')) {
    const A = await sesion('lucia'); const p = A.page;
    const pm = await p.evaluate((h) => window.__pasarManana.pendientes(h).filter((x) => x.src === 'h130').map((x) => x.k + ':' + x.cant + ':' + x.motivo), hoy);
    c(pm.indexOf('montaje_prfv:1:no se marcó · lo demás ya está hecho') >= 0, 'pasar a mañana: de la OT-130 pasa 1 izaje (lo que falta de verdad), no 3 · ' + pm.join(' / '));
    const sd = await p.evaluate(() => { const t = window.saldoObra('p2').tareas.montaje_prfv; return { q: t.queda, h: t.hechoSinCerrar, a: t.asignado }; });
    c(sd.q === 2 && sd.h === 2 && sd.a === 0, 'saldo de LAS ACACIAS: lo mandado sin cerrar cuenta como hecho (2) y no como asignado · ' + JSON.stringify(sd));
    const sd1 = await p.evaluate(() => { const t = window.saldoObra('p1').tareas.montaje_prfv; return { q: t.queda, h: t.hechoSinCerrar, no: t.noSeHizo, a: t.asignado }; });
    c(sd1.h === 2 && sd1.no === 1 && sd1.a === 3, 'saldo de LOS ÁLAMOS: Col 4 y 5 hechas sin cerrar, Col 6 vuelve a «queda», la OT-130 sigue asignada · ' + JSON.stringify(sd1));
    await tablero(p, 'obra');
    const rp = await txt(p, '.ot-tb-card[data-otid="h130"] .hv-tbw');
    c(/Esto ya se hizo/.test(rp) && /2 de 3 columnas \(Col 4 y Col 5\) ayer en OT-2026-120/.test(rp) && /Sacar esa tarea/.test(rp) && /Dejar solo Col 6/.test(rp), 'repaso del tablero › Hoy: la OT-130 «⚠ Esto ya se hizo: … 2 de 3 columnas (Col 4 y Col 5) ayer en OT-2026-120» con «Sacar esa tarea» · ' + rp.slice(0, 100));
    await foto(p, 'repaso_tablero', '.ot-tb-card[data-otid="h130"]');
    await p.click('.ot-tb-card[data-otid="h130"] [data-hv="sacar"]'); await p.waitForTimeout(400);
    c(/¿Sacar «Montaje de columna PRFV» de la OT-2026-130\?/.test(await txt(p, '#hvConf')), 'pide «Sí» antes de sacarla');
    await p.click('#hvConf [data-hvc="no"]'); await p.waitForTimeout(300);
    c(((await db(p)).ordenesTrabajo.h130.actividades || []).indexOf('montaje_prfv') >= 0, 'con «No» no cambia nada');
    await p.click('.ot-tb-card[data-otid="h130"] [data-hv="sacar"]'); await p.waitForTimeout(400);
    await p.click('#hvConf [data-hvc="si"]'); await p.waitForTimeout(1500);
    const o130 = (await db(p)).ordenesTrabajo.h130;
    c((o130.actividades || []).join() === 'sellado_base' && !(o130.previsto || {}).montaje_prfv && (o130.tareasSacadas || []).some((x) => x.k === 'montaje_prfv'), 'con «Sí»: la OT-130 queda sin el izaje (tareasSacadas, como Seguimiento) · ' + JSON.stringify(o130.actividades));
    c(!(await p.evaluate(() => { const b = document.querySelector('.ot-tb-card[data-otid="h130"] .hv-tbw'); return b && /Esto ya se hizo/.test(b.textContent); })), 'el aviso del tablero se va');
    // la sugerida de mañana: de LOS ÁLAMOS solo Col 6 (Col 4 y 5 ya mandadas, sin cerrar)
    const f2 = man;
    const sg = await p.evaluate((f) => window.__sugerida.armar(f).ordenes.map((o) => ({ id: o.obraId, t: o.tareas.filter((t) => t.k === 'montaje_prfv').map((t) => ({ c: t.cant, cols: t.cols || [] })) })), f2);
    const s1 = (sg.find((x) => x.id === 'p1') || { t: [] }).t[0], todas = sg.reduce((a, x) => a.concat(x.id === 'p1' ? x.t.reduce((b, t) => b.concat(t.cols), []) : []), []);
    c(s1 && s1.c === 1 && s1.cols.join() === 'Col 6', 'orden sugerida: en LOS ÁLAMOS sugiere 1 izaje, Col 6 (no repite Col 4 y Col 5 mandadas sin cerrar) · ' + JSON.stringify(sg));
    c(todas.indexOf('Col 4') < 0 && todas.indexOf('Col 5') < 0, 'ninguna sugerida pide Col 4 ni Col 5');
    c(A.errores.length === 0, 'sin errores en la consola' + (A.errores.length ? ': ' + A.errores.slice(0, 2).join(' | ') : ''));
    await A.ctx.close();
  }

  // ================================================================= 4) planilla de columnas y 6) parte del día
  if (SOLO('4')) {
    const A = await sesion('lucia'); const p = A.page;
    await p.evaluate(() => { window.mostrarVista('obras'); setTimeout(() => window.abrirLegajo('p1'), 200); }); await p.waitForTimeout(2600);
    c(await ver(p, '#lgHvSec .hv-grid'), 'legajo: «🧱 Planilla de columnas»');
    const cel6 = await p.evaluate(() => { const g = (c, e) => { const b = document.querySelector(`#lgHvSec .hv-c[data-c="${c}"][data-e="${e}"]`); return b ? b.className.replace('hv-c ', '') : '-'; }; return ['Col 1', 'Col 3', 'Col 4', 'Col 5', 'Col 6'].map((c) => g(c, 'izaje')).join(','); });
    c(cel6 === 'ver,ver,sinver,sinver,no', 'izaje por columna: Col 1–3 verificadas, Col 4–5 sin verificar, Col 6 no se hizo · ' + cel6);
    await p.click('#lgHvSec .hv-c[data-c="Col 4"][data-e="izaje"]'); await p.waitForTimeout(300);
    const det = await txt(p, '#lgHvSec .hv-det');
    c(/Col 4 · Izaje/.test(det) && /Juan Pérez/.test(det) && /OT-2026-120/.test(det) && /con foto/.test(det) && /08:00 a 09:30/.test(det) && await p.evaluate(() => !!document.querySelector('#lgHvSec .hv-det img')), 'tocar Col 4: quién, cuándo, hora, OT y la foto · ' + det.slice(0, 120));
    c(/Asignado|•/.test(await p.evaluate(() => [...document.querySelectorAll('#lgHvSec .hv-c.asig')].length ? 'Asignado' : '')) === true, 'lo asignado en la OT-130 (sellado) se ve amarillo');
    await foto(p, 'planilla_legajo', '#lgHvSec');
    c(await p.evaluate(() => { const h = window.__hecho.mapaHtml('p1'); return /hv-grid/.test(h) && /data-hvpl="p1"/.test(h) && /2 sin verificar/.test(h); }), 'ficha del Mapa de guerra: la planilla chica con «🧱 Planilla de columnas»');
    const mg = await p.evaluate(async () => { try { window.mostrarVista('mapa'); await new Promise((r) => setTimeout(r, 1200)); if (window.__mapaControl && window.__mapaControl.prender) window.__mapaControl.prender(true); await new Promise((r) => setTimeout(r, 600)); window.__mapaControl.abrirFicha('p1', true); await new Promise((r) => setTimeout(r, 400)); const f = document.getElementById('mgFicha'); return f ? f.innerHTML : ''; } catch (e) { return 'ERR ' + e.message; } });
    c(/hv-grid/.test(mg), 'la ficha del Mapa de guerra muestra las columnas · ' + (/hv-grid/.test(mg) ? 'ok' : mg.slice(0, 80)));
    // 6) parte de verificación a las 18:00
    const P1 = await p.evaluate((a) => window.__verifOt.parteDia(a).texto, ayer);
    c(/1 parcial, 2 dudosas/.test(P1), 'parte de ayer: «1 parcial, 2 dudosas» · ' + P1);
    const r = await p.evaluate(async (h) => { window.__hvAhora = h + 'T18:05:00'; window.__hvPausa = false; const x = await window.__verifOt.tic(); const y = await window.__verifOt.tic(); return { g: x && x.gano, t: x && x.P && x.P.texto, y }; }, hoy);
    c(r.g === true && /mañana hay 1 orden que repite trabajo hecho/.test(r.t) && r.y === null, 'a las 18:00 el turno arma el parte («… mañana hay 1 orden que repite trabajo hecho»), una sola vez · ' + r.t);
    c(await ver(p, '#hvParte') && (await p.evaluate(() => document.getElementById('hvParte').getAttribute('role'))) === 'status', 'aviso «🔎 Parte del día» (role=status) con «Ver»');
    await foto(p, 'parte_aviso');
    await p.click('#hvParte [data-hvparte]:not([data-hvparte="x"])'); await p.waitForTimeout(400);
    c(/Parte de verificación/.test(await txt(p, '#hvParteOv')) && /OT-2026-141/.test(await txt(p, '#hvParteOv')), '«Ver» abre la lista (con la OT-141 de mañana que repite)');
    const d = await db(p);
    c(Object.values(d.avisosPush || {}).some((a) => a.tipo === 'verificacion' && /admin@/.test(a.email || '')), 'aviso al celu de Administración (avisosPush tipo verificacion)');
    c(!!(((((d.configEquipo || {}).salud || {}).pasarManana || {})[hoy] || {}).verif || {}).ts, 'turno en configEquipo/salud.pasarManana.<día>.verif (como el pase a mañana)');
    c(A.errores.length === 0, 'sin errores en la consola' + (A.errores.length ? ': ' + A.errores.slice(0, 2).join(' | ') : ''));
    await A.ctx.close();
  }

  // ================================================================= 5) el asistente
  if (SOLO('5')) {
    const A = await sesion('lucia'); const p = A.page;
    const sw = await worker(p); await p.waitForTimeout(300);
    await tablero(p, 'revisar');
    sw.cola.push(usa('verificar_orden', { otId: 'OT-2026-120' }), usa('ver_fotos', { otId: 'OT-2026-120' }), fin('Está bien: la tarea está cumplida en parte (2 de 3). Las fotos de Col 4 y Col 5 muestran la columna izada. Col 6 no se hizo por falta de material.'));
    await p.click('.ot-tb-card[data-otid="a120"] [data-hv="ia"]'); await p.waitForTimeout(800); await esperarIa(p); await p.waitForTimeout(500);
    const herr = ((sw.pedidos[0] || {}).tools || []).map((t) => t.name);
    c(herr.indexOf('verificar_orden') >= 0 && /verificar_orden/.test(JSON.stringify((sw.pedidos[0] || {}).messages || [])), '«✨ Que lo revise el asistente»: la oficina recibe verificar_orden y el pedido lo nombra');
    const tr1 = JSON.stringify((sw.pedidos[1] || {}).messages || []);
    c(/Col 4/.test(tr1) && /pedidas/.test(tr1) && /faltó material/.test(tr1), 'verificar_orden devuelve lo de la app (Col 4, «faltó material»)');
    const tr2 = (sw.pedidos[2] || {}).messages || [], ult = JSON.stringify(tr2[tr2.length - 1] || {});
    c(/"type":"image"/.test(ult), 'ver_fotos manda las miniaturas de la orden');
    c(/cumplida en parte \(2 de 3\)/.test(await txt(p, '#iaChat')), 'la respuesta queda en el chat');
    await foto(p, 'verif_ia', '#iaChat .ia-b.ia:last-of-type');
    sw.cola.push(usa('proponer_orden', { obra: 'Los Álamos', fecha: man, personas: ['Juan Pérez', 'Pedro Gómez'], tareas: [{ tarea: 'Montaje de columna PRFV', cantidad: 3 }] }), fin('Te dejé la orden para confirmar.'));
    await p.fill('#iaTxt', 'Armame para mañana 3 izajes en Los Álamos con Juan y Pedro'); await p.click('#iaEnviar'); await p.waitForTimeout(300); await esperarIa(p);
    const card = await txt(p, '#iaChat .ia-conf:last-of-type');
    c(/ya está hecho en 2 de 3 columnas \(Col 4 y Col 5\)/.test(card) && /Falta de verdad: 1 \(Col 6\)/.test(card), 'la tarjeta de proponer_orden avisa que repite trabajo hecho · ' + card.slice(0, 160));
    c(A.errores.length === 0, 'sin errores en la consola' + (A.errores.length ? ': ' + A.errores.slice(0, 2).join(' | ') : ''));
    await A.ctx.close();
    const B = await sesion('pan'); const pb = B.page;
    const t = await pb.evaluate(async () => { try { await window.__iaCargar(); } catch (e) { } return window.__asistente ? window.__asistente.alcance().tools(window.__asistente.TOOLS).some((x) => x.name === 'verificar_orden') : null; });
    c(t === false, 'el pañol no recibe verificar_orden');
    await B.ctx.close();
  }

  // ================================================================= 7) la cuadrilla
  if (SOLO('7')) {
    const A = await sesion('juan'); const p = A.page;
    await p.evaluate(() => { window.__cuadrillaDia.elegirOt('h130'); window.__cuadrillaDia.ir('obra'); }); await p.waitForTimeout(900);
    const av = await txt(p, '#cdApp .cd-hv'), g = await txt(p, '#cdApp .cd-colg');
    c(/Col 4 y Col 5/.test(av) && /ya figura hecho el/.test(av) && /\(Juan\)/.test(av) && /Te paso a la que falta: Col 6/.test(av) && g === 'Col 6', 'Modo obra: «⚠ Col 4 y Col 5: … ya figura hecho el … (Juan). Te paso a la que falta: Col 6» y el botón va a Col 6 · ' + av.slice(0, 120));
    c((await p.evaluate(() => document.querySelector('#cdApp .cd-hv').getAttribute('role'))) === 'status', 'el aviso es role=status');
    await foto(p, 'cuadrilla_modo_obra', '#cdApp .cd-hv');
    await p.click('#cdApp [data-hvforzar]'); await p.waitForTimeout(700);
    c((await txt(p, '#cdApp .cd-colg')) === 'Col 4' && !(await p.evaluate(() => !!document.querySelector('#cdApp .cd-hv'))), '«Es otra cosa: hacerla igual» vuelve a Col 4 y el aviso se va');
    const of = await p.evaluate(() => ({ sup: window.__verifOt.supHallazgos().length, tb: !!document.querySelector('.hv-tbw,#lgHvSec,#hvParte'), linea: window.__verifOt.verifOt('h130') ? 1 : 0 }));
    c(of.sup === 0 && !of.tb, 'la cuadrilla no tiene nada de la oficina (sin hallazgos, tablero, planilla ni parte)');
    c(A.errores.length === 0, 'sin errores en la consola' + (A.errores.length ? ': ' + A.errores.slice(0, 2).join(' | ') : ''));
    await A.ctx.close();
  }
  await browser.close();
  process.exit(c.fin() ? 1 : 0);
})();
