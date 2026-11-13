// v152 · Mover fotos: a mano y con el asistente (obra, columna/tipo, «Fotos sin obra», orden).
//  0) el bug: con el asistente de antes, «pasá estas fotos…» y «esta foto es de la Col 6» no se podían (ANTES=1 contra la v151
//     comprueba que falla; sin ANTES, que ahora anda).
//  1) a mano, una foto, desde la galería (visor del legajo): Col 5 → Col 6 en la misma orden; ficha, adjunto y orden; la
//     verificación v150 pasa de 2 de 3 a 3 de 3; movidaDe + historial; auditoría foto_mover; tipo Zanja → Tablero → Caja.
//  2) a mano, varias, desde «☑ Elegir fotos» del legajo: de LOS ÁLAMOS (OT-120) a LAS ACACIAS (OT-121) con motivo obligatorio;
//     salen de la orden de origen y entran en la de destino con su tarea; el legajo viejo ya no las muestra.
//  3) «📷 Fotos sin obra» → «Asignar a una obra» (BULEVARES).  4) de una orden a otra (OT-122 → OT-130, otra obra).
//  5) permisos: la cuadrilla (celu) solo cambia la columna de SUS fotos de SU orden abierta (sin obra ni orden; la ficha no se
//     toca, el legajo la muestra bien igual); «Era de otra columna» de Modo obra; «solo mirar» no ve «Mover».
//  6) el asistente (Worker simulado): las 4 frases → buscar_fotos → tarjeta antes → después → «Sí» → movidas (porAsistente).
const { abrir, prueba } = require('./h');
const { datos152 } = require('./datos152');
const cel = process.argv[2] === 'cel';
const W = 'https://ema-ia.mdiaz-60f.workers.dev';
const CAP = process.env.CAP || '';
const ANTES = !!process.env.ANTES;
const SOLO = (x) => !process.env.SOLO || process.env.SOLO.indexOf(x) >= 0;
(async () => {
  const c = prueba('v152' + (ANTES ? ' antes' : '') + (cel ? ' cel' : ''));
  const MOD = { cel, espera: 5000, v145: true, v146: true, v147: true, v150: true, v151: true, v152: true, sugerida: true, inicio: true, porPartes: true, ofPasos: true, tarjetas: true, nav: true, mtNuevo: true, iaPro: true, crew: true, lgPleg: false, https: true, antes: () => { window.__pmPausa = true; window.__cvSinMic = true; window.__hvPausa = true; window.__isNoAuto = true; } };
  let browser = null;
  const sesion = async (quien, op) => { const A = await abrir(Object.assign({ sesion: quien, datos: datos152(), browser }, MOD, op || {})); browser = A.browser; A.page.on('dialog', (x) => x.accept()); await A.page.waitForTimeout(1200); return A; };
  const db = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('stub.db') || '{}'));
  const txt = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; }, sel);
  const ver = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); return !!e && e.getBoundingClientRect().height > 0 && getComputedStyle(e).visibility !== 'hidden' && !e.hidden; }, sel);
  const scrollX = (p) => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const foto = async (p, nombre, sel) => { if (!CAP) return; if (sel) await p.evaluate((s) => { const e = document.querySelector(s); e && e.scrollIntoView({ block: 'center' }); }, sel); await p.waitForTimeout(350); await p.screenshot({ path: CAP + '/' + nombre + '_' + (cel ? 'cel' : 'pc') + '.png' }); };
  const auds = async (p, acc) => Object.values((await db(p)).auditoria || {}).filter((a) => a.accion === acc || a.tipo === acc || JSON.stringify(a).indexOf('"' + acc + '"') >= 0);
  const legajo = async (p, id) => { await p.evaluate((i) => window.abrirLegajo(i), id); await p.waitForTimeout(1800); };
  const hoja = async (p) => { for (let i = 0; i < 30; i++) { if (await p.evaluate(() => !!document.querySelector('#mfOv [data-mf="si"]') || !!document.querySelector('#mfOv .mf-bloq'))) return true; await p.waitForTimeout(150); } return false; };
  const elegirObra = async (p, q, id) => { await p.fill('#mfObraQ', q); await p.waitForTimeout(250); await p.click('#mfOv [data-mfobra="' + id + '"]'); await p.waitForTimeout(250); };
  const si = async (p) => { await p.click('#mfOv [data-mf="si"]'); for (let i = 0; i < 40; i++) { await p.waitForTimeout(150); if (!(await p.evaluate(() => !!document.getElementById('mfOv')))) break; } await p.waitForTimeout(500); };
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
  const esperarIa = async (p) => { for (let i = 0; i < 120; i++) { await p.waitForTimeout(150); if (await p.evaluate(() => { const b = document.getElementById('iaEnviar'); return !!b && !b.disabled; })) return; } };
  const decir = async (p, sw, frase, guion) => { sw.cola.push(...guion); const n0 = sw.pedidos.length; await p.fill('#iaTxt', frase); await p.click('#iaEnviar'); await p.waitForTimeout(300); await esperarIa(p); await p.waitForTimeout(300); return sw.pedidos.slice(n0); };
  const resultado = (ped, i) => { const m = (ped[i] || {}).messages || []; const u = m[m.length - 1] || {}; const b = (u.content || []).find((x) => x.type === 'tool_result'); if (!b) return ''; const x = b.content; return typeof x === 'string' ? x : Array.isArray(x) ? x.map((y) => (y && y.type === 'text' ? y.text : JSON.stringify(y))).join(' ') : JSON.stringify(x); };

  // ================================================================= 0) el bug de antes (v151) y ahora
  if (SOLO('0')) {
    const A = await sesion('lucia', ANTES ? { v152: false } : {}); const p = A.page;
    const sw = await worker(p); await p.evaluate(() => window.__asistenteAbrir()); await p.waitForTimeout(700);
    let ped = await decir(p, sw, 'Pasá la foto de la Col 4 de Los Álamos a Las Acacias', [usa('ver_fotos', { obraId: 'Los Álamos' }), usa('proponer_mover_fotos', { fotos: ['f4'], obraDestino: 'Las Acacias', motivo: 'la sacaron en Las Acacias' }), fin('Listo.')]);
    const r1 = resultado(ped, 2), r0 = resultado(ped, 1);
    let ped2 = await decir(p, sw, 'Esta foto es de la Col 6', [usa('proponer_mover_fotos', { fotos: ['f5b'], columna: 'Col 6' }), fin('Listo.')]);
    const r2 = resultado(ped2, 1);
    if (ANTES) {
      c(/no conozco/.test(r1), 'ANTES (v151): «pasá la foto…» → la herramienta dice «Hay fotos que no conozco: usá primero ubicar_fotos» (ver_fotos no da los id) · ' + r1.slice(0, 120));
      c(!/"id":"f4"/.test(r0), 'ANTES (v151): ver_fotos no devuelve el id de cada foto');
      c(/Falta|no conozco|obra/.test(r2) && !(await p.evaluate(() => !!document.querySelector('#iaChat .ia-conf'))), 'ANTES (v151): «esta foto es de la Col 6» no se puede (no hay destino por columna) y no sale tarjeta · ' + r2.slice(0, 120));
    } else {
      c(/"id":"f4"/.test(r0), 'ahora ver_fotos devuelve el id de cada foto');
      c(/pendiente_de_confirmacion/.test(r1) && !/no conozco/.test(r1), 'ahora «pasá la foto…» con el id de ver_fotos arma la propuesta · ' + r1.slice(0, 100));
      c(/pendiente_de_confirmacion/.test(r2), 'ahora «esta foto es de la Col 6» arma la propuesta (columna) · ' + r2.slice(0, 100));
      c((await p.evaluate(() => document.querySelectorAll('#iaChat .ia-conf').length)) === 2, 'dos tarjetas para confirmar (nada se movió todavía)');
      const d0 = await db(p); c(d0.fotosObra.fo4.plazaId === 'p1' && d0.fotosObra.fo5b.num === 'Col 5', 'sin el «Sí» no se cambió nada');
    }
    c(A.errores.length === 0, 'sin errores en la consola' + (A.errores.length ? ': ' + A.errores.slice(0, 2).join(' | ') : ''));
    await A.ctx.close();
    if (ANTES) { process.exit(c.fin() ? 1 : 0); }
  }

  // ================================================================= 1) una foto, desde la galería: columna dentro de la orden
  if (SOLO('1')) {
    const A = await sesion('lucia'); const p = A.page;
    const v0 = await p.evaluate(() => { const v = window.__verifOt.verifOt('a120'); return { res: v.res, h: v.tareas[0].hechas, si: v.tareas[0].si.map((u) => u.num).join() }; });
    c(v0.si === 'Col 4,Col 5', 'antes: la verificación de la OT-120 tiene detalle de 2 columnas (Col 4 y Col 5: las dos fotos dicen «Col 5») · ' + JSON.stringify(v0));
    await legajo(p, 'p1');
    c(await p.evaluate(() => !!document.querySelector('#lgFotos [data-lgfoto="f5b"]')), 'el legajo de LOS ÁLAMOS muestra la foto');
    await p.click('#lgFotos [data-lgfoto="f5b"]'); await p.waitForTimeout(1200);
    c(await ver(p, '#gpVisor [data-gp="mover"]'), 'visor: el botón «↔ Mover» está a la vista');
    await foto(p, 'visor_mover');
    await p.click('#gpVisor [data-gp="mover"]'); c(await hoja(p), 'se abre la hoja «¿A dónde la pasás?»');
    c(await p.evaluate(() => { const o = document.getElementById('mfOv'); const r = o.getBoundingClientRect(); const z = +getComputedStyle(o).zIndex; return o.classList.contains('v7-ov') && o.getAttribute('role') === 'dialog' && !!o.querySelector('.v7-x[aria-label="Cerrar"]') && z > 10080; }), 'la hoja es .v7-ov, role=dialog, con ✕ y va encima del visor');
    c(await p.evaluate(() => [...document.querySelectorAll('#mfNum option')].map((o) => o.value).join(',').indexOf('Col 1,Col 2,Col 3,Col 4,Col 5,Col 6') >= 0), 'la lista de columnas sale de la obra (Col 1 a Col 6)');
    await p.selectOption('#mfNum', 'Col 6'); await p.waitForTimeout(300);
    const res = await txt(p, '#mfOv .mf-res2');
    c(/Col 5/.test(res) && /Col 6/.test(res) && /OT-2026-120/.test(res), 'resumen antes → después: «… OT-2026-120 · Columna Col 5 → … Col 6» · ' + res.slice(0, 140));
    c(!(await p.evaluate(() => document.querySelector('#mfOv [data-mf="si"]').disabled)), 'misma obra: el motivo no es obligatorio («Sí, mover» habilitado)');
    await foto(p, 'hoja_columna');
    await si(p);
    const d1 = await db(p), fo = d1.fotosObra.fo5b, of = d1.ordenesTrabajo.a120.campo.fotos.f5b, ad = d1.adjuntos.f5b;
    c(of && of.num === 'Col 6' && of.k === 'montaje_prfv' && of.movidaDe && of.movidaDe.num === 'Col 5', 'la orden: campo.fotos.f5b → Col 6 (misma tarea), con movidaDe {num: Col 5}');
    c(fo.num === 'Col 6' && fo.movidaDe.num === 'Col 5' && fo.movidaDe.otId === 'a120' && Array.isArray(fo.movidaHist) && fo.movidaHist.length === 1 && /luc/i.test(fo.movidaDe.por), 'la ficha del legajo: Col 6, movidaDe y movidaHist (1) con quién');
    c(ad.num === 'Col 6' && !!ad.movidaDe && ad.dataUrl, 'el adjunto: Col 6 (la imagen no se toca)');
    const v1 = await p.evaluate(() => { const v = window.__verifOt.verifOt('a120'); return { res: v.res, h: v.tareas[0].hechas, si: v.tareas[0].si.map((u) => u.num).join() }; });
    c(v1.h === 3 && v1.si === 'Col 4,Col 5,Col 6', 'la verificación v150 se recalcula: 3 de 3 con detalle (Col 4, Col 5 y Col 6) · ' + JSON.stringify(v1));
    c(await p.evaluate(() => window.__hecho.nombresHechos ? true : true) && await p.evaluate(() => { const u = window.__hecho.deObra('p1').U; return !!u['montaje_prfv|col 6']; }), 'la planilla de columnas (__hecho) ya tiene la Col 6');
    await p.waitForTimeout(800);
    c(await p.evaluate(() => [...document.querySelectorAll('#lgFotos .lg-grupo h4')].some((h) => /Columna Col 6/.test(h.textContent))), 'el legajo se redibuja con el grupo «Columna Col 6»');
    const au = await auds(p, 'foto_mover');
    c(au.length === 1 && /Col 5/.test(JSON.stringify(au[0])) && /Col 6/.test(JSON.stringify(au[0])), 'auditoría foto_mover (de → a)');
    // tipo: Zanja → Tablero → Caja (historial)
    const z = await p.evaluate(async () => { const a = await window.__moverFoto.mover(['z1'], { cat: 'tablero' }, ''); const b = await window.__moverFoto.mover(['z1'], { cat: 'caja' }, 'era la caja'); return { a: a.ok, b: b.ok }; });
    const d2 = await db(p), fz = d2.fotosObra.foz;
    c(z.a === 1 && z.b === 1 && fz.cat === 'caja' && fz.movidaDe.cat === 'tablero' && fz.movidaHist.length === 2 && fz.movidaHist[0].cat === 'zanja', 'tipo Zanja → Tablero → Caja: el historial guarda las dos (zanja, tablero) · ' + JSON.stringify(fz.movidaHist.map((x) => x.cat)));
    const ig = await p.evaluate(async () => (await window.__moverFoto.mover(['z1'], { cat: 'caja' }, '')).mal.map((m) => m.motivo).join());
    c(/ya está ahí/.test(ig), 'mover a donde ya está no hace nada («ya está ahí»)');
    c(await scrollX(p) <= 0, 'sin scroll de costado');
    c(A.errores.length === 0, 'sin errores en la consola' + (A.errores.length ? ': ' + A.errores.slice(0, 2).join(' | ') : ''));
    await A.ctx.close();
  }

  // ================================================================= 2) varias, desde «☑ Elegir fotos» del legajo: a otra obra y otra orden
  if (SOLO('2')) {
    const A = await sesion('lucia'); const p = A.page;
    await legajo(p, 'p1');
    await p.click('#lgFotosSec [data-fg="elegir"]'); await p.waitForTimeout(300);
    await p.click('#lgFotos [data-lgfoto="f4"]'); await p.waitForTimeout(150); await p.click('#lgFotos [data-lgfoto="f5"]'); await p.waitForTimeout(300);
    c(/2 elegidas/.test(await txt(p, '#gpBarra')) && await ver(p, '#gpBarra [data-gpb="mover"]') && !(await p.evaluate(() => document.querySelector('#gpBarra [data-gpb="mover"]').disabled)), '«☑ Elegir fotos» del legajo con 2 elegidas: botón «↔ Mover» en la barra');
    await foto(p, 'legajo_elegir');
    await p.click('#gpBarra [data-gpb="mover"]'); await hoja(p);
    await elegirObra(p, 'acacias', 'p2');
    c(/LAS ACACIAS/.test(await txt(p, '#mfOv .mf-obra')) && /cambia/.test(await txt(p, '#mfOv .mf-obra')), 'buscador de obra: LAS ACACIAS elegida («cambia»)');
    await p.selectOption('#mfOt', 'b121'); await p.waitForTimeout(250);
    c(await p.evaluate(() => document.querySelector('#mfOv [data-mf="si"]').disabled), 'cambia de obra: sin motivo «Sí, mover» queda apagado');
    await p.fill('#mfMot', 'las sacó Marcos en Las Acacias'); await p.waitForTimeout(150);
    c(!(await p.evaluate(() => document.querySelector('#mfOv [data-mf="si"]').disabled)), 'con el motivo se habilita');
    const res = await txt(p, '#mfOv .mf-res2');
    c(/LOS ÁLAMOS · OT-2026-120/.test(res) && /LAS ACACIAS · OT-2026-121/.test(res), 'resumen: LOS ÁLAMOS · OT-2026-120 → LAS ACACIAS · OT-2026-121 · ' + res.slice(0, 160));
    await foto(p, 'hoja_obra_orden');
    await si(p);
    const d = await db(p), oA = d.ordenesTrabajo.a120.campo, oB = d.ordenesTrabajo.b121.campo;
    c(!oA.fotos.f4 && !oA.fotos.f5 && oA.fotosMovidas && oA.fotosMovidas.f4 && oA.fotosMovidas.f4.a === 'b121', 'la orden de origen: las fotos salen de campo.fotos y queda campo.fotosMovidas (a dónde fueron)');
    c(oB.fotos && oB.fotos.f4 && oB.fotos.f4.k === 'montaje_prfv' && oB.fotos.f4.num === 'Col 4' && /^data:image/.test(oB.fotos.f4.mini || '') && oB.fotos.f4.movidaDe.plazaId === 'p1', 'la orden de destino: campo.fotos con la tarea (izaje), la columna, la miniatura y movidaDe');
    c(d.fotosObra.fo4.plazaId === 'p2' && d.fotosObra.fo4.otId === 'b121' && d.fotosObra.fo4.otNumero === 'OT-2026-121' && d.fotosObra.fo5.movidaDe.motivo === 'las sacó Marcos en Las Acacias', 'las fichas: obra p2, orden OT-2026-121, con el motivo');
    c(d.adjuntos.f4.plazaId === 'p2' && d.adjuntos.f4.otId === 'b121', 'los adjuntos: obra y orden nuevas');
    await p.waitForTimeout(800);
    c(!(await p.evaluate(() => !!document.querySelector('#lgFotos [data-lgfoto="f4"]'))), 'el legajo de LOS ÁLAMOS ya no las muestra');
    await legajo(p, 'p2');
    c(await p.evaluate(() => !!document.querySelector('#lgFotos [data-lgfoto="f4"]') && !!document.querySelector('#lgFotos [data-lgfoto="f5"]')), 'el legajo de LAS ACACIAS las muestra');
    const v = await p.evaluate(() => ({ a: window.__verifOt.verifOt('a120').tareas[0].si.filter((u) => u.foto).length, b: window.__verifOt.verifOt('b121').tareas[0].si.map((u) => u.num).join() }));
    c(v.a === 1 && /Col 4/.test(v.b), 'la verificación: en la OT-120 queda solo la foto f5b; la OT-121 ya tiene Col 4 y Col 5 con foto · ' + JSON.stringify(v));
    c((await auds(p, 'foto_mover')).length === 1, 'una auditoría foto_mover para las 2');
    c(A.errores.length === 0, 'sin errores en la consola' + (A.errores.length ? ': ' + A.errores.slice(0, 2).join(' | ') : ''));
    await A.ctx.close();
  }

  // ================================================================= 3) «Fotos sin obra» → una obra · 4) de una orden a otra
  if (SOLO('3')) {
    const A = await sesion('lucia'); const p = A.page;
    await p.evaluate(() => window.mostrarVista('obras')); await p.waitForTimeout(800);
    await p.click('#fsoBtn'); await p.waitForTimeout(1200);
    c(await ver(p, '#fsoOv [data-mffso="elegir"]'), '«📷 Fotos sin obra»: botón «☑ Elegir para asignar a una obra»');
    await p.click('#fsoOv [data-mffso="elegir"]'); await p.waitForTimeout(200);
    await p.click('#fsoOv .fso-f[data-fsoadj="s1"]'); await p.click('#fsoOv .fso-f[data-fsoadj="s2"]'); await p.waitForTimeout(200);
    c(/2 elegidas/.test(await txt(p, '#fsoOv .mf-fsobar')) && !(await p.evaluate(() => !!document.getElementById('gpVisor'))), 'tocar elige (no abre la foto): «2 elegidas»');
    await foto(p, 'fso_elegir', '#fsoOv .mf-fsobar');
    await p.click('#fsoOv [data-mffso="asignar"]'); await hoja(p);
    c(/Asignar a una obra/.test(await txt(p, '#mfOv h3')), 'la hoja dice «Asignar a una obra»');
    await elegirObra(p, 'bulev', 'p3'); await p.fill('#mfMot', 'son de Bulevares'); await p.waitForTimeout(150);
    await foto(p, 'fso_asignar');
    await si(p);
    const d = await db(p);
    c(d.fotosObra.fs1.plazaId === 'p3' && d.fotosObra.fs2.plazaId === 'p3' && d.fotosObra.fs1.movidaDe.plazaId === '__sinObra' && d.adjuntos.s1.plazaId === 'p3', 'las 2 fotos pasan a BULEVARES (ficha y adjunto), movidaDe «Fotos sin obra»');
    c(!(await p.evaluate(() => !!document.querySelector('#fsoOv .fso-f[data-fsoadj="s1"]'))), 'salen de la lista de «Fotos sin obra»');
    // 4) de una orden a otra (OT-2026-122 de BULEVARES → OT-2026-130 de LOS ÁLAMOS), por la hoja
    await p.evaluate(() => { const o = document.getElementById('fsoOv'); if (o) o.hidden = true; });
    await p.evaluate(() => window.__moverFoto.abrir(['f9'])); await hoja(p);
    await elegirObra(p, 'alamos', 'p1'); await p.selectOption('#mfOt', 'h130'); await p.waitForTimeout(200); await p.fill('#mfMot', 'la foto es de Los Álamos'); await p.waitForTimeout(150);
    const r4 = await txt(p, '#mfOv .mf-res2');
    c(/BULEVARES · OT-2026-122/.test(r4) && /LOS ÁLAMOS · OT-2026-130/.test(r4), 'orden → orden: BULEVARES · OT-2026-122 → LOS ÁLAMOS · OT-2026-130');
    await si(p);
    const d4 = await db(p);
    c(!d4.ordenesTrabajo.d122.campo.fotos.f9 && d4.ordenesTrabajo.h130.campo.fotos.f9 && d4.ordenesTrabajo.h130.campo.fotos.f9.k === 'montaje_prfv' && d4.fotosObra.fo9.otId === 'h130' && d4.fotosObra.fo9.plazaId === 'p1', 'sale de la OT-122 y entra en la OT-130 (tarea izaje); la ficha dice OT-130 y LOS ÁLAMOS');
    c(A.errores.length === 0, 'sin errores en la consola' + (A.errores.length ? ': ' + A.errores.slice(0, 2).join(' | ') : ''));
    await A.ctx.close();
  }

  // ================================================================= 5) permisos: cuadrilla (lo suyo, solo columna) y «solo mirar» (nada)
  if (SOLO('5')) {
    const A = await sesion('juan'); const p = A.page;
    const pv = await p.evaluate(() => ({ suya: window.__moverFoto.puedeVer('hf1'), cerrada: window.__moverFoto.puedeVer('g1'), ofi: window.__moverFoto.oficina(), alguna: window.__moverFoto.puedeAlguna() }));
    c(pv.suya === true && pv.cerrada === false && pv.ofi === false, 'cuadrilla: puede su foto de su orden abierta (OT-130), no la de una orden cerrada (OT-110) · ' + JSON.stringify(pv));
    await p.evaluate(() => window.__moverFoto.abrir(['hf1'])); await hoja(p);
    c(/¿De qué columna era\?/.test(await txt(p, '#mfOv h3')) && !(await p.evaluate(() => !!document.getElementById('mfObraQ') || !!document.getElementById('mfOt'))), 'la hoja de la cuadrilla: «¿De qué columna era?», sin obra ni orden');
    await p.selectOption('#mfNum', 'Col 2'); await p.waitForTimeout(200);
    await foto(p, 'cuadrilla_columna');
    await si(p);
    const d = await db(p);
    c(d.ordenesTrabajo.h130.campo.fotos.hf1.num === 'Col 2' && d.ordenesTrabajo.h130.campo.fotos.hf1.movidaDe.num === 'Col 1', 'se cambia en SU orden (campo.fotos.hf1 → Col 2)');
    c(d.fotosObra.foh.num === 'Col 1', 'la ficha del legajo no se toca (la base no deja a la cuadrilla): el legajo la corrige al mostrarla');
    const cr = await p.evaluate(() => window.__moverFoto.corr({ adjId: 'hf1', cat: 'columna', num: 'Col 1' }).num);
    c(cr === 'Col 2', 'corrección del legajo: la ficha se muestra como Col 2');
    const otra = await p.evaluate(async () => (await window.__moverFoto.mover(['hf1'], { plazaId: 'p2' }, 'x')).mal.map((m) => m.motivo).join());
    c(/solo podés cambiar la columna/.test(otra), 'a otra obra no: «Desde el celu solo podés cambiar la columna…»');
    // Modo obra: «Era de otra columna» (la foto recién guardada: el botón lleva la hora de la foto)
    const ts = await p.evaluate(() => ordenesTrabajo.find((o) => o.id === 'h130').campo.fotos.hf1.ts);
    await p.evaluate((t) => { const d = document.createElement('div'); d.id = 'cdHoja'; d.innerHTML = '<button type="button" class="cd-otracol" data-mfcd="h130" data-mfpe="pend_' + t.toString(36) + 'abcd">↔ Era de otra columna</button>'; document.body.appendChild(d); }, ts);
    await p.click('#cdHoja [data-mfcd]'); c(await hoja(p), 'Modo obra: «↔ Era de otra columna» abre la misma hoja con esa foto');
    c(/Col 2/.test(await txt(p, '#mfOv .mf-res2')), '… la foto correcta (la que ahora es Col 2)');
    await p.click('#mfOv [data-mf="x"]');
    c(A.errores.filter((e) => !/permission/.test(e)).length === 0, 'sin errores en la consola' + (A.errores.length ? ': ' + A.errores.slice(0, 2).join(' | ') : ''));
    await A.ctx.close();
    const B = await sesion('mirta'); const q = B.page;
    const m = await q.evaluate(() => ({ v: window.__moverFoto.puedeVer('f4'), a: window.__moverFoto.puedeAlguna(), mv: null }));
    await q.evaluate(() => window.emaGaleria && window.emaGaleria.abrir([{ id: 'f4' }], 0)); await q.waitForTimeout(800);
    c(m.v === false && m.a === false && !(await ver(q, '#gpVisor [data-gp="mover"]')), '«solo mirar»: no puede mover y el visor no muestra «Mover»');
    const mm = await q.evaluate(async () => (await window.__moverFoto.mover(['f4'], { num: 'Col 9' }, '')).ok);
    c(mm === 0 && (await db(q)).fotosObra.fo4.num === 'Col 4', '«solo mirar»: el motor tampoco mueve');
    await B.ctx.close();
  }

  // ================================================================= 6) el asistente: las 4 frases
  if (SOLO('6')) {
    const A = await sesion('lucia'); const p = A.page;
    const sw = await worker(p); await p.evaluate(() => window.__asistenteAbrir()); await p.waitForTimeout(700);
    // a) obra → obra
    let ped = await decir(p, sw, 'Pasá estas fotos de Los Álamos a Las Acacias: las de Col 4 y Col 5 de ayer', [usa('buscar_fotos', { obraId: 'Los Álamos', fecha: 'ayer' }), usa('proponer_mover_fotos', { fotos: ['f4', 'f5'], obraDestino: 'Las Acacias', motivo: 'son de Las Acacias' }), fin('Te dejé la tarjeta.')]);
    const herr = ((ped[0] || {}).tools || []).map((t) => t.name), sis = JSON.stringify((ped[0] || {}).system || '');
    c(herr.indexOf('buscar_fotos') >= 0 && herr.indexOf('proponer_mover_fotos') >= 0 && /SÍ PODÉS MOVER FOTOS/.test(sis), 'la oficina recibe buscar_fotos y proponer_mover_fotos, y el system dice que SÍ puede mover fotos');
    const rb = resultado(ped, 1);
    c(/"id":"f4"/.test(rb) && /"id":"f5"/.test(rb) && /"columna":"Col 4"/.test(rb), 'buscar_fotos devuelve los id con columna, hora y quién');
    let card = await txt(p, '#iaChat .ia-conf:last-of-type');
    c(/Mover 2 fotos/.test(card) && /LOS ÁLAMOS/.test(card) && /LAS ACACIAS/.test(card) && await p.evaluate(() => !!document.querySelector('#iaChat .ia-conf:last-of-type .ia-fotos img')), 'tarjeta «📷 Mover 2 fotos» con miniaturas y antes → después · ' + card.slice(0, 120));
    await foto(p, 'ia_tarjeta', '#iaChat .ia-conf:last-of-type');
    await p.click('#iaChat .ia-conf:last-of-type [data-iasi]'); await p.waitForTimeout(1800);
    let d = await db(p);
    c(d.fotosObra.fo4.plazaId === 'p2' && !d.ordenesTrabajo.a120.campo.fotos.f4 && d.fotosObra.fo4.movidaDe.porAsistente === true, '«Sí»: movidas a LAS ACACIAS (y fuera de la OT-120), con porAsistente');
    // b) columna
    ped = await decir(p, sw, 'La foto de las ' + (await p.evaluate(() => { const t = ordenesTrabajo.find((o) => o.id === 'a120').campo.fotos.f5b.ts, x = new Date(t); return String(x.getHours()).padStart(2, '0') + ':' + String(x.getMinutes()).padStart(2, '0'); })) + ' de la OT-120 es en realidad la Col 6', [(b) => usa('buscar_fotos', { otId: 'OT-2026-120', hora: (JSON.stringify(b.messages).match(/las (\d\d:\d\d)/) || [])[1] }), usa('proponer_mover_fotos', { fotos: ['f5b'], columna: '6' }), fin('Listo para confirmar.')]);
    const rb2 = resultado(ped, 1);
    c(/"id":"f5b"/.test(rb2) && !/"id":"f5"[,}]/.test(rb2), '«la de las HH:MM»: buscar_fotos por hora encuentra solo esa foto');
    card = await txt(p, '#iaChat .ia-conf:last-of-type');
    c(/Col 5/.test(card) && /Col 6/.test(card), 'tarjeta: Col 5 → Col 6 («6» se entiende como «Col 6»)');
    await p.click('#iaChat .ia-conf:last-of-type [data-iasi]'); await p.waitForTimeout(1500);
    d = await db(p); c(d.ordenesTrabajo.a120.campo.fotos.f5b.num === 'Col 6' && d.fotosObra.fo5b.num === 'Col 6', '«Sí»: la foto queda en Col 6 (orden y ficha)');
    // c) «Fotos sin obra» → obra
    ped = await decir(p, sw, 'Asigná las fotos sin obra a Bulevares', [usa('buscar_fotos', { obraId: 'sin_obra' }), usa('proponer_mover_fotos', { fotos: ['s1', 's2'], obraDestino: 'Bulevares' }), fin('Listo para confirmar.')]);
    c(/"id":"s1"/.test(resultado(ped, 1)), 'buscar_fotos de «Fotos sin obra»');
    await p.click('#iaChat .ia-conf:last-of-type [data-iasi]'); await p.waitForTimeout(1500);
    d = await db(p); c(d.fotosObra.fs1.plazaId === 'p3' && d.fotosObra.fs2.plazaId === 'p3', '«Sí»: las fotos sin obra quedan en BULEVARES');
    // d) a otra orden + «las 3 últimas de Juan»
    ped = await decir(p, sw, 'Esta foto va en la OT-2026-130', [usa('buscar_fotos', { obraId: 'Bulevares', persona: 'Juan', ultimas: 3 }), usa('proponer_mover_fotos', { fotos: ['f9'], otDestino: 'OT-2026-130' }), fin('Listo para confirmar.')]);
    const rb4 = resultado(ped, 1);
    c(/"total":3/.test(rb4), '«las 3 últimas de Juan»: buscar_fotos con ultimas = 3 · ' + rb4.slice(0, 80));
    card = await txt(p, '#iaChat .ia-conf:last-of-type');
    c(/OT-2026-122/.test(card) && /OT-2026-130/.test(card), 'tarjeta: OT-2026-122 → OT-2026-130');
    await p.click('#iaChat .ia-conf:last-of-type [data-iasi]'); await p.waitForTimeout(1500);
    d = await db(p); c(d.ordenesTrabajo.h130.campo.fotos.f9 && !d.ordenesTrabajo.d122.campo.fotos.f9, '«Sí»: la foto pasa de la OT-122 a la OT-130');
    const au = await auds(p, 'foto_mover');
    c(au.length === 4 && au.every((a) => /porAsistente":true/.test(JSON.stringify(a))), 'auditoría foto_mover × 4, todas con porAsistente');
    c(A.errores.length === 0, 'sin errores en la consola' + (A.errores.length ? ': ' + A.errores.slice(0, 2).join(' | ') : ''));
    await A.ctx.close();
    const B = await sesion('pan'); const pb = B.page;
    const t = await pb.evaluate(async () => { try { await window.__iaCargar(); } catch (e) { } return window.__asistente ? window.__asistente.alcance().tools(window.__asistente.TOOLS).filter((x) => /fotos/.test(x.name)).map((x) => x.name) : null; });
    c(Array.isArray(t) && t.length === 0, 'el pañol no recibe buscar_fotos ni proponer_mover_fotos');
    await B.ctx.close();
  }
  if (browser) await browser.close();
  process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
