// v153 · Corregir el cierre de una orden YA CERRADA, a mano y con el asistente (el caso real de Ángel: OT-2026-177).
//  0) el bug: con el asistente de la v152, proponer_editar_orden sobre la orden cerrada solo avisaba «puntos fijados» y no
//     había herramienta para corregir el cierre (ANTES=1 contra la v152 lo comprueba; sin ANTES, que ahora anda).
//  1) a mano (oficina): «✏ Corregir cierre» en el tablero → hoja → «Colocación de apoyo PRFV para el tablero» 0 → 1 hecha por
//     Pablo y Ariel → 9,25 cada uno (18,5 del baremo, rol × horas), Marcos y Bruno siguen con 4,8, avance del ítem 13 +0,7
//     (la parte del apoyo, por partes v108) una sola vez, historial, auditoría y aviso; «↶ Deshacer» vuelve a 0 (el ítem
//     también); «⭐ Puntos» › «La orden» y el Historial también tienen el botón.
//  2) el asistente (Worker simulado): verificar_orden → proponer_corregir_cierre → tarjeta antes → después (y la duda del
//     tablero: fotos de Marcos pero «no se hizo») → «Sí» → los mismos datos (porAsistente). proponer_editar_orden sobre una
//     cerrada deriva a la corrección.
//  3) quincena cerrada: aviso, la foto fija no se toca, la diferencia aparece como ajuste en la quincena abierta.
//  4) permisos: cuadrilla (celu), pañol y «solo mirar» no ven el botón ni reciben la herramienta, y el motor no los deja.
const { abrir, prueba } = require('./h');
const { datos153 } = require('./datos153');
const cel = process.argv[2] === 'cel';
const W = 'https://ema-ia.mdiaz-60f.workers.dev';
const CAP = process.env.CAP || '';
const ANTES = !!process.env.ANTES;
const SOLO = (x) => !process.env.SOLO || process.env.SOLO.indexOf(x) >= 0;
(async () => {
  const c = prueba('v153' + (ANTES ? ' antes' : '') + (cel ? ' cel' : ''));
  const MOD = { cel, espera: 5000, v145: true, v146: true, v147: true, v150: true, v151: true, v152: true, v153: true, sugerida: true, inicio: true, porPartes: true, ofPasos: true, tarjetas: true, nav: true, mtNuevo: true, iaPro: true, crew: true, https: true, antes: () => { window.__pmPausa = true; window.__cvSinMic = true; window.__hvPausa = true; window.__isNoAuto = true; } };
  let browser = null;
  const sesion = async (quien, op) => { const A = await abrir(Object.assign({ sesion: quien, datos: datos153(), browser }, MOD, op || {})); browser = A.browser; A.page.on('dialog', (x) => x.accept()); await A.page.waitForTimeout(1200); return A; };
  const db = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('stub.db') || '{}'));
  const txt = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; }, sel);
  const scrollX = (p) => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const foto = async (p, nombre, sel) => { if (!CAP) return; if (sel) await p.evaluate((s) => { const e = document.querySelector(s); e && e.scrollIntoView({ block: 'center' }); }, sel); await p.waitForTimeout(350); await p.screenshot({ path: CAP + '/' + nombre + '_' + (cel ? 'cel' : 'pc') + '.png' }); };
  const auds = async (p, acc) => Object.values((await db(p)).auditoria || {}).filter((a) => a.accion === acc);
  const pts = (o) => { const m = {}; ((o.cierre.puntos || {}).porPersona || []).forEach((x) => { m[x.nombre.split(' ')[0]] = x.pts; }); return m; };
  const item13 = (d) => (d.avanceObras.p9.valorItems.find((v) => v.itemPliego === '13') || {}).cantidadAvanzada;
  let n = 0;
  const usa = (name, input) => ({ id: 'msg_' + (++n), type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text: 'Miro.' }, { type: 'tool_use', id: 'tu_' + n, name, input }], stop_reason: 'tool_use', usage: { input_tokens: 900, output_tokens: 40 }, ema: { costoUsd: 0.01, version: 'v3-ia' } });
  const fin = (text) => ({ id: 'msg_' + (++n), type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text }], stop_reason: 'end_turn', usage: { input_tokens: 1000, output_tokens: 60 }, ema: { costoUsd: 0.02, version: 'v3-ia' } });
  async function worker(p) {
    const st = { pedidos: [], cola: [] };
    await p.route(W + '/ia', async (rt) => { let b = null; try { b = JSON.parse(rt.request().postData() || 'null'); } catch (e) { } st.pedidos.push(b); const f = st.cola.shift(); const x = typeof f === 'function' ? f(b) : f; return x ? rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(x) }) : rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(fin('Listo.')) }); });
    await p.route(W + '/mio', (rt) => rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, version: 'v3-ia', habilitado: true, quedanPreguntas: 30, topePreguntas: 30 }) }));
    await p.route(W + '/uso', (rt) => rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, version: 'v3-ia', gastoMes: 12.4, tope: 100, partes: {} }) }));
    await p.route(W + '/salud', (rt) => rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, version: 'v3-ia' }) }));
    return st;
  }
  const esperarIa = async (p) => { for (let i = 0; i < 120; i++) { await p.waitForTimeout(150); if (await p.evaluate(() => { const b = document.getElementById('iaEnviar'); return !!b && !b.disabled; })) return; } };
  const decir = async (p, sw, frase, guion) => { sw.cola.push(...guion); const n0 = sw.pedidos.length; await p.fill('#iaTxt', frase); await p.click('#iaEnviar'); await p.waitForTimeout(300); await esperarIa(p); await p.waitForTimeout(400); return sw.pedidos.slice(n0); };
  const resultado = (ped, i) => { const m = (ped[i] || {}).messages || []; const u = m[m.length - 1] || {}; const b = (u.content || []).find((x) => x.type === 'tool_result'); if (!b) return ''; const x = b.content; return typeof x === 'string' ? x : Array.isArray(x) ? x.map((y) => (y && y.type === 'text' ? y.text : JSON.stringify(y))).join(' ') : JSON.stringify(x); };
  const herramientas = (ped) => ((ped[0] || {}).tools || []).map((t) => t.name);
  const tablero = async (p) => {
    await p.evaluate(() => mostrarVista('parte')); await p.waitForTimeout(700);
    await p.click('#subtabsOrdenes .subtab[data-sub="tablero"]'); await p.waitForTimeout(1200);
    await p.click('#otTablero [data-tbs="cerr"]'); await p.waitForTimeout(1600);
  };

  // ================================================================= 0) el bug de antes (v152) y ahora
  if (SOLO('0')) {
    const A = await sesion('lucia', ANTES ? { v153: false } : {}); const p = A.page;
    const sw = await worker(p); await p.evaluate(() => window.__asistenteAbrir()); await p.waitForTimeout(700);
    const ped = await decir(p, sw, 'En la OT-2026-177 el apoyo del tablero lo pusieron Pablo y Ariel', [usa('proponer_editar_orden', { otId: 'OT-2026-177', cambios: { tareas: [{ tarea: 'Colocación de apoyo PRFV para el tablero', cantidad: 1, quien: 'Pablo Picone' }] } }), fin('Listo.')]);
    const r = resultado(ped, 1), tools = herramientas(ped);
    if (ANTES) {
      c(!tools.includes('proponer_corregir_cierre'), 'ANTES (v152): el asistente no tiene ninguna herramienta para corregir el cierre');
      c(/CERRADA y sus puntos quedaron fijados/.test(r) && !/corregir/i.test(await txt(p, '#iaChat .ia-conf:last-of-type h4')), 'ANTES (v152): proponer_editar_orden sobre la cerrada solo cambia la orden y avisa «puntos fijados» (no toca el cierre) · ' + r.slice(0, 140));
    } else {
      c(tools.includes('proponer_corregir_cierre'), 'oficina: el asistente recibe proponer_corregir_cierre');
      c(/pendiente_de_confirmacion/.test(r) && /Corregir el cierre/.test(await txt(p, '#iaChat .ia-conf:last-of-type h4')), 'proponer_editar_orden sobre la orden cerrada deriva a «✏ Corregir el cierre» (tarjeta) · ' + r.slice(0, 140));
      const sist = JSON.stringify((ped[0] || {}).system || '');
      c(/SÍ PODÉS CORREGIR EL CIERRE/.test(sist), 'el SISTEMA dice que puede corregir cierres');
      const d = await db(p); c(d.ordenesTrabajo.ot177.cierre.cantidades.poste_tablero == null, 'sin «Sí» no se cambió nada');
    }
    await A.page.context().close();
    if (ANTES) { await browser.close(); process.exit(c.fin() ? 1 : 0); }
  }

  // ================================================================= 1) a mano
  if (SOLO('1')) {
    const A = await sesion('lucia'); const p = A.page;
    await tablero(p);
    let r = await p.evaluate(() => { const card = document.querySelector('#otTablero .ot-tb-card[data-otid="ot177"]'); return { pe: !!(card && card.querySelector('.pe-btn')), cc: !!(card && card.querySelector('.cc-btn[data-ccabrir="ot177"]')) }; });
    c(r.pe && r.cc, 'la tarjeta cerrada del tablero tiene «⭐ Puntos» y «✏ Corregir cierre» · ' + JSON.stringify(r));
    await p.evaluate(() => document.querySelector('#otTablero .ot-tb-card[data-otid="ot177"] .cc-btn').scrollIntoView({ block: 'center' }));
    await p.click('#otTablero .ot-tb-card[data-otid="ot177"] .cc-btn'); await p.waitForTimeout(600);
    r = await p.evaluate(() => { const o = document.getElementById('ccOv'); return o ? { v7: o.classList.contains('v7-ov'), dlg: o.getAttribute('role'), x: !!o.querySelector('.v7-x[aria-label="Cerrar"]'), tareas: [...o.querySelectorAll('.cc-t .cc-tt b')].map((b) => b.textContent), arm: (o.querySelector('[data-cck="armado_tablero"] .cc-tt small') || {}).textContent || '' } : null; });
    c(r && r.v7 && r.dlg === 'dialog' && r.x && r.tareas.length === 3, 'hoja «✏ Corregir el cierre» (.v7-ov, role=dialog, ✕) con las 3 tareas · ' + JSON.stringify(r).slice(0, 200));
    c(/0 · no se hizo/.test(r.arm) && /La cuadrilla/.test(r.arm), 'cada tarea muestra el cierre y lo que mandó la cuadrilla (armado: «no se hizo» en el cierre, la cuadrilla dice otra cosa) · ' + r.arm.slice(0, 160));
    await p.selectOption('#ccOv [data-cch="poste_tablero"]', 'si'); await p.waitForTimeout(400);
    r = await p.evaluate(() => (document.querySelector('#ccOv [data-ccq="poste_tablero"]') || {}).value);
    c(r === '1', '«¿Se hizo?» Sí → cantidad 1 (la prevista) · ' + r);
    await p.click('#ccOv [data-ccp="poste_tablero"][data-ccn="Pablo Picone"]'); await p.waitForTimeout(300);
    await p.click('#ccOv [data-ccp="poste_tablero"][data-ccn="Ariel Lastra"]'); await p.waitForTimeout(400);
    r = await p.evaluate(() => [...document.querySelectorAll('#ccOv [data-ccpt="poste_tablero"]')].map((i) => i.dataset.ccn + '=' + i.value));
    c(r.join() === 'Pablo Picone=9.25,Ariel Lastra=9.25', 'Pablo y Ariel: 9,25 cada uno (18,5 del apoyo, rol × horas) · ' + r.join());
    r = await p.evaluate(() => ({ si: document.querySelector('#ccOv [data-cc="si"]').disabled, res: (document.querySelector('#ccOv .cc-res') || {}).textContent || '' }));
    c(r.si && /Pablo Picone\s*0\s*→\s*9,25/.test(r.res) && /Marcos Ríos\s*4,8\s*→\s*4,8/.test(r.res) && /9,6\s*→\s*28,1/.test(r.res) && /Ítem 13/.test(r.res) && /0\s*→\s*0,7 de 1/.test(r.res), 'resumen antes → después (puntos, total 9,6 → 28,1, ítem 13 0 → 0,7) y «Sí» apagado sin motivo · ' + r.res.replace(/\s+/g, ' ').slice(0, 260));
    await p.fill('#ccOv #ccMotivo', 'El apoyo lo colocaron Pablo y Ariel; en el cierre había quedado en 0'); await p.dispatchEvent('#ccOv #ccMotivo', 'change'); await p.waitForTimeout(400);
    await foto(p, 'hoja_corregir', '#ccOv .cc-res');
    if (cel) c((await scrollX(p)) <= 0, 'celu: sin scroll de costado');
    await p.click('#ccOv [data-cc="si"]'); await p.waitForTimeout(2200);
    let d = await db(p), o = d.ordenesTrabajo.ot177;
    c(o.cierre.cantidades.poste_tablero === 1 && o.cierre.cantidades.acometida === 1, 'el cierre queda con el apoyo en 1 (la acometida igual) · ' + JSON.stringify(o.cierre.cantidades));
    r = pts(o); c(r.Pablo === 9.25 && r.Ariel === 9.25 && r.Marcos === 4.8 && r.Bruno === 4.8 && o.cierre.puntos.total === 28.1, 'puntos fijos: Pablo 9,25 · Ariel 9,25 · Marcos 4,8 · Bruno 4,8 · total 28,1 · ' + JSON.stringify(r));
    r = await p.evaluate(() => { const z = window.puntosDeOrden(ordenesTrabajo.find((x) => x.id === 'ot177')); const zv = window.puntosDeOrden(ordenesTrabajo.find((x) => x.id === 'ot177'), true); const m = (q) => q.porPersona.map((x) => x.nombre.split(' ')[0] + ' ' + Math.round(x.pts * 100) / 100).join(); return { fijo: m(z), vivo: m(zv), t: zv.total }; });
    c(r.fijo === r.vivo && Math.abs(r.t - 28.1) < 0.01, 'si se recalcula con la cuenta de siempre da lo mismo (puntosTarea guardado) · ' + JSON.stringify(r));
    c(item13(d) === 0.7 && JSON.stringify(o.cierre.avanceItems) === JSON.stringify([{ id: '13', delta: 0.7, k: 'poste_tablero' }]), 'avance de GEORG NICOLAI: ítem 13 0 → 0,7 (la parte del apoyo) y anotado en la orden · ' + item13(d) + ' ' + JSON.stringify(o.cierre.avanceItems));
    const h = (o.cierre.puntosHist || []).slice(-1)[0] || {};
    c(h.tipo === 'corregir' && h.antes === 9.6 && h.despues === 28.1 && /Pablo y Ariel/.test(h.motivo) && h.por && h.porAsistente === false && h.personas.length === 2, 'historial: antes → después, por, motivo, porAsistente:false · ' + JSON.stringify(h).slice(0, 200));
    const au = await auds(p, 'ot_cierre_corregido');
    c(au.length === 1 && au[0].ref === 'ot177' && au[0].antes && au[0].despues && /Pablo y Ariel/.test(au[0].motivo), 'auditoría ot_cierre_corregido con antes, después y motivo');
    const av = Object.values(d.avisosPush || {}).filter((x) => /Puntos corregidos/.test(x.titulo));
    c(av.length === 2 && av.map((x) => x.clave).sort().join() === 'ariel lastra,pablo picone' && /9,25/.test(av[0].cuerpo), 'aviso «⭐ Puntos corregidos» solo a Pablo y Ariel · ' + av.map((x) => x.clave + ': ' + x.cuerpo).join(' | ').slice(0, 200));
    r = await txt(p, '#ccMsg'); c(/corregida/.test(r) && await p.evaluate(() => !!document.querySelector('#ccOv [data-cc="deshacer"]')), 'mensaje de listo y «↶ Deshacer» · ' + r.slice(0, 120));
    await foto(p, 'hoja_listo');
    // nunca dos veces: volver a pedir lo mismo no suma
    r = await p.evaluate(() => window.__corregirCierre.plan('ot177', [{ tarea: 'poste_tablero', cantidad: 1 }], 'x').err || '');
    c(/ya está así/.test(r), 'pedir otra vez 1 → «ya está así» (no suma dos veces) · ' + r);
    // deshacer
    await p.click('#ccOv [data-cc="deshacer"]'); await p.waitForTimeout(2200);
    d = await db(p); o = d.ordenesTrabajo.ot177; r = pts(o);
    c(o.cierre.cantidades.poste_tablero == null && r.Pablo === 0 && r.Ariel === 0 && r.Marcos === 4.8 && o.cierre.puntos.total === 9.6 && item13(d) === 0 && !(o.cierre.avanceItems || []).length && (o.cierre.puntosHist || []).length === 2, '«↶ Deshacer»: el apoyo vuelve a 0, Pablo y Ariel a 0, total 9,6, ítem 13 a 0 · ' + JSON.stringify({ r, i: item13(d), h: (o.cierre.puntosHist || []).length }));
    // otra vez, por el motor, con alguien de la nómina que no estaba en la orden (se suma)
    r = await p.evaluate(async () => { const P = window.__corregirCierre.plan('ot177', [{ tarea: 'poste_tablero', hecha: true, personas: ['Pablo', 'Hugo Paz'] }], 'lo puso Pablo con Hugo'); if (P.err) return P.err; const g = await window.__corregirCierre.aplicar(P); return g.ok ? 'ok' : g.err; });
    d = await db(p); o = d.ordenesTrabajo.ot177;
    c(r === 'ok' && o.personal.some((x) => x.nombre === 'Hugo Paz' && x.agregadoAlCorregir) && o.personalNombres.includes('hugo paz') && pts(o).Hugo > 0 && pts(o).Pablo > pts(o).Hugo, 'alguien de la nómina que no estaba se suma a la orden (personal y personalNombres) y el reparto va por rol × horas (Oficial > Ayudante) · ' + JSON.stringify(pts(o)));
    c(item13(d) === 0.7, 'y el ítem 13 vuelve a 0,7 (una sola vez)');
    await p.click('#ccOv [data-cc="x"]'); await p.waitForTimeout(300);
    // «⭐ Puntos» › «La orden» y el Historial
    await p.evaluate(() => window.__puntosEditar.abrir('ot177', 'orden')); await p.waitForTimeout(500);
    r = await p.evaluate(() => !!document.querySelector('#peOv [data-ccabrir="ot177"]'));
    c(r, '«⭐ Puntos» › «📋 La orden» tiene «✏ Corregir cierre»');
    await p.click('#peOv [data-ccabrir="ot177"]'); await p.waitForTimeout(500);
    c(await p.evaluate(() => !document.getElementById('peOv') && !!document.getElementById('ccOv')), 'y abre la hoja (cierra la de puntos)');
    await p.click('#ccOv .v7-x'); await p.waitForTimeout(300);
    c(await p.evaluate(() => !document.getElementById('ccOv')), '✕ cierra la hoja');
    await p.click('#subtabsOrdenes .subtab[data-sub="historial"]'); await p.waitForTimeout(2200);
    c(await p.evaluate(() => !!document.querySelector('#otBody .cc-btn[data-ccabrir]')), 'el Historial también tiene «✏ Corregir cierre»');
    const errs = (A.errores || []).filter((e) => !/Missing or insufficient permissions|permission-denied|ERR_|Failed to fetch|aborted|fetching the script/i.test(e));
    c(!errs.length, 'a mano: sin errores de JS ' + JSON.stringify(errs.slice(0, 3)));
    await A.page.context().close();
  }

  // ================================================================= 2) el asistente
  if (SOLO('2')) {
    const A = await sesion('lucia'); const p = A.page;
    const sw = await worker(p); await p.evaluate(() => window.__asistenteAbrir()); await p.waitForTimeout(700);
    const ped = await decir(p, sw, 'En la OT-2026-177 el apoyo PRFV del tablero lo pusieron Pablo y Ariel, corregilo', [
      usa('verificar_orden', { otId: 'OT-2026-177' }),
      usa('proponer_corregir_cierre', { otId: 'OT-2026-177', cambios: [{ tarea: 'Colocación de apoyo PRFV para el tablero', cantidad: 1, personas: ['Pablo Picone', 'Ariel Lastra'] }], motivo: 'el apoyo lo pusieron Pablo y Ariel' }),
      fin('Te dejé la corrección: confirmala en la tarjeta. Ojo: Marcos mandó fotos del tablero pero en el cierre quedó «no se hizo», ¿lo sumo?')]);
    const rv = resultado(ped, 1), rp = resultado(ped, 2);
    c(/no se hizo|0/.test(rv) && /armado|Armado/.test(rv), 'verificar_orden le muestra lo que mandó la cuadrilla · ' + rv.slice(0, 120));
    c(/pendiente_de_confirmacion/.test(rp) && /Pablo Picone: 0 → 9,25/.test(rp) && /Ariel Lastra: 0 → 9,25/.test(rp) && /9,6 → 28,1/.test(rp) && /ítem 13: 0 → 0,7/.test(rp), 'la herramienta devuelve puntos y avance antes → después · ' + rp.slice(0, 260));
    c(/Armado y conexionado del tablero general/.test(rp) && /Preguntá/.test(rp), 'y la duda: el tablero tiene fotos de Marcos pero en el cierre quedó «no se hizo» (para preguntar) · ' + (rp.match(/dudasEnOtrasTareas[^\]]*/) || [''])[0].slice(0, 200));
    let card = await txt(p, '#iaChat .ia-conf:last-of-type');
    c(/Corregir el cierre de OT-2026-177/.test(card) && /Colocación de apoyo PRFV/.test(card) && /Pablo Picone/.test(card) && /9,25/.test(card) && /Ítem 13/.test(card) && /Armado y conexionado/.test(card), 'tarjeta antes → después con puntos por persona, avance y la duda · ' + card.slice(0, 200));
    await foto(p, 'ia_tarjeta', '#iaChat .ia-conf:last-of-type');
    await p.click('#iaChat .ia-conf:last-of-type [data-iasi]'); await p.waitForTimeout(2500);
    const d = await db(p), o = d.ordenesTrabajo.ot177, r = pts(o);
    c(o.cierre.cantidades.poste_tablero === 1 && r.Pablo === 9.25 && r.Ariel === 9.25 && r.Marcos === 4.8 && r.Bruno === 4.8 && o.cierre.puntos.total === 28.1, 'con «Sí»: Pablo 9,25 · Ariel 9,25 · Marcos y Bruno 4,8 · ' + JSON.stringify(r));
    c(item13(d) === 0.7, 'ítem 13 0 → 0,7 una sola vez · ' + item13(d));
    const h = (o.cierre.puntosHist || []).slice(-1)[0] || {};
    c(h.porAsistente === true && /Pablo y Ariel/.test(h.motivo), 'historial con porAsistente:true');
    const au = await auds(p, 'ot_cierre_corregido');
    c(au.length === 1 && au[0].porAsistente === true && (await auds(p, 'asistente_editar')).length === 1, 'auditoría ot_cierre_corregido (porAsistente) y asistente_editar');
    card = await txt(p, '#iaChat .ia-conf:last-of-type');
    c(/corregida/.test(card), 'la tarjeta dice que quedó corregida · ' + card.slice(-160));
    await foto(p, 'ia_hecha', '#iaChat .ia-conf:last-of-type');
    // la orden ya no tiene diferencias: pedir lo mismo de nuevo → «ya está así»
    const ped2 = await decir(p, sw, 'Y pasá el armado del tablero a hecho por Marcos', [usa('proponer_corregir_cierre', { otId: 'OT-2026-177', cambios: [{ tarea: 'armado_tablero', hecha: true, personas: ['Marcos'] }], motivo: 'Marcos mandó las fotos del tablero' }), fin('Confirmalo.')]);
    const r2 = resultado(ped2, 1);
    c(/pendiente_de_confirmacion/.test(r2) && /Marcos Ríos: 4,8 → 16,8/.test(r2), 'segunda corrección (armado del tablero por Marcos: 4,8 → 16,8) · ' + r2.slice(0, 200));
    await p.click('#iaChat .ia-conf:last-of-type [data-iano]'); await p.waitForTimeout(800);
    c((await db(p)).ordenesTrabajo.ot177.cierre.cantidades.armado_tablero == null, 'con «No» no se cambia nada');
    if (cel) c((await scrollX(p)) <= 0, 'celu: sin scroll de costado');
    const errs = (A.errores || []).filter((e) => !/Missing or insufficient permissions|permission-denied|ERR_|Failed to fetch|aborted|fetching the script|prueba/i.test(e));
    c(!errs.length, 'asistente: sin errores de JS ' + JSON.stringify(errs.slice(0, 3)));
    await A.page.context().close();
  }

  // ================================================================= 3) quincena cerrada
  if (SOLO('3')) {
    const A = await sesion('lucia'); const p = A.page;
    await p.waitForTimeout(5000);   // Quincenas empieza a escuchar a los 5 s
    const q0 = JSON.stringify((await db(p)).cierresQuincena);
    let r = await p.evaluate(() => { const P = window.__corregirCierre.plan('ot150', [{ tarea: 'poste_tablero', cantidad: 1, personas: ['Pablo', 'Ariel'] }], 'tarde'); return P.err || P.avisos.join(' | '); });
    c(/ya está cerrada/.test(r) && /ajuste/.test(r), 'orden de una quincena cerrada: avisa que lo cerrado no se toca y la diferencia va como ajuste a la quincena abierta · ' + r.slice(0, 200));
    await p.evaluate(() => window.__corregirCierre.abrir('ot150')); await p.waitForTimeout(500);
    await p.selectOption('#ccOv [data-cch="poste_tablero"]', 'si'); await p.waitForTimeout(400);
    r = await txt(p, '#ccOv .cc-av');
    c(/ya está cerrada/.test(r), 'la hoja también lo avisa · ' + r.slice(0, 160));
    await foto(p, 'hoja_quincena', '#ccOv .cc-av');
    await p.click('#ccOv [data-ccp="poste_tablero"][data-ccn="Pablo Picone"]'); await p.waitForTimeout(300);
    await p.fill('#ccOv #ccMotivo', 'se cerró tarde'); await p.dispatchEvent('#ccOv #ccMotivo', 'change'); await p.waitForTimeout(300);
    await p.click('#ccOv [data-cc="si"]'); await p.waitForTimeout(2200);
    const d = await db(p);
    c(JSON.stringify(d.cierresQuincena) === q0, 'la foto fija de la quincena cerrada no se tocó');
    c(pts(d.ordenesTrabajo.ot150).Pablo === 18.5, 'Pablo (solo) se lleva los 18,5 en esa orden · ' + JSON.stringify(pts(d.ordenesTrabajo.ot150)));
    r = await p.evaluate(() => (window.__quincenas.ajustesPendientes() || []).filter((a) => /Pablo/.test(a.nombre)).map((a) => a.nombre + ' ' + a.pts));
    c(r.length === 1 && /18\.5/.test(r[0]), 'Quincenas: la diferencia aparece como ajuste para pagar en la quincena abierta · ' + JSON.stringify(r));
    await A.page.context().close();
  }

  // ================================================================= 4) permisos
  if (SOLO('4')) {
    for (const quien of ['juan', 'pan', 'mir']) {
      const A = await sesion(quien, quien === 'juan' ? { cel: true } : {}); const p = A.page;
      const sw = await worker(p);
      let r = await p.evaluate(() => ({ puede: window.__corregirCierre.puede(), boton: !!document.querySelector('.cc-btn') }));
      const g = await p.evaluate(async () => { const P = window.__corregirCierre.plan('ot177', [{ tarea: 'poste_tablero', cantidad: 1 }], 'x'); if (P.err) return 'plan: ' + P.err; const x = await window.__corregirCierre.aplicar(P); return x.ok ? 'ok' : x.err; });
      c(!r.puede && !r.boton && /no puede|cerrada|encontré/.test(g), `${quien}: no ve «✏ Corregir cierre» y el motor no lo deja · ` + g);
      await p.evaluate(() => window.__asistenteAbrir && window.__asistenteAbrir()); await p.waitForTimeout(900);
      const ped = await decir(p, sw, 'corregí el cierre de la OT-2026-177', [fin('No puedo.')]);
      const tools = herramientas(ped);
      c(tools.length > 0 && !tools.includes('proponer_corregir_cierre'), `${quien}: el asistente no recibe proponer_corregir_cierre (${tools.length} herramientas)`);
      const d = await db(p); c(d.ordenesTrabajo.ot177.cierre.cantidades.poste_tablero == null, `${quien}: la orden no cambió`);
      await A.page.context().close();
    }
  }
  await browser.close(); process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
