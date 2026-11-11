// Oficina en la compu (Ana, administración) con los datos de la v147 (obras con ubicación, Juan en vivo, órdenes de hoy y mañana)
const { app, foto, T, tomas, ev, clic, vista, cerrarTodo, workerFalso } = require('./base');
const { datos147 } = require(T + '/datos147');
const sub = (v, s) => async (p) => { await vista(p, v); await clic(p, `#${v} .subtab[data-sub="${s}"]`, { espera: 900 }); };
const arriba = (p) => ev(p, () => window.scrollTo(0, 0));
(async () => {
  const A = await app(datos147(), 'admin', { extra: { leaflet: true } });
  await workerFalso(A.page, 'admin', ['Esta semana se avanzó en **Plaza Bulevares** (2 columnas montadas). Mañana falta material en **Plaza Las Acacias**: 4 luminarias.']);
  await tomas(A, [
    ['of_inicio', null, null, { full: true }],
    ['of_registrar', (p) => vista(p, 'registro'), null],
    ['of_obras', (p) => vista(p, 'obras'), null],
    ['of_legajo', (p) => ev(p, () => { window.__lgPlegTodoAbierto = true; window.abrirLegajo('p1'); }).then(() => p.waitForTimeout(1500)), null],
    ['of_legajo_full', null, null, { full: true }],
    ['of_fotos_sin_obra', async (p) => { await vista(p, 'obras'); await clic(p, '#fsoBtn', { espera: 1200 }); }, null],
    ['of_calc', async (p) => { await cerrarTodo(p); await vista(p, 'viewCalculadora' ? 'calc' : 'calc'); }, null],
    ['of_calc_rapidos', async (p) => { await clic(p, '#subtabsCalc .subtab[data-sub="cables"]'); }, null],
    ['of_ot_hoy', async (p) => { await vista(p, 'parte'); await clic(p, '#viewParteDiario .subtab[data-sub="tablero"]'); await clic(p, '[data-tbs="obra"]'); }, null],
    ['of_ot_revisar', (p) => clic(p, '[data-tbs="revisar"]'), null],
    ['of_ot_prox', (p) => clic(p, '[data-tbs="prox"]'), null],
    ['of_ot_seguimiento', (p) => clic(p, '#viewParteDiario .subtab[data-sub="seguimiento"]', { espera: 1200 }), null],
    ['of_ot_llenar', (p) => clic(p, '#viewParteDiario .subtab[data-sub="nueva"]', { espera: 1200 }), null],
    ['of_ot_historial', (p) => clic(p, '#viewParteDiario .subtab[data-sub="historial"]', { espera: 1000 }), null],
    ['of_plan', (p) => vista(p, 'plan'), null],
    ['of_avance', (p) => vista(p, 'avance'), null],
    ['of_itemizado', (p) => clic(p, '#subtabsAvance .subtab[data-sub="epec"]', { espera: 1200 }), null],
    ['of_mapa', async (p) => { await vista(p, 'mapa'); await p.waitForTimeout(1500); }, null],
    ['of_mapa_guerra', async (p) => { await ev(p, () => window.__mapaControl.abrir()); await p.waitForTimeout(1800); }, null],
    ['of_mapa_ficha', async (p) => { await ev(p, () => window.__mapaControl.abrirFicha('p1')); await p.waitForTimeout(1000); }, null],
    ['of_informe', async (p) => { await cerrarTodo(p); try { await ev(p, () => window.__mapaControl.cerrar && window.__mapaControl.cerrar()); } catch (e) { } await vista(p, 'informe'); }, null],
    ['of_informe_semanal', async (p) => { await ev(p, () => window.__informeSemanal.abrir()); await p.waitForTimeout(1800); }, null],
    ['of_informe_semanal_2', async (p) => { await ev(p, () => { const o = document.getElementById('isOv'); const s = o && ([...o.querySelectorAll('*')].find(e => e.scrollHeight > e.clientHeight + 50 && /auto|scroll/.test(getComputedStyle(e).overflowY)) || o); if (s) s.scrollTop = 900; }); }, null],
    ['of_gastos', async (p) => { await ev(p, () => window.__informeSemanal.cerrar()); await vista(p, 'gastos'); }, null],
    ['of_gastos_ganancia', (p) => p.locator('#viewGastos .subtab', { hasText: 'Ganancia' }).click().then(() => p.waitForTimeout(900)), null],
    ['of_prod', (p) => vista(p, 'produccion'), null],
    ['of_prod_quincena', (p) => clic(p, '#viewProduccion [data-sub="quincena"]'), null],
    ['of_prod_personal', (p) => clic(p, '#viewProduccion [data-sub="personal"]', { espera: 1000 }), null],
    ['of_prod_personal_2', (p) => ev(p, () => window.scrollTo(0, 900)), null],
    ['of_prod_personal_3', (p) => ev(p, () => window.scrollTo(0, 1800)), null],
    ['of_prod_baremo', (p) => clic(p, '#viewProduccion [data-sub="baremo"]', { espera: 1000 }), null],
    ['of_prod_baremo_2', (p) => ev(p, () => window.scrollTo(0, 99999)), null],
    ['of_usuarios', (p) => vista(p, 'usuarios'), null],
    ['of_usuarios_2', (p) => ev(p, () => window.scrollTo(0, 99999)), null],
    ['of_normas', (p) => vista(p, 'normas'), null],
    ['of_tablero', (p) => vista(p, 'tablero'), null],
    ['of_supervisor', async (p) => { await vista(p, 'inicio'); await ev(p, () => window.__supervisor.hoja()); await p.waitForTimeout(1200); }, null],
    ['of_aprende', async (p) => { await cerrarTodo(p); await ev(p, () => window.__sugerida.abrirAprende()); await p.waitForTimeout(1500); }, null],
    ['of_dueno', async (p) => { await cerrarTodo(p); await ev(p, () => window.__tableroDueno.abrir()); await p.waitForTimeout(1800); }, null],
    ['of_asistente_pc', async (p) => { await cerrarTodo(p); await vista(p, 'inicio'); await ev(p, () => window.__asistenteAbrir()); await p.waitForTimeout(2000); await p.fill('#iaTxt', '¿Qué falta para mañana?'); await p.click('#iaEnviar'); await p.waitForTimeout(2500); }, null],
  ]);
  console.log(A.errores.slice(0, 5)); await A.browser.close();
})();
