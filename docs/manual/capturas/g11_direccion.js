// Capturas del manual de Dirección (rol «direccion», usuario dir · Roberto Directo). Una sesión por grupo: G=a|b|c|d|e|f.
// Datos: datos155 (Inicio de Dirección, Para resolver), datos145 (+dir: certificación, gastos, material), datos158 (avance nuevo),
// datos156 (control del avance), datos157 (+dir: el tiempo de cada columna).
const { app, foto, T, tomas, ev, clic, vista, cerrarTodo, workerFalso } = require('./base');
const DOM = require(T + '/h').DOM;
const conDir = (d) => { Object.assign(d.cuentas, { ['dir@' + DOM]: { pass: 'clave123', uid: 'uDir' } }); d.db.usuarios.uDir = { email: 'dir@' + DOM, usuario: 'dir', nombre: 'Roberto Directo', rol: 'direccion', activo: true }; return d; };
const ir = (id, off) => async (p) => { await ev(p, ([id, off]) => { const e = document.getElementById(id); if (e) { e.scrollIntoView({ block: 'start' }); window.scrollBy(0, -(off || 70)); } }, [id, off]); await p.waitForTimeout(900); };
async function iaFalsa(p, texto) {
  const W = 'https://ema-ia.mdiaz-60f.workers.dev';
  await workerFalso(p, 'direccion', [texto]);
  const j = (o) => ({ status: 200, contentType: 'application/json', body: JSON.stringify(o) });
  await p.route(W + '/salud', (rt) => rt.fulfill(j({ ok: true, version: 'v5-ia' })));
  await p.route(W + '/mio', (rt) => rt.fulfill(j({ ok: true, version: 'v5-ia', rol: 'direccion', habilitado: true, pausado: false, preguntasHoy: 3, topePreguntas: 30, quedanPreguntas: 27, remitosHoy: 0, topeRemitos: 0, quedanRemitos: 0 })));
  await p.route(W + '/ia', (rt) => rt.fulfill(j({ id: 'm', type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text: texto }], stop_reason: 'end_turn', usage: { input_tokens: 1000, output_tokens: 80 }, ema: { costoUsd: 0.02, version: 'v5-ia' } })));
}
(async () => {
  const G = process.env.G || 'a';
  if (G === 'a') {   // Inicio en el celu
    const { datos155 } = require(T + '/datos155');
    const A = await app(datos155(), 'dir', { cel: true, extra: { leaflet: true } });
    await iaFalsa(A.page, 'Hoy van **3,7 K** (módulos) contra los **233 K por día** que harían falta para llegar al plazo del 08/03: a este ritmo no se llega.\n\n- Cerrado hoy: OT-2026-131 en **PLAZA LAS ACACIAS** (montaje de columna, 3,2 K).\n- Mandado sin cerrar: OT-2026-130 en **PLAZA LOS ÁLAMOS** (0,5 K, estimado).\n- Lo más atrasado: **PLAZA LOS ÁLAMOS**: el plan terminaba el 08/11 y va 13 %.\n\n¿Querés que te arme el detalle de Los Álamos?');
    await tomas(A, [
      ['dr_cel_inicio', async (p) => { await vista(p, 'inicio'); await p.waitForTimeout(3000); }, null],
      ['dr_cel_atencion', ir('drAt'), null],
      ['dr_cel_barras', ir('drBar'), null],
      ['dr_cel_curva', ir('drCurva'), null],
      ['dr_cel_hoy', ir('drHoy'), null],
      ['dr_cel_mapa', ir('drMapa'), null],
      ['dr_cel_equipo', ir('drEq'), null],
      ['dr_cel_prog', ir('drProg'), null],
      ['dr_cel_plata', ir('drPlata'), null],
      ['dr_cel_ia_inicio', ir('drIa'), null],
      ['dr_cel_menu', async (p) => { await ev(p, () => { window.scrollTo(0, 0); window.abrirMenuLateral(); }); await p.waitForTimeout(900); }, null],
      ['dr_cel_menu_2', async (p) => { await ev(p, () => { const e = document.getElementById('menuGastos'); e && e.scrollIntoView({ block: 'center' }); }); await p.waitForTimeout(700); }, null],
      ['dr_cel_ia', async (p) => { await cerrarTodo(p); await ev(p, () => window.__asistenteAbrir && window.__asistenteAbrir()); await p.waitForTimeout(3500); }, null],
      ['dr_cel_ia_resp', async (p) => { await ev(p, () => window.__asistente.enviar('¿Cómo vamos?')); await p.waitForTimeout(5000); }, null],
    ]);
    console.log(A.errores.slice(0, 5)); await A.browser.close();
  }
  if (G === 'b') {   // Inicio en la compu y Para resolver
    const { datos155 } = require(T + '/datos155');
    const A = await app(datos155(), 'dir', { w: 1280, h: 860, extra: { leaflet: true } });
    await tomas(A, [
      ['dr_pc_inicio', async (p) => { await vista(p, 'inicio'); await p.waitForTimeout(3000); }, null],
      ['dr_pc_inicio_2', ir('drHoy'), null],
      ['dr_pc_prog', ir('drProg'), null],
      ['dr_pc_plata', ir('drPlata'), null],
      ['dr_pc_resolver', async (p) => { await ev(p, () => window.__paraResolver.abrir()); await p.waitForTimeout(1800); }, null],
      ['dr_pc_ordenes', async (p) => { await vista(p, 'parte'); await p.waitForTimeout(1500); }, null],
    ]);
    console.log(A.errores.slice(0, 5)); await A.browser.close();
  }
  if (G === 'c') {   // Plata: certificación, gastos, producción, legajo con material
    const { datos145 } = require(T + '/datos145');
    const A = await app(conDir(datos145()), 'dir', { w: 1280, h: 860 });
    await tomas(A, [
      ['dr_pc_obras', (p) => vista(p, 'obras'), null],
      ['dr_pc_cert', async (p) => { await ev(p, () => window.__certMensual.abrir()); await p.waitForTimeout(2000); }, null],
      ['dr_pc_gastos', async (p) => { await cerrarTodo(p); await ev(p, () => { try { window.__certMensual.cerrar(); } catch (e) { } }); await vista(p, 'gastos'); }, null],
      ['dr_pc_ganancia', (p) => p.locator('#viewGastos .subtab', { hasText: 'Ganancia' }).click().then(() => p.waitForTimeout(900)), null],
      ['dr_pc_generales', (p) => p.locator('#viewGastos .subtab', { hasText: 'Generales' }).click().then(() => p.waitForTimeout(900)), null],
      ['dr_pc_prod', (p) => vista(p, 'produccion'), null],
      ['dr_pc_prod_quincena', (p) => p.locator('#viewProduccion .subtab', { hasText: 'quincena' }).first().click().then(() => p.waitForTimeout(1000)), null],
      ['dr_pc_legajo', async (p) => { await cerrarTodo(p); await ev(p, () => { window.__lgPlegTodoAbierto = true; window.abrirLegajo('pA'); }); await p.waitForTimeout(2500); }, null],
      ['dr_pc_legajo_mat', async (p) => { await ev(p, () => { const e = document.getElementById('lgBalSec'); e && e.scrollIntoView(); window.scrollBy(0, -80); }); await p.waitForTimeout(800); }, null],
      ['dr_pc_legajo_mav', async (p) => { await ev(p, () => { const e = document.getElementById('lgMavSec'); e && e.scrollIntoView(); window.scrollBy(0, -80); }); await p.waitForTimeout(800); }, null],
      ['dr_pc_legajo_hv', async (p) => { await ev(p, () => { const e = document.getElementById('lgHvSec'); e && e.scrollIntoView(); window.scrollBy(0, -80); }); await p.waitForTimeout(800); }, null],
    ]);
    console.log(A.errores.slice(0, 5)); await A.browser.close();
  }
  if (G === 'd') {   // Avance de obra nuevo
    const { datos158 } = require(T + '/datos158');
    const A = await app(datos158(), 'dir', { w: 1280, h: 860 });
    await tomas(A, [
      ['dr_pc_avance_lista', (p) => vista(p, 'avance'), null],
      ['dr_pc_avance', async (p) => { await ev(p, () => window.verAvanceDetalle('b1')); await p.waitForTimeout(2500); await ev(p, () => { const e = document.getElementById('a2App'); e && e.scrollIntoView({ block: 'start' }); window.scrollBy(0, -75); }); await p.waitForTimeout(600); }, null],
      ['dr_pc_avance_grilla', async (p) => { await ev(p, () => { const b = document.querySelector('#a2App .a2-rh[data-r]'); if (b && b.getAttribute('aria-expanded') !== 'true') b.click(); setTimeout(() => { const e = document.querySelector('#a2App .a2-rub'); e && e.scrollIntoView(); window.scrollBy(0, -80); }, 600); }); await p.waitForTimeout(1600); }, null],
      ['dr_pc_avance_col', async (p) => { await ev(p, () => window.__av2.abrirColumna && window.__av2.abrirColumna('b1', 1)); await p.waitForTimeout(1500); }, null],
      ['dr_pc_legajo_hv158', async (p) => { await cerrarTodo(p); await ev(p, () => { window.__lgPlegTodoAbierto = true; window.abrirLegajo('b1'); }); await p.waitForTimeout(2500); await ev(p, () => { const e = document.getElementById('lgHvSec'); e && e.scrollIntoView(); window.scrollBy(0, -80); }); await p.waitForTimeout(800); }, null],
    ]);
    console.log(A.errores.slice(0, 5)); await A.browser.close();
  }
  if (G === 'e') {   // Control del avance
    const { datos156 } = require(T + '/datos156');
    const A = await app(datos156(), 'dir', { w: 1280, h: 860 });
    const ids = await ev(A.page, () => Object.keys(window.__avanceObrasCache || {}).join(','));
    await tomas(A, [
      ['dr_pc_control', async (p) => { await vista(p, 'avance'); await ev(p, () => window.__auditAvance.abrir()); await p.waitForTimeout(2000); }, null],
    ]);
    console.log(A.errores.slice(0, 5)); await A.browser.close();
  }
  if (G === 'f') {   // El tiempo de cada columna
    const { datos157 } = require(T + '/datos157');
    const A = await app(conDir(datos157({ viejas: true })), 'dir', { cel: true });
    await iaFalsa(A.page, '**Conexionado del tablerito en la columna** (Plaza Las Acacias, órdenes cerradas con la hora de cada columna):\n\n| Equipo | Columnas | Mediana por columna |\n|---|---|---|\n| Juan y Pedro | 5 | **46 min** |\n| Lucas y Diego | 2 | **32 min** |\n\nUna columna de la OT-2026-140 dio 2 min: es una hora dudosa (fotos seguidas) y no la cuento.\n\nCon 2 personas rinde unas **9 columnas por día** (jornada de 8 h).');
    await tomas(A, [
      ['dr_cel_tiempos', async (p) => { await vista(p, 'parte'); await ev(p, () => window.__avanceOrden.abrir('otv2')); await p.waitForTimeout(2000); }, null],
      ['dr_cel_verif', async (p) => { await cerrarTodo(p); await ev(p, () => window.__verifOt && window.__verifOt.abrir && window.__verifOt.abrir('otv2')); await p.waitForTimeout(1800); }, null],
      ['dr_cel_ia_tiempos', async (p) => { await cerrarTodo(p); await ev(p, () => window.__asistenteAbrir && window.__asistenteAbrir()); await p.waitForTimeout(3500); await ev(p, () => window.__asistente.enviar('¿Cuánto tardan en el tablerito de cada columna?')); await p.waitForTimeout(5000); }, null],
    ]);
    console.log(A.errores.slice(0, 5)); await A.browser.close();
  }
})();
