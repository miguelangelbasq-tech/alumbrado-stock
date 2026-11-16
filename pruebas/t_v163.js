// v163 · Avance de obra: marcar lo que ya está hecho, fácil y sin que lo frene el fraguado (datos163).
//  0) lo que le pasaba a Ángel (con ANTES=1 contra la v162: «Columna completa» en una obra vieja sin órdenes deja el hormigón
//     «fraguando» 72 h, la alerta «1 base fraguando» y el aviso al marcar el izaje); sin ANTES: arreglado, con «¿Cuándo se
//     hormigonó?» («Ya hace días» de entrada); «Hoy» sí fragua 72 h y el izaje avisa sin frenar.
//  1) «⚡ Poner al día esta obra» + «🏁 Está toda terminada» en la obra vieja: 100 % en un paso, sin fraguando, ¿Está terminada? Sí.
//  2) obra a medias: desde Col 1 hasta Col 6 «Hasta el izaje»; después una orden cerrada nueva suma sola sin contar dos veces;
//     en Bulevares (con órdenes) la puesta al día no pisa lo de las órdenes (falla, fraguando, hecho).
//  3) Dirección, «solo mirar», pañol y cuadrilla no ven el botón.
//  4) asistente: «la plaza vieja ya estaba hecha toda» → proponer_marcar_avance toda_terminada → «Sí» → 100 %.
//  5) compatibilidad: con __v163No (pruebas viejas) todo como la v162.
const { abrir, prueba } = require('./h');
const { datos163 } = require('./datos163');
const cel = process.argv[2] === 'cel';
const CAP = process.env.CAP || '';
const ANTES = !!process.env.ANTES;
const SOLO = (x) => !process.env.SOLO || process.env.SOLO.indexOf(x) >= 0;
const W = 'https://ema-ia.mdiaz-60f.workers.dev';
(async () => {
  const c = prueba('v163' + (cel ? ' cel' : '') + (ANTES ? ' (ANTES)' : ''));
  const MOD = { cel, espera: 5000, crew: true, nav: true, mtNuevo: true, tarjetas: true, ofPasos: true, porPartes: true, https: true, inicio: true, sugerida: true, iaPro: true, v145: true, v146: true, v147: true, v150: true, v151: true, v152: true, v153: true, v154: true, v155: true, v156: true, v157: true, v158: true, v159: true, v160: true, v161: true, v163: true, reglas: !!process.env.REGLAS, antes: () => { window.__pmPausa = true; window.__hvPausa = true; window.__isNoAuto = true; window.__aaPausa = true; window.__cvSinMic = true; } };
  let browser = null;
  const sesion = async (quien, op, dop) => { const A = await abrir(Object.assign({ sesion: quien, datos: datos163(dop || {}), browser }, MOD, op || {})); browser = A.browser; A.page.on('dialog', (x) => x.accept()); await A.page.waitForTimeout(1200); return A; };
  const db = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('stub.db') || '{}'));
  const scrollX = (p) => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const foto = async (p, nombre, sel) => { if (!CAP) return; await p.evaluate((s) => { const st = document.getElementById('cap163') || document.head.appendChild(Object.assign(document.createElement('style'), { id: 'cap163' })); st.textContent = '#avToast{display:none!important}'; if (s) { const e = document.querySelector(s); if (e) { if (e.closest('#a2Ov')) e.scrollIntoView({ block: 'start' }); else window.scrollTo(0, Math.max(0, e.getBoundingClientRect().top + window.scrollY - 70)); } } }, sel); await p.waitForTimeout(400); await p.screenshot({ path: CAP + '/' + nombre + '_' + (cel ? 'cel' : 'pc') + '.png' }); };
  const errsJs = (A) => (A.errores || []).filter((e) => !/Missing or insufficient permissions|permission-denied|ERR_|Failed to fetch|aborted|fetching the script|prueba|sin permiso|Sin permiso/i.test(e));
  const avance = async (p, id) => { await p.evaluate(() => mostrarVista('avance')); await p.waitForTimeout(700); await p.evaluate((x) => verAvanceDetalle(x), id); await p.waitForTimeout(1200); };
  const pctX = (p, id) => p.evaluate((x) => Math.round(window.__av2.estado(x).pctX * 100) / 100, id);
  const cel_ = (p, id, paso, i) => p.evaluate(([o, a, b]) => { const E = window.__av2.estado(o); const r = E.R[a + '|' + b]; return { e: r.e, ot: r.ot || '', pd: !!r.pd, frag: r.fragHasta || 0, sinCol: !!r.sinCol, motivo: r.motivo || '' }; }, [id, paso, i]);
  const tx = (p, s) => p.evaluate((x) => { const e = document.querySelector(x); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; }, s);
  const esperar = async (p, fn, arg, ms) => { for (let i = 0; i < (ms || 40); i++) { if (await p.evaluate(fn, arg)) return true; await p.waitForTimeout(250); } return false; };
  const toques = { n: 0 };
  const tocar = async (p, sel, ms) => { toques.n++; await p.click(sel); await p.waitForTimeout(ms || 400); };
  let n = 0;
  const usa = (name, input) => ({ id: 'msg_' + (++n), type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text: 'Miro.' }, { type: 'tool_use', id: 'tu_' + n, name, input }], stop_reason: 'tool_use', usage: { input_tokens: 900, output_tokens: 40 }, ema: { costoUsd: 0.01, version: 'v5-ia' } });
  const fin = (text) => ({ id: 'msg_' + (++n), type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text }], stop_reason: 'end_turn', usage: { input_tokens: 1000, output_tokens: 60 }, ema: { costoUsd: 0.02, version: 'v5-ia' } });
  async function worker(p) {
    const st = { pedidos: [], cola: [] };
    await p.route(W + '/ia', async (rt) => { let b = null; try { b = JSON.parse(rt.request().postData() || 'null'); } catch (e) { } st.pedidos.push(b); const f = st.cola.shift(); const x = typeof f === 'function' ? f(b) : f; return rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(x || fin('Listo.')) }); });
    await p.route(W + '/mio', (rt) => rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, version: 'v5-ia', habilitado: true, quedanPreguntas: 30, topePreguntas: 30 }) }));
    await p.route(W + '/uso', (rt) => rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, version: 'v5-ia', gastoMes: 12.4, tope: 100, partes: {} }) }));
    await p.route(W + '/salud', (rt) => rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, version: 'v5-ia' }) }));
    return st;
  }
  const esperarIa = async (p) => { for (let i = 0; i < 120; i++) { await p.waitForTimeout(150); if (await p.evaluate(() => { const b = document.getElementById('iaEnviar'); return !!b && !b.disabled; })) return; } };
  const decir = async (p, sw, frase, guion) => { sw.cola.push(...guion); const n0 = sw.pedidos.length; await p.fill('#iaTxt', frase); await p.click('#iaEnviar'); await p.waitForTimeout(300); await esperarIa(p); await p.waitForTimeout(400); return sw.pedidos.slice(n0); };
  const resultado = (ped, i) => { const m = (ped[i] || {}).messages || []; const u = m[m.length - 1] || {}; const b = (u.content || []).find((x) => x.type === 'tool_result'); if (!b) return ''; const x = b.content; return typeof x === 'string' ? x : Array.isArray(x) ? x.map((y) => (y && y.type === 'text' ? y.text : JSON.stringify(y))).join(' ') : JSON.stringify(x); };
  const herramientas = (ped) => ((ped[0] || {}).tools || []).map((t) => t.name);

  // ================================================================= 0) lo que le pasaba a Ángel / arreglado
  if (SOLO('0')) {
    const A = await sesion('lucia'); const p = A.page;
    await avance(p, 'b3');
    await p.click('#a2App .a2-tira [data-a2="col"][data-i="0"]'); await p.waitForTimeout(400);
    const preg = await p.evaluate(() => { const f = document.querySelector('#a2Ov .a2-hp'); const x = document.querySelector('#a2Ov input[name="a2Horm"]:checked'); return { hay: !!f, sel: x ? x.value : '' }; });
    await p.fill('#a2Mot', 'Ya estaba hecha, no se cargó');
    await p.click('#a2Ov [data-a2="completa"]'); await p.waitForTimeout(1400);
    const h1 = await cel_(p, 'b3', 'horm', 0), al = await tx(p, '#a2App .a2-als'), st1 = await p.evaluate(() => window.__av2.estadoCol(window.__av2.estado('b3'), 0));
    const P = await p.evaluate(() => { const x = window.__av2.planMarcar({ obra: 'b3', columnas: ['Col 1'], pasos: ['izaje'], accion: 'desmarcar', motivo: 'x' }); const y = window.__av2.planMarcar({ obra: 'b3', columnas: ['Col 2'], pasos: ['izaje'], accion: 'marcar' }); return { av: y.avisos || [] }; });
    const boton = !!(await p.$('#a2App [data-a2="pdAbrir"]'));
    if (ANTES) {
      c(h1.e === 'frag' && /base fraguando/.test(al), 'v162: «Columna completa» en una obra vieja sin órdenes deja el hormigón «fraguando» 72 h y la alerta «' + al + '» · ' + JSON.stringify(h1));
      c(st1.n === st1.t && !preg.hay, 'v162: no pregunta cuándo se hormigonó (' + st1.n + ' de ' + st1.t + ', la columna queda «⏳ fraguando» en la tira)');
      c(!boton, 'v162: no hay forma de poner al día la obra de una (columna por columna, con el motivo cada vez)');
    } else {
      c(preg.hay && preg.sel === 'dias', 'la hoja de la columna pregunta «¿Cuándo se hormigonó?» con «Ya hace días (está fraguado)» elegido');
      c(h1.e === 'mano' && !h1.frag && !/fraguando/.test(al), '«Columna completa»: el hormigón queda hecho a mano, sin fraguando ni alerta · ' + JSON.stringify(h1) + ' · ' + al);
      const d = await db(p), v = (((d.avanceObras.b3.av2 || {}).m) || {}).c_horm_COL1 || {};
      c(v.e === 'si' && v.fragOk === true && !v.hormTs, 'en la base: c_horm_COL1 con fragOk (ya estaba fraguado) · ' + JSON.stringify(v).slice(0, 120));
      const tira = await p.evaluate(() => document.querySelector('#a2App .a2-tira [data-i="0"]').className);
      c(/\bok\b/.test(tira), 'en la tira la Col 1 queda completa (no «fraguando») · ' + tira);
      // «Hoy» sí fragua 72 h
      await p.click('#a2Ov [data-a2="x"]'); await p.waitForTimeout(250);
      await p.click('#a2App .a2-tira [data-a2="col"][data-i="1"]'); await p.waitForTimeout(400);
      await p.check('#a2Ov input[name="a2Horm"][value="hoy"]');
      await p.fill('#a2Mot', 'Lo hormigonaron hoy a la mañana');
      await p.click('#a2Ov [data-a2="pMarcar"][data-p="horm"][data-ac="marcar"]'); await p.waitForTimeout(1300);
      const h2 = await cel_(p, 'b3', 'horm', 1), ahora = Date.now();
      c(h2.e === 'frag' && Math.abs(h2.frag - (ahora + 72 * 3600e3)) < 120e3, '«Hoy»: el hormigón de la Col 2 sí fragua 72 h desde ahora · ' + JSON.stringify(h2));
      c(/1 base fraguando/.test(await tx(p, '#a2App .a2-als')), 'y aparece «1 base fraguando»');
      // el izaje avisa sin frenar
      await p.fill('#a2Mot', 'La izaron igual con caño');
      await p.click('#a2Ov [data-a2="pMarcar"][data-p="izaje"][data-ac="marcar"]'); await p.waitForTimeout(1300);
      const i2 = await cel_(p, 'b3', 'izaje', 1), msg = await tx(p, '#a2HMsg');
      c(i2.e === 'mano' && /fraguando hasta/.test(msg) && /quedó marcado igual/.test(msg), 'el izaje de la Col 2 se marca y avisa sin frenar · ' + msg.slice(0, 160));
      await p.click('#a2Ov [data-a2="x"]'); await p.waitForTimeout(250);
      // «Elegir varias» con el izaje: aviso + «Marcar igual»
      await p.click('#a2App [data-a2="selOn"]'); await p.waitForTimeout(300);
      for (const i of [1, 2]) { await p.click(`#a2App [data-a2="elegir"][data-i="${i}"]`); await p.waitForTimeout(150); }
      await p.click('#a2App [data-a2="selPaso"][data-p="izaje"]'); await p.waitForTimeout(300);
      const sp = await tx(p, '#a2App .a2-selp');
      c(/todavía no tiene hormigón/.test(sp) && /Marcar igual/.test(sp), '«Elegir varias»: el aviso no frena («Marcar igual») · ' + sp.slice(0, 160));
      await p.click('#a2App [data-a2="selPaso"][data-p="horm"]'); await p.waitForTimeout(300);
      c(!!(await p.$('#a2App .a2-selp .a2-hp input[name="a2HormSel"][value="dias"]:checked')), 'y al elegir el hormigón también pregunta cuándo («Ya hace días» de entrada)');
      await p.click('#a2App [data-a2="selOff"]');
      c(boton, 'en el flash está «⚡ Poner al día esta obra»');
    }
    c((await scrollX(p)) <= 0, 'sin scroll de costado');
    c(!errsJs(A).length, 'sin errores de JS ' + JSON.stringify(errsJs(A).slice(0, 3)));
    await A.ctx.close();
  }
  if (ANTES) { if (browser) await browser.close(); return c.fin ? c.fin() : null; }

  // ================================================================= 1) obra vieja: «Está toda terminada» en un paso
  if (SOLO('1')) {
    const A = await sesion('lucia'); const p = A.page;
    await avance(p, 'b3');
    const p0 = await pctX(p, 'b3');
    toques.n = 0;
    await tocar(p, '#a2App [data-a2="pdAbrir"]');
    const ov = await p.evaluate(() => { const o = document.getElementById('a2Ov'); return { dlg: o && o.getAttribute('role'), x: !!(o && o.querySelector('.v7-x[aria-label="Cerrar"]')), mot: (document.getElementById('pdMot') || {}).value || '', v7: !!(o && o.classList.contains('v7-ov')) }; });
    c(ov.dlg === 'dialog' && ov.x && ov.v7 && ov.mot === 'Puesta al día del avance', 'la hoja «⚡ Poner al día esta obra» (.v7-ov, role=dialog, ✕) con el motivo precargado · ' + JSON.stringify(ov));
    await tocar(p, '#a2Ov [data-a2="pdToda"]');
    const res = await tx(p, '#pdRes');
    c(/→ 100 %/.test(res) && /12 columnas/.test(res), 'el resumen antes → después: «' + res + '»');
    await foto(p, 'poner_al_dia', '#a2Ov .v7-caja');
    await tocar(p, '#a2Ov [data-a2="pdSi"]', 1600);
    c(toques.n === 3, 'en 3 toques (⚡ · Está toda terminada · Sí) · ' + toques.n);
    const r = await p.evaluate(() => { const E = window.__av2.estado('b3'); const A = window.__av2.alertas(E); return { pct: E.pct, x: E.pctX, frag: A.frag.length, fin: window.__av2.terminada(E), glob: calcularAvanceEtapasPct(avanceObras.find((o) => o.id === 'b3')) }; });
    c(r.pct === 100 && r.glob === 100 && r.frag === 0 && r.fin.ok, 'la obra queda al 100 % (también en toda la app), sin «fraguando», terminada · ' + JSON.stringify(r) + ' (antes ' + p0 + ' %)');
    const fe = await tx(p, '#a2App .a2-flash'), term = await p.evaluate(() => { const h = [...document.querySelectorAll('#a2App .a2-card')].find((x) => /¿Está terminada\?/.test(x.textContent)); return h ? h.textContent.replace(/\s+/g, ' ') : ''; });
    c(/No falta nada/.test(fe) && !/fraguando/.test(await tx(p, '#a2App .a2-als')) && /¿Está terminada\?\s*Sí/.test(term), 'la pantalla: «✅ No falta nada», sin alertas y «¿Está terminada? Sí» · ' + term.slice(0, 80));
    const d = await db(p), m = ((d.avanceObras.b3.av2 || {}).m) || {}, ka = Object.keys(m).filter((k) => /^a[0-9a-z]+_COL\d+$/.test(k)), kk = Object.keys(m).filter((k) => /^k_/.test(k));
    c(ka.length === 12 && ka.every((k) => m[k].e === 'si' && m[k].pd && m[k].fragOk && /Puesta al día/.test(m[k].motivo)) && kk.length >= 20, 'en la base: una entrada por columna (12, con los pasos, sin fraguado) + ' + kk.length + ' cosas sin columna, con el motivo');
    c(((d.avanceObras.b3.av2 || {}).hist || []).length === 1 && (d.avanceObras.b3.avanceHist || []).some((x) => x.av2 && x.despues === 100 && /Puesta al día/.test(x.motivo)), 'queda en av2.hist (un cambio) y en avanceHist (v156) con 100 %');
    const ori = await p.evaluate(() => { window.__av2.abrirColumna('b3', 4); return document.getElementById('a2Ov').textContent; });
    c(/Puesta al día \(ya estaba hecho\)/.test(ori), 'cada paso dice «Puesta al día (ya estaba hecho)»');
    await p.evaluate(() => window.__av2.cerrarHoja());
    await p.evaluate(() => { const x = [...document.querySelectorAll('#a2App .a2-card')].find((y) => /¿Está terminada\?/.test(y.textContent)); });
    await foto(p, 'obra_100', '#a2App');
    c(!(await p.$('#a2Ov')), 'la hoja se cierra');
    const ti = await p.evaluate(() => { const T = window.__av2.tiempo(window.__av2.estado('b3')); return { ritmo: T.ritmo, ult: T.ev.filter((x) => x.f !== '0000-00-00').length, col: T.ev.filter((x) => x.f === '0000-00-00').length }; });
    c(ti.ritmo == null && ti.col >= 12, 'lo puesto al día no tiene fecha real: no inventa un ritmo de «100 % en un día» · ' + JSON.stringify(ti));
    c((await scrollX(p)) <= 0, 'sin scroll de costado');
    c(!errsJs(A).length, 'sin errores de JS ' + JSON.stringify(errsJs(A).slice(0, 3)));
    await A.ctx.close();
  }

  // ================================================================= 2) obra a medias + órdenes nuevas encima + Bulevares
  if (SOLO('2')) {
    const A = await sesion('lucia'); const p = A.page;
    await avance(p, 'b4');
    await p.click('#a2App [data-a2="pdAbrir"]'); await p.waitForTimeout(400);
    await p.selectOption('#pdDesde', '0'); await p.waitForTimeout(150);
    await p.selectOption('#pdHasta', '5'); await p.waitForTimeout(150);
    await p.click('#a2Ov [data-a2="pdPreset"][data-v="izaje"]'); await p.waitForTimeout(350);
    const ch = await p.evaluate(() => ({ rango: (document.querySelector('#a2Ov input[name="pdCols"]:checked') || {}).value, pasos: [...document.querySelectorAll('#a2Ov input.pd-paso:checked')].map((x) => x.dataset.p).join(',') }));
    const res = await tx(p, '#pdRes');
    c(ch.rango === 'rango' && ch.pasos === 'pozo,horm,acab,izaje' && /6 columnas \(24 pasos\)/.test(res), '«Desde Col 1 hasta Col 6» + «Hasta el izaje» · ' + JSON.stringify(ch) + ' · ' + res);
    await p.click('#a2Ov [data-a2="pdSi"]'); await p.waitForTimeout(1500);
    const cs = await p.evaluate(() => { const E = window.__av2.estado('b4'), g = (a, i) => E.R[a + '|' + i].e; return { iz6: g('izaje', 5), h1: g('horm', 0), ap1: g('aplom', 0), p7: g('pozo', 6), iz7: g('izaje', 6), frag: window.__av2.alertas(E).frag.length, pct: E.pct }; });
    c(cs.iz6 === 'mano' && cs.h1 === 'mano' && cs.ap1 === 'falta' && cs.p7 === 'falta' && cs.iz7 === 'falta' && cs.frag === 0, 'Col 1–6 quedan con pozo, hormigón, acabado e izaje (sin fraguar); el aplomado y la Col 7 siguen faltando · ' + JSON.stringify(cs));
    // una orden nueva cerrada: izaje de la Col 7 y de la Col 3 (ya marcada) + «pozos × 3» sin decir cuáles
    const x0 = await pctX(p, 'b4');
    const esp = await p.evaluate(() => { const E = window.__av2.estado('b4'); return (3 * window.__DICC_ID.excavacion.hh + 1 * window.__DICC_ID.montaje_prfv.hh) / E.tw * 100; });
    await p.evaluate(() => { const f = fechaAISO(new Date()), t = Date.now() - 3600e3; return firebase.firestore().collection('ordenesTrabajo').doc('o401').set({ numero: 'OT-2026-401', fecha: f, plazaId: 'b4', plazaNombre: 'PLAZA MEDIA', obraId: '4032', personal: [{ nombre: 'Juan Pérez', rol: 'Oficial' }, { nombre: 'Pedro Gómez', rol: 'Ayudante' }], personalNombres: ['juan perez', 'pedro gomez'], actividades: ['montaje_prfv', 'excavacion'], previsto: { montaje_prfv: 2, excavacion: 3 }, estado: 'Terminada', creado: t, campo: { pasosObra: { montaje_prfv: { 'col 7': { num: 'Col 7', ini: '08:00', fin: '09:00', estado: 'si', por: 'Juan Pérez', ts: t, min: 60 }, 'col 3': { num: 'Col 3', ini: '09:00', fin: '10:00', estado: 'si', por: 'Juan Pérez', ts: t + 1, min: 60 } } } }, cierre: { cerradoTs: Date.now(), fecha: f, cantidades: { montaje_prfv: 2, excavacion: 3 }, horas: 8, avanceItems: [] } }); });
    await esperar(p, () => window.__av2.estado('b4').R['izaje|6'].e === 'ver');
    const x1 = await pctX(p, 'b4');
    const cs2 = await p.evaluate(() => { const E = window.__av2.estado('b4'), r = (a, i) => E.R[a + '|' + i]; return { iz7: r('izaje', 6).e, iz3: r('izaje', 2).e + ':' + (r('izaje', 2).ot || ''), p7: r('pozo', 6).e + (r('pozo', 6).sinCol ? ':sinCol' : ''), p9: r('pozo', 8).e, p10: r('pozo', 9).e, p1: r('pozo', 0).e }; });
    c(cs2.iz7 === 'ver' && /^ver:OT-2026-401/.test(cs2.iz3) && cs2.p7 === 'ver:sinCol' && cs2.p9 === 'ver' && cs2.p10 === 'falta' && cs2.p1 === 'mano', 'la orden nueva suma sola: izaje Col 7, la Col 3 (ya marcada) pasa a la orden, «pozos × 3» van a Col 7–9 (no a las marcadas) · ' + JSON.stringify(cs2));
    c(Math.abs((x1 - x0) - esp) < 0.05, 'y el % sube exacto lo nuevo (3 pozos + 1 izaje), sin contar dos veces la Col 3: ' + x0 + ' → ' + x1 + ' (esperado +' + esp.toFixed(2) + ')');
    // Bulevares, con órdenes: la puesta al día no pisa nada de las órdenes
    await avance(p, 'b1');
    const antes = await p.evaluate(() => { const E = window.__av2.estado('b1'); return { a2: E.R['artef|1'].e, h8: E.R['horm|7'].e, i1: E.R['izaje|0'].e + ':' + E.R['izaje|0'].ot, t1: E.R['tabl|0'].e }; });
    await p.click('#a2App [data-a2="pdAbrir"]'); await p.waitForTimeout(400);
    await p.click('#a2Ov [data-a2="pdPreset"][data-v="todo"]'); await p.waitForTimeout(300);
    await p.fill('#pdMot', 'Puesta al día: lo hecho sin orden'); await p.click('#a2Ov [data-a2="pdSi"]'); await p.waitForTimeout(1500);
    const desp = await p.evaluate(() => { const E = window.__av2.estado('b1'); return { a2: E.R['artef|1'].e, h8: E.R['horm|7'].e, i1: E.R['izaje|0'].e + ':' + E.R['izaje|0'].ot, t1: E.R['tabl|0'].e, i6: E.R['izaje|5'].e, pct: E.pct }; });
    c(desp.a2 === antes.a2 && desp.h8 === 'frag' && desp.i1 === antes.i1 && desp.t1 === antes.t1 && desp.i6 === 'mano', 'Bulevares: la falla de la Col 2, el hormigón de ayer (fraguando), lo hecho y lo en revisión de las órdenes no se tocan; solo se suma lo que faltaba · ' + JSON.stringify([antes, desp]));
    c(!errsJs(A).length, 'sin errores de JS ' + JSON.stringify(errsJs(A).slice(0, 3)));
    await A.ctx.close();
  }

  // ================================================================= 3) quién no ve el botón
  if (SOLO('3')) {
    for (const quien of ['dir', 'mir', 'pan']) {
      const A = await sesion(quien); const p = A.page;
      await avance(p, 'b3');
      const r = await p.evaluate(() => ({ app: !!document.getElementById('a2App'), pd: !!document.querySelector('[data-a2="pdAbrir"]'), abre: (window.__av2.abrirPuesta('b3'), !!document.getElementById('a2Ov')) }));
      c(!r.pd && !r.abre, (quien === 'dir' ? 'Dirección' : quien === 'mir' ? '«Solo mirar»' : 'Pañol') + ': sin «⚡ Poner al día esta obra» (ni abriéndola por código) · ' + JSON.stringify(r));
      await A.ctx.close();
    }
    const B = await sesion('juan', { cel: true }); const q = B.page;
    const v = await q.evaluate(() => ({ ve: window.__av2.puedeVer(), puede: window.__av2.puede(), pd: !!document.querySelector('[data-a2="pdAbrir"]') }));
    c(!v.ve && !v.puede && !v.pd, 'la cuadrilla no ve el avance ni el botón · ' + JSON.stringify(v));
    await B.ctx.close();
  }

  // ================================================================= 4) asistente
  if (SOLO('4')) {
    const A = await sesion('lucia'); const p = A.page;
    await p.waitForTimeout(2500);
    const sw = await worker(p); await p.evaluate(() => window.__asistenteAbrir()); await p.waitForTimeout(700);
    let ped = await decir(p, sw, 'la plaza vieja ya estaba hecha toda, poné al día el avance', [usa('proponer_marcar_avance', { obra: 'PLAZA VIEJA', accion: 'toda_terminada', motivo: 'ya estaba hecha toda' }), fin('¿La marco toda?')]);
    const tool = ((ped[0] || {}).tools || []).find((t) => t.name === 'proponer_marcar_avance') || {};
    const en = (((tool.input_schema || {}).properties || {}).accion || {}).enum || [];
    c(en.indexOf('toda_terminada') >= 0 && en.indexOf('puesta_al_dia') >= 0 && /PUESTA AL DÍA/.test(tool.description || ''), 'proponer_marcar_avance acepta puesta_al_dia y toda_terminada · ' + en.join(','));
    c(/pendiente_de_confirmacion/.test(resultado(ped, 1)), 'arma la tarjeta (no guarda) · ' + resultado(ped, 1).slice(0, 140));
    const card = await tx(p, '#iaChat .ia-conf:last-of-type');
    c(/100 %/.test(card) && /Col 1/.test(card), 'la tarjeta muestra el avance antes → después (100 %) y las columnas · ' + card.slice(0, 160));
    let d = await db(p);
    c(!(d.avanceObras.b3.av2), 'antes del «Sí» no cambia nada');
    await p.click('#iaChat .ia-conf:last-of-type [data-iasi]'); await p.waitForTimeout(1800);
    const r = await p.evaluate(() => ({ pct: window.__av2.pct('b3'), frag: window.__av2.alertas(window.__av2.estado('b3')).frag.length }));
    d = await db(p); const m = ((d.avanceObras.b3.av2 || {}).m) || {}, ks = Object.keys(m);
    c(r.pct === 100 && r.frag === 0 && ks.length >= 30 && ks.every((k) => m[k].porAsistente && /hecha toda/.test(m[k].motivo)), 'con «Sí»: la obra al 100 %, sin fraguando, a mano por el asistente con el motivo · ' + JSON.stringify(r) + ' · ' + ks.length + ' entradas');
    // «de la 1 a la 6 ya están izadas» en la otra
    ped = await decir(p, sw, 'en la plaza media de la 1 a la 6 ya están izadas', [usa('proponer_marcar_avance', { obra: 'PLAZA MEDIA', accion: 'puesta_al_dia', columnas: '1 a 6', pasos: 'pozo, hormigón, acabado, izaje', motivo: 'ya están izadas' }), fin('¿Lo marco?')]);
    await p.click('#iaChat .ia-conf:last-of-type [data-iasi]'); await p.waitForTimeout(1600);
    const r2 = await p.evaluate(() => { const E = window.__av2.estado('b4'); return { i6: E.R['izaje|5'].e, i7: E.R['izaje|6'].e, h1: E.R['horm|0'].e, frag: window.__av2.alertas(E).frag.length }; });
    c(r2.i6 === 'mano' && r2.i7 === 'falta' && r2.h1 === 'mano' && r2.frag === 0, 'puesta_al_dia «de la 1 a la 6» con los pasos dichos: sin fraguado · ' + JSON.stringify(r2));
    c(!errsJs(A).length, 'sin errores de JS ' + JSON.stringify(errsJs(A).slice(0, 3)));
    await A.ctx.close();
  }

  // ================================================================= 5) compatibilidad (pruebas viejas, __v163No)
  if (SOLO('5')) {
    const A = await sesion('lucia', { v163: false }); const p = A.page;
    await avance(p, 'b3');
    const r = await p.evaluate(async () => { const P = window.__av2.planMarcar({ obra: 'b3', columnas: ['Col 1'], accion: 'completa' }); await window.__av2.aplicar(P, 'como antes'); const E = window.__av2.estado('b3'); return { boton: !!document.querySelector('[data-a2="pdAbrir"]'), h: E.R['horm|0'].e, preg: !!document.querySelector('.a2-hp'), puesta: window.__av2.planMarcar({ obra: 'b3', accion: 'toda_terminada' }).err || '' }; });
    c(!r.boton && r.h === 'frag' && !r.preg && !!r.puesta, 'con __v163No: sin el botón, el hormigón a mano fragua como en la v162 y no hay puesta al día · ' + JSON.stringify(r));
    await A.ctx.close();
  }
  if (browser) await browser.close();
  return c.fin ? c.fin() : null;
})();
