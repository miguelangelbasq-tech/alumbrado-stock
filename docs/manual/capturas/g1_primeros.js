// Primeros pasos: entrada, barra de abajo, menú, Perfil, Versión, Asistente (celu, Lucía de la oficina y Juan de la cuadrilla)
const { app, foto, T, tomas, ev, clic, vista, cerrarTodo, workerFalso } = require('./base');
const { datos147 } = require(T + '/datos147');
(async () => {
  // 1) la entrada (sin sesión)
  let A = await app(datos147(), null, { cel: true, espera: 3500 });
  await tomas(A, [
    ['pp_entrar', null, null],
    ['pp_olvide', async (p) => { await p.locator('text=/Olvidaste/').first().click(); await p.waitForTimeout(600); }, null],
  ]);
  await A.browser.close();
  // 2) Lucía (oficina) en el celu
  A = await app(datos147(), 'lucia', { cel: true });
  await workerFalso(A.page, 'oficina', ['**Plaza Bulevares** va 50 %: faltan 2 columnas (izaje) y el tablero. Hoy están Juan y Pedro con la grúa (OT-2026-203).']);
  await tomas(A, [
    ['pp_inicio_ofi_cel', null, null],
    ['pp_barra', null, null, { clip: { x: 0, y: 724, width: 390, height: 120 } }],
    ['pp_menu', async (p) => { await ev(p, () => window.abrirMenuLateral()); await p.waitForTimeout(700); }, null],
    ['pp_menu_version', async (p) => { await ev(p, () => { const m = document.querySelector('#menuLateral .menu-panel'); m.scrollTop = m.scrollHeight; }); }, null],
    ['pp_version', async (p) => { await cerrarTodo(p); await ev(p, () => window.revisarApp()); await p.waitForTimeout(800); }, null],
    ['pp_perfil', async (p) => { await cerrarTodo(p); await p.keyboard.press('Escape'); await vista(p, 'perfil'); }, null],
    ['pp_perfil_ajustes', async (p) => { await ev(p, () => window.scrollTo(0, 650)); }, null],
    ['pp_perfil_app', async (p) => { await ev(p, () => window.scrollTo(0, 99999)); }, null],
    ['pp_sin_senal', async (p) => { await cerrarTodo(p); await vista(p, 'inicio'); await A.ctx.setOffline(true); await ev(p, () => { window.__stubSinRed = true; window.dispatchEvent(new Event('offline')); }); await p.waitForTimeout(1500); }, null],
    ['_vuelve', async (p) => { await A.ctx.setOffline(false); await ev(p, () => { window.__stubSinRed = false; window.dispatchEvent(new Event('online')); }); await p.waitForTimeout(1000); }, null],
    ['pp_asistente', async (p) => { await vista(p, 'inicio'); await ev(p, () => window.__asistenteAbrir()); await p.waitForTimeout(2500); }, null],
    ['pp_asistente_resp', async (p) => { await p.fill('#iaTxt', '¿Cómo va Plaza Bulevares?'); await p.click('#iaEnviar'); await p.waitForTimeout(2500); }, null],
    ['pp_asistente_cfg', async (p) => { await p.click('[data-ia=cfg]'); await p.waitForTimeout(900); }, null],
  ]);
  await A.browser.close();
})();
