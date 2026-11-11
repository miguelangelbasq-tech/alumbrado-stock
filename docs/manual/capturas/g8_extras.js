// Extras: límites del asistente, hoja A4 con QR y compartir, ¿Salir sin guardar?, puntos de una orden, personal en vivo, planos, seguimiento › editar, recordatorios
const { app, foto, T, tomas, ev, clic, vista, cerrarTodo, workerFalso } = require('./base');
const { datos147 } = require(T + '/datos147');
const { datos146 } = require(T + '/datos146');
(async () => {
  const G = process.env.G || 'todo';
  if (G === 'todo' || G === 'a') {
    const A = await app(datos147(), 'admin', { extra: { leaflet: true } });
    await workerFalso(A.page, 'admin', ['Listo.']);
    await tomas(A, [
      ['ex_limites', async (p) => { await ev(p, () => window.__asistenteAbrir()); await p.waitForTimeout(2500); await clic(p, '[data-ia=cfg]', { espera: 1500 }); await ev(p, () => { const e = document.getElementById('iaLimites'); e && e.scrollIntoView({ block: 'start' }); }); await p.waitForTimeout(600); }, null],
      ['ex_hoja_orden', async (p) => { await ev(p, () => window.__asistente && window.__asistente.cerrar()); await cerrarTodo(p); await ev(p, () => window.imprimirOrdenTrabajo('ot1')); await p.waitForTimeout(2500); }, null],
      ['ex_compartir', async (p) => { await p.locator('#hojaOv button', { hasText: 'Compartir' }).first().click({ timeout: 5000 }); await p.waitForTimeout(1200); }, null],
      ['ex_vivo', async (p) => { await cerrarTodo(p); await ev(p, () => { const h = document.getElementById('hojaOv'); if (h) { const x = h.querySelector('[aria-label="Cerrar"],.hj-cerrar'); x && x.click(); } }); await vista(p, 'mapa'); await p.waitForTimeout(2000); await ev(p, () => { const e = document.getElementById('uvPanel'); e && e.scrollIntoView({ block: 'center' }); }); }, null],
      ['ex_planos', async (p) => { await ev(p, () => { window.__lgPlegTodoAbierto = true; window.abrirLegajo('p1'); }); await p.waitForTimeout(1800); await ev(p, () => { const h = [...document.querySelectorAll('#obrasApp *')].find((e) => /Planos de obra|^📐 ?Planos/.test((e.textContent || '').trim()) && e.children.length < 3 && e.offsetParent); h && h.scrollIntoView({ block: 'start' }); window.scrollBy(0, -90); }); }, null],
      ['ex_puntos', async (p) => { await vista(p, 'parte'); await ev(p, () => window.__puntosEditar.abrir('ot4')); await p.waitForTimeout(1500); }, null],
      ['ex_seg_editar', async (p) => { await cerrarTodo(p); await vista(p, 'parte'); await clic(p, '#viewParteDiario .subtab[data-sub="seguimiento"]', { espera: 1200 }); await p.locator('#viewParteDiario button', { hasText: 'Editar' }).first().click({ timeout: 5000 }); await p.waitForTimeout(1200); }, null],
      ['ex_salir', async (p) => { await cerrarTodo(p); await vista(p, 'parte'); await clic(p, '#viewParteDiario .subtab[data-sub="nueva"]', { espera: 1000 }); await ev(p, () => { window.__ordenNueva.elegirObra('p1'); window.__ordenNueva.sumarPersona('Juan Pérez'); }); await p.waitForTimeout(600); await p.goBack(); await p.waitForTimeout(1200); }, null],
    ]);
    console.log(A.errores.slice(0, 5)); await A.browser.close();
  }
  if (G === 'todo' || G === 'b') {
    const A = await app(datos147(), 'lucia', { cel: true });
    await tomas(A, [
      ['ex_recordatorio', async (p) => { await vista(p, 'perfil'); await p.locator('#viewPerfil *', { hasText: /^Recordatorios$/ }).last().click({ timeout: 5000 }); await p.waitForTimeout(1200); }, null],
      ['ex_vale_qr', async (p) => { await cerrarTodo(p); await ev(p, () => window.imprimirOrdenTrabajo('ot1')); await p.waitForTimeout(2500); }, null],
    ]);
    console.log(A.errores.slice(0, 5)); await A.browser.close();
  }
  if (G === 'todo' || G === 'c') {
    const A = await app(datos146(), 'lucia');
    await tomas(A, [
      ['ex_cierre_pts', async (p) => { await vista(p, 'parte'); await ev(p, () => window.abrirCierreOt('v1')); await p.waitForTimeout(1800); await p.locator('#cierreCuerpo button', { hasText: 'Puntos de esta tarea' }).first().click({ timeout: 5000 }); await p.waitForTimeout(1000); }, null],
      ['ex_cierre_dia', async (p) => { await cerrarTodo(p); await ev(p, () => window.abrirCierreOt('v1')); await p.waitForTimeout(1800); await p.locator('#cierreCuerpo button', { hasText: 'otro día' }).first().click({ timeout: 5000 }); await p.waitForTimeout(1000); }, null],
    ]);
    console.log(A.errores.slice(0, 5)); await A.browser.close();
  }
})();
