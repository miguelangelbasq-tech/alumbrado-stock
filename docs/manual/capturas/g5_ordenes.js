// Órdenes: sugerida para mañana, cierre (aprobar por tarea), cierre del día por voz, Personal del equipo (Lucía, oficina, compu)
const { app, foto, T, tomas, ev, clic, vista, cerrarTodo, workerFalso } = require('./base');
const { datos146 } = require(T + '/datos146');
const W = 'https://ema-ia.mdiaz-60f.workers.dev';
(async () => {
  const cel = process.argv[3] === 'cel', s = cel ? '_cel' : '';
  const D = datos146();
  const A = await app(D, 'lucia', { cel });
  const p = A.page;
  let n = 0; const cola = [];
  const usa = (name, input) => ({ id: 'm' + (++n), type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text: 'Armo el cierre.' }, { type: 'tool_use', id: 'tu_' + n, name, input }], stop_reason: 'tool_use', usage: { input_tokens: 900, output_tokens: 40 }, ema: { costoUsd: 0.01, version: 'v3-ia' } });
  const fin = (text) => ({ id: 'm' + (++n), type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text }], stop_reason: 'end_turn', usage: { input_tokens: 1000, output_tokens: 60 }, ema: { costoUsd: 0.02, version: 'v3-ia' } });
  await p.route(W + '/ia', (rt) => { const f = cola.shift() || fin('Listo.'); return rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(typeof f === 'function' ? f() : f) }); });
  await p.route(W + '/mio', (rt) => rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, version: 'v3-ia', habilitado: true, quedanPreguntas: 30, topePreguntas: 30, quedanRemitos: 40, topeRemitos: 40 }) }));
  await p.route(W + '/uso', (rt) => rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, version: 'v3-ia', gastoMes: 12.4, tope: 100, partes: { preguntas: 9, remitos: 3, supervisor: 0.4 }, personas: [] }) }));
  const sg = (v) => async (p) => { await clic(p, `#sgOv [data-v="${v}"]`, { espera: 800 }); };
  await tomas(A, [
    ['or_sug_inicio' + s, async (p) => { await vista(p, 'inicio'); await ev(p, () => { const e = document.getElementById('ieSug'); e && e.scrollIntoView({ block: 'center' }); }); }, '#ieSug'],
    ['or_sug_obra' + s, async (p) => { await ev(p, () => window.__sugerida.abrir()); await p.waitForTimeout(2000); }, null],
    ['or_sug_obra_2' + s, async (p) => { await ev(p, () => { const o = document.querySelector('#sgOv .sg-in') || document.getElementById('sgOv'); o.scrollTop = 650; }); }, null],
    ['or_sug_persona' + s, async (p) => { await ev(p, () => { const o = document.querySelector('#sgOv .sg-in') || document.getElementById('sgOv'); o.scrollTop = 0; }); await sg('persona')(p); }, null],
    ['or_sug_semana' + s, sg('semana'), null],
    ['or_sug_cambiar' + s, async (p) => { await sg('obra')(p); await clic(p, '#sgOv .sg-card .sg-pie [data-sg="cambiar"]', { espera: 900 }); }, null],
    ['or_sug_ajustes' + s, async (p) => { await clic(p, '#sgEd [data-sg="x"]').catch(() => { }); await clic(p, '#sgOv [data-sg="cfg"]', { espera: 1000 }); }, null],
    ['or_sug_ajustes_2' + s, async (p) => { await ev(p, () => { const o = document.getElementById('sgCfg'); const sc = [o, ...o.querySelectorAll('*')].find(e => e.scrollHeight > e.clientHeight + 40 && /auto|scroll/.test(getComputedStyle(e).overflowY)); if (sc) sc.scrollTop = 800; }); }, null],
    ['or_sug_epec' + s, async (p) => { await clic(p, '#sgCfg [data-sg="x"]').catch(() => { }); await clic(p, '#sgOv [data-sg="epec"]', { espera: 1000 }); }, null],
    ['or_tablero_revisar' + s, async (p) => { await cerrarTodo(p); await ev(p, () => window.__sugerida.cerrar()); await vista(p, 'parte'); await clic(p, '#viewParteDiario .subtab[data-sub="tablero"]'); await clic(p, '[data-tbs="revisar"]'); }, null],
    ['or_cierre' + s, async (p) => { await ev(p, () => window.abrirCierreOt('v1')); await p.waitForTimeout(1800); }, null],
    ['or_cierre_2' + s, async (p) => { await ev(p, () => { const b = document.querySelector('#cierreCuerpo [data-aprob]'); b && b.scrollIntoView({ block: 'center' }); }); }, null],
    ['or_cierre_3' + s, async (p) => { await ev(p, () => { const b = document.getElementById('apTodo'); b && b.scrollIntoView({ block: 'center' }); }); }, null],
    ['or_voz' + s, async (p) => { await cerrarTodo(p); await ev(p, () => { try { window.cerrarCuadroCierre && window.cerrarCuadroCierre(); } catch (e) { } }); await vista(p, 'parte'); await clic(p, '[data-tbs="revisar"]'); await clic(p, '.cv-btn[data-cv="abrir"]', { espera: 2000 }); }, null],
    ['or_voz_tarjeta' + s, async (p) => {
      const jue = await ev(p, () => window.__cierreVoz.fechaDe('jueves'));
      cola.push(usa('proponer_cierre_dia', { ordenes: [{ otId: 'OT-2026-150', cantidades: { montaje_prfv: 4 }, horas: { 'Juan Pérez': 8, 'Pedro Gómez': 6 }, pasar: [{ k: 'montaje_vinculo', cant: 1, fecha: jue }] }, { otId: 'OT-2026-151', cantidades: { zanjeo: 35 } }] }), fin('Te dejé el cierre para confirmar.'));
      await p.fill('#iaTxt', 'Los Álamos se hicieron 4 izajes, Juan 8 horas, Pedro 6, faltó un vínculo, lo pasamos al jueves. Las Acacias 35 metros de zanja.'); await p.click('#iaEnviar'); await p.waitForTimeout(4500);
      await ev(p, () => { const e = document.querySelector('#iaChat .ia-conf:last-of-type'); e && e.scrollIntoView(); });
    }, null],
    ['or_personal_sug' + s, async (p) => { await cerrarTodo(p); await ev(p, () => window.__asistente && window.__asistente.cerrar()); await vista(p, 'produccion'); await clic(p, '#viewProduccion [data-sub="personal"]', { espera: 1000 }); await ev(p, () => { const e = document.getElementById('sgPerCard'); e && e.scrollIntoView({ block: 'start' }); window.scrollBy(0, -80); }); }, null],
    ['or_equipos_hab' + s, async (p) => { await ev(p, () => { const e = document.getElementById('ehCard'); e && e.scrollIntoView({ block: 'start' }); window.scrollBy(0, -80); }); }, null],
    ['or_cuadrilla_cfg' + s, async (p) => { await ev(p, () => { const e = document.getElementById('cdCfgCard'); e && e.scrollIntoView({ block: 'start' }); window.scrollBy(0, -80); }); }, null],
    ['or_llenar_1' + s, async (p) => { await vista(p, 'parte'); await clic(p, '#viewParteDiario .subtab[data-sub="nueva"]', { espera: 1000 }); await ev(p, () => { window.__ordenNueva.elegirObra('p1'); }); await p.waitForTimeout(900); }, null],
    ['or_llenar_2' + s, async (p) => { await ev(p, () => { window.__ordenNueva.sumarPersona('Juan Pérez'); window.__ordenNueva.sumarPersona('Pedro Gómez'); }); await clic(p, '[data-of-ir="2"]', { espera: 1000 }); await ev(p, () => window.scrollTo(0, 0)); }, null],
    ['or_llenar_3' + s, async (p) => {  await clic(p, '[data-of-ir="3"]', { espera: 1000 }); await ev(p, () => window.scrollTo(0, 0)); }, null],
    ['or_llenar_4' + s, async (p) => {  await clic(p, '[data-of-ir="4"]', { espera: 1000 }); await ev(p, () => window.scrollTo(0, 0)); }, null],
    ['or_seguimiento' + s, async (p) => { await vista(p, 'parte'); await clic(p, '#viewParteDiario .subtab[data-sub="seguimiento"]', { espera: 1200 }); }, null],
  ]);
  console.log(A.errores.slice(0, 5)); await A.browser.close();
})();
